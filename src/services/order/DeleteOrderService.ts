import prismaClient from "../../prisma/index"

interface DeleteOrderProps {
  order_id: string;
}

export class DeleteOrderService {
  async execute({ order_id }: DeleteOrderProps) {
    try {
      const order = await prismaClient.order.findFirst({
        where: {
          id: order_id
        }
      })

      if(!order) {
        throw new Error("Pedido não deletado!")
      }

      await prismaClient.order.delete({
        where: {
          id: order_id
        }
      })
      
      return { message: "Pedido deletado com sucesso!" }
    }

    catch(err) {
      throw new Error("Falha ao excluir o pedido!")
    }
  }
}