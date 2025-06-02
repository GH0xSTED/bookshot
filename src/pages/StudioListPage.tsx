import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, Users, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';

export function StudioListPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [studios, setStudios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studioAvailability, setStudioAvailability] = useState<Record<string, string>>({});
  
  useEffect(() => {
    loadStudios();
  }, []);

  async function loadStudios() {
    try {
      const { data, error } = await supabase
        .from('studios')
        .select('*')
        .order('name');

      if (error) throw error;
      setStudios(data || []);

      // Check availability for each studio
      const now = new Date();
      const currentHour = now.getHours();
      const isOperatingHours = currentHour >= 8 && currentHour < 20;

      if (!isOperatingHours) {
        const availability = data?.reduce((acc: Record<string, string>, studio: any) => {
          acc[studio.id] = 'Currently Closed';
          return acc;
        }, {});
        setStudioAvailability(availability || {});
        return;
      }

      // Check current bookings
      const startTime = new Date();
      startTime.setMinutes(0, 0, 0);
      const endTime = new Date();
      endTime.setMinutes(59, 59, 999);

      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('studio_id')
        .gte('start_time', startTime.toISOString())
        .lte('end_time', endTime.toISOString());

      if (bookingsError) throw bookingsError;

      const occupiedStudios = new Set(bookings?.map(b => b.studio_id));
      
      const availability = data?.reduce((acc: Record<string, string>, studio: any) => {
        acc[studio.id] = occupiedStudios.has(studio.id) ? 'Currently Occupied' : 'Available Now';
        return acc;
      }, {});
      
      setStudioAvailability(availability || {});
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load studios: " + error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'photography', label: 'Photography' },
    { value: 'audio', label: 'Audio Recording' },
    { value: 'video', label: 'Video Production' },
  ];

  const filteredStudios = studios.filter((studio: any) => {
    const matchesSearch = studio.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         studio.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || studio.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return price === 0 ? 'FREE' : `$${price}/hour`;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Find Your Perfect Studio Space
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Browse our selection of professional studios for any creative need
          </p>
        </div>
        
        {/* Search and Filter */}
        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or description"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-64 flex">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out sm:text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Studio List */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredStudios.length > 0 ? (
            filteredStudios.map((studio: any) => (
              <Card key={studio.id} className="transition-transform hover:scale-105">
                <div className="h-48 w-full relative">
                  <img 
                    src={studio.image_url} 
                    alt={studio.name} 
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 bg-primary-600 text-white px-3 py-1 text-sm font-medium">
                    {formatPrice(studio.price_per_hour)}
                  </div>
                </div>
                
                <CardBody>
                  <div className="mb-2 flex items-center text-sm text-gray-500">
                    <MapPin size={16} className="mr-1" />
                    {studio.location}
                    <span className="mx-2">•</span>
                    <Users size={16} className="mr-1" />
                    Up to {studio.capacity}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900">{studio.name}</h3>
                  <p className="mt-2 text-gray-600 line-clamp-2">{studio.description}</p>
                  
                  <div className="mt-6 flex justify-between items-center">
                    <div className="flex items-center text-sm">
                      <Clock size={16} className="mr-1" />
                      <span className={
                        studioAvailability[studio.id] === 'Available Now'
                          ? 'text-green-600'
                          : studioAvailability[studio.id] === 'Currently Occupied'
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }>
                        {studioAvailability[studio.id]}
                      </span>
                    </div>
                    <Link to={`/studios/${studio.id}`}>
                      <Button>View Details</Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No studios found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}