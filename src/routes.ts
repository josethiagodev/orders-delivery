import { Router } from "express";

// Controller ()
import { CreateUserController } from "./controllers/user/CreateUserController.js";
import { AuthUserController } from "./controllers/user/AuthUserController.js";
import { DetailUserController } from "./controllers/user/DetailUserController.js";

// Validação (EXPRESS + ZOD)
import { validateSchema } from "./middlewares/validateSchema.js";
import { createUserSchema, authUserSchema } from "./schemas/userSchema.js";


const router = Router();

// ROTA => Criar Usuário (POST)
router.post(
    "/users", 
    validateSchema(createUserSchema), new CreateUserController().handle
);

// ROTA => Fazer login por sessão (POST)
router.post(
    "/session", 
    validateSchema(authUserSchema), new AuthUserController().handle
);

// ROTA => Buscar detalhes do usuário (GET)
router.get(
    "/me",
    new DetailUserController().handle
);

export { router };