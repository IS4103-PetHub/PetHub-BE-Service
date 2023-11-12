const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController')
const multer = require("multer")

router.get('/health-check', async (req, res, next) => {
    res.send({ message: 'Ok Article API is working 🚀' });
});

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage, limits: { fieldSize: 1024 * 1024 * 20 } }); // 20MB - This is because the base64 coded images in the HTML content can be long

function registerArticleRoutes(controller) {
    router.get(`/`, controller.getAllArticle);
    router.get(`/:id`, controller.getArticleById);
    router.delete(`/:id`, controller.deleteArticle);
    router.post(`/`, upload.array('file'), controller.createArticle);
    router.put(`/:id`, upload.array('file'), controller.updateArticle);

}

registerArticleRoutes(articleController);

module.exports = router;