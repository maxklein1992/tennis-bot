import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitOnboardingDto {
  @IsString()
  @IsNotEmpty({ message: 'Volledige naam is verplicht.' })
  fullName!: string;

  /** UUID van de vereniging, gekozen uit de resultaten van GET /api/clubs/search. */
  @IsString()
  @IsNotEmpty({ message: 'Kies een vereniging.' })
  clubId!: string;

  /** Weergavenaam van de gekozen vereniging (denormalized, voor het dashboard). */
  @IsString()
  @IsNotEmpty({ message: 'Kies een vereniging.' })
  clubName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Bondsnummer is verplicht.' })
  membershipNumber!: string;

  @IsString()
  @IsNotEmpty({ message: 'Wachtwoord is verplicht.' })
  password!: string;
}
