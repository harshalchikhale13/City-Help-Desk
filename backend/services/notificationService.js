/**
 * Notification Service - JSON Storage Version
 * Handles sending notifications (in-app only, email optional)
 */
const nodemailer = require('nodemailer');
const db = require('../config/database');

// Create email transporter (optional)
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

/**
 * Save notification to storage
 */
const saveNotification = async (userId, complaintId, type, title, message) => {
  try {
    const notification = db.insert('notifications.json', {
      user_id: userId,
      complaint_id: complaintId,
      type,
      title,
      message,
      is_read: false,
      email_sent: false,
    });

    return notification;
  } catch (error) {
    console.error('Error saving notification:', error);
    throw error;
  }
};

/**
 * Send email notification (optional)
 */
const sendEmailNotification = async (email, subject, htmlContent) => {
  if (!transporter) {
    console.log('Email not configured, skipping email notification');
    return false;
  }

  try {
    const mailOptions = {
      from: process.env.SENDER_EMAIL || 'noreply@civiccomplaints.com',
      to: email,
      subject: subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Notify complaint submission
 */
const notifyComplaintSubmission = async (userId, complaintData) => {
  try {
    const user = db.findById('users.json', userId);

    if (!user) return;

    // Save in-app notification
    await saveNotification(
      userId,
      complaintData.id,
      'submission',
      'Complaint Submitted',
      `Your complaint (ID: ${complaintData.complaint_id}) has been successfully submitted.`
    );

    // Try to send email
    const emailHtml = `
      <h2>Complaint Submitted Successfully</h2>
      <p>Hello ${user.first_name},</p>
      <p>Your complaint has been submitted to our system.</p>
      <p><strong>Complaint ID:</strong> ${complaintData.complaint_id}</p>
      <p><strong>Category:</strong> ${complaintData.category}</p>
      <p><strong>Status:</strong> Submitted</p>
      <p>We will review your complaint and keep you updated on its status.</p>
    `;

    await sendEmailNotification(user.email, 'Your Complaint Has Been Submitted', emailHtml);
  } catch (error) {
    console.error('Error in notifyComplaintSubmission:', error);
  }
};

/**
 * Notify complaint assignment
 */
const notifyComplaintAssignment = async (userId, complaintData, departmentId) => {
  try {
    const user = db.findById('users.json', userId);
    const department = db.findById('departments.json', departmentId);

    if (!user || !department) return;

    // Save in-app notification
    await saveNotification(
      userId,
      complaintData.id,
      'assignment',
      'Complaint Assigned',
      `Your complaint (ID: ${complaintData.complaint_id}) has been assigned to ${department.name}.`
    );

    // Try to send email
    const emailHtml = `
      <h2>Complaint Assigned to Department</h2>
      <p>Hello ${user.first_name},</p>
      <p>Your complaint has been assigned to a department for resolution.</p>
      <p><strong>Complaint ID:</strong> ${complaintData.complaint_id}</p>
      <p><strong>Assigned Department:</strong> ${department.name}</p>
      <p><strong>Status:</strong> Assigned</p>
      <p>The department will work on resolving your complaint.</p>
    `;

    await sendEmailNotification(user.email, 'Your Complaint Has Been Assigned', emailHtml);
  } catch (error) {
    console.error('Error in notifyComplaintAssignment:', error);
  }
};

/**
 * Notify complaint update
 */
const notifyComplaintUpdate = async (userId, complaintData, newStatus) => {
  try {
    const user = db.findById('users.json', userId);

    if (!user) return;

    // Save in-app notification
    await saveNotification(
      userId,
      complaintData.id,
      'update',
      'Complaint Status Updated',
      `Your complaint (ID: ${complaintData.complaint_id}) status has been updated to: ${newStatus}`
    );

    // Try to send email
    const emailHtml = `
      <h2>Complaint Status Updated</h2>
      <p>Hello ${user.first_name},</p>
      <p>There's an update on your complaint.</p>
      <p><strong>Complaint ID:</strong> ${complaintData.complaint_id}</p>
      <p><strong>New Status:</strong> ${newStatus}</p>
      <p>Thank you for bringing this matter to our attention.</p>
    `;

    await sendEmailNotification(user.email, 'Your Complaint Status Has Been Updated', emailHtml);
  } catch (error) {
    console.error('Error in notifyComplaintUpdate:', error);
  }
};

/**
 * Get user notifications
 */
const getUserNotifications = async (userId, limit = 20, offset = 0) => {
  try {
    let notifications = db.find('notifications.json', { user_id: userId });

    // Sort by created_at descending
    notifications = notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = notifications.length;
    const paginatedNotifications = notifications.slice(offset, offset + limit);

    return {
      notifications: paginatedNotifications,
      total,
      limit,
      offset,
    };
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
const markNotificationAsRead = async (notificationId) => {
  try {
    const notification = db.findById('notifications.json', notificationId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    const updated = db.updateById('notifications.json', notificationId, {
      is_read: true,
    });

    return updated;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

module.exports = {
  saveNotification,
  sendEmailNotification,
  notifyComplaintSubmission,
  notifyComplaintAssignment,
  notifyComplaintUpdate,
  getUserNotifications,
  markNotificationAsRead,
};
