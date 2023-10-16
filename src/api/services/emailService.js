const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require("dotenv").config();

class EmailService {
    constructor() {
        this.CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
        this.CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
        this.REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
        this.REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
        this.USER_EMAIL = 'pethub215@gmail.com';

        this.oAuth2Client = new google.auth.OAuth2(
            this.CLIENT_ID,
            this.CLIENT_SECRET,
            this.REDIRECT_URI
        );

        this.oAuth2Client.setCredentials({ refresh_token: this.REFRESH_TOKEN });
    }

    async sendEmail(toEmail, title, body, fileName = null, attachmentPath = null) {
        try {
            const accessToken = await this.oAuth2Client.getAccessToken();
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: this.USER_EMAIL,
                    clientId: this.CLIENT_ID,
                    clientSecret: this.CLIENT_SECRET,
                    refreshToken: this.REFRESH_TOKEN,
                    accessToken: accessToken,
                },
            });

            const mailOptions = {
                from: this.USER_EMAIL,
                to: toEmail,
                subject: title,
                text: body
            };

            // If provided, attach the file to the email
            if (attachmentPath && fileName) {
                mailOptions.attachments = [
                    {
                        filename: fileName,
                        path: attachmentPath
                    }
                ];
            }

            await transporter.sendMail(mailOptions);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new EmailService();
