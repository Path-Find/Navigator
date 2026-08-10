import { CONTENT_VALIDATION } from '../constants';
import { anchorData, anchorGuidance, GUIDANCE_RULE, UNTRUSTED_DATA_RULE } from './anchoring';

export const JOB_ANALYSIS_PROMPTS = {
  JOB_FIT_ANALYSIS: {
    PARSE: (jobDescription: string) => `
    You are a job-posting parser. Extract only facts supported by the supplied job posting.

    ${UNTRUSTED_DATA_RULE}

    JOB POSTING DATA:
    ${anchorData('JOB_POSTING', jobDescription.substring(0, CONTENT_VALIDATION.MAX_JOB_DESCRIPTION_LENGTH))}

    Return ONLY valid JSON matching this structure:
    {
      "roleTitle": "Official title",
      "companyName": "Company name",
      "recipientName": "Clearly named hiring contact or addressee, otherwise null",
      "recipientTitle": "Clearly stated addressee title or hiring group, otherwise null",
      "location": "City, State or Remote, otherwise null",
      "referenceCode": "Job ID or reference number, otherwise null",
      "category": "technical" | "managerial" | "trades" | "healthcare" | "creative" | "general",
      "canonicalTitle": "Most standard high-level name for this role",
      "keySkills": ["5-8 concise skill labels mentioned by the posting; priority comes from requirements"],
      "requiredSkills": [{ "name": "Skill Name", "level": "learning" | "comfortable" | "expert" }],
      "coreResponsibilities": ["4-6 primary duties"],
      "applicationDeadline": "YYYY-MM-DD or null",
      "salaryRange": "Salary or wage range or null",
      "coverLetterHooks": ["1-3 specific employer, team, product, mission, or role challenges worth referencing in a cover letter"],
      "requirements": [
        {
          "text": "Exact concise requirement",
          "category": "skill" | "education" | "coursework" | "experience" | "hard_gate" | "other",
          "priority": "required" | "preferred" | "hard_gate"
        }
      ]
    }

    Rules:
    - Use an empty requirements array when no explicit requirement is present.
    - Add every requirement to exactly one structured entry. Use "hard_gate" only for a mandatory licence, credential, legal eligibility condition, or equivalent non-negotiable gate.
    - Treat keySkills as a compact display/search summary, not a second priority system; put the actual priority in requirements.
    - Mark education, coursework, experience, and skills as "required" only when the posting makes them mandatory. Use "preferred" for assets, nice-to-haves, and explicitly preferred qualifications.
    - Keep the requirement text concise but specific enough to score; do not collapse distinct requirements into one vague sentence.
    - Extract no more than 3 coverLetterHooks. Include only specific details supported by the posting that could make a letter's opening or motivation specific; omit generic statements like "commitment to excellence".
    - Do not turn administrative instructions, application steps, or generic website text into requirements.
    - Extract recipientName only when the posting clearly identifies a person as the hiring contact or addressee. Do not use names of executives, authors, recruiters mentioned incidentally, or names found only in unrelated website text.
    - Extract recipientTitle only when the posting clearly states an addressee such as "Hiring Manager", "Hiring Committee", or a named hiring team. Otherwise use null.
    - Preserve the distinction between mandatory and preferred requirements.
    - Do not infer a requirement that is not present in the posting.
    `,
    SCORE: (parsedJob: string, candidateContext: string, trajectoryContext?: string) => `
    You are a Strategic Career Architect and Hiring Expert. Score the candidate against the already-parsed job requirements with professional objectivity.

    ${UNTRUSTED_DATA_RULE}

    PARSED JOB DATA:
    ${anchorData('PARSED_JOB', parsedJob)}

    CANDIDATE EVIDENCE DATA:
    ${anchorData('CANDIDATE_EVIDENCE', candidateContext)}

    ${trajectoryContext ? `OPTIONAL CAREER CONTEXT:
    ${anchorData('TRAJECTORY_CONTEXT', trajectoryContext)}
    ` : ''}

    Rules:
    - Treat the structured requirements array as the source of truth. Each entry includes its category and priority.
    - A "required" entry affects the fit score; a "preferred" entry is a bonus only; a "hard_gate" entry is non-negotiable.
    - Do not promote a preferred requirement to mandatory, and do not treat a missing preferred item as a weakness unless it is useful context for the user.
    - Only credit skills, education, and experience explicitly present in CANDIDATE EVIDENCE.
    - Do not treat omitted transcript or trajectory data as missing qualifications; it was simply not selected as relevant to this call.
    - Treat "preferred", "asset", and "nice to have" requirements as bonuses, not mandatory gates.
    - Treat "or related program/field/diploma" as allowing genuinely adjacent programs.
    - Treat a mandatory licence, credential, or eligibility condition as a hard gate.

    SCORE CALIBRATION:
    - 0-19: A mandatory credential, licence, or fundamental qualification is missing.
    - 20-39: Several major required gaps remain; transferable strengths do not overcome them.
    - 40-59: Mixed fit with meaningful gaps.
    - 60-79: Most important requirements are directly supported; remaining gaps are manageable.
    - 80-100: Nearly all required qualifications are explicitly supported; do not award 80+ when a material required gap remains.
    - Do not use 50 as a default. Base the score on the most important requirements and hard evidence.

    TASK:
    1. Identify the candidate's strongest matches and honest gaps.
    2. Rate compatibility from 0-100 using the calibration above.
    3. Produce concise, user-facing results in second person.

    Return ONLY valid JSON matching this structure:
    {
      "compatibilityScore": number,
      "reasoning": "Ultra-concise professional insight, maximum 1 sentence",
      "strengths": ["3 specific match points"],
      "weaknesses": ["3 specific gaps or missing qualifications"],
      "resumeTailoringInstructions": ["3 concise instructions"],
      "coverLetterTailoringInstructions": [
        "EVIDENCE_BRIDGE_1: Forward-looking instruction using the strongest relevant resume block",
        "EVIDENCE_BRIDGE_2: Forward-looking instruction using a different relevant resume block",
        "FIT_FRAME: Honest framing instruction for the fit level"
      ],
      "recommendedBlockIds": ["Relevant resume block IDs"],
      "internalAnalysis": "Private scratchpad only; do not put meta-commentary in user-facing fields"
    }
    `,
    DEFAULT: (jobDescription: string, resumeContext: string, bucketAdvice?: string[], trajectoryContext?: string) => `
    You are a Strategic Career Architect and Hiring Expert. Your job is to analyze this candidate's fit for the role with absolute professional objectivity.
    
    ${UNTRUSTED_DATA_RULE}
    ${GUIDANCE_RULE}

    ${bucketAdvice ? `ROLE-SPECIFIC FOCUS GUIDANCE:
    ${anchorGuidance('ROLE_FOCUS', bucketAdvice.map(a => `- ${a}`).join('\n'))}
    ` : ''}

    ${trajectoryContext ? `SEMANTIC TRAJECTORY (The user's career path):
    ${anchorData('TRAJECTORY_CONTEXT', trajectoryContext)}
    ` : ''}

    INPUT DATA:
    1. RAW JOB TEXT: 
    ${anchorData('JOB_POSTING', jobDescription.substring(0, CONTENT_VALIDATION.MAX_JOB_DESCRIPTION_LENGTH))}

    2. CANDIDATE CONTEXT (Resume, Skills, & Academics):
    ${anchorData('CANDIDATE_CONTEXT', resumeContext)}

    TASK:
    1. DISTILL: Extract the job requirements into a structured format.
    2. DOMAIN-AWARE ANALYSIS: 
       - If this is a Licensed/Regulated role (Healthcare, Legal, Trades), prioritize Certifications and Compliance.
       - If this is a Technical role (Software, Engineering), prioritize Hard Skill Stacks and Project Complexity.
       - If this is a Creative role (Design, Marketing), prioritize Portfolio Impact and Tool Mastery.
       - If this is an Entry-Level or Academic role, leverage the Transcript/Academic Background to substitute for missing work experience.
    3. GROUNDING RULE: Only credit the candidate for skills and experience explicitly present in the provided Candidate Context. Do NOT hallucinate levels of seniority.
    4. PROGRAM REQUIREMENT INTERPRETATION — read the JD language carefully before penalizing for program mismatch:
       - "or related program/field/diploma" → treat adjacent programs as meeting the requirement. Examples: Urban Planning or Environmental Studies (Cities/Planning specialisation) qualifies for transit, infrastructure, municipal, and environmental roles; Journalism/Communications qualifies for policy comms, stakeholder engagement, and public affairs roles. A BES (Bachelor of Environmental Studies) with a planning/cities concentration is functionally an urban planning degree — treat it as such.
       - "considered an asset" or "preferred" → this is a bonus, NOT a requirement. Do NOT penalize the compatibility score for not having an asset.
       - "Don't meet every requirement? We encourage you to apply" or similar open-invitation language → the employer has explicitly lowered the gate. Treat soft requirement gaps more generously; score the candidate on demonstrated skills and experience rather than credentials alone.
       - Only penalize hard program mismatch when the JD explicitly states the program as mandatory with no adjacent/related clause (e.g. "Must be enrolled in a P.Eng. program", "Licensed Professional Engineer required").
    5. MATCH BREAKDOWN: Identify key strengths and HONEST gaps.
    6. SCORE: Rate compatibility (0-100) based on hard evidence.

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
        "keySkills": ["List of 5-8 actual skills found in the job post — technical skills, soft skills, tools, and domain knowledge ONLY. Do NOT include enrollment requirements, program eligibility criteria, or administrative prerequisites (e.g. 'Enrolled in co-op program', 'Enrolled in Business Administration' are NOT skills). Keep each skill label short and scannable — 1 to 4 words maximum (e.g. 'Problem-solving', 'Microsoft Office', 'Written communication', 'Data analysis'). Do not copy JD sentences verbatim."],
        "requiredSkills": [
          { "name": "Skill Name", "level": "learning" | "comfortable" | "expert" }
        ],
        "coreResponsibilities": ["List of 4-6 primary duties"],
        "applicationDeadline": "Application closing date in YYYY-MM-DD format if stated, otherwise null",
        "salaryRange": "Salary or wage range as stated (e.g. '$55,000–$65,000/yr' or '$22–$28/hr'), otherwise null"
      },
      "resumeTailoringInstructions": ["3 extremely concise, 1-sentence bullet points on how to adjust the resume"],
      "coverLetterTailoringInstructions": [
        "EVIDENCE_BRIDGE_1: Map the single most critical job requirement to the best-matching resume block ID — format as: '[Requirement] → [Block ID]: [one-sentence explanation of the connection]'. Write this as an instruction for what to emphasize, not as a description of a letter that already exists (e.g. 'Lead with the TTC customer-service block to show direct transit experience', not 'The letter draws on TTC experience to show...').",
        "EVIDENCE_BRIDGE_2: Map the second most critical job requirement to a DIFFERENT resume block ID (must not reuse the block from bridge 1). Same forward-looking instruction voice as EVIDENCE_BRIDGE_1.",
        "FIT_FRAME: If compatibility score < 60, write a one-sentence framing instruction for the gap (e.g. 'Lead with transferable X skill; acknowledge Y gap as a learning goal'). If score >= 60, write one sentence identifying the candidate's strongest differentiator for this specific role, as an instruction (what to lead with), not a review of finished writing."
      ],
      "recommendedBlockIds": ["List of IDs from the candidate resume blocks that are most relevant to this job"],
      "internalAnalysis": "DEDICATED SCRATCHPAD: Record your logical checks, self-reminders (e.g. 'check date logic', 'missing Pro experience'), and meta-commentary here. Do NOT leak these into user-facing fields."
    }

    TONE & STYLE RULES:
    1. EXCLUSIVITY: All 'thinking', 'checks', or shouting (ALL CAPS) must happen ONLY in 'internalAnalysis'.
    2. USER-FACING: 'reasoning', 'strengths', and 'weaknesses' must be professional, supportive, and in Sentence Case.
    3. NO META: Do not say 'I think', 'I will', or 'Based on my analysis' in user-facing fields. Just provide the insight.
    4. ACTIONABLE: Frame 'weaknesses' as gaps that can be addressed, not as static failures.
    5. VOICE: Address the reader directly as "you"/"your" in 'reasoning', 'strengths', and 'weaknesses'. Never say "the candidate" — this is a direct message to the person being evaluated, not a third-party report about them.
  `
  },

  TAILOR_EXPERIENCE_BLOCK: (jobDescription: string, blockTitle: string, blockOrg: string, blockBullets: string[], instructions: string[]) => `
    You are an expert resume writer. 
    Rewrite the bullet points for this specific job experience to perfectly match the target job description.

    ${UNTRUSTED_DATA_RULE}

    TARGET JOB DATA:
    ${anchorData('TARGET_JOB', jobDescription.substring(0, 3000))}

    MY EXPERIENCE DATA:
    ${anchorData('EXPERIENCE_BLOCK', `Title: ${blockTitle}\nCompany: ${blockOrg}\nOriginal Bullets:\n${blockBullets.map(b => `- ${b}`).join('\n')}`)}

    ${GUIDANCE_RULE}

    TAILORING INSTRUCTIONS GUIDANCE:
    ${anchorGuidance('TAILORING_INSTRUCTIONS', instructions.join('\n'))}

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
    
    ${UNTRUSTED_DATA_RULE}

    TARGET JOB DATA:
    ${anchorData('TARGET_JOB', jobDescription.substring(0, 5000))}

    MY BACKGROUND DATA:
    ${anchorData('CANDIDATE_BACKGROUND', resumeContext)}

    INSTRUCTIONS:
    - Pitch me as the perfect candidate for THIS specific role.
    - Use keywords from the job description.
    - Keep it concise, punchy, and confident (no "I believe", just facts).
    - **CRITICAL**: Do NOT return "N/A" or empty text. If the resume is weak, spin it as a "Aspiring [Role Name]" or "motivated professional".
    - Return a JSON object: { "summary": "Text..." }
    `,
};
