export const CAREER_PROMPTS = {
    SUGGEST_SKILLS: (resumeContext: string) => `
    You are an expert career consultant. Based on your resume profiles below, extract a comprehensive list of professional skills.
    
    YOUR EXPERIENCE PROFILES:
    ${resumeContext}
    
    TASK:
    - Identify technical skills, soft skills, tools, and methodologies mentioned or implied.
    - Use industry standard terms that commonly appear on job postings.
    - For EACH skill, provide a concise 1-sentence description explaining what it means in practical terms.
    - Example: {"name": "Retail Operations", "description": "Managing daily store operations including inventory, staff scheduling, and customer flow"}
    - Example: {"name": "Stakeholder Management", "description": "Building and maintaining relationships with internal and external partners"}
    - Focus on high-value skills important for your job matching.
    
    Return ONLY a JSON array of objects: [{"name": "Skill Name", "description": "Brief explanation"}]
    `,

    SKILL_VERIFICATION: (skillName: string, proficiency: string) => `
    You are a technical interviewer verifying a candidate's claim of being "${proficiency}" in "${skillName}".
    
    Generate 3 specific, falsifiable "I have..." statements that a VALID ${proficiency} user would agree with.
    
    CONSTRAINTS:
    - Write in **PLAIN ENGLISH** (geared to commoners).
    - Max 15 words per statement.
    - NO corporate jargon.
    - **AVOID** generic claims about "introducing tools", "saving money", or "efficiency" unless specific to the skill.
    - Focus on **HOW** the work is done and **WHAT** specific problems are solved.
    
    GUIDELINES by Level:
    - Learning: I know the basics and how to start.
    - Comfortable: I can do the work without help.
    - Expert: I can fix complex problems and teach others.
    
    EXAMPLES for "React" (Expert):
    - "I have fixed slow-loading pages by stopping unnecessary re-renders."
    - "I have built a system to manage app data without extra libraries."
    - "I have set up server-side rendering to make the app load faster."
    
    TASK:
    Generate 3 statements for "${skillName}" at "${proficiency}" level.
    Return ONLY a JSON array of strings.
    `,

    GAP_ANALYSIS: (roleModelContext: string, userProfileContext: string, academicContext?: string) => `
    You are a Strategic Career Architect. Your task is to perform a high-resolution Gap Analysis between your current profile and the collective patterns of your "Role Models".

    ROLE MODEL PATTERNS:
    ${roleModelContext}

    YOUR PROFILE (Current):
    ${userProfileContext}

    ${academicContext ? `ACADEMIC BACKGROUND (Transcript):
    ${academicContext}` : ''}
    
    TASK:
    1. IDENTIFY GAPS: Compare the Role Models' career paths and top skills to your experience.
    2. REVERSE-ENGINEER PATHS: Identify "Strategic Moves" or "Career Jumps" common across role models. Look for timing (e.g., "pivoted after 2 years"), company types (e.g., "moved to a startup to get senior title"), and ladder logic.
    3. QUANTIFY: For each major gap, provide "Actionable Evidence" — specific, measurable projects or milestones you should complete.
    4. STRATEGY: 
       - Avoid generic advice like "Learn React".
       - Say "Build a full-stack e-commerce app using React and Stripe to prove you can handle production-ready payment flows."
    5. **STRICT RULE**: FOCUS on hard technical skills, tools, and certifications for the skill gaps section.
    
    Return JSON with this schema:
    {
      "careerTrajectoryGap": "string (High-level summary of path differences)",
      "strategicPathPatterns": [
        {
          "title": "string (e.g., 'The Mid-Stage Startup Leap')",
          "description": "string (Explain the pattern/jump seen across models)",
          "timing": "string (e.g., 'Year 3-5')",
          "prevalence": "string (e.g., 'Seen in 4/5 Role Models')"
        }
      ],
      "topSkillGaps": [
        {
          "skill": "string",
          "importance": 1-5,
          "gapDescription": "string",
          "actionableEvidence": [
            {
              "type": "project" | "metric" | "certification" | "tool",
              "task": "string",
              "metric": "string (The proof of success)",
              "tools": ["string"],
              "resumeBullet": "Specifically written XYZ bullet for a resume (e.g. 'Engineered X using Y to deliver Z')"
            }
          ]
        }
      ],
      "estimatedTimeToBridge": "string (e.g. 6-12 months)"
    }
  `,

    ROLE_MODEL_GAP_ANALYSIS: (roleModelContext: string, userProfileContext: string) => `
    You are a Strategic Career Architect analyzing a "Role Model Emulation" path.
    You are NOT comparing the user to a generic job description. You are comparing them to a specific person's actual history.

    ROLE MODEL PROFILE (The Goal):
    ${roleModelContext}

    YOUR PROFILE (Current):
    ${userProfileContext}

    TASK:
    Compare the User's qualifications against the Role Model's achievements to create an actionable "Emulation Plan".
    - Look for "Leap Points": When did the role model get their big break? (e.g. "After 2 years as Analyst, they jumped to Manager")
    - Look for "Education Gaps": Do they have a Masters? Certs?
    - Look for "Experience Gaps": Did they work at "Tier 1" companies? Specific roles the user skipped?

    OUTPUT JSON (Strictly matching GapAnalysisResult):
    {
      "careerTrajectoryGap": "A narrative comparison of their speed/seniority vs yours. e.g. 'They reached VP in 8 years, you are on track for 10.'",
      "strategicPathPatterns": [
        { "title": "The specific move", "description": "Why it mattered", "timing": "Role Model Year X", "prevalence": "High Impact" }
      ],
      "topSkillGaps": [
        { 
          "skill": "Skill Name", 
          "importance": 5, 
          "gapDescription": "Why you need it", 
          "actionableEvidence": [
            { 
              "type": "project", 
              "task": "Build X", 
              "metric": "Prove Y", 
              "tools": ["Tool A"],
              "resumeBullet": "Specifically written XYZ bullet for a resume (e.g. 'Engineered X using Y to deliver Z')" 
            }
          ] 
        }
      ],
      "estimatedTimeToBridge": "e.g. 18-24 months",
      "dateGenerated": ${Date.now()}
    }
  `,

    GENERATE_ROADMAP: (gapAnalysis: string) => `
    You are a Strategic Career Architect. Your task is to transform a Gap Analysis into a structured 12-month Roadmap.

    GAP ANALYSIS DATA:
    ${gapAnalysis}

    TASK:
    1. DISTRIBUTE: Take the "Actionable Evidence" items from the Gap Analysis and distribute them across a 12-month timeline.
    2. SEQUENCING: Prioritize foundational skills first. 
    3. BALANCE: Ensure a realistic workload (not everything in month 1 or month 12).
    4. SCHEMA: Return a JSON object with a "milestones" array.
    5. PERSONA: Speak directly to "You" in the milestone descriptions.

    Return JSON with this schema:
    {
      "milestones": [
        {
          "id": "string",
          "month": 1-12,
          "title": "string (Short, punchy)",
          "type": "project" | "metric" | "certification" | "tool",
          "task": "string",
          "metric": "string",
          "tools": ["string"],
          "linkedSkill": "string (The skill name this addresses)"
        }
      ]
    }
  `,
};
