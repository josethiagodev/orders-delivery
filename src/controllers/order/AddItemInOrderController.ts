import { Request, Response } from "express"

import { AddItemInOrderService } from "../../services/order/AddItemInOrderService"

export class AddItemInOrderController {
  async handle(req: Request, res: Response) {
    
    const { order_id, product_id, amount } = req.body

    const addItemInOrder = new AddItemInOrderService

    const newItemInOrder = await addItemInOrder.execute({
      order_id: order_id,
      product_id: product_id,
      amount: amount
    })

    res.status(201).json(newItemInOrder)

  }
}