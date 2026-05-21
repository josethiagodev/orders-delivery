import { Router } from "express";

// Controllers User
import { CreateUserController } from "./controllers/user/CreateUserController.js";
import { AuthUserController } from "./controllers/user/AuthUserController.js";
import { DetailUserController } from "./controllers/user/DetailUserController.js";

// Controllers Category
import { CreateCategoryController } from "./controllers/category/CreateCategoryController.js";

// Validação + Autenticação (Middlewares)
import { validateSchema } from "./middlewares/validateSchema.js";
import { userIsAuthenticated } from "./middlewares/userIsAuthenticated.js";
import { isAdminRole } from "./middlewares/isAdminRole.js";

// Schemas Data
import { createUserSchema, authUserSchema } from "./schemas/userSchema.js";
import { createCategorySchema } from "./schemas/categorySchema.js";


const router = Router();


// ROTA POST => Criar usuário
router.post(
    "/users", 
    validateSchema(createUserSchema), new CreateUserController().handle
);

// ROTA POST => Fazer login por sessão
router.post(
    "/session", 
    validateSchema(authUserSchema), new AuthUserController().handle
);

// ROTA GET => Buscar dados do usuário logado
router.get(
    "/me",
    userIsAuthenticated, new DetailUserController().handle
);


// ROTA POST => Criar uma categoria
router.post(
    "/category", 
    userIsAuthenticated, 
    isAdminRole, 
    validateSchema(createCategorySchema),
    new CreateCategoryController().handle
);

export { router };