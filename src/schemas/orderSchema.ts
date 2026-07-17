import { z } from "zod"

export const createOrderSchema = z.object({
  body: z.object({
    table: z
      .number({ message: "O número da mesa é obrigatório!" })
      .int({ message: "O número da mesa deve ser um número inteiro!" })
      .positive({ message: "O número da mesa deve ser um número positivo!" }),

    name: z.string({ message: "O nome é obrigatório e deve ser uma string!" })
           .optional(),
  })
});

export const addItemSchema = z.object({
  body: z.object({
    order_id: z
      .string({ message: "O pedido deve ser string!" })
      .min(1, { message: "O 'id do pedido' é obrigatório e no mínimo 1 caracter!" }),

    product_id: z
      .string({ message: "O produto deve ser string!" })
      .min(1, { message: "O 'id do produto' é obrigatório e no mínimo 1 caracter!" }),

    amount: z
      .number({ message: "A quantidade é obrigatória!" })
      .int({ message: "A 'quantidade deve ser número inteiro!" })
      .positive({ message: "A quantidade deve ser número positivo!" })
  })
});