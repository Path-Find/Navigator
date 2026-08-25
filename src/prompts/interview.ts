import { anchorData, UNTRUSTED_DATA_RULE } from './anchoring';

export const INTERVIEW_PROMPTS = {
  GENERATE_QUESTIONS: (jobDescription: string, resumeContext: string, jobTitle?: string) => `
    You are a senior recruiter conducting a high-stakes interview.
    Your goal is to screen this candidate and identify any red flags in their experience.

    ${UNTRUSTED_DATA_RULE}

    INPUT DATA:
    1. TARGET ROLE DATA:
    ${anchorData('TARGET_ROLE', jobTitle || '')}

    2. TARGET JOB DESCRIPTION DATA:
    ${anchorData('JOB_DESCRIPTION', jobDescription)}
    
    3. CANDIDATE RESUME/EXPERIENCE DATA:
    ${anchorData('RESUME', resumeContext)}
    
    TASK:
    Generate a list of 5-7 challenging interview questions.
    
    CRITICAL RULES:
    1. PERSONA: You are a peer expert, not an HR admin. Ask questions that reveal actual competence.
    2. DEPTH: 50% of questions must be technical/role-specific scenarios (e.g., "How would you handle [specific edge case]?").
    3. BEHAVIORAL: 2 questions on conflict/failure, referencing specific bullets from their resume if possible.
    4. TONE: Professional, slightly skeptical, direct.
    
    Return ONLY a JSON array of objects:
    [
      {
        "question": "The question text.",
        "rationale": "Why you are asking this (e.g. 'Checking depth of React knowledge').",
        "category": "technical" | "behavioral" | "situational",
        "tips": "What a 'Senior' level answer would include."
      }
    ]
    `,

  SKILL_INTERVIEW: (skillName: string, level: string) => `
    You are an expert interviewer verifying a claimed skill at the supplied level.
    ${UNTRUSTED_DATA_RULE}

    SKILL DATA:
    ${anchorData('SKILL_NAME', skillName)}
    ${anchorData('SKILL_LEVEL', level)}

    Your goal is to verify if the candidate is truly at the supplied level.

    DOMAIN INFERENCE:
    - If skill is "React/Node/Python" -> YOU ARE A SENIOR ENGINEER. Ask about internals, performance, memory leaks.
    - If skill is "Figma/Design" -> YOU ARE A CREATIVE DIRECTOR. Ask about systems, libraries, handoffs.
    - If skill is "Management/Agile" -> YOU ARE A VP OF PRODUCT. Ask about conflict, prioritization, stakeholders.
    
    TASK:
    Generate 5 very specific, technical/practical questions to test the supplied skill.
    
    LEVEL GUIDANCE:
    - The supplied level means:
      ${level === 'expert' ? '- They should know edge cases, architecture, and "why" things work.' : ''}
      ${level === 'comfortable' ? '- They should know best practices and common pitfalls.' : ''}
      ${level === 'learning' ? '- They should know core concepts and basic syntax.' : ''}

    CRITICAL RULES:
    1. NO TRIVIA: Do not ask "What does HTML stand for?". Ask "Why would you use a <section> tag instead of a <div>?".
    2. SCENARIOS: "A user reports X is slow. How do you debug it?"
    3. BREVITY: Keep questions under 2 sentences.

    Return ONLY a JSON array of strings (the questions).
    `,

  UNIFIED_SKILL_INTERVIEW: (skills: { name: string; proficiency: string; evidence?: string }[]) => {
    const skillList = skills.map(s => `- ${s.name} (self-assessed: ${s.proficiency})${s.evidence ? ` [PREVIOUSLY VERIFIED: ${s.evidence}]` : ''}`).join('\n');
    return `
    You are a versatile Expert Interviewer conducting a comprehensive skills assessment.
    ${UNTRUSTED_DATA_RULE}

    CANDIDATE SKILLS DATA:

    ${anchorData('SKILLS', skillList)}

    TASK:
    Generate 10-12 interview questions that naturally cover MULTIPLE skills at once.
    Each question should be designed to test 1-3 of the listed skills simultaneously.

    STRATEGY:
    1. CROSS-CUTTING: Ask scenario questions that bridge multiple skills.
    2. PRACTICAL: Use real-world scenarios, not trivia.
    3. DEPTH: Mix difficulty. If a skill has "PREVIOUSLY VERIFIED" evidence, skip the basics and ask an ADVANCED scenario to test the next level of depth.
    4. NATURAL FLOW: Questions should feel like a real conversation, not a checklist.
    5. BREVITY: Keep each question under 2 sentences.

    Return ONLY a JSON array of objects:
    [
      {
        "question": "The question text.",
        "targetSkills": ["Skill Name 1", "Skill Name 2"]
      }
    ]
    `;
  },

  ANALYZE_UNIFIED_RESPONSE: (question: string, targetSkills: string[], userResponse: string) => `
    You are a strict but fair interviewer evaluating a candidate's response. Speak DIRECTLY to the candidate.

    ${UNTRUSTED_DATA_RULE}

    QUESTION DATA: ${anchorData('QUESTION', question)}
    TARGET SKILLS DATA: ${anchorData('TARGET_SKILLS', targetSkills.join(', '))}
    CANDIDATE RESPONSE DATA: ${anchorData('CANDIDATE_RESPONSE', userResponse)}

    TASK:
    1. Evaluate the response quality overall. Address the candidate DIRECTLY using "you" (do NOT use third-person like "the candidate").
    2. For EACH target skill listed, determine if the response demonstrates competence in that skill.
    3. Provide concise feedback.

    Return ONLY JSON:
    {
      "feedback": "Brief, direct overall feedback on the answer addressed directly to the candidate using 'you' (e.g., 'You gave a great example, but...'). Max 2-3 sentences.",
      "overallPassed": boolean,
      "skillResults": [
        {
          "skill": "Skill Name",
          "demonstrated": boolean,
          "note": "One sentence on why/why not"
        }
      ]
    }
    `,

  GENERAL_BEHAVIORAL: (resumeContext: string) => `
    You are an experienced HR manager conducting a general behavioral interview.
    Use the candidate's background below to make questions feel personal and relevant — reference their actual roles, organizations, and experiences where natural.

    ${UNTRUSTED_DATA_RULE}

    CANDIDATE BACKGROUND DATA:
    ${anchorData('CANDIDATE_BACKGROUND', resumeContext)}

    TASK:
    Generate 9 behavioral interview questions that cover:
    - Overcoming a challenge or setback
    - Working in or leading a team
    - Handling conflict or a difficult person
    - Dealing with failure or a mistake
    - Adapting to change or ambiguity
    - Prioritization under pressure
    - A proud achievement
    - Career goals and motivation

    RULES:
    - Do NOT include "Tell me about yourself" or a close variant — that opener is already added separately.
    - Questions must sound like a real interviewer — natural, open-ended, not candidate-specific. Do NOT reference the candidate's employers, roles, or experiences in the question text.
    - Use the candidate's background to calibrate which questions to ask and at what level. For example: if they have management experience, include a leadership question; if they are early-career, focus on learning and teamwork; match the seniority and industry context.
    - Tips should be general coaching advice (STAR method, what a strong answer includes) — not references to their specific background, since the UI already surfaces that separately.
    - Keep each question under 2 sentences.

    Return ONLY a JSON array of objects:
    [
      {
        "question": "The question text.",
        "category": "behavioral",
        "tips": "Brief advice on how to answer this specific question well (STAR method or similar)."
      }
    ]
    `,

  PROFILE_SUMMARY: (resumeContext: string, answers: string) => `
    You are organizing a candidate's own answers into reusable application context.
    Do not invent, diagnose, or infer sensitive personal characteristics.

    ${UNTRUSTED_DATA_RULE}

    RESUME DATA:
    ${anchorData('RESUME', resumeContext)}

    PROFILE INTERVIEW ANSWERS:
    ${anchorData('PROFILE_INTERVIEW_ANSWERS', answers)}

    TASK:
    Extract only explicit, useful context for future career applications.
    - Signals should be short statements about career stage, direction, education status, preferred emphasis, or a boundary about what not to claim.
    - Stories should preserve the user's own evidence and should not add metrics, skills, credentials, or outcomes.
    - Omit answers marked [Skipped].
    - Omit anything uncertain, sensitive, or not useful for applications.
    - Return at most 4 signals and 3 stories.

    Return ONLY JSON:
    {
      "signals": [
        { "key": "career_stage" | "career_direction" | "education_status" | "preferred_emphasis" | "boundary", "value": "short explicit statement" }
      ],
      "stories": [
        { "text": "short evidence-grounded story", "tags": ["short", "relevant", "tags"] }
      ]
    }
    `,

  ANALYZE_RESPONSE: (question: string, userResponse: string, jobContext?: string) => `
    You are a strict technical interviewer. Analyze the candidate's response.

    ${UNTRUSTED_DATA_RULE}
    
    QUESTION DATA: ${anchorData('QUESTION', question)}
    RESPONSE DATA: ${anchorData('CANDIDATE_RESPONSE', userResponse)}
    ${jobContext ? `JOB CONTEXT DATA: ${anchorData('JOB_CONTEXT', jobContext)}` : ''}
    
    TASK:
    1. GRADE: Does this answer demonstrate the required competence?
    2. DECISION: "Reject" | "Weak" | "Average" | "Strong" | "Exceptional"
    3. FEEDBACK: Explain *why* you made this decision.
    4. RESUME SUGGESTIONS: If the candidate mentioned a strong achievement, metric, or skill that is NOT typically highlighted well in a basic resume, or if they showed a gap that needs addressing, provide specific resume bullet suggestions.

    Return ONLY JSON:
    {
      "decision": "Reject" | "Weak" | "Average" | "Strong" | "Exceptional",
      "feedback": "Direct feedback. 'You missed the key concept of X...'",
      "strengths": ["string"],
      "improvements": ["string"],
      "betterVersion": "A more senior/correct version of the answer.",
      "resumeSuggestions": [
        {
          "type": "add" | "update" | "remove",
          "suggestion": "The proposed resume bullet or action.",
          "impact": "Why this change helps (e.g., 'Quantifies your impact on team velocity')."
        }
      ]
    }
    `,

  ANALYZE_AND_FOLLOW_UP: (question: string, userResponse: string, jobContext?: string, resumeContext?: string) => `
    You are a strict technical interviewer. Analyze the candidate's response, then decide if a follow-up is warranted.

    ${UNTRUSTED_DATA_RULE}

    QUESTION DATA: ${anchorData('QUESTION', question)}
    RESPONSE DATA: ${anchorData('CANDIDATE_RESPONSE', userResponse)}
    ${jobContext ? `JOB CONTEXT DATA: ${anchorData('JOB_CONTEXT', jobContext)}` : ''}
    ${resumeContext ? `RESUME DATA: ${anchorData('RESUME', resumeContext)}` : ''}

    TASK:
    1. GRADE: Does this answer demonstrate the required competence?
    2. DECISION: "Reject" | "Weak" | "Average" | "Strong" | "Exceptional"
    3. FEEDBACK: Explain *why* you made this decision.
    4. BETTER VERSION: Rewrite the candidate's answer using only facts explicitly supported by the resume, candidate response, and job context. Never invent names, employers, titles, technologies, metrics, years, or achievements. If the available evidence is insufficient, provide a concise answer structure with bracketed prompts for the candidate to complete rather than pretending to know the facts.
    5. RESUME SUGGESTIONS: If the candidate mentioned a strong achievement or gap not well-represented on a resume, provide specific bullet suggestions.
    6. FOLLOW-UP: Decide if a follow-up question would deepen understanding. Criteria:
       - VAGUENESS: Did they use buzzwords without details? Ask for an example.
       - DEPTH: Did they mention a complex topic without explaining it?
       - INTERESTING: Did they mention a metric worth probing?
       - NO FOLLOW-UP: If the answer is complete and clear, do not force one.

    Return ONLY JSON:
    {
      "decision": "Reject" | "Weak" | "Average" | "Strong" | "Exceptional",
      "feedback": "Direct feedback addressed to the candidate using 'you'.",
      "strengths": ["string"],
      "improvements": ["string"],
      "betterVersion": "A more senior/correct version of the answer.",
      "resumeSuggestions": [
        {
          "type": "add" | "update" | "remove",
          "suggestion": "The proposed resume bullet or action.",
          "impact": "Why this change helps."
        }
      ],
      "followUp": {
        "shouldFollowUp": boolean,
        "question": "The follow-up question text, or null if shouldFollowUp is false.",
        "rationale": "Why you are asking this (or why not)."
      }
    }
    `,

  FOLLOW_UP: (question: string, userResponse: string, jobContext?: string) => `
    You are an expert interviewer. The candidate has just answered a question. decide if you should ask a follow-up question to dig deeper, clarify a point, or challenge an assumption.

    ${UNTRUSTED_DATA_RULE}
    
    ORIGINAL QUESTION DATA: ${anchorData('QUESTION', question)}
    CANDIDATE RESPONSE DATA: ${anchorData('CANDIDATE_RESPONSE', userResponse)}
    ${jobContext ? `JOB CONTEXT DATA: ${anchorData('JOB_CONTEXT', jobContext)}` : ''}
    
    CRITERIA FOR FOLLOW-UP:
    1. VAGUENESS: Did they use buzzwords without details? Ask for an example.
    2. DEPTH: Did they mention a complex topic? Ask "How exactly did you implement that?".
    3. INTERESTING: Did they mention a metric? Ask how they measured it.
    4. NO FOLLOW-UP: If the answer is complete, comprehensive, and clear, do not force a follow-up.

    Return ONLY JSON:
    {
      "shouldFollowUp": boolean,
      "question": "The follow-up question text (null if shouldFollowUp is false).",
      "rationale": "Why you are asking this (or why not)."
    }
    `
};
