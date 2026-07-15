import { Request, Response } from "express"
import { DeleteProductService } from "../../services/product/DeleteProductService"

export class DeleteProductController {
  async handle(req: Request, res: Response) {
    const product_id = req.query?.product_id as string

    const deleteProduct = new DeleteProductService()

    const product = await deleteProduct.execute({ product_id: product_id })

    res.status(200).json(product)
  }
}