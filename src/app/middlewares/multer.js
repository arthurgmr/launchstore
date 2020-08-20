const multer = require('multer');

// configurando onde sera gravado o arquivo;
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now().toString()}-${file.originalname}`)
    }
})

// configurado o filtro do arquivo;
const fileFilter = (req, file, cb) => {
    const isAccepted = ['image/png', 'image/jpg', 'image/jpeg'].find(acceptedFormat => acceptedFormat == file.mimetype)

    if(isAccepted) {
        return cb(null, true)
    }

    return cb(null, false)
}

// Funcao para guardar o arquivo no disco;
module.exports = multer ({
    storage,
    fileFilter
}) 