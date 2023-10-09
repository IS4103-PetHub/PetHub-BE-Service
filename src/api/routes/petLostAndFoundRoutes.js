const express = require('express');
const router = express.Router();
const petLostandFoundController = require("../controllers/petLostAndFoundController")
const multer = require("multer")

router.get('/health-check', async (req, res, next) => {
    res.send({ message: 'Ok Pet Lost and Found API is working 🚀' });
});

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

function registerPetLostAndFoundRoutes(controller) {
    router.get('/', controller.getAllPetLostAndFound)
    router.get('/pet-owner/:id?', controller.getAllPetLostAndFoundByPOId)
    router.post(`/`, upload.array('file'), controller.createPetLostAndFound)
    router.put(`/:id?`, upload.array('file'), controller.updatePetLostAndFound)
    router.delete(`/:id?`, controller.deletePetLostAndFound)
}

registerPetLostAndFoundRoutes(petLostandFoundController)

module.exports = router;