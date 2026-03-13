export const EDUCATION_PROMPTS = {
    GRAD_SCHOOL_ELIGIBILITY: (transcriptText: string, targetProgram: string) => `
    You are a Graduate Admissions Consultant. Analyze this transcript for eligibility into a specific university program.
    You must be extremely specific to the named institution.

    TRANSCRIPT SUMMARY:
    ${transcriptText}

    TARGET PROGRAM & UNIVERSITY:
    ${targetProgram}

    TASK:
    1. MAPPING: Match the user's transcript courses against the standard requirements for this program.
    2. GPA BENCHMARK: Compare the user's average against the typical competitive intake.
    3. ADMISSION PROBABILITY: Estimate (High, Medium, Low).

    Return JSON:
    {
      "probability": "High" | "Medium" | "Low",
      "analysis": "string (Summary of fit)",
      "gpaVerdict": "string (e.g. 'Strong')",
      "gpaContext": "string (e.g. 'Your 85% is in the top decile for Waterloo Planning')",
      "gpaBenchmark": {
        "userGPA": "string (e.g. '85%')",
        "typicalIntake": "string (e.g. '80-82%')",
        "standing": "Safe" | "Competitive" | "Reach"
      },
      "prerequisites": [
        {
          "requirement": "string (e.g. 'Intro to Stats')",
          "status": "met" | "missing" | "in-progress",
          "mapping": "string (e.g. 'MATH 101 - A+')",
          "description": "string (Briefly explain the requirement)"
        }
      ],
      "weaknesses": ["string"],
      "recommendations": ["string"]
    }
  `,

    COURSE_SKILL_EXTRACTION: (coursesList: string) => `
    You are a Skills Taxonomist. Analyze this list of university courses and extract skills.
    
    CRITICAL: Distinguish between "Hard Skills" (Technical, Tools, Subject Matter) and "Soft Skills" (Transferable, Interpersonal).

    COURSES:
    ${coursesList}

    TASK:
    1. Infer skills based on course titles & level.
    2. Categorize each skill strictly as 'hard' or 'soft'.
    3. Estimate proficiency based on course level.

    Return JSON:
    [
      {
        "name": "string",
        "category": "hard" | "soft",
        "proficiency": "learning" | "comfortable" | "expert",
        "evidence": "string (e.g. 'From CSC207')"
      }
    ]
  `,

    PROGRAM_REQUIREMENTS_ANALYSIS: (transcriptText: string, program: string, university: string) => `
    You are an Academic Advisor. Analyze the user's transcript against standard degree requirements for:
    Program: ${program}
    University: ${university}

    TASK:
    1. Map the user's transcript courses against the requirements for this degree.
    2. Determine if each requirement is 'met', 'missing', or 'in-progress'.
    3. Provide a target credit count for the degree.
    4. Give a general verdict on degree completion progress.
    Return JSON matching this schema:
    {
        "probability": "n/a",
        "analysis": "Brief summary of progress towards this specific degree",
        "gpaVerdict": "How their GPA compares to program honors or standing",
        "gpaContext": "Context on GPA requirements for this major",
        "prerequisites": [
            {
                "requirement": "Requirement Name (e.g. Linear Algebra)",
                "status": "met" | "missing" | "in-progress",
                "mapping": "Matching Course Code from transcript (if met)",
                "description": "Short explanation of the requirement"
            }
        ],
        "weaknesses": ["Specific missing areas"],
        "recommendations": ["Next courses to take or actions to complete"],
        "targetCredits": number (e.g. 120)
    }

    TRANSCRIPT:
    ${transcriptText}
  `,

    COURSE_PROJECT_EXTRACTION: (coursesList: string) => `
    You are a Career Portfolio Specialist. Your task is to look at a student's university courses and propose 2-3 "Portfolio Blocks" or "Projects" that they can highlight on their resume or GitHub.
    
    RATIONALE: We want to turn academic success (an 'A' in a class) into a tangible asset.
    
    COURSES:
    ${coursesList}
    
    TASK:
    1. Identify courses that likely involve significant project work (e.g. "Capstone", "Advanced Design", "Database Systems").
    2. For each identified course, propose a specific, technical project title and description.
    3. The description should be written like a high-impact resume bullet point.
    4. Suggest "Evidence of Mastery" (e.g. "Github Repo", "Technical Report", "Live Demo").
    
    Return JSON:
    [
      {
        "title": "string (e.g. 'Distributed File System')",
        "course": "string (e.g. 'CSC369')",
        "description": "string (A punchy resume-style bullet point)",
        "skills": ["string"],
        "evidence": "string"
      }
    ]
  `,
};
