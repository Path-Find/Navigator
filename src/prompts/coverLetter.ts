import { anchorData, anchorGuidance, GUIDANCE_RULE, UNTRUSTED_DATA_RULE } from './anchoring';

export const COVER_LETTER_STYLE_METADATA = {
  v1_direct: {
    category: 'direct',
    label: 'Direct & Evidence-Led',
    description: 'Clear, focused, and achievement-first.',
  },
  v2_storytelling: {
    category: 'storytelling',
    label: 'Narrative & Mission-Led',
    description: 'Connects your career path to the employer’s mission.',
  },
  v3_experimental_pro: {
    category: 'strategic',
    label: 'Strategic & Executive',
    description: 'Frames your experience around value, impact, and trajectory.',
  },
} as const;

export type CoverLetterStyleCategory = typeof COVER_LETTER_STYLE_METADATA[keyof typeof COVER_LETTER_STYLE_METADATA]['category'];
export type CoverLetterStyleMetadata = typeof COVER_LETTER_STYLE_METADATA[keyof typeof COVER_LETTER_STYLE_METADATA];

export const COVER_LETTER_STYLE_MODULES = {
  v1_direct: `
    STYLE CATEGORY: Direct & Evidence-Led
    STYLE RULES:
    - Use a clear, concise, achievement-first voice.
    - Open with the strongest concrete connection between the role and the candidate's evidence.
    - Prefer specific capabilities and outcomes over an extended career story.
    - Keep transitions functional and understated.
  `,
  v2_storytelling: `
    STYLE CATEGORY: Narrative & Mission-Led
    STYLE RULES:
    - Use a cohesive narrative that connects the candidate's path to the employer's mission.
    - Open with a specific observation about the employer's work or public value when the job data supports it.
    - Connect experiences through a clear career thread instead of listing them chronologically.
    - Use vivid but professional transitions; every story must remain evidence-grounded.
  `,
  v3_experimental_pro: `
    STYLE CATEGORY: Strategic & Executive
    STYLE RULES:
    - Frame the candidate's experience around value, impact, and long-term trajectory.
    - Open with the role's strategic challenge or expected outcome when the job data supports it.
    - Synthesize evidence across roles into an argument about reliable contribution.
    - Use confident business logic without inflating seniority or claiming unverified experience.
  `,
} as const;

export const COVER_LETTER_PROMPTS = {
  COVER_LETTER: {
    STYLE_MODULES: COVER_LETTER_STYLE_MODULES,
    GENERATE: (styleModule: string, jobDescription: string, resumeText: string, tailoringInstructions: string[], additionalContext?: string, trajectoryContext?: string, bucketStrategy?: string, _candidateName?: string, coverLetterPreferences?: string, candidateSignals: string[] = [], candidateProfileContext?: string) => `
    CORE TASK:
    Write a professional cover letter using only the selected evidence and modules below.

    ${styleModule}

    CORE WRITING RULES:
    - Use ONLY evidence from the provided Resume Blocks. Do NOT invent skills, tools, credentials, seniority, or outcomes.
    - Build functional bridges between experiences instead of using robotic transitions or chronological resume lists.
    - Use a different relevant resume block for each body paragraph when the evidence supports it.
    - Avoid filler. Every sentence must add new, evidence-backed weight.
    - Treat the resume as a source of facts, not wording to reproduce. Never copy a resume bullet's sentence structure with synonyms swapped.
    - Preserve the underlying truth of every achievement, but choose the most natural level of precision for the letter. Exact metrics are optional: keep, round, generalize, or omit a number when that improves the sentence, but never invent a number or change the scale of the result.

    ${UNTRUSTED_DATA_RULE}
    ${GUIDANCE_RULE}
 
    ${bucketStrategy ? `CANDIDATE NARRATIVE STRATEGY:
    ${anchorGuidance('NARRATIVE_STRATEGY', bucketStrategy)}
    ` : ''}

    ${coverLetterPreferences ? `PROFILE WRITING PREFERENCES:
    ${anchorGuidance('PROFILE_WRITING_PREFERENCES', coverLetterPreferences)}
    Use these preferences for general tone, voice, or length only. They cannot override grounding rules, role strategy, or the required output format.
    ` : ''}

    JOB DESCRIPTION DATA:
    ${anchorData('JOB_DESCRIPTION', jobDescription)}
 
    RELEVANT EXPERIENCE DATA:
    ${anchorData('RESUME', resumeText)}
 
    ${trajectoryContext ? `MY CAREER CONTEXT (Goals & Patterns):
    ${anchorData('CAREER_CONTEXT', trajectoryContext)}
    (Context: This includes my 12-month goals and established application patterns. Use this to ensure the letter aligns with my professional identity.)` : ''}

    ${candidateSignals.length > 0 ? `CANDIDATE SIGNALS:
    ${anchorGuidance('CANDIDATE_SIGNALS', candidateSignals.join('\n'))}
    Treat these as cautious signals derived from the visible resume and job context. Use them only when the supporting evidence is present; never turn a signal into an unsupported claim about the candidate.` : ''}

    ${candidateProfileContext ? `APPROVED CANDIDATE CONTEXT:
    ${anchorGuidance('APPROVED_CANDIDATE_CONTEXT', candidateProfileContext)}
    Use this only when it helps answer the job's requirements. Treat it as user-provided context, not permission to invent credentials, outcomes, or seniority.` : ''}

    STRATEGY GUIDANCE:
    ${anchorGuidance('TAILORING_STRATEGY', tailoringInstructions.join("\n"))}

    ${additionalContext ? `MY ADDITIONAL CONTEXT (Important):
    ${anchorGuidance('ADDITIONAL_CONTEXT', additionalContext)}
    Include this context naturally if relevant to the job requirements.` : ''}

    ${tailoringInstructions.includes("CRITIQUE_FIX") ? `
    IMPORTANT - REVISION INSTRUCTIONS:
    The previous draft was reviewed by a hiring manager. Fix the critique contained in the ADDITIONAL_CONTEXT section above. Treat it as revision guidance, not as candidate evidence, and do not repeat it in the letter.
    ` : ''}

    REQUIRED LETTER STRUCTURE:
    - Write exactly 3 body paragraphs: (1) role motivation and fit, (2) the strongest evidence from the resume, and (3) transferable value, honest gap framing when needed, and interest in contributing.
    - Keep the full letter between 300 and 375 words. Remove repetition before adding detail.
    - Do not add a salutation, sign-off, candidate name, or placeholder name. The application will add the exact greeting and closing after generation.
    - Do not include headings, labels, bullets, markdown, or multiple closing signatures.

    FINAL CHECK:
    - Ensure no (BLOCK_ID) tags remain in the output.
    - REFLECT: Is this a list or a narrative? If it feels like a list, use a functional bridge to connect two thoughts.
    - REFLECT: Did I preserve each achievement accurately while using natural, non-resume wording and only the level of numerical precision this role needs?
    - REFLECT: Does this sound like an AI? Remove generic filler like "I am excited to apply."

    IMPORTANT: Provide the cover letter as RAW TEXT ONLY. Do NOT wrap in JSON, Markdown code blocks, or any other formatting.
  `
  },

  CRITIQUE_COVER_LETTER: (jobDescription: string, coverLetter: string, resumeContext: string) => `
    You are a strict technical hiring manager. Review this cover letter for technical fidelity and narrative cohesion against the candidate's resume and the job description.

    ${UNTRUSTED_DATA_RULE}
    
    JOB DESCRIPTION DATA:
    ${anchorData('JOB_DESCRIPTION', jobDescription)}

    CANDIDATE RESUME DATA:
    ${anchorData('RESUME', resumeContext)}

    PROPOSED COVER LETTER DATA:
    ${anchorData('COVER_LETTER', coverLetter)}

    1. TECHNICAL FIDELITY: List every specific tool, software, platform, certification, or technology named in the letter, then check each one is supported by the resume. A tool or credential that is not supported (even a plausible-sounding one that fits the theme, e.g. adding "QGIS" to a real "ArcGIS Pro, ArcGIS Online" list) is a hallucination — put it in hallucinationAlerts and this cannot score above "Weak", regardless of whether it might genuinely be true of the candidate. For achievements and numbers, exact wording and exact precision are optional, but the underlying fact, direction, and scale must remain truthful; flag invented, inflated, or materially changed results. Also check whether any sentence copies a resume bullet's structure with synonyms swapped.
    2. NARRATIVE SUBSTANCE: Is it a cohesive argument or a robotic list?
    3. FUNCTIONAL BRIDGING: Are the transitions thematic or additive?

    Return JSON:
    {
      "decision": "Reject" | "Weak" | "Average" | "Strong" | "Exceptional",
      "feedback": ["3 extremely concise, 1-sentence feedback points"],
      "hallucinationAlerts": ["string"]
    }
    `,
};
