import { Router } from "express";

// Controllers User
import { CreateUserController } from "./controllers/user/CreateUserController.js";
import { AuthUserController } from "./controllers/user/AuthUserController.js";
import { DetailUserController } from "./controllers/user/DetailUserController.js";

// Controllers Category
import { CreateCategoryController } from "./controllers/category/CreateCategoryController.js";
import { ListAllCategoryController } from "./controllers/category/ListAllCategoryController.js";

// Controllers Product
import { CreateProductController } from "./controllers/product/CreateProductController.js";

// Validação + Autenticação (Middlewares)
import { validateSchema } from "./middlewares/validateSchema.js";
import { userIsAuthenticated } from "./middlewares/userIsAuthenticated.js";
import { isAdminRole } from "./middlewares/isAdminRole.js";

// Schemas Data
import { createUserSchema, authUserSchema } from "./schemas/userSchema.js";
import { createCategorySchema } from "./schemas/categorySchema.js";


export const router = Router();


// ** ROTA USERS ** //

// POST => Criar usuário
router.post(
    "/users", 
    validateSchema(createUserSchema), new CreateUserController().handle
);

// POST => Fazer login por sessão
router.post(
    "/session", 
    validateSchema(authUserSchema), new AuthUserController().handle
);

// GET => Buscar dados do usuário logado
router.get(
    "/me",
    userIsAuthenticated, new DetailUserController().handle
);



// ** ROTAS CATEGORIES ** //

// POST => Criar uma categoria
router.post(
    "/category", 
    userIsAuthenticated, 
    isAdminRole, 
    validateSchema(createCategorySchema),
    new CreateCategoryController().handle
);

// GET => Listar todas categorias
router.get(
    "/categoryall",
    userIsAuthenticated,
    new ListAllCategoryController().handle
);



// ** ROTAS PRODUCTS ** //

// POST => Criar um produto
router.post(
    "/product", 
    userIsAuthenticated, 
    isAdminRole, 
    new CreateProductController().handle
);