import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER || "noreply.notify3@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD || "apyghbzqmtalqqnk",
    },
});

export async function sendPasswordResetEmail(email: string, resetLink: string) {
    const mailOptions = {
        from: process.env.GMAIL_USER || "noreply.notify3@gmail.com",
        to: email,
        subject: "MyValue - Password Reset Request",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #a81b21; margin: 0;">MyValue</h2>
            </div>
            <p style="color: #333; font-size: 16px;">Hello,</p>
            <p style="color: #333; font-size: 16px;">We received a request to reset your password. Click the button below to set a new password. This link is valid for 30 minutes.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #a81b21; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #333; font-size: 14px;">If the button doesn't work, copy and paste the following link into your browser:</p>
            <p style="color: #0066cc; font-size: 14px; word-break: break-all;">${resetLink}</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
            <p style="color: #777; font-size: 12px; text-align: center;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Password reset email sent to", email);
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw new Error("Failed to send email");
    }
}
