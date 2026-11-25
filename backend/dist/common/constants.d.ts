export declare enum UserRole {
    USER = "USER",
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    FIELD_AGENT = "FIELD_AGENT"
}
export declare enum ListingTypeEnum {
    BUY = "BUY",
    RENT = "RENT",
    COMMERCIAL = "COMMERCIAL"
}
export declare enum PropertyStatusEnum {
    DRAFT = "DRAFT",
    PENDING = "PENDING",
    SUBMITTED = "SUBMITTED",
    UNDER_REVIEW = "UNDER_REVIEW",
    VERIFICATION_IN_PROGRESS = "VERIFICATION_IN_PROGRESS",
    APPROVED = "APPROVED",
    PUBLISHED = "PUBLISHED",
    REJECTED = "REJECTED",
    NEEDS_CORRECTION = "NEEDS_CORRECTION",
    CLOSED = "CLOSED"
}
export declare const SERVICEABLE_LOCALITIES: {
    city: string;
    locality: string;
    pincode: string;
}[];
