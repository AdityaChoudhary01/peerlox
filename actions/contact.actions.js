"use server";

import connectDB from "@/lib/db";

export async function submitContactForm(formData) {
  try {
    const { name, email, message } = formData;
    
    // 1. Basic Validation
    if (!name || !email || !message) {
      return { success: false, error: "All fields are required." };
    }

    // 2. Optional: Save to Database (Uncomment if you have a Message model)
    // await connectDB();
    // await Message.create({ name, email, message });
    
    // 3. Send Email via Brevo API
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: {
          name: "PeerNotez System",
          email: process.env.BREVO_VERIFIED_SENDER_EMAIL
        },
        to: [
          {
            email: process.env.BREVO_VERIFIED_SENDER_EMAIL, // Sending to yourself
            name: "PeerNotez Admin"
          }
        ],
        replyTo: {
          email: email, // Allows you to hit "Reply" in your inbox
          name: name
        },
        subject: `New Contact Form Submission from ${name}`,
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
            <h2 style="color: #00d4ff;">New Message Received</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
            <p><strong>Message:</strong></p>
            <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #ff00cc; border-radius: 4px; white-space: pre-wrap;">${message}</blockquote>
          </div>
        `
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API Error:", errorData);
      return { success: false, error: "Failed to send email via Brevo." };
    }

    return { success: true };
  } catch (error) {
    console.error("Contact Error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}