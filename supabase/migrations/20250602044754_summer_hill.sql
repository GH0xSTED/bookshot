-- Create tables
CREATE TABLE IF NOT EXISTS studios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price_per_hour INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  location TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table with references
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  -- Ensure end time is after start time
  CONSTRAINT bookings_end_time_check CHECK (end_time > start_time),
  -- Prevent overlapping bookings for the same studio
  CONSTRAINT no_overlapping_bookings EXCLUDE USING gist (
    studio_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  )
);

-- Create indexes for better query performance
CREATE INDEX bookings_studio_id_idx ON bookings(studio_id);
CREATE INDEX bookings_user_id_idx ON bookings(user_id);
CREATE INDEX bookings_start_time_idx ON bookings(start_time);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_studios_updated_at
    BEFORE UPDATE ON studios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample studios
INSERT INTO studios (id, name, description, image_url, price_per_hour, capacity, location, category)
VALUES 
  ('123e4567-e89b-12d3-a456-426614174000', 'Daylight Photo Studio', 'Beautiful natural light studio with white cyclorama wall, perfect for portrait and product photography.', 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg', 75, 8, 'Downtown', 'photography'),
  ('223e4567-e89b-12d3-a456-426614174001', 'Pro Sound Recording Studio', 'Professional recording studio with acoustic treatment, mixing console, and top-tier microphones.', 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg', 95, 5, 'Midtown', 'audio'),
  ('323e4567-e89b-12d3-a456-426614174002', 'Video Production Studio', 'Full-service video production studio with green screen, lighting grid, and control room.', 'https://images.pexels.com/photos/3379322/pexels-photo-3379322.jpeg', 120, 15, 'Eastside', 'video');