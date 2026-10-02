const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { requestOtp, verifyOtp } = require('../utils/otp');
const cleanEmail = email => String(email || '').trim().toLowerCase();

const vendorRegisterRequest = async (req, res) => {
  try {
    const username = String(req.body.username || '').trim(); const email = cleanEmail(req.body.email); const password = String(req.body.password || '');
    if (!username || !email || !password) return res.status(400).json({ error: 'Username, email and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (await Vendor.findOne({ email })) return res.status(400).json({ error: 'Email Already Taken' });
    const passwordHash = await bcrypt.hash(password, 10);
    await requestOtp({ email, purpose: 'vendor-register', payload: { username, email, passwordHash } });
    res.status(200).json({ message: 'OTP sent to your email. Verify it to complete registration.' });
  } catch (error) { console.error(error); res.status(error.status || 500).json({ error: error.status ? error.message : 'Unable to send OTP. Check email configuration.' }); }
};
const vendorRegisterVerify = async (req, res) => {
  try {
    const email = cleanEmail(req.body.email); const payload = await verifyOtp({ email, purpose: 'vendor-register', otp: req.body.otp });
    if (!payload) return res.status(400).json({ error: 'Registration session expired. Start again.' });
    if (await Vendor.findOne({ email })) return res.status(400).json({ error: 'Email Already Taken' });
    await Vendor.create({ username: payload.username, email, password: payload.passwordHash, emailVerified: true });
    res.status(201).json({ message: 'Email verified. Vendor registered successfully.' });
  } catch (error) { console.error(error); res.status(error.status || 500).json({ error: error.status ? error.message : 'Internal Server Error' }); }
};
const vendorLoginRequest = async (req, res) => {
  try {
    const email = cleanEmail(req.body.email); const password = String(req.body.password || ''); const vendor = await Vendor.findOne({ email });
    if (!vendor || !(await bcrypt.compare(password, vendor.password))) return res.status(401).json({ error: 'Invalid Email or Password' });
    await requestOtp({ email, purpose: 'vendor-login', payload: { vendorId: vendor._id.toString() } });
    res.status(200).json({ message: 'OTP sent to your email. Verify it to complete login.' });
  } catch (error) { console.error(error); res.status(error.status || 500).json({ error: error.status ? error.message : 'Unable to send OTP. Check email configuration.' }); }
};
const vendorLoginVerify = async (req, res) => {
  try {
    const email = cleanEmail(req.body.email); const payload = await verifyOtp({ email, purpose: 'vendor-login', otp: req.body.otp }); const vendor = await Vendor.findById(payload?.vendorId);
    if (!vendor) return res.status(401).json({ error: 'Vendor account not found' });
    if (!vendor.emailVerified) { vendor.emailVerified = true; await vendor.save(); }
    const token = jwt.sign({ vendorId: vendor._id.toString(), role: 'vendor' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token, vendorId: vendor._id, username: vendor.username, email: vendor.email });
  } catch (error) { console.error(error); res.status(error.status || 500).json({ error: error.status ? error.message : 'Internal Server Error' }); }
};
const getVendorById = async (req, res) => { try { const vendor = await Vendor.findById(req.params.vendorId).populate('firm'); if (!vendor) return res.status(404).json({ error: 'Vendor not found' }); res.status(200).json(vendor); } catch (error) { console.error(error); res.status(500).json({ error: 'Internal Server Error' }); } };
module.exports = { vendorRegisterRequest, vendorRegisterVerify, vendorLoginRequest, vendorLoginVerify, getVendorById };
