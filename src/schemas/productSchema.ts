import { z } from "zod"

export const createProductSchema = z.object({
    body: z.object({
        name: z
            .string({ message: "O nome do produto é obrigatório!" })
            .min(2, { message: "O nome do produto deve ter no mínimo de 2 caracteres!" }) // Impede string vázia ""
            .trim(), // Remove espaços

        price: z
            .string({ message: "O preço do produto é obrigatório!" })
            .min(1, { message: "O preço do produto é obrigatório!" })
            .trim(), // Remove espaços

        description: z
            .string({ message: "A descrição do produto é obrigatória!" })
            .min(1, { message: "A descrição do produto deve ter no mínimo de 2 caracteres" })
            .trim(), // Remove espaços

        category_id: z
            .string({ message: "A categoria do produto é obrigatória!" })
            .trim() // Remove espaços
    })
})


export const listProductsSchema = z.object({
    query: z.object({
        disabled: z.enum(["true", "false"], { 
            message: "O valor deve ser somente 'true' ou 'false'!"
        })
            .optional()
            .default("false")
            .transform((val) => val === "true")
    }).strict()
})


export const listProductsByCategorySchema = z.object({
    query: z.object({
        category_id: z.string({ message: "O ID da categoria é obrigatória!" })
    })
})