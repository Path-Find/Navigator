# Security

Navigator is built with privacy and security as its foundation.

- **Authentication & Authorization**: A multi-tier model using Supabase Auth with secure login methods and email verification.
- **Data Ownership**: Row Level Security (RLS) ensures users only access their own resumes and analysis history.
- **AI Privacy**: Navigator uses Gemini to analyze resumes and job descriptions.
    - **No Training**: Your resumes, job descriptions, and chats are not used to train Google's global AI models under the API terms we use.
    - **Quality and abuse monitoring**: Google AI Studio's GenerateContent API logging is currently enabled for active product testing. Prompts and responses may be retained by Google for up to 55 days for debugging, quality review, and abuse investigation.
    - **Isolation**: Data is processed for the requesting account and is not shared with other Navigator users.
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
