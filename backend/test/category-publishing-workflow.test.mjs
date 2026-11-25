import { io } from '../../admin-dashboard/node_modules/socket.io-client/build/esm/index.js';

const BASE_URL = 'http://localhost:4000';
const WS_URL = 'http://localhost:4000';

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function api(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer mock_admin_token_2026',
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${options.method || 'GET'} ${endpoint} failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function runTests() {
  console.log('================================================================');
  console.log('🚀 SEEDHA PROPERTIES — CATEGORY-BASED PUBLISHING E2E VERIFICATION');
  console.log('================================================================\n');

  // 1. Establish Socket.IO connections (Admin and User)
  console.log('🔌 Connecting Socket.IO clients...');
  const adminSocket = io(WS_URL, {
    transports: ['websocket', 'polling'],
    auth: { token: 'admin_token', role: 'ADMIN', userId: 'admin_audit' },
  });

  const userSocket = io(WS_URL, {
    transports: ['websocket', 'polling'],
    auth: { token: 'user_token', role: 'USER', userId: 'usr_test_publisher' },
  });

  await new Promise((resolve) => {
    let connected = 0;
    const check = () => {
      connected++;
      if (connected === 2) resolve();
    };
    adminSocket.on('connect', () => {
      adminSocket.emit('user:identify', { userId: 'admin_audit', isAdmin: true });
      check();
    });
    userSocket.on('connect', () => {
      userSocket.emit('user:identify', { userId: 'usr_test_publisher' });
      check();
    });
  });

  console.log('✅ Socket.IO connected: Admin socket ID:', adminSocket.id, '| User socket ID:', userSocket.id);

  const receivedEvents = {
    propertyCreated: [],
    statusUpdated: [],
  };

  adminSocket.on('property:created', (evt) => {
    receivedEvents.propertyCreated.push(evt);
  });
  adminSocket.on('property:created:broadcast', (evt) => {
    receivedEvents.propertyCreated.push(evt);
  });
  userSocket.on('property:status-updated', (evt) => {
    receivedEvents.statusUpdated.push(evt);
  });
  adminSocket.on('property:status-updated', (evt) => {
    receivedEvents.statusUpdated.push(evt);
  });

  // Track created property IDs for cleanup
  const createdPropertyIds = [];

  try {
    // -------------------------------------------------------------
    // TEST 1: BUY PROPERTY
    // -------------------------------------------------------------
    console.log('\n--- TEST 1: BUY CATEGORY PUBLISHING WORKFLOW ---');
    const buyPropPayload = {
      title: `E2E Verified Luxury Villa Buy ${Date.now()}`,
      description: 'Exclusive 4 BHK independent duplex villa for sale',
      listingType: 'BUY',
      propertyType: 'Villa',
      price: 18500000,
      priceLabel: '₹1.85 Cr',
      location: 'Jubilee Hills',
      city: 'Hyderabad',
      bedrooms: 4,
      bathrooms: 4,
      area: 3200,
      ownerName: 'Vikram Seth',
      ownerPhone: '9848011223',
      ownerEmail: 'vikram.seth@example.com',
      details: {
        category: 'flat_building',
        bhk: '4',
        furnishing: 'furnished',
      },
    };

    const createdBuy = await api('/properties', {
      method: 'POST',
      body: JSON.stringify(buyPropPayload),
    });
    createdPropertyIds.push(createdBuy.id);
    console.log(`1.1 Property submitted under BUY: ID=${createdBuy.id}, Status=${createdBuy.status}`);

    if (createdBuy.status !== 'PENDING' && createdBuy.status !== 'SUBMITTED') {
      throw new Error(`Expected initial status PENDING/SUBMITTED, got ${createdBuy.status}`);
    }

    // Verify it is NOT visible in public Buy properties before approval
    await wait(300);
    const publicBuyBefore = await api('/properties?type=buy');
    const listBuyBefore = publicBuyBefore.properties || publicBuyBefore;
    if (listBuyBefore.some((p) => p.id === createdBuy.id)) {
      throw new Error(`Unapproved BUY property leaked into public listings before approval!`);
    }
    console.log('1.2 Verified: Unapproved BUY property is hidden from public listings.');

    // Admin approves property
    console.log('1.3 Admin approves property...');
    const approveBuyRes = await api(`/admin/properties/${createdBuy.id}/verify-and-publish`, { method: 'POST' });
    console.log(`    Approve response: ${approveBuyRes.message}, Status=${approveBuyRes.property.status}`);

    await wait(500);

    // Verify it IS now returned in public BUY properties
    const publicBuyAfter = await api('/properties?type=buy');
    const listBuyAfter = publicBuyAfter.properties || publicBuyAfter;
    const foundInBuy = listBuyAfter.find((p) => p.id === createdBuy.id);
    if (!foundInBuy) {
      throw new Error(`Approved BUY property does not appear in public BUY listing!`);
    }
    console.log('1.4 Verified: Approved BUY property now appears in Buy Properties listing.');

    // Strict Isolation: Verify it does NOT appear in Rent, Commercial, PG, Flatmates
    const publicRent = await api('/properties?type=rent');
    const listRent = publicRent.properties || publicRent;
    if (listRent.some((p) => p.id === createdBuy.id)) {
      throw new Error(`BUY property leaked into RENT listing!`);
    }

    const publicComm = await api('/properties?type=commercial');
    const listComm = publicComm.properties || publicComm;
    if (listComm.some((p) => p.id === createdBuy.id)) {
      throw new Error(`BUY property leaked into COMMERCIAL listing!`);
    }

    const publicPg = await api('/properties?type=pg');
    const listPg = publicPg.properties || publicPg;
    if (listPg.some((p) => p.id === createdBuy.id)) {
      throw new Error(`BUY property leaked into PG listing!`);
    }

    const publicFm = await api('/properties?type=flatmate');
    const listFm = publicFm.properties || publicFm;
    if (listFm.some((p) => p.id === createdBuy.id)) {
      throw new Error(`BUY property leaked into FLATMATE listing!`);
    }
    console.log('1.5 Strict Isolation Confirmed: Property appears ONLY in BUY, NOT in Rent, Commercial, PG, or Flatmate.');

    // -------------------------------------------------------------
    // TEST 2: RENT PROPERTY
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: RENT CATEGORY PUBLISHING WORKFLOW ---');
    const rentPropPayload = {
      title: `E2E High-Rise Gated Rent Home ${Date.now()}`,
      description: '3 BHK semi-furnished luxury apartment for rent',
      listingType: 'RENT',
      propertyType: 'Apartment',
      price: 45000,
      priceLabel: '₹45,000/mo',
      location: 'Kondapur',
      city: 'Hyderabad',
      bedrooms: 3,
      bathrooms: 3,
      area: 1850,
      ownerName: 'Sanjay Gupta',
      ownerPhone: '9848022334',
      ownerEmail: 'sanjay.gupta@example.com',
      details: {
        category: 'rent',
        bhk: '3',
      },
    };

    const createdRent = await api('/properties', {
      method: 'POST',
      body: JSON.stringify(rentPropPayload),
    });
    createdPropertyIds.push(createdRent.id);
    console.log(`2.1 Property submitted under RENT: ID=${createdRent.id}, Status=${createdRent.status}`);

    // Admin approves
    await api(`/admin/properties/${createdRent.id}/verify-and-publish`, { method: 'POST' });
    await wait(400);

    // Verify it appears in RENT and NOT in Buy, Commercial, PG, Flatmate
    const rentCheck = await api('/properties?type=rent');
    const listRentCheck = rentCheck.properties || rentCheck;
    if (!listRentCheck.some((p) => p.id === createdRent.id)) {
      throw new Error(`Approved RENT property does not appear in public RENT listing!`);
    }

    const buyLeakCheck = await api('/properties?type=buy');
    if ((buyLeakCheck.properties || buyLeakCheck).some((p) => p.id === createdRent.id)) {
      throw new Error(`RENT property leaked into BUY listing!`);
    }
    console.log('2.2 Verified: Approved RENT property appears in Rent Homes listing with strict category isolation.');

    // -------------------------------------------------------------
    // TEST 3: COMMERCIAL PROPERTY
    // -------------------------------------------------------------
    console.log('\n--- TEST 3: COMMERCIAL CATEGORY PUBLISHING WORKFLOW ---');
    const commPropPayload = {
      title: `E2E Grade-A Corporate Office Space ${Date.now()}`,
      description: 'Plug-and-play modern corporate office space for lease or sale',
      listingType: 'COMMERCIAL',
      propertyType: 'Office',
      price: 125000,
      priceLabel: '₹1,25,000/mo',
      location: 'HITEC City',
      city: 'Hyderabad',
      area: 2500,
      ownerName: 'Nexus Tech Parks',
      ownerPhone: '9848033445',
      ownerEmail: 'leasing@nexus.com',
      details: {
        category: 'commercial',
        commercialPurpose: 'rent',
      },
    };

    const createdComm = await api('/properties', {
      method: 'POST',
      body: JSON.stringify(commPropPayload),
    });
    createdPropertyIds.push(createdComm.id);
    console.log(`3.1 Property submitted under COMMERCIAL: ID=${createdComm.id}, Status=${createdComm.status}`);

    // Admin approves
    await api(`/admin/properties/${createdComm.id}/verify-and-publish`, { method: 'POST' });
    await wait(400);

    const commCheck = await api('/properties?type=commercial');
    const listCommCheck = commCheck.properties || commCheck;
    if (!listCommCheck.some((p) => p.id === createdComm.id)) {
      throw new Error(`Approved COMMERCIAL property does not appear in Commercial Spaces listing!`);
    }

    const buyCommLeak = await api('/properties?type=buy');
    if ((buyCommLeak.properties || buyCommLeak).some((p) => p.id === createdComm.id)) {
      throw new Error(`COMMERCIAL property leaked into residential BUY listing!`);
    }
    console.log('3.2 Verified: Approved COMMERCIAL property appears in Commercial Spaces listing with strict isolation.');

    // -------------------------------------------------------------
    // TEST 4: PG & HOSTEL PROPERTY
    // -------------------------------------------------------------
    console.log('\n--- TEST 4: PG & HOSTEL CATEGORY PUBLISHING WORKFLOW ---');
    const pgPropPayload = {
      title: `E2E Elite Stays Boys PG ${Date.now()}`,
      description: 'Fully furnished Boys PG with 3-times food, high-speed WiFi, laundry',
      listingType: 'RENT',
      propertyType: 'PG / Hostel',
      price: 9500,
      priceLabel: '₹9,500/mo',
      location: 'Madhapur',
      city: 'Hyderabad',
      bedrooms: 1,
      bathrooms: 1,
      area: 240,
      ownerName: 'Ramesh Naidu',
      ownerPhone: '9848044556',
      ownerEmail: 'ramesh.pg@example.com',
      details: {
        category: 'pg_hostel',
        pgAccommodationType: 'Boys PG',
        pgFoodAvailable: true,
      },
    };

    const createdPg = await api('/properties', {
      method: 'POST',
      body: JSON.stringify(pgPropPayload),
    });
    createdPropertyIds.push(createdPg.id);
    console.log(`4.1 Property submitted under PG & HOSTEL: ID=${createdPg.id}`);

    // Admin approves
    await api(`/admin/properties/${createdPg.id}/verify-and-publish`, { method: 'POST' });
    await wait(400);

    const pgCheck = await api('/properties?type=pg');
    const listPgCheck = pgCheck.properties || pgCheck;
    if (!listPgCheck.some((p) => p.id === createdPg.id)) {
      throw new Error(`Approved PG property does not appear in PG & Hostel listing!`);
    }

    const rentPgLeak = await api('/properties?type=rent');
    if ((rentPgLeak.properties || rentPgLeak).some((p) => p.id === createdPg.id)) {
      throw new Error(`PG property leaked into regular RENT HOMES listing!`);
    }
    console.log('4.2 Verified: Approved PG property appears in PG & Hostels listing and does NOT leak into Rent Homes.');

    // -------------------------------------------------------------
    // TEST 5: FLATMATES PROPERTY
    // -------------------------------------------------------------
    console.log('\n--- TEST 5: FLATMATES CATEGORY PUBLISHING WORKFLOW ---');
    const fmPropPayload = {
      title: `E2E Private Room for Flatmate in Gachibowli ${Date.now()}`,
      description: 'Single private AC bedroom in 3 BHK high-rise society for working professional',
      listingType: 'RENT',
      propertyType: 'Flatmate',
      price: 13500,
      priceLabel: '₹13,500/mo',
      location: 'Gachibowli',
      city: 'Hyderabad',
      bedrooms: 1,
      bathrooms: 1,
      area: 350,
      ownerName: 'Aditya Verma',
      ownerPhone: '9848055667',
      ownerEmail: 'aditya.v@example.com',
      details: {
        category: 'rent',
        flatmateName: 'Aditya Verma',
        roomType: 'Private room',
      },
    };

    const createdFm = await api('/properties', {
      method: 'POST',
      body: JSON.stringify(fmPropPayload),
    });
    createdPropertyIds.push(createdFm.id);
    console.log(`5.1 Property submitted under FLATMATES: ID=${createdFm.id}`);

    // Admin approves
    await api(`/admin/properties/${createdFm.id}/verify-and-publish`, { method: 'POST' });
    await wait(400);

    const fmCheck = await api('/properties?type=flatmate');
    const listFmCheck = fmCheck.properties || fmCheck;
    if (!listFmCheck.some((p) => p.id === createdFm.id)) {
      throw new Error(`Approved Flatmate property does not appear in Flatmates listing!`);
    }
    console.log('5.2 Verified: Approved Flatmate property appears in Flatmates listing.');

    // -------------------------------------------------------------
    // TEST 6: REJECTION HANDLING
    // -------------------------------------------------------------
    console.log('\n--- TEST 6: REJECTION WORKFLOW ---');
    const rejectPropPayload = {
      title: `E2E Rejected Property Test ${Date.now()}`,
      description: 'Invalid listing test',
      listingType: 'BUY',
      propertyType: 'Apartment',
      price: 5000000,
      area: 1200,
      location: 'Secunderabad',
      city: 'Hyderabad',
      ownerName: 'Test Owner',
      ownerPhone: '9848066778',
    };

    const createdReject = await api('/properties', {
      method: 'POST',
      body: JSON.stringify(rejectPropPayload),
    });
    createdPropertyIds.push(createdReject.id);
    console.log(`6.1 Property submitted: ID=${createdReject.id}`);

    // Admin rejects with reason
    const rejectionReason = 'Incomplete registration documents and unverified ownership deed';
    const rejectRes = await api(`/admin/properties/${createdReject.id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason: rejectionReason }),
    });
    console.log(`6.2 Admin rejected property: ${rejectRes.message}`);

    await wait(400);

    // Verify it is NOT in ANY category
    for (const cat of ['buy', 'rent', 'commercial', 'pg', 'flatmate']) {
      const catRes = await api(`/properties?type=${cat}`);
      const list = catRes.properties || catRes;
      if (list.some((p) => p.id === createdReject.id)) {
        throw new Error(`Rejected property found in public ${cat.toUpperCase()} listing!`);
      }
    }
    console.log('6.3 Verified: Rejected property is strictly hidden across ALL public category listings.');

    // -------------------------------------------------------------
    // TEST 7: REAL-TIME SOCKET.IO EVENT VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- TEST 7: REAL-TIME SOCKET.IO SYNCHRONIZATION ---');
    console.log(`Captured ${receivedEvents.propertyCreated.length} property:created events`);
    console.log(`Captured ${receivedEvents.statusUpdated.length} property:status-updated events`);

    if (receivedEvents.propertyCreated.length === 0) {
      throw new Error('Socket.IO failed to emit property:created event to admin client!');
    }
    if (receivedEvents.statusUpdated.length === 0) {
      throw new Error('Socket.IO failed to emit property:status-updated event on admin approval!');
    }

    const lastStatusUpdate = receivedEvents.statusUpdated[receivedEvents.statusUpdated.length - 1];
    console.log('7.1 Sample Status Update Event:');
    console.log(`    PropertyId: ${lastStatusUpdate.propertyId}`);
    console.log(`    Status: ${lastStatusUpdate.status}`);
    console.log(`    Verified: ${lastStatusUpdate.verified}`);
    console.log(`    Title: ${lastStatusUpdate.title}`);
    console.log('7.2 Verified: Socket.IO delivers real-time notifications for both submission and status updates.');

    console.log('\n================================================================');
    console.log('🎉 ALL 7 CATEGORY PUBLISHING E2E TESTS PASSED SUCCESSFULLY!');
    console.log('================================================================\n');
  } finally {
    // Cleanup sockets
    adminSocket.disconnect();
    userSocket.disconnect();

    // Cleanup test properties
    console.log('🧹 Cleaning up test properties...');
    for (const id of createdPropertyIds) {
      try {
        await api(`/properties/${id}`, { method: 'DELETE' });
      } catch (err) {
        // Silently continue cleanup
      }
    }
    console.log('✅ Cleanup completed.');
  }
}

runTests().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err.message);
  process.exit(1);
});
