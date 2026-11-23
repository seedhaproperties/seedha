import { CloudinaryService } from './cloudinary.service.js';
import { UploadImageDto, UploadMultipleImagesDto, DeleteImageDto } from './cloudinary.dto.js';
export declare class CloudinaryController {
    private readonly cloudinaryService;
    constructor(cloudinaryService: CloudinaryService);
    uploadImage(dto: UploadImageDto): Promise<{
        success: boolean;
        message: string;
        url: string;
        publicId: string;
        format: string | undefined;
        width: number | undefined;
        height: number | undefined;
        bytes: number | undefined;
    }>;
    uploadMultipleImages(dto: UploadMultipleImagesDto): Promise<{
        success: boolean;
        count: number;
        images: import("./cloudinary.service.js").CloudinaryUploadResult[];
        urls: string[];
        publicIds: string[];
    }>;
    deleteImage(dto?: DeleteImageDto, queryPublicId?: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
