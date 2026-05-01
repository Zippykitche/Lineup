import { db } from '../config/firebase.js';

// CREATE TASK
export const createTask = async (taskData, userId) => {
  try {
    const newTask = {
      ...taskData,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('tasks').add(newTask);

    console.log('✅ TASK CREATED:', docRef.id);
    return { id: docRef.id, ...newTask };
  } catch (error) {
    console.error('❌ CREATE TASK ERROR:', error.message);
    return null;
  }
};

// GET ALL TASKS
export const getTasks = async (filters = {}) => {
  try {
    let query = db.collection('tasks');

    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }

    if (filters.assigneeId) {
      query = query.where('assigneeId', '==', filters.assigneeId);
    }

    if (filters.priority) {
      query = query.where('priority', '==', filters.priority);
    }

    // Sort is handled in frontend to avoid Firestore Index requirements
    const snapshot = await query.get();

    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return tasks;
  } catch (error) {
    console.error('❌ GET TASKS ERROR:', error.message);
    return [];
  }
};

// GET TASK BY ID
export const getTaskById = async (taskId) => {
  try {
    const doc = await db.collection('tasks').doc(taskId).get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error('❌ GET TASK BY ID ERROR:', error.message);
    return null;
  }
};

// UPDATE TASK
export const updateTask = async (taskId, updateData) => {
  try {
    const updatePayload = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    await db.collection('tasks').doc(taskId).update(updatePayload);

    console.log('✅ TASK UPDATED:', taskId);
    return { id: taskId, ...updatePayload };
  } catch (error) {
    console.error('❌ UPDATE TASK ERROR:', error.message);
    return null;
  }
};

// DELETE TASK
export const deleteTask = async (taskId) => {
  try {
    await db.collection('tasks').doc(taskId).delete();

    console.log('✅ TASK DELETED:', taskId);
    return true;
  } catch (error) {
    console.error('❌ DELETE TASK ERROR:', error.message);
    return false;
  }
};

// GET USER TASKS
export const getUserTasks = async (userId) => {
  try {
    const snapshot = await db
      .collection('tasks')
      .where('assigneeIds', 'array-contains', userId)
      .get();

    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return tasks;
  } catch (error) {
    console.error('❌ GET USER TASKS ERROR:', error.message);
    return [];
  }
};
