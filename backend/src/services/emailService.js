<<<<<<< HEAD
import { db } from '../config/firebase.js';

/**
 * Queues an email to be sent by the Firebase "Trigger Email" extension.
 * This works by adding a document to the 'mail' collection.
 * 
 * @param {string|string[]} to - Email address or array of email addresses.
 * @param {string} subject - Email subject.
 * @param {string} text - Plain text content.
 * @param {string} html - HTML content.
 */
export const sendEmail = async (to, subject, text, html) => {
  try {
    const emailData = {
      to: Array.isArray(to) ? to : [to],
      message: {
        subject,
        text,
        html,
      },
      createdAt: new Date().toISOString(),
    };

    await db.collection('mail').add(emailData);
    console.log(`✅ Email queued for: ${Array.isArray(to) ? to.join(', ') : to}`);
  } catch (error) {
    console.error('❌ SEND EMAIL ERROR:', error.message);
=======
import nodemailer from 'nodemailer';
import { db } from '../config/firebase.js';

// Initialize transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Get user email by UID
export const getUserEmail = async (uid) => {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      return userDoc.data().email;
    }
    return null;
  } catch (error) {
    console.error('❌ GET USER EMAIL ERROR:', error.message);
    return null;
  }
};

// Get multiple user emails
export const getUserEmails = async (uids) => {
  try {
    const emails = [];
    for (const uid of uids) {
      const email = await getUserEmail(uid);
      if (email) {
        emails.push(email);
      }
    }
    return emails;
  } catch (error) {
    console.error('❌ GET USER EMAILS ERROR:', error.message);
    return [];
  }
};

// Send event creation notification email
export const sendEventNotificationEmail = async (eventData, attendeeIds) => {
  try {
    if (!attendeeIds || attendeeIds.length === 0) {
      console.log('ℹ️  No attendees to notify for event:', eventData.title);
      return true;
    }

    const attendeeEmails = await getUserEmails(attendeeIds);
    if (attendeeEmails.length === 0) {
      console.log('ℹ️  No valid email addresses found for attendees');
      return true;
    }

    const eventDate = new Date(eventData.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const htmlContent = `
      <h2>New Event Created</h2>
      <p>You have been added to a new event:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${eventData.title}</h3>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${eventData.startTime} - ${eventData.endTime}</p>
        ${eventData.description ? `<p><strong>Description:</strong> ${eventData.description}</p>` : ''}
        <p><strong>Output Type:</strong> ${eventData.outputType}</p>
        <p><strong>Priority:</strong> ${eventData.priority}</p>
        <p><strong>Category:</strong> ${eventData.category}</p>
      </div>
      <p>Please check the application for more details.</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: attendeeEmails.join(','),
      subject: `New Event: ${eventData.title}`,
      html: htmlContent,
      text: `New Event: ${eventData.title}\n\nDate: ${formattedDate}\nTime: ${eventData.startTime} - ${eventData.endTime}\n${eventData.description ? `Description: ${eventData.description}\n` : ''}Output Type: ${eventData.outputType}\nPriority: ${eventData.priority}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ EVENT NOTIFICATION EMAIL SENT:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ SEND EVENT NOTIFICATION EMAIL ERROR:', error.message);
    return false;
  }
};

// Send task creation notification email
export const sendTaskNotificationEmail = async (taskData, assigneeIds) => {
  try {
    if (!assigneeIds || assigneeIds.length === 0) {
      console.log('ℹ️  No assignees to notify for task:', taskData.title);
      return true;
    }

    const assigneeEmails = await getUserEmails(assigneeIds);
    if (assigneeEmails.length === 0) {
      console.log('ℹ️  No valid email addresses found for assignees');
      return true;
    }

    const dueDate = new Date(taskData.dueDate);
    const formattedDate = dueDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const htmlContent = `
      <h2>New Task Assigned</h2>
      <p>A new task has been assigned to you:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${taskData.title}</h3>
        <p><strong>Due Date:</strong> ${formattedDate}</p>
        <p><strong>Priority:</strong> ${taskData.priority}</p>
        <p><strong>Status:</strong> ${taskData.status}</p>
        ${taskData.description ? `<p><strong>Description:</strong> ${taskData.description}</p>` : ''}
      </div>
      <p>Please check the application to view and manage this task.</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: assigneeEmails.join(','),
      subject: `New Task: ${taskData.title}`,
      html: htmlContent,
      text: `New Task: ${taskData.title}\n\nDue Date: ${formattedDate}\nPriority: ${taskData.priority}\nStatus: ${taskData.status}\n${taskData.description ? `Description: ${taskData.description}\n` : ''}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ TASK NOTIFICATION EMAIL SENT:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ SEND TASK NOTIFICATION EMAIL ERROR:', error.message);
    return false;
  }
};

// Test transporter connection
export const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ EMAIL TRANSPORTER VERIFIED');
    return true;
  } catch (error) {
    console.error('❌ EMAIL TRANSPORTER ERROR:', error.message);
    return false;
>>>>>>> 4a02635 (Updated events)
  }
};
