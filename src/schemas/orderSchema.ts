import { z } from "zod"

export const createOrderSchema = z.object({
  body: z.object({
    table: z
      .number({ message: "O número da mesa é obrigatório!" })
      .int({ message: "O número da mesa deve ser um número inteiro!" })
      .positive({ message: "O número da mesa deve ser um número positivo!" }),

    name: z.string({ message: "O nome é obrigatório e deve ser string!" })
           .optional(),
  })
});

export const addItemSchema = z.object({
  body: z.object({
    order_id: z
      .string({ message: "O pedido deve ser string!" })
      .min(1, { message: "O 'ID do pedido' é obrigatório!" }),

    product_id: z
      .string({ message: "O produto deve ser string!" })
      .min(1, { message: "O 'ID do produto' é obrigatório!" }),

    amount: z
      .number({ message: "A quantidade é obrigatória!" })
      .int({ message: "A 'quantidade deve ser número inteiro!" })
      .positive({ message: "A quantidade deve ser número positivo!" })
  })
});

export const removeItemSchema = z.object({
  query: z.object({
    item_id: z
      .string({ message: "O 'ID do item' deve ser string!" })
      .min(1, { message: "O 'ID do item' é obrigatório!" })
  })
});