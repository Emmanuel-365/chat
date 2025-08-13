# Project Overview

This is a Next.js project bootstrapped with `create-next-app`. It is a secure messaging platform for a school, called "EcoleChat".

## Main Technologies

*   **Framework:** [Next.js](https://nextjs.org/) 15
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Backend:** [Firebase](https://firebase.google.com/) (Authentication, Firestore, Storage)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
*   **Icons:** [Lucide React](https://lucide.dev/guide/packages/lucide-react)
*   **Linting:** [ESLint](https://eslint.org/)

## Architecture

The project follows the standard Next.js App Router structure.

*   `app/`: Contains the pages of the application.
    *   `app/api/`: Contains the API routes.
    *   `app/dashboard/`: Contains the main dashboard for authenticated users.
    *   `app/admin/`: Contains the admin dashboard.
*   `components/`: Contains the React components.
    *   `components/ui/`: Contains the shadcn/ui components.
    *   `components/auth/`: Contains authentication-related components.
    *   `components/dashboard/`: Contains components for the main dashboard.
    *   `components/admin/`: Contains components for the admin dashboard.
*   `lib/`: Contains the core logic of the application.
    *   `lib/firebase.ts`: Initializes Firebase.
    *   `lib/auth.ts`: Contains authentication-related functions.
    *   `lib/messages.ts`: Contains functions for sending and receiving messages.
*   `hooks/`: Contains custom React hooks.
*   `types/`: Contains TypeScript type definitions.

# Building and Running

## Prerequisites

*   [Node.js](https://nodejs.org/) (version 20 or higher)
*   [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), [pnpm](https://pnpm.io/), or [bun](https://bun.sh/)

## Installation

```bash
npm install
```

## Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building for Production

```bash
npm run build
```

## Starting the Production Server

```bash
npm run start
```

## Linting

```bash
npm run lint
```

# Development Conventions

*   **Coding Style:** The project uses the Next.js ESLint configuration for code style.
*   **Testing:** There are no testing practices defined in the project yet.
*   **Contribution:** There are no contribution guidelines defined in the project yet.
