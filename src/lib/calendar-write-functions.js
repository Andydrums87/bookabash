// /lib/calendar-write-functions.js

/**
 * Create a Google Calendar event
 */
export async function createGoogleCalendarEvent({
    accessToken,
    calendarId = 'primary',
    event
  }) {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: event.title,
          description: event.description,
          location: event.location,
          start: {
            dateTime: event.startTime,
            timeZone: event.timeZone || 'Europe/London',
          },
          end: {
            dateTime: event.endTime,
            timeZone: event.timeZone || 'Europe/London',
          },
          attendees: event.attendees?.map(email => ({ email })),
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 30 },
            ],
          },
        }),
      }
    );
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create Google Calendar event: ${error.error?.message || 'Unknown error'}`);
    }
  
    return await response.json();
  }
  
  /**
   * Create an Outlook Calendar event
   */
  export async function createOutlookCalendarEvent({
    accessToken,
    event
  }) {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: event.title,
          body: {
            contentType: 'HTML',
            content: event.description || '',
          },
          start: {
            dateTime: event.startTime,
            timeZone: event.timeZone || 'Europe/London',
          },
          end: {
            dateTime: event.endTime,
            timeZone: event.timeZone || 'Europe/London',
          },
          location: event.location ? {
            displayName: event.location
          } : undefined,
          attendees: event.attendees?.map(email => ({
            emailAddress: { address: email },
            type: 'required'
          })),
          isReminderOn: true,
          reminderMinutesBeforeStart: 30,
        }),
      }
    );
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create Outlook event: ${error.error?.message || 'Unknown error'}`);
    }
  
    return await response.json();
  }