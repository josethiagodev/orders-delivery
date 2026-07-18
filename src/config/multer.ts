import multer from "multer"

// Usar 'memoryStorage' para manter o arquivo em memória e enviar direto ao 'Cloudinary'
export default {
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 4 * 1024 * 1024 // 4MB
    },
    fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
        const allowedFiles = ["image/jpeg", "image/jpg", "image/png"];

        if( allowedFiles.includes(file.mimetype) ) {
            cb(null, true)
        } else {
            cb( new Error("Formato de arquivo inválido, use apenas JPEG, JPG, PNG.") );
        }
    }
}