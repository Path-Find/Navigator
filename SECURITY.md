# Security

Navigator is built with privacy and security as its foundation.

- **Authentication & Authorization**: A multi-tier model using Supabase Auth with secure login methods and email verification.
- **Data Ownership**: Row Level Security (RLS) ensures users only access their own resumes and analysis history.
- **AI Privacy**: Navigator uses Gemini to analyze resumes and job descriptions.
    - **Privacy Commitment**: Covered by [Google's Enterprise Privacy protections](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/privacy).
    - **No Training**: Your resumes, job descriptions, and chats are never used to train global AI models.
    - **Isolation**: Data is processed in isolated sessions and is not shared with other users.
- **Secure Integration**: Operations like job scraping are handled in isolated server-side environments (Supabase Edge Functions).
- **Abuse Prevention**: Implements device fingerprinting and email normalization to protect platform integrity.

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it via the **[GitHub Private Vulnerability Reporting](https://github.com/ryanphanna/Navigator/security/advisories/new)** tool. Private reports allow for a secure disclosure process before a formal patch is released.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Resolution**: Depends on severity and complexity
