import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm";

import { User } from "../entities/user.entity";

import { JwtPayload } from "../interfaces/jwt-payload.interface";


/* Cuando llegue una request con un JWT, así se extrae, así se valida y esto es lo que representa el usuario autenticado */
@Injectable()
export class JwtStrategy extends PassportStrategy ( Strategy ) {

    constructor(

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        configService: ConfigService

    ) {
        super({
            // configService la manera de extraer del .env
            secretOrKey: configService.get('JWT_SECRET') as string,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        });
    }

    async validate( payload: JwtPayload): Promise<User> {

        const { id } = payload;

        const user = await this.userRepository.findOneBy({id});

        if( !user )
            throw new UnauthorizedException('No esta autorizado')

        if( !user.isActive )
            throw new UnauthorizedException('Usuario esta inactivo, comunicate con un administrador')
        
        // Esto hace que request.user = user
        return user;
    }
}