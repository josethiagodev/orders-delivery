import { Request, Response } from "express"

import { CreateProductService } from '../../services/product/CreateProductService'

export class CreateProductController {
    async handle(req: Request, res: Response) {

        const createProduct = new CreateProductService()

        const product = await createProduct.execute()

        return res.status(201).json(product);
    
    }
}