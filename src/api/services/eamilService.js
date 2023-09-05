const nodemailer = require('nodemailer')
const {google} = require('googleapis')
require("dotenv").config();

exports.sendEmail = async (toEmail, title, body) => {
    try {
        const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
        const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
        const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI
        const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN

        const OAuth2 = google.auth.OAuth2;
        const oAuth2Client = new OAuth2(
            CLIENT_ID,
            CLIENT_SECRET,
            REDIRECT_URI
        );
        oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
        const accessToken = (await oAuth2Client.getAccessToken());

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'pethub215@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });

        const mailOptions = {
            from: "pethub215@gmail.com",
            to: toEmail,
            subject: title,
            text: body
        }

        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw error
    }
}