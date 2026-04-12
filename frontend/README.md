# RapidRelief Frontend

Emergency response platform frontend built with Next.js 16, React 19, and Tailwind CSS.

## Features

- **Live Camera Capture**: Capture photos and videos directly from device (no gallery uploads)
- **Emergency Reporting**: Submit emergency reports with type, location, and contact info
- **AI-Powered Analysis**: Send media to AI service for emergency classification
- **Real-time Dispatch**: Notify emergency services (police, fire, ambulance)
- **Dark Mode UI**: Modern, stress-optimized interface with dark theme

## Getting Started

### Installation

```bash
cd frontend
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
pnpm build
pnpm start
```

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx           # Main landing page with state management
│   ├── layout.tsx         # Root layout with metadata
│   ├── globals.css        # Global styles and design tokens
│   └── api/
│       └── emergency-report/
│           └── route.ts   # Emergency report API endpoint
├── components/
│   ├── emergency-capture.tsx      # Camera/video capture interface
│   ├── emergency-form.tsx         # Emergency details form
│   ├── emergency-confirmation.tsx # Submission confirmation screen
│   └── ui/                        # shadcn/ui components
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

## API Integration

### Emergency Report Endpoint

**POST** `/api/emergency-report`

Submit emergency reports with media files.

**Request (FormData):**
```
type: string - "accident" | "fire" | "medical" | "injury" | "other"
description: string - Description of the emergency
location: string - Location of the emergency
phone: string - Contact phone number
media: File - Photo or video file
```

**Response:**
```json
{
  "success": true,
  "id": "ER-1712345678-ABC123XYZ",
  "message": "Emergency report submitted. Dispatching services..."
}
```

## Backend Integration

The frontend is ready to integrate with your backend services:

1. **Media Storage**: Upload captured media to cloud storage (S3, Vercel Blob, etc.)
2. **AI Analysis**: Send media to your AI service for emergency classification
3. **Emergency Dispatch**: Notify police, fire, and ambulance services
4. **Database**: Store reports in your database for tracking and history

Update `/app/api/emergency-report/route.ts` with your actual backend calls.

## Environment Variables

Create a `.env.local` file:

```env
# Backend API endpoints
NEXT_PUBLIC_API_URL=http://localhost:3001

# Media storage (if applicable)
NEXT_PUBLIC_STORAGE_URL=https://your-storage.example.com

# Analytics (optional)
NEXT_PUBLIC_GA_ID=UA-XXXXXXXXX-X
```

## Design System

The app uses a custom design token system with dark theme:

- **Primary**: Blue (0.68, 0.2, 30) - Emergency services/trust
- **Accent**: Orange (0.68, 0.2, 30) - Urgency/action
- **Background**: Dark navy (0.12, 0.01, 280)
- **Foreground**: Light gray (0.95, 0.01, 70)

Edit `app/globals.css` to customize colors and tokens.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Chrome Mobile 90+

## Performance

- Server-side rendering with Next.js 16
- Optimized bundle size
- Real-time camera access
- Instant media capture and submission

## Security

- CSRF protection via Next.js
- File type and size validation
- Phone number validation
- FormData for secure file uploads

## Contributing

Follow these patterns when adding features:

1. Create components in `components/`
2. Use design tokens from `globals.css`
3. Keep forms in `components/` with proper validation
4. Update `page.tsx` state management as needed

## License

Proprietary - RapidRelief Emergency Services
