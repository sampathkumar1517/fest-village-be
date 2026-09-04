import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Organizer } from '../organizers/entities/organizer.entity';
import { Festival } from '../festival/entities/festival.entity';

/**
 * Seeds bootstrap organizer into `organizers` table from ADMIN_* env vars.
 */
@Injectable()
export class AdminSeedService implements OnModuleInit {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Organizer)
    private readonly organizerRepo: Repository<Organizer>,
    @InjectRepository(Festival)
    private readonly festivalRepository: Repository<Festival>,
  ) {}

  async onModuleInit() {
    const phone = this.config.get<string>('ADMIN_PHONE')?.trim();
    const password = this.config.get<string>('ADMIN_PASSWORD');
    const email =
      this.config.get<string>('ADMIN_EMAIL')?.trim() ||
      (phone ? `organizer_${phone}@festvillage.local` : null);
    const name =
      this.config.get<string>('ADMIN_FIRST_NAME')?.trim() || 'Organizer';

    if (!phone || !password) {
      this.logger.warn(
        'ADMIN_PHONE / ADMIN_PASSWORD not set — skipping organizer seed.',
      );
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    let organizer = await this.organizerRepo.findOne({
      where: { phoneNumber: phone },
    });

    if (organizer) {
      organizer.isActive = true;
      organizer.name = name;
      await this.organizerRepo.save(organizer);
      this.logger.log(
        `Organizer ensured for phone ${phone} (id=${organizer.id})`,
      );
    } else {
      const emailTaken = await this.organizerRepo.findOne({
        where: { email: email! },
      });
      organizer = this.organizerRepo.create({
        name,
        email: emailTaken
          ? `organizer_${phone}_${Date.now()}@festvillage.local`
          : email!,
        phoneNumber: phone,
        password: hashed,
        organizationName: 'Fest Village',
        isActive: true,
      });
      await this.organizerRepo.save(organizer);
      this.logger.log(
        `Organizer created for phone ${phone} (id=${organizer.id})`,
      );
    }

    const result = await this.festivalRepository.update(
      { organizerId: IsNull() },
      { organizerId: organizer.id },
    );
    if (result.affected) {
      this.logger.log(
        `Assigned ${result.affected} festival(s) to organizer ${organizer.id}`,
      );
    }
  }
}
