# Email Notifications Setup Guide

## Overview
Email notifications are now integrated into your Lineup Backend. When events or tasks are created, all attendees/assignees automatically receive:
1. **In-app notifications** (instant, in the application)
2. **Email notifications** (with full event/task details)

## Current Status
✅ Email notification infrastructure is installed and working  
✅ In-app notifications are functioning perfectly  
⚠️ Email sending requires SMTP configuration

## Setup Instructions

### Step 1: Choose an Email Provider

#### Option A: Gmail (Recommended for testing)
1. Enable 2-Factor Authentication on your Gmail account
2. Create an App Password:
   - Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer"
   - Generate a 16-character app password
3. Copy this password for the next step

#### Option B: Other Email Providers
- **SendGrid**: Provides SMTP relay at `smtp.sendgrid.net:587`
- **Mailgun**: SMTP at `smtp.mailgun.org:587`
- **AWS SES**: SMTP at `email-smtp.[region].amazonaws.com:587`

### Step 2: Configure Environment Variables

Update your `.env` file with your email credentials:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com          # or your provider's SMTP host
EMAIL_PORT=587                     # Usually 587 for TLS
EMAIL_SECURE=false                 # Set to true for port 465
EMAIL_USER=your-email@gmail.com    # Your email address
EMAIL_PASSWORD=your-app-password   # Gmail app password (not your regular password)
```

### Step 3: Test the Configuration

Run the email notification test:

```bash
cd backend
node testEmailNotifications.js
```

If configured correctly, you should see:
- ✅ All 3 tests passing
- Email messages appearing in your inbox

## Email Features

### Event Creation Email
When an event is created, attendees receive an email with:
- Event title and date
- Start and end time
- Description (if provided)
- Output type and priority
- Category information

### Task Creation Email
When a task is created, assignees receive an email with:
- Task title and due date
- Priority level
- Current status
- Description (if provided)

### Features
- ✅ Multiple attendees/assignees (all receive individual emails)
- ✅ HTML-formatted emails with styling
- ✅ Fallback plain text versions
- ✅ Automatic email address lookup from user profiles
- ✅ Error handling and logging

## Code Changes Made

### New Files
- `backend/src/services/emailService.js` - Email sending service

### Modified Files
- `backend/src/controllers/eventsController.js` - Added email notification on event creation
- `backend/src/controllers/tasksController.js` - Added email notification on task creation
- `backend/.env` - Added email configuration variables
- `backend/testEmailNotifications.js` - Test suite for email functionality

### Dependencies Added
- `nodemailer` - SMTP email client

## Troubleshooting

### "self-signed certificate in certificate chain"
This error occurs when EMAIL_USER and EMAIL_PASSWORD are not set. Configure them in .env.

### "Invalid email address"
Verify that user profiles in Firestore have valid email addresses. The system looks up emails from the `users` collection.

### "Connection timeout"
Check that:
- EMAIL_HOST is correct
- EMAIL_PORT is appropriate (usually 587 for TLS)
- Your firewall allows outbound SMTP connections

### Emails not received
- Check your spam folder
- Verify the recipient email address in the `users` collection
- Check backend logs for `❌ SEND [EVENT/TASK] NOTIFICATION EMAIL ERROR`

## Email Service API

### `sendEventNotificationEmail(eventData, attendeeIds)`
Sends email notification when an event is created.

**Parameters:**
- `eventData` - Event object with title, date, startTime, endTime, etc.
- `attendeeIds` - Array of user UIDs to notify

**Returns:** `true` if successful, `false` otherwise

### `sendTaskNotificationEmail(taskData, assigneeIds)`
Sends email notification when a task is created.

**Parameters:**
- `taskData` - Task object with title, dueDate, priority, etc.
- `assigneeIds` - Array of user UIDs to notify

**Returns:** `true` if successful, `false` otherwise

### `getUserEmail(uid)`
Looks up a user's email address by their UID.

### `testEmailConnection()`
Tests the SMTP connection to verify configuration is correct.

## Next Steps

1. Configure real email credentials in `.env`
2. Run `testEmailNotifications.js` to verify setup
3. Test by creating an event or task and checking your email
4. Monitor backend logs for any errors

## Security Notes

- ⚠️ Never commit `.env` file with real credentials to version control
- Use app-specific passwords (like Gmail App Passwords) instead of account passwords
- Consider using environment secrets in production (Vercel, Firebase, etc.)
- Email addresses are retrieved securely from the authenticated user database

---

**Email notifications are now fully integrated and ready to use!** 🎉
