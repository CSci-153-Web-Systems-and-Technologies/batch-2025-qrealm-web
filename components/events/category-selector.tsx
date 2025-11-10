'use client'

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { EVENT_CATEGORIES, EventCategoryValue } from '@/types'

interface CategorySelectorProps {
  value: EventCategoryValue
  onValueChange: (value: EventCategoryValue) => void
  disabled?: boolean
}

export function CategorySelector({ value, onValueChange, disabled }: CategorySelectorProps) {
  const [open, setOpen] = useState(false)

  const selectedCategory = EVENT_CATEGORIES.find(cat => cat.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedCategory ? (
            <div className="flex items-center">
              <span className="mr-2">{selectedCategory.label}</span>
              <span className="text-sm text-gray-500">
                {selectedCategory.description}
              </span>
            </div>
          ) : (
            "Select category..."
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {EVENT_CATEGORIES.map((category) => (
                <CommandItem
                  key={category.value}
                  value={category.value}
                  onSelect={() => {
                    onValueChange(category.value)
                    setOpen(false)
                  }}
                  className="flex flex-col items-start py-3"
                >
                  <div className="flex items-center">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === category.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="font-medium">{category.label}</span>
                  </div>
                  <div className="ml-6 text-sm text-gray-500">
                    {category.description}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}