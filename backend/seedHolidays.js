import { db } from './src/config/firebase.js';

const kenyanHolidays2024 = [
  {
    title: 'New Year\'s Day',
    date: '2024-01-01',
    startTime: '00:00',
    endTime: '23:59',
    description: 'National holiday marking the start of the new year',
    category: 'Public Holiday',
    priority: 'high',
    isPublic: true,
  },
  {
    title: 'Good Friday',
    date: '2024-03-29',
    startTime: '00:00',
    endTime: '23:59',
    description: 'Christian holiday commemorating the crucifixion of Jesus Christ',
    category: 'Public Holiday',
    priority: 'high',
    isPublic: true,
  },
  {
    title: 'Easter Monday',
    date: '2024-04-01',
    startTime: '00:00',
    endTime: '23:59',
    description: 'Christian holiday following Easter Sunday',
    category: 'Public Holiday',
    priority: 'high',
    isPublic: true,
  },
  {
    title: 'Labour Day',
    date: '2024-05-01',
    startTime: '00:00',
    endTime: '23:59',
    description: 'National holiday celebrating workers and the labor movement',
    category: 'Public Holiday',
    priority: 'high',
    isPublic: true,
  },
  {
    title: 'Madaraka Day',
    date: '2024-06-01',
    startTime: '00:00',
    endTime: '23:59',
    description: 'National holiday commemorating self-governance achieved in 1963',
    category: 'Public Holiday',
    priority: 'high',
    isPublic: true,
  },
  {
    title: 'Eid al-Fitr',
    date: '2024-04-11',
    startTime: '00:00',
    endTime: '23:59',
    description: 'Islamic holiday marking the end of Ramadan',
    category: 'Public Holiday',
    priority: 'high',
    isPublic: true,
  },
  {
    title: 'Eid al-Adha',
    date: '2024-06-17',
    startTime: '00:00',
    endTime: '23:59',
    description: 'Islamic holiday commemorating the willingness of Ibrahim to sacrifice his son',
    category: 'Public Holiday',
    priority: 'high',
    isPublic: true,
  },
  {
    title: 'Mazingira Day',
    date: '2024-10-10',
    startTime: '00:00',
    endTime: '23:59',
    description: 'National holiday for environmental conservation',
    category: 'Public Holiday',
    priority: 'high',
    isPublic: true,
  },
  {
    title: 'Mashujaa Day',
    date: '2024-10-20',
    startTime: '00:00',
    endTime: '23:59',
    description: 'National holiday honoring heroes of Kenya\'s independence struggle',
    category: 'Public Holiday',
    priority: 'high',
    isPublic: true,
  },
  {
    title: 'Jamhuri Day',
    date: '2024-12-12',
    startTime: '00:00',
    endTime: '23:59',
    description: 'National holiday marking Kenya\'s independence in 1964',
    category: 'Public Holiday',
    priority: 'high',
    isPublic: true,
  },
  {
    title: 'Christmas Day',
    date: '2024-12-25',
    startTime: '00:00',
    endTime: '23:59',
    description: 'Christian holiday celebrating the birth of Jesus Christ',
    category: 'Public Holiday',
    priority: 'high',
    isPublic: true,
  },
  {
    title: 'Boxing Day',
    date: '2024-12-26',
    startTime: '00:00',
    endTime: '23:59',
    description: 'National holiday following Christmas Day',
    category: 'Public Holiday',
    priority: 'high',
    isPublic: true,
  },
];

const seedHolidays = async () => {
  try {
    console.log('🌍 Seeding Kenyan public holidays...');

    const batch = db.batch();

    for (const holiday of kenyanHolidays2024) {
      const eventRef = db.collection('events').doc();
      const event = {
        id: eventRef.id,
        ...holiday,
        status: 'Done', // Mark as done since they're past events
        attendeeIds: [], // No specific assignees for public holidays
        createdBy: 'system', // System created
        outputType: 'General',
        type: 'holiday',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      batch.set(eventRef, event);
    }

    await batch.commit();
    console.log('✅ Kenyan public holidays seeded successfully');
  } catch (err) {
    console.error('❌ Error seeding holidays:', err);
  }
};

seedHolidays();