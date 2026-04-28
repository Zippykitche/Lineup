import { db } from '../config/firebase.js';

// Create event - Editor only
export const createEvent = async (req, res) => {
  const { title, date, description, output_type, assignees } = req.body;

  const validOutputTypes = ['TV Package', 'Radio Script', 'Social Graphic', 'Web Article', 'Video', 'Photo'];
  if (!validOutputTypes.includes(output_type)) {
    return res.status(400).json({ message: 'Invalid output type' });
  }

  try {
    const eventRef = db.collection('events').doc();
    const event = {
      id: eventRef.id,
      title,
      date,
      description,
      output_type,
      status: 'Planned',
      assignees: assignees || [],
      created_by: req.user.uid,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await eventRef.set(event);
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all events - Editor and Super Admin
export const getAllEvents = async (req, res) => {
  try {
    const snapshot = await db.collection('events').orderBy('date').get();
    const events = snapshot.docs.map(doc => doc.data());
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get events assigned to logged in user - Assignee
export const getMyEvents = async (req, res) => {
  try {
    const snapshot = await db.collection('events')
      .where('assignees', 'array-contains', req.user.uid)
      .orderBy('date')
      .get();

    const events = snapshot.docs.map(doc => doc.data());
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update event - Editor and Super Admin
export const updateEvent = async (req, res) => {
  const { id } = req.params;

  try {
    await db.collection('events').doc(id).update({
      ...req.body,
      updated_at: new Date().toISOString(),
    });
    res.json({ message: 'Event updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update status - Assignee can update their own tasks
export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Planned', 'In Progress', 'Done'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    await db.collection('events').doc(id).update({
      status,
      updated_at: new Date().toISOString(),
    });
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete event - Super Admin only
export const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    await db.collection('events').doc(id).delete();
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};