const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const EmailOtp = require("../models/EmailOtp");
const { sendOtpEmail } = require("./emailService");

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_ATTEMPTS = 5;

// ==========================================
// GENERATE OTP
// ==========================================
function makeOtp() {
    return String(crypto.randomInt(100000, 1000000));
}

// ==========================================
// REQUEST OTP
// ==========================================
async function requestOtp({ email, purpose, payload }) {
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail) {
        const error = new Error("Email is required for OTP");
        error.status = 400;
        throw error;
    }

    console.log("OTP REQUEST STARTED for:", cleanEmail, "Purpose:", purpose);

    // Check existing OTP for cooldown
    const existing = await EmailOtp.findOne({
        email: cleanEmail,
        purpose
    });

    if (existing && existing.lastSentAt) {
        const timeSince = Date.now() - new Date(existing.lastSentAt).getTime();
        if (timeSince < RESEND_COOLDOWN_MS) {
            const wait = Math.ceil((RESEND_COOLDOWN_MS - timeSince) / 1000);
            const error = new Error(
                `Please wait ${wait} seconds before requesting another OTP`
            );
            error.status = 429;
            throw error;
        }
    }

    // Generate 6-digit OTP
    const otp = makeOtp();
    const codeHash = await bcrypt.hash(otp, 10);

    // Send email FIRST so that email delivery failures don't record cooldowns or dirty states
    console.log("Sending OTP email to:", cleanEmail);
    await sendOtpEmail({
        to: cleanEmail,
        otp: otp,
        purpose: purpose
    });
    console.log("OTP email sent successfully");

    // Save/update OTP in database
    await EmailOtp.findOneAndUpdate(
        {
            email: cleanEmail,
            purpose
        },
        {
            email: cleanEmail,
            purpose,
            codeHash,
            payload: payload || null,
            expiresAt: new Date(Date.now() + OTP_TTL_MS),
            attempts: 0,
            lastSentAt: new Date()
        },
        {
            upsert: true,
            returnDocument: 'after',
            setDefaultsOnInsert: true
        }
    );

    console.log("OTP record saved in database");
    return true;
}

// ==========================================
// VERIFY OTP
// ==========================================
async function verifyOtp({ email, purpose, otp }) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanOtp = String(otp || "").trim();

    if (!cleanEmail || !cleanOtp) {
        const error = new Error("Email and OTP are required");
        error.status = 400;
        throw error;
    }

    const record = await EmailOtp.findOne({
        email: cleanEmail,
        purpose
    });

    if (!record) {
        const error = new Error("OTP not found. Please request a new OTP.");
        error.status = 400;
        throw error;
    }

    if (!record.expiresAt || new Date(record.expiresAt).getTime() < Date.now()) {
        await EmailOtp.deleteOne({ _id: record._id });
        const error = new Error("OTP expired. Please request a new OTP.");
        error.status = 400;
        throw error;
    }

    if (record.attempts >= MAX_ATTEMPTS) {
        const error = new Error(
            "Too many incorrect attempts. Please request a new OTP."
        );
        error.status = 429;
        throw error;
    }

    const valid = await bcrypt.compare(cleanOtp, record.codeHash);

    if (!valid) {
        record.attempts = (record.attempts || 0) + 1;
        await record.save();

        const remaining = Math.max(0, MAX_ATTEMPTS - record.attempts);
        const error = new Error(
            `Invalid OTP. ${remaining} attempts remaining.`
        );
        error.status = 400;
        throw error;
    }

    const payload = record.payload;

    // Clean up OTP record upon successful verification
    await EmailOtp.deleteOne({ _id: record._id });

    return payload;
}

module.exports = {
    requestOtp,
    verifyOtp
};