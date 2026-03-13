/**
 * Curated Database of Professional Skills
 * Used to validate extracted keywords and provide reliable discovery.
 */

export const SKILL_DATABASE = new Set([
    // Core Engineering & Development
    'Software Engineering', 'Full Stack Development', 'Frontend Development', 'Backend Development',
    'Mobile Development', 'DevOps', 'Cloud Computing', 'System Architecture', 'Database Management',
    'Data Science', 'Machine Learning', 'Artificial Intelligence', 'Cybersecurity', 'API Design',
    'Microservices', 'Unit Testing', 'CI/CD', 'Scalability', 'Embedded Systems', 'QA Engineering',

    // Programming Languages
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'Swift', 'Kotlin', 'PHP', 'Ruby', 'SQL', 'NoSQL', 'HTML5', 'CSS3', 'Sass', 'GraphQL',

    // Tools & Technologies
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Git', 'GitHub', 'PostgreSQL',
    'MongoDB', 'Redis', 'Firebase', 'Next.js', 'Vite', 'Webpack', 'Figma', 'Adobe XD',
    'Unity', 'Unreal Engine', 'Jira', 'Linear', 'Slack',

    // Design & Creative
    'UI Design', 'UX Design', 'Visual Design', 'Product Design', 'Graphic Design',
    'Interactive Design', 'Typography', 'Color Theory', 'User Research', 'Prototyping',
    'Animation', 'Motion Graphics', 'Video Editing', '3D Modeling',

    // Business & Product
    'Product Management', 'Project Management', 'Agile Methodology', 'Scrum', 'Stakeholder Management',
    'Business Analysis', 'Market Research', 'Financial Modeling', 'Strategic Planning',
    'Operations Management', 'Sales Strategy', 'Growth Marketing', 'SEO', 'Content Strategy',

    // Urban Planning & Social Science (Relevant to the USER's specific context)
    'Urban Planning', 'Urban Research', 'Geographic Information Systems', 'GIS', 'Sustainability',
    'Environmental Impact', 'Public Policy', 'Community Engagement', 'Housing Policy',
    'Transportation Planning', 'Zoning Analysis', 'Spatial Analysis', 'Demographic Research',
    'Economic Development', 'Land Use Planning', 'Urban Design', 'Civil Engineering',

    // Soft Skills (Cognitive & Leadership)
    'Leadership', 'Team Management', 'Critical Thinking', 'Problem Solving', 'Communication',
    'Public Speaking', 'Technical Writing', 'Mentorship', 'Conflict Resolution', 'Negotiation',
    'Time Management', 'Emotional Intelligence', 'Collaboration', 'Adaptability', 'Creative Thinking'
]);

/**
 * Normalizes a string for comparison with the database.
 */
export const normalizeSkill = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9 ]/g, '');

const NORMALIZED_DB = new Set(Array.from(SKILL_DATABASE).map(normalizeSkill));

/**
 * Checks if a string is a recognized skill in our database.
 */
export const isRecognizedSkill = (skill: string) => {
    return NORMALIZED_DB.has(normalizeSkill(skill));
};
