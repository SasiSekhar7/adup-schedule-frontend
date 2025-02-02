"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  CalendarCurrentDate,
  CalendarDayView,
  CalendarMonthView,
  CalendarNextTrigger,
  CalendarPrevTrigger,
  CalendarTodayTrigger,
  CalendarViewTrigger,
  CalendarWeekView,
  CalendarYearView,
} from "@/components/ui/full-calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addHours } from "date-fns";
import api from "@/api"; // Assuming you have an API utility
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function Schedule() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchSchedules() {
      try {
        const response = await api.get('/schedule/all');
        
        // Assuming the response is an array of schedule objects
        const transformedEvents = await response.map(event => ({
          id: event.id,
          start: new Date(event.start), // Convert to Date object
          end: new Date(event.end), // Convert to Date object
          title: event.title,
          ad: event.ad,
          device: event.device,
          color: event.color, // Assume that you also have color field
        }));
        console.log(transformedEvents)
        setEvents(transformedEvents);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    }
// 
    fetchSchedules();
  }, []);

  return (
    <div>
              <div className="flex items-center w-full mb-4">
      <div className="">
      <p className="text-md font-semibold ">
        Ad Schedule
        </p>
        <p className="text-sm text-muted-foreground">
          All Scheduled ads 
        </p>
      </div>

      <div className="ml-auto">
        <Button onClick={()=>navigate('add')}>
            Schedule Ad
          <ChevronRight className="h-4 w-4"/>
        </Button>
      </div>
      </div>
         {events.length === 0 ? (
      <div>Loading...</div>
    ) : (
        <Calendar events={events}>
        <div className="h-dvh flex flex-col">
          {/* Debugging the events */}
          {/* <pre>{JSON.stringify(events, null, 2)}</pre>  */}
          <div className="flex px-6 items-center gap-2 mb-6">
            <CalendarViewTrigger className="aria-[current=true]:bg-accent" view="day">
              Day
            </CalendarViewTrigger>
            <CalendarViewTrigger view="week" className="aria-[current=true]:bg-accent">
              Week
            </CalendarViewTrigger>
            <CalendarViewTrigger view="month" className="aria-[current=true]:bg-accent">
              Month
            </CalendarViewTrigger>
            <CalendarViewTrigger view="year" className="aria-[current=true]:bg-accent">
              Year
            </CalendarViewTrigger>

            <span className="flex-1" />

            <CalendarCurrentDate />

            <CalendarPrevTrigger>
              <ChevronLeft size={20} />
              <span className="sr-only">Previous</span>
            </CalendarPrevTrigger>

            <CalendarTodayTrigger>Today</CalendarTodayTrigger>

            <CalendarNextTrigger>
              <ChevronRight size={20} />
              <span className="sr-only">Next</span>
            </CalendarNextTrigger>
          </div>

          <div className="flex-1 px-6 overflow-hidden">
            <CalendarDayView />
            <CalendarWeekView />
            <CalendarMonthView />
            <CalendarYearView />
          </div>
        </div>
      </Calendar>
    )}

    </div>
  );
}

export default Schedule;