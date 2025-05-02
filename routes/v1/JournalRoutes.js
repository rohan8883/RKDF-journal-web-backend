import useRouter from 'express';
import * as journalController from "../../controllers/journal.controller.js"

const router = useRouter.Router();
// Journal routes
router.post("/create-journals", journalController.CreateJournal)
router.get("/get-all-journals", journalController.GetAllJournals)
router.get("/gey-by-id-journals/:id", journalController.GetJournalById)
router.put("/update-journals/:id", journalController.UpdateJournal)
router.delete("/delete-journals/:id", journalController.DeleteJournal)
router.patch("/journals/:id/toggle-status", journalController.ToggleJournalStatus)


export default router;
