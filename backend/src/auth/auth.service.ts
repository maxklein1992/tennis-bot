import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResult {
  accessToken: string;
  user: AuthUser;
}

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /** true zolang er nog geen dashboard-gebruiker is aangemaakt (eerste-keer setup). */
  async registrationAvailable(): Promise<boolean> {
    const count = await this.prisma.user.count();
    return count === 0;
  }

  /**
   * Registratie is alleen mogelijk zolang er nog geen gebruiker bestaat. Het
   * dashboard is voor persoonlijk gebruik; na de eerste account moet iedereen
   * inloggen in plaats van een nieuw account aan te kunnen maken.
   */
  async register(dto: RegisterDto): Promise<AuthResult> {
    if (!(await this.registrationAvailable())) {
      throw new ConflictException('Er bestaat al een account, log in.');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { email: dto.email.toLowerCase(), passwordHash },
    });
    return this.buildResult(user.id, user.email);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      throw new UnauthorizedException('Ongeldige inloggegevens.');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Ongeldige inloggegevens.');
    }
    return this.buildResult(user.id, user.email);
  }

  async getUser(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    return { id: user.id, email: user.email };
  }

  private buildResult(id: string, email: string): AuthResult {
    return {
      accessToken: this.jwtService.sign({ sub: id, email }),
      user: { id, email },
    };
  }
}
