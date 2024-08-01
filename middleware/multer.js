const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
  return  cb(null, "./uploads"); 
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`); 
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
