# Ranaveer Food Delivery Platform

A full-stack food delivery demo built with MongoDB Atlas, Node.js/Express, React/Vite and Postman.

## Real-time OTP authentication
Ranaveer uses a real email OTP flow for **customer and vendor registration and login**.

- 6-digit OTP generated on the server
- OTP expires after 10 minutes
- Resend cooldown: 60 seconds
- Maximum 5 incorrect attempts
- OTP is stored hashed in MongoDB
- Registration password is hashed before the temporary OTP record is stored
- Login only returns a JWT after the OTP is verified
- Email is branded as a Ranaveer verification email

### Configure email
Copy `backend/.env.example` to `backend/.env` and set:

```env
PORT=4000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_gmail_address@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=Ranaveer <your_gmail_address@gmail.com>
```

For Gmail, use a Google **App Password** with an account that has 2-Step Verification enabled. Do not put your normal Gmail password in `.env`.

Without valid SMTP settings the OTP cannot be delivered to a real inbox; the server intentionally does not return OTPs in the API response.

## Backend
```bash
cd backend
npm install
npm start
```
Backend: `http://localhost:4000`

## Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend: `http://localhost:5173`

## Customer journey
Register -> receive email OTP -> verify -> Login -> receive email OTP -> verify -> Browse vendor restaurants -> View products -> Cart -> Place order -> My Orders.

Vendor journey
Register -> receive email OTP -> verify -> Login -> receive email OTP -> verify -> Add firms/restaurants -> Add products.

Vendor-created firms and products are read from the same MongoDB database and are displayed to customers through the public browse APIs.

Never commit `.env` files, SMTP credentials, MongoDB passwords, JWT secrets, or real tokens to GitHub.
