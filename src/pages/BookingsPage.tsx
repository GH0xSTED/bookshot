import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

// Mock data for calendar events
const initialEvents = [
  {
    id: '1',
    title: 'Product Shoot - Studio A',
    start: '2025-05-15T10:00:00',
    end: '2025-05-15T12:00:00',
    resourceId: 'studio-a',
    backgroundColor: '#4F46E5',
    editable: true,
  },
  {
    id: '2',
    title: 'Portrait Session - Studio B',
    start: '2025-05-15T14:00:00',
    end: '2025-05-15T16:00:00',
    resourceId: 'studio-b',
    backgroundColor: '#0891B2',
    editable: true,
  },
  {
    id: '3',
    title: 'Fashion Shoot - Studio C',
    start: '2025-05-16T09:00:00',
    end: '2025-05-16T13:00:00',
    resourceId: 'studio-c',
    backgroundColor: '#B45309',
    editable: true,
  },
];

const resources = [
  { id: 'studio-a', title: 'Studio A' },
  { id: 'studio-b', title: 'Studio B' },
  { id: 'studio-c', title: 'Studio C' },
];

export function BookingsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState(initialEvents);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Please Sign In</h2>
        <p className="mt-2 text-gray-600">You need to be signed in to view and manage bookings.</p>
        <Link to="/login" className="mt-4 inline-block">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  const handleEventDrop = (info: any) => {
    const { event } = info;
    setEvents(prevEvents => {
      const newEvents = prevEvents.filter(e => e.id !== event.id);
      return [...newEvents, {
        id: event.id,
        title: event.title,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        resourceId: event.resourceId,
        backgroundColor: event.backgroundColor,
        editable: event.editable,
      }];
    });
  };

  const handleEventResize = (info: any) => {
    const { event } = info;
    setEvents(prevEvents => {
      const newEvents = prevEvents.filter(e => e.id !== event.id);
      return [...newEvents, {
        id: event.id,
        title: event.title,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        resourceId: event.resourceId,
        backgroundColor: event.backgroundColor,
        editable: event.editable,
      }];
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Studio Bookings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Drag and drop to reschedule your bookings
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to="/studios">
              <Button>Book New Session</Button>
            </Link>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="p-4">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              resources={resources}
              events={events}
              editable={true}
              droppable={true}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              allDaySlot={false}
              slotDuration="00:30:00"
              height="auto"
              resourceAreaWidth="150px"
              resourceGroupField="building"
              resourceAreaHeaderContent="Studios"
              className="fc-theme-standard"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}