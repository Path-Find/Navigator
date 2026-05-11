import { CONTENT_VALIDATION } from '../constants';

export const JOB_ANALYSIS_PROMPTS = {
  JOB_FIT_ANALYSIS: {
    DEFAULT: (jobDescription: string, resumeContext: string, bucketAdvice?: string[], trajectoryContext?: string) => `
    You are a Strategic Career Architect and Hiring Expert. Your job is to analyze this candidate's fit for the role with absolute professional objectivity.
    
    ${bucketAdvice ? `ROLE-SPECIFIC FOCUS (Follow these guidelines):
    ${bucketAdvice.map(a => `- ${a}`).join('\n')}
    ` : ''}

    ${trajectoryContext ? `SEMANTIC TRAJECTORY (The user's career path):
    ${trajectoryContext}
    ` : ''}

    INPUT DATA:
    1. RAW JOB TEXT: 
    "${jobDescription.substring(0, CONTENT_VALIDATION.MAX_JOB_DESCRIPTION_LENGTH)}"

    2. CANDIDATE CONTEXT (Resume, Skills, & Academics):
    ${resumeContext}

    TASK:
    1. DISTILL: Extract the job requirements into a structured format.
    2. DOMAIN-AWARE ANALYSIS: 
       - If this is a Licensed/Regulated role (Healthcare, Legal, Trades), prioritize Certifications and Compliance.
       - If this is a Technical role (Software, Engineering), prioritize Hard Skill Stacks and Project Complexity.
       - If this is a Creative role (Design, Marketing), prioritize Portfolio Impact and Tool Mastery.
       - If this is an Entry-Level or Academic role, leverage the Transcript/Academic Background to substitute for missing work experience.
    3. GROUNDING RULE: Only credit the candidate for skills and experience explicitly present in the provided Candidate Context. Do NOT hallucinate levels of seniority.
    4. MATCH BREAKDOWN: Identify key strengths and HONEST gaps.
    5. SCORE: Rate compatibility (0-100) based on hard evidence.

    OUTPUT SCHEMA:
    Return ONLY valid JSON matching this structure.
    CRITICAL: You MUST populate 'keySkills' and 'coreResponsibilities' even for brief job descriptions. Use your expertise to infer them if not explicitly stated.
    {
      "compatibilityScore": number (0-100),
      "reasoning": "Ultra-concise professional insight (max 1 sentence).",
      "strengths": ["3 specific match points"],
      "weaknesses": ["3 specific gaps or missing qualifications"],
      "distilledJob": {
        "roleTitle": "Official title",
        "companyName": "Company name",
        "location": "City, State or Remote (Strictly geographical, exclude internal IDs)",
        "referenceCode": "Job ID or reference number (if found, otherwise null)",
        "category": "technical" | "managerial" | "trades" | "healthcare" | "creative" | "general",
        "canonicalTitle": "The most standard, high-level name for this role",
        "isAiBanned": boolean,
        "aiBanReason": "If banned, quote the prohibition policy, otherwise null",
        "keySkills": ["List of 5-8 priority skills found in the job post"],
        "requiredSkills": [
          { "name": "Skill Name", "level": "learning" | "comfortable" | "expert" }
        ],
        "coreResponsibilities": ["List of 4-6 primary duties"],
        "applicationDeadline": "Application closing date in YYYY-MM-DD format if stated, otherwise null",
        "salaryRange": "Salary or wage range as stated (e.g. '$55,000–$65,000/yr' or '$22–$28/hr'), otherwise null"
      },
      "resumeTailoringInstructions": ["3 extremely concise, 1-sentence bullet points on how to adjust the resume"],
      "coverLetterTailoringInstructions": ["3 extremely concise, 1-sentence bullet points for the cover letter strategy"],
      "recommendedBlockIds": ["List of IDs from the candidate resume blocks that are most relevant to this job"],
      "internalAnalysis": "DEDICATED SCRATCHPAD: Record your logical checks, self-reminders (e.g. 'check date logic', 'missing Pro experience'), and meta-commentary here. Do NOT leak these into user-facing fields."
    }

    TONE & STYLE RULES:
    1. EXCLUSIVITY: All 'thinking', 'checks', or shouting (ALL CAPS) must happen ONLY in 'internalAnalysis'.
    2. USER-FACING: 'reasoning', 'strengths', and 'weaknesses' must be professional, supportive, and in Sentence Case.
    3. NO META: Do not say 'I think', 'I will', or 'Based on my analysis' in user-facing fields. Just provide the insight.
    4. ACTIONABLE: Frame 'weaknesses' as gaps that can be addressed, not as static failures.
  `
  },

  TAILOR_EXPERIENCE_BLOCK: (jobDescription: string, blockTitle: string, blockOrg: string, blockBullets: string[], instructions: string[]) => `
    You are an expert resume writer. 
    Rewrite the bullet points for this specific job experience to perfectly match the target job description.

    TARGET JOB:
    ${jobDescription.substring(0, 3000)}

    MY EXPERIENCE BLOCK:
    Title: ${blockTitle}
    Company: ${blockOrg}
    Original Bullets:
    ${blockBullets.map(b => `- ${b}`).join('\n')}

    TAILORING INSTRUCTIONS (Strategy):
    ${instructions.join('\n')}

    TASKS:
    1. Rewrite the bullets to use keywords from the Target Job.
    2. Shift the focus to relevant skills (e.g. if job needs "Leadership", emphasize leading the team).
    3. Quantify impact where possible.
    4. Keep the same number of bullets (or fewer if some are irrelevant).
    5. Tone: Action-oriented, professional, high-impact.
    
    Return ONLY a JSON array of strings: ["bullet 1", "bullet 2"]
    `,

  TAILORED_SUMMARY: (jobDescription: string, resumeContext: string) => `
    You are an expert resume writer. 
    Write a 2-3 sentence "Professional Summary" for the top of my resume.
    
    TARGET JOB:
    ${jobDescription.substring(0, 5000)}

    MY BACKGROUND:
    ${resumeContext}

    INSTRUCTIONS:
    - Pitch me as the perfect candidate for THIS specific role.
    - Use keywords from the job description.
    - Keep it concise, punchy, and confident (no "I believe", just facts).
    - **CRITICAL**: Do NOT return "N/A" or empty text. If the resume is weak, spin it as a "Aspiring [Role Name]" or "motivated professional".
    - Return a JSON object: { "summary": "Text..." }
    `,
};
