import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const PRISMA_UNIQUE_CONSTRAINT_ERROR = 'P2002';

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

  /**
   * Maakt een nieuwe gebruiker aan, samen met een lege, gekoppelde Account-
   * rij (dezelfde lege defaults die vroeger via env-vars werden geseed) zodat
   * de gebruiker meteen door de onboardingflow kan om zijn eigen KNLTB-
   * gegevens te koppelen. Elke gebruiker krijgt zijn eigen Account — geen
   * gedeelde toegang tussen accounts.
   */
  async register(dto: RegisterDto): Promise<AuthResult> {
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    let user: { id: string; email: string };
    try {
      user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          account: { create: { clubId: '', membershipNumber: '', password: '' } },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === PRISMA_UNIQUE_CONSTRAINT_ERROR
      ) {
        throw new ConflictException('Er bestaat al een account met dit e-mailadres.');
      }
      throw error;
    }
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
