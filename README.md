# Job Application Tracker

A full-stack web application to track job applications, managing statuses, dates, and allowing resume uploads.

## Features
- **Dashboard**: Track all job applications in a premium, glassmorphism-styled grid.
- **Manage Applications**: Create, Read, Update, and Delete (CRUD) job entries.
- **Resume Storage**: Upload resumes (PDF/Word) which are securely stored in the PostgreSQL database.
- **Premium UI**: Responsive design with dark mode, animations, and gradients using modern CSS.

## Tech Stack
- **Frontend**: React, Vite, CSS (Modules/Variables)
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Neon.tech)
- **File Storage**: Base64 encoded storage in PostgreSQL (Direct DB storage)

## Getting Started

### Prerequisites
- Node.js installed
- PostgreSQL Database (e.g., local or Neon.tech)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd job-application-tracker
    ```

2.  **Install Backend Dependencies**
    ```bash
    cd server
    npm install
    ```

3.  **Install Frontend Dependencies**
    ```bash
    cd ../client
    npm install
    ```

4.  **Environment Setup**
    Create a `.env` file in the `server` directory:
    ```env
    PORT=3000
    DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
    ```

    Create a `.env` file in the `client` directory:
    ```env
    VITE_API_URL=http://localhost:3000/api
    ```

5.  **Run Locally**
    Start the Backend:
    ```bash
    # In /server terminal
    npm start
    ```

    Start the Frontend:
    ```bash
    # In /client terminal
    npm run dev
    ```

    Visit `http://localhost:5173` in your browser.

## Deployment (Render.com)

### Backend (Web Service)
1.  Connect your repo to Render.
2.  **Runtime**: Node
3.  **Build Command**: `npm install`
4.  **Start Command**: `npm start`
5.  **Root Directory**: `server`
6.  **Env Variables**: Add `DATABASE_URL`.

### Frontend (Static Site)
1.  Connect your repo to Render.
2.  **Build Command**: `npm install; npm run build`
3.  **Publish Directory**: `dist`
4.  **Root Directory**: `client`
5.  **Env Variables**: Add `VITE_API_URL` pointing to your Backend URL (e.g., `https://my-api.onrender.com/api`).

## License
MIT
