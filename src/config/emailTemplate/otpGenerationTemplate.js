const otpGenerateTemplate = (existingUser, otp) => {
  return `
  <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; background-color: #F4F6F9; padding: 40px 0; margin: 0;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0px 4px 20px rgba(0,0,0,0.08);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #E0583E, #c9472f); padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">PetBonds Account Security</h1>
      </div>

      <!-- Body Content -->
      <div style="padding: 30px; color: #333333; line-height: 1.6;">
        <p style="font-size: 16px; margin: 0 0 20px;">Hi <strong>${existingUser.email}</strong>,</p>
        <p style="font-size: 15px; margin: 0 0 20px;">
          Your one-time password (OTP) has been securely generated to complete your verification process. Please use the OTP below to continue. 
          For your security, this OTP is valid for a limited time only.
        </p>

        <!-- OTP Box -->
        <div style="background-color: #FFF4F2; padding: 20px; margin: 25px 0; border-left: 5px solid #E0583E; border-radius: 5px;">
          <p style="margin: 0 0 8px; font-size: 15px; font-weight: 600;">Your One-Time OTP:</p>
          <p style="font-size: 26px; font-weight: bold; letter-spacing: 4px; margin: 0; color: #E0583E; text-align: center;">${otp}</p>
        </div>

        <p style="font-size: 14px; margin: 0 0 15px;">
          <strong>Security Tip:</strong> Do not share this OTP with anyone. PetBonds will never ask for your OTP or password via email or phone.
        </p>

        <p style="margin-top: 30px; font-size: 15px;">
          If you did not initiate this request, we strongly recommend contacting our support team immediately to secure your account.
        </p>

        <p style="font-size: 15px; margin-top: 30px;">Warm regards,<br><strong>PetBonds Security Team</strong></p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
        <p style="margin: 5px 0 0; font-size: 11px;">© ${new Date().getFullYear()} PetBonds. All rights reserved.</p>
      </div>
    </div>
  </div>
  `;
};

module.exports = { otpGenerateTemplate };
