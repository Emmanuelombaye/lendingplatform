# Vertex Loans Backend

Authentication and Loan Management System API.

## Setup

1.  **Install Dependencies**
    ```bash
    cd backend
    npm install
    ```

2.  **Environment Variables**
    - Rename `.env.example` to `.env` (or use the provided `.env`).
    - Fill in `DATABASE_URL` with your Railway MySQL connection string:
      `mysql://USER:PASSWORD@HOST:PORT/DATABASE`
    - Fill in other secrets.

3.  **Database Migration**
    Run this command to create tables in your MySQL database:
    ```bash
    npx prisma migrate dev --name init
    ```
    *This will also generate the Prisma Client.*

4.  **Start Server**
    - Development:
      ```bash
      npm run dev
      ```
    - Production:
      ```bash
      npm run build
      npm start
      ```

## API Endpoints

-   **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/profile`
-   **Applications**:
    -   POST `/api/applications/create`
    -   GET `/api/applications/my`
-   **Documents**:
    -   POST `/api/documents/upload` (Form-data: `document`, `applicationId`, `documentType`)
-   **Admin**:
    -   GET `/api/admin/applications`
    -   PUT `/api/admin/applications/:id/status`
    -   POST `/api/admin/confirm-fee/:applicationId`
    -   GET `/api/admin/loans`

## Troubleshooting

-   If `npx prisma generate` fails, ensure `DATABASE_URL` is set correctly in `.env`.
