const verificationRecheckTemplate = (user, reason) => {
  const userName = user?.name || user?.email?.split("@")[0] || "PetBonds Member";

  return `
    <div style="margin:0; padding:0; background:#FFF8F6; font-family:'Poppins', Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding:50px 0;">
  
            <table width="600" cellpadding="0" cellspacing="0" style="
              background:#ffffff;
              border-radius:24px;
              overflow:hidden;
              box-shadow:0px 20px 45px rgba(224,88,62,0.15);
              border:1px solid #FFE4DE;
            ">
  
              <!-- Header -->
              <tr>
                <td style="padding:40px; text-align:center; background:#FFF1EC;">
                  <h1 style="margin:0; color:#E0583E; font-size:28px; font-weight:700;">
                    🐾 PetBonds Verification Update
                  </h1>
                  <p style="margin-top:8px; font-size:15px; color:#444;">
                    Action Required: Please update your verification details
                  </p>
                </td>
              </tr>
  
              <!-- Body -->
              <tr>
                <td style="padding:35px 45px;">
  
                  <!-- Greeting -->
                  <p style="font-size:17px; margin-bottom:18px; font-weight:600; color:#333;">
                    Hi <b>${userName}</b>,
                  </p>
  
                  <p style="font-size:15px; line-height:1.8; color:#555;">
                    Thank you for submitting your identity verification details on <b>PetBonds</b>. Our verification team has reviewed your application and requested a re-check.
                  </p>
  
                  <!-- Reason Box -->
                  <div style="
                    margin:28px 0;
                    padding:22px;
                    background:#FFF5F3;
                    border-radius:16px;
                    border-left:5px solid #E0583E;
                    box-shadow:0 4px 12px rgba(224,88,62,0.06);
                  ">
                    <p style="margin:0 0 8px 0; font-size:13px; font-weight:700; color:#E0583E; text-transform:uppercase; letter-spacing:0.5px;">
                      ⚠️ Reason for Re-check / Admin Feedback:
                    </p>
                    <p style="margin:0; font-size:15px; line-height:1.6; color:#2c2c2c; font-weight:500;">
                      "${reason || "Please review and re-upload clear identity verification documents."}"
                    </p>
                  </div>
  
                  <!-- Steps to Resubmit -->
                  <p style="font-size:15px; font-weight:600; color:#333; margin-top:25px; margin-bottom:12px;">
                    How to resubmit your application:
                  </p>
                  <ol style="margin:0; padding-left:20px; font-size:14px; line-height:1.9; color:#555;">
                    <li>Open the <b>PetBonds App</b> on your phone.</li>
                    <li>Go to the <b>Profile</b> tab and tap <b>Edit Profile</b>.</li>
                    <li>Review the feedback, update your details, or upload clear document images.</li>
                    <li>Tap <b>Save Changes</b> to resubmit your profile for verification.</li>
                  </ol>
  
                  <!-- Note -->
                  <p style="font-size:13px; color:#6a6a6a; background:#FFF1EC; padding:14px; border-radius:12px; margin-top:25px; line-height:1.6;">
                    ℹ️ Once you resubmit, our team will re-examine your documents promptly so you can continue enjoying all PetBonds features.
                  </p>
  
                  <!-- Signature -->
                  <p style="margin-top:35px; font-size:15px; text-align:center; color:#555;">
                    With love and paws,<br/>
                    <b style="color:#E0583E;">🐾 Team PetBonds</b>
                  </p>
                </td>
              </tr>
  
              <!-- Footer -->
              <tr>
                <td style="background:#FFF1EC; padding:25px 40px; text-align:center; border-top:1px solid #FFE4DE;">
                  <p style="font-size:12px; color:#8a8a8a; margin:0;">
                    You are receiving this email regarding your verification status on <b>PetBonds</b>.<br/>
                    If you have questions, please reach out to our support team.<br/>
                    © 2025 PetBonds. All rights reserved.
                  </p>
                </td>
              </tr>
  
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
};

module.exports = { verificationRecheckTemplate };
