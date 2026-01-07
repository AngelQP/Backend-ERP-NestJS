import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
/** Leer metadata definida por decoradores */
import { Reflector } from '@nestjs/core';
import { User } from 'src/auth/entities/user.entity';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';
import { ValidRoles } from 'src/auth/interfaces';

/** Este guard autoriza (no autentica) una request según los roles del usuario. */
@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector
  ){}


  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    // Lee los roles definidos @RoleProtected('admin', 'seller') y devuelve ['admin', 'seller'] segun sea el caso, previamente el decorator @RoleProtected los inserta en el metada META_ROLES
    const validRoles: ValidRoles [] = this.reflector.get(META_ROLES, context.getHandler());

    if ( !validRoles ) return true;
    if ( validRoles.length === 0 ) return true;

    // Obtener el usuario 
    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    // Consulta si existe el usuario
    if ( !user )
      throw new UnauthorizedException('Usuario no encontrado')

    // Valida el rol del usuario con los que se definio el @RoleProtected
    for (const role of user.roles) {
      if( validRoles.includes(role) )
        return true;
    }

    // De no retornar nada indica que necesia el rol necesario para realizar la acción
    throw new ForbiddenException(`Usuario necesita el rol de ${ validRoles } `);

  }
}