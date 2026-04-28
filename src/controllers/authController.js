import { adminAuth as auth, db } from '../config/firebase.js';

// Register user with role - Super Admin only
export const createUser = async (req, res) => {
  const { email, password, full_name, role } = req.body;

  const validRoles = ['super_admin', 'editor', 'assignee'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be: super_admin, editor or assignee' });
  }

  if (!email || !password || !full_name || !role) {
    return res.status(400).json({ message: 'All fields are required: email, password, full_name, role' });
  }

  try {
    const userRecord = await auth.createUser({ email, password, displayName: full_name });

    await auth.setCustomUserClaims(userRecord.uid, { role });

    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      full_name,
      role,
      created_at: new Date().toISOString(),
      created_by: req.user.uid
    });

    res.status(201).json({ message: `User ${full_name} created successfully`, uid: userRecord.uid });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get logged in user profile
export const getMe = async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(userDoc.data());
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users - Super Admin only
export const getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection('users').orderBy('created_at').get();
    const users = snapshot.docs.map(doc => doc.data());
    res.json(users);
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user role - Super Admin only
export const updateUserRole = async (req, res) => {
  const { uid } = req.params;
  const { role } = req.body;

  const validRoles = ['super_admin', 'editor', 'assignee'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    await auth.setCustomUserClaims(uid, { role });
    await db.collection('users').doc(uid).update({ role, updated_at: new Date().toISOString() });
    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user - Super Admin only
export const deleteUser = async (req, res) => {
  const { uid } = req.params;

  try {
    await auth.deleteUser(uid);
    await db.collection('users').doc(uid).delete();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    await auth.generatePasswordResetLink(email);
    res.json({ message: 'Password reset email sent successfully' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to send reset email' });
  }
};