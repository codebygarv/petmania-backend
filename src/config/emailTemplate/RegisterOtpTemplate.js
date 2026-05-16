const registrationOtpTemplate = (newUser, otp) => {
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
                  <h1 style="margin:0; color:#E0583E; font-size:30px; font-weight:700;">
                    🐾 PetBonds Verification
                  </h1>
                  <p style="margin-top:8px; font-size:15px; color:#444;">
                    Welcome to the PetBonds family! Let's secure your account 💛
                  </p>
                </td>
              </tr>
  
              <!-- Body -->
              <tr>
                <td style="padding:35px 45px;">
  
                  <!-- Greeting -->
                  <p style="font-size:17px; margin-bottom:18px; font-weight:600; color:#333;">
                    Hi <b>${newUser.email}</b>,
                  </p>
  
                  <p style="font-size:15px; line-height:1.8; color:#555;">
                    Thank you for joining <b>PetBonds</b>, where pets and humans connect with love! To activate your account, please use the verification code below.
                  </p>
  
                  <!-- OTP Block -->
                  <div style="
                    margin:35px 0;
                    padding:28px 0;
                    background:#FFF4F1;
                    border-radius:18px;
                    border:2px dashed #E0583E;
                    text-align:center;
                    box-shadow:inset 0 4px 10px rgba(224,88,62,0.08);
                  ">
                    <p style="margin:0; font-size:15px; color:#555; font-weight:600;">Your OTP Code</p>
                    <p style="
                      margin:18px 0 0;
                      font-size:42px;
                      letter-spacing:12px;
                      color:#E0583E;
                      font-weight:800;
                    ">${otp}</p>
                  </div>
  
                  <!-- Info -->
                  <p style="font-size:14px; color:#6a6a6a; background:#FFF1EC; padding:14px; border-radius:12px;">
                    ⏳ <b>This OTP is valid for a short time.</b> For your security, please do not share this code with anyone.
                  </p>
  
                  <!-- Alert -->
                  <div style="margin-top:25px; padding:18px; border-left:5px solid #E0583E; background:#FFF5F3; border-radius:12px; font-size:14px; line-height:1.6; color:#555;">
                    ⚠️ <b>Didn’t sign up?</b> If this wasn’t you, please ignore this email or contact our support team immediately.
                  </div>
  
                  <!-- Signature -->
                  <p style="margin-top:40px; font-size:15px; text-align:center; color:#555;">
                    With love and paws,<br/>
                    <b style="color:#E0583E;">🐾 Team PetBonds</b>
                  </p>
                </td>
              </tr>
  
              <!-- Footer -->
              <tr>
                <td style="background:#FFF1EC; padding:25px 40px; text-align:center; border-top:1px solid #FFE4DE;">
                  <p style="font-size:12px; color:#8a8a8a; margin:0;">
                    You're receiving this email because you created an account on <b>PetBonds</b>.<br/>
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

module.exports = { registrationOtpTemplate };
