# Order Tracking Application

A modern order tracking application built with React, Vite, and various modern web technologies.

## Features

- Admin dashboard for managing orders
- Real-time order status display
- Modern UI with Tailwind CSS and shadcn/ui
- Form validation with Zod
- State management with TanStack Query
- Type-safe development with TypeScript

## Technologies Used

- React + Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zod
- React Router
- Heroicons

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory and add:
   ```
   VITE_API_URL=your_api_url_here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Pages

- `/admin` - Admin dashboard for managing orders
- `/` - Public display page showing order status

## API Integration

The application expects the following API endpoints:

- `GET /orders` - Fetch all orders
- `POST /orders` - Create a new order
- `PATCH /orders/:id` - Update order status

## License

MIT
