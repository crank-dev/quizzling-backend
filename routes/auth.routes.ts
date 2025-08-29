import express from 'express';
import Authentication from '../controllers/auth/authentication.js';

const AuthRoutes = express.Router();

AuthRoutes.post('/register', Authentication.Register);
AuthRoutes.post('/login', Authentication.Login);

export default AuthRoutes;