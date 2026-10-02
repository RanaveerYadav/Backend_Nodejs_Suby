const nodemailer = require("nodemailer");

function getTransporter() {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || 465);

    const user = process.env.SMTP_USER;

    // Gmail App Password may contain spaces when displayed.
    const pass = process.env.SMTP_PASS
        ? process.env.SMTP_PASS.replace(/\s+/g, "")
        : "";

    if (!user || !pass) {
        throw new Error(
            "SMTP_USER or SMTP_PASS is missing from backend environment variables"
        );
    }

    const secure =
        String(
            process.env.SMTP_SECURE ||
            (port === 465 ? "true" : "false")
        ).toLowerCase() === "true" || port === 465;

    console.log("Using SMTP transport:", {
        host,
        port,
        secure,
        user
    });

    return nodemailer.createTransport({
        host,
        port,
        secure,

        auth: {
            user,
            pass
        },

        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000
    });
}

async function sendOtpEmail({
    to,
    otp,
    purpose = "customer-login"
}) {
    let subject = "Ranaveer OTP Verification";
    let title = "Verify Your Ranaveer Account";
    let description =
        "Use the OTP below to complete your verification.";

    if (purpose === "customer-register") {
        subject = "Ranaveer - Verify Your Account";
        title = "Ranaveer Account Verification";
        description =
            "Use the OTP below to verify your email address and complete your registration.";
    }

    if (purpose === "customer-login") {
        subject = "Ranaveer - Login Verification Code";
        title = "Ranaveer Login Verification";
        description =
            "Use the OTP below to complete your login.";
    }

    const text = `${title}

${description}

Your OTP is: ${otp}

This OTP is valid for 10 minutes. Do not share it with anyone.`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >
    <title>${subject}</title>
</head>

<body style="
    margin:0;
    padding:0;
    background:#f5f5f5;
    font-family:Arial,sans-serif;
">
    <div style="
        max-width:600px;
        margin:40px auto;
        background:#ffffff;
        border-radius:12px;
        overflow:hidden;
    ">

        <div style="
            padding:30px;
            text-align:center;
            background:#111827;
            color:#ffffff;
        ">
            <h1 style="margin:0;font-size:28px;">
                Ranaveer
            </h1>
        </div>

        <div style="padding:35px 30px;">

            <h2 style="
                margin-top:0;
                color:#111827;
            ">
                ${title}
            </h2>

            <p style="
                font-size:16px;
                line-height:1.6;
                color:#4b5563;
            ">
                ${description}
            </p>

            <div style="
                margin:30px 0;
                padding:20px;
                text-align:center;
                background:#f3f4f6;
                border-radius:10px;
            ">
                <div style="
                    font-size:13px;
                    color:#6b7280;
                    margin-bottom:8px;
                ">
                    YOUR OTP
                </div>

                <div style="
                    font-size:36px;
                    font-weight:bold;
                    letter-spacing:8px;
                    color:#111827;
                ">
                    ${otp}
                </div>
            </div>

            <p style="
                font-size:14px;
                line-height:1.6;
                color:#6b7280;
            ">
                This OTP is valid for 10 minutes.
                For your security, please do not share this code with anyone.
            </p>

        </div>

        <div style="
            padding:20px 30px;
            background:#f9fafb;
            text-align:center;
            color:#9ca3af;
            font-size:13px;
        ">
            © Ranaveer. All rights reserved.
        </div>

    </div>
</body>
</html>
`;

    const transporter = getTransporter();

    const from =
        process.env.SMTP_FROM ||
        `Ranaveer <${process.env.SMTP_USER}>`;

    console.log("Sending OTP email via Gmail SMTP to:", to);

    const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html
    });

    console.log(
        "OTP email sent successfully via SMTP:",
        info.messageId
    );

    return info;
}

module.exports = {
    sendOtpEmail
};