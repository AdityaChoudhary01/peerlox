"use server";

import axios from 'axios';

export async function subscribeToNewsletter(subscriberEmail) {
  try {
    const requestId = Date.now();
    
    // 1. ADMIN EMAIL: Where you want to receive the notification
    const adminEmail = process.env.ADMIN_EMAIL || "aadiwrld01@gmail.com"; 
    
    // 2. SENDER EMAIL: MUST be the email you verified inside your Brevo account!
    // If you haven't set SENDER_EMAIL in your .env, it defaults to your admin email.
    const senderEmail = process.env.SENDER_EMAIL || "aadiwrld01@gmail.com"; 

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: "PeerNotez Newsletter",
          email: senderEmail, // ✅ FIX: Must be your verified Brevo email
        },
        to: [
          {
            email: adminEmail, // You receive the notification
            name: "Admin",
          },
        ],
        replyTo: {
          email: subscriberEmail, // ✅ Now if you hit "reply" in Gmail, it goes to the user
        },
        subject: `New Newsletter Subscriber! [ID: ${requestId}]`,
        htmlContent: `
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #4facfe;">New Newsletter Subscriber! 🎉</h2>
              <p>Someone just joined the PeerNotez community via the footer form.</p>
              <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin-top: 10px;">
                <p style="margin: 0;"><strong>Subscriber Email:</strong> <a href="mailto:${subscriberEmail}">${subscriberEmail}</a></p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">Request ID: ${requestId}</p>
              </div>
            </body>
          </html>
        `,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY, 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      }
    );

    return { success: true };
  } catch (error) {
    console.error('Newsletter Subscription Error:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.message || "Failed to join. Try again later.";
    return { success: false, error: errorMessage };
  }
}