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
import { ListProductsByCategoryController } from "./controllers/product/ListProductsByCategoryController";

// Controllers Product
import { CreateProductController } from "./controllers/product/CreateProductController.js";
import { ListAllProductsController } from "./controllers/product/ListAllProductsController.js";
import { DeleteProductController } from "./controllers/product/DeleteProductController";

// Controllers Orders
import { CreateOrderController } from "./controllers/order/CreateOrderController";
import { ListOrdersController } from "./controllers/order/ListOrdersController";
import { AddItemInOrderController } from "./controllers/order/AddItemInOrderController";
import { RemoveItemInOrderController } from "./controllers/order/RemoveItemInOrderController";
import { DetailsOrderController } from "./controllers/order/DetailsOrderController";
import { SendOrderController } from "./controllers/order/SendOrderController";

// Validação + Autenticação (Middlewares)
import { validateSchema } from "./middlewares/validateSchema.js";
import { userIsAuthenticated } from "./middlewares/userIsAuthenticated.js";
import { isAdminRole } from "./middlewares/isAdminRole.js";

// Schemas Data (ZOD)
import { createUserSchema, authUserSchema } from "./schemas/userSchema.js";
import { createCategorySchema } from "./schemas/categorySchema.js";
import { 
    createProductSchema, 
    listProductsSchema, 
    listProductsByCategorySchema 
} from "./schemas/productSchema";
import { 
    createOrderSchema, 
    addItemSchema, 
    removeItemSchema, 
    detailsOrderSchema,
    sendOrderSchema
} from "./schemas/orderSchema";


export const router = Router();
const uploadFiles = multer(uploadConfig);


// ## ROTA USERS ## //

// Criar usuário
router.post(
    "/users", 
    validateSchema(createUserSchema), 
    new CreateUserController().handle
);

// Fazer login por sessão
router.post(
    "/session", 
    validateSchema(authUserSchema), 
    new AuthUserController().handle
);

// Buscar dados do usuário logado
router.get(
    "/me",
    userIsAuthenticated, 
    new DetailUserController().handle
);



// ## ROTAS CATEGORIES ## //

// Criar uma categoria
router.post(
    "/category", 
    userIsAuthenticated, 
    isAdminRole, 
    validateSchema(createCategorySchema),
    new CreateCategoryController().handle
);

// Buscar todas categorias
router.get(
    "/categoryall",
    userIsAuthenticated,
    new ListAllCategoryController().handle
);

// Buscar produtos de uma categoria
router.get(
    "/category/product",
    userIsAuthenticated,
    validateSchema(listProductsByCategorySchema),
    new ListProductsByCategoryController().handle
);


// ## ROTAS PRODUCTS ## //

// Criar um produto
router.post(
    "/product", 
    userIsAuthenticated, 
    isAdminRole, 
    uploadFiles.single('file'),
    validateSchema(createProductSchema),
    new CreateProductController().handle
);

// Buscar todos produtos
router.get(
    "/products",
    userIsAuthenticated,
    validateSchema(listProductsSchema),
    new ListAllProductsController().handle
);

// Deletar produto específico
router.delete(
    "/product", 
    userIsAuthenticated, 
    isAdminRole, 
    new DeleteProductController().handle
);


// ## ROTAS ORDERS ## //

// Criar um pedido
router.post(
    "/order", 
    userIsAuthenticated, 
    validateSchema(createOrderSchema),
    new CreateOrderController().handle
);

// Buscar todos pedidos
router.get(
    "/orders", 
    userIsAuthenticated, 
    new ListOrdersController().handle
);

// Buscar 'detalhes' de um pedido
router.get(
    "/order/details", 
    userIsAuthenticated, 
    validateSchema(detailsOrderSchema),
    new DetailsOrderController().handle
);

// Adicionar 'item' em um pedido
router.post(
    "/order/add", 
    userIsAuthenticated, 
    validateSchema(addItemSchema),
    new AddItemInOrderController().handle
);

// Remover 'item' de um pedido
router.delete(
    "/order/remove", 
    userIsAuthenticated, 
    validateSchema(removeItemSchema), 
    new RemoveItemInOrderController().handle
);

// Atualizar e enviar 'pedido' para produção
router.put(
    "/order/send",
    userIsAuthenticated, 
    validateSchema(sendOrderSchema), 
    new SendOrderController().handle
);