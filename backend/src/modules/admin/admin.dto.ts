import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignFieldWorkDto {
  @ApiProperty({ example: 'Suresh Field Agent' })
  @IsString()
  @IsNotEmpty()
  fieldAgentName!: string;

  @ApiPropertyOptional({ example: 'Inspect property layout, electrical fittings, and owner identity deed' })
  @IsOptional()
  @IsString()
  fieldNotes?: string;
}

export class RejectItemDto {
  @ApiProperty({ example: 'Location is outside current service boundary or invalid property photos.' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class LocationCheckDecisionDto {
  @ApiProperty({ example: true, description: 'True if location matches serviceability rules' })
  @IsBoolean()
  matchesLocation!: boolean;

  @ApiPropertyOptional({ example: 'Location is not yet covered in our active service zone.' })
  @IsOptional()
  @IsString()
  rejectMessage?: string;
}

export class ContactOwnerDto {
  @ApiProperty({ example: 'Called owner Mr. Rao; scheduled site onboarding for Thursday 11 AM.' })
  @IsString()
  @IsNotEmpty()
  notes!: string;

  @ApiPropertyOptional({ example: 'Kavitha (Senior Relationship Manager)' })
  @IsOptional()
  @IsString()
  assignedStaff?: string;
}

export class PrepareAgreementDto {
  @ApiProperty({ example: 'Legal stamps affixed, e-signatures signed, final executed PDF ready.' })
  @IsString()
  @IsNotEmpty()
  preparationNotes!: string;

  @ApiPropertyOptional({ example: 'https://seedhaproperties.com/docs/executed_agr_17392.pdf' })
  @IsOptional()
  @IsString()
  documentUrl?: string;
}

export class CollectAndSendDigitalDto {
  @ApiProperty({ example: 'All Sub-Registrar records cross-checked, GHMC tax paid, no legal stay order found.' })
  @IsString()
  @IsNotEmpty()
  summary!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  ownershipVerified!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  legalDisputeClear!: boolean;
}
