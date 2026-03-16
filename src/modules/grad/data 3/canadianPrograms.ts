import type { Program } from '../types/discovery';

export const CANADIAN_MA_PROGRAMS: Program[] = [
    {
        id: 'ubc-scarp',
        name: 'Master of Community and Regional Planning',
        institution: 'University of British Columbia',
        location: { city: 'Vancouver', province: 'BC', country: 'Canada' },
        type: 'Masters',
        url: 'https://scarp.ubc.ca/',
        keywords: ['Urban Planning', 'Sustainability', 'Social Justice', 'Indigenous Planning'],
        isVerified: true
    },
    {
        id: 'uwaterloo-planning',
        name: 'Master of Arts in Planning',
        institution: 'University of Waterloo',
        location: { city: 'Waterloo', province: 'ON', country: 'Canada' },
        type: 'Masters',
        url: 'https://uwaterloo.ca/planning/',
        keywords: ['Urban Planning', 'Environmental Planning', 'Economic Development'],
        isVerified: true
    },
    {
        id: 'utoronto-planning',
        name: 'Master of Science in Planning',
        institution: 'University of Toronto',
        location: { city: 'Toronto', province: 'ON', country: 'Canada' },
        type: 'Masters',
        url: 'https://www.geography.utoronto.ca/graduate/planning-program',
        keywords: ['Urban Planning', 'Policy', 'Urban Design', 'Transportation'],
        isVerified: true
    },
    {
        id: 'dalhousie-planning',
        name: 'Master of Planning',
        institution: 'Dalhousie University',
        location: { city: 'Halifax', province: 'NS', country: 'Canada' },
        type: 'Masters',
        url: 'https://www.dal.ca/faculty/architecture-planning/school-of-planning.html',
        keywords: ['Urban Planning', 'Coastal Planning', 'Urban Design'],
        isVerified: true
    },
    {
        id: 'mcgill-planning',
        name: 'Master of Urban Planning',
        institution: 'McGill University',
        location: { city: 'Montreal', province: 'QC', country: 'Canada' },
        type: 'Masters',
        url: 'https://www.mcgill.ca/urbanplanning/',
        keywords: ['Urban Planning', 'Civil Society', 'Design'],
        isVerified: true
    },
    {
        id: 'ucalgary-planning',
        name: 'Master of Planning',
        institution: 'University of Calgary',
        location: { city: 'Calgary', province: 'AB', country: 'Canada' },
        type: 'Masters',
        url: 'https://sapl.ucalgary.ca/master-planning',
        keywords: ['Urban Planning', 'Sustainable Design', 'Community Development'],
        isVerified: true
    },
    // Adding a few non-planning programs for diversity
    {
        id: 'uwaterloo-cs',
        name: 'Master of Mathematics in Computer Science',
        institution: 'University of Waterloo',
        location: { city: 'Waterloo', province: 'ON', country: 'Canada' },
        type: 'Masters',
        url: 'https://cs.uwaterloo.ca/',
        keywords: ['Computer Science', 'AI', 'Algorithms'],
        isVerified: true
    }
];
