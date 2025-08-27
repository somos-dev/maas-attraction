"use client"
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Calendar } from 'lucide-react';
import Label from './form/Label';
import { useFetchRoutesStore } from '@/store/fetchRoutesStore';
import { set } from 'date-fns';

interface DateTimePickerProps {
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
}) => {
  const getCurrentDate = () => new Date().toISOString().split('T')[0];
  const getCurrentTime = () => new Date().toTimeString().slice(0, 8);
  const {selectedDate, selectedTime, setSelectedDate, setSelectedTime, travelMode, travelType, setTravelMode, setTravelType} = useFetchRoutesStore()

  const setToNow = () => {
    setSelectedDate(getCurrentDate());
    setSelectedTime(getCurrentTime());
  };

  const [minTime, setMinTime] = useState<string | undefined>(undefined);

useEffect(() => {
  if (selectedDate === getCurrentDate()) {
    setMinTime(getCurrentTime());
  } else {
    setMinTime(undefined);
  }
}, [selectedDate]);

  return (
    <div className="px-3 space-y-1gap-0 py-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold">Travel Time</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={setToNow}
          type='button'
          className="font-medium border-primary text-primary hover:bg-primary/10"
          aria-label="Set date and time to now"
        >
          Now
        </Button>
      </div>

      <div className="flex gap-2 sm:flex-row flex-col sm:items-center justify-center">
        <div className="flex-1 mb-2">
          <Label>Travel Type</Label>
          <Select name='travel-type' value={travelType} onValueChange={setTravelType}>
            <SelectTrigger aria-label="Travel type" className="w-full">
              <SelectValue placeholder="Select travel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="departure">Depart at</SelectItem>
              <SelectItem value="arrival">Arrive by</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 mb-2">
          <Label>Travel Mode</Label>
          <Select name='travel-mode' value={travelMode} onValueChange={setTravelMode}>
            <SelectTrigger aria-label="Travel mode" className="w-full">
              <SelectValue placeholder="Select travel mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="walk">Walk</SelectItem>
              <SelectItem value="bus">Bus</SelectItem>
              <SelectItem value="bicycle">Bicycle</SelectItem>
              <SelectItem value="scooter">Scooter</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2 sm:flex-row flex-col sm:items-center justify-center ">
        <div className="flex-1 ">
          <label className="block text-md font-medium mb-1" htmlFor="date-input">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none sm:hidden" />
            <Input
              id="date-input"
              name="date-input"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 sm:pl-0"
              min={getCurrentDate()}
              aria-label="Select date"
              required
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-dm font-medium mb-1" htmlFor="time-input">
            Time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none sm:hidden" />
            <Input
              id="time-input"
              name='time-input'
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="pl-10 sm:pl-0"
              aria-label="Select time"
              required
              step="1"
              min={minTime}
              placeholder="--:--:--"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTimePicker;
