import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Check, ArrowLeft } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { BookingModal } from '../components/BookingModal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import { getBookings, createBooking, updateBooking, deleteBooking, supabase } from '../lib/supabase';

interface Studio {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price_per_hour: number;
  capacity: number;
  location: string;
  category: string;
}

export function StudioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [studio, setStudio] = useState<Studio | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingTitle, setBookingTitle] = useState('');
  const [bookingDescription, setBookingDescription] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempEvent, setTempEvent] = useState<any>(null);

  useEffect(() => {
    async function loadStudioAndBookings() {
      try {
        if (!id) return;

        // Fetch studio details
        const { data: studioData, error: studioError } = await supabase
          .from('studios')
          .select('*')
          .eq('id', id)
          .single();

        if (studioError) throw studioError;
        setStudio(studioData);

        // Fetch bookings
        const bookings = await getBookings(id);
        setEvents(bookings);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load studio data: " + error.message,
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadStudioAndBookings();
  }, [id]);

  if (!studio) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Studio not found</h2>
        <p className="mt-2 text-gray-600">The studio you're looking for doesn't exist or has been removed.</p>
        <Link to="/studios" className="mt-4 inline-block">
          <Button variant="outline" icon={<ArrowLeft size={18} />} iconPosition="left">
            Back to Studios
          </Button>
        </Link>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return price === 0 ? 'FREE' : `$${price}/hour`;
  };

  const handleDateSelect = async (selectInfo: any) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const calendarApi = selectInfo.view.calendar;
    
    const isOverlapping = events.some(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const selectionStart = selectInfo.start;
      const selectionEnd = selectInfo.end;
      
      return (selectionStart < eventEnd && selectionEnd > eventStart);
    });

    if (isOverlapping) {
      toast({
        variant: "destructive",
        title: "Booking Conflict",
        description: "This time slot overlaps with an existing booking",
      });
      calendarApi.unselect();
      return;
    }

    const newTempEvent = {
      id: 'temp-' + Date.now(),
      title: 'New Booking',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      backgroundColor: '#818CF8',
      borderColor: '#818CF8',
      editable: true,
    };

    setTempEvent(newTempEvent);
    setEvents(prevEvents => [...prevEvents, newTempEvent]);
    
    setSelectedEvent({
      id: newTempEvent.id,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      hours: Math.round((selectInfo.end.getTime() - selectInfo.start.getTime()) / (1000 * 60 * 60)),
    });

    setBookingTitle('');
    setBookingDescription('');
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const { event } = clickInfo;
    
    if (event.title === 'Reserved' && event.extendedProps.userId !== user?.id) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "This time slot is already booked",
      });
      return;
    }

    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      hours: Math.round((event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)),
      extendedProps: event.extendedProps,
    });

    setBookingTitle(event.title === 'Your Booking' ? '' : event.title);
    setBookingDescription(event.extendedProps?.description || '');
    setIsModalOpen(true);
  };

  const handleEventDrop = async (dropInfo: any) => {
    const { event } = dropInfo;
    
    if (!event.extendedProps?.userId) return;
    
    if (event.extendedProps.userId !== user?.id) {
      dropInfo.revert();
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You can only modify your own bookings",
      });
      return;
    }
    
    const isOverlapping = events.some(existingEvent => {
      if (existingEvent.id === event.id) return false;
      const eventStart = new Date(existingEvent.start);
      const eventEnd = new Date(existingEvent.end);
      const droppedStart = event.start;
      const droppedEnd = event.end;
      
      return (droppedStart < eventEnd && droppedEnd > eventStart);
    });

    if (isOverlapping) {
      dropInfo.revert();
      toast({
        variant: "destructive",
        title: "Booking Conflict",
        description: "This time slot overlaps with an existing booking",
      });
      return;
    }

    try {
      await updateBooking(event.id, {
        startTime: event.startStr,
        endTime: event.endStr,
      });

      setEvents(prevEvents => {
        const updatedEvents = prevEvents.filter(e => e.id !== event.id);
        return [...updatedEvents, {
          ...event.toPlainObject(),
          start: event.startStr,
          end: event.endStr,
        }];
      });

      toast({
        title: "Success",
        description: "The booking has been successfully rescheduled",
      });
    } catch (error: any) {
      dropInfo.revert();
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update booking: " + error.message,
      });
    }
  };

  const handleEventResize = async (resizeInfo: any) => {
    const { event } = resizeInfo;
    
    if (!event.extendedProps?.userId) return;
    
    if (event.extendedProps.userId !== user?.id) {
      resizeInfo.revert();
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You can only modify your own bookings",
      });
      return;
    }
    
    const isOverlapping = events.some(existingEvent => {
      if (existingEvent.id === event.id) return false;
      const eventStart = new Date(existingEvent.start);
      const eventEnd = new Date(existingEvent.end);
      const resizedStart = event.start;
      const resizedEnd = event.end;
      
      return (resizedStart < eventEnd && resizedEnd > eventStart);
    });

    if (isOverlapping) {
      resizeInfo.revert();
      toast({
        variant: "destructive",
        title: "Booking Conflict",
        description: "This time slot overlaps with an existing booking",
      });
      return;
    }

    try {
      await updateBooking(event.id, {
        startTime: event.startStr,
        endTime: event.endStr,
      });

      setEvents(prevEvents => {
        const updatedEvents = prevEvents.filter(e => e.id !== event.id);
        return [...updatedEvents, {
          ...event.toPlainObject(),
          start: event.startStr,
          end: event.endStr,
        }];
      });

      toast({
        title: "Success",
        description: "The booking duration has been successfully updated",
      });
    } catch (error: any) {
      resizeInfo.revert();
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update booking: " + error.message,
      });
    }
  };

  const handleBookingConfirm = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedEvent) {
      toast({
        variant: "destructive",
        title: "No Selection",
        description: "Please select a time slot first",
      });
      return;
    }

    try {
      const booking = await createBooking({
        studioId: id!,
        startTime: selectedEvent.start,
        endTime: selectedEvent.end,
        title: bookingTitle,
        description: bookingDescription
      });

      const newBooking = {
        id: booking.id,
        title: bookingTitle || 'Your Booking',
        start: booking.start_time,
        end: booking.end_time,
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
        editable: true,
        extendedProps: {
          userId: user.id,
          studioId: id,
          description: booking.description
        },
      };

      setEvents(prevEvents => {
        const filteredEvents = prevEvents.filter(event => event.id !== tempEvent?.id);
        return [...filteredEvents, newBooking];
      });
      
      setSelectedEvent(null);
      setTempEvent(null);
      setBookingTitle('');
      setBookingDescription('');
      setIsModalOpen(false);

      toast({
        title: "Success",
        description: "Your booking has been confirmed",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create booking: " + error.message,
      });
    }
  };

  const handleBookingUpdate = async () => {
    if (!selectedEvent?.id) return;

    try {
      await updateBooking(selectedEvent.id, {
        title: bookingTitle,
        description: bookingDescription
      });

      setEvents(prevEvents => {
        return prevEvents.map(event => {
          if (event.id === selectedEvent.id) {
            return {
              ...event,
              title: bookingTitle || 'Your Booking',
              extendedProps: {
                ...event.extendedProps,
                description: bookingDescription
              }
            };
          }
          return event;
        });
      });

      setIsModalOpen(false);
      toast({
        title: "Success",
        description: "Booking details updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update booking details: " + error.message,
      });
    }
  };

  const handleBookingDelete = async () => {
    if (!selectedEvent?.id || !selectedEvent?.extendedProps?.userId) return;

    if (selectedEvent.extendedProps.userId !== user?.id) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You can only delete your own bookings",
      });
      return;
    }

    try {
      await deleteBooking(selectedEvent.id);

      setEvents(prevEvents => prevEvents.filter(event => event.id !== selectedEvent.id));
      setSelectedEvent(null);
      setBookingTitle('');
      setBookingDescription('');
      setIsModalOpen(false);

      toast({
        title: "Success",
        description: "Your booking has been cancelled",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete booking: " + error.message,
      });
    }
  };

  return (
    <div className="bg-white">
      <div className="relative h-96">
        <img
          src={studio.image_url}
          alt={studio.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold">{studio.name}</h1>
            <div className="mt-4 flex items-center justify-center">
              <MapPin className="h-5 w-5 mr-1" />
              <span>{studio.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <Link to="/studios" className="text-primary-600 hover:text-primary-700 flex items-center">
            <ArrowLeft size={18} className="mr-1" />
            Back to Studios
          </Link>
          <div className="text-2xl font-bold text-primary-600">
            {formatPrice(studio.price_per_hour)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Space</h2>
                <p className="text-gray-600">{studio.description}</p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Availability Calendar</h2>
                <Card>
                  <CardBody>
                    {isLoading ? (
                      <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    ) : (
                      <FullCalendar
                        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                          left: 'prev,next today',
                          center: 'title',
                          right: 'dayGridMonth,timeGridWeek,timeGridDay',
                        }}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={true}
                        weekends={true}
                        events={events}
                        select={handleDateSelect}
                        eventClick={handleEventClick}
                        eventDrop={handleEventDrop}
                        eventResize={handleEventResize}
                        slotMinTime="08:00:00"
                        slotMaxTime="20:00:00"
                        allDaySlot={false}
                        height="auto"
                        selectConstraint={{
                          startTime: '08:00',
                          endTime: '20:00',
                        }}
                        editable={true}
                      />
                    )}
                  </CardBody>
                </Card>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <li className="flex items-center">
                    <Check size={18} className="text-primary-600 mr-2" />
                    <span>Professional Lighting</span>
                  </li>
                  <li className="flex items-center">
                    <Check size={18} className="text-primary-600 mr-2" />
                    <span>Climate Controlled</span>
                  </li>
                  <li className="flex items-center">
                    <Check size={18} className="text-primary-600 mr-2" />
                    <span>Equipment Available</span>
                  </li>
                  <li className="flex items-center">
                    <Check size={18} className="text-primary-600 mr-2" />
                    <span>WiFi Access</span>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Studio Rules</h2>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-primary-600 font-bold mr-2">1.</span>
                    <span>Please arrive on time and leave promptly at the end of your booking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 font-bold mr-2">2.</span>
                    <span>Clean up after your session and return any equipment to its original location</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 font-bold mr-2">3.</span>
                    <span>No food or drinks near equipment</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 font-bold mr-2">4.</span>
                    <span>Report any equipment issues immediately</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardBody>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Studio Details</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Users size={16} className="mr-2" />
                    <span>Capacity: up to {studio.capacity} people</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    <span>Available: 8:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-2" />
                    <span>{studio.location}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (tempEvent) {
            setEvents(prevEvents => prevEvents.filter(event => event.id !== tempEvent.id));
            setTempEvent(null);
          }
        }}
        onConfirm={selectedEvent?.extendedProps?.userId ? handleBookingUpdate : handleBookingConfirm}
        onDelete={selectedEvent?.extendedProps?.userId ? handleBookingDelete : undefined}
        title={bookingTitle}
        setTitle={setBookingTitle}
        description={bookingDescription}
        setDescription={setBookingDescription}
        selectedEvent={selectedEvent}
        pricePerHour={studio.price_per_hour}
        isExisting={!!selectedEvent?.extendedProps?.userId}
      />
    </div>
  );
}