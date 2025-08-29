import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../../config/db.js';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

// don't mind my ass using : any type for everything, i just don't like having to write a lot of code because of a typeshit.

const JWT_SECRET: any = process.env.JWT_SECRET;
const JWT_EXPIRES_IN: any = '1h'; // token expires in 1 hour

const Authentication = {
    Register: async (req: Request, res: Response) => { // /api/v1/auth/register
        const { email, username, password } = req.body;

        // validate required fields
        if (!email || !username || !password) {
            return res.status(400).json({
                code: 400,
                status: 'fail',
                message: 'all fields must be filled.'
            });
        }

        try {
            // check if user already exists in the database
            const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            if ((existing as any[]).length > 0) {
                return res.status(400).json({
                    code: 400,
                    status: 'fail',
                    message: `user already exists with email: '${email}'`
                });
            }

            // hash the password securely
            const hashedPassword = await bcrypt.hash(password, 10);

            // insert new user into the database
            const [result] = await db.query(
                "INSERT INTO users (email, name, password) VALUES (?, ?, ?)",
                [email, username, hashedPassword]
            );

            // generate jwt token for the newly registered user
            const token = jwt.sign(
                { id: (result as any).insertId, email, username },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            return res.status(201).json({
                code: 201,
                status: 'success',
                message: `user '${username}' registered successfully!`,
                data: {
                    email,
                    name: username,
                    token
                }
            });
        } catch (error) {
            console.error(`[🔥🚀 QUIZZLING API]: error on '.../api/v1/auth/register': ${error}`);
            return res.status(500).json({
                code: 500,
                status: 'error',
                message: 'internal server error.'
            });
        }
    },

    Login: async (req: Request, res: Response) => { // /api/v1/auth/login
        const { email, password } = req.body;

        // validate required fields
        if (!email || !password) {
            return res.status(400).json({
                code: 400,
                status: 'fail',
                message: 'email and password must be provided.'
            });
        }

        try {
            // fetch user by email from the database
            const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            if ((users as any[]).length === 0) {
                return res.status(400).json({
                    code: 400,
                    status: 'fail',
                    message: 'invalid credentials.'
                });
            }

            const user = (users as any[])[0];

            // compare the provided password with the stored hash
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(400).json({
                    code: 400,
                    status: 'fail',
                    message: 'invalid credentials.'
                });
            }

            // generate jwt token for authenticated user
            const token = jwt.sign(
                { id: user.id, email: user.email, username: user.name },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            return res.status(200).json({
                code: 200,
                status: 'success',
                message: `user '${user.name}' logged in successfully!`,
                data: {
                    email: user.email,
                    name: user.name,
                    token
                }
            });
        } catch (error) {
            console.error(`[🔥🚀 QUIZZLING API]: error on '.../api/v1/auth/login': ${error}`);
            return res.status(500).json({
                code: 500,
                status: 'error',
                message: 'internal server error.'
            });
        }
    }
};

export default Authentication;