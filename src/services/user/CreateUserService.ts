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

        // Criando dados do usuário
        const user = await prismaClient.user.create({
            data: {
                name: name,
                email: email,
                password: passwordHash,
            }
        })

        return user.name

    }
}

export { CreateUserService };