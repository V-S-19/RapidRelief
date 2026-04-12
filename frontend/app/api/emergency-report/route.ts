import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * POST /api/emergency-report
 * 
 * Receives emergency reports with media, processes them, and notifies emergency services.
 * 
 * Request body (FormData):
 * - type: string - Emergency type (accident, fire, medical, injury, other)
 * - description: string - Description of the emergency
 * - location: string - Location of the emergency
 * - phone: string - Contact phone number
 * - media: File - Photo or video file captured from device
 * 
 * Response:
 * - success: true/false
 * - id: string - Emergency report ID
 * - message: string - Status message
 * - aiAnalysis: object - AI analysis results
 */

export async function POST(request: NextRequest) {
  try {
    // Parse FormData from request
    const formData = await request.formData();
    
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;
    const location = formData.get('location') as string;
    const phone = formData.get('phone') as string;
    const media = formData.get('media') as File;

    // Validation
    if (!type || !description || !location || !phone || !media) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // File size validation (max 50MB)
    if (media.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 413 }
      );
    }

    // File type validation
    const validMimeTypes = ['image/jpeg', 'image/png', 'video/webm', 'video/mp4'];
    if (!validMimeTypes.includes(media.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a photo or video.' },
        { status: 400 }
      );
    }

    // Generate emergency report ID
    const reportId = `ER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Convert file to base64 for AI analysis
    const buffer = await media.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');

    // Initialize analysis results
    let aiAnalysis = {
      status: 'unknown',
      confidence: 0,
      message: 'Analysis pending'
    };

    // Send to AI service for analysis
    try {
      const aiResponse = await fetch(`${AI_SERVICE_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
        signal: AbortSignal.timeout(30000)
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const alertData = aiData.alert || {};
        aiAnalysis = {
          status: String(alertData.status || 'unknown'),
          confidence: Number(alertData.confidence || 0),
          message: aiData.message || 'Analysis complete'
        };
        console.log('🤖 AI Analysis Result:', aiAnalysis);
      }
    } catch (aiError) {
      console.warn('⚠️ AI Service unavailable, proceeding with emergency detection:', aiError);
      aiAnalysis = {
        status: 'unknown',
        confidence: 0,
        message: 'AI analysis unavailable'
      };
    }

    // Send notification to backend for broadcasting
    try {
      await fetch(`${BACKEND_URL}/api/emergency/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          type,
          description,
          location,
          phone,
          media: {
            type: media.type,
            size: media.size,
            name: media.name
          },
          aiAnalysis,
          timestamp: new Date().toISOString()
        }),
        signal: AbortSignal.timeout(10000)
      });

      console.log('✅ Emergency notification sent to backend');
    } catch (notifyError) {
      console.warn('⚠️ Failed to send notification to backend:', notifyError);
    }

    console.log('📋 Emergency Report Received:', {
      id: reportId,
      type,
      location,
      phone,
      mediaSize: media.size,
      mediaType: media.type,
      aiStatus: aiAnalysis.status
    });

    return NextResponse.json(
      {
        success: true,
        id: reportId,
        message: 'Emergency report submitted. Dispatching services...',
        aiAnalysis
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Emergency report error:', error);
    return NextResponse.json(
      { error: 'Failed to process emergency report' },
      { status: 500 }
    );
  }
}
