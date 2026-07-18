import prismaClient from "../../prisma/index"

interface RemoveItemProps {
  item_id: string;
}

export class RemoveItemInOrderService {
  async execute({ item_id }: RemoveItemProps) {
    try {
      // 1 - Verificando se o item existe
      const itemExists = await prismaClient.item.findFirst({
        where: {
          id: item_id
        }
      })

      if(!itemExists) {
        throw new Error("Item não encontrado!")
      }

      // 2 - Remover o 'item' da order (pedido)
      await prismaClient.item.delete({
        where: {
          id: item_id
        }
      })

      return { message: "Item removido com sucesso!" }
    }

    catch(err) {
      throw new Error("Falha ao remover o item do pedido!")
    }
  }
}