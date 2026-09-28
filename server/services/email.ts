import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ""),
  },
});

// Central MRO email configuration
const MRO_EMAIL = "suvethavenkatesan@gmail.com";

// In-memory log for demo mode
const emailLog: Array<{
  to: string;
  subject: string;
  timestamp: string;
}> = [];

export function getEmailLog() {
  return emailLog;
}

export async function sendComplaintToDepartment(
  complaintTitle: string,
  complaintDescription: string,
  department: string,
  userEmail: string,
  userId: string
): Promise<boolean> {
  try {
    const emailData = {
      from: process.env.GMAIL_USER || "noreply@company.com",
      to: MRO_EMAIL,
      subject: `[MRO] New ${department.toUpperCase()} Complaint: ${complaintTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">New Complaint Received</h1>
          </div>
          <div style="padding: 20px; color: #1e293b; line-height: 1.6;">
            <p><strong style="color: #64748b;">Title:</strong> ${complaintTitle}</p>
            <p><strong style="color: #64748b;">Department:</strong> ${department.toUpperCase()}</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 6px;">
              <p style="margin: 0; font-weight: bold; color: #475569;">Description:</p>
              <p style="margin: 5px 0 0 0;">${complaintDescription}</p>
            </div>
            <p style="margin-top: 20px;"><strong style="color: #64748b;">Submitted By (User ID):</strong> ${userId}</p>
            <p><strong style="color: #64748b;">Email:</strong> <a href="mailto:${userEmail}" style="color: #3b82f6; text-decoration: none;">${userEmail}</a></p>
          </div>
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            <p style="margin: 0;">This is an automated message from the GMR MRO System.</p>
          </div>
        </div>
      `,
    };

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      // Demo mode: log instead of sending
      console.log(`[EMAIL - DEMO MODE] Email would be sent to ${MRO_EMAIL}`);
      console.log(`[EMAIL - DEMO MODE] Subject: ${emailData.subject}`);
      emailLog.push({
        to: MRO_EMAIL,
        subject: emailData.subject,
        timestamp: new Date().toISOString(),
      });
      return true;
    }

    await transporter.sendMail(emailData);
    console.log(`[EMAIL] Complaint sent to ${MRO_EMAIL}`);
    emailLog.push({
      to: MRO_EMAIL,
      subject: emailData.subject,
      timestamp: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("[EMAIL] Failed to send complaint email:", error);
    // Still log it in demo mode
    emailLog.push({
      to: MRO_EMAIL,
      subject: `[MRO] New ${department.toUpperCase()} Complaint: ${complaintTitle}`,
      timestamp: new Date().toISOString(),
    });
    return false;
  }
}

export async function sendComplaintAcceptanceToUser(
  userEmail: string,
  complaintTitle: string,
  complaintId: string
): Promise<boolean> {
  try {
    const emailData = {
      from: process.env.GMAIL_USER || "noreply@company.com",
      to: userEmail,
      subject: `Complaint Received - Reference #${complaintId}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Complaint Received</h1>
          </div>
          <div style="padding: 20px; color: #1e293b; line-height: 1.6;">
            <p>Dear User,</p>
            <p>Thank you for filing your complaint. Our team has received the details and will begin processing it shortly.</p>
            <div style="margin: 20px 0; padding: 15px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
              <p style="margin: 0;"><strong style="color: #166534;">Reference ID:</strong> #${complaintId}</p>
              <p style="margin: 5px 0 0 0;"><strong style="color: #166534;">Title:</strong> ${complaintTitle}</p>
            </div>
            <p>You can track the status of your complaint on your dashboard.</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            <p style="margin: 0;">This is an automated message from the Facility Management System.</p>
          </div>
        </div>
      `,
    };

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      // Demo mode: log instead of sending
      console.log(`[EMAIL - DEMO MODE] Email would be sent to ${userEmail}`);
      console.log(`[EMAIL - DEMO MODE] Subject: ${emailData.subject}`);
      emailLog.push({
        to: userEmail,
        subject: emailData.subject,
        timestamp: new Date().toISOString(),
      });
      return true;
    }

    await transporter.sendMail(emailData);
    console.log(`[EMAIL] Acceptance email sent to ${userEmail}`);
    emailLog.push({
      to: userEmail,
      subject: emailData.subject,
      timestamp: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("[EMAIL] Failed to send acceptance email:", error);
    // Still log it in demo mode
    emailLog.push({
      to: userEmail,
      subject: `Complaint Received - Reference #${complaintId}`,
      timestamp: new Date().toISOString(),
    });
    return false;
  }
}

export async function sendComplaintResolutionEmail(
  userEmail: string,
  complaintTitle: string,
  complaintId: string,
  resolutionComment: string
): Promise<boolean> {
  try {
    const emailData = {
      from: process.env.GMAIL_USER || "noreply@company.com",
      to: userEmail,
      subject: `Complaint Resolved - Reference #${complaintId}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Complaint Resolved</h1>
          </div>
          <div style="padding: 20px; color: #1e293b; line-height: 1.6;">
            <p>Dear User,</p>
            <p>We are pleased to inform you that your complaint has been resolved.</p>
            <div style="margin: 20px 0; padding: 15px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
              <p style="margin: 0;"><strong style="color: #166534;">Reference ID:</strong> #${complaintId}</p>
              <p style="margin: 5px 0 0 0;"><strong style="color: #166534;">Title:</strong> ${complaintTitle}</p>
            </div>
             <div style="margin: 20px 0; padding: 15px; background-color: #f8fafc; border-radius: 6px;">
              <p style="margin: 0; font-weight: bold; color: #475569;">Resolution Comments:</p>
              <p style="margin: 5px 0 0 0;">${resolutionComment}</p>
            </div>
            <p>If you have any further questions, please feel free to contact us.</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
            <p style="margin: 0;">This is an automated message from the Facility Management System.</p>
          </div>
        </div>
      `,
    };

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      // Demo mode
      console.log(`[EMAIL - DEMO MODE] Email would be sent to ${userEmail}`);
      console.log(`[EMAIL - DEMO MODE] Subject: ${emailData.subject}`);
      emailLog.push({
        to: userEmail,
        subject: emailData.subject,
        timestamp: new Date().toISOString(),
      });
      return true;
    }

    await transporter.sendMail(emailData);
    console.log(`[EMAIL] Resolution email sent to ${userEmail}`);
    emailLog.push({
      to: userEmail,
      subject: emailData.subject,
      timestamp: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("[EMAIL] Failed to send resolution email:", error);
    emailLog.push({
      to: userEmail,
      subject: `Complaint Resolved - Reference #${complaintId}`,
      timestamp: new Date().toISOString(),
    });
    return false;
  }
}

export async function sendComplaintAssignmentEmail(
  department: string,
  complaintTitle: string,
  userComment: string,
  complaintId: string
): Promise<boolean> {
  const deptEmail = `${department.toLowerCase()}-head@example.com`; // Dummy email for now

  try {
    const emailData = {
      from: process.env.GMAIL_USER || "noreply@company.com",
      to: deptEmail,
      subject: `[MRO] Complaint Assignment - #${complaintId}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f59e0b; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">New Assignment</h1>
          </div>
          <div style="padding: 20px; color: #1e293b; line-height: 1.6;">
            <p><strong>Department Head (${department}),</strong></p>
            <p>A complaint has been assigned to your department for further action.</p>
            <div style="margin: 20px 0; padding: 15px; background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 6px;">
              <p style="margin: 0;"><strong style="color: #92400e;">Reference ID:</strong> #${complaintId}</p>
              <p style="margin: 5px 0 0 0;"><strong style="color: #92400e;">Title:</strong> ${complaintTitle}</p>
            </div>
             <div style="margin: 20px 0; padding: 15px; background-color: #f8fafc; border-radius: 6px;">
              <p style="margin: 0; font-weight: bold; color: #475569;">Admin Note:</p>
              <p style="margin: 5px 0 0 0;">${userComment}</p>
            </div>
            <p>Please log in to the dashboard to view full details.</p>
          </div>
        </div>
      `,
    };

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.log(`[EMAIL - DEMO MODE] Assignment email would be sent to ${deptEmail}`);
      emailLog.push({
        to: deptEmail,
        subject: emailData.subject,
        timestamp: new Date().toISOString(),
      });
      return true;
    }

    await transporter.sendMail(emailData);
    console.log(`[EMAIL] Assignment email sent to ${deptEmail}`);
    emailLog.push({
      to: deptEmail,
      subject: emailData.subject,
      timestamp: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("[EMAIL] Failed to send assignment email:", error);
    emailLog.push({
      to: deptEmail,
      subject: `[MRO] Complaint Assignment - #${complaintId}`,
      timestamp: new Date().toISOString(),
    });
    return false;
  }
}
