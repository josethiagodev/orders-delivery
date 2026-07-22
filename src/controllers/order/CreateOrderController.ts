import { Request, Response } from "express"

import { CreateOrderService } from "../../services/order/CreateOrderService"

export class CreateOrderController {
  async handle(req: Request, res: Response) {

    const { table, name } = req.body

    const createOrder = new CreateOrderService

    const order = await createOrder.execute({
      table: Number(table), 
      name
    })

    res.status(201).json(order)

  }
}