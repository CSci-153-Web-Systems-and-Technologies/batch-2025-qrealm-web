"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  ArrowLeft,
  ChevronRight
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




import { formatFullDate, formatTime, isToday } from "@/lib/utils/";
import { EventDetailCard } from "@/components/events/event-detail-card";
import { QRInfoCard } from "@/components/events/qr-info-card";
import { QRDisplayActions } from "@/components/events/qr-display-actions";

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
  deleteButton?: React.ReactNode;
}
export function QRCodeDisplay({
  qrCodeUrl,
  eventCode,
  eventTitle,
  eventData = {},
  deleteButton,
}: QRCodeDisplayProps) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [statusMessa, setStatusMessage] = useState<string | null>(null);

  const coverImage = useEventCover(eventData?.cover_image_url || "");

  const { eventUploads } = useUploadStore();

  const uploads = eventData?.id ? eventUploads[eventData.id] || [] : [];

  const { fetchEventUploads } = useUploadStore(); 

  useEffect(() => {
  if (eventData?.id) {
    console.log('QRDisplay: Fetching uploads for event ID:', eventData.id);
    fetchEventUploads(eventData.id, true);
  }
  }, [eventData?.id, fetchEventUploads]);

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
    <div className="!max-w-6xl !mx-auto !p-6">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 brand-800 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}

        {/* Header with Breadcrumb */}
        <div className="space-y-4 !mb-8">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-1 p-0 h-auto hover:bg-transparent hover:text-gray-700 font-normal"
                  >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Dashboard</span>
                </Button>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gray-900 font-medium">Event</span>
            </div>
            
            {/* Page Title and Description */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Event Preview</h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Event details and configuration
                </p>
            </div>
        </div>



       <div className="!grid grid-cols-1 lg:grid-cols-2 !gap-8">
        {/* Event Information */}
        <div className="!space-y-6">
          <EventDetailCard
            eventTitle={eventTitle}
            eventData={eventData}
            coverImage={coverImage}
            uploads={uploads}
            formatFullDate={formatFullDate}
            formatTime={formatTime}
            isEventToday={isEventToday}
          />

          <QRInfoCard eventCode={eventCode} />
        </div>

        {/* QR Code Display and Actions */}
        <div className="!space-y-6">
          <QRDisplayActions
            qrCodeUrl={qrCodeUrl}
            eventCode={eventCode}
            eventTitle={eventTitle}
            isDownloading={isDownloading}
            onCopyLink={copyQRLink}
            onShare={shareQRCode}
            onPrint={printQRCode}
            onDownloadPNG={handleDownloadPNG}
            onDownloadSVG={handleDownloadSVG}
            onDownloadPDF={downloadPDF}
          />

          {/* Danger Zone */}
          {deleteButton && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-1 bg-red-600 rounded-full"></div>
                <h3 className="text-base font-bold text-red-900">Danger Zone</h3>
              </div>
              <p className="text-xs text-red-700 mb-3">
                Permanently delete this event and all associated data. This action cannot be undone.
              </p>
              {deleteButton}
            </div>
          )}
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
