const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    emailVerified: { type: Boolean, default: false },
    firm:[
    {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Firm'
    }
]

}, { timestamps: true });

vendorSchema.set("toJSON", { transform: (_doc, ret) => { delete ret.password; return ret; } });

module.exports =  mongoose.model("Vendor", vendorSchema);