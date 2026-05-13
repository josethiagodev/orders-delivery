import cors from "cors";
import express from "express";
import { router } from "./routes.js";
const app = express();
app.use(express.json());
app.use(cors());
app.use(router);
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log("Servidor rodando na porta " + PORT);
});
//# sourceMappingURL=server.js.map