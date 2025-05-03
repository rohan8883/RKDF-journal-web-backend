import useRouter from 'express';
import * as journalController from "../../controllers/journal.controller.js"

const router = useRouter.Router();
// Journal routes
router.post("/create-journals", journalController.CreateJournal)
router.get("/get-all-journals", journalController.GetAllJournals)
router.get("/get-journals-by-id/:id", journalController.GetJournalById)
router.put("/update-journals/:id", journalController.UpdateJournal)
router.delete("/delete-journals/:id", journalController.DeleteJournal)
router.put("/update-journals-status/:id", journalController.ToggleJournalStatus)


export default router;
