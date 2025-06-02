import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Bookings API
export async function getBookings(studioId?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const query = supabase
    .from('bookings')
    .select('*')
    .order('start_time', { ascending: true });

  if (studioId) {
    query.eq('studio_id', studioId);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  return data.map(booking => ({
    id: booking.id,
    title: booking.title || 'Your Booking',
    description: booking.description,
    start: booking.start_time,
    end: booking.end_time,
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
    editable: booking.user_id === user?.id,
    extendedProps: {
      userId: booking.user_id,
      studioId: booking.studio_id,
      description: booking.description
    }
  }));
}

export async function createBooking(booking: {
  studioId: string;
  startTime: string;
  endTime: string;
  title?: string;
  description?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('bookings')
    .insert([
      {
        studio_id: booking.studioId,
        user_id: user.id,
        start_time: booking.startTime,
        end_time: booking.endTime,
        title: booking.title,
        description: booking.description
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBooking(bookingId: string, updates: {
  startTime?: string;
  endTime?: string;
  title?: string;
  description?: string;
}) {
  const { data: booking, error: getError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (getError) throw getError;

  const { data, error } = await supabase
    .from('bookings')
    .update({
      start_time: updates.startTime,
      end_time: updates.endTime,
      title: updates.title,
      description: updates.description
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBooking(bookingId: string) {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId);

  if (error) throw error;
}