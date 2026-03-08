# Security Model

This document outlines the security architecture and data protections for Navigator.

## Authentication & Authorization

Navigator uses a multi-tier security model to protect user data and ensure authorized access.

### 1. Account Security
Access to the application is managed via Supabase Auth. We support secure login methods and enforce email verification to prevent account takeover and ensure high-quality usage.

### 2. Role-Based Access Control (RBAC)
Permissions are enforced at the database level via Supabase profiles:
- **Free Users**: Access to foundational analysis and resume management.
- **Plus/Pro Users**: High-volume analysis, strategic career coaching, and priority support.
- **Admins**: Access to system health metrics and platform management.

### 3. Abuse Prevention
To maintain the quality of our free tier and prevent automated abuse, we implement several layers of defense:
- **Device Fingerprinting**: We use browser fingerprinting to detect and block multi-account abuse on the same device.
- **Email Normalization**: We programmatically handle Gmail/Outlook alias abuse (e.g., `user+1@gmail.com` -> `user@gmail.com`) to ensure fair distribution of free credits.

## Data Protections

### AI Privacy (Enterprise-Grade)
Navigator uses the paid Enterprise tier of Google's Gemini API. 
- **No Training**: Under our enterprise agreement, your resumes, job descriptions, and chats are **never** used to train Google's foundational models.
- **Isolation**: Your data is processed in isolated sessions and is not shared with other users.

### Database Security (Supabase RLS)
Security is enforced at the database level using Row Level Security (RLS) policies:
- **Data Isolation**: Users can only read and write their own profile data, resumes, and analysis history.
- **Encrypted Sync**: Sensitive profile data is encrypted at rest using industry-standard AES-256.
- **Secure Edge Functions**: Operations like job scraping and payment processing are handled in isolated server-side environments (Supabase Edge Functions).

## Reporting a Vulnerability

If you discover a security vulnerability in this project, **please do not open a public GitHub Issue**, as this exposes the vulnerability before it can be patched.

Instead, please use one of the following private disclosure channels:

- **GitHub Private Security Advisory**: [Report a vulnerability](https://github.com/ryanphanna/Navigator/security/advisories/new) (preferred)
- **Direct contact**: Reach out to the maintainer privately via GitHub.

We will acknowledge your report within 48 hours and aim to release a fix within 14 days for critical issues. Data privacy and security are our top priorities.

