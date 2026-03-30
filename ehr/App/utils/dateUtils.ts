/**
 * Utility functions for safe date parsing and formatting
 */

/**
 * Safely parse a date string that might come in different formats from the API
 * @param dateString - Date string from API (e.g., "2026-03-11 08:45:00" or "2026-03-11T08:45:00Z")
 * @returns Valid Date object or current date if parsing fails
 */
export const safeParseDate = (dateString: string | null | undefined): Date => {
  if (!dateString) {
    return new Date();
  }
  
  try {
    let parsedDate: Date;
    
    if (dateString.includes('T')) {
      // Already ISO format: "2026-03-11T08:45:00Z"
      parsedDate = new Date(dateString);
    } else if (dateString.includes(' ')) {
      // Space format: "2026-03-11 08:45:00" → convert to ISO
      parsedDate = new Date(dateString.replace(' ', 'T'));
    } else {
      // Try parsing as-is
      parsedDate = new Date(dateString);
    }
    
    // Check if date is valid
    if (isNaN(parsedDate.getTime())) {
      console.warn('Invalid date string, using current date:', dateString);
      return new Date();
    }
    
    return parsedDate;
  } catch (error) {
    console.warn('Error parsing date, using current date:', dateString, error);
    return new Date();
  }
};

/**
 * Get display date for nurse screens - either record date (doctor view) or current date (nurse view)
 * @param readOnly - Whether in read-only mode (doctor view)
 * @param recordDate - Record date string from API
 * @returns Date object for display
 */
export const getDisplayDate = (readOnly: boolean, recordDate?: string): Date => {
  if (readOnly && recordDate) {
    return safeParseDate(recordDate);
  }
  return new Date();
};

/**
 * Format time ago string safely
 * @param timestamp - Timestamp string from API
 * @returns Formatted time ago string or fallback
 */
export const formatTimeAgo = (timestamp: string | null | undefined): string => {
  if (!timestamp) return 'No updates';
  
  try {
    const updated = safeParseDate(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - updated.getTime();

    if (diffInMs < 0) return 'Just now';

    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHrs = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHrs / 24);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHrs < 24) return `${diffInHrs}h ago`;
    return `${diffInDays}d ago`;
  } catch (error) {
    console.warn('Error formatting time ago:', timestamp, error);
    return 'Invalid date';
  }
};

/**
 * Format time string safely for doctor dashboard
 * @param dateString - Date string from API
 * @returns Formatted time string or fallback
 */
export const formatTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'No date';
  
  try {
    const updateDate = safeParseDate(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - updateDate.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return updateDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (error) {
    console.warn('Error formatting time:', dateString, error);
    return 'Invalid date';
  }
};