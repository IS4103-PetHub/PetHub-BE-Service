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

    router.get(`/reported-reviews`, controller.getAllReportedReviews)
    router.get(`/:id`, controller.getReviewById)

    // CREATE NEW REIVEW
    router.post(`/`, upload.array('file'), controller.createReview)

    // PO update details of review
    router.patch(`/:id`, upload.array('file'), controller.updateReview)

    // PB reply to a review
    router.patch(`/reply-review/:id`, controller.replyReview)

    // PO/admin delete review
    router.delete(`/:id`, controller.deleteReview)

    // PO like and unlike review
    router.post(`/toggle-liked-review/:id`, controller.toggleLikedReview)

    // PO report review
    router.post(`/report-review/:id`, controller.reportReview)

    // Admin resolve review
    router.post(`/resolve-review/:id`, controller.resolveReview)
}

registerReviewRoutes(reviewController);

module.exports = router;