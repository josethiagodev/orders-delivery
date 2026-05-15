import { Router } from "express";

// Controller ()
import { CreateUserController } from "./controllers/user/CreateUserController.js";
import { AuthUserController } from "./controllers/user/AuthUserController.js";

// Validação (EXPRESS + ZOD)
import { validateSchema } from "./middlewares/validateSchema.js";
import { createUserSchema, authUserSchema } from "./schemas/userSchema.js";


const router = Router();

// ROTA => Criar Usuário
router.post(
    "/users", 
    validateSchema(createUserSchema), new CreateUserController().handle
);

// ROTA => Fazer login por sessão
router.post(
    "/session", 
    validateSchema(authUserSchema), new AuthUserController().handle
);

export { router };