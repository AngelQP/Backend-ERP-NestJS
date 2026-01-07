import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { User } from "../entities/user.entity";



export const GetUser = createParamDecorator( 
    ( data: string, ctx: ExecutionContext ) => {

        const req = ctx.switchToHttp().getRequest();
        const user = req.user as User;

        if( !user ) 
            throw new UnauthorizedException('Usuario no encontrado (request)')

        return ( !data ) ? user : user[data];

    }
);