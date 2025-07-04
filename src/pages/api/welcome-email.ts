import { NextApiRequest, NextApiResponse } from 'next';
import { sendWelcomeEmail } from '../../lib/email';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST method is allowed' 
    });
  }

  const { displayName, email, institution, studyProgram } = req.body;

  // Validate required fields
  if (!displayName || !email) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      message: 'displayName and email are required' 
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Invalid email format',
      message: 'Please provide a valid email address' 
    });
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Welcome email API called');
    }

    await sendWelcomeEmail(displayName, email, institution, studyProgram);
    
    return res.status(200).json({ 
      success: true,
      message: 'Welcome email sent successfully' 
    });
  } catch (error) {
    console.error('❌ Welcome email API error');
    
    // Check if it's an email service error
    const emailError = error as { 
      message?: string; 
      code?: string; 
      responseCode?: number; 
    };

    let errorMessage = 'Failed to send welcome email';
    let statusCode = 500;

    if (emailError.code === 'EAUTH') {
      errorMessage = 'Email authentication failed';
      statusCode = 500;
    } else if (emailError.code === 'ECONNECTION') {
      errorMessage = 'Email service connection failed';
      statusCode = 503;
    } else if (emailError.responseCode === 550) {
      errorMessage = 'Invalid email address';
      statusCode = 400;
    }

    return res.status(statusCode).json({ 
      error: 'Email sending failed',
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? emailError.message : undefined
    });
  }
}