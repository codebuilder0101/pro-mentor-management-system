# LeanMentor - Mentorship Platform MVP

A professional mentorship platform focused on Lean methodology, process management, and people management.

## Tech Stack

- **Frontend**: React 18 + Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **UI Components**: Custom reusable components

## Features

### Pages

1. **Home** (`/`)
   - Hero section with value proposition
   - Benefits overview
   - Target audience sections
   - Core topics (Lean, Process Improvement, People Management)
   - Call-to-action sections

2. **Free Content** (`/free-content`)
   - Filterable content library (videos, ebooks, guides)
   - Category-based organization
   - Mock educational resources
   - Access tracking (UI only)

3. **Schedule Session** (`/schedule-session`)
   - Contact form with validation
   - Date and time selection
   - Success confirmation message
   - Form data logging (console only in MVP)

4. **Mentorship Program** (`/mentorship-program`)
   - Program details and structure
   - Pricing tiers (3-month and 6-month)
   - FAQ section
   - CTA for enrollment

5. **Admin Dashboard** (`/admin`)
   - Overview statistics
   - Content management table
   - Session requests management
   - Mock data for demonstration

### Components

- **Navigation**: Responsive navbar with mobile menu
- **Footer**: Site-wide footer with links
- **Button**: Reusable button component with variants
- **Card**: Flexible card component for content layout

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd mentorship-platform
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
mentorship-platform/
├── app/
│   ├── admin/              # Admin dashboard
│   ├── free-content/       # Free content library
│   ├── mentorship-program/ # Program details
│   ├── schedule-session/   # Session scheduling
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── layout/
│   │   ├── Navigation.tsx  # Header navigation
│   │   └── Footer.tsx      # Footer
│   └── ui/
│       ├── Button.tsx      # Button component
│       └── Card.tsx        # Card component
└── public/                 # Static assets
```

## MVP Limitations

This is a first MVP version with the following intentional limitations:

- **No Backend**: All forms log to console, no actual data storage
- **No Authentication**: Admin page is publicly accessible
- **No Payment Gateway**: Program enrollment is UI only
- **Mock Data**: Content and sessions use static mock data
- **No Student Dashboard**: Only admin interface included

## Future Enhancements (Phase 2+)

- Backend integration with Node.js/Express
- Database (PostgreSQL or MongoDB)
- User authentication system
- Real calendar integration for scheduling
- Payment gateway (Stripe/PayPal)
- Student dashboard and progress tracking
- Email notifications
- Content upload and management system
- Video hosting integration
- Analytics and reporting

## Design Philosophy

- Clean, modern, professional aesthetic
- Mobile-first responsive design
- Accessibility considerations
- Fast loading and performance
- Simple, intuitive navigation
- Trust-building elements throughout

## Color Palette

- Primary Blue: `#2563EB` (blue-600)
- Secondary Green: `#16A34A` (green-600)
- Accent Purple: `#9333EA` (purple-600)
- Background: `#F9FAFB` (gray-50)
- Text: `#111827` (gray-900)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This is an MVP project. All rights reserved.

## Contact

For questions or support, visit the platform or contact through the scheduling form.
