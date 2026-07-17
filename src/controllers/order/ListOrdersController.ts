import { Request, Response } from "express"

import { ListOrdersService } from "../../services/order/ListOrdersService"

export class ListOrdersController {
  async handle(req: Request, res: Response) {

    const draft = req.query?.draft as string | undefined

    const listOrders = new ListOrdersService()

    const orders = await listOrders.execute({
      draft: draft
    })

    res.json(orders)

  }
}