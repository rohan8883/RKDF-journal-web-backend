import useRouter from 'express';
import {
  CreatePlanMaster,
  deletePlanById,
  getAllActivePlans,
  getAllPlans,
  getPlanById,
  updatePlanById,
  updatePlanStatusById,
} from '../../controller/MastersController.js';

const router = useRouter.Router();

// plan routes
router.post('/create-plan', CreatePlanMaster); // endpoint: /masters/create-plan, body{}
router.get('/get-all-plans', getAllPlans); // endpoint: /masters/get-all-plans
router.get('/get-all-active-plans', getAllActivePlans); // endpoint: /masters/get-all-active-plans
router.get('/get-plan/:id', getPlanById); // endpoint: /masters/get-plan/:id
router.put('/update-plan/:id', updatePlanById); // endpoint: /masters/update-plan/:id, body{}
router.put('/update-plan-status/:id', updatePlanStatusById); // endpoint: /masters/update-plan-status/:id, body{}
router.delete('/delete-plan/:id', deletePlanById); // endpoint: /masters/delete-plan/:id


export default router;
