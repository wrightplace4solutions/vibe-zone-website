// Google Calendar Integration
// This handles adding events to Google Calendar after booking confirmation

interface CalendarEvent {
  summary: string;
  description: string;
  location: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: Array<{ email: string }>;
}

export async function addToGoogleCalendar(booking: {
  customer_name: string;
  customer_email: string;
  event_date: string;
  event_type: string;
  venue_name?: string;
  street_address?: string;
  city?: string;
  state?: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
}) {
  try {
    // Format the event for Google Calendar
    const eventDate = new Date(booking.event_date);
    const startTime = booking.start_time || '18:00';
    const endTime = booking.end_time || '22:00';
    
    const [startHour, startMin] = startTime.split(':');
    const [endHour, endMin] = endTime.split(':');
    
    const startDateTime = new Date(eventDate);
    startDateTime.setHours(parseInt(startHour), parseInt(startMin));
    
    const endDateTime = new Date(eventDate);
    endDateTime.setHours(parseInt(endHour), parseInt(endMin));
    
    const location = [
      booking.venue_name,
      booking.street_address,
      booking.city,
      booking.state
    ].filter(Boolean).join(', ');

    const event: CalendarEvent = {
      summary: `${booking.event_type} - ${booking.customer_name}`,
      description: `
Event Type: ${booking.event_type}
Customer: ${booking.customer_name}
Email: ${booking.customer_email}
${booking.notes ? `Notes: ${booking.notes}` : ''}
      `.trim(),
      location: location,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/New_York', // Update to your timezone
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/New_York', // Update to your timezone
      },
      attendees: [
        { email: booking.customer_email },
      ],
    };

    // Call your backend endpoint to add to calendar
    // Since we can't use Edge Functions, we'll create a simple serverless function
    const response = await fetch('/api/add-to-calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event }),
    });

    if (!response.ok) {
      throw new Error('Failed to add to calendar');
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding to Google Calendar:', error);
    return { success: false, error };
  }
}
