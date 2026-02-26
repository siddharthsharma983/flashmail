import { sendEmail } from "../services/api";

// inside handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  try {
    await sendEmail({ to, subject, body }, token);
    alert("Email sent successfully!");
  } catch (err) {
    console.error(err);
    alert("Failed to send email");
  }
};
