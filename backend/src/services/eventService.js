import { db } from "../config/firebase.js";
import axios from "axios";

let holidayCache = {
  year: null,
  data: [],
};

/**
 * Fetch public holidays from Nager.Date API and normalize them to the application's Event format.
 * Includes a simple in-memory cache to avoid repeated external API calls.
 */
export const getHolidays = async (year = new Date().getFullYear()) => {
  // Return cached data if available for the requested year
  if (holidayCache.year === year && holidayCache.data.length > 0) {
    return holidayCache.data;
  }

  try {
    const countryCode = "KE"; // Default to Kenya as per project context
    console.log(`🔍 Fetching holidays for ${countryCode} in ${year}...`);
    
    const response = await axios.get(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`
    );

    const holidays = response.data.map((item) => {
      const holidayDate = new Date(item.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return {
        id: `holiday-${item.date}-${item.name.replace(/\s+/g, "-").toLowerCase()}`,
        title: item.name,
        date: item.date,
        startTime: "00:00",
        endTime: "23:59",
        description:
          item.localName !== item.name
            ? `${item.localName} (${item.name})`
            : item.name,
        category: "Public Holiday",
        priority: "low",
        isPublic: true,
        type: "holiday",
        status: holidayDate < today ? "Done" : "Planned",
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    // Update cache
    holidayCache = { year, data: holidays };
    return holidays;
  } catch (error) {
    console.error("❌ FETCH HOLIDAYS ERROR:", error.message);
    // Fallback to empty array if API fails
    return [];
  }
};

// CREATE EVENT
export const createEvent = async (eventData, userId) => {
  try {
    const newEvent = {
      ...eventData,
      status: "Planned",
      assignedTo: [],
      createdBy: userId,
      createdAt: new Date(),
    };

    const docRef = await db.collection("events").add(newEvent);

    console.log("✅ EVENT CREATED:", docRef.id);
    return { id: docRef.id, ...newEvent };
  } catch (error) {
    console.error("❌ CREATE EVENT ERROR:", error.message);
    return null;
  }
};

// GET ALL EVENTS
export const getEvents = async () => {
  try {
    const snapshot = await db.collection("events").get();

    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return events;
  } catch (error) {
    console.error("❌ GET EVENTS ERROR:", error.message);
    return [];
  }
};

// UPDATE EVENT STATUS
export const updateEventStatus = async (eventId, status) => {
  try {
    await db.collection("events").doc(eventId).update({ status });

    console.log("✅ STATUS UPDATED");
  } catch (error) {
    console.error("❌ STATUS UPDATE ERROR:", error.message);
  }
};

// ASSIGN USER TO EVENT
export const assignUserToEvent = async (eventId, userId, role) => {
  try {
    const eventRef = db.collection("events").doc(eventId);

    const eventDoc = await eventRef.get();
    const currentAssignments = eventDoc.data().assignedTo || [];

    currentAssignments.push({ userId, role });

    await eventRef.update({
      assignedTo: currentAssignments,
    });

    console.log("✅ USER ASSIGNED");
  } catch (error) {
    console.error("❌ ASSIGN ERROR:", error.message);
  }
};
