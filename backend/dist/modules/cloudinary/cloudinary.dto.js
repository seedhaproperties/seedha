var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsString, IsOptional, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class UploadImageDto {
    imageBase64;
    imageUrl;
    folder;
}
__decorate([
    ApiPropertyOptional({ example: 'data:image/jpeg;base64,...' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UploadImageDto.prototype, "imageBase64", void 0);
__decorate([
    ApiPropertyOptional({ example: 'https://example.com/photo.jpg' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UploadImageDto.prototype, "imageUrl", void 0);
__decorate([
    ApiPropertyOptional({ example: 'seedha-properties/properties' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UploadImageDto.prototype, "folder", void 0);
export class UploadMultipleImagesDto {
    images;
    folder;
}
__decorate([
    ApiProperty({ example: ['data:image/jpeg;base64,...', 'https://example.com/photo2.jpg'] }),
    IsArray(),
    IsNotEmpty(),
    __metadata("design:type", Array)
], UploadMultipleImagesDto.prototype, "images", void 0);
__decorate([
    ApiPropertyOptional({ example: 'seedha-properties/properties' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], UploadMultipleImagesDto.prototype, "folder", void 0);
export class DeleteImageDto {
    publicId;
}
__decorate([
    ApiProperty({ example: 'seedha-properties/properties/img_123456' }),
    IsString(),
    IsNotEmpty(),
    __metadata("design:type", String)
], DeleteImageDto.prototype, "publicId", void 0);
//# sourceMappingURL=cloudinary.dto.js.map