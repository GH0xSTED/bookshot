import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { supabase } from '../lib/supabase';

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

export function AdminPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [studios, setStudios] = useState<Studio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStudio, setEditingStudio] = useState<Studio | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  async function handleSaveStudio(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const studioData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      image_url: formData.get('image_url') as string,
      price_per_hour: parseInt(formData.get('price_per_hour') as string),
      capacity: parseInt(formData.get('capacity') as string),
      location: formData.get('location') as string,
      category: formData.get('category') as string,
    };

    try {
      if (editingStudio) {
        const { error } = await supabase
          .from('studios')
          .update(studioData)
          .eq('id', editingStudio.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Studio updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('studios')
          .insert([studioData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Studio created successfully",
        });
      }

      setIsModalOpen(false);
      setEditingStudio(null);
      loadStudios();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  }

  async function handleDeleteStudio(studioId: string) {
    if (!confirm('Are you sure you want to delete this studio?')) return;

    try {
      const { error } = await supabase
        .from('studios')
        .delete()
        .eq('id', studioId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Studio deleted successfully",
      });
      loadStudios();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete studio: " + error.message,
      });
    }
  }

  const formatPrice = (price: number) => {
    return price === 0 ? 'FREE' : `$${price}/hour`;
  };

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Studio Management</h1>
        <Button
          onClick={() => {
            setEditingStudio(null);
            setIsModalOpen(true);
          }}
          icon={<Plus size={18} />}
        >
          Add Studio
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {studios.map((studio) => (
            <Card key={studio.id}>
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
                <h3 className="text-xl font-semibold text-gray-900">{studio.name}</h3>
                <p className="mt-2 text-gray-600 line-clamp-2">{studio.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">{studio.location}</span>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Edit2 size={16} />}
                      onClick={() => {
                        setEditingStudio(studio);
                        setIsModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      icon={<Trash2 size={16} />}
                      onClick={() => handleDeleteStudio(studio.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Studio Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSaveStudio} className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingStudio ? 'Edit Studio' : 'Add New Studio'}
              </h2>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={editingStudio?.name}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={editingStudio?.description}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  type="url"
                  id="image_url"
                  name="image_url"
                  defaultValue={editingStudio?.image_url}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price_per_hour" className="block text-sm font-medium text-gray-700">
                    Price per Hour
                  </label>
                  <input
                    type="number"
                    id="price_per_hour"
                    name="price_per_hour"
                    defaultValue={editingStudio?.price_per_hour}
                    required
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                    Capacity
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    defaultValue={editingStudio?.capacity}
                    required
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  defaultValue={editingStudio?.location}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue={editingStudio?.category}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="photography">Photography</option>
                  <option value="audio">Audio Recording</option>
                  <option value="video">Video Production</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingStudio(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingStudio ? 'Update Studio' : 'Create Studio'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}