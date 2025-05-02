import useRouter from 'express';
import {
  CreatePerson,
  GetAllPersons,
  GetPersonById,
  UpdatePerson, 
} from '../../controllers/person.controller.js';

const router = useRouter.Router();

router.get('/get-user', CreatePerson); // endpoint: /user/get-user
router.get('/get-all-user', GetAllPersons); // endpoint: /user/get-all-user?limit=10&page=1
router.put('/update-profile', UpdatePerson); // endpoint: /user/update-profile {fullName, mobile, address}
router.get('/edit/:id', GetPersonById); // endpoint: /user/edit/:id
 
export default router;
