import 'dotenv/config';
import fetch from 'node-fetch';
import { adminAuth, db } from './backend/src/config/firebase.js';
import { loginUser } from './backend/src/auth.js';

const BASE_URL = 'http://localhost:5000/api';

let testData = {
  editorToken: '',
  assigneeToken: '',
  editorUserId: '',
  assigneeUserId: '',
  taskId: '',
  notificationId: '',
};

// Helper to make API calls
async function apiCall(method, endpoint, body = null, token = '') {
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

// Setup: Create test users with different roles
async function setupUsers() {
  console.log('\n========== USER SETUP ==========\n');

  try {
    // Create Editor user
    console.log('1️⃣ Creating EDITOR user...');
    const editorEmail = `editor_${Date.now()}@kbc.co.ke`;
    const editorPassword = 'EditorPass1234!';

    const editorUser = await adminAuth.createUser({
      email: editorEmail,
      password: editorPassword,
      emailVerified: true,
    });

    testData.editorUserId = editorUser.uid;

    // Assign editor role
    await db.collection('users').doc(testData.editorUserId).set({
      email: editorEmail,
      role: 'editor',
      createdAt: new Date().toISOString(),
    });

    const editorLogin = await loginUser(editorEmail, editorPassword);
    testData.editorToken = editorLogin.idToken;

    console.log('✅ Editor created with role assigned:', testData.editorUserId);

    // Create Assignee user
    console.log('\n2️⃣ Creating ASSIGNEE user...');
    const assigneeEmail = `assignee_${Date.now()}@kbc.co.ke`;
    const assigneePassword = 'AssigneePass1234!';

    const assigneeUser = await adminAuth.createUser({
      email: assigneeEmail,
      password: assigneePassword,
      emailVerified: true,
    });

    testData.assigneeUserId = assigneeUser.uid;

    // Assign assignee role
    await db.collection('users').doc(testData.assigneeUserId).set({
      email: assigneeEmail,
      role: 'assignee',
      createdAt: new Date().toISOString(),
    });

    const assigneeLogin = await loginUser(assigneeEmail, assigneePassword);
    testData.assigneeToken = assigneeLogin.idToken;

    console.log('✅ Assignee created with role assigned:', testData.assigneeUserId);

  } catch (error) {
    console.error('❌ User setup failed:', error.message);
    return false;
  }

  return true;
}

// Test Task CRUD Operations
async function testTaskOperations() {
  console.log('\n========== TESTING TASK OPERATIONS ==========\n');

  try {
    // 1. CREATE TASK (as editor)
    console.log('1️⃣ Testing CREATE TASK...');
    const createRes = await apiCall('POST', '/tasks', {
      title: 'Q2 Report Generation',
      dueDate: '2026-05-20',
      assigneeId: testData.assigneeUserId,
      priority: 'High',
      status: 'Pending',
      description: 'Generate quarterly report for Q2',
    }, testData.editorToken);

    if (createRes.status === 201) {
      testData.taskId = createRes.data.data.id;
      console.log('✅ CREATE TASK PASSED');
      console.log('   Task ID:', testData.taskId);
      console.log('   Title:', createRes.data.data.title);
    } else {
      console.log('❌ CREATE TASK FAILED');
      console.log('   Status:', createRes.status);
      console.log('   Response:', createRes.data);
    }

    // 2. GET TASK BY ID
    console.log('\n2️⃣ Testing GET TASK BY ID...');
    const getRes = await apiCall('GET', `/tasks/${testData.taskId}`, null, testData.editorToken);

    if (getRes.status === 200) {
      console.log('✅ GET TASK BY ID PASSED');
      console.log('   Task:', getRes.data.data.title);
      console.log('   Status:', getRes.data.data.status);
    } else {
      console.log('❌ GET TASK BY ID FAILED');
    }

    // 3. UPDATE TASK (change status and priority)
    console.log('\n3️⃣ Testing UPDATE TASK...');
    const updateRes = await apiCall('PATCH', `/tasks/${testData.taskId}`, {
      status: 'In Progress',
      priority: 'Medium',
      title: 'Q2 Report Generation - In Progress',
    }, testData.editorToken);

    if (updateRes.status === 200) {
      console.log('✅ UPDATE TASK PASSED');
      console.log('   Updated status:', updateRes.data.data.status);
      console.log('   Updated priority:', updateRes.data.data.priority);
    } else {
      console.log('❌ UPDATE TASK FAILED');
      console.log('   Status:', updateRes.status);
    }

    // 4. GET ALL TASKS (as editor)
    console.log('\n4️⃣ Testing GET ALL TASKS...');
    const getAllRes = await apiCall('GET', '/tasks?page=1&limit=10', null, testData.editorToken);

    if (getAllRes.status === 200) {
      console.log('✅ GET ALL TASKS PASSED');
      console.log('   Total tasks:', getAllRes.data.total);
      console.log('   Tasks in page:', getAllRes.data.data.length);
    } else {
      console.log('❌ GET ALL TASKS FAILED');
    }

    // 5. GET MY TASKS (as assignee)
    console.log('\n5️⃣ Testing GET MY TASKS (as assignee)...');
    const getMyRes = await apiCall('GET', '/tasks/my-tasks?page=1&limit=10', null, testData.assigneeToken);

    if (getMyRes.status === 200) {
      console.log('✅ GET MY TASKS PASSED');
      console.log('   Total my tasks:', getMyRes.data.total);
      console.log('   My tasks in page:', getMyRes.data.data.length);
    } else {
      console.log('❌ GET MY TASKS FAILED');
    }

    // 6. DELETE TASK (only super_admin can delete, editor should fail)
    console.log('\n6️⃣ Testing DELETE TASK (as editor - should fail)...');
    const deleteFailRes = await apiCall('DELETE', `/tasks/${testData.taskId}`, null, testData.editorToken);

    if (deleteFailRes.status === 403) {
      console.log('✅ DELETE PREVENTED CORRECTLY (403)');
      console.log('   Response:', deleteFailRes.data.message);
    } else {
      console.log('⚠️  Expected 403 but got:', deleteFailRes.status);
    }

  } catch (error) {
    console.error('❌ TEST TASKS ERROR:', error);
  }
}

// Test Notification Operations
async function testNotificationOperations() {
  console.log('\n========== TESTING NOTIFICATION OPERATIONS ==========\n');

  try {
    // 1. CREATE NOTIFICATION
    console.log('1️⃣ Testing CREATE NOTIFICATION...');
    const createRes = await apiCall('POST', '/notifications', {
      userId: testData.assigneeUserId,
      message: 'New task assigned: Q2 Report',
      type: 'task',
    }, testData.assigneeToken);

    if (createRes.status === 201) {
      testData.notificationId = createRes.data.data.id;
      console.log('✅ CREATE NOTIFICATION PASSED');
      console.log('   Notification ID:', testData.notificationId);
      console.log('   Message:', createRes.data.data.message);
    } else {
      console.log('❌ CREATE NOTIFICATION FAILED');
    }

    // 2. GET NOTIFICATIONS
    console.log('\n2️⃣ Testing GET NOTIFICATIONS...');
    const getRes = await apiCall('GET', '/notifications?page=1&limit=10', null, testData.assigneeToken);

    if (getRes.status === 200) {
      console.log('✅ GET NOTIFICATIONS PASSED');
      console.log('   Total notifications:', getRes.data.total);
      console.log('   Notifications in page:', getRes.data.data.length);
    } else {
      console.log('❌ GET NOTIFICATIONS FAILED');
    }

    // 3. MARK NOTIFICATION AS READ
    console.log('\n3️⃣ Testing MARK NOTIFICATION AS READ...');
    const markReadRes = await apiCall('PATCH', `/notifications/${testData.notificationId}/read`, {}, testData.assigneeToken);

    if (markReadRes.status === 200) {
      console.log('✅ MARK AS READ PASSED');
      console.log('   Notification read status:', markReadRes.data.data?.read);
    } else {
      console.log('❌ MARK AS READ FAILED');
    }

    // 4. CREATE ANOTHER NOTIFICATION
    console.log('\n4️⃣ Creating another notification for bulk operations...');
    const createRes2 = await apiCall('POST', '/notifications', {
      userId: testData.assigneeUserId,
      message: 'Task updated: Q2 Report',
      type: 'task',
    }, testData.assigneeToken);

    if (createRes2.status === 201) {
      console.log('✅ Second notification created');
    }

    // 5. MARK ALL NOTIFICATIONS AS READ
    console.log('\n5️⃣ Testing MARK ALL NOTIFICATIONS AS READ...');
    const markAllRes = await apiCall('PATCH', '/notifications/read-all', {}, testData.assigneeToken);

    if (markAllRes.status === 200) {
      console.log('✅ MARK ALL AS READ PASSED');
    } else {
      console.log('❌ MARK ALL AS READ FAILED');
    }

    // 6. DELETE NOTIFICATION
    console.log('\n6️⃣ Testing DELETE NOTIFICATION...');
    const deleteRes = await apiCall('DELETE', `/notifications/${testData.notificationId}`, null, testData.assigneeToken);

    if (deleteRes.status === 200) {
      console.log('✅ DELETE NOTIFICATION PASSED');
    } else {
      console.log('❌ DELETE NOTIFICATION FAILED');
      console.log('   Status:', deleteRes.status);
    }

  } catch (error) {
    console.error('❌ TEST NOTIFICATIONS ERROR:', error);
  }
}

// Cleanup
async function cleanup() {
  console.log('\n========== CLEANUP ==========\n');

  try {
    if (testData.editorUserId) {
      // Delete from Firestore
      await db.collection('users').doc(testData.editorUserId).delete();
      // Delete from Auth
      await adminAuth.deleteUser(testData.editorUserId);
      console.log('🧹 Editor user deleted');
    }

    if (testData.assigneeUserId) {
      // Delete from Firestore
      await db.collection('users').doc(testData.assigneeUserId).delete();
      // Delete from Auth
      await adminAuth.deleteUser(testData.assigneeUserId);
      console.log('🧹 Assignee user deleted');
    }
  } catch (error) {
    console.error('❌ CLEANUP ERROR:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 COMPREHENSIVE BACKEND API TEST SUITE');
  console.log('Base URL:', BASE_URL);
  console.log('========================================\n');

  const setupSuccess = await setupUsers();
  if (!setupSuccess) {
    console.log('\n❌ Setup failed, cannot proceed');
    process.exit(1);
  }

  await testTaskOperations();
  await testNotificationOperations();
  
  await cleanup();

  console.log('\n✅ ALL TESTS COMPLETED!\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Test suite error:', err);
  process.exit(1);
});
