import { addMinutes, parseISO } from "date-fns";

// Function to transform schedules data
export function transformSchedulesToEvents(schedules) {
  return schedules.map((schedule) => {
    const startTime = parseISO(`${schedule.date_of_play}T00:00:00.000Z`); // Midnight of the day
    const endTime = addMinutes(startTime, schedule.total_duration); // Add total duration

    return {
      id: schedule.schedule_id,
      start: startTime,
      end: endTime,
      title: `${schedule.Ad.name} @ ${schedule.Device.location}`,
      color: schedule.priority === 1 ? "red" : "blue", // Priority-based color
    };
  });
}