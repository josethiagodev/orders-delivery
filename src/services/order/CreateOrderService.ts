import prismaClient from "../../prisma/index"

interface CreateOrderServiceProps {
  table: number;
  name: string;
}

export class CreateOrderService {
  async execute({ table, name }: CreateOrderServiceProps) {

    try {
      const order = await prismaClient.order.create({
        data: {
          table: table,
          name: name ?? ""
        },
        select: {
          id: true,
          table: true,
          status: true,
          draft: true,
          name: true,
          createdAt: true
        }
      });

      return order;
    } 
    
    catch (err) {
      throw new Error("Falha ao criar seu pedido");
    }

  }
}