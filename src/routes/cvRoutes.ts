import { Router } from "express";
import cvController from "../controllers/cvController";

const router = Router();

router.get('/all', cvController.getAllCVs);

// Obtener todos los CVs de un usuario
router.get('/user/:userId', cvController.getUserCVs);

// Obtener un CV específico por ID
router.get('/:id', cvController.getCVById);

// Crear un nuevo CV
router.post('/', cvController.createCV);

// Actualizar un CV
router.put('/:id', cvController.updateCV);

// Eliminar un CV
router.delete('/:id', cvController.deleteCV);

export default router;
