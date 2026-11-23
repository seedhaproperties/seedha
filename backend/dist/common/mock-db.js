import * as fs from 'fs';
import * as path from 'path';
import { UserRole, ListingTypeEnum, PropertyStatusEnum } from './constants.js';
class InMemoryStore {
    getPersistPaths() {
        const cwd = process.cwd();
        const candidatePaths = [
            path.resolve(cwd, 'seedha-mock-store.json'),
            path.resolve(cwd, 'backend', 'seedha-mock-store.json'),
            path.resolve(cwd, '..', 'seedha-mock-store.json'),
        ];
        return Array.from(new Set(candidatePaths));
    }
    loadFromDisk() {
        try {
            const paths = this.getPersistPaths();
            for (const p of paths) {
                if (fs.existsSync(p)) {
                    const raw = fs.readFileSync(p, 'utf8');
                    const data = JSON.parse(raw);
                    if (data.users?.length)
                        this.users = data.users;
                    if (data.properties?.length)
                        this.properties = data.properties;
                    if (data.siteVisits?.length)
                        this.siteVisits = data.siteVisits;
                    if (data.propertyManagementRequests?.length)
                        this.propertyManagementRequests = data.propertyManagementRequests;
                    if (data.homeLoanRequests?.length)
                        this.homeLoanRequests = data.homeLoanRequests;
                    if (data.rentalAgreementOrders?.length)
                        this.rentalAgreementOrders = data.rentalAgreementOrders;
                    if (data.ownerBackgroundChecks?.length)
                        this.ownerBackgroundChecks = data.ownerBackgroundChecks;
                    if (data.teamMembers?.length)
                        this.teamMembers = data.teamMembers;
                    break;
                }
            }
        }
        catch {
        }
    }
    saveToDisk() {
        try {
            const data = {
                users: this.users,
                properties: this.properties,
                siteVisits: this.siteVisits,
                propertyManagementRequests: this.propertyManagementRequests,
                homeLoanRequests: this.homeLoanRequests,
                rentalAgreementOrders: this.rentalAgreementOrders,
                ownerBackgroundChecks: this.ownerBackgroundChecks,
                teamMembers: this.teamMembers,
            };
            const jsonStr = JSON.stringify(data, null, 2);
            for (const p of this.getPersistPaths()) {
                try {
                    fs.writeFileSync(p, jsonStr, 'utf8');
                }
                catch {
                }
            }
        }
        catch {
        }
    }
    teamMembers = [
        {
            id: 'tm-1',
            name: 'Kavitha Reddy',
            role: 'Field Agent',
            phone: '+91 98490 12345',
            zone: 'HITEC City & Madhapur',
            activeTasks: 4,
            completedThisWeek: 12,
            avgTurnaroundHrs: 2.8,
            initials: 'KR',
        },
        {
            id: 'tm-2',
            name: 'Rajesh Varma',
            role: 'Verification Exec',
            phone: '+91 98480 23456',
            zone: 'Gachibowli & Financial District',
            activeTasks: 3,
            completedThisWeek: 9,
            avgTurnaroundHrs: 3.4,
            initials: 'RV',
        },
        {
            id: 'tm-3',
            name: 'Siddharth Rao',
            role: 'Loan Advisor',
            phone: '+91 98480 34567',
            zone: 'Central Hyderabad',
            activeTasks: 5,
            completedThisWeek: 15,
            avgTurnaroundHrs: 4.1,
            initials: 'SR',
        },
        {
            id: 'tm-4',
            name: 'Pooja Sharma',
            role: 'Legal Ops',
            phone: '+91 98480 45678',
            zone: 'Secunderabad & Jubilee Hills',
            activeTasks: 2,
            completedThisWeek: 18,
            avgTurnaroundHrs: 1.9,
            initials: 'PS',
        },
    ];
    users = [
        {
            id: 'usr_admin',
            name: 'Seedha Admin',
            email: 'admin@seedhaproperties.com',
            phone: '+919988776655',
            passwordHash: '$2b$10$epNzTj0hF5vG80X0Z3Qd7eZ1O5cO3Zf4i6zP7C5V8B8C9D0E1F2G3',
            role: UserRole.ADMIN,
            avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces&auto=format',
            city: 'Hyderabad',
            createdAt: new Date().toISOString(),
        },
        {
            id: 'usr_rahul',
            name: 'Rahul Google User',
            email: 'rahul.google.test@gmail.com',
            phone: '+91 98490 63269',
            passwordHash: '$2b$10$epNzTj0hF5vG80X0Z3Qd7eZ1O5cO3Zf4i6zP7C5V8B8C9D0E1F2G3',
            role: UserRole.USER,
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces&auto=format',
            dob: '1990-05-15',
            gender: 'Male',
            userRole: 'Owner',
            streetAddress: 'Plot 42, Road No. 36, Jubilee Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500033',
            alternatePhone: null,
            alternateEmail: null,
            createdAt: new Date().toISOString(),
        },
        {
            id: 'usr_dev_praghnesh',
            name: 'Rahul Google User',
            email: 'rahul.google.test@gmail.com',
            phone: '+91 98490 63269',
            passwordHash: '$2b$10$epNzTj0hF5vG80X0Z3Qd7eZ1O5cO3Zf4i6zP7C5V8B8C9D0E1F2G3',
            role: UserRole.USER,
            avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces&auto=format',
            dob: '1990-05-15',
            gender: 'Male',
            userRole: 'Owner',
            streetAddress: 'Plot 42, Road No. 36, Jubilee Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500033',
            alternatePhone: null,
            alternateEmail: null,
            createdAt: new Date().toISOString(),
        },
    ];
    constructor() {
        this.loadFromDisk();
    }
    properties = [
        {
            id: 'prop-buy-1',
            title: 'Aura Sky Villas - 4 BHK Luxury Villa',
            description: 'Exclusive 4 BHK ultra luxury gated villa in prime Gachibowli with private garden, home automation, and clubhouse access.',
            listingType: ListingTypeEnum.BUY,
            propertyType: 'villa',
            status: PropertyStatusEnum.PUBLISHED,
            price: 38500000,
            priceLabel: '₹3.85 Cr',
            location: 'Financial District, Gachibowli',
            city: 'Hyderabad',
            area: 4200,
            bedrooms: 4,
            bathrooms: 5,
            furnishing: 'fully-furnished',
            parking: true,
            facing: 'East',
            floor: 'Ground + 2',
            totalFloors: 3,
            images: [
                'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=800&h=500&fit=crop&auto=format',
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop&auto=format',
            ],
            amenities: ['Clubhouse', 'Private Pool', 'Gym', 'EV Charging', '24/7 Security'],
            verified: true,
            featured: true,
            ownerName: 'Venkatesh Rao',
            ownerPhone: '+919849012345',
            verifiedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: 'prop-buy-2',
            title: 'Green Meadows Residency - 3 BHK Flat',
            description: 'Spacious 3 BHK apartment with panoramic skyline views, premium modular kitchen, and Vaastu compliant design.',
            listingType: ListingTypeEnum.BUY,
            propertyType: 'apartment',
            status: PropertyStatusEnum.PUBLISHED,
            price: 14500000,
            priceLabel: '₹1.45 Cr',
            location: 'Madhapur',
            city: 'Hyderabad',
            area: 1950,
            bedrooms: 3,
            bathrooms: 3,
            furnishing: 'semi-furnished',
            parking: true,
            facing: 'North-East',
            floor: '9th',
            totalFloors: 14,
            images: [
                'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop&auto=format',
                'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=500&fit=crop&auto=format',
            ],
            amenities: ['Swimming Pool', 'Children Park', 'Power Backup', 'Badminton Court'],
            verified: true,
            featured: true,
            ownerName: 'Sunita Reddy',
            ownerPhone: '+919948098765',
            verifiedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: 'prop-rent-1',
            title: 'Prestige High Fields - 3 BHK Premium Flat',
            description: 'Well-maintained 3 BHK flat ready to move in, fully furnished with split ACs, refrigerator, and high-speed Wi-Fi.',
            listingType: ListingTypeEnum.RENT,
            propertyType: 'apartment',
            status: PropertyStatusEnum.PUBLISHED,
            price: 52000,
            priceLabel: '₹52,000/mo',
            location: 'Nanakramguda, Financial District',
            city: 'Hyderabad',
            area: 1820,
            bedrooms: 3,
            bathrooms: 3,
            furnishing: 'fully-furnished',
            parking: true,
            deposit: 150000,
            maintenance: 4500,
            facing: 'North',
            floor: '12th',
            totalFloors: 25,
            images: [
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop&auto=format',
                'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=500&fit=crop&auto=format',
            ],
            amenities: ['Gymnasium', 'Supermarket on-premise', 'Covered Car Parking', 'Piped Gas'],
            verified: true,
            featured: true,
            ownerName: 'Kishore Kothari',
            ownerPhone: '+919885011223',
            verifiedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: 'prop-comm-1',
            title: 'Cyber Towers Tech Park - Grade A Office Space',
            description: 'Plug-and-play modern corporate office space with 45 workstations, 2 conference rooms, server room, and cafeteria.',
            listingType: ListingTypeEnum.COMMERCIAL,
            propertyType: 'office',
            status: PropertyStatusEnum.PUBLISHED,
            price: 210000,
            priceLabel: '₹2.10 Lakh/mo',
            location: 'Hitec City, Madhapur',
            city: 'Hyderabad',
            area: 3200,
            bedrooms: 0,
            bathrooms: 4,
            furnishing: 'fully-furnished',
            parking: true,
            deposit: 1260000,
            maintenance: 18000,
            facing: 'East',
            floor: '4th',
            totalFloors: 10,
            images: [
                'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop&auto=format',
                'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=500&fit=crop&auto=format',
            ],
            amenities: ['100% DG Backup', 'High Speed Elevators', 'Access Control Security', 'Central AC'],
            verified: true,
            featured: true,
            ownerName: 'Hyderabad Commercial Ventures Ltd',
            ownerPhone: '+919900112233',
            verifiedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];
    siteVisits = [];
    propertyManagementRequests = [];
    homeLoanRequests = [];
    rentalAgreementOrders = [];
    ownerBackgroundChecks = [];
}
export const mockDb = new InMemoryStore();
//# sourceMappingURL=mock-db.js.map