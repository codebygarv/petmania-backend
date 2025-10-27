const otpGenerateTemplate = (existingUser, otp) => {
 return `
  <div style="margin:0; padding:0; background:#f0f8ff; font-family:'Poppins', Arial, sans-serif;">

    <!-- Pawprint Background -->
    <div style="
      background-image: radial-gradient(rgba(173, 216, 230, 0.25) 20%, transparent 20%), radial-gradient(rgba(173, 216, 230, 0.2) 20%, transparent 20%);
      background-size: 80px 80px;
      background-position: 0 0, 40px 40px;
      padding:40px 0;
    ">

      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">

            <!-- Card -->
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:30px; overflow:hidden; box-shadow:0px 20px 45px rgba(120,150,200,0.25); border:1px solid #d5e8f7;">
              <tr>
                <td style="padding:50px 40px; text-align:center; background:linear-gradient(145deg, #e6f3ff, #d0e8ff);">

                  <!-- CUTE KITTY LOGO -->
                  <div style="font-size:60px; margin-bottom:10px;">🐱</div>

                  <h1 style="margin:0; color:#3a7bd5; font-size:30px; font-weight:700;">Kitten Security Center</h1>
                  <p style="margin-top:8px; font-size:15px; color:#555;">Purring softly to keep you safe ❄️</p>
                </td>
              </tr>

              <tr>
                <td style="padding:35px 45px;">

                  <!-- Greeting -->
                  <p style="font-size:17px; margin-bottom:18px; font-weight:600; color:#444;">
                    Meow there, <b>${existingUser.email}</b> 🐾
                  </p>

                  <p style="font-size:15px; line-height:1.8; color:#666;">
                    A gentle snowy kitten has generated a special OTP to confirm it's really you. Use this code to stay safe and cozy in your PetBonds account. ⛄🐱
                  </p>

                  <!-- OTP Block -->
                  <div style="
                    margin:35px 0;
                    padding:28px 0;
                    background:#f7fbff;
                    border-radius:20px;
                    border:3px dashed #a3ccf5;
                    text-align:center;
                    box-shadow:inset 0 4px 12px rgba(160,190,230,0.15);
                  ">
                    <p style="margin:0; font-size:15px; color:#555; font-weight:600;">✨ Your Snowflake OTP ✨</p>
                    <p style="
                      margin:15px 0 0;
                      font-size:42px;
                      letter-spacing:10px;
                      color:#3a7bd5;
                      font-weight:800;
                    ">${otp}</p>
                  </div>

                  <!-- Info -->
                  <p style="font-size:14px; color:#777; background:#eaf4ff; padding:15px; border-radius:12px;">
                    ❄️ <b>Note:</b> This OTP will melt away soon (expires shortly). Do not share it with anyone, even if they offer warm milk. 🥛🐾
                  </p>

                  <!-- Alert -->
                  <div style="margin-top:28px; padding:18px; border-left:5px solid #3a7bd5; background:#e6f2ff; border-radius:12px; font-size:14px; line-height:1.6; color:#555;">
                    🚨 <b>Didn't request this?</b><br/>Please change your password before the kitten hisses! 🔐😾
                  </div>

                  <!-- Signature -->
                  <p style="margin-top:40px; font-size:15px; text-align:center;">
                    With purrs and protection ❄️🐾,<br/>
                    <b style="color:#3a7bd5;">The PetBonds Kitten Guardians</b>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#f2f8ff; padding:25px 40px; text-align:center; border-top:1px solid #d5e8f7;">
                  <p style="font-size:12px; color:#7d8fa5; margin:0;">
                    This email was sent with 🐱 care & calm security vibes<br/>
                    © 2025 PetBonds. All kitten rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </div>
  </div>
  `;
};

module.exports = { otpGenerateTemplate };
