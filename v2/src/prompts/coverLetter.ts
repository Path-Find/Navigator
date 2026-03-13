export const COVER_LETTER_PROMPTS = {
  COVER_LETTER: {
    VARIANTS: {
      v1_direct: `
            You are a Strategic Career Architect. Write a professional, high-impact cover letter (approx. 400 words).
            
            INSTRUCTIONS:
            - **Grounding Rule**: Use ONLY evidence from the provided Resume Blocks. Do NOT invent skills.
            - **Functional Connections**: Do NOT use robotic transitions like "Additionally" or "Moreover." Instead, build thematic bridges between experiences (e.g., "My technical proficiency in [Skill A] is complemented by a track record in [Skill B] where I...").
            - **Thematic Cohesion**: Group resume evidence by *impact theme* (e.g., Scaling Operations, System Architecture) rather than a simple chronological list of jobs. A single paragraph should weave evidence from at least two different roles if they share a common theme.
            - **Category-Aware Metrics**:
              - If the job is 'technical' or 'academic': Preserve literal statistics (e.g., "98% accuracy," "6,400 followers") for precision.
              - If the job is 'creative', 'managerial', or 'general': Paraphrase statistics into high-impact narrative (e.g., "tripling engagement," "gold-standard precision").
            - **Substance**: Avoid filler. Every sentence must add new, evidence-backed weight to the value proposition.
            - Structure:
              1. THE HOOK: A sophisticated observation about the company's specific mission or market challenge.
              2. THE SYNTHESIS: Unified body paragraphs that combine achievements from across the candidate's history to prove mastery.
              3. STRATEGIC ROI: How this specific trajectory makes the candidate the most reliable, high-impact choice.
            `,
      v2_storytelling: `
            You are a Career Architect helping a candidate stand out with narrative. Write a detailed, compelling letter that tells a cohesive professional story (approx. 450 words).
            
            INSTRUCTIONS:
            - **Grounding Rule**: Use ONLY evidence from the provided Resume Blocks. Do NOT invent skills.
            - **Narrative Arc**: Create a thread that connects the candidate's journey to the role's mission. Move away from "And then I worked here" towards "My career has been defined by [Theme], evidenced by my work at..."
            - **Functional Connections**: Use logic-driven transitions that explain how one experience prepared the candidate for the next.
            - **Thematic Cohesion**: Group achievements by impact area rather than chronological lists.
            - **Category-Aware Metrics**:
              - If the job is 'technical' or 'academic': Preserve literal statistics for precision.
              - If the job is 'creative', 'managerial', or 'general': Paraphrase statistics into high-impact narrative.
            - **Substance**: Avoid filler. Every sentence must add new, evidence-backed weight to the value proposition.
            `,
      v3_experimental_pro: `
            You are a senior executive writing a high-level strategic letter. Focus on ROI, value proposition, and long-term trajectory.
            
            INSTRUCTIONS:
            - **Grounding Rule**: Use ONLY evidence from the provided Resume Blocks. Do NOT invent skills.
            - **Thematic Depth**: Focus on the core pillars of the candidate's value. 
            - **Synthesis**: Weave multi-role evidence into sophisticated arguments about leadership and impact.
            - **Functional Connections**: Use high-level business logic to bridge separate experiences (e.g., "My technical proficiency in [Skill A] is complemented by a track record in [Skill B] where I...").
            - **Category-Aware Metrics**:
              - If the job is 'technical' or 'academic': Preserve literal statistics for precision.
              - If the job is 'creative', 'managerial', or 'general': Paraphrase statistics into high-impact narrative.
            - **Substance**: Avoid filler. Every sentence must add new, evidence-backed weight to the value proposition.
            `
    },
    GENERATE: (template: string, jobDescription: string, resumeText: string, tailoringInstructions: string[], additionalContext?: string, trajectoryContext?: string, bucketStrategy?: string) => `
    ${template}
 
    ${bucketStrategy ? `CANDIDATE NARRATIVE STRATEGY:
    ${bucketStrategy}
    ` : ''}

    JOB DESCRIPTION:
    ${jobDescription}
 
    MY EXPERIENCE (Full Resume for Context):
    ${resumeText}
 
    ${trajectoryContext ? `MY CAREER CONTEXT (Goals & Patterns):
    ${trajectoryContext}
    (Context: This includes my 12-month goals and established application patterns. Use this to ensure the letter aligns with my professional identity.)` : ''}

    STRATEGY:
    ${tailoringInstructions.join("\n")}

    ${additionalContext ? `MY ADDITIONAL CONTEXT (Important):
    ${additionalContext}
    Include this context naturally if relevant to the job requirements.` : ''}

    ${tailoringInstructions.includes("CRITIQUE_FIX") ? `
    IMPORTANT - REVISION INSTRUCTIONS:
    The previous draft was reviewed by a hiring manager. Fix these specific issues:
    ${additionalContext} 
    (Note: The text above is the critique feedback, not personal context in this case).
    ` : ''}
    
    FINAL CHECK:
    - Ensure no (BLOCK_ID) tags remain in the output.
    - REFLECT: Is this a list or a narrative? If it feels like a list, use a functional bridge to connect two thoughts.
    - REFLECT: Did I handle the metrics correctly for this role category?
    - REFLECT: Does this sound like an AI? Remove generic filler like "I am excited to apply."
  `
  },

  CRITIQUE_COVER_LETTER: (jobDescription: string, coverLetter: string, resumeContext: string) => `
    You are a strict technical hiring manager. Review this cover letter for technical fidelity and narrative cohesion against the candidate's resume and the job description.
    
    JOB DESCRIPTION:
    ${jobDescription}

    CANDIDATE RESUME:
    ${resumeContext}

    PROPOSED COVER LETTER:
    ${coverLetter}

    1. TECHNICAL FIDELITY: Does it hallucinate or copy-paste?
    2. NARRATIVE SUBSTANCE: Is it a cohesive argument or a robotic list?
    3. FUNCTIONAL BRIDGING: Are the transitions thematic or additive?

    Return JSON:
    {
      "decision": "Reject" | "Weak" | "Average" | "Strong" | "Exceptional",
      "feedback": ["string"],
      "hallucinationAlerts": ["string"]
    }
    `,
};
