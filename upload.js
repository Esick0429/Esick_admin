const multer = require('multer');

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
      callback(null, "Images/");
  },
  filename: function (req, file, callback) {
      callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  }
})

const upload = multer({ storage: Storage })
module.exports = upload