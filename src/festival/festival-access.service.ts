import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Festival } from '../festival/entities/festival.entity';
import { FestivalAdmin } from '../festival/entities/festival-admin.entity';
import { User, UserRole } from '../users/entities/user.entity';

export type AuthPrincipal = {
  id: number;
  role?: string;
  type?: string;
};

@Injectable()
export class FestivalAccessService {
  constructor(
    @InjectRepository(Festival)
    private readonly festivalRepo: Repository<Festival>,
    @InjectRepository(FestivalAdmin)
    private readonly festivalAdminRepo: Repository<FestivalAdmin>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  isOrganizer(user: AuthPrincipal) {
    return user?.type === 'organizer' || user?.role === UserRole.ORGANIZER;
  }

  isFestivalAdmin(user: AuthPrincipal) {
    return user?.type !== 'organizer' && user?.role === UserRole.ADMIN;
  }

  async getManageableFestivalIds(user: AuthPrincipal): Promise<number[]> {
    if (!user?.id) return [];

    if (this.isOrganizer(user)) {
      const owned = await this.festivalRepo.find({
        where: { organizerId: user.id },
        select: ['id'],
      });
      return owned.map((f) => f.id);
    }

    if (this.isFestivalAdmin(user)) {
      const rows = await this.festivalAdminRepo.find({
        where: { userId: user.id },
        select: ['festivalId'],
      });
      return rows.map((r) => r.festivalId);
    }

    return [];
  }

  async canManageFestival(
    user: AuthPrincipal,
    festivalId: number,
  ): Promise<boolean> {
    if (!user?.id || !festivalId) return false;

    if (this.isOrganizer(user)) {
      const fest = await this.festivalRepo.findOne({
        where: { id: festivalId, organizerId: user.id },
      });
      return Boolean(fest);
    }

    if (this.isFestivalAdmin(user)) {
      const row = await this.festivalAdminRepo.findOne({
        where: { festivalId, userId: user.id },
      });
      return Boolean(row);
    }

    return false;
  }

  async assertCanManageFestival(user: AuthPrincipal, festivalId: number) {
    const ok = await this.canManageFestival(user, festivalId);
    if (!ok) {
      throw new ForbiddenException(
        'You can only manage festivals assigned to you',
      );
    }
  }

  async assertIsOrganizer(user: AuthPrincipal) {
    if (!this.isOrganizer(user)) {
      throw new ForbiddenException('Only organizers can perform this action');
    }
  }

  async assertOwnsFestival(user: AuthPrincipal, festivalId: number) {
    await this.assertIsOrganizer(user);
    const fest = await this.festivalRepo.findOne({ where: { id: festivalId } });
    if (!fest) throw new NotFoundException('Festival not found');
    if (fest.organizerId !== user.id) {
      throw new ForbiddenException(
        'You can only manage admins for your own festivals',
      );
    }
    return fest;
  }

  async createFestivalAdmin(
    organizer: AuthPrincipal,
    payload: {
      festivalId: number;
      firstName: string;
      email: string;
      phoneNumber: string;
      password: string;
      address?: string;
      houseNumber?: string;
    },
  ) {
    await this.assertOwnsFestival(organizer, payload.festivalId);

    const existingPhone = await this.userRepo.findOne({
      where: { phoneNumber: payload.phoneNumber },
    });
    if (existingPhone) {
      const already = await this.festivalAdminRepo.findOne({
        where: {
          festivalId: payload.festivalId,
          userId: existingPhone.id,
        },
      });
      if (already) {
        throw new ConflictException(
          'This user is already an admin for this festival',
        );
      }
      if (existingPhone.role === UserRole.ORGANIZER) {
        throw new ConflictException(
          'Cannot assign an organizer account as festival admin',
        );
      }
      existingPhone.role = UserRole.ADMIN;
      if (payload.password) {
        existingPhone.password = await bcrypt.hash(payload.password, 10);
      }
      existingPhone.isActive = true;
      await this.userRepo.save(existingPhone);
      const assignment = await this.festivalAdminRepo.save(
        this.festivalAdminRepo.create({
          festivalId: payload.festivalId,
          userId: existingPhone.id,
          assignedByUserId: null,
        }),
      );
      const { password: _, ...safe } = existingPhone;
      return {
        success: true,
        message: 'Existing user assigned as festival admin',
        data: { user: safe, assignment },
      };
    }

    const emailTaken = await this.userRepo.findOne({
      where: { email: payload.email },
    });
    if (emailTaken) {
      throw new ConflictException('User with this email already exists');
    }

    const nameParts = payload.firstName.trim().split(/\s+/);
    const lastName =
      nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Admin';

    const user = this.userRepo.create({
      firstName: payload.firstName.trim(),
      lastName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      password: await bcrypt.hash(payload.password, 10),
      address: payload.address ?? 'NA',
      houseNumber: payload.houseNumber ?? 'NA',
      role: UserRole.ADMIN,
      isActive: true,
    });
    await this.userRepo.save(user);

    const assignment = await this.festivalAdminRepo.save(
      this.festivalAdminRepo.create({
        festivalId: payload.festivalId,
        userId: user.id,
        assignedByUserId: null,
      }),
    );

    const { password: _, ...safe } = user;
    return {
      success: true,
      message: 'Festival admin created successfully',
      data: { user: safe, assignment },
    };
  }

  async listFestivalAdmins(organizer: AuthPrincipal, festivalId: number) {
    await this.assertOwnsFestival(organizer, festivalId);
    const rows = await this.festivalAdminRepo.find({
      where: { festivalId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return {
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        festivalId: r.festivalId,
        assignedAt: r.createdAt,
        user: r.user
          ? {
              id: r.user.id,
              firstName: r.user.firstName,
              lastName: r.user.lastName,
              email: r.user.email,
              phoneNumber: r.user.phoneNumber,
              role: r.user.role,
              isActive: r.user.isActive,
            }
          : null,
      })),
    };
  }

  async removeFestivalAdmin(organizer: AuthPrincipal, assignmentId: number) {
    const row = await this.festivalAdminRepo.findOne({
      where: { id: assignmentId },
    });
    if (!row) throw new NotFoundException('Assignment not found');
    await this.assertOwnsFestival(organizer, row.festivalId);
    await this.festivalAdminRepo.delete(row.id);

    const remaining = await this.festivalAdminRepo.count({
      where: { userId: row.userId },
    });
    if (remaining === 0) {
      await this.userRepo.update(row.userId, { role: UserRole.MEMBER });
    }

    return { success: true, message: 'Festival admin removed' };
  }

  async getAccessSummary(user: AuthPrincipal) {
    const festivalIds = await this.getManageableFestivalIds(user);
    return {
      role: user.role,
      type: user.type || (user.role === 'organizer' ? 'organizer' : 'user'),
      festivalIds,
      isOrganizer: this.isOrganizer(user),
      isFestivalAdmin: this.isFestivalAdmin(user),
    };
  }

  async festivalsByIds(ids: number[]) {
    if (!ids.length) return [];
    return this.festivalRepo.find({ where: { id: In(ids) } });
  }
}
