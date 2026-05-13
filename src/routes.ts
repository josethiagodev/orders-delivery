import { Router } from "express";

import { CreateUserController } from "./controllers/user/CreateUserController.js";

import { validateSchema } from "./middlewares/validateSchema.js";
import { createUserSchema } from "./schemas/userSchema.js";


const router = Router();

// Criar Usuário
router.post(
    "/users", 
    validateSchema(createUserSchema), 
    new CreateUserController().handle
);

export { router };