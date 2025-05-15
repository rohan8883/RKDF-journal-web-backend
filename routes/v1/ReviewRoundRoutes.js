import useRouter from 'express';
import * as reviewRoundController from "../../controllers/review-round.controller.js"

const router = useRouter.Router();
// Submission routes
router.post("/create-review-round", reviewRoundController.createReviewRound)
// router.post("/assign-reviewer", reviewRoundController.AssignReviewer)
router.get("/get-all-review-round", reviewRoundController.getReviewRounds)
router.get("/get-by-id-review-round/:id", reviewRoundController.getReviewRoundById)
router.put("/update-review-round/:id", reviewRoundController.updateReviewRound)
// router.patch("/submissions/:id/status", reviewRoundController.UpdateSubmissionStatus)
// router.delete("/delete-submissions/:id", reviewRoundController.DeleteSubmission)

export default router;
