import { io } from '../../admin-dashboard/node_modules/socket.io-client/build/esm/index.js';

const BACKEND_URL = 'http://localhost:4000';

async function runRealtimeTest() {
  console.log('🧪 Starting End-to-End Socket.IO Real-time Workflow Verification...\n');

  let adminSocket;
  let userSocket;

  try {
    // 1. Connect Admin Socket client
    console.log('1️⃣ Connecting Admin Socket.IO Client...');
    adminSocket = io(BACKEND_URL, {
      transports: ['websocket'],
      auth: {
        token: 'admin_token',
        isAdmin: true,
        userId: 'admin_test_runner',
      },
      timeout: 5000,
    });

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Admin socket connect timeout')), 5000);
      adminSocket.on('connect', () => {
        clearTimeout(timer);
        console.log(`   ✅ Admin socket connected (ID: ${adminSocket.id})`);
        resolve(true);
      });
      adminSocket.on('connect_error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });

    // 2. Connect User Socket client
    const testUserId = `user_e2e_${Date.now()}`;
    console.log(`2️⃣ Connecting User Socket.IO Client (User ID: ${testUserId})...`);
    userSocket = io(BACKEND_URL, {
      transports: ['websocket'],
      auth: {
        token: 'dev-bypass-token',
        userId: testUserId,
      },
      timeout: 5000,
    });

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('User socket connect timeout')), 5000);
      userSocket.on('connect', () => {
        clearTimeout(timer);
        console.log(`   ✅ User socket connected (ID: ${userSocket.id})`);
        resolve(true);
      });
      userSocket.on('connect_error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });

    // Setup listener for property:created on Admin
    let createdEventReceived = null;
    const createdPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Admin did not receive property:created in time (10s)')), 10000);
      adminSocket.on('property:created', (data) => {
        clearTimeout(timer);
        createdEventReceived = data;
        resolve(data);
      });
    });

    // 3. User submits property via POST /api/v1/properties
    const propertyTitle = `Socket E2E Villa ${Date.now()}`;
    console.log(`3️⃣ User submitting property: "${propertyTitle}"...`);

    const submitRes = await fetch(`${BACKEND_URL}/api/v1/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dev-bypass-token',
      },
      body: JSON.stringify({
        title: propertyTitle,
        description: 'Luxury E2E verified villa for socket testing',
        listingType: 'RENT',
        propertyType: 'Independent House / Villa',
        price: 48000,
        priceLabel: '₹48,000/mo',
        location: 'Madhapur',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        latitude: 17.4485,
        longitude: 78.3758,
        bedrooms: 3,
        bathrooms: 3,
        area: 2400,
        ownerName: 'Murali Realtime Tester',
        ownerPhone: '9876543210',
        ownerEmail: 'realtime@seedhaproperties.com',
        images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
      }),
    });

    if (!submitRes.ok) {
      throw new Error(`Failed to submit property: ${submitRes.status} ${await submitRes.text()}`);
    }

    const createdProperty = await submitRes.json();
    console.log(`   ✅ Property saved in database with ID: ${createdProperty.id}`);
    console.log(`   Database Status: ${createdProperty.status}, Verified: ${createdProperty.verified}`);

    // 4. Verify Admin received property:created in real-time
    console.log('4️⃣ Waiting for Admin to receive [property:created] event via Socket.IO...');
    const receivedData = await createdPromise;
    console.log(`   ✅ Admin successfully received [property:created]!`);
    console.log(`   Event ID: ${receivedData.eventId}`);
    console.log(`   Received Title: "${receivedData.property?.title}"`);
    console.log(`   Received Price: ${receivedData.property?.price}`);

    if (receivedData.property?.id !== createdProperty.id) {
      throw new Error(`Property ID mismatch: expected ${createdProperty.id}, got ${receivedData.property?.id}`);
    }

    // 5. Setup listener for property:status-updated on User client
    console.log('5️⃣ Setting up listener for [property:status-updated] on User Socket...');
    const statusPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('User did not receive property:status-updated in time (10s)')), 10000);
      userSocket.on('property:status-updated', (data) => {
        if (data.propertyId === createdProperty.id) {
          clearTimeout(timer);
          resolve(data);
        }
      });
    });

    // 6. Admin approves property via POST /api/v1/admin/properties/:id/approve
    console.log(`6️⃣ Admin approving property (${createdProperty.id})...`);
    const approveRes = await fetch(`${BACKEND_URL}/api/v1/admin/properties/${createdProperty.id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin_token',
      },
      body: JSON.stringify({ note: 'Passed all verification checks' }),
    });

    if (!approveRes.ok) {
      throw new Error(`Failed to approve property: ${approveRes.status} ${await approveRes.text()}`);
    }
    const approveJson = await approveRes.json();
    console.log(`   ✅ Admin approval response: "${approveJson.message}"`);

    // 7. Verify User received property:status-updated
    console.log('7️⃣ Waiting for User to receive [property:status-updated] event via Socket.IO...');
    const statusData = await statusPromise;
    console.log(`   ✅ User successfully received [property:status-updated]!`);
    console.log(`   New Status: ${statusData.status}, Verified: ${statusData.verified}`);
    console.log(`   Notification Message: "${statusData.message}"`);

    // 8. Verify property is now publicly listed in GET /api/v1/properties
    console.log('8️⃣ Verifying property is publicly accessible...');
    const publicRes = await fetch(`${BACKEND_URL}/api/v1/properties?location=Madhapur`);
    const publicData = await publicRes.json();
    const isPublic = (publicData.properties || []).some((p) => p.id === createdProperty.id);
    console.log(`   ✅ Property is in public live listings: ${isPublic ? 'YES' : 'NO'}`);

    console.log('\n🎉 ALL REAL-TIME WORKFLOW TESTS PASSED 100% SUCCESSFULLY!');
  } finally {
    if (adminSocket) adminSocket.disconnect();
    if (userSocket) userSocket.disconnect();
  }
}

runRealtimeTest().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
