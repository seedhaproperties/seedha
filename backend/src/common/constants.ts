export enum UserRole {
  USER = 'USER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  FIELD_AGENT = 'FIELD_AGENT',
}

export enum ListingTypeEnum {
  BUY = 'BUY',
  RENT = 'RENT',
  COMMERCIAL = 'COMMERCIAL',
}

export enum PropertyStatusEnum {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  VERIFICATION_IN_PROGRESS = 'VERIFICATION_IN_PROGRESS',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  NEEDS_CORRECTION = 'NEEDS_CORRECTION',
}

export const SERVICEABLE_LOCALITIES = [
  { city: 'Hyderabad', locality: 'Madhapur', pincode: '500081' },
  { city: 'Hyderabad', locality: 'Gachibowli', pincode: '500032' },
  { city: 'Hyderabad', locality: 'Kondapur', pincode: '500084' },
  { city: 'Hyderabad', locality: 'Hitec City', pincode: '500081' },
  { city: 'Hyderabad', locality: 'Banjara Hills', pincode: '500034' },
  { city: 'Hyderabad', locality: 'Jubilee Hills', pincode: '500033' },
  { city: 'Hyderabad', locality: 'Kukatpally', pincode: '500072' },
  { city: 'Hyderabad', locality: 'Miyapur', pincode: '500049' },
  { city: 'Bengaluru', locality: 'Whitefield', pincode: '560066' },
  { city: 'Bengaluru', locality: 'Indiranagar', pincode: '560038' },
];
