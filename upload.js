const multer = require('multer')

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    if (file.mimetype.split('/')[0] === 'image') {
      callback(null, 'public/images')
    } else if (file.fieldname === 'music') {
      callback(null, 'public/music')
    }
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '_' + Date.now() + '_' + file.originalname)
  },
})

const upload = multer({ storage: Storage })
module.exports = upload
