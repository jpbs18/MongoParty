const multer = require('multer');
const path = require('path');

const diskStorage = multer.diskStorage({
  destination:(req, file, callback) => {
    callback(null, 'public/images');
  },
  filename: (req, file, callback) => {
    callback(null, Date.now() + path.extname(file.originalname));
  }
});

module.exports = diskStorage;