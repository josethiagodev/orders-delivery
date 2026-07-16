import { Request, Response } from "express"

import { ListAllProductsService } from '../../services/product/ListAllProductsService'

export class ListAllProductsController {
    async handle(req: Request, res: Response) {

        const disabled = req.query.disabled as string | undefined;

        const listProduct = new ListAllProductsService();

        const products = await listProduct.execute({
            disabled: disabled
        });

        res.status(200).json(products);

    }
}
