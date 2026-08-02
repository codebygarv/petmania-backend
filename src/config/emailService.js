const nodemailer = require('nodemailer');

const getTransporter = () => {
    const rawUser = process.env.EMAIL_USER || 'garvthakral90@gmail.com';
    const rawPass = process.env.EMAIL_PASS || 'lncjekhxlnemikut';

    const emailUser = String(rawUser).replace(/^["']|["']$/g, '').trim();
    const emailPass = String(rawPass).replace(/^["']|["']$/g, '').replace(/\s+/g, '').trim();

    console.log(`[EmailService] Configured user: ${emailUser}, passLength: ${emailPass.length}, passPrefix: ${emailPass.slice(0, 4)}...`);

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass,
        },
    });
};

const emailService = getTransporter();

module.exports = {
    emailService,
    getTransporter,
};