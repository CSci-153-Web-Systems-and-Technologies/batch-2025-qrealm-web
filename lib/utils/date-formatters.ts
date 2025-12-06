/**
 * Format date to full readable string (e.g., "Monday, January 15, 2024")
 */
export const formatFullDate = (dateString?: string | null): string => {
  if (!dateString) return "Date not set";

  try {
    // Handle different date formats
    const date = new Date(dateString);
    
    // Validate date
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    
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

/**
 * Format time string (e.g., "14:30" → "2:30 PM")
 * Supports: "14:30", "14:30:00", "2:30 PM"
 */
export const formatTime = (timeString?: string | null): string => {
  if (!timeString || timeString.trim() === "") return "Time not set";

  try {
    // Handle already formatted times
    if (timeString.includes("AM") || timeString.includes("PM")) {
      return timeString;
    }

    const [hours, minutes, seconds] = timeString.split(":");
    const hour = parseInt(hours);
    const minute = minutes || "00";
    
    // Validate
    if (isNaN(hour) || hour < 0 || hour > 23) {
      return "Invalid time";
    }

    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    
    return `${formattedHour}:${minute.padStart(2, "0")} ${period}`;
  } catch (error) {
    console.error("Time formatting error:", error);
    return "Invalid time";
  }
};

/**
 * Combine date and time into single readable string
 */
export const formatDateTime = (
  dateString?: string | null, 
  timeString?: string | null
): string => {
  const datePart = formatFullDate(dateString);
  const timePart = formatTime(timeString);

  if (timePart === "Time not set") {
    return datePart;
  }

  return `${datePart} at ${timePart}`;
};

/**
 * Format relative time (e.g., "Tomorrow", "Next week", "3 days ago")
 */
export const formatRelativeDate = (dateString?: string | null): string => {
  if (!dateString) return "";

  try {
    const eventDate = new Date(dateString);
    const today = new Date();
    
    if (isNaN(eventDate.getTime())) {
      return "";
    }

    // Reset times for accurate day comparison
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

    const diffTime = eventDay.getTime() - todayDay.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`;
    
    return "";
  } catch (error) {
    console.error("Relative date formatting error:", error);
    return "";
  }
};

/**
 * Check if date is today
 */
export const isToday = (dateString?: string | null): boolean => {
  if (!dateString) return false;

  try {
    const eventDate = new Date(dateString);
    const today = new Date();
    
    if (isNaN(eventDate.getTime())) {
      return false;
    }

    return eventDate.toDateString() === today.toDateString();
  } catch (error) {
    console.error("isToday check error:", error);
    return false;
  }
};

/**
 * Check if event is in the past
 */
export const isPastEvent = (dateString?: string | null): boolean => {
  if (!dateString) return false;

  try {
    const eventDate = new Date(dateString);
    const today = new Date();
    
    if (isNaN(eventDate.getTime())) {
      return false;
    }
    
    // Compare dates without times
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
    
    return eventDay < todayDay;
  } catch (error) {
    console.error("isPastEvent check error:", error);
    return false;
  }
};

/**
 * Get days until event (negative for past events)
 */
export const getDaysUntilEvent = (dateString?: string | null): number | null => {
  if (!dateString) return null;

  try {
    const eventDate = new Date(dateString);
    const today = new Date();
    
    if (isNaN(eventDate.getTime())) {
      return null;
    }

    // Reset times
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

    const diffTime = eventDay.getTime() - todayDay.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error("getDaysUntilEvent error:", error);
    return null;
  }
};

/**
 * Get event status configuration (without React components)
 * Returns data only, not JSX
 */
export interface EventStatusConfig {
  label: string;
  color: string;
  iconName: "calendar" | "clock" | "alert-circle";
}

export const getEventStatusConfig = (
  dateString?: string | null
): EventStatusConfig => {
  if (!dateString) {
    return {
      label: "No date set",
      color: "bg-gray-100 text-gray-800",
      iconName: "calendar",
    };
  }

  try {
    const eventDate = new Date(dateString);
    const today = new Date();
    
    if (isNaN(eventDate.getTime())) {
      return {
        label: "Date Error",
        color: "bg-red-100 text-red-800",
        iconName: "alert-circle",
      };
    }

    // Reset times for day comparison
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
        iconName: "calendar",
      };
    } else if (eventDay.getTime() === todayDay.getTime()) {
      return {
        label: "Happening Today",
        color: "bg-green-100 text-green-800",
        iconName: "clock",
      };
    } else {
      const diffDays = Math.ceil(
        (eventDay.getTime() - todayDay.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays <= 7) {
        return {
          label: "This Week",
          color: "bg-blue-100 text-blue-800",
          iconName: "calendar",
        };
      } else if (diffDays <= 30) {
        return {
          label: "This Month",
          color: "bg-purple-100 text-purple-800",
          iconName: "calendar",
        };
      } else {
        return {
          label: "Upcoming",
          color: "bg-yellow-100 text-yellow-800",
          iconName: "calendar",
        };
      }
    }
  } catch (error) {
    console.error("Event status error:", error);
    return {
      label: "Date Error",
      color: "bg-red-100 text-red-800",
      iconName: "alert-circle",
    };
  }
};

/**
 * Format date range (for multi-day events)
 */
export const formatDateRange = (
  startDate?: string | null,
  endDate?: string | null
): string => {
  if (!startDate) return "Date not set";
  
  const startFormatted = formatFullDate(startDate);
  
  if (!endDate || startDate === endDate) {
    return startFormatted;
  }
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return `${startFormatted} - Invalid end date`;
    }
    
    // Same month, different days
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })} - ${end.getDate()}, ${end.getFullYear()}`;
    }
    
    // Different months
    return `${startFormatted} - ${formatFullDate(endDate)}`;
  } catch {
    return `${startFormatted} - ${formatFullDate(endDate)}`;
  }
};

/**
 * Get timezone abbreviation (e.g., "EST", "PST")
 */
export const getTimezoneAbbreviation = (): string => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    }).formatToParts(date);
    
    const timezonePart = parts.find(part => part.type === "timeZoneName");
    return timezonePart?.value || "";
  } catch {
    return "";
  }
};

/**
 * Validate date string
 */
export const isValidDate = (dateString?: string | null): boolean => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Get month and year only (e.g., "January 2024")
 */
export const formatMonthYear = (dateString?: string | null): string => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
};