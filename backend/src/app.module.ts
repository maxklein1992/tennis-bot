import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AccountModule } from './account/account.module';
import { SchedulesModule } from './schedules/schedules.module';
import { BookingModule } from './booking/booking.module';
import { MembersModule } from './members/members.module';
import { ClubsModule } from './clubs/clubs.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { StatsModule } from './stats/stats.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    PrismaModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api/{*path}'],
    }),
    AuthModule,
    AccountModule,
    SchedulesModule,
    BookingModule,
    MembersModule,
    ClubsModule,
    OnboardingModule,
    StatsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
