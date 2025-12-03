'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface UploaderNameInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  label?: string
  description?: string
}

export function UploaderNameInput({
  value,
  onChange,
  disabled = false,
  placeholder = 'Enter your name to be credited',
  label = 'Your Name (Optional)',
  description = 'Leave blank if you prefer to remain anonymous'
}: UploaderNameInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="uploader-name">{label}</Label>
      <Input
        id="uploader-name"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full"
      />
      {description && (
        <p className="text-sm text-gray-500">
          {description}
        </p>
      )}
    </div>
  )
}