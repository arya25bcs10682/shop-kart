// route manage karna konse pe kya karna hai

import express from "express";
//kya kya functions pe operate kar sakta hai
import { register, login, me, logoutCustomer } from "../controllers/customer.controller.js"; 
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const customerRoutes = express.Router()

customerRoutes.post('/register', register)
customerRoutes.post('/login', login)
customerRoutes.get('/me', isAuthenticated, me)
customerRoutes.post('/logout', logoutCustomer)

export default customerRoutes