import { Request, Response } from "express"

import { DetailsOrderService } from "../../services/order/DetailsOrderService"

export class DetailsOrderController {
  async handle(req: Request, res: Response) {

    const { order_id } = req.query

    const detailsOrder = new DetailsOrderService()

    const order = await detailsOrder.execute({
      order_id: order_id as string
    });

    res.status(200).json(order)

  }
}