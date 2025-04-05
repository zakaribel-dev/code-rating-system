CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role TEXT DEFAULT 'student'
);

CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course VARCHAR(100),
  exercise VARCHAR(100),
  language VARCHAR(50),
  filename VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  score INTEGER,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL CHECK (language IN ('Python', 'C')),
  input TEXT,
  course TEXT,
  expected_output TEXT NOT NULL
);

INSERT INTO users (email, role)
VALUES ('zak@hotmail.fr', 'admin'),
       ('jean@hotmail.fr', 'admin')
ON CONFLICT (email) DO NOTHING;