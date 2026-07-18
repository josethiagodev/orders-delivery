import prismaClient from "../../prisma/index"

interface DetailsOrderProps {
  order_id: string;
}

export class DetailsOrderService {
  async execute({ order_id }: DetailsOrderProps) {
    try {
      // Buscando a 'order (pedido)' com todos os detalhes
      const order = await prismaClient.order.findFirst({
        where: {
          id: order_id
        },
        select: {
          id: true,
          table: true,
          name: true,
          draft: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          itens: {
            select: {
              id: true,
              amount: true,
              createdAt: true,
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
      })

      if(!order) {
        throw new Error("Pedido não encontrado!")
      }

      return order;
    }

    catch(err) {
      throw new Error("Falha ao buscar os detalhes do pedido!")
    }
  }
}