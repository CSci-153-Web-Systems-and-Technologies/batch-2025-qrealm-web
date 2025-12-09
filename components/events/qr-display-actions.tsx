import {
  Download,
  QrCode,
  Copy,
  Share2,
  Printer,
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
import { EventQRGenerator } from "@/lib/qr-generator";

interface QRDisplayActionsProps {
  qrCodeUrl: string;
  eventCode: string;
  eventTitle: string;
  isDownloading: boolean;
  onCopyLink: () => void;
  onShare: () => void;
  onPrint: () => void;
  onDownloadPNG: (highRes: boolean) => Promise<void>;
  onDownloadSVG: () => Promise<void>;
  onDownloadPDF: () => Promise<void>;
}

export function QRDisplayActions({
  qrCodeUrl,
  eventCode,
  eventTitle,
  isDownloading,
  onCopyLink,
  onShare,
  onPrint,
  onDownloadPNG,
  onDownloadSVG,
  onDownloadPDF,
}: QRDisplayActionsProps) {
  return (
    <div className="!space-y-6">
      <Card className='!p-4'>
        <CardHeader>
          <CardTitle className="!flex !items-center !gap-2">
            <QrCode className="h-5 w-5" />
            Event QR Code
          </CardTitle>
          <CardDescription>
            Scan this code to access the event gallery
          </CardDescription>
        </CardHeader>
        <CardContent className="!space-y-6">
          {/* QR Code Display */}
          <div className="!text-center">
            <div className="!inline-block !p-8 !bg-white !rounded-xl !shadow-inner !border">
              <img
                src={qrCodeUrl}
                alt={`QR Code for ${eventTitle}`}
                className="!w-64 !h-64 !rounded-lg"
              />
            </div>
          </div>

          {/* QR Code Actions */}
          <div className="!grid !grid-cols-2 !gap-3">
            <Button
              variant="outline"
              onClick={onCopyLink}
              className="!gap-2"
            >
              <Copy className="!h-4 !w-4" />
              Copy Link
            </Button>
            <Button
              variant="outline"
              onClick={onShare}
              className="!gap-2"
            >
              <Share2 className="!h-4 !w-4" />
              Share
            </Button>
            <Button
              variant="outline"
              onClick={() => onDownloadPNG(false)}
              disabled={isDownloading}
              className="!gap-2"
            >
              <Download className="!h-4 !w-4" />
              {isDownloading ? "Downloading..." : "Download PNG"}
            </Button>
            <Button
              variant="outline"
              onClick={onPrint}
              className="!gap-2"
            >
              <Printer className="!h-4 !w-4" />
              Print
            </Button>
          </div>

          <Separator />

          <div className="!space-y-3">
            <h4 className="!font-medium">QR Code Formats</h4>
            <div className="!grid !grid-cols-1 !gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => onDownloadPNG(true)}
                disabled={isDownloading}
                className="bg-brand-600 hover:bg-brand-700 text-white"
              >
                Download PNG (High Resolution)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDownloadSVG}
                disabled={isDownloading}
              >
                Download SVG (Vector)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDownloadPDF}
                disabled={isDownloading}
              >
                Download PDF (Print Ready)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Feature - Commented out but kept for reference */}
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
  );
}