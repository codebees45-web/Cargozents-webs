require('dotenv').config({ path: 'c:/Users/HP/Downloads/Cargozents-webs-main/Cargozents-webs-main/Cargozents-main/backend/.env' });
const sendEmail = require('./src/utils/sendEmail');

(async () => {
  console.log("Testing email functionality...");
  try {
    await sendEmail({
      to: 'codebees45@gmail.com', // Sending to self to test
      subject: 'Test OTP',
      text: 'This is a test OTP from the backend script.'
    });
    console.log("Finished executing email test.");
  } catch (err) {
    console.error("Failed executing email test:", err);
  }
})();
