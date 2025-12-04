import { Router } from "express";
import userController from "../controllers/userController";

const router = Router()

// Get all users
router.get('/all', userController.getAllUsers);

// Auth routes
router.post('/register', userController.createUser);
router.post('/login', userController.loginUser);

// User CRUD routes
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
