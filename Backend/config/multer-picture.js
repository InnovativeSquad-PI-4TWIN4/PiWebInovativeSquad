const multer = require("multer");
const path = require("path");

// Configuration du stockage
const storage = multer.diskStorage({
    destination: "public/images/",
    filename: function (req, file, cb) {
        const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix);
    },
});

// Vérification du type de fichier
const filter = (req, file, cb) => {
    const fileType = /png|jpg|jpeg/;
    const extname = fileType.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileType.test(file.mimetype);

    if (extname && mimeType) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only PNG, JPG, and JPEG are allowed!"));
    }
};

// Middleware Multer
const multerImage = multer({
    storage: storage,
    limits: {
        fileSize: 1 * 1024 * 1024, // 1MB
    },
    fileFilter: filter,
});

module.exports = multerImage;
