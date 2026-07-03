import { z } from "zod"

export const createProductSchema = z.object({
    body: z.object({
        name: z.string({ message: "O nome é obrigatório e deve ter somente texto!" })
               .min(2, { message: "O nome deve ter no mínimo de 2 caracteres!" }) // Impede string vázia ""
               .trim(), // Remove espaços

        price: z.string({ message: "O preço do produto deve ter somente texto!" })
                .min(1, { message: "O valor do produto é obrigatório!" })
                .trim(), // Remove espaços

        description: z.string({ message: "O descrição do produto deve ter somente texto!" })
                      .min(1, { message: "A descrição do produto é obrigatória!" })
                      .trim(), // Remove espaços

        category_id: z.string({ message: "O categoria do produto deve ter somente texto!" })
                      .trim() // Remove espaços
    })
})