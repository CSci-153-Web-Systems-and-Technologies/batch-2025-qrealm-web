'use client'

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  time: string
  onTimeChange: (time: string) => void
  disabled?: boolean
}

export function DateTimePicker({ 
  date, 
  onDateChange, 
  time, 
  onTimeChange, 
  disabled 
}: DateTimePickerProps) {
  return (
    <div className="flex flex-col sm:flex-row !gap-3 w-full">
      {/* Date Picker */}
      <div className="flex-2">
        <Label htmlFor="date-picker">Date <span className="text-red-500">*</span></Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal !mt-1 !p-2 border-gray-300",
                !date && "text-muted-foreground"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full min-w-[200px] p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateChange}
              initialFocus
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="w-full"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Input */}
      <div className="flex-1">
        <Label htmlFor="time-input">Time <span className="text-red-500">*</span></Label>
        <Input
          id="time-input"
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          disabled={disabled}
          className="w-full h-10 !mt-1 !p-2"
        />
      </div>
    </div>
  )
}