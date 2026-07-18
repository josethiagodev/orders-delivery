import { Request, Response } from "express"

import { ListAllCategoryService } from '../../services/category/ListAllCategoryService'

export class ListAllCategoryController {
    async handle(req: Request, res: Response) {

        const listAllCategory = new ListAllCategoryService()

        const categories = await listAllCategory.execute()

        return res.status(200).json(categories);

    }
}
