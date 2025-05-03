import useRouter from 'express';
import * as issueController from "../../controllers/issue.controller.js"

const router = useRouter.Router();
// Issue routes
router.post("/create-issues", issueController.CreateIssue)
router.get("/get-all-issues", issueController.GetAllIssues)
router.get("/get-issues-by-id/:id", issueController.GetIssueById)
router.put("/update-issues/:id", issueController.UpdateIssue)
router.delete("/delete/issues/:id", issueController.DeleteIssue)
router.patch("/update-issues-status/:id", issueController.ToggleIssueStatus)

export default router;
