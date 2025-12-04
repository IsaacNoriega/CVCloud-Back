import { Router } from "express";
import userRoutes from "./userRoutes";
import cvRoutes from "./cvRoutes";
import pdfRoutes from "./pdfRoutes";

const router = Router();
router.use("/users", userRoutes);
router.use("/cvs", cvRoutes);
router.use("/pdf", pdfRoutes);

export default router;