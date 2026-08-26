import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

/** Organizer only (create festivals, create festival admins). */
export function OrganizerOnly() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.ORGANIZER),
  );
}

/** Organizer or festival admin (scoped checks happen in services). */
export function StaffOnly() {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(UserRole.ORGANIZER, UserRole.ADMIN),
  );
}

/** @deprecated Prefer OrganizerOnly / StaffOnly + festival scope checks */
export function AdminOnly() {
  return StaffOnly();
}
