import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { router } from "./routes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(router);


// Middleware Global
app.use( (error: Error, _: Request, res: Response, next: NextFunction) => {
  if(error instanceof Error) {
    return res.status(400).json({
      error: error.message
    });
  }

  return res.status(500).json({
    error: "Erro no servidor interno!"
  })
})

const PORT = process.env.PORT! || 3333;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});