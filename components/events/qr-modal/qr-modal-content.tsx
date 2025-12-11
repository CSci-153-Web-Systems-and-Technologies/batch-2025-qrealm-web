'use client'

import React, { useState } from 'react'
import { 
  Download, 
  QrCode, 
  Copy, 
  Share2, 
  Printer,
  Check,
  Smartphone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

interface QRModalContentProps {
  eventCode: string
  eventTitle: string
  qrCodeUrl?: string  // Add this prop
}

export function QRModalContent({ eventCode, eventTitle, qrCodeUrl }: QRModalContentProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Use provided QR code URL or generate fallback
  const getEventUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/event/${eventCode}`
    }
    return `/event/${eventCode}`
  }

  const eventUrl = getEventUrl()
  
  // Use stored QR code if available, otherwise generate with API
  const finalQrCodeUrl = qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(eventUrl)}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Join ${eventTitle}`,
          text: `Scan the QR code to access ${eventTitle} event gallery`,
          url: eventUrl,
        })
      } else {
        handleCopyLink()
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const handleDownloadPNG = async (highRes: boolean = false) => {
    try {
      setIsDownloading(true)
      
      // If we have a stored QR code, download it directly
      if (qrCodeUrl) {
        const response = await fetch(qrCodeUrl)
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `${eventTitle.replace(/\s+/g, '-')}-qr-code${highRes ? '-high-res' : ''}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
      } else {
        // Fallback to generating QR code
        const size = highRes ? 1000 : 300
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(eventUrl)}`
        
        const response = await fetch(url)
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `${eventTitle.replace(/\s+/g, '-')}-qr-code${highRes ? '-high-res' : ''}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
      }
    } catch (error) {
      console.error('Error downloading QR code:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownloadSVG = async () => {
    try {
      setIsDownloading(true)
      
      // If we have a stored QR code and it's an SVG, download it
      if (qrCodeUrl && qrCodeUrl.includes('.svg')) {
        const response = await fetch(qrCodeUrl)
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `${eventTitle.replace(/\s+/g, '-')}-qr-code.svg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
      } else {
        // Generate SVG fallback
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=svg&data=${encodeURIComponent(eventUrl)}`
        
        const response = await fetch(url)
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = `${eventTitle.replace(/\s+/g, '-')}-qr-code.svg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
      }
    } catch (error) {
      console.error('Error downloading SVG:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center gap-2 mb-2">
          <QrCode className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">Event QR Code</CardTitle>
        </div>
        <CardDescription>
          Scan to access the event gallery
        </CardDescription>
      </CardHeader>

      {/* QR Code Display */}
      <div className="text-center">
        <div className="inline-block p-6 bg-white rounded-xl shadow-inner border border-gray-200">
          <img
            src={finalQrCodeUrl}
            alt={`QR Code for ${eventTitle}`}
            className="w-64 h-64 rounded-lg"
            onError={(e) => {
              // Fallback if QR code fails to load
              const target = e.target as HTMLImageElement
              target.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(eventUrl)}`
            }}
          />
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Point your camera at this code
        </p>
      </div>

      {/* Event Info */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">{eventTitle}</h3>
          <Badge variant="outline">{eventCode}</Badge>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
          {eventUrl}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={handleCopyLink}
          className="gap-2"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleDownloadPNG(false)}
          disabled={isDownloading}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          PNG
        </Button>
      </div>

      <Separator />

      {/* Download Options */}
      <div className="space-y-3">
        {/* <h4 className="font-medium flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          Download Formats
        </h4> */}
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant="default"
            onClick={() => handleDownloadPNG(true)}
            disabled={isDownloading}
            className="w-full justify-start gap-2"
          >
            <Download className="h-4 w-4" />
            High Resolution PNG
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadSVG}
            disabled={isDownloading}
            className="w-full justify-start gap-2"
          >
            <Download className="h-4 w-4" />
            Vector SVG (Scalable)
          </Button>
        </div>
      </div>

      <div className="pt-4 border-t">
        <p className="text-xs text-gray-500 text-center">
          This QR code will always redirect to this event page
        </p>
      </div>
    </div>
  )
}