-- First, clear out any existing studios to avoid conflicts
DELETE FROM studios;

-- Re-insert all studios with consistent IDs
INSERT INTO studios (id, name, description, image_url, price_per_hour, capacity, location, category)
VALUES 
  ('123e4567-e89b-12d3-a456-426614174000', 'Garage Bay', 'Spacious garage bay perfect for vehicle photography and automotive content creation. Features excellent lighting and clean workspace.', 'https://images.pexels.com/photos/4489749/pexels-photo-4489749.jpeg', 75, 8, 'Downtown', 'photography'),
  ('223e4567-e89b-12d3-a456-426614174001', 'Photo Studio', 'Professional photo studio with high-end lighting equipment, backdrops, and product photography setup.', 'https://images.pexels.com/photos/3038740/pexels-photo-3038740.jpeg', 95, 5, 'Midtown', 'photography'),
  ('323e4567-e89b-12d3-a456-426614174002', 'Wash Bay', 'Modern car wash bay with professional lighting and detailing equipment. Perfect for before/after shots and detail documentation.', 'https://images.pexels.com/photos/6873088/pexels-photo-6873088.jpeg', 120, 15, 'Eastside', 'photography'),
  ('423e4567-e89b-12d3-a456-426614174003', 'Detail Garage Store HQ', 'Premium retail space perfect for product photography, training sessions, and automotive care demonstrations. Features professional lighting and versatile shooting areas.', 'https://images.pexels.com/photos/3800517/pexels-photo-3800517.jpeg', 85, 12, 'North Side', 'photography');