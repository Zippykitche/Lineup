import fetch from 'node-fetch';
import 'dotenv/config';
import { adminAuth } from './src/config/firebase.js';
import { loginUser } from './src/auth.js';

const BASE_URL = 'https://lineup-backend-1nyx.onrender.com/api';

// Test data
let authToken = '';
let testTaskId = '';
let testNotificationId = '';
let testUserId = '';
let testUserEmail = '';
let testUserPassword = '';

// Helper function to make API calls
async function apiCall(method, endpoint, body = null, token = authToken) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, error: error.message };
  }
}

// Setup: Create test user and get token
async function setupAuth() {
  console.log('\n========== AUTHENTICATION SETUP ==========\n');

  try {
    testUserEmail = `test_${Date.now()}@kbc.co.ke`;
    testUserPassword = 'Test1234!';

    // Create test user
    console.log('1️⃣ Creating test user...');
    const user = await adminAuth.createUser({
      email: testUserEmail,
      password: testUserPassword,
      emailVerified: true,
    });

    testUserId = user.uid;
    console.log('✅ Test user created');
    console.log('   UID:', testUserId);
    console.log('   Email:', testUserEmail);

    // Login and get token
    console.log('\n2️⃣ Logging in to get token...');
    const loginResult = await loginUser(testUserEmail, testUserPassword);
    authToken = loginResult.idToken;

    console.log('✅ Authentication successful');
    console.log('   Token:', authToken.substring(0, 50) + '...');

    return true;
  } catch (err) {
    console.error('❌ AUTH SETUP FAILED:', err.message);
    return false;
  }
}

// Test Tasks Endpoints
async function testTasks() {
  console.log('\n========== TESTING TASKS ENDPOINTS ==========\n');

  try {
    // 1. Create a task
    console.log('1️⃣ Testing CREATE TASK...');
    const createTaskRes = await apiCall('POST', '/tasks', {
      title: 'Quarterly Report',
      dueDate: '2026-05-15',
      assigneeId: testUserId,
      priority: 'High',
      status: 'Pending',
      description: 'Prepare Q2 quarterly report',
    });

    if (createTaskRes.status === 201) {
      testTaskId = createTaskRes.data.data.id;
      console.log('✅ CREATE TASK PASSED');
      console.log('   Task ID:', testTaskId);
    } else {
      console.log('❌ CREATE TASK FAILED');
      console.log('   Status:', createTaskRes.status);
      console.log('   Response:', JSON.stringify(createTaskRes.data, null, 2));
    }

    // 2. Get all tasks
    console.log('\n2️⃣ Testing GET ALL TASKS...');
    const getAllTasksRes = await apiCall('GET', '/tasks?page=1&limit=10');

    if (getAllTasksRes.status === 200) {
      console.log('✅ GET ALL TASKS PASSED');
      console.log('   Total tasks:', getAllTasksRes.data.total);
      console.log('   Tasks returned:', getAllTasksRes.data.data.length);
    } else {
      console.log('❌ GET ALL TASKS FAILED');
      console.log('   Status:', getAllTasksRes.status);
    }

    // 3. Get task by ID
    if (testTaskId) {
      console.log('\n3️⃣ Testing GET TASK BY ID...');
      const getTaskRes = await apiCall('GET', `/tasks/${testTaskId}`);

      if (getTaskRes.status === 200) {
        console.log('✅ GET TASK BY ID PASSED');
        console.log('   Task title:', getTaskRes.data.data.title);
        console.log('   Task status:', getTaskRes.data.data.status);
      } else {
        console.log('❌ GET TASK BY ID FAILED');
        console.log('   Status:', getTaskRes.status);
      }

      // 4. Update task
      console.log('\n4️⃣ Testing UPDATE TASK...');
      const updateTaskRes = await apiCall('PATCH', `/tasks/${testTaskId}`, {
        status: 'In Progress',
        priority: 'Medium',
        title: 'Quarterly Report - Updated',
      });

      if (updateTaskRes.status === 200) {
        console.log('✅ UPDATE TASK PASSED');
        console.log('   Updated title:', updateTaskRes.data.data.title);
        console.log('   Updated status:', updateTaskRes.data.data.status);
      } else {
        console.log('❌ UPDATE TASK FAILED');
        console.log('   Status:', updateTaskRes.status);
      }
    }

    // 5. Get my tasks (for assignee)
    console.log('\n5️⃣ Testing GET MY TASKS...');
    const getMyTasksRes = await apiCall('GET', '/tasks/my-tasks?page=1&limit=10');

    if (getMyTasksRes.status === 200) {
      console.log('✅ GET MY TASKS PASSED');
      console.log('   My tasks:', getMyTasksRes.data.data.length);
    } else {
      console.log('❌ GET MY TASKS FAILED');
      console.log('   Status:', getMyTasksRes.status);
    }

  } catch (error) {
    console.error('❌ TEST TASKS ERROR:', error);
  }
}

// Test Notifications Endpoints
async function testNotifications() {
  console.log('\n========== TESTING NOTIFICATIONS ENDPOINTS ==========\n');

  try {
    // 1. Create a notification
    console.log('1️⃣ Testing CREATE NOTIFICATION...');
    const createNotifRes = await apiCall('POST', '/notifications', {
      userId: testUserId,
      message: 'Your task has been assigned',
      type: 'task',
    });

    if (createNotifRes.status === 201) {
      testNotificationId = createNotifRes.data.data.id;
      console.log('✅ CREATE NOTIFICATION PASSED');
      console.log('   Notification ID:', testNotificationId);
    } else {
      console.log('❌ CREATE NOTIFICATION FAILED');
      console.log('   Status:', createNotifRes.status);
    }

    // 2. Get my notifications
    console.log('\n2️⃣ Testing GET MY NOTIFICATIONS...');
    const getNotifRes = await apiCall('GET', '/notifications?page=1&limit=10');

    if (getNotifRes.status === 200) {
      console.log('✅ GET MY NOTIFICATIONS PASSED');
      console.log('   Total notifications:', getNotifRes.data.total);
      console.log('   Notifications returned:', getNotifRes.data.data.length);
    } else {
      console.log('❌ GET MY NOTIFICATIONS FAILED');
      console.log('   Status:', getNotifRes.status);
    }

    // 3. Mark notification as read
    if (testNotificationId) {
      console.log('\n3️⃣ Testing MARK AS READ...');
      const markReadRes = await apiCall('PATCH', `/notifications/${testNotificationId}/read`, {});

      if (markReadRes.status === 200) {
        console.log('✅ MARK AS READ PASSED');
      } else {
        console.log('❌ MARK AS READ FAILED');
        console.log('   Status:', markReadRes.status);
      }
    }

    // 4. Mark all as read
    console.log('\n4️⃣ Testing MARK ALL AS READ...');
    const markAllReadRes = await apiCall('PATCH', '/notifications/read-all', {});

    if (markAllReadRes.status === 200) {
      console.log('✅ MARK ALL AS READ PASSED');
    } else {
      console.log('❌ MARK ALL AS READ FAILED');
      console.log('   Status:', markAllReadRes.status);
    }

    // 5. Filter notifications by type
    console.log('\n5️⃣ Testing GET NOTIFICATIONS WITH FILTERS...');
    const filterNotifRes = await apiCall('GET', '/notifications?type=task&read=false');

    if (filterNotifRes.status === 200) {
      console.log('✅ GET NOTIFICATIONS WITH FILTERS PASSED');
      console.log('   Filtered notifications:', filterNotifRes.data.data.length);
    } else {
      console.log('❌ GET NOTIFICATIONS WITH FILTERS FAILED');
      console.log('   Status:', filterNotifRes.status);
    }

  } catch (error) {
    console.error('❌ TEST NOTIFICATIONS ERROR:', error);
  }
}

// Cleanup: Delete test user
async function cleanup() {
  console.log('\n========== CLEANUP ==========\n');

  try {
    if (testUserId) {
      await adminAuth.deleteUser(testUserId);
      console.log('🧹 Test user deleted');
    }
  } catch (err) {
    console.error('❌ CLEANUP ERROR:', err.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting API Tests...\n');
  console.log('Base URL:', BASE_URL);

  const authSuccess = await setupAuth();

  if (!authSuccess) {
    console.log('\n❌ Could not proceed without authentication');
    process.exit(1);
  }

  await testTasks();
  await testNotifications();

  await cleanup();

  console.log('\n✅ All tests completed!\n');
  process.exit(0);
}

// Run tests
runAllTests().catch(console.error);

