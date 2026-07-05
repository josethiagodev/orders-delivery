import prismaClient from "../../prisma/index"

interface ListAllProductsServiceProps {
    disabled?: string;
}

export class ListAllProductsService {
    async execute({ disabled }: ListAllProductsServiceProps) {
        try {
            const products = await prismaClient.product.findMany({
                where: {
                    disabled: disabled === "true" ? true : false
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
        }

        catch(err) {
            throw new Error("Falha ao buscar os produtos!");
        }
    }
}