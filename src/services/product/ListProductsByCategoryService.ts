import prismaClient from "../../prisma/index"

interface ListProductsByCategoryServiceProps {
    category_id: string;
}

export class ListProductsByCategoryService {
    async execute({ category_id }: ListProductsByCategoryServiceProps) {
        const category = await prismaClient.category.findUnique({
            where: {
                id: category_id
            }
        })

        if (!category) {
            throw new Error("Categoria não encontrada!")
        }

        try {
            const products = await prismaClient.product.findMany({
                where: {
                    category_id: category_id,
                    disabled: false
                },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    description: true,
                    banner: true,
                    disabled: true,
                    category_id: true,
                    createdAt: true,
                    category: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: {
                    name: "desc"
                }
            })

            return products;
        } catch (err) {
            if(err instanceof Error) {
                throw new Error(err.message)
            }
            throw new Error("Falha ao buscar produto da categoria!")
        }
    }
}
