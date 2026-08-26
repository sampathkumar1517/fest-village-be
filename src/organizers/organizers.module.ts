import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Organizer } from './entities/organizer.entity';
import { OrganizersService } from './organizers.service';
import { OrganizersController } from './organizers.controller';
import { FestivalModule } from '../festival/festival.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organizer]),
    FestivalModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>('JWT_SECRET') ||
          'your-secret-key-change-in-production',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [OrganizersController],
  providers: [OrganizersService],
  exports: [OrganizersService],
})
export class OrganizersModule {}
