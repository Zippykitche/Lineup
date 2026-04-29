import { adminAuth as auth, db } from '../config/firebase.js';
import { auth as clientAuth } from '../config/firebaseClient.js';
import { sendPasswordResetEmail } from 'firebase/auth';

const normalizeUser = (userDoc) => {
  if (!userDoc) return null;

  return {
    id: userDoc.uid || userDoc.id || null,
    fullName: userDoc.fullName || userDoc.full_name || userDoc.displayName || null,
    workEmail: userDoc.workEmail || userDoc.email || null,
    role: userDoc.role || null,
    department: userDoc.department || null,
    phone: userDoc.phone || null,
    createdAt: userDoc.createdAt || userDoc.created_at || null,
    updatedAt: userDoc.updatedAt || userDoc.updated_at || null,
    createdBy: userDoc.createdBy || userDoc.created_by || null,
  };
};

// Register user with role - Super Admin only
export const createUser = async (req, res) => {
  const { email, password, fullName, full_name, role, department, phone } = req.body;
  const name = fullName || full_name;

  const validRoles = ['super_admin', 'editor', 'assignee'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be: super_admin, editor or assignee' });
  }

  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: 'All fields are required: email, password, fullName, role' });
  }

  try {
    const userRecord = await auth.createUser({ email, password, displayName: name });

    await auth.setCustomUserClaims(userRecord.uid, { role });

    const userDoc = {
      uid: userRecord.uid,
      workEmail: email,
      fullName: name,
      role,
      department: department || null,
      phone: phone || null,
      createdAt: new Date().toISOString(),
      createdBy: req.user.uid,
    };

    await db.collection('users').doc(userRecord.uid).set(userDoc);

    res.status(201).json({ data: normalizeUser(userDoc), message: `User ${name} created successfully`, status: 201 });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  // Logout is a no-op on backend because tokens are stateless.
  res.json({ data: null, message: 'Logged out successfully', status: 200 });
};

// Get logged in user profile
export const getMe = async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ data: normalizeUser(userDoc.data()), status: 200 });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users - Super Admin only
export const getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection('users').orderBy('createdAt').get();
    const users = snapshot.docs.map(doc => normalizeUser(doc.data()));
    res.json({ data: users, status: 200 });
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
    await db.collection('users').doc(uid).update({ role, updatedAt: new Date().toISOString() });
    res.json({ data: { uid, role }, message: 'Role updated successfully', status: 200 });
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
    res.json({ data: null, message: 'User deleted successfully', status: 200 });
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
    // We use the client SDK here because it handles sending the email automatically.
    // The Admin SDK generatePasswordResetLink only creates the link, it doesn't send the email.
    await sendPasswordResetEmail(clientAuth, email);
    res.json({ data: null, message: 'Password reset email sent successfully', status: 200 });
  } catch (err) {
    console.error('Forgot password error:', err);
    // Standardize error message for security (don't reveal if email exists or not)
    res.status(200).json({ data: null, message: 'If an account exists for this email, a reset link has been sent.', status: 200 });
  }
};
