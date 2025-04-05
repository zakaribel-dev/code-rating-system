const express = require('express');
const multer = require('multer');
const path = require('path');
const { handleSubmit } = require('../controllers/submitController');
const authenticate = require('../middlewares/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

router.post('/', authenticate, upload.single('code'), handleSubmit);

module.exports = router;
