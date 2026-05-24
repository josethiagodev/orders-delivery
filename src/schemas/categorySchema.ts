import { z } from "zod"

export const createCategorySchema = z.object({
    body: z.object({

        name: z.string({ message: "A categoria precisa ser somente texto!" })
               .min(2, { message: "Mínimo de 3 caracteres para o nome da categoria!" }) // Impede string vázia ""
               .trim() // Remove espaços
               .toLowerCase() // Letra minúsculas
               .regex(/^[a-z]+$/)
        
    })
})