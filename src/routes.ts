import { Router } from "express"
import multer from "multer"

// Config Multer
import uploadConfig from "../src/config/multer";

// Controllers User
import { CreateUserController } from "./controllers/user/CreateUserController.js";
import { AuthUserController } from "./controllers/user/AuthUserController.js";
import { DetailUserController } from "./controllers/user/DetailUserController.js";

// Controllers Category
import { CreateCategoryController } from "./controllers/category/CreateCategoryController.js";
import { ListAllCategoryController } from "./controllers/category/ListAllCategoryController.js";

// Controllers Product
import { CreateProductController } from "./controllers/product/CreateProductController.js";
import { ListAllProductsController } from "./controllers/product/ListAllProductsController.js";
import { DeleteProductController } from "./controllers/product/DeleteProductController";

// Validação + Autenticação (Middlewares)
import { validateSchema } from "./middlewares/validateSchema.js";
import { userIsAuthenticated } from "./middlewares/userIsAuthenticated.js";
import { isAdminRole } from "./middlewares/isAdminRole.js";

// Schemas Data
import { createUserSchema, authUserSchema } from "./schemas/userSchema.js";
import { createCategorySchema } from "./schemas/categorySchema.js";
import { createProductSchema, listProductsSchema } from "./schemas/productSchema";


export const router = Router();
const uploadFiles = multer(uploadConfig);


// ## ROTA USERS ## //

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



// ## ROTAS CATEGORIES ## //

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



// ## ROTAS PRODUCTS ## //

// POST => Criar um produto
router.post(
    "/product", 
    userIsAuthenticated, 
    isAdminRole, 
    uploadFiles.single('file'),
    validateSchema(createProductSchema),
    new CreateProductController().handle
);

// GET => Listar todos produtos
router.get(
    "/products",
    userIsAuthenticated,
    validateSchema(listProductsSchema),
    new ListAllProductsController().handle
);

// DELETE => Deletar produto específico
router.delete(
    "/product", 
    userIsAuthenticated, 
    isAdminRole, 
    new DeleteProductController().handle
);