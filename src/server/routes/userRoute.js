import express from 'express';
import { create, getAllUsers,getUserById, update , deleteUser} from '../controller/userController.js';
const route = express.Router();


route.post('/user', create);
route.get('/users', getAllUsers);
route.get('/user/:id', getUserById);
route.put('/update/user/:id', update);
route.delete('/delete/user/:id', deleteUser);
// Upload avatar
import upload from '../middleware/uploadMiddleware.js';
import { uploadAvatar } from '../controller/userController.js';
route.post('/user/:id/avatar', upload.single('avatar'), uploadAvatar);
export default route;