-- Update existing studios with new names, descriptions, and images
UPDATE studios
SET 
  name = 'Garage Bay',
  description = 'Spacious garage bay perfect for vehicle photography and automotive content creation. Features excellent lighting and clean workspace.',
  image_url = 'https://images.pexels.com/photos/4489749/pexels-photo-4489749.jpeg',
  price_per_hour = 75,
  capacity = 8,
  location = 'Downtown',
  category = 'photography'
WHERE id = '123e4567-e89b-12d3-a456-426614174000';

UPDATE studios
SET 
  name = 'Photo Studio',
  description = 'Professional photo studio with high-end lighting equipment, backdrops, and product photography setup.',
  image_url = 'https://images.pexels.com/photos/3038740/pexels-photo-3038740.jpeg',
  price_per_hour = 95,
  capacity = 5,
  location = 'Midtown',
  category = 'photography'
WHERE id = '223e4567-e89b-12d3-a456-426614174001';

UPDATE studios
SET 
  name = 'Wash Bay',
  description = 'Modern car wash bay with professional lighting and detailing equipment. Perfect for before/after shots and detail documentation.',
  image_url = 'https://images.pexels.com/photos/6873088/pexels-photo-6873088.jpeg',
  price_per_hour = 120,
  capacity = 15,
  location = 'Eastside',
  category = 'photography'
WHERE id = '323e4567-e89b-12d3-a456-426614174002';