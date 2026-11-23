import { ListingTypeEnum } from '../../common/constants.js';
export declare class CreatePropertyDto {
    title: string;
    description: string;
    listingType: ListingTypeEnum;
    propertyType: string;
    price: number;
    priceLabel?: string;
    location: string;
    city: string;
    state?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
    fullAddress?: string;
    area: number;
    bedrooms?: number;
    bathrooms?: number;
    furnishing?: string;
    parking?: boolean;
    deposit?: number;
    maintenance?: number;
    images?: string[];
    amenities?: string[];
    ownerName: string;
    ownerPhone: string;
    ownerEmail?: string;
    facing?: string;
    floor?: string;
    totalFloors?: number;
    details?: any;
}
export declare class UploadPropertyImageDto {
    imageBase64?: string;
    imageUrl?: string;
}
export declare class QueryPropertyDto {
    type?: ListingTypeEnum;
    city?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    bhk?: number;
    propertyType?: string;
    radiusKm?: number;
    pincode?: string;
    userLat?: number;
    userLng?: number;
}
