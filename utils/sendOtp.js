import nodemailer from 'nodemailer'
 
export  const sendOtpToEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // ✅ Your Gmail address
      pass: process.env.EMAIL_PASS  // ❌ App Password hona chahiye
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}`
  };

  await transporter.sendMail(mailOptions);
};
