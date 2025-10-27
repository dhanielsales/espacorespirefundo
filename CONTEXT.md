### Project Overview

You are an expert full-stack developer. Your task is to help me build a simple student registration system for a small educational institution. The system should allow administrators to manage student information, including personal details, course enrollment, and payment status.

### Tech Stack

**Frontend:**

- **Framework:** React with TypeScript
- **Routing:** TanStack Router (`@tanstack/react-router`)
- **Data Fetching/State Management:** TanStack Query (`@tanstack/react-query`)
- **Forms:** TanStack Form (`@tanstack/react-form`)
- **Global State:** Zustand
- **UI Components:** Radix UI
- **Styling:** Tailwind CSS

**Backend:**

- **Hosting:** Vercel
- **Serverless Functions:** Vercel Functions
- **Database:** PostgreSQL on Neon (or local Docker)
- **ORM:** Drizzle ORM
- **Schema Validation:** Zod
- **API Framework:** Fastify

### Initial Tasks

1. **Project Scaffolding:**

- Initialize a React project using Vite and the TypeScript template.
- Set up the basic configuration for Vercel, including a `vercel.json` file.

1. **Database Schema:**

- Define the initial database schema using Drizzle ORM. Start with a `students` table and a `courses` table.
- The `students` table should include fields like `id`, `firstName`, `lastName`, `email`, `dateOfBirth`, and `createdAt`.
- The `courses` table should include fields like `id`, `name`, `description`, and `credits`.
- Define a join table for `students_to_courses` to manage enrollments.

1. **Backend API (Vercel Functions):**

- Create the first Vercel Function to handle a basic API endpoint.
- Set up a Fastify server instance within a Vercel Function to handle routing.
- Create CRUD endpoints for managing students. Use Zod for input validation.
- `/api/students` (GET, POST)
- `/api/students/:id` (GET, PUT, DELETE)

1. **Frontend Development:**

- Set up the basic routing structure using TanStack Router. Create routes for a student list page and a student detail page.
- Create a basic layout component.
- Use TanStack Query to fetch the list of students from the backend.
- Create a form using TanStack Form for adding a new student.
- Use Zustand to manage any global UI state, such as loading indicators or notifications.
- Style the components using Tailwind CSS and Radix UI primitives for accessibility.
