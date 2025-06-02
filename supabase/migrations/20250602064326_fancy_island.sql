-- Previous SQL remains unchanged...

-- Insert sample studios
INSERT INTO studios (id, name, description, image_url, price_per_hour, capacity, location, category)
VALUES 
  ('123e4567-e89b-12d3-a456-426614174000', 'Daylight Photo Studio', 'Beautiful natural light studio with white cyclorama wall, perfect for portrait and product photography.', 'https://images.pexels.com/photos/7679863/pexels-photo-7679863.jpeg', 75, 8, 'Downtown', 'photography'),
  ('223e4567-e89b-12d3-a456-426614174001', 'Pro Sound Recording Studio', 'Professional recording studio with acoustic treatment, mixing console, and top-tier microphones.', 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg', 95, 5, 'Midtown', 'audio'),
  ('323e4567-e89b-12d3-a456-426614174002', 'Video Production Studio', 'Full-service video production studio with green screen, lighting grid, and control room.', 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg', 120, 15, 'Eastside', 'video');