const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");

const customerAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Authorization token required"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (!decoded.customerId) {
            return res.status(401).json({
                error: "Invalid Token"
            });
        }

        const customer = await Customer.findById(
            decoded.customerId
        ).select("-password");

        if (!customer) {
            return res.status(401).json({
                error: "Customer not found"
            });
        }

        req.customer = customer;

        next();

    } catch (error) {
        console.error("CUSTOMER AUTH ERROR:", error.message);

        return res.status(401).json({
            error: "Invalid Token"
        });
    }
};

module.exports = customerAuth;