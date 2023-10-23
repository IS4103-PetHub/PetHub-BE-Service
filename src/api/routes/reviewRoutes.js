const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController')
const multer = require("multer")

router.get('/health-check', async (req, res, next) => {
    res.send({ message: 'Ok Review API is working 🚀' });
});

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

function registerReviewRoutes(controller) {
    // CREATE NEW REIVEW
    router.post(`/`, upload.array('file'), controller.createReview)

    // PO update details of review
    router.patch(`/:id`, upload.array('file'), controller.updateReview)

    // ADMIN hide and show review
    router.patch(`/hide-review/:id`, controller.hideReview)
    router.patch(`/show-review/:id`, controller.showReview)

    // PB reply to a review
    router.patch(`/reply-review/:id`, controller.replyReview)

    // PO delete review
    router.delete(`/:id`, controller.deleteReview)
}

registerReviewRoutes(reviewController);

module.exports = router;