import useRouter from 'express';
import * as issueController from "../../controllers/issue.controller.js"

const router = useRouter.Router();
// Issue routes
router.post("/create-issues", issueController.CreateIssue)
router.get("/get-all-issues", issueController.GetAllIssues)
router.get("/get-by-id-issues/:id", issueController.GetIssueById)
router.put("/update-issues/:id", issueController.UpdateIssue)
router.delete("/delete/issues/:id", issueController.DeleteIssue)
router.patch("/issues/:id/toggle-status", issueController.ToggleIssueStatus)

export default router;
