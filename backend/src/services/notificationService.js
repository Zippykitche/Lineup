import { db } from '../config/firebase.js';

// CREATE NOTIFICATION
export const createNotification = async (notificationData) => {
  try {
    const newNotification = {
      ...notificationData,
      createdAt: new Date().toISOString(),
      read: false,
    };

    const docRef = await db.collection('notifications').add(newNotification);

    console.log('✅ NOTIFICATION CREATED:', docRef.id);
    return { id: docRef.id, ...newNotification };
  } catch (error) {
    console.error('❌ CREATE NOTIFICATION ERROR:', error.message);
    return null;
  }
};

// GET NOTIFICATIONS FOR USER
export const getNotifications = async (userId, filters = {}) => {
  try {
    let query = db.collection('notifications').where('userId', '==', userId);

    if (filters.type) {
      query = query.where('type', '==', filters.type);
    }

    if (filters.read !== undefined) {
      query = query.where('read', '==', filters.read);
    }

    const snapshot = await query.get();

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return notifications;
  } catch (error) {
    console.error('❌ GET NOTIFICATIONS ERROR:', error.message);
    return [];
  }
};

// MARK NOTIFICATION AS READ
export const markNotificationAsRead = async (notificationId) => {
  try {
    await db.collection('notifications').doc(notificationId).update({
      read: true,
    });

    console.log('✅ NOTIFICATION MARKED AS READ:', notificationId);
    return true;
  } catch (error) {
    console.error('❌ MARK NOTIFICATION AS READ ERROR:', error.message);
    return false;
  }
};

// MARK ALL NOTIFICATIONS AS READ FOR USER
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const snapshot = await db
      .collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();

    const batch = db.batch();

    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();

    console.log('✅ ALL NOTIFICATIONS MARKED AS READ FOR USER:', userId);
    return true;
  } catch (error) {
    console.error('❌ MARK ALL NOTIFICATIONS AS READ ERROR:', error.message);
    return false;
  }
};

// DELETE NOTIFICATION
export const deleteNotification = async (notificationId) => {
  try {
    await db.collection('notifications').doc(notificationId).delete();

    console.log('✅ NOTIFICATION DELETED:', notificationId);
    return true;
  } catch (error) {
    console.error('❌ DELETE NOTIFICATION ERROR:', error.message);
    return false;
  }
};

// SEND NOTIFICATION TO MULTIPLE USERS
export const sendNotificationToUsers = async (userIds, notificationData) => {
  try {
    const batch = db.batch();

    userIds.forEach(userId => {
      const docRef = db.collection('notifications').doc();
      batch.set(docRef, {
        ...notificationData,
        userId,
        createdAt: new Date().toISOString(),
        read: false,
      });
    });

    await batch.commit();

    console.log('✅ NOTIFICATIONS SENT TO', userIds.length, 'USERS');
    return true;
  } catch (error) {
    console.error('❌ SEND NOTIFICATION TO USERS ERROR:', error.message);
    return false;
  }
};
