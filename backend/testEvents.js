import 'dotenv/config';
import { db } from './src/config/firebase.js';

const run = async () => {
  console.log('🚀 EVENTS TEST STARTING...');

  try {
    // Create event
    const eventRef = db.collection('events').doc();
    const event = {
      id: eventRef.id,
      title: 'KBC Evening News Planning',
      date: '2026-04-30',
      description: 'Plan coverage for evening news',
      output_type: 'TV Package',
      status: 'Planned',
      assignees: [],
      created_by: 'test_uid',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await eventRef.set(event);
    console.log('✅ EVENT CREATED:', event.id);

    // Read event
    const doc = await db.collection('events').doc(event.id).get();
    console.log('✅ EVENT FETCHED:', doc.data().title);

    // Update status
    await db.collection('events').doc(event.id).update({ 
      status: 'In Progress',
      updated_at: new Date().toISOString()
    });
    console.log('✅ STATUS UPDATED: In Progress');

    // Assign user
    await db.collection('events').doc(event.id).update({ 
      assignees: ['test_user_uid'],
      updated_at: new Date().toISOString()
    });
    console.log('✅ USER ASSIGNED');

    // Delete event
    await db.collection('events').doc(event.id).delete();
    console.log('🧹 Test event cleaned up');

  } catch (err) {
    console.error('❌ ERROR:', err.message);
  }

  process.exit(0);
};

run();