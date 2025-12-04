import { Request, Response } from "express";
import prisma from "../prisma/client";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

function validEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

class AuthController {
    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    _count: {
                        select: {
                            CVs: true
                        }
                    }
                }
            });

            return res.status(200).json({
                total: users.length,
                users
            });
        } catch (e) {
            console.error('Error fetching users:', e);
            return res.status(500).json({ error: 'Error al obtener los usuarios' });
        }
    }

    async createUser(req: Request, res: Response){
        try {
            const {
                name,
                password,
                email,
            } = req.body;

            if(!validEmail(email)){
                return res.status(400).json({ error: "Invalid email format." });
            }

            const existingUser = await prisma.user.findUnique({ where: { email } })

            if(existingUser) {
                return res.status(409).json({ error: "Email already registered." });
            }

            const saltRounds = Number(process.env.SALT);

            if (isNaN(saltRounds)) {
                throw new Error("SALT environment variable must be a valid number");
            }

            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword
                }
            });

            const jwtSecret = process.env.JWT_SECRET;

            const token = jwt.sign(
                { userId: user.id, email: user.email },
                jwtSecret!,
                { expiresIn: '1h' }
            );

            return res.status(201).json({
                message: "User created successfully",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        }
        catch(e) {
            console.log('error:', e);
            return res.status(500).json({ error: 'There was an error creating the client' });
        }
    };

    async loginUser(req: Request, res: Response){
        try {
            const {email, password} = req.body;

            if(!validEmail(email)) {
                return res.status(400).json({ error: "Invalid email format." });
            }

            const user = await prisma.user.findUnique({ where: { email } });

            if(!user) {
                return res.status(404).json({ error: "User not found." });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ error: "Invalid password." });
            }

            const jwtSecret = process.env.JWT_SECRET;

            const token = jwt.sign(
                { userId: user.id, email: user.email },
                jwtSecret!,
                { expiresIn: '1h' }
            );

            return res.status(201).json({
                message: "Login sucessfull",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        }
        catch(e) {
            console.error('error:', e);
        return res.status(500).json({ error: 'There was an error logging in the user' });
        }
    }

    async getUserById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const user = await prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            });

            if (!user) {
                return res.status(404).json({ error: "User not found." });
            }

            return res.status(200).json(user);
        } catch (e) {
            console.error('error:', e);
            return res.status(500).json({ error: 'Error fetching user' });
        }
    }

    async updateUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, email, currentPassword, newPassword } = req.body;

            const user = await prisma.user.findUnique({ where: { id } });

            if (!user) {
                return res.status(404).json({ error: "User not found." });
            }

            // Validar email si se está actualizando
            if (email && email !== user.email) {
                if (!validEmail(email)) {
                    return res.status(400).json({ error: "Invalid email format." });
                }

                const emailExists = await prisma.user.findUnique({ where: { email } });
                if (emailExists) {
                    return res.status(409).json({ error: "Email already in use." });
                }
            }

            // Preparar datos de actualización
            const updateData: any = {};
            if (name) updateData.name = name;
            if (email) updateData.email = email;

            // Si se quiere cambiar la contraseña
            if (newPassword) {
                if (!currentPassword) {
                    return res.status(400).json({ error: "Current password is required to change password." });
                }

                const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
                if (!isPasswordValid) {
                    return res.status(401).json({ error: "Current password is incorrect." });
                }

                const saltRounds = Number(process.env.SALT);
                if (isNaN(saltRounds)) {
                    throw new Error("SALT environment variable must be a valid number");
                }

                updateData.password = await bcrypt.hash(newPassword, saltRounds);
            }

            const updatedUser = await prisma.user.update({
                where: { id },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            });

            return res.status(200).json({
                message: "User updated successfully",
                user: updatedUser
            });
        } catch (e) {
            console.error('error:', e);
            return res.status(500).json({ error: 'Error updating user' });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const user = await prisma.user.findUnique({ where: { id } });

            if (!user) {
                return res.status(404).json({ error: "User not found." });
            }

            // Primero eliminar todos los CVs del usuario
            await prisma.cV.deleteMany({
                where: { userId: id }
            });

            // Luego eliminar el usuario
            await prisma.user.delete({
                where: { id }
            });

            return res.status(200).json({
                message: "User and associated CVs deleted successfully"
            });
        } catch (e) {
            console.error('error:', e);
            return res.status(500).json({ error: 'Error deleting user' });
        }
    }
}

export default new AuthController();