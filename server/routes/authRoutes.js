const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\\s+/g, '_')}`)
});

const upload = multer({ storage });

router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/profile', authController.updateProfile);
router.post('/avatar', upload.single('avatar'), authController.uploadAvatar);
router.get('/library/:id', authController.getLibrary);
router.put('/library', authController.updateLibrary);

module.exports = router;
