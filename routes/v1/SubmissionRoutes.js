import useRouter from 'express';
import * as submissionController from "../../controllers/submission.controller.js"

const router = useRouter.Router();
// Submission routes
router.post("/create-submissions", submissionController.CreateSubmission)
router.get("/get-all-submissions", submissionController.GetAllSubmissions)
router.get("/get-by-id-submissions/:id", submissionController.GetSubmissionById)
router.put("/update-submissions/:id", submissionController.UpdateSubmission)
router.patch("/submissions/:id/status", submissionController.UpdateSubmissionStatus)
router.delete("/delete-submissions/:id", submissionController.DeleteSubmission)
// Reviewer routes
router.post("/assign-reviewer", submissionController.AssignReviewer)
router.put("/update-reviewer-assignment", submissionController.UpdateReviewerAssignment)
router.delete("/delete-reviewer-assignment", submissionController.DeleteReviewerAssignment)

export default router;
