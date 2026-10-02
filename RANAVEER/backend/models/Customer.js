const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  emailVerified: { type: Boolean, default: false }
}, { timestamps: true });

customerSchema.set("toJSON", {
  transform: (_doc, ret) => { delete ret.password; return ret; }
});

module.exports = mongoose.model("Customer", customerSchema);
