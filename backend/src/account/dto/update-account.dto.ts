import { IsOptional, IsString } from 'class-validator';

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  clubId?: string;

  @IsOptional()
  @IsString()
  membershipNumber?: string;

  /** Optioneel: leeg laten om het bestaande wachtwoord ongewijzigd te laten. */
  @IsOptional()
  @IsString()
  password?: string;
}
