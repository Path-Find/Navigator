

export const PARSING_PROMPTS = {
  RESUME_PARSE: (extractedText: string | null = null) => `
    Analyze this resume content. 
    Break it down into discrete "Experience Blocks". 
    For each job, education, or project, create a block.

    CRITICAL SAFETY CHECK:
    If this document is NOT a resume/CV (e.g. it is a receipt, a random photo, spam, hate speech, or offensive content), 
    return a single block with type="other", title="INVALID_DOCUMENT", and put the reason in the bullets.
    
    Return a JSON Array of objects with this schema:
    {
      "type": "summary" | "work" | "education" | "project" | "skill" | "other",
      "title": "Job Title or Degree",
      "organization": "Company or School Name",
      "dateRange": "e.g. 2020-2022",
      "bullets": ["bullet point 1", "bullet point 2"]
    }
  ${extractedText ? `\nRESUME CONTENT:\n${extractedText}` : ''}`,

  JOB_LISTING_PARSE: (cleanHtml: string, baseUrl: string) => `
    You are a smart scraper. Extract job listings from this HTML. 
    
    CRITICAL INSTRUCTIONS:
    1. Look for lists of jobs, tables, or repeated "card" elements.
    2. Identify the structure of the specific jobs site (e.g. search results table, grid labels).
    3. Tables often have "Job Title", "Date", "Location" columns.
    4. If you see a "Search Jobs" button but NO results, return an empty array (do not hallucinate).
    5. Extract the REAL link (href). Resolving relative URLs against "${baseUrl}".
    
    Return ONLY a JSON array. No markdown.
    
    Schema:
    [
      {
        "title": "string (The clear job title)",
        "url": "string (The absolute URL to the specific job details)",
        "company": "string (Name of the employer)",
        "location": "string (City, Prov/State)",
        "postedDate": "string (ISO date or 'Recently')"
      }
    ]

    HTML Content:
    ${cleanHtml}
  `,

  ROLE_MODEL_METADATA: () => `
    You are a Career Path Analyst. Analyze this LinkedIn profile (or resume) of a "Role Model".
    Extract their core career progression, top skills, and industry patterns.

    TASK:
    1. EXTRACT: 
       - Name (if visible)
       - Headline (e.g. "Staff Engineer at Google")
       - Organization (Most recent company)
       - Skills (Top 10 most relevant skills mentioned)
       - Career Snapshot (Briefly summarize their "climb" - e.g. "Started in QA, transitioned to Dev, then Management")
    
    Return JSON:
    {
      "name": "string",
      "headline": "string",
      "organization": "string",
      "topSkills": ["string"],
      "careerSnapshot": "string",
      "rawTextSummary": "string (A clean, slightly condensed version of their experience)"
    }
  `,

  ROLE_MODEL_EXPERIENCE: () => `
    Analyze this LinkedIn profile or resume. 
    Break it down into discrete "Experience Blocks" representing their chronological career path.
    For each job or education entry, create a block.
    
    Return a JSON Array of objects with this schema:
    {
      "type": "work" | "education" | "project",
      "title": "Job Title or Degree",
      "organization": "Company or School Name",
      "dateRange": "e.g. 2020-2022",
      "bullets": ["bullet point 1", "bullet point 2"]
    }
  `,

  TRANSCRIPT_PARSE: (extractedText: string) => `
    You are an Academic Transcript Analyzer. Extract structured data from this transcript text.

    CRITICAL SAFETY:
    If this is NOT a transcript (e.g. receipt, essay, random text), return a JSON object with { "error": "Invalid Document Type" }.

    TASK:
    1. Extract Student Info (Name, University, Program, Credential Type). 
       CRITICAL: Use Title Case for these fields (e.g. "John Smith", "University of Toronto"). Avoid ALL CAPS.
       CRITICAL: Do NOT guess or infer the university or program. If it is not explicitly stated in the document, return null or an empty string. Never default to Stanford or any other institution.
       CRITICAL: Identify the Credential Type (e.g. "Bachelor's Degree", "Master's Degree", "Diploma") if explicitly stated.
    2. Extract Cumulative GPA (CGPA) if explicitly stated.
    3. Group courses by Semester (Term/Year).
       Use full names for terms (e.g. "Fall", "Winter", "Spring", "Summer", "Fall/Winter").
    4. For each course, extract Code, Title, Grade, and Credits.
       Use Title Case for Course Titles (e.g. "Introduction to Computer Science"). Avoid ALL CAPS.

    Return JSON matching this schema:
    {
      "studentName": "string",
      "university": "string",
      "program": "string",
      "credentialType": "string",
      "cgpa": number | null,
      "semesters": [
        {
          "term": "string (e.g. Fall or Fall/Winter)",
          "year": number,
          "courses": [
            {
              "code": "string (e.g. CSC108)",
              "title": "string",
              "grade": "string (e.g. 85 or A)",
              "credits": number
            }
          ]
        }
      ]
    }

    TRANSCRIPT CONTENT:
    ${extractedText}
  `
};
