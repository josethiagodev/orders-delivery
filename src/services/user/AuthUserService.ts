import { compare } from "bcrypt"
import prismaClient from "../../prisma/index"

import jwt from 'jsonwebtoken';

interface AuthUserServiceProps {
    email: string;
    password: string;
}

export class AuthUserService {
    async execute({ email, password }: AuthUserServiceProps) {
        
        // Verificar se usuário não existir
        const user = await prismaClient.user.findFirst({
            where: {
                email: email
            }
        })

        if(!user) {
            throw new Error("Email/Senha é obrigatório")
        }


        // Verificar se a senha está correta
        const passwordMatch = await compare(password, user.password)

        if(!passwordMatch) {
            throw new Error("Email/Senha é obrigatório")
        }


        // Gerar Hash (JWT = Json Web Token)
        const token = jwt.sign({
            name: user.name,
            email: user.email
        }, 
        process.env.JWT_SECRET as string, {
            subject: user.id,
            expiresIn: "1h"
        })


        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: token
        }

    }
}