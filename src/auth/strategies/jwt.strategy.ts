import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { OrganizersService } from '../../organizers/organizers.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private organizersService: OrganizersService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'your-secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
    if (payload?.type === 'organizer') {
      const organizer = await this.organizersService.findById(payload.sub);
      if (!organizer || !organizer.isActive) {
        throw new UnauthorizedException();
      }
      return this.organizersService.toAuthPrincipal(organizer);
    }

    const user = await this.usersService.GetUserById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }
    return { ...user, type: 'user' };
  }
}
