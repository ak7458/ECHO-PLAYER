const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');

router.get('/library', musicController.getLibrary);
router.get('/home', musicController.getHomeData);
router.get('/search', musicController.search);
router.get('/artist/:id', musicController.getArtist);
router.get('/album/:id', musicController.getAlbum);
router.get('/stream/:id', musicController.getStream);
router.get('/recommendations', musicController.getRecommendations);
router.get('/lyrics', musicController.getLyrics);

module.exports = router;
