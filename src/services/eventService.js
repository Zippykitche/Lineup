import { db } from "../config/firebase.js";

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