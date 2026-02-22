const Email = require("../models/Email");

exports.sendEmail = async (req, res) => {
  try {
    const { sender, receiver, subject, message } = req.body;

    const newEmail = new Email({
      sender,
      receiver,
      subject,
      message,
    });

    await newEmail.save();
    res.status(201).json({ msg: "Email sent successfully!", email: newEmail });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

// Logic to get all emails for a specific user (Inbox)
exports.getInbox = async (req, res) => {
  try {
    const emails = await Email.find({ receiver: req.params.email }).sort({
      createdAt: -1,
    });
    res.json(emails);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};
