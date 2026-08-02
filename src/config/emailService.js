const nodemailer = require('nodemailer');

const emailUser = (process.env.EMAIL_USER || 'garvthakral90@gmail.com').trim();
const emailPass = (process.env.EMAIL_PASS || 'lncjekhxlnemikut').replace(/\s+/g, '');

const emailService = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

module.exports = {
    emailService,
};