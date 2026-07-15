import prismaClient from "../../prisma/index"
import cloudinary from "../../config/cloudinary"

import type { UploadApiResponse } from "cloudinary"

interface CreateProductServiceProps {
    name: string;
    price: number;
    description: string;
    category_id: string;
    imageBuffer: Buffer;
    imageName: string;
}

export class CreateProductService {
    async execute({
        name,
        price,
        description,
        category_id,
        imageBuffer,
        imageName
    }: CreateProductServiceProps) {

        // Pegando ID vindo do Prisma e passando ao 'categoryExists'
        const categoryExists = await prismaClient.category.findFirst({
            where: {
                id: category_id
            }
        })

        // Se a categoria (id) não existir, mostrar erro
        if(!categoryExists) {
            throw new Error("Categoria não encontrada!")
        }


        // Enviar pro Cloudinary salvar a imagem e pegar URL
        let bannerURL = "";

        try {
            const result = await new Promise<UploadApiResponse>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({
                        folder: "products",
                        resource_type: "image",
                        public_id: `${Date.now()}-${imageName.split(".")[0]}`,
                    },
                    (error, result) => {
                        if (error) return reject(error)
                        resolve(result!)
                    })

                uploadStream.end(imageBuffer)
            });

            if (!result?.secure_url) {
                throw new Error("Upload concluído sem URL da imagem")
            }

            bannerURL = result.secure_url;
        } catch (error) {
            throw new Error("Erro ao fazer upload da imagem!")
        }


        // Salvar um novo produto no banco (URL da imagem e dados)
        const product = await prismaClient.product.create({
            data: {
                name,
                price: Number(price),
                description,
                category_id,
                banner: bannerURL,
            },
            select: {
                id: true,
                name: true,
                price: true,
                description: true,
                category_id: true,
                banner: true,
                createdAt: true,
            }
        })

        return product;

    }
}
