# Vercel Deployment Guide

This guide explains how to deploy the **Vertex Loans** applications to Vercel. Because the repository contains two separate applications (`vertexloans` main site and `admin-portal`), we will deploy them as **two separate Vercel projects** connected to the same GitHub repository.

## Prerequisites

1.  **GitHub Repository**: Ensure your project is pushed to GitHub.
2.  **Vercel Account**: Log in to [Vercel](https://vercel.com).

---

## 🚀 Deployment 1: Main Website (Vertex Loans)

This maps to the root directory of your repository.

1.  **Add New Project**:
    - Go to your Vercel Dashboard.
    - Click **"Add New..."** > **"Project"**.
    - Import your `vertexvertex` repository (or whatever you named it).

2.  **Configure Project**:
    - **Project Name**: `vertex-loans` (or your preference).
    - **Framework Preset**: `Vite` (should be auto-detected).
    - **Root Directory**: `./` (leave as default).

3.  **Build Settings** (verify these defaults):
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
    - **Install Command**: `npm install`

4.  **Environment Variables**:
    - Expand "Environment Variables".
    - Add any variables from your root `.env` file if you have them (e.g., API keys).
    - *Note: `VITE_API_URL` is configured in code to default to prod, but you can override it here if needed.*

5.  **Deploy**:
    - Click **Deploy**.
    - Vercel will build and deploy the main site.

---

## 🛡️ Deployment 2: Admin Portal

This maps to the `admin-portal` subdirectory.

1.  **Add New Project**:
    - Go to your Vercel Dashboard.
    - Click **"Add New..."** > **"Project"**.
    - Import the **SAME** repository again.

2.  **Configure Project**:
    - **Project Name**: `vertex-admin` (or your preference).
    - **Framework Preset**: `Vite` (should be auto-detected).
    
    > **IMPORTANT**:
    > **Root Directory**: Click "Edit" and select `admin-portal`.

3.  **Build Settings** (verify these defaults):
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
    - **Install Command**: `npm install`

4.  **Environment Variables**:
    - Expand "Environment Variables".
    - Add the API URL:
        - **Key**: `VITE_API_URL`
        - **Value**: `https://vertexloans.onrender.com/api` (or your backend URL).

5.  **Deploy**:
    - Click **Deploy**.
    - Vercel will build and deploy the admin portal.

---

## 🌐 Custom Domains Configuration

To set up `admin.vertexloans.com`:

1.  **Main Domain (`vertexloans.com`)**:
    - Go to your **Main Website** project settings in Vercel.
    - Navigate to **Settings** > **Domains**.
    - Add `vertexloans.com`. Vercel will provide DNS records (usually an A record or CNAME) to add to your domain registrar (e.g., GoDaddy, Namecheap).

2.  **Subdomain (`admin.vertexloans.com`)**:
    - Go to your **Admin Portal** project settings in Vercel.
    - Navigate to **Settings** > **Domains**.
    - Add `admin.vertexloans.com`.
    - **DNS Configuration**:
        - **Note**: You do **NOT** need to buy `admin.vertexloans.com`. It is a free subdomain of `vertexloans.com`.
        - Since `vertexloans.com` is already verified on Vercel (from step 1), Vercel might automatically configure it if you are using Vercel Nameservers.
        - If managing DNS externally (e.g., GoDaddy), add a **CNAME** record for `admin` pointing to `cname.vercel-dns.com`.

---

## Troubleshooting

- **404 on Refresh**: If you get 404 errors when refreshing pages, ensure your Framework Preset is set to **Vite** or **Create React App**, which handles Single Page Application (SPA) routing automatically.
- **Build Errors**: Check the Vercel logs. Ensure the `npm install` step is running correctly and installing dependencies for the specific sub-project.
