import prismaClient from "../../prisma/index"

export class ListAllCategoryService {
    async execute() {
        try {
            // .findMany = Retornar lista de registros da tabela, permitindo filtros e paginação
            const categories = await prismaClient.category.findMany({
                select: {
                    id: true,
                    name: true,
                    createdAt: true
                },
                orderBy: {
                    name: "desc"
                }
            })

            return categories;
        }

        catch(err) {
            throw new Error("Erro ao buscar as categorias!");
        }
    }
}

