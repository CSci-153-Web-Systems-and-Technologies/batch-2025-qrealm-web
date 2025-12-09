import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface QRInfoCardProps {
  eventCode: string;
  showUrl?: boolean;
  showInstructions?: boolean;
  customInstructions?: string[];
  className?: string;
  eventUrl?: string; 
}

export function QRInfoCard({ 
  eventCode,
  showUrl = true,
  showInstructions = true,
  customInstructions,
  className = "",
   eventUrl,
}: QRInfoCardProps) {
  const defaultInstructions = [
    "Print and display this QR code at your event",
    "Guests can scan to access the photo gallery",
    "Scan the QR code with your phone camera",
    "Upload photos directly to the event gallery",
    "Photos are processed automatically"
  ];

  const displayUrl = eventUrl || 
    (typeof window !== 'undefined' ? `${window.location.origin}/event/${eventCode}` : `/event/${eventCode}`);
  
  const instructions = customInstructions || defaultInstructions;
  
  return (
    <Card className={`${className} !p-4`}>
      <CardHeader>
        <CardTitle className="!flex !items-center !px-2">QR Code Information</CardTitle>
      </CardHeader>
      <CardContent className="!space-y-4">
        <div className="!space-y-3">
          <div>
            <label className="!text-sm !font-medium">Event Code</label>
            <div className="!mt-1 !p-3 !bg-brand-50 !rounded-lg">
              <code className="!text-sm !font-mono !font-bold">
                {eventCode}
              </code>
            </div>
          </div>

          {showUrl && (
            <div>
              <label className="!text-sm !font-medium">Event URL</label>
              <div className="!mt-1 !p-3 !bg-brand-50 !rounded-lg">
                <code className="!text-sm !break-all">
                  {displayUrl}
                </code>
              </div>
            </div>
          )}
        </div>

        {showInstructions && (
          <>
            <Separator />
            <div className="!space-y-2">
              <h4 className="!font-medium">Instructions for Attendees</h4>
              <div className="!text-sm !text-gray-600 !space-y-1">
                {instructions.map((instruction, index) => (
                  <p key={index}>• {instruction}</p>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}