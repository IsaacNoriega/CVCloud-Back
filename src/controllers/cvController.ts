import { Request, Response } from "express";
import prisma from "../prisma/client";

class CVController {
    // [DEBUG] Obtener TODOS los CVs (temporal para testing)
    async getAllCVs(req: Request, res: Response) {
        try {
            const cvs = await prisma.cV.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            return res.status(200).json({
                total: cvs.length,
                cvs
            });
        } catch (e) {
            console.error('Error fetching all CVs:', e);
            return res.status(500).json({ error: 'Error al obtener los CVs' });
        }
    }

    // Obtener todos los CVs de un usuario
    async getUserCVs(req: Request, res: Response) {
        try {
            const { userId } = req.params;

            const cvs = await prisma.cV.findMany({
                where: { userId },
                select: {
                    id: true,
                    data: true,
                }
            });

            return res.status(200).json(cvs);
        } catch (e) {
            console.error('Error fetching CVs:', e);
            return res.status(500).json({ error: 'Error al obtener los CVs' });
        }
    }

    // Obtener un CV específico
    async getCVById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const cv = await prisma.cV.findUnique({
                where: { id },
                select: {
                    id: true,
                    userId: true,
                    data: true,
                }
            });

            if (!cv) {
                return res.status(404).json({ error: 'CV no encontrado' });
            }

            return res.status(200).json(cv);
        } catch (e) {
            console.error('Error fetching CV:', e);
            return res.status(500).json({ error: 'Error al obtener el CV' });
        }
    }

    // Crear un nuevo CV
    async createCV(req: Request, res: Response) {
        try {
            const { userId, data } = req.body;

            if (!userId || !data) {
                return res.status(400).json({ error: 'userId y data son requeridos' });
            }

            const cv = await prisma.cV.create({
                data: {
                    userId,
                    data,
                },
                select: {
                    id: true,
                    userId: true,
                    data: true,
                }
            });

            return res.status(201).json({
                message: 'CV creado exitosamente',
                cv
            });
        } catch (e) {
            console.error('Error creating CV:', e);
            return res.status(500).json({ error: 'Error al crear el CV' });
        }
    }

    // Actualizar un CV existente
    async updateCV(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { data } = req.body;

            if (!data) {
                return res.status(400).json({ error: 'data es requerido' });
            }

            const existingCV = await prisma.cV.findUnique({
                where: { id }
            });

            if (!existingCV) {
                return res.status(404).json({ error: 'CV no encontrado' });
            }

            const cv = await prisma.cV.update({
                where: { id },
                data: { data },
                select: {
                    id: true,
                    userId: true,
                    data: true,
                }
            });

            return res.status(200).json({
                message: 'CV actualizado exitosamente',
                cv
            });
        } catch (e) {
            console.error('Error updating CV:', e);
            return res.status(500).json({ error: 'Error al actualizar el CV' });
        }
    }

    // Eliminar un CV
    async deleteCV(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const existingCV = await prisma.cV.findUnique({
                where: { id }
            });

            if (!existingCV) {
                return res.status(404).json({ error: 'CV no encontrado' });
            }

            await prisma.cV.delete({
                where: { id }
            });

            return res.status(200).json({
                message: 'CV eliminado exitosamente'
            });
        } catch (e) {
            console.error('Error deleting CV:', e);
            return res.status(500).json({ error: 'Error al eliminar el CV' });
        }
    }
}

export default new CVController();
