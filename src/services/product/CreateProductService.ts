import prismaClient from "../../prisma/index"

interface CreateProductProps {
    name: string;
}

export class CreateProductService {
    async execute() {
        return "Produto criado com sucesso!"
    }
}