import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AccountModule } from './account/account.module';
import { SchedulesModule } from './schedules/schedules.module';
import { BookingModule } from './booking/booking.module';
import { MembersModule } from './members/members.module';

@Module({
  imports: [
    PrismaModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api/{*path}'],
    }),
    AccountModule,
    SchedulesModule,
    BookingModule,
    MembersModule,
  ],
})
export class AppModule {}
