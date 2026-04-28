import { db } from '../config/firebase.js';

const normalizeEvent = (eventData = {}, id = null) => {
  return {
    id: id || eventData.id || null,
    title: eventData.title || null,
    date: eventData.date || null,
    startTime: eventData.startTime || eventData.start_time || null,
    endTime: eventData.endTime || eventData.end_time || null,
    description: eventData.description || null,
    attendeeIds: eventData.attendeeIds || eventData.assignees || eventData.attendees || [],
    createdBy: eventData.createdBy || eventData.created_by || null,
    status: eventData.status || null,
    outputType: eventData.outputType || eventData.output_type || null,
    createdAt: eventData.createdAt || eventData.created_at || null,
    updatedAt: eventData.updatedAt || eventData.updated_at || null,
  };
};

const normalizeOutputType = (value) => {
  const mapping = {
    'TV Package': 'TV',
    'Radio Script': 'Radio',
    'Social Graphic': 'Social',
    'Web Article': 'Web',
    Video: 'Video',
    Photo: 'Photo',
    TV: 'TV',
    Radio: 'Radio',
    Social: 'Social',
    Web: 'Web',
  };

  return mapping[value] || value;
};

// Create event - Editor only
export const createEvent = async (req, res) => {
  const {
    title,
    date,
    startTime,
    endTime,
    description,
    outputType,
    output_type,
    attendeeIds,
    assignees,
  } = req.body;

  const type = normalizeOutputType(outputType || output_type);
  const attendees = attendeeIds || assignees || [];

  const validOutputTypes = ['TV', 'Radio', 'Social', 'Web', 'Video', 'Photo'];
  if (!validOutputTypes.includes(type)) {
    return res.status(400).json({ message: 'Invalid output type' });
  }

  if (!title || !date || !startTime || !endTime) {
    return res.status(400).json({ message: 'Missing required fields: title, date, startTime, endTime' });
  }

  try {
    const eventRef = db.collection('events').doc();
    const event = {
      id: eventRef.id,
      title,
      date,
      startTime,
      endTime,
      description: description || '',
      status: 'Planned',
      attendeeIds: attendees,
      createdBy: req.user.uid,
      outputType: type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await eventRef.set(event);
    res.status(201).json({ data: event, status: 201 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all events - Editor and Super Admin
export const getAllEvents = async (req, res) => {
  try {
    const snapshot = await db.collection('events').orderBy('date').get();
    const events = snapshot.docs.map(doc => normalizeEvent(doc.data(), doc.id));
    res.json({ data: events, status: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get events assigned to logged in user - Assignee
export const getMyEvents = async (req, res) => {
  try {
    const snapshot = await db.collection('events')
      .where('attendeeIds', 'array-contains', req.user.uid)
      .orderBy('date')
      .get();

    const events = snapshot.docs.map(doc => normalizeEvent(doc.data(), doc.id));
    res.json({ data: events, status: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update event - Editor and Super Admin
export const updateEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const updatePayload = {
      ...req.body,
      outputType: normalizeOutputType(req.body.outputType || req.body.output_type),
      attendeeIds: req.body.attendeeIds || req.body.assignees || req.body.attendee_ids,
      startTime: req.body.startTime || req.body.start_time,
      endTime: req.body.endTime || req.body.end_time,
      updatedAt: new Date().toISOString(),
    };

    Object.keys(updatePayload).forEach(
      (key) => updatePayload[key] === undefined && delete updatePayload[key]
    );

    await db.collection('events').doc(id).update(updatePayload);
    res.json({ data: normalizeEvent(updatePayload, id), message: 'Event updated successfully', status: 200 });
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
      updatedAt: new Date().toISOString(),
    });
    res.json({ data: { id, status }, message: 'Status updated successfully', status: 200 });
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
    res.json({ data: null, message: 'Event deleted successfully', status: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};