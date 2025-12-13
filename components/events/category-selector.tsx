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
          className="w-full justify-between !px-3 !py-2 h-auto min-h-[40px] border-gray-300"
          disabled={disabled}
        >
          {selectedCategory ? (
            <div className="flex flex-col items-start text-left w-full">
              <span className="font-medium">{selectedCategory.label}</span>
              <span className="text-xs text-gray-500 !mt-1"> {/* Moved description to new line */}
                {selectedCategory.description}
              </span>
            </div>
          ) : (
            <span className="text-gray-500">Select category...</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2" align="start"> {/* Added padding */}
        <Command>
          <CommandInput placeholder="Search categories..." className="h-9" />
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
                  className="flex flex-col items-start py-3 px-2 my-1 rounded-md hover:bg-gray-50" // Added spacing
                >
                  <div className="flex items-center w-full">
                    <Check
                      className={cn(
                        "!mr-3 h-4 w-4 flex-shrink-0", // Increased spacing
                        value === category.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col items-start flex-1">
                      <span className="font-medium text-sm">{category.label}</span>
                      <span className="text-xs text-gray-500 mt-1 text-left"> {/* Description on new line */}
                        {category.description}
                      </span>
                    </div>
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