import prismaClient from "../../prisma/index";
import { hash } from "bcrypt";

interface CreateUserProps {
    name: string;
    email: string;
    password: string;
}

class CreateUserService {
    async execute({ name, email, password }: CreateUserProps) {

        const userAlreadyExist = await prismaClient.user.findFirst({
            where: {
                email: email
            }
        })
        if(userAlreadyExist) {
            throw new Error("O usuário já existe!")
        }

        // Criando HASH da senha
        const passwordHash = await hash(password, 8)
        // Campo 'e-mail' sem espaços e letras minúsculas
        const normalizedEmail = email?.trim().toLowerCase();

        // Criando dados do usuário
        const user = await prismaClient.user.create({
            data: {
                name: name,
                email: normalizedEmail,
                password: passwordHash,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        })

        return user;

    }
}

export { CreateUserService };