import { db } from './src/config/firebase.js';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getEasterSunday = (year) => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
};

const hijriToJulianDay = (year, month, day) => {
  return (
    day +
    Math.ceil(29.5 * (month - 1)) +
    (year - 1) * 354 +
    Math.floor((3 + 11 * year) / 30) +
    1948439.5 -
    1
  );
};

const julianDayToGregorian = (jd) => {
  const z = Math.floor(jd + 0.5);
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  return new Date(year, month - 1, day);
};

const islamicToGregorian = (year, month, day) => {
  const jd = hijriToJulianDay(year, month, day);
  return julianDayToGregorian(jd);
};

const getApproxIslamicYear = (gregorianYear) => {
  return Math.floor((gregorianYear - 622) * 33 / 32);
};

const buildHolidayList = (year) => {
  const easter = getEasterSunday(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(goodFriday.getDate() - 2);
  const easterMonday = new Date(easter);
  easterMonday.setDate(easterMonday.getDate() + 1);

  const islamicYear = getApproxIslamicYear(year);
  const eidAlFitr = islamicToGregorian(islamicYear, 10, 1);
  const eidAlAdha = islamicToGregorian(islamicYear, 12, 10);

  return [
    {
      title: 'New Year\'s Day',
      date: `${year}-01-01`,
      startTime: '00:00',
      endTime: '23:59',
      description: 'National holiday marking the start of the new year',
      category: 'Public Holiday',
      priority: 'high',
      isPublic: true,
    },
    {
      title: 'Good Friday',
      date: formatDate(goodFriday),
      startTime: '00:00',
      endTime: '23:59',
      description: 'Christian holiday commemorating the crucifixion of Jesus Christ',
      category: 'Public Holiday',
      priority: 'high',
      isPublic: true,
    },
    {
      title: 'Easter Monday',
      date: formatDate(easterMonday),
      startTime: '00:00',
      endTime: '23:59',
      description: 'Christian holiday following Easter Sunday',
      category: 'Public Holiday',
      priority: 'high',
      isPublic: true,
    },
    {
      title: 'Labour Day',
      date: `${year}-05-01`,
      startTime: '00:00',
      endTime: '23:59',
      description: 'National holiday celebrating workers and the labor movement',
      category: 'Public Holiday',
      priority: 'high',
      isPublic: true,
    },
    {
      title: 'Madaraka Day',
      date: `${year}-06-01`,
      startTime: '00:00',
      endTime: '23:59',
      description: 'National holiday commemorating self-governance achieved in 1963',
      category: 'Public Holiday',
      priority: 'high',
      isPublic: true,
    },
    {
      title: 'Eid al-Fitr',
      date: formatDate(eidAlFitr),
      startTime: '00:00',
      endTime: '23:59',
      description: 'Approximate Eid al-Fitr date based on the Islamic civil calendar. Actual date depends on moon sighting.',
      category: 'Public Holiday',
      priority: 'high',
      isPublic: true,
    },
    {
      title: 'Eid al-Adha',
      date: formatDate(eidAlAdha),
      startTime: '00:00',
      endTime: '23:59',
      description: 'Approximate Eid al-Adha date based on the Islamic civil calendar. Actual date depends on moon sighting.',
      category: 'Public Holiday',
      priority: 'high',
      isPublic: true,
    },
    {
      title: 'Mazingira Day',
      date: `${year}-10-10`,
      startTime: '00:00',
      endTime: '23:59',
      description: 'National holiday for environmental conservation',
      category: 'Public Holiday',
      priority: 'high',
      isPublic: true,
    },
    {
      title: 'Mashujaa Day',
      date: `${year}-10-20`,
      startTime: '00:00',
      endTime: '23:59',
      description: 'National holiday honoring heroes of Kenya\'s independence struggle',
      category: 'Public Holiday',
      priority: 'high',
      isPublic: true,
    },
    {
      title: 'Jamhuri Day',
      date: `${year}-12-12`,
      startTime: '00:00',
      endTime: '23:59',
      description: 'National holiday marking Kenya\'s independence in 1964',
      category: 'Public Holiday',
      priority: 'high',
      isPublic: true,
    },
    {
      title: 'Christmas Day',
      date: `${year}-12-25`,
      startTime: '00:00',
      endTime: '23:59',
      description: 'Christian holiday celebrating the birth of Jesus Christ',
      category: 'Public Holiday',
      priority: 'high',
      isPublic: true,
    },
    {
      title: 'Boxing Day',
      date: `${year}-12-26`,
      startTime: '00:00',
      endTime: '23:59',
      description: 'National holiday following Christmas Day',
      category: 'Public Holiday',
      priority: 'high',
      isPublic: true,
    },
  ];
};

const seedHolidays = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const yearsToSeed = [currentYear, currentYear + 1];

    console.log(`🌍 Seeding Kenyan public holidays for ${yearsToSeed.join(', ')}...`);

    const existingSnapshot = await db.collection('events')
      .where('type', '==', 'holiday')
      .get();

    const existingKeys = new Set(
      existingSnapshot.docs.map((doc) => `${doc.data().title}#${doc.data().date}`)
    );

    const batch = db.batch();
    const today = new Date();

    for (const year of yearsToSeed) {
      const holidays = buildHolidayList(year);
      for (const holiday of holidays) {
        const key = `${holiday.title}#${holiday.date}`;
        if (existingKeys.has(key)) {
          continue;
        }

        const eventRef = db.collection('events').doc();
        const isPast = new Date(`${holiday.date}T00:00:00Z`) < today;
        const event = {
          id: eventRef.id,
          ...holiday,
          status: isPast ? 'Done' : 'Planned',
          attendeeIds: [],
          createdBy: 'system',
          outputType: 'General',
          type: 'holiday',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        batch.set(eventRef, event);
      }
    }

    await batch.commit();
    console.log('✅ Kenyan public holidays seeded successfully');
  } catch (err) {
    console.error('❌ Error seeding holidays:', err);
  }
};

seedHolidays();
