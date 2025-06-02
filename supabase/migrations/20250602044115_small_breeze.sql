/*
  # Add RLS policies for bookings table

  1. Security Changes
    - Enable RLS on bookings table
    - Add policies for:
      - SELECT: Users can view all bookings
      - INSERT: Authenticated users can create bookings
      - UPDATE: Users can only update their own bookings
      - DELETE: Users can only delete their own bookings

  2. Notes
    - All authenticated users can view all bookings for transparency
    - Users can only modify (update/delete) their own bookings
    - Only authenticated users can create new bookings
*/

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy for viewing bookings (all users can view all bookings)
CREATE POLICY "Anyone can view bookings"
  ON bookings
  FOR SELECT
  USING (true);

-- Policy for creating bookings (authenticated users only)
CREATE POLICY "Authenticated users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for updating bookings (users can only update their own)
CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for deleting bookings (users can only delete their own)
CREATE POLICY "Users can delete own bookings"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);