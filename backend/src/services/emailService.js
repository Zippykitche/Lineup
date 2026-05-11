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
  }
};
