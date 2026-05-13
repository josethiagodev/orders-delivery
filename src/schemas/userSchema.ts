import { z } from "zod"

export const createUserSchema = z.object({
    body: z.object({
        name: z.string({ message: "Seu nome precisa ser somente texto!" })
               .min(3, { message: "Use no mínimo 3 letras para seu nome!" }) // Impede string vazia ""
               .trim() // Remove espaços
               .toLowerCase(), // Normaliza o e-mail

        email: z.email({ message: "Seu e-mail está com formato inválido!" })
                .min(1, { message: "Seu e-mail é obrigatório!" }) // Impede string vazia ""
                .trim()  // Remove espaços
                .toLowerCase(),  // Normaliza o e-mail

        password: z.string({ message: "Sua senha é obrigatória e deve ter números e letras!" })
                   .min(6, { message: "Use no mínimo 6 caracteres para sua senha!" }) // Impede string vazia ""
                   .trim() // Remove espaços
                   .toLowerCase() // Normaliza o e-mail
                   .regex(/[a-z]/, "Use caractere minúsculo para sua senha!")
                   .regex(/[0-9]/, "Use algum número para sua senha!")
    })
})