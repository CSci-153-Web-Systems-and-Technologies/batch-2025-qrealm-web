import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface EventDetailCardProps {
  eventTitle: string;
  eventData: {
    description?: string;
    date?: string;
    time?: string;
    location?: string;
    organizer?: string;
    cover_image_url?: string;
    allow_photo_upload?: boolean;
    max_photos?: number;
    is_public?: boolean;
  };
  coverImage: string;
  uploads: any[];
  formatFullDate: (dateString?: string) => string;
  formatTime: (timeString?: string) => string;
  isEventToday: boolean;
}

export function EventDetailCard({
  eventTitle,
  eventData,
  coverImage,
  uploads,
  formatFullDate,
  formatTime,
  isEventToday,
}: EventDetailCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Event Header with Image */}
        <div className="flex items-start gap-4">
          <img
            src={coverImage}
            alt="Event Cover"
            className="w-32 h-32 rounded-lg object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-lg font-medium">{eventTitle}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {eventData.description}
            </p>

            {/* Event Metadata */}
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
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Upload Settings */}
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
  );
}