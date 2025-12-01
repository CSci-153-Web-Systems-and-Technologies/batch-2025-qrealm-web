'use client'

import { useState } from 'react'
import { Download, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface QRCodeDisplayProps {
  qrCodeUrl: string
  eventCode: string
  eventTitle: string
}

export function QRCodeDisplay({ qrCodeUrl, eventCode, eventTitle }: QRCodeDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      // Fetch the QR code image
      const response = await fetch(qrCodeUrl)
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `qrealm-${eventCode}-${eventTitle.replace(/\s+/g, '-').toLowerCase()}.png`
      
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading QR code:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Event QR Code
        </CardTitle>
        <CardDescription>
          Scan this code to access the event gallery
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Image */}
        <div className="flex justify-center">
          <img 
            src={qrCodeUrl} 
            alt={`QR Code for ${eventTitle}`}
            className="w-48 h-48 border rounded-lg"
          />
        </div>

        {/* Event Code */}
        <div className="text-center">
          <p className="text-sm text-gray-600">Event Code:</p>
          <p className="font-mono font-bold text-lg">{eventCode}</p>
        </div>

        {/* Download Button */}
        <Button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {isDownloading ? 'Downloading...' : 'Download QR Code'}
        </Button>

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Print and display this QR code at your event</p>
          <p>• Guests can scan to access the photo gallery</p>
          <p>• Event URL: /event/{eventCode}</p>
        </div>
      </CardContent>
    </Card>
  )
}