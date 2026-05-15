interface AuthUserServiceProps {
    email: string;
    password: string;
}

export class AuthUserService {
    async execute({ email, password }: AuthUserServiceProps) {
        console.log({  email, password })

        return "Usuário LOGADO"
    }
}