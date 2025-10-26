const db = require('../database/sqlConnection');

const saveOtpToDB = (email, otp) => {
  const expiresAt = Date.now() + 5 * 60 * 1000; // OTP valid for 5 mins

  db.run(`DELETE FROM otp_store WHERE email = ?`, [email], (err) => {
    if (err) console.log("Error deleting previous OTP:", err.message);
  });

  db.run(
    `INSERT INTO otp_store (email, otp, expires_at) VALUES (?, ?, ?)`,
    [email, otp, expiresAt],
    (err) => {
      if (err) console.log("Error inserting OTP:", err.message);
    }
  );
};

module.exports = saveOtpToDB;
