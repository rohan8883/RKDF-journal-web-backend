import useRouter from 'express';
import {
  CreatePlan,
  GetAllPlans,
  UpdatePlan,
  DeletePlan,
  GetPlanById,
  TogglePlanStatus
} from '../../controller/PlanController.js';

const router = useRouter.Router();

router.post('/create-plan', CreatePlan);  
router.get('/get-all-plan', GetAllPlans);  
router.put('/update-plan/:id', UpdatePlan);  
router.delete('/delete-plan/:id', DeletePlan);  
router.get('/get-plan-by-id/:id', GetPlanById);  
router.put('/update-plan-status/:id', TogglePlanStatus);  

export default router;
