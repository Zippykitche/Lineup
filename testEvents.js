import "dotenv/config";

import {
  createEvent,
  getEvents,
  updateEventStatus,
  assignUserToEvent
} from "./src/services/eventService.js";

const runTest = async () => {
  console.log("🚀 EVENTS TEST START");

  // 1. Create event
  const event = await createEvent(
    {
      title: "Breaking News Coverage",
      date: "2026-04-18",
      description: "Cover major event",
      outputType: "TV"
    },
    "editor123"
  );

  if (!event) return;

  // 2. Assign user
  await assignUserToEvent(event.id, "user123", "Reporter");

  // 3. Update status
  await updateEventStatus(event.id, "In Progress");

  // 4. Fetch events
  const events = await getEvents();
  console.log("📅 EVENTS:", events);

  console.log("🏁 EVENTS TEST END");
};

runTest();