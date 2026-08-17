const logger = require("../utils/logger");

exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Since this is just a contact form, we'll log it for now
    // In a real app, this would save to DB or send an email
    logger.info(`Contact Form Submission from ${name} (${email}): ${message}`);

    return res.status(200).json({
      success: true,
      message: "Message received",
    });
  } catch (err) {
    logger.error("Error in contact form submission: ", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
