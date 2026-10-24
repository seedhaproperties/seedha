import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitPropertyManagementDto {
  @ApiProperty({ example: 'Venkatesh Rao' })
  @IsString()
  @IsNotEmpty()
  ownerName!: string;

  @ApiProperty({ example: '+919849012345' })
  @IsString()
  @IsNotEmpty()
  ownerPhone!: string;

  @ApiPropertyOptional({ example: 'venkatesh@example.com' })
  @IsOptional()
  @IsString()
  ownerEmail?: string;

  @ApiProperty({ example: 'Flat 402, Block B, 3 BHK, 1850 sq.ft' })
  @IsString()
  @IsNotEmpty()
  flatDetails!: string;

  @ApiProperty({ example: 'Aparna CyberLife, Nallagandla' })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ example: 'Hyderabad' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'Gachibowli' })
  @IsString()
  @IsNotEmpty()
  locality!: string;

  @ApiProperty({ example: 'Full Property Management (Tenant Finding, Rent Collection, Repairs)' })
  @IsString()
  @IsNotEmpty()
  serviceRequested!: string;
}
