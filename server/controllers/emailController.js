const Email = require("../models/Email");

exports.sendEmail = async (req, res) => {
  const { recipientEmail, subject, message } = req.body;
  try {
    const newEmail = new Email({
      senderEmail: req.user.email,
      recipientEmail,
      subject,
      message,
    });
    await newEmail.save();
    res.json({ msg: "Email Sent Successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.getInbox = async (req, res) => {
  try {
    const emails = await Email.find({ recipientEmail: req.user.email }).sort({
      createdAt: -1,
    });
    res.json(emails);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.getSent = async (req, res) => {
  try {
    const emails = await Email.find({ senderEmail: req.user.email }).sort({
      createdAt: -1,
    });
    res.json(emails);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.deleteEmail = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) return res.status(404).json({ msg: "Email not found" });
    await Email.findByIdAndDelete(req.params.id);
    res.json({ msg: "Email removed" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};
