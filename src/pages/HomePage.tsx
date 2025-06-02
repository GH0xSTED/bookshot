import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, Check, Star } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';

export function HomePage() {
  const { toast } = useToast();
  const [studios, setStudios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStudios() {
      try {
        const { data, error } = await supabase
          .from('studios')
          .select('*')
          .limit(3);

        if (error) throw error;
        setStudios(data);
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

    loadStudios();
  }, []);

  const testimonials = [
    {
      id: 1,
      name: 'Alex Johnson',
      role: 'Photographer',
      content: 'StudioSpace made booking my photo sessions so easy. The interface is intuitive and the spaces are exactly as described. Love it!',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&dpr=1',
    },
    {
      id: 2,
      name: 'Sarah Williams',
      role: 'Podcaster',
      content: 'Finding a quality recording space used to be such a hassle. With StudioSpace, I can book my weekly sessions in seconds. Game changer!',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&dpr=1',
    },
    {
      id: 3,
      name: 'Michael Chen',
      role: 'Video Producer',
      content: 'The variety of studio options is impressive. I\'ve found perfect spaces for different projects, all through one platform. Highly recommend!',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&dpr=1',
    },
  ];

  const features = [
    {
      icon: <Calendar className="h-6 w-6 text-primary-600" />,
      title: 'Simple Booking',
      description: 'Browse and book studios with our easy-to-use calendar system. See real-time availability.',
    },
    {
      icon: <Star className="h-6 w-6 text-primary-600" />,
      title: 'Quality Spaces',
      description: 'All studios are vetted for quality equipment, acoustics, and amenities.',
    },
    {
      icon: <Clock className="h-6 w-6 text-primary-600" />,
      title: 'Flexible Hours',
      description: 'Book by the hour, half-day, or full day. Only pay for the time you need.',
    },
    {
      icon: <Check className="h-6 w-6 text-primary-600" />,
      title: 'Instant Confirmation',
      description: 'Receive immediate booking confirmations and access details.',
    },
  ];

  const formatPrice = (price: number) => {
    return price === 0 ? 'FREE' : `$${price}/hour`;
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-900 to-primary-700 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Studio space background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-primary-700 mix-blend-multiply" />
        </div>
        
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <div className="md:w-2/3">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl animate-fade-in">
              Book Your Perfect Studio Space
            </h1>
            <p className="mt-6 text-xl text-gray-100 max-w-3xl animate-slide-up">
              Find and book professional studio spaces for photography, recording, podcasting, and more. 
              Simple booking process, transparent pricing, amazing spaces.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 animate-slide-up">
              <Link to="/studios">
                <Button size="lg" icon={<ArrowRight size={18} />} iconPosition="right">
                  Browse Studios
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="bg-white">
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Studios */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">Featured Spaces</h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
            Popular Studios
          </p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
            Discover our most-booked studio spaces across various categories.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : studios.length > 0 ? (
            studios.map((studio: any) => (
              <div key={studio.id} className="flex flex-col rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
                <div className="flex-shrink-0">
                  <img
                    className="h-48 w-full object-cover"
                    src={studio.image_url}
                    alt={studio.name}
                  />
                </div>
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary-600">{studio.category}</p>
                    <div className="block mt-2">
                      <p className="text-xl font-semibold text-gray-900">{studio.name}</p>
                      <p className="mt-3 text-base text-gray-500">
                        {studio.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {formatPrice(studio.price_per_hour)}
                      </span>
                    </div>
                    <div className="ml-auto">
                      <Link to={`/studios/${studio.id}`}>
                        <Button variant="primary" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No studios available at the moment.</p>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link to="/studios">
            <Button 
              variant="outline"
              icon={<ArrowRight size={18} />}
              iconPosition="right"
            >
              View All Studios
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">Features</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Why Choose StudioSpace
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              Our platform makes finding and booking studio space simple, transparent, and reliable.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg"
              >
                <div className="inline-flex items-center justify-center rounded-md bg-primary-50 p-3 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-base text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">Testimonials</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              What Our Users Say
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.id} 
                className="bg-white rounded-lg shadow-md p-6 border border-gray-100 transition-all hover:shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={testimonial.avatar}
                    alt={testimonial.name}
                  />
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className="inline-block text-yellow-400" 
                      fill="currentColor" 
                    />
                  ))}
                </div>
                <p className="text-gray-600 italic">{testimonial.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to find your perfect studio?</span>
            <span className="block text-primary-300">Start booking today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link to="/studios">
                <Button 
                  size="lg" 
                  className="bg-white text-primary-600 hover:bg-gray-100 hover:text-primary-700"
                >
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link to="/contact">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-primary-600">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}