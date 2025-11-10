# AppChahiye: Smart Web Apps for Smarter Businesses

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/appchahiye/appchahiye-smart-web-apps-for-smarter-businesses)

AppChahiye is a comprehensive web ecosystem designed to streamline the process of building and managing custom web applications for businesses. The platform consists of three core components: a stunning, conversion-focused public website to attract clients; a powerful, internal admin dashboard for managing projects and content; and a secure, personalized client portal for each customer to track progress, collaborate, and handle invoices.

The entire system is built on a modern, serverless architecture using Cloudflare Workers and Durable Objects, ensuring high performance, security, and scalability.

## Key Features

- **Public-Facing Website:** A high-conversion, single-page marketing site to attract and onboard new clients.
- **Admin Dashboard:** An internal control panel for managing website content, client leads, projects, invoices, and real-time communication.
- **Client Portal:** A private, auto-generated dashboard for each client to track project progress, communicate with the team, and manage files and invoices.
- **Real-Time Sync:** Seamless data synchronization between the admin and client portals.
- **Modern Tech Stack:** Built on a high-performance, serverless architecture using Cloudflare Workers and Durable Objects.

## Technology Stack

- **Frontend:** React, React Router, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Zustand
- **Backend:** Hono on Cloudflare Workers
- **Database:** Cloudflare Durable Objects for stateful, consistent storage
- **Language:** TypeScript
- **Deployment:** Cloudflare

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.
- A [Cloudflare account](https://dash.cloudflare.com/sign-up).
- The [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) authenticated with your Cloudflare account.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd appchahiye_web_ecosystem
    ```

2.  **Install dependencies:**
    This project uses Bun as the package manager.
    ```sh
    bun install
    ```

## Development

To start the local development server, which includes both the Vite frontend and the Hono backend on a local Cloudflare Worker, run:

```sh
bun dev
```

This will start the application, typically available at `http://localhost:3000`. The frontend will hot-reload on changes, and the worker will restart automatically.

### Project Structure

The project is organized into three main directories:

-   `src/`: Contains the React frontend application, including pages, components, hooks, and styles.
-   `worker/`: Contains the Hono backend application that runs on Cloudflare Workers. This is where API routes and business logic reside.
-   `shared/`: Contains TypeScript types and interfaces that are shared between the frontend and the backend to ensure type safety.

## Deployment

This project is designed for seamless deployment to the Cloudflare ecosystem.

1.  **Build the application:**
    First, build the frontend assets for production.
    ```sh
    bun build
    ```

2.  **Deploy to Cloudflare:**
    Use the Wrangler CLI to deploy the application. This command will build the worker and deploy it along with the static frontend assets.
    ```sh
    bun deploy
    ```

Alternatively, you can deploy directly from your GitHub repository using the button below.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/appchahiye/appchahiye-smart-web-apps-for-smarter-businesses)