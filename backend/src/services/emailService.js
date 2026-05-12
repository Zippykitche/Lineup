import { db } from '../config/firebase.js';

/**
 * Queues an email to be sent by the Firebase "Trigger Email" extension.
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
    console.error('❌ Email error:', error.message);
  }
};

/**
 * Get emails of users by their UIDs
 */
const getUserEmails = async (uids) => {
  const emails = [];
  for (const uid of uids) {
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists) {
      const data = doc.data();
      const email = data.email || data.workEmail;
      if (email) emails.push(email);
    }
  }
  return emails;
};

/**
 * Send event notification email to attendees
 */
export const sendEventNotification = async (eventData, attendeeIds) => {
  try {
    if (!attendeeIds || attendeeIds.length === 0) {
      console.log('ℹ️ No attendees to notify');
      return true;
    }

    const attendeeEmails = await getUserEmails(attendeeIds);
    if (attendeeEmails.length === 0) return true;

    const formattedDate = new Date(eventData.date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const html = `
      <h2>New Event Created</h2>
      <p>You have been added to a new event:</p>
      <div style="background-color:#f5f5f5;padding:15px;border-radius:5px;margin:20px 0;">
        <h3 style="margin-top:0;">${eventData.title}</h3>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${eventData.startTime} - ${eventData.endTime}</p>
        ${eventData.description ? `<p><strong>Description:</strong> ${eventData.description}</p>` : ''}
        <p><strong>Priority:</strong> ${eventData.priority}</p>
      </div>
    `;

    await sendEmail(attendeeEmails, `New Event: ${eventData.title}`, '', html);
    console.log('✅ Event notification sent');
    return true;
  } catch (error) {
    console.error('❌ Event notification error:', error.message);
  }
};

/**
 * Send task notification email to assignees
 */
export const sendTaskNotification = async (taskData, assigneeIds) => {
  try {
    if (!assigneeIds || assigneeIds.length === 0) {
      console.log('ℹ️ No assignees to notify');
      return true;
    }

    const assigneeEmails = await getUserEmails(assigneeIds);
    if (assigneeEmails.length === 0) return true;

    const formattedDate = new Date(taskData.dueDate).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const html = `
      <h2>New Task Assigned</h2>
      <p>A new task has been assigned to you:</p>
      <div style="background-color:#f5f5f5;padding:15px;border-radius:5px;margin:20px 0;">
        <h3 style="margin-top:0;">${taskData.title}</h3>
        <p><strong>Due Date:</strong> ${formattedDate}</p>
        <p><strong>Priority:</strong> ${taskData.priority}</p>
        ${taskData.description ? `<p><strong>Description:</strong> ${taskData.description}</p>` : ''}
      </div>
    `;

    await sendEmail(assigneeEmails, `New Task: ${taskData.title}`, '', html);
    console.log('✅ Task notification sent');
    return true;
  } catch (error) {
    console.error('❌ Task notification error:', error.message);
  }
};
