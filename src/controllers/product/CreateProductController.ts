import { Request, Response } from "express"

import { CreateProductService } from '../../services/product/CreateProductService'

export class CreateProductController {
    async handle(req: Request, res: Response) {
        const { name, price, description, category_id } = req.body
        
        if(!req.file) {
            throw new Error("A imagem do produto é obrigatória!");
        }

        const createProduct = new CreateProductService()

        const product = await createProduct.execute({
            name: name,
            price: price,
            description: description,
            category_id: category_id,
            imageBuffer: req.file.buffer,
            imageName: req.file.originalname
        })

        return res.status(201).json(product);
    }
}