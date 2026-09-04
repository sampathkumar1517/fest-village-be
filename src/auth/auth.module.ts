import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AdminSeedService } from './admin-seed.service';
import { UsersModule } from '../users/users.module';
import { FestivalModule } from '../festival/festival.module';
import { OrganizersModule } from '../organizers/organizers.module';
import { Organizer } from '../organizers/entities/organizer.entity';
import { Festival } from '../festival/entities/festival.entity';

@Module({
  imports: [
    UsersModule,
    FestivalModule,
    OrganizersModule,
    PassportModule,
    TypeOrmModule.forFeature([Organizer, Festival]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: (() => {
          const secret = config.get<string>('JWT_SECRET');
          if (!secret) {
            throw new Error('JWT_SECRET is required');
          }
          return secret;
        })(),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AdminSeedService],
  exports: [AuthService],
})
export class AuthModule {}
