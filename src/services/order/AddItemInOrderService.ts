import prismaClient from "../../prisma/index"

interface ItemProps {
  order_id: string;
  product_id: string;
  amount: number;
}

export class AddItemInOrderService {
  async execute({ order_id, product_id, amount }: ItemProps) {

    try {
      // 1 - Busque uma 'order' onde o 'id' é igual ao 'order_id'
      const orderExists = await prismaClient.order.findFirst({
        where: {
          id: order_id
        }
      })

      if(!orderExists) {
        throw new Error("Pedido não encontrado!")
      }
      
      // 2 - Busque um 'produto' onde o 'id' é igual ao 'product_id'
      const productExists = await prismaClient.product.findFirst({
        where: {
          id: product_id,
          disabled: false
        }
      })

      if(!productExists) {
        throw new Error("Produto não encontrado!")
      }

      // 3 - Adicionando novo 'item' & Atualizando o Pedido existente
      const addItemInOrder = await prismaClient.item.create({
        data: {
          order_id: order_id,
          product_id: product_id,
          amount: amount
        },
        select: {
          id: true,
          amount: true,
          order_id: true,
          product_id: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              description: true,
              banner: true
            }
          }
        }
      })
      
      return addItemInOrder
    }

    catch(err) {
      throw new Error("Falha ao adicionar item no pedido!")
    }

  }
}