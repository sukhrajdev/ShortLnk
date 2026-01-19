import nodemailer from "nodemailer";
import "dotenv/config";

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
    <title>Welcome to SHORTLNK</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #eef2f7;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .wrapper {
            width: 100%;
            padding: 30px 0;
        }

        .container {
            max-width: 600px;
            margin: auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
        }

        .header {
            background: linear-gradient(135deg, #4f46e5, #3b82f6);
            padding: 30px;
            text-align: center;
            color: #ffffff;
        }

        .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 600;
        }

        .content {
            padding: 30px;
            color: #374151;
            font-size: 16px;
            line-height: 1.7;
        }

        .content p {
            margin: 0 0 16px;
        }

        .username {
            font-weight: 600;
            color: #111827;
        }

        .cta-box {
            margin-top: 25px;
            padding: 20px;
            background-color: #f9fafb;
            border-left: 4px solid #3b82f6;
            border-radius: 6px;
        }

        .cta-box p {
            margin: 0;
            font-size: 15px;
            color: #4b5563;
        }

        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #9ca3af;
            background-color: #f9fafb;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>Welcome to SHORTLNK 🎉</h1>
            </div>

            <div class="content">
                <p>Hello <span class="username">{{username}}</span>,</p>

                <p>
                    We’re excited to have you on board! Your account has been successfully created,
                    and you’re now ready to start using SHORTLNK to simplify, manage, and share your links effortlessly.
                </p>

                <div class="cta-box">
                    <p>
                        🚀 Start exploring your dashboard and unlock powerful features designed to save your time and boost productivity.
                    </p>
                </div>

                <p style="margin-top: 24px;">
                    If you ever need help, our team is always here to support you.
                </p>

                <p>
                    Best regards,<br>
                    <strong>The SHORTLNK Team</strong>
                </p>
            </div>

            <div class="footer">
                <p>&copy; 2026 SHORTLNK. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
`
export async function sendWelcomeEmail(to,username) {
    try{
        const newHtmlContent = htmlContent.replace("{{username}}", username);
        const mailOptions = {
        from: "SHORTLNKR <shortlnkr@support.com>",
        to,
        subject: "Thank you for registering with SHORTLNK",
        html: newHtmlContent,
    };
    
    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully");
    }catch(error){
        console.error("Error sending welcome email:", error);
    }
};
