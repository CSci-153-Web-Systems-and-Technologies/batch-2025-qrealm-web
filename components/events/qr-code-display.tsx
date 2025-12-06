"use client";

import { useState, useEffect } from "react";
import {
  Download,
  QrCode,
  Calendar,
  MapPin,
  Users,
  Copy,
  Share2,
  Printer,
  Badge,
  Clock,
  CalendarDays,
  XCircle,
} from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEventCover } from "@/hooks/use-placeholder-image";
import { useUploadStore } from "@/stores/upload-store";
import { EventQRGenerator } from "@/lib/qr-generator";

interface QRCodeDisplayProps {
  qrCodeUrl: string;
  eventCode: string;
  eventTitle: string;
  eventData?: {
    id?: string;
    description?: string;
    date?: string;
    time?: string;
    location?: string;
    organizer?: string;
    cover_image_url?: string;
    allow_photo_upload?: boolean;
    max_photos?: number;
    is_public?: boolean;
    photosCount?: number;
    expected_attendees?: number;
    // status?: 'live' | 'scheduled' | 'ended' | 'draft' // Status feature soon
  };
}

export function QRCodeDisplay({
  qrCodeUrl,
  eventCode,
  eventTitle,
  eventData = {},
}: QRCodeDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [statusMessa, setStatusMessage] = useState<string | null>(null);

  const coverImage = useEventCover(eventData?.cover_image_url || "");

  const { eventUploads } = useUploadStore();

  const uploads = eventData?.id ? eventUploads[eventData.id] || [] : [];

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Debug logging - fix placement
  //   console.log("QR Code Display rendered with:", {
  //   eventTitle,
  //   eventCode,
  //   hasCoverImage: !!eventData?.cover_image_url,
  //   coverImageUrl: eventData?.cover_image_url
  // })

  // Format date function similar to event-gallery.tsx
  const formatFullDate = (dateString?: string): string => {
    if (!dateString) return "Date not set";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatTime = (timeString?: string): string => {
    if (!timeString || timeString.trim() === "") return "Time not set";

    try {
      // Handle both "HH:MM" and "HH:MM:SS" formats
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const minute = minutes || "00";

      const period = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 || 12;

      return `${formattedHour}:${minute.padStart(2, "0")} ${period}`;
    } catch (error) {
      return "Invalid time";
    }
  };

  const formatDateTime = (dateString?: string, timeString?: string): string => {
    const datePart = formatFullDate(dateString);
    const timePart = formatTime(timeString);

    if (timePart === "Time not set") {
      return datePart;
    }

    return `${datePart} at ${timePart}`;
  };

  /**
   * Format relative time (e.g., "Tomorrow", "Next week")
   */
  const formatRelativeDate = (dateString?: string): string => {
    if (!dateString) return "";

    try {
      const eventDate = new Date(dateString);
      const today = new Date();
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Tomorrow";
      if (diffDays === -1) return "Yesterday";
      if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
      if (diffDays < 0 && diffDays >= -7)
        return `${Math.abs(diffDays)} days ago`;

      return "";
    } catch (error) {
      return "";
    }
  };

  /**
   * Check if event is happening today
   */
  const isToday = (dateString?: string): boolean => {
    if (!dateString) return false;

    try {
      const eventDate = new Date(dateString);
      const today = new Date();

      return eventDate.toDateString() === today.toDateString();
    } catch (error) {
      return false;
    }
  };

  /**
   * Get event status based on date
   */
  const getEventStatus = (
    dateString?: string
  ): { label: string; color: string; icon: React.ReactNode } => {
    if (!dateString) {
      return {
        label: "No date set",
        color: "bg-gray-100 text-gray-800",
        icon: <CalendarDays className="h-3 w-3" />,
      };
    }

    try {
      const eventDate = new Date(dateString);
      const today = new Date();

      // Reset times for accurate date comparison
      const eventDay = new Date(
        eventDate.getFullYear(),
        eventDate.getMonth(),
        eventDate.getDate()
      );
      const todayDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      if (eventDay < todayDay) {
        return {
          label: "Past Event",
          color: "bg-gray-100 text-gray-800",
          icon: <CalendarDays className="h-3 w-3" />,
        };
      } else if (eventDay.getTime() === todayDay.getTime()) {
        return {
          label: "Happening Today",
          color: "bg-green-100 text-green-800",
          icon: <Clock className="h-3 w-3" />,
        };
      } else {
        const diffDays = Math.ceil(
          (eventDay.getTime() - todayDay.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays <= 7) {
          return {
            label: "This Week",
            color: "bg-blue-100 text-blue-800",
            icon: <CalendarDays className="h-3 w-3" />,
          };
        } else if (diffDays <= 30) {
          return {
            label: "This Month",
            color: "bg-purple-100 text-purple-800",
            icon: <CalendarDays className="h-3 w-3" />,
          };
        } else {
          return {
            label: "Upcoming",
            color: "bg-yellow-100 text-yellow-800",
            icon: <CalendarDays className="h-3 w-3" />,
          };
        }
      }
    } catch (error) {
      return {
        label: "Date Error",
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="h-3 w-3" />,
      };
    }
  };

  //const eventStatus = getEventStatus(eventData.date);
  //const relativeDate = formatRelativeDate(eventData.date);
  const isEventToday = isToday(eventData.date);

  // Updated download handler for different formats
  const handleDownloadPNG = async (highRes: boolean = false) => {
    setIsDownloading(true);
    try {
      const width = highRes ? 2000 : 300;
      const filename = `qrealm-${eventCode}-${eventTitle
        .replace(/\s+/g, "-")
        .toLowerCase()}${highRes ? "-highres" : ""}.png`;

      // Simple browser-compatible method
      const canvas = document.createElement("canvas");
      await QRCode.toCanvas(
        canvas,
        `${window.location.origin}/event/${eventCode}`,
        {
          width,
          margin: 2,
          errorCorrectionLevel: "H",
        }
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error("Failed to create blob");
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showSuccessToast(
          `QR code ${highRes ? "(high-res) " : ""}downloaded successfully!`
        );
        setIsDownloading(false);
      }, "image/png");
    } catch (error) {
      console.error("Error downloading PNG:", error);
      alert("Failed to download QR code. Please try again.");
      setIsDownloading(false);
    }
  };

  const handleDownloadSVG = async () => {
    setIsDownloading(true);
    try {
      const svgString = await EventQRGenerator.generateQRCodeSvg(eventCode);

      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `qrealm-${eventCode}-${eventTitle
        .replace(/\s+/g, "-")
        .toLowerCase()}.svg`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSuccessToast("SVG QR code downloaded successfully!");
    } catch (error) {
      console.error("Error downloading SVG:", error);
      alert("Failed to download SVG QR code. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // PDF: embed a PNG (high-res if possible) into an A4 PDF. Uses jspdf dynamically if available — otherwise falls back to printable window.
  const downloadPDF = async () => {
    setIsDownloading(true);
    setStatusMessage("Preparing PDF...");
    try {
      // First create a high-res PNG dataURL (re-use canvas technique)
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = qrCodeUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () =>
          reject(new Error("Failed to load QR image for PDF (CORS or 404)"));
      });

      const canvas = document.createElement("canvas");
      const targetSize = 2048;
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/png", 1);

      // Try dynamic import of jspdf
      try {
        // Note: this requires jspdf to be installed in your project. If not installed we fall back below.
        // npm install jspdf
        // Or keep fallback.
        const { jsPDF } = await import("jspdf");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // We'll center the image and keep margins
        const margin = 15; // mm
        const maxWidth = pageWidth - margin * 2;
        const aspect = canvas.height / canvas.width;
        const imgWidthMm = maxWidth;
        const imgHeightMm = imgWidthMm * aspect;

        // If height too big, scale down
        let drawWidth = imgWidthMm;
        let drawHeight = imgHeightMm;
        if (drawHeight > pageHeight - margin * 2) {
          drawHeight = pageHeight - margin * 2;
          drawWidth = drawHeight / aspect;
        }

        const x = (pageWidth - drawWidth) / 2;
        const y = (pageHeight - drawHeight) / 2;

        pdf.addImage(dataUrl, "PNG", x, y, drawWidth, drawHeight);
        const filename = `qrealm-${eventCode}-${eventTitle
          .replace(/\s+/g, "-")
          .toLowerCase()}.pdf`;
        pdf.save(filename);
        setStatusMessage("PDF downloaded");
      } catch (err) {
        // if jspdf not available, fallback to open printable window with the image and call print/save-to-PDF
        console.warn(
          "jspdf not available or failed, falling back to print window:",
          err
        );
        const html = `
          <html>
            <head>
              <title>${eventTitle} - QR</title>
              <style>
                body { margin: 0; padding: 0; display:flex; align-items:center; justify-content:center; height:100vh; }
                img{ max-width:100%; height:auto; display:block; }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" alt="QR Code" />
              <script>
                window.onload = function() {
                  setTimeout(() => { window.print(); }, 250);
                }
              </script>
            </body>
          </html>
        `;
        const w = window.open("", "_blank");
        if (!w) throw new Error("Popup blocked");
        w.document.open();
        w.document.write(html);
        w.document.close();
        setStatusMessage("Opened print window (use Save as PDF)");
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
      setStatusMessage("Failed to generate PDF (CORS or image load error)");
    } finally {
      setIsDownloading(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const copyQRLink = () => {
    const eventUrl = `${window.location.origin}/event/${eventCode}`;
    navigator.clipboard.writeText(eventUrl);
    // You can add a toast notification here if you have it set up
    alert("Event link copied to clipboard!");
    showSuccessToast("Event link copied to clipboard!");
  };

  const shareQRCode = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `QR Code for ${eventTitle}`,
          text: `Scan this QR code to upload photos to ${eventTitle}`,
          url: `${window.location.origin}/event/${eventCode}`,
        })
        .catch(() => {
          // Fallback to copy if share fails
          copyQRLink();
        });
    } else {
      copyQRLink();
    }
  };

  const printQRCode = () => {
    window.print();
  };

  // Status feature soon
  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case 'live': return 'bg-green-100 text-green-800';
  //     case 'scheduled': return 'bg-blue-100 text-blue-800';
  //     case 'ended': return 'bg-gray-100 text-gray-800';
  //     case 'draft': return 'bg-yellow-100 text-yellow-800';
  //     default: return 'bg-gray-100 text-gray-800';
  //   }
  // };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Event Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <img
                  src={coverImage}
                  alt="Preview Image"
                  className="w-50 h-50 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-medium">{eventTitle}</h3>
                    {/* <Badge className={getStatusColor(eventData.status)}>
                      {eventData.status}
                    </Badge> */}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {eventData.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{formatFullDate(eventData.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <span>{formatTime(eventData.time)}</span>
                        {isEventToday && (
                          <div className="text-sm text-green-600 font-medium">
                            Happening today!
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{eventData.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>Organizer: </span>
                      <p>{eventData.organizer}</p>
                      {/* <span>{eventData.expected_attendees || 0} expected attendees</span> */}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Upload Settings</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Uploads Allowed</span>
                    <p className="font-medium">
                      {eventData.allow_photo_upload ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Max Photos</span>
                    <p className="font-medium">{eventData.max_photos || 500}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Public Event</span>
                    <p className="font-medium">
                      {eventData.is_public ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Current Photos</span>
                    <p className="font-medium">
                      {uploads.length}
                      {eventData.max_photos && ` of ${eventData.max_photos}`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QR Code Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Event Code</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm font-mono font-bold">
                      {eventCode}
                    </code>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Event URL</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <code className="text-sm break-all">
                      /event/{eventCode}
                    </code>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Instructions for Attendees</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Print and display this QR code at your event</p>
                  <p>• Guests can scan to access the photo gallery</p>
                  <p>• Scan the QR code with your phone camera</p>
                  <p>• Upload photos directly to the event gallery</p>
                  <p>• Photos are processed automatically</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Display and Actions */}
        <div className="space-y-6">
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
            <CardContent className="space-y-6">
              {/* QR Code Display */}
              <div className="text-center">
                <div className="inline-block p-8 bg-white rounded-xl shadow-inner border">
                  <img
                    src={qrCodeUrl}
                    alt={`QR Code for ${eventTitle}`}
                    className="w-64 h-64 rounded-lg"
                  />
                </div>
              </div>

              {/* QR Code Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={copyQRLink}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  onClick={shareQRCode}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadPNG(false)}
                  disabled={isDownloading}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isDownloading ? "Downloading..." : "Download PNG"}
                </Button>
                <Button
                  variant="outline"
                  onClick={printQRCode}
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">QR Code Formats</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPNG(true)}
                    disabled={isDownloading}
                  >
                    Download PNG (High Resolution)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadSVG}
                    disabled={isDownloading}
                  >
                    Download SVG (Vector)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadPDF}
                    disabled={isDownloading}
                  >
                    Download PDF (Print Ready)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Future Feature */}
          {/* <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Print Template
                <span className="text-xs font-normal bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  Coming Soon
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Create printable flyers with QR codes for your event
              </p>
              
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full cursor-not-allowed"
                  disabled
                >
                  A4 Flyer Template
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full cursor-not-allowed"
                  disabled
                >
                  Table Tent Template
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full cursor-not-allowed"
                  disabled
                >
                  Business Card Template
                </Button>
              </div>

              <div className="text-xs text-gray-400">
                <p>Templates include event details and QR code for easy printing</p>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
