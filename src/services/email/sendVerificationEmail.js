import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sukhrajsingh.dev1@gmail.com",
    pass: process.env.GOOGLE_APP_PASSWORD, // The 16-character App Password
  },
});

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #333333;
        }
        .content {
            font-size: 16px;
            line-height: 1.5;
            color: #555555;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            background-color: #28a745;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #999999;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Verify Your Email Address</h1>
        </div>
        <div class="content">
            <p>Dear {{username}},</p>
            <p>Thank you for registering with us! Please click the button below to verify your email address and complete your registration:</p>
            <a href="{{verificationLink}}" class="button">Verify Email</a>
            <p>If you did not create an account, please ignore this email.</p>
            <p>Best regards,<br>The Team</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 SHORTLNK. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`
export async function sendVerificationEmail(to, Token,username) {
    try{
        const verificationLink = `http://localhost:3000/verify-email?token=${Token}`;
        const newHtmlContent = htmlContent.replace("{{verificationLink}}", verificationLink).replace("{{username}}", username);
        const mailOptions = {
        from: "SHORTLNKR <shortlnkr@support.com>",
        to,
        subject: "Please verify your email address",
        html: newHtmlContent,
    };
    
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
    }catch(error){
        console.error("Error sending verification email:", error);
    }
};
