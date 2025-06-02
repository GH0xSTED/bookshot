-- Add title and description columns to bookings table
ALTER TABLE bookings 
ADD COLUMN title TEXT,
ADD COLUMN description TEXT;