const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Use a different prefix for PDF files
        const prefix = file.fieldname === 'pdfFile' ? 'pdf-' : 'image-';
        const extension = path.extname(file.originalname);
        cb(null, prefix + unique + extension);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /pdf|jpeg|jpg|png/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only PDF and image files are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 25,
    },
});

module.exports = { storage, upload };
