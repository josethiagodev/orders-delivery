import { Request, Response } from "express"
import { DetailUserService } from "../../services/user/DetailUserService"

class DetailUserController {
    async handle(req: Request, res: Response) {
        
        const { user_id } = req.body;

        const detailUser = new DetailUserService()

        const user = await detailUser.execute(user_id!);

        res.json(user);

    }
}

export { DetailUserController };

