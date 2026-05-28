import { z } from "zod"

export const createUserSchema = z.object({
    body: z.object({

        name: z.string({ message: "Seu nome precisa ser somente texto!" })
               .min(3, { message: "Mínimo 3 caracteres no nome!" }) // Impede string vázia ""
               .trim(), // Remove espaços

        email: z.email({ message: "Seu e-mail está com formato inválido!" })
                .regex(/^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i, { message: "Apenas caracteres minúsculos no email!" })
                .min(1, { message: "Seu e-mail é obrigatório!" }) // Impede string vázia ""
                .trim()  // Remove espaços
                .toLowerCase(),  // Normaliza dados

        password: z.string({ message: "Sua senha é obrigatória e deve ter números e letras!" })
                   .min(6, { message: "Digite no mínimo 6 caracteres para senha!" }) // Impede string vazia ""
                   .trim() // Remove espaços

    })
})