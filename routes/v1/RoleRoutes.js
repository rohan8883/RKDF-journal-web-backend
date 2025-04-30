import useRouter from 'express';
import {
  CreateRole,
  GetAllRole,
  UpdateRole,
  DeleteRole,
  GetRoleById,
  UpdateRoleStatus
} from '../../controller/RoleController.js';

const router = useRouter.Router();

router.post('/create-role', CreateRole); // endpoint: /role/create-role, body{roleName, description}
router.get('/get-all-role', GetAllRole); // endpoint: /role/get-all-role
router.put('/update-role/:id', UpdateRole); // endpoint: /role/update-role/:id
router.delete('/delete-role/:id', DeleteRole); // endpoint: /role/delete-role/:id
router.get('/get-role-by-id/:id', GetRoleById); // endpoint: /role/get-role-by-id/:id
router.put('/update-role-status/:id', UpdateRoleStatus); // endpoint: /role/get-role-by-id/:id

export default router;
