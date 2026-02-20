import { google } from 'googleapis';

export const indexNewContent = async (urlID, type) => {
  try {
    // 1. Check credentials at runtime
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.warn('⚠️ SEO: Missing Google Credentials.');
      return false;
    }

    // 2. Exact MERN formatting (Positional Arguments)
    const jwtClient = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/indexing'],
      null
    );

    await jwtClient.authorize();
    
    const baseUrl = process.env.NEXTAUTH_URL || 'https://peernotez.netlify.app';
    const targetUrl = type === 'note' 
        ? `${baseUrl}/notes/${urlID}` 
        : `${baseUrl}/blogs/${urlID}`;

    const response = await google.indexing('v3').urlNotifications.publish({
      auth: jwtClient,
      requestBody: {
        url: targetUrl,
        type: 'URL_UPDATED',
      },
    });

    console.log(`✅ SEO Success: Google notified for ${type}: ${targetUrl}`);
    return true;
  } catch (error) {
    console.error('❌ SEO Error: Google Indexing API failed:', error.message);
    return false;
  }
};

export const removeContentFromIndex = async (urlID, type) => {
  try {
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return false;
    }

    const jwtClient = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/indexing'],
      null
    );

    await jwtClient.authorize();
    
    const baseUrl = process.env.NEXTAUTH_URL || 'https://peernotez.netlify.app';
    const targetUrl = type === 'note' 
        ? `${baseUrl}/notes/${urlID}` 
        : `${baseUrl}/blogs/${urlID}`;

    await google.indexing('v3').urlNotifications.publish({
      auth: jwtClient,
      requestBody: {
        url: targetUrl,
        type: 'URL_DELETED',
      },
    });

    console.log(`✅ SEO Success: Google notified of deletion: ${targetUrl}`);
    return true;
  } catch (error) {
    console.error('❌ SEO Error: Google Indexing API failed:', error.message);
    return false;
  }
};