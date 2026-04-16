const { auth, db } = require('../config/firebase');

// Super Admin creates a new user account (Registration form: name, email, department, role)
const createUser = async (req, res) => {
  const { email, password, full_name, department, role } = req.body;

  // Validate role
  const validRoles = ['super_admin', 'editor', 'assignee'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ 
      message: 'Invalid role. Must be super_admin, editor or assignee' 
    });
  }

  // Validate all fields
  if (!email || !password || !full_name || !department || !role) {
    return res.status(400).json({ 
      message: 'All fields are required: email, password, full_name, department, role' 
    });
  }

  try {
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({ 
      email, 
      password,
      displayName: full_name 
    });

    // Assign role as custom claim
    await auth.setCustomUserClaims(userRecord.uid, { role });

    // Save user profile in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      full_name,
      department,
      role,
      created_at: new Date().toISOString(),
      created_by: req.user.uid
    });

    res.status(201).json({ 
      message: `User ${full_name} created successfully as ${role} in ${department}`,
      uid: userRecord.uid 
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get current logged in user profile
const getMe = async (req, res) => {
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
const getAllUsers = async (req, res) => {
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
const updateUserRole = async (req, res) => {
  const { uid } = req.params;
  const { role } = req.body;

  const validRoles = ['super_admin', 'editor', 'assignee'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    await auth.setCustomUserClaims(uid, { role });
    await db.collection('users').doc(uid).update({ 
      role,
      updated_at: new Date().toISOString()
    });
    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user - Super Admin only
const deleteUser = async (req, res) => {
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

module.exports = { createUser, getMe, getAllUsers, updateUserRole, deleteUser };