import useRouter from 'express';
import * as reviewController from "../../controllers/review.controller.js"

const router = useRouter.Router();
// Submission routes
router.post("/create-review", reviewController.createReview)
// router.post("/assign-reviewer", reviewController.AssignReviewer)
router.get("/get-all-review", reviewController.getAllReviews)
// router.get("/get-by-id-review-round/:id", reviewController.getReviewRoundById)
router.put("/update-review/:id", reviewController.updateReview)
// router.patch("/submissions/:id/status", reviewController.UpdateSubmissionStatus)
// router.delete("/delete-submissions/:id", reviewController.DeleteSubmission)

export default router;
