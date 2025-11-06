# PIYUCLEAN - Classroom Cleaning Management System

A modern, comprehensive classroom cleaning management and monitoring system built with React, TypeScript, and Tailwind CSS.

## Features

### Admin Portal
- **Dashboard**: Overview of cleaning statistics and recent activities
- **Student Management**: Add, edit, and manage student records with BSIT class sections
- **Classroom Management**: Manage physical classrooms and learning spaces
- **Task Management**: Create and organize cleaning tasks and checklists
- **Assignment System**: Assign cleaning duties to students (random or specific)
- **Completion Logs**: Monitor and verify task completion
- **Reports**: Generate cleaning reports and analytics
- **User Management**: Manage admin users and permissions
- **Settings**: System configuration and database backup

### Student Portal
- **Student Dashboard**: View assigned tasks and mark completion
- **Task History**: Review personal cleaning history with filters
- **Modern UI**: Beautiful green-themed interface with glassmorphic effects

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI, Tailwind CSS, Lucide Icons
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Data Persistence**: Local Storage
- **Styling**: Tailwind CSS with custom green theme
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd class-care-pilot
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Default Credentials

### Admin Portal
- **URL**: `/login`
- **Username**: `admin`
- **Password**: `admin123`

### Student Portal
- **URL**: `/student/login`
- **Student ID**: `student`
- **Password**: `student123`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Layout.tsx      # Admin layout
│   ├── StudentLayout.tsx # Student layout
│   └── ProtectedRoute.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
│   ├── storage.ts      # Data persistence
│   └── utils.ts
├── pages/              # Page components
│   ├── Login.tsx       # Admin login
│   ├── StudentLogin.tsx # Student login
│   ├── Dashboard.tsx   # Admin dashboard
│   ├── StudentDashboard.tsx # Student dashboard
│   └── ...             # Other pages
└── main.tsx           # Application entry point
```

## Features Overview

### BSIT Class Sections
The system supports all BSIT class sections:
- **1st Year**: BSIT 1A, BSIT 1B, BSIT 1C, BSIT 1D
- **2nd Year**: BSIT 2A, BSIT 2B, BSIT 2C, BSIT 2D
- **3rd Year**: BSIT 3A AMG, BSIT 3B AMG, BSIT 3C WMAD, BSIT 3D NETAD
- **4th Year**: BSIT 4A AMG, BSIT 4B AMG, BSIT 4C WMAD, BSIT 4D NETAD

### Modern UI Design
- **Green Theme**: Emerald and teal color scheme
- **Glassmorphic Effects**: Modern backdrop blur effects
- **Responsive Design**: Mobile and desktop optimized
- **Smooth Animations**: Hover effects and transitions
- **Accessibility**: WCAG compliant components

### Data Management
- **Local Storage**: All data persisted locally
- **Backup System**: Export/import database functionality
- **Real-time Updates**: Instant UI updates
- **Data Validation**: Form validation and error handling

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Building for Production
```bash
npm run build
```

The built files will be in the `dist` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team.

---

**PIYUCLEAN** - Classroom Cleaning Management & Monitoring System  
© 2025 All Rights Reserved