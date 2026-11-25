import { ConfigService } from '@nestjs/config';
export interface CloudinaryUploadResult {
    url: string;
    publicId: string;
    format?: string;
    width?: number;
    height?: number;
    bytes?: number;
}
export declare class CloudinaryService {
    private readonly configService;
    private readonly logger;
    private readonly isConfigured;
    private readonly cloudName;
    private readonly apiKey;
    private readonly apiSecret;
    private readonly defaultFolder;
    private readonly MAX_FILE_SIZE_BYTES;
    private readonly ALLOWED_MIME_TYPES;
    constructor(configService: ConfigService);
    validateImage(imageInput: string): void;
    uploadImage(imageInput: string, folder?: string): Promise<CloudinaryUploadResult>;
    uploadMultipleImages(images: string[], folder?: string): Promise<CloudinaryUploadResult[]>;
    deleteImage(publicId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteMultipleImages(publicIds: string[]): Promise<{
        success: boolean;
        deletedCount: number;
    }>;
}
