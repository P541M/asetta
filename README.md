# Asetta - Student Assessment Management Platform

Asetta is a comprehensive web application designed to help students manage their academic assessments, track deadlines, and stay organized throughout their academic journey.

## Features

### Assessment Management

- **Add Assessments**: Manually add assessments or upload course outlines for automatic extraction
- **Status Tracking**: Track assessment progress with statuses (Not Started, In Progress, Submitted, Missed)
- **Due Date Management**: Visual indicators for upcoming deadlines with color-coded urgency
- **Grade Tracking**: Record and track assessment grades with weight-based calculations
- **Rich Text Notes**: Add detailed notes with rich text formatting for each assessment

### Organization & Filtering

- **Semester Management**: Organize assessments by academic semesters
- **Course Filtering**: Filter assessments by specific courses
- **Status Filtering**: Filter by submission status (All Tasks, Not Submitted, Submitted)
- **Bulk Operations**: Update multiple assessments at once or perform bulk deletions

### User Experience

- **Dark Mode**: Full dark theme support with system preference detection
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Updates**: Instant synchronization across sessions
- **Calendar Integration**: Export assessments to calendar applications via ICS files

### AI Extraction

- **PDF Upload**: Upload course syllabi and outlines for automatic assessment extraction
- **Smart Parsing**: AI-powered extraction of assessment details from uploaded documents

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **File Storage**: Firebase Storage
- **Rich Text Editor**: Tiptap with custom extensions
- **Email**: Nodemailer for notifications
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project with Firestore and Auth enabled

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/asetta.git
cd asetta
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Usage

1. **Sign Up/Login**: Create an account or sign in with existing credentials
2. **Create Semester**: Set up your current academic semester
3. **Add Assessments**: Either manually add assessments or upload course outlines
4. **Track Progress**: Update assessment statuses as you work on them
5. **Monitor Deadlines**: Use the calendar view and notifications to stay on track
6. **Export Data**: Export your assessments to calendar applications

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact [your-email@example.com](mailto:your-email@example.com).

## Roadmap

- [ ] Mobile app development
- [ ] Integration with learning management systems
- [ ] Study session tracking
- [ ] Grade prediction algorithms
- [ ] Team collaboration features
