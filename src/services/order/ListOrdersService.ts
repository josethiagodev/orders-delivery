import prismaClient from "../../prisma/index"

interface ListOrdersServiceProps {
  draft?: string;
}

export class ListOrdersService {
  async execute({ draft }: ListOrdersServiceProps) {

    const orders = await prismaClient.order.findMany({
      where: {
        draft: draft === "true" ? true : false
      },
      select: {
        id: true,
        table: true,
        name: true,
        draft: true,
        status: true,
        createdAt: true,
        itens: {
          select: {
            id: true,
            amount: true,
            product: {
              select: {
                id: true, 
                name: true,
                price: true,
                description: true,
                banner: true
              }
            },
          }
        }
      }
    });

    return orders;

  }
}