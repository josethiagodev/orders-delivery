import { Request, Response } from "express"

import { RemoveItemInOrderService } from "../../services/order/RemoveItemInOrderService"

export class RemoveItemInOrderController {
  async handle(req: Request, res: Response) {

    const { item_id } = req.query
    
    const removeItem = new RemoveItemInOrderService()

    const result = await removeItem.execute({
      item_id: item_id as string
    })

    res.status(200).json(result)

  }
}