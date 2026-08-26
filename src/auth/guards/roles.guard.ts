import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const allowed = requiredRoles.some((role) => user.role === role);
    if (!allowed) {
      throw new ForbiddenException(
        requiredRoles.includes(UserRole.ORGANIZER) &&
          requiredRoles.length === 1
          ? 'Only organizers can perform this action'
          : 'You do not have permission for this action',
      );
    }
    return true;
  }
}
