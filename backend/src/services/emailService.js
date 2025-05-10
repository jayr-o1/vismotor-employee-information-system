// emailService.js
const nodemailer = require("nodemailer");
require('dotenv').config(); // Load environment variables if not already loaded

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: { 
    user: process.env.EMAIL_USER || "olores.jayrm@gmail.com", 
    pass: process.env.EMAIL_PASS || "obyvlbyylrcflmas" 
  },
  tls: { rejectUnauthorized: false },
});

// Verify transporter connection
transporter.verify((error) => {
  if (error) console.error("Nodemailer Error:", error);
  else console.log("Server is ready to take our messages");
});

// Send verification email
const sendVerificationEmail = async (email, link) => {
  const mailOptions = {
    from: "olores.jayrm@gmail.com",
    to: email,
    subject: "Verify Your Email",
    html: `<p>Click <a href="${link}">here</a> to verify your email. This link expires in 15 minutes.</p>`,
  };
  await transporter.sendMail(mailOptions);
};

// Send password reset email
const sendResetPasswordEmail = async (email, link) => {
  const mailOptions = {
    from: "olores.jayrm@gmail.com",
    to: email,
    subject: "Reset Your Password",
    html: `<p>Click <a href="${link}">here</a> to reset your password. This link expires in 15 minutes.</p>`,
  };
  await transporter.sendMail(mailOptions);
};

// Send interview notification email
const sendInterviewNotification = async (applicantEmail, applicantName, interviewDetails) => {
  const { interview_date, interview_time, location, interviewer } = interviewDetails;
  
  // Format the date for display
  const formattedDate = new Date(interview_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Create location display text
  const locationText = location.toLowerCase().includes('google meet') || 
                      location.toLowerCase().includes('virtual') || 
                      location.toLowerCase().includes('online') 
                      ? `<strong>Online Meeting:</strong> ${location}` 
                      : `<strong>Location:</strong> ${location}`;
  
  const mailOptions = {
    from: "olores.jayrm@gmail.com",
    to: applicantEmail,
    subject: "Interview Scheduled - Next Steps",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2c3e50;">Interview Confirmation</h2>
        </div>
        
        <p>Dear ${applicantName},</p>
        
        <p>We're pleased to confirm your interview has been scheduled. We look forward to discussing your qualifications and experience further.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50;">Interview Details</h3>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${interview_time}</p>
          <p>${locationText}</p>
          <p><strong>Interviewer:</strong> ${interviewer}</p>
        </div>
        
        <p>Please arrive 10 minutes early. If you need to reschedule or have any questions, please contact us as soon as possible.</p>
        
        <p>Best regards,<br>
        HR Department<br>
        Vismotor Inc.</p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Send interview completion notification
const sendInterviewCompletionEmail = async (applicantEmail, applicantName, interviewDetails) => {
  const { interview_date, interview_time, interviewer } = interviewDetails;
  
  // Format the date for display
  const formattedDate = new Date(interview_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const mailOptions = {
    from: "olores.jayrm@gmail.com",
    to: applicantEmail,
    subject: "Thank You for Your Interview",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2c3e50;">Interview Completed</h2>
        </div>
        
        <p>Dear ${applicantName},</p>
        
        <p>Thank you for attending your interview on ${formattedDate} at ${interview_time} with ${interviewer}.</p>
        
        <p>We appreciate the time you took to discuss your qualifications and experience with us. Our team is currently reviewing all candidates, and we will be in touch with you regarding the next steps in our hiring process.</p>
        
        <p>If you have any questions in the meantime, please don't hesitate to contact us.</p>
        
        <p>Best regards,<br>
        HR Department<br>
        Vismotor Inc.</p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Send interview cancellation notification
const sendInterviewCancellationEmail = async (applicantEmail, applicantName, interviewDetails) => {
  const { interview_date, interview_time } = interviewDetails;
  
  // Format the date for display
  const formattedDate = new Date(interview_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const mailOptions = {
    from: "olores.jayrm@gmail.com",
    to: applicantEmail,
    subject: "Interview Cancellation Notice",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2c3e50;">Interview Cancellation</h2>
        </div>
        
        <p>Dear ${applicantName},</p>
        
        <p>We regret to inform you that your interview scheduled for ${formattedDate} at ${interview_time} has been cancelled.</p>
        
        <p>Our HR team will be in touch with you shortly to reschedule or provide further information. We apologize for any inconvenience this may cause.</p>
        
        <p>If you have any questions, please feel free to contact us.</p>
        
        <p>Best regards,<br>
        HR Department<br>
        Vismotor Inc.</p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Send welcome email to newly hired employees
const sendWelcomeEmail = async (employeeEmail, employeeName, employmentDetails) => {
  const { position, department, hire_date, reporting_manager } = employmentDetails;
  
  // Format the start date for display
  const formattedDate = new Date(hire_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const mailOptions = {
    from: "olores.jayrm@gmail.com",
    to: employeeEmail,
    subject: "Welcome to Vismotor Inc!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2c3e50;">Welcome to Vismotor Inc!</h2>
        </div>
        
        <p>Dear ${employeeName},</p>
        
        <p>Congratulations! We are delighted to welcome you to Vismotor Inc. as our new <strong>${position}</strong> in the <strong>${department}</strong> department.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50;">Employment Details</h3>
          <p><strong>Position:</strong> ${position}</p>
          <p><strong>Department:</strong> ${department}</p>
          <p><strong>Start Date:</strong> ${formattedDate}</p>
          ${reporting_manager ? `<p><strong>Reporting Manager:</strong> ${reporting_manager}</p>` : ''}
        </div>
        
        <p>Please be at the office by 9:00 AM on your first day. Our HR team will guide you through the onboarding process, which includes completing necessary paperwork, receiving equipment, and orientation.</p>
        
        <p>We're excited to have you join our team and look forward to your contributions. If you have any questions before your start date, please don't hesitate to contact our HR department.</p>
        
        <p>Best regards,<br>
        HR Department<br>
        Vismotor Inc.</p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

module.exports = { 
  sendVerificationEmail, 
  sendResetPasswordEmail, 
  sendInterviewNotification,
  sendInterviewCompletionEmail,
  sendInterviewCancellationEmail,
  sendWelcomeEmail
};