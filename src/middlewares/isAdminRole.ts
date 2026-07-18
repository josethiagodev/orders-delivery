import { Request, Response, NextFunction } from "express"
import prismaClient from "../prisma/index";

export const isAdminRole = async (
    req: Request, res: Response, next: NextFunction
): Promise<void> => {
    
    const user_id = req.user_id;

    if(!user_id) {
        res.status(401).json({
            error: "Usuário não tem permissão!"
        })
        return;
    }


    const user = await prismaClient.user.findFirst({
        where: {
            id: user_id
        }
    })

    if(!user) {
        res.status(401).json({
            error: "Usuário não tem permissão!"
        })
        return;
    }

    // Se qualquer usuário for diferente de ADMIN (role), não tem permissão para prosseguir.
    if(user.role !== "ADMIN") {
        res.status(401).json({
            error: "Usuário não tem permissão!"
        })
        return;
    }

    next();

}