import prismaClient from "../../prisma/index"

interface SendOrderProps {
  name: string;
  order_id: string;
}

export class SendOrderService {
  async execute({ name, order_id }: SendOrderProps) {
    try {
      // 1 - Verifica se o 'order_id' existe
      const order = await prismaClient.order.findFirst({
        where: {
          id: order_id
        }
      })

      // 2 - Verifica se o 'order_id' não existe
      if(!order) {
        throw new Error("Pedido não encontrado!")
      }

      // 3 - Atualiza a propriedade 'draft' para false (enviar para cozinha)
      const updateOrder = await prismaClient.order.update({
        where: {
          id: order_id
        },
        data: {
          draft: false, 
          name: name
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
      throw new Error("Falha ao enviar o pedido!")
    }
  }
}