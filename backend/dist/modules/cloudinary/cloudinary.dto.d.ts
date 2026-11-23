export declare class UploadImageDto {
    imageBase64?: string;
    imageUrl?: string;
    folder?: string;
}
export declare class UploadMultipleImagesDto {
    images: string[];
    folder?: string;
}
export declare class DeleteImageDto {
    publicId: string;
}
