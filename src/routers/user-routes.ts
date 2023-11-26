import express from "express";
import multer from 'multer';
import { getAnalytics } from "../controllers/analytics-controller.controller";
import { forgetPassword, loginController, registerController, resetPassword } from "../controllers/auth-controller.controller";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const server = express.Router()

const routes = {
    login: '/login',
    register: '/register',
    'user-activity': '/dashboard/user-activity',
    'login-analytics': '/login-analytics',
    analytics: '/analytics',
    'forget-password': '/forget-password',
    'reset-password': '/reset-password',

}

server.post(routes.register, upload.single('file'), registerController);
server.get(routes.login, loginController);
// server.get(routes["user-activity"], authenticateToken, userActivityController)
server.post(routes['login-analytics'], upload.single('file'), getAnalytics);
server.post(routes['forget-password'], forgetPassword)
server.post(routes['reset-password'], resetPassword);