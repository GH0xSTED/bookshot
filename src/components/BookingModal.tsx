import React from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/Dialog';
import { Button } from './ui/Button';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onDelete?: () => void;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  selectedEvent: any;
  pricePerHour: number;
  isExisting?: boolean;
}

export function BookingModal({
  isOpen,
  onClose,
  onConfirm,
  onDelete,
  title,
  setTitle,
  description,
  setDescription,
  selectedEvent,
  pricePerHour,
  isExisting = false,
}: BookingModalProps) {
  if (!selectedEvent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isExisting ? 'Edit Booking' : 'New Booking'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {format(new Date(selectedEvent.start), 'MMMM d, yyyy')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">
                {format(new Date(selectedEvent.start), 'h:mm a')} - {format(new Date(selectedEvent.end), 'h:mm a')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{selectedEvent.hours} hours</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium">${pricePerHour * selectedEvent.hours}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="bookingTitle" className="block text-sm font-medium text-gray-700">
                Booking Title
              </label>
              <input
                type="text"
                id="bookingTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Product Photoshoot"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="bookingDescription" className="block text-sm font-medium text-gray-700">
                Description (optional)
              </label>
              <textarea
                id="bookingDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Add any notes or requirements for your booking..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          {isExisting && onDelete && (
            <Button
              variant="destructive"
              onClick={onDelete}
              className="mr-auto"
            >
              Delete Booking
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            {isExisting ? 'Save Changes' : 'Confirm Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}