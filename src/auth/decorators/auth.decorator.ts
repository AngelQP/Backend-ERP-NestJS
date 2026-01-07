
import { applyDecorators, UseGuards } from "@nestjs/common";
import { ValidRoles } from "../interfaces";
import { RoleProtected } from "./role-protected.decorator";
import { AuthGuard } from "@nestjs/passport";
import { UserRoleGuard } from "../guards/user-role/user-role.guard";


export function Auth(...roles: ValidRoles[]){

    // Reune varios decoradiones como RoleProtected y el UserRoleGuard
    return applyDecorators(
        RoleProtected( ...roles ),
        UseGuards( AuthGuard(), UserRoleGuard),

    );

}