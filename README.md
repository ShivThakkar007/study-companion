
# Study Companion

A personal study companion designed to help students improve concentration, build consistent study habits, track learning progress, and stay accountable.

## Overview

Study Companion aims to provide an integrated environment for focused learning and academic productivity.

### Planned Features

- **Focus Studio:** Manual and smart focus sessions.
- **Subject Management:** Organize subjects, topics, and learning objectives.
- **Performance Center:** Track study sessions, focus patterns, and progress.
- **Virtual Study Rooms:** Study alongside friends in synchronized sessions.
- **Learning Community:** Share achievements, notes, and learning resources.
- **Mental Reset:** Relaxation activities and interactive experiences.
- **Study Companion Character:** Contextual encouragement and feedback.

## Technology Stack

| Category | Technology |
|---|---|
| Frontend | React + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Server State | TanStack Query |
| Client State | Zustand |
| Backend | Supabase |
| Database | PostgreSQL |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Animations | Motion |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js
- npm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/ShivThakkar007/study-companion.git
cd study-companion
```

Install dependencies:

```bash
npm install
```

### Environment Configuration

Create a `.env` file in the project root.

Use `.env.example` as a reference:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Never commit your actual `.env` file or expose Supabase secret/service-role keys.

### Run Development Server

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Code Quality

```bash
npm run lint
npm run format
npm run format:check
```

## Project Structure

```text
src/
├── app/
│   ├── providers/
│   └── router/
├── components/
│   └── ui/
├── features/
├── hooks/
├── lib/
├── types/
├── utils/
├── assets/
├── App.tsx
├── index.css
└── main.tsx
```

## Development Status

The project is currently in its initial infrastructure and setup phase.

Features will be implemented incrementally through development sprints.

## License

Not yet licensed.
