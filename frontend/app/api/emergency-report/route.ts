import { NextRequest, NextResponse } from 'next/server';

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

    // TODO: Integrate with your backend services
    // 1. Upload media to cloud storage (S3, Blob, etc.)
    // 2. Send to AI service for analysis
    // 3. Get emergency classification and severity
    // 4. Notify emergency services (police, fire, ambulance)
    // 5. Store report in database

    // Generate emergency report ID
    const reportId = `ER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Example response
    console.log('Emergency Report Received:', {
      id: reportId,
      type,
      location,
      phone,
      mediaSize: media.size,
      mediaType: media.type,
    });

    return NextResponse.json(
      {
        success: true,
        id: reportId,
        message: 'Emergency report submitted. Dispatching services...',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Emergency report error:', error);
    return NextResponse.json(
      { error: 'Failed to process emergency report' },
      { status: 500 }
    );
  }
}
