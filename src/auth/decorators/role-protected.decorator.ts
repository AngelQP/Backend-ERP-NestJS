import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from 'src/auth/interfaces';

export const META_ROLES = 'roles';

export const RoleProtected = (...args: ValidRoles[]) => {

    /* almacena en el Metadata una variable llamada META_ROLEs que contiene los roles especificados
     que luego seran leidos */
    return SetMetadata(META_ROLES, args);

};