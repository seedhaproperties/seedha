import { PrismaClient, Role, ListingType, PropertyStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Seedha Properties database seed...');

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 1. Seed Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@seedhaproperties.com' },
    update: {},
    create: {
      name: 'Seedha Admin',
      email: 'admin@seedhaproperties.com',
      phone: '+919988776655',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  const userRahul = await prisma.user.upsert({
    where: { email: 'rahul@example.com' },
    update: {},
    create: {
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '+919876543210',
      passwordHash,
      role: Role.USER,
    },
  });

  const ownerKishore = await prisma.user.upsert({
    where: { email: 'kishore@example.com' },
    update: {},
    create: {
      name: 'Kishore Kothari',
      email: 'kishore@example.com',
      phone: '+919885011223',
      passwordHash,
      role: Role.OWNER,
    },
  });

  // 2. Seed Serviceable Locations
  const localities = [
    { city: 'Hyderabad', locality: 'Madhapur', pincode: '500081' },
    { city: 'Hyderabad', locality: 'Gachibowli', pincode: '500032' },
    { city: 'Hyderabad', locality: 'Kondapur', pincode: '500084' },
    { city: 'Hyderabad', locality: 'Hitec City', pincode: '500081' },
    { city: 'Hyderabad', locality: 'Banjara Hills', pincode: '500034' },
    { city: 'Hyderabad', locality: 'Jubilee Hills', pincode: '500033' },
    { city: 'Bengaluru', locality: 'Whitefield', pincode: '560066' },
  ];

  for (const loc of localities) {
    await prisma.serviceableLocation.create({
      data: {
        city: loc.city,
        locality: loc.locality,
        pincode: loc.pincode,
        active: true,
      },
    });
  }

  // 3. Seed Properties (Buy, Rent, Commercial)
  await prisma.property.createMany({
    data: [
      {
        id: 'prop-buy-1',
        title: 'Aura Sky Villas - 4 BHK Luxury Villa',
        description: 'Exclusive 4 BHK ultra luxury gated villa in prime Gachibowli with private garden, home automation, and clubhouse access.',
        listingType: ListingType.BUY,
        propertyType: 'villa',
        status: PropertyStatus.PUBLISHED,
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
          'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=800',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        ],
        amenities: ['Clubhouse', 'Private Pool', 'Gym', 'EV Charging', '24/7 Security'],
        verified: true,
        featured: true,
        ownerId: ownerKishore.id,
        ownerName: 'Venkatesh Rao',
        ownerPhone: '+919849012345',
        verifiedAt: new Date(),
        publishedAt: new Date(),
      },
      {
        id: 'prop-rent-1',
        title: 'Prestige High Fields - 3 BHK Premium Flat',
        description: 'Well-maintained 3 BHK flat ready to move in, fully furnished with split ACs, refrigerator, and high-speed Wi-Fi.',
        listingType: ListingType.RENT,
        propertyType: 'apartment',
        status: PropertyStatus.PUBLISHED,
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
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          'https://images.unsplash.com/photo-1560472355-536de3962603?w=800',
        ],
        amenities: ['Gymnasium', 'Supermarket on-premise', 'Covered Car Parking', 'Piped Gas'],
        verified: true,
        featured: true,
        ownerId: ownerKishore.id,
        ownerName: 'Kishore Kothari',
        ownerPhone: '+919885011223',
        verifiedAt: new Date(),
        publishedAt: new Date(),
      },
      {
        id: 'prop-comm-1',
        title: 'Cyber Towers Tech Park - Grade A Office Space',
        description: 'Plug-and-play modern corporate office space with 45 workstations, 2 conference rooms, server room, and cafeteria.',
        listingType: ListingType.COMMERCIAL,
        propertyType: 'office',
        status: PropertyStatus.PUBLISHED,
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
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
          'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
        ],
        amenities: ['100% DG Backup', 'High Speed Elevators', 'Access Control Security', 'Central AC'],
        verified: true,
        featured: true,
        ownerId: ownerKishore.id,
        ownerName: 'Hyderabad Commercial Ventures Ltd',
        ownerPhone: '+919900112233',
        verifiedAt: new Date(),
        publishedAt: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seedha Properties database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
