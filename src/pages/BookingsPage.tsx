import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';

export function BookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studios, setStudios] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!user) return;

    async function loadBookingsAndStudios() {
      try {
        // First load all studios to have their information available
        const { data: studiosData, error: studiosError } = await supabase
          .from('studios')
          .select('*');

        if (studiosError) throw studiosError;

        const studiosMap = studiosData.reduce((acc: Record<string, any>, studio: any) => {
          acc[studio.id] = studio;
          return acc;
        }, {});
        setStudios(studiosMap);

        // Then load user's bookings
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', { ascending: true });

        if (bookingsError) throw bookingsError;

        const formattedEvents = bookings.map((booking: any) => ({
          id: booking.id,
          title: booking.title || studiosMap[booking.studio_id]?.name || 'Booking',
          start: booking.start_time,
          end: booking.end_time,
          backgroundColor: '#4F46E5',
          borderColor: '#4F46E5',
          extendedProps: {
            studioId: booking.studio_id,
            studioName: studiosMap[booking.studio_id]?.name,
            description: booking.description,
            pricePerHour: studiosMap[booking.studio_id]?.price_per_hour
          }
        }));

        setEvents(formattedEvents);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load bookings: " + error.message,
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadBookingsAndStudios();
  }, [user]);

  const handleEventClick = (clickInfo: any) => {
    const { event } = clickInfo;
    const studio = studios[event.extendedProps.studioId];
    
    if (!studio) return;

    const startTime = format(new Date(event.start), 'MMM d, yyyy h:mm a');
    const endTime = format(new Date(event.end), 'h:mm a');
    const duration = (event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60);
    const total = duration * event.extendedProps.pricePerHour;

    toast({
      title: event.title,
      description: (
        <div className="mt-2 space-y-2">
          <p><strong>Studio:</strong> {studio.name}</p>
          <p><strong>Time:</strong> {startTime} - {endTime}</p>
          <p><strong>Duration:</strong> {duration} hours</p>
          <p><strong>Total:</strong> ${total}</p>
          {event.extendedProps.description && (
            <p><strong>Notes:</strong> {event.extendedProps.description}</p>
          )}
        </div>
      ),
    });
  };

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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">My Bookings</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage all your studio bookings in one place
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
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : events.length > 0 ? (
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                events={events}
                eventClick={handleEventClick}
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                allDaySlot={false}
                height="auto"
                eventContent={(eventInfo) => {
                  return (
                    <div className="p-1">
                      <div className="font-semibold">{eventInfo.event.title}</div>
                      <div className="text-xs">
                        {eventInfo.event.extendedProps.studioName}
                      </div>
                    </div>
                  );
                }}
              />
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
                <Link to="/studios">
                  <Button>Browse Studios</Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}