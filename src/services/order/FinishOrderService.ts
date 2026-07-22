import prismaClient from "../../prisma/index"

interface FinishOrderProps {
  order_id: string;
}

export class FinishOrderService {
  async execute({ order_id }: FinishOrderProps) {
    try {
      // 1 - Verifica se o 'order_id' existe
      const order = await prismaClient.order.findFirst({
        where: {
          id: order_id
        }
      })

      // 2 - Verifica se o 'order_id' não existe
      if(!order) {
        throw new Error("Pedido não finalizado!")
      }

      // 3 - Atualiza a propriedade 'draft' para false (enviar para cozinha)
      const updateOrder = await prismaClient.order.update({
        where: {
          id: order_id
        },
        data: {
          status: true
        },
        select: {
          id: true,
          table: true,
          name: true,
          draft: true,
          status: true,
          createdAt: true
        }
      })
      
      return updateOrder
    }

    catch(err) {
      throw new Error("Falha ao finalizar o pedido!")
    }
  }
}