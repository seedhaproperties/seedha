var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ListingTypeEnum } from '../../common/constants.js';
export class CreatePropertyDto {
    title;
    description;
    listingType;
    propertyType;
    price;
    priceLabel;
    location;
    city;
    area;
    bedrooms;
    bathrooms;
    furnishing;
    parking;
    deposit;
    maintenance;
    images;
    amenities;
    ownerName;
    ownerPhone;
}
__decorate([
    ApiProperty({ example: 'My 3 BHK Flat in Kondapur' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "title", void 0);
__decorate([
    ApiProperty({ example: 'Spacious apartment near metro station' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "description", void 0);
__decorate([
    ApiProperty({ enum: ListingTypeEnum, example: ListingTypeEnum.BUY }),
    IsEnum(ListingTypeEnum),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "listingType", void 0);
__decorate([
    ApiProperty({ example: 'apartment' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "propertyType", void 0);
__decorate([
    ApiProperty({ example: 12500000 }),
    IsNumber(),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "price", void 0);
__decorate([
    ApiPropertyOptional({ example: '₹1.25 Cr' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "priceLabel", void 0);
__decorate([
    ApiProperty({ example: 'Kondapur, Hitec City Road' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "location", void 0);
__decorate([
    ApiProperty({ example: 'Hyderabad' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "city", void 0);
__decorate([
    ApiProperty({ example: 1650 }),
    IsNumber(),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "area", void 0);
__decorate([
    ApiPropertyOptional({ example: 3 }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "bedrooms", void 0);
__decorate([
    ApiPropertyOptional({ example: 3 }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "bathrooms", void 0);
__decorate([
    ApiPropertyOptional({ example: 'semi-furnished' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "furnishing", void 0);
__decorate([
    ApiPropertyOptional({ example: true }),
    IsOptional(),
    IsBoolean(),
    __metadata("design:type", Boolean)
], CreatePropertyDto.prototype, "parking", void 0);
__decorate([
    ApiPropertyOptional({ example: 50000 }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "deposit", void 0);
__decorate([
    ApiPropertyOptional({ example: 3000 }),
    IsOptional(),
    IsNumber(),
    __metadata("design:type", Number)
], CreatePropertyDto.prototype, "maintenance", void 0);
__decorate([
    ApiPropertyOptional({ example: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'] }),
    IsOptional(),
    IsArray(),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "images", void 0);
__decorate([
    ApiPropertyOptional({ example: ['Power Backup', 'Lift', 'Security'] }),
    IsOptional(),
    IsArray(),
    __metadata("design:type", Array)
], CreatePropertyDto.prototype, "amenities", void 0);
__decorate([
    ApiProperty({ example: 'Rahul Sharma' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "ownerName", void 0);
__decorate([
    ApiProperty({ example: '+919876543210' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], CreatePropertyDto.prototype, "ownerPhone", void 0);
export class QueryPropertyDto {
    type;
    city;
    location;
    minPrice;
    maxPrice;
    bhk;
    propertyType;
}
__decorate([
    ApiPropertyOptional({ enum: ListingTypeEnum }),
    IsOptional(),
    __metadata("design:type", String)
], QueryPropertyDto.prototype, "type", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Hyderabad' }),
    IsOptional(),
    __metadata("design:type", String)
], QueryPropertyDto.prototype, "city", void 0);
__decorate([
    ApiPropertyOptional({ example: 'Madhapur' }),
    IsOptional(),
    __metadata("design:type", String)
], QueryPropertyDto.prototype, "location", void 0);
__decorate([
    ApiPropertyOptional({ example: 1000000 }),
    IsOptional(),
    __metadata("design:type", Number)
], QueryPropertyDto.prototype, "minPrice", void 0);
__decorate([
    ApiPropertyOptional({ example: 50000000 }),
    IsOptional(),
    __metadata("design:type", Number)
], QueryPropertyDto.prototype, "maxPrice", void 0);
__decorate([
    ApiPropertyOptional({ example: 3 }),
    IsOptional(),
    __metadata("design:type", Number)
], QueryPropertyDto.prototype, "bhk", void 0);
__decorate([
    ApiPropertyOptional({ example: 'apartment' }),
    IsOptional(),
    __metadata("design:type", String)
], QueryPropertyDto.prototype, "propertyType", void 0);
//# sourceMappingURL=properties.dto.js.map