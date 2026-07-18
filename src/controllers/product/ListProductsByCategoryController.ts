import { Request, Response } from "express"

import { ListProductsByCategoryService } from '../../services/product/ListProductsByCategoryService'

export class ListProductsByCategoryController {
    async handle(req: Request, res: Response) {
        const category_id = req.query.category_id as string;

        const listProductByCategory = new ListProductsByCategoryService();

        const products = await listProductByCategory.execute({
            category_id: category_id
        });

        res.status(200).json(products);
    }
}
