import type { SEORoleBucket } from './types';

export const SEO_BUCKETS: SEORoleBucket[] = [
    {
        id: 'software-engineer',
        slug: 'software-engineer',
        title: 'Software Engineer',
        keywords: ['developer', 'programmer', 'coder', 'engineer', 'stack', 'backend', 'frontend', 'fullstack', 'web'],
        description: "Generate a tailored resume for Software Engineer roles. Optimized for ATS and highlighting key technical skills like React, Node, and Python.",
        content: {
            headline: "Build a Software Engineer Resume that Compiles",
            subheadline: "Stop guessing keywords. We analyze the job description and tailor your resume for every specific stack.",
            topSkills: ["System Design", "Algorithms", "React / Node.js", "CI/CD Pipelines", "Cloud Architecture (AWS/GCP)"],
            commonMistakes: [
                "Listing every language you've ever touched.",
                "Focusing on responsibilities instead of impact (e.g., 'Refactored API' vs 'Reduced latency by 40%').",
                "Ignoring the specific stack mentioned in the JD."
            ],
            proTip: "Quantify your engineering impact. Did you reduce build times? Increase uptime? Scale to X users? Numbers speak louder than code.",
            promptAdvice: [
                "Prioritize technical stack alignment (languages, frameworks, tools).",
                "Look for evidence of system design, scalability, and performance optimization.",
                "Identify specific contributions to open source or complex internal projects."
            ],
            tailoringFocus: [
                "Quantifiable technical impact (e.g., 'Reduced latency by 40%').",
                "Explicit mention of the target stack in professional experience.",
                "Evidence of architectural decision-making."
            ],
            coverLetterStrategy: "Emphasize a problem-solving engineering mindset. Connect your technical skills directly to the company's hardest engineering challenges."
        }
    },
    {
        id: 'product-manager',
        slug: 'product-manager',
        title: 'Product Manager',
        keywords: ['product', 'manager', 'owner', 'roadmap', 'scrum', 'agile', 'feature'],
        description: "Create a data-driven Product Manager resume. Highlight your ability to lead cross-functional teams and ship successful products.",
        content: {
            headline: "Ship Your Product Manager Resume",
            subheadline: "Showcase your leadership. We help you articulate your product vision and execution strategy.",
            topSkills: ["Roadmap Strategy", "Agile / Scrum", "User Research", "Data Analysis (SQL/Tableau)", "Stakeholder Management"],
            commonMistakes: [
                "Using buzzwords without context.",
                "Failing to mention specific product outcomes (launch metrics, user growth).",
                "Focusing too much on technical details instead of business value."
            ],
            proTip: "Focus on the 'Why' and the 'So What'. Why did you build that feature? What was the business outcome?",
            promptAdvice: [
                "Look for experience with the full product lifecycle (discovery to launch).",
                "Evaluate stakeholder management and cross-functional leadership skills.",
                "Identify data-driven decision making and KPI ownership."
            ],
            tailoringFocus: [
                "Business outcomes and user growth metrics.",
                "Strategy, roadmap prioritization, and feature discovery.",
                "Successful cross-functional collaborations."
            ],
            coverLetterStrategy: "Narrate your product vision. Explain how you turn ambiguous user needs into high-impact features and business value."
        }
    },
    {
        id: 'marketing-manager',
        slug: 'marketing-manager',
        title: 'Marketing Manager',
        keywords: ['marketing', 'brand', 'growth', 'social', 'content', 'campaign', 'seo', 'sem'],
        description: "Craft a Marketing Manager resume that converts. optimize for growth, branding, and campaign performance metrics.",
        content: {
            headline: "Market Yourself as a Top Manager",
            subheadline: "Highlight your campaign wins. We help you showcase your ROI and growth metrics.",
            topSkills: ["Campaign Strategy", "SEO / SEM", "Content Marketing", "Brand Management", "Analytics (GA4/HubSpot)"],
            commonMistakes: [
                "Listing generic duties like 'managed social media'.",
                "Forgetting to include campaign performance metrics (ROI, conversion rates).",
                "Not tailoring the resume to the specific marketing channel (e.g., B2B vs B2C)."
            ],
            proTip: "Use numbers to tell your story. 'Increased leads by 200%' is better than 'Managed lead generation'.",
            promptAdvice: [
                "Focus on channel-specific expertise (SEO, PPC, Content, etc.).",
                "Analyze conversion rate optimization (CRO) and ROI tracking experience.",
                "Look for brand consistency and creative strategy leadership."
            ],
            tailoringFocus: [
                "Growth metrics, lead generation, and customer acquisition costs.",
                "Campaign ROI and performance tracking.",
                "Brand positioning and market penetration."
            ],
            coverLetterStrategy: "Demonstrate your ability to drive growth. Show how your creative strategies lead to measurable business results."
        }
    },
    {
        id: 'data-scientist',
        slug: 'data-scientist',
        title: 'Data Scientist',
        keywords: ['data', 'scientist', 'analyst', 'machine learning', 'ai', 'python', 'sql', 'model'],
        description: "Build a Data Scientist resume that interprets success. Highlight your modeling, analysis, and insight generation skills.",
        content: {
            headline: "Model Your Career as a Data Scientist",
            subheadline: "Turn your experience into insights. We help you highlight your technical and analytical prowess.",
            topSkills: ["Machine Learning", "Python / R", "SQL", "Data Visualization", "Statistical Modeling"],
            commonMistakes: [
                "Listing models without explaining their business impact.",
                "Overloading the resume with academic jargon.",
                "Ignoring the data cleaning and preparation process."
            ],
            proTip: "Balance the math with the business. How did your model improve decision-making or revenue?",
            promptAdvice: [
                "Evaluate modeling techniques and statistical rigor.",
                "Look for experience with specific data stacks (Python, Spark, SQL, etc.).",
                "Identify the ability to translate technical insights for non-technical stakeholders."
            ],
            tailoringFocus: [
                "Model performance metrics (accuracy, precision, lift).",
                "Business insights derived from complex datasets.",
                "End-to-end data pipeline development."
            ],
            coverLetterStrategy: "Bridge the gap between data and decisions. Highlight how your analytical insights provide a competitive advantage."
        }
    },
    {
        id: 'nurse',
        slug: 'nurse',
        title: 'Nurse',
        keywords: ['nurse', 'rn', 'lpn', 'clinical', 'patient', 'care', 'health', 'medical'],
        description: "Create a compassionate and professional Nursing resume. Highlight your clinical skills, patient care, and certifications.",
        content: {
            headline: "Care for Your Nursing Resume",
            subheadline: "Showcase your clinical expertise. We help you highlight your patient care and medical knowledge.",
            topSkills: ["Patient Care", "Clinical Procedures", "Emergency Response", "Medication Administration", "Team Collaboration"],
            commonMistakes: [
                "Listing every single rotation from school (if experienced).",
                "Failing to mention specific certifications (BLS, ACLS).",
                "Not quantifying patient load or unit specifics."
            ],
            proTip: "Emphasize your versatility and ability to handle high-pressure situations with compassion.",
            promptAdvice: [
                "Verify clinical settings (ICU, ER, etc.) and patient load management.",
                "Check for mandatory certifications (RN, CPR, ACLS) and licensing.",
                "Evaluate soft skills like patient advocacy, teamwork, and communication."
            ],
            tailoringFocus: [
                "Clinical competencies and unit-specific experience.",
                "Strict adherence to safety protocols and quality of care.",
                "Crisis management and patient relationship building."
            ],
            coverLetterStrategy: "Highlight your dedication to patient care and safety. Focus on your clinical competence in high-stakes environments."
        }
    },
    {
        id: 'general',
        slug: 'general',
        title: 'Professional',
        keywords: [],
        description: "Create a tailored resume for any role. Our AI analyzes the job description to highlight your most relevant skills and experience.",
        content: {
            headline: "Tailor Your Resume for Any Role",
            subheadline: "Don't let the ATS filter you out. We optimize your resume for the specific keywords in any job description.",
            topSkills: ["Communication", "Problem Solving", "Adaptability", "Time Management", "Collaboration"],
            commonMistakes: [
                "Using a generic resume for every application.",
                "Including irrelevant hobbies or outdated experience.",
                "Typos and formatting errors."
            ],
            proTip: "Always tailor your resume to the job description. Use the exact keywords they use.",
            promptAdvice: [
                "Focus on transferrable skills like communication and leadership.",
                "Highlight adaptability and quick learning.",
                "Emphasize reliability and professionalism."
            ]
        }
    }
];
