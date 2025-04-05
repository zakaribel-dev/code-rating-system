const os = require('os');
const crypto = require('crypto');
const fsp = require('fs/promises');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec); // promisify exec pour l' async/await important si jamais ya une erreur dans la correction
const pool = require('./db');

async function processSubmissions() {
  try {
    const { rows } = await pool.query(
      `SELECT s.id, s.language, s.filename, s.exercise
       FROM submissions s
       WHERE s.status = 'pending'
       ORDER BY submitted_at ASC
       LIMIT 1`
    );

    if (rows.length === 0) {
      console.log('Aucune soumission à traiter.');
      return;
    }

    const submission = rows[0];
    const filePath = path.join(__dirname, 'uploads', submission.filename);

    const exo = await pool.query(
      `SELECT input, expected_output FROM exercises WHERE id = $1`,
      [submission.exercise]
    );

    if (exo.rows.length === 0) {
      console.error(` Exercice introuvable`);
      await pool.query(
        `UPDATE submissions SET status = 'error' WHERE id = $1`,
        [submission.id]
      );
      return;
    }

    const input = (exo.rows[0].input || '').trim();
    const expected = exo.rows[0].expected_output.trim();

    const tmpDir = path.join(os.tmpdir(), 'code-' + crypto.randomBytes(8).toString('hex'));
    await fsp.mkdir(tmpDir);

    const tmpFilePath = path.join(tmpDir, submission.filename);
    await fsp.copyFile(filePath, tmpFilePath);

    const isMac = process.platform === 'darwin';  // darwin = macOs
    const timeout = isMac ? 'gtimeout' : 'timeout';

    let runCmd = '';
    if (submission.language === 'Python') {
      runCmd = `${timeout} 2s python3 "${tmpFilePath}"`;
    } else if (submission.language === 'C') {
      const exePath = path.join(tmpDir, 'prog');

      try {
        await execAsync(`gcc "${tmpFilePath}" -o "${exePath}"`);
        runCmd = `${timeout} 2s "${exePath}"`;
      } catch (err) {
        console.error(" Erreur de compilation :", err.message);
        await pool.query(
          `UPDATE submissions SET status = 'error', score = 0 WHERE id = $1`,
          [submission.id]
        );
        fs.unlinkSync(filePath);
        await fsp.rm(tmpDir, { recursive: true, force: true });
        return;
      }
    }

    const normalize = (str) => str.trim().replace(/\r/g, '');
    const compareOutput = (output, expected) => {
      const o = normalize(output);
      const e = normalize(expected);
      if (o === e) return 100;
      if (o.toLowerCase() === e.toLowerCase()) return 80;
      if (o.replace(/\n/g, '') === e.replace(/\n/g, '')) return 50;
      return 0;
    };

    const child = exec(runCmd, { timeout: 3000 }, async (err, stdout) => {
      const score = err ? 0 : compareOutput(stdout, expected);
      const status = err ? 'error' : 'corrected';

      await pool.query(
        `UPDATE submissions SET status = $1, score = $2 WHERE id = $3`,
        [status, score, submission.id]
      );

      fs.unlinkSync(filePath);
      await fsp.rm(tmpDir, { recursive: true, force: true });

      console.log(` Soumission #${submission.id} traitée - Score : ${score}%`);
    });

    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();

  } catch (err) {
    console.error(' Erreur dans worker:', err);
  }
}

setInterval(() => {
  processSubmissions();
}, 10000);

console.log(" Worker lancé...");
