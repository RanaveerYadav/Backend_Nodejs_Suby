const Customer = require("../models/Customer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
    requestOtp,
    verifyOtp
} = require("../utils/otp");


// ==========================================
// CLEAN EMAIL
// ==========================================

const cleanEmail = (email) => {
    return String(email || "")
        .trim()
        .toLowerCase();
};


// ==========================================
// CUSTOMER REGISTER - REQUEST OTP
// ==========================================

const customerRegisterRequest = async (req, res) => {

    try {

        console.log("--------------------------------");
        console.log("CUSTOMER REGISTER REQUEST");
        console.log("--------------------------------");

        const username = String(
            req.body.username || ""
        ).trim();

        const email = cleanEmail(
            req.body.email
        );

        const password = String(
            req.body.password || ""
        );

        console.log("Username:", username);
        console.log("Email:", email);

        // Validate fields
        if (!username || !email || !password) {

            return res.status(400).json({
                error:
                    "Username, email and password are required"
            });

        }

        // Validate password
        if (password.length < 6) {

            return res.status(400).json({
                error:
                    "Password must be at least 6 characters"
            });

        }

        // Check existing customer
        console.log("Checking existing customer...");

        const existingCustomer =
            await Customer.findOne({
                email: email
            });

        if (existingCustomer) {

            return res.status(400).json({
                error: "Email Already Taken"
            });

        }

        console.log(
            "Customer does not exist"
        );

        // Hash password
        console.log(
            "Hashing password..."
        );

        const passwordHash =
            await bcrypt.hash(
                password,
                10
            );

        console.log(
            "Password hashed successfully"
        );

        // Send registration OTP
        console.log(
            "Calling requestOtp()..."
        );

        await requestOtp({

            email: email,

            purpose:
                "customer-register",

            payload: {

                username: username,

                email: email,

                passwordHash:
                    passwordHash

            }

        });

        console.log(
            "requestOtp() completed successfully"
        );

        return res.status(200).json({

            message:
                "OTP sent to your email. Verify it to complete registration."

        });

    } catch (error) {

        console.error(
            "================================"
        );

        console.error(
            "CUSTOMER REGISTER OTP ERROR"
        );

        console.error(
            "================================"
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "Code:",
            error.code
        );

        console.error(
            "Status:",
            error.status
        );

        console.error(
            error
        );

        console.error(
            "================================"
        );

        return res.status(
            error.status || 500
        ).json({

            error:
                error.message ||
                "Unable to send OTP",

            code:
                error.code || null

        });

    }

};


// ==========================================
// CUSTOMER REGISTER - VERIFY OTP
// ==========================================

const customerRegisterVerify = async (
    req,
    res
) => {

    try {

        console.log(
            "CUSTOMER REGISTER VERIFY OTP"
        );

        const email = cleanEmail(
            req.body.email
        );

        const otp = String(
            req.body.otp || ""
        ).trim();

        if (!email || !otp) {

            return res.status(400).json({
                error:
                    "Email and OTP are required"
            });

        }

        const payload =
            await verifyOtp({

                email: email,

                purpose:
                    "customer-register",

                otp: otp

            });

        if (!payload) {

            return res.status(400).json({

                error:
                    "Registration session expired. Start registration again."

            });

        }

        // Check duplicate again
        const existingCustomer =
            await Customer.findOne({
                email: email
            });

        if (existingCustomer) {

            return res.status(400).json({
                error:
                    "Email Already Taken"
            });

        }

        // Create customer
        const customer =
            await Customer.create({

                username:
                    payload.username,

                email:
                    email,

                password:
                    payload.passwordHash,

                emailVerified:
                    true

            });

        console.log(
            "CUSTOMER CREATED:",
            customer._id
        );

        return res.status(201).json({

            message:
                "Email verified. Customer registered successfully.",

            customer: {

                _id:
                    customer._id,

                username:
                    customer.username,

                email:
                    customer.email,

                emailVerified:
                    customer.emailVerified

            }

        });

    } catch (error) {

        console.error(
            "CUSTOMER REGISTER VERIFY ERROR:",
            error
        );

        return res.status(
            error.status || 500
        ).json({

            error:
                error.message ||
                "Internal Server Error"

        });

    }

};


// ==========================================
// CUSTOMER LOGIN - EMAIL + PASSWORD
// ==========================================

const customerLoginRequest = async (
    req,
    res
) => {

    try {

        console.log(
            "CUSTOMER LOGIN"
        );

        const email = cleanEmail(
            req.body.email
        );

        const password = String(
            req.body.password || ""
        );

        // Validate fields
        if (!email || !password) {

            return res.status(400).json({

                error:
                    "Email and password are required"

            });

        }

        // Find customer
        const customer =
            await Customer.findOne({
                email: email
            });

        if (!customer) {

            return res.status(401).json({

                error:
                    "Invalid Email or Password"

            });

        }

        // Compare password
        const passwordMatch =
            await bcrypt.compare(
                password,
                customer.password
            );

        if (!passwordMatch) {

            return res.status(401).json({

                error:
                    "Invalid Email or Password"

            });

        }

        // Check email verification
        if (!customer.emailVerified) {

            return res.status(403).json({

                error:
                    "Please verify your email before logging in"

            });

        }

        console.log(
            "Password verified. Sending login OTP..."
        );

        await requestOtp({
            email: email,
            purpose: "customer-login",
            payload: {
                customerId: customer._id.toString()
            }
        });

        return res.status(200).json({
            message: "OTP sent to your email. Verify it to complete login."
        });

    } catch (error) {

        console.error(
            "CUSTOMER LOGIN ERROR:",
            error
        );

        return res.status(
            error.status || 500
        ).json({
            error:
                error.message ||
                "Unable to send OTP"
        });

    }

};


// ==========================================
// CUSTOMER LOGIN - VERIFY OTP
// ==========================================
// Kept here only for compatibility with
// existing routes. Direct password login
// does NOT use this function anymore.
// ==========================================

const customerLoginVerify = async (
    req,
    res
) => {

    try {

        console.log(
            "CUSTOMER LOGIN VERIFY OTP"
        );

        const email = cleanEmail(
            req.body.email
        );

        const otp = String(
            req.body.otp || ""
        ).trim();

        if (!email || !otp) {

            return res.status(400).json({

                error:
                    "Email and OTP are required"

            });

        }

        const payload =
            await verifyOtp({

                email: email,

                purpose:
                    "customer-login",

                otp: otp

            });

        if (
            !payload ||
            !payload.customerId
        ) {

            return res.status(401).json({

                error:
                    "Invalid or expired OTP"

            });

        }

        const customer =
            await Customer.findById(
                payload.customerId
            );

        if (!customer) {

            return res.status(401).json({

                error:
                    "Customer account not found"

            });

        }

        if (!customer.emailVerified) {
            customer.emailVerified = true;
            await customer.save();
        }

        const token =
            jwt.sign(

                {
                    customerId:
                        customer._id.toString(),

                    role:
                        "customer"
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "1d"
                }

            );

        return res.status(200).json({

            message:
                "Login successful",

            token:
                token,

            customer: {

                _id:
                    customer._id,

                username:
                    customer.username,

                email:
                    customer.email,

                emailVerified:
                    customer.emailVerified

            }

        });

    } catch (error) {

        console.error(
            "CUSTOMER LOGIN VERIFY ERROR:",
            error
        );

        return res.status(
            error.status || 500
        ).json({

            error:
                error.message ||
                "Internal Server Error"

        });

    }

};


// ==========================================
// CUSTOMER PROFILE
// ==========================================

const getCustomerProfile = async (
    req,
    res
) => {

    try {

        return res.status(200).json({

            customer:
                req.customer

        });

    } catch (error) {

        console.error(
            "CUSTOMER PROFILE ERROR:",
            error
        );

        return res.status(500).json({

            error:
                "Internal Server Error"

        });

    }

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    customerRegisterRequest,

    customerRegisterVerify,

    customerLoginRequest,

    customerLoginVerify,

    getCustomerProfile

};