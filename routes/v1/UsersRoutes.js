import useRouter from 'express';
import {
  GetUser,
  CreateUser,
  GetAllReviewer,
  GetAllAuthor,
  UpdatePermission,
  GetUserWithId,
  GetAllUsers,
  UploadProfileImage,
  UpdateUser,
  UpdateUserRole, 
  UpdateUserAdmin, 
} from '../../controllers/UserController.js';

const router = useRouter.Router();

router.get('/get-user', GetUser); // endpoint: /user/get-user
router.get('/get-all-user', GetAllUsers);  
router.get('/get-all-reviewer', GetAllReviewer);  
router.get('/get-all-author', GetAllAuthor);  
router.put('/upload-image-url', UploadProfileImage); // endpoint: /user/upload-image-url {imageUrl}
router.put('/update-profile', UpdateUser);  
router.put('/update-user-role/:id', UpdateUserRole);
router.get('/edit/:id', GetUserWithId); // endpoint: /user/edit/:id
router.put('/update-user/:id', UpdateUserAdmin); // endpoint: /user/update-user/:id {fullName, mobile, email, status, role}
router.put('/update-permission/:id', UpdatePermission); // endpoint: /user/update-permission/:id {permission}
router.post('/create-user', CreateUser);
 
export default router;
