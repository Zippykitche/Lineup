import { db } from '../config/firebase.js';
import { sendNotificationToUsers } from '../services/notificationService.js';
import { getHolidays } from '../services/eventService.js';
import { sendEventNotification } from '../services/emailService.js';
import { sendEmail } from '../services/emailService.js';
import { getAllUsers } from '../services/userService.js';

const normalizeEvent = (eventData = {}, id = null) => {
  // Ensure date is a string YYYY-MM-DD
  let date = eventData.date || '';
  if (date && typeof date === 'object' && date.toDate) {
    // Handle Firestore Timestamp
    date = date.toDate().toISOString().split('T')[0];
  } else if (date && typeof date === 'string') {
    date = date.split('T')[0];
  }

  const today = new Date().toISOString().split('T')[0];
  const eventDate = date || '';
  const isPast = eventDate < today;

  return {
    id: id || eventData.id || null,
    title: eventData.title || null,
    date: date || null,
    startTime: eventData.startTime || eventData.start_time || '00:00',
    endTime: eventData.endTime || eventData.end_time || '23:59',
    description: eventData.description || null,
    attendeeIds: eventData.attendeeIds || eventData.assignees || eventData.attendees || [],
    createdBy: eventData.createdBy || eventData.created_by || null,
    status: eventData.status || null,
    outputType: eventData.outputType || eventData.output_type || null,
    type: eventData.type || null,
    category: eventData.category || 'General',
    priority: eventData.priority || 'medium',
    isPublic: eventData.isPublic || eventData.is_public || false,
    isPast,
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
    start_time,
    startTime,
    end_time,
    endTime,
    description,
    outputType,
    output_type,
    attendeeIds,
    assignees,
    type: eventType,
    category,
    priority,
    isPublic,
    is_public,
  } = req.body;

  const actualStartTime = startTime || start_time;
  const actualEndTime = endTime || end_time;
  const type = normalizeOutputType(outputType || output_type);
  const attendees = attendeeIds || assignees || [];
  const actualPriority = priority || 'medium';
  const actualIsPublic = isPublic !== undefined ? isPublic : (is_public !== undefined ? is_public : true);

  if (!title || !date || !actualStartTime || !actualEndTime) {
    return res.status(400).json({ message: 'Missing required fields: title, date, startTime, endTime' });
  }

  try {
    const eventRef = db.collection('events').doc();
    const event = {
      id: eventRef.id,
      title,
      date,
      startTime: actualStartTime,
      endTime: actualEndTime,
      description: description || '',
      status: 'Planned',
      attendeeIds: attendees,
      createdBy: req.user.uid,
      outputType: type,
      type: eventType || 'general',
      category: category || 'General',
      priority: actualPriority,
      isPublic: actualIsPublic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await eventRef.set(event);
    console.log('✅ EVENT CREATED:', eventRef.id);

    // Notify attendees via in-app notifications
    
    // Notify attendees
    if (attendees.length > 0) {
      await sendNotificationToUsers(attendees, {
        message: `New event created: ${title} on ${date}`,
        type: 'meeting',
        targetId: eventRef.id,
        targetType: 'event'
      });
    }

    // Send email notifications to attendees
    if (attendees.length > 0) {
      await sendEventNotification(event, attendees);
    }

    res.status(201).json({ data: event, status: 201 });
  } catch (err) {
    console.error('CREATE EVENT ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get public events (e.g., holidays).
 * Merges events from Firestore marked as isPublic with holidays from the Nager.Date API.
 */
export const getPublicEvents = async (req, res) => {
  try {
    const snapshot = await db.collection('events')
      .where('isPublic', '==', true)
      .get();
    const firestoreEvents = snapshot.docs.map(doc => normalizeEvent(doc.data(), doc.id));
    
    const year = new Date().getFullYear();
    const holidays = await getHolidays(year);
    
    const firestoreEventKeys = new Set(firestoreEvents.map(e => `${e.title}-${e.date}`));
    
    const mergedEvents = [...firestoreEvents];
    holidays.forEach(h => {
      if (!firestoreEventKeys.has(`${h.title}-${h.date}`)) {
        mergedEvents.push(normalizeEvent(h));
      }
    });

    // Sort merged events: chronological order (earliest/upcoming first)
    mergedEvents.sort((a, b) => {
      const dateTimeA = `${a.date}T${a.startTime || '00:00'}`;
      const dateTimeB = `${b.date}T${b.startTime || '00:00'}`;
      return dateTimeA.localeCompare(dateTimeB);
    });

    res.json({ data: mergedEvents, status: 200 });
  } catch (err) {
    console.error('Get public events error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all events - Editor and Super Admin
export const getAllEvents = async (req, res) => {
  try {
    const snapshot = await db.collection('events')
      .get();
      
    const events = snapshot.docs.map(doc => normalizeEvent(doc.data(), doc.id));
    
    // Sort: Upcoming (Today/Future) Ascending, then Past Descending
    const today = new Date().toISOString().split('T')[0];
    const upcoming = events
      .filter(e => e.date >= today)
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
    
    const past = events
      .filter(e => e.date < today)
      .sort((a, b) => `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`));

    const sortedEvents = [...upcoming, ...past];
    
    res.json({ data: sortedEvents, status: 200 });
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
      .get();

    const events = snapshot.docs.map(doc => normalizeEvent(doc.data(), doc.id));
    
    // Sort: Upcoming (Today/Future) Ascending, then Past Descending
    const today = new Date().toISOString().split('T')[0];
    const upcoming = events
      .filter(e => e.date >= today)
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
    
    const past = events
      .filter(e => e.date < today)
      .sort((a, b) => `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`));

    const sortedEvents = [...upcoming, ...past];

    res.json({ data: sortedEvents, status: 200 });
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
      updatedAt: new Date().toISOString(),
    };

    if (req.body.outputType || req.body.output_type) {
      updatePayload.outputType = normalizeOutputType(req.body.outputType || req.body.output_type);
    }
    
    if (req.body.attendeeIds || req.body.assignees) {
      updatePayload.attendeeIds = req.body.attendeeIds || req.body.assignees;
    }

    Object.keys(updatePayload).forEach(
      (key) => updatePayload[key] === undefined && delete updatePayload[key]
    );

    await db.collection('events').doc(id).update(updatePayload);
    
    const updatedDoc = await db.collection('events').doc(id).get();
    res.json({ 
      data: normalizeEvent(updatedDoc.data(), id), 
      message: 'Event updated successfully', 
      status: 200 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update status
export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

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

// Delete event
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
