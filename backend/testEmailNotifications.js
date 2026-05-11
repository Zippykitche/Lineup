import axios from 'axios';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { loginUser } from './src/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = JSON.parse(readFileSync(join(__dirname, '../firebase-service-account.json'), 'utf8'));

const API_URL = 'http://localhost:5000/api';

// Initialize Firebase Admin or get existing app
let adminApp;
const existingApps = admin.apps;
if (existingApps && existingApps.length > 0) {
  adminApp = existingApps[0];
} else {
  adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://kbc-lineup.firebaseio.com',
  });
}

const db = admin.firestore();
const auth = admin.auth();

let testAdminToken = '';
let testUserToken = '';
let testUserId = '';
let testUserEmail = '';
let testAdminId = '';
let testAdminEmail = '';

// Create test user
const createTestUser = async () => {
  try {
    const timestamp = Date.now();
    testUserEmail = `test_user_${timestamp}@kbc.co.ke`;
    const password = 'TestPass123!';

    console.log('\n📝 Creating test user...');
    const userRecord = await auth.createUser({
      email: testUserEmail,
      password,
      emailVerified: true,
    });

    testUserId = userRecord.uid;
    console.log(`   ✅ Test user created: ${testUserEmail} (ID: ${testUserId})`);

    // Save user profile
    await db.collection('users').doc(testUserId).set({
      uid: testUserId,
      email: testUserEmail,
      role: 'assignee',
      name: 'Test User',
      createdAt: new Date().toISOString(),
    });

    // Get token
    const loginResult = await loginUser(testUserEmail, password);
    testUserToken = loginResult.idToken;
    console.log('   ✅ Test user token obtained');
    return true;
  } catch (err) {
    console.error('❌ CREATE TEST USER ERROR:', err.message);
    return false;
  }
};

// Create test admin
const createTestAdmin = async () => {
  try {
    const timestamp = Date.now();
    testAdminEmail = `test_admin_${timestamp}@kbc.co.ke`;
    const password = 'AdminPass123!';

    console.log('\n📝 Creating test admin...');
    const userRecord = await auth.createUser({
      email: testAdminEmail,
      password,
      emailVerified: true,
    });

    testAdminId = userRecord.uid;
    console.log(`   ✅ Test admin created: ${testAdminEmail} (ID: ${testAdminId})`);

    // Save admin profile
    await db.collection('users').doc(testAdminId).set({
      uid: testAdminId,
      email: testAdminEmail,
      role: 'editor',
      name: 'Test Admin',
      createdAt: new Date().toISOString(),
    });

    // Get token
    const loginResult = await loginUser(testAdminEmail, password);
    testAdminToken = loginResult.idToken;
    console.log('   ✅ Test admin token obtained');
    return true;
  } catch (err) {
    console.error('❌ CREATE TEST ADMIN ERROR:', err.message);
    return false;
  }
};

// Test email notification on event creation
const testEventEmailNotification = async () => {
  try {
    console.log('\n🎯 Testing Event Email Notification...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const eventData = {
      title: 'Team Meeting - Email Test',
      date: dateStr,
      startTime: '10:00',
      endTime: '11:00',
      description: 'This is a test event to verify email notifications',
      outputType: 'TV',
      attendeeIds: [testUserId],
      priority: 'high',
      category: 'General',
    };

    console.log('   📧 Creating event with attendee:', testUserEmail);
    const response = await axios.post(`${API_URL}/events`, eventData, {
      headers: { Authorization: `Bearer ${testAdminToken}` },
    });

    console.log('   ✅ Event created:', response.data.data.id);
    console.log('   📧 Email notification should have been sent to:', testUserEmail);
    return true;
  } catch (err) {
    console.error('❌ EVENT EMAIL NOTIFICATION TEST ERROR:', err.message);
    if (err.response?.data) {
      console.error('   Response:', err.response.data);
    }
    return false;
  }
};

// Test email notification on task creation
const testTaskEmailNotification = async () => {
  try {
    console.log('\n🎯 Testing Task Email Notification...');

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const taskData = {
      title: 'Complete Project Report - Email Test',
      dueDate: dueDateStr,
      assigneeIds: [testUserId],
      priority: 'High',
      description: 'This is a test task to verify email notifications',
      status: 'Pending',
    };

    console.log('   📧 Creating task with assignee:', testUserEmail);
    const response = await axios.post(`${API_URL}/tasks`, taskData, {
      headers: { Authorization: `Bearer ${testAdminToken}` },
    });

    console.log('   ✅ Task created:', response.data.data.id);
    console.log('   📧 Email notification should have been sent to:', testUserEmail);
    return true;
  } catch (err) {
    console.error('❌ TASK EMAIL NOTIFICATION TEST ERROR:', err.message);
    if (err.response?.data) {
      console.error('   Response:', err.response.data);
    }
    return false;
  }
};

// Test event with multiple attendees
const testEventWithMultipleAttendees = async () => {
  try {
    console.log('\n🎯 Testing Event with Multiple Attendees...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const eventData = {
      title: 'All Hands Meeting - Email Test',
      date: dateStr,
      startTime: '14:00',
      endTime: '15:00',
      description: 'Testing email notifications with multiple attendees',
      outputType: 'Radio',
      attendeeIds: [testUserId, testAdminId],
      priority: 'medium',
      category: 'Meeting',
    };

    console.log('   📧 Creating event with attendees:', [testUserEmail, testAdminEmail].join(', '));
    const response = await axios.post(`${API_URL}/events`, eventData, {
      headers: { Authorization: `Bearer ${testAdminToken}` },
    });

    console.log('   ✅ Event created:', response.data.data.id);
    console.log('   📧 Email notifications should have been sent to both attendees');
    return true;
  } catch (err) {
    console.error('❌ MULTIPLE ATTENDEES TEST ERROR:', err.message);
    if (err.response?.data) {
      console.error('   Response:', err.response.data);
    }
    return false;
  }
};

// Cleanup function
const cleanup = async () => {
  try {
    console.log('\n🧹 Cleaning up test data...');
    if (testUserId) {
      await auth.deleteUser(testUserId);
      await db.collection('users').doc(testUserId).delete();
      console.log('   ✅ Test user deleted');
    }
    if (testAdminId) {
      await auth.deleteUser(testAdminId);
      await db.collection('users').doc(testAdminId).delete();
      console.log('   ✅ Test admin deleted');
    }
  } catch (err) {
    console.error('❌ CLEANUP ERROR:', err.message);
  }
};

// Main test function
const runTests = async () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 EMAIL NOTIFICATION TESTS');
  console.log('═══════════════════════════════════════════════════════════');

  try {
    // Create test users
    if (!(await createTestUser())) {
      throw new Error('Failed to create test user');
    }

    if (!(await createTestAdmin())) {
      throw new Error('Failed to create test admin');
    }

    // Wait a moment for user profiles to be saved
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Run tests
    let passed = 0;
    let failed = 0;

    if (await testEventEmailNotification()) {
      passed++;
    } else {
      failed++;
    }

    if (await testTaskEmailNotification()) {
      passed++;
    } else {
      failed++;
    }

    if (await testEventWithMultipleAttendees()) {
      passed++;
    } else {
      failed++;
    }

    // Print results
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 TEST RESULTS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📧 Check your email accounts for notification messages:`);
    console.log(`   - ${testUserEmail}`);
    console.log(`   - ${testAdminEmail}`);
    console.log('\n⚠️  IMPORTANT: Update EMAIL_USER and EMAIL_PASSWORD in .env');
    console.log('   to enable actual email sending (currently using demo/test settings)');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('❌ TEST ERROR:', err.message);
  } finally {
    // Cleanup
    await cleanup();
    process.exit(0);
  }
};

// Run tests
runTests();
