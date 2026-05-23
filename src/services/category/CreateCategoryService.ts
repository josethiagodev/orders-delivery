import prismaClient from "../../prisma/index"

interface CreateCategoryProps {
    name: string
}

export class CreateCategoryService {
    async execute({ name }: CreateCategoryProps) {

        try {
            const category = await prismaClient.category.create({
                data: {
                    name: name
                },
                select: {
                    id: true,
                    name: true,
                    createdAt: true
                }
            })

            return category;
        }

        catch(err) {
            throw new Error("Erro ao criar categoria!");
        }

    }
}