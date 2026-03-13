import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CanonicalService } from '../../services/seo/canonicalService';
import { SEO_BUCKETS } from '../../services/seo/seo-data';
import { ArrowRight, CheckCircle2, Star, TrendingUp, AlertTriangle, Briefcase } from 'lucide-react';
import { ROUTES } from '../../constants';
import { SEO } from '../../components/common/SEO';

export const SEOLandingPage: React.FC = () => {
    const { role } = useParams<{ role: string }>();
    const navigate = useNavigate();

    // 1. Get Canonical Data
    const { bucket, originalQuery } = CanonicalService.getCanonicalRole(role || 'general');

    // 2. Dynamic Content Injection
    // We use the *specific* query for the H1, but the *bucket* content for advice.
    const displayTitle = originalQuery || 'Professional';

    const handleStartBuilding = () => {
        // Redirect to home with pre-filled job title context
        navigate(`/jobs?job=${encodeURIComponent(displayTitle)}`);
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pt-20 pb-20 px-4 sm:px-6 lg:px-8">
            <SEO
                title={`Best ${displayTitle} Resume Keywords & Skills (2025 Guide)`}
                description={`Build a tailored ${displayTitle} resume. ${bucket.description}`}
                canonical={`/resume-for/${role || 'general'}`}
            />
            <div className="max-w-5xl mx-auto space-y-16">

                {/* Hero Section */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                        <Star className="w-3 h-3" />
                        2025 Resume Guide
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-neutral-900 dark:text-white tracking-tight">
                        The Best Resume for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                            {displayTitle}
                        </span>
                    </h1>
                    <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                        {bucket.content.subheadline.replace('We help you', `For a ${displayTitle}, you need to`)}
                    </p>

                    <button
                        onClick={handleStartBuilding}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 shadow-xl shadow-indigo-500/20"
                    >
                        Build This Resume Now
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="text-sm text-neutral-500">Free • No Sign Up Required</p>
                </div>

                {/* Core Skills Section */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            Must-Have Skills for {displayTitle}s
                        </h3>
                        <div className="space-y-4">
                            {bucket.content.topSkills.map((skill, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <span className="text-neutral-700 dark:text-neutral-300 font-medium">{skill}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            Common Mistakes to Avoid
                        </h3>
                        <div className="space-y-4">
                            {bucket.content.commonMistakes.map((mistake, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                                    <span className="text-neutral-600 dark:text-neutral-400">{mistake}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pro Tip Section */}
                <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl p-8 border border-indigo-100 dark:border-indigo-800/30 text-center">
                    <div className="inline-block p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl mb-4 text-indigo-600 dark:text-indigo-400">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Expert Tip for {displayTitle}s</h3>
                    <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto italic">
                        "{bucket.content.proTip}"
                    </p>
                </div>

                {/* Internal Linking / Discovery */}
                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-12">
                    <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-6">Popular Roles</h4>
                    <div className="flex flex-wrap gap-4">
                        {SEO_BUCKETS.filter(b => b.id !== 'general').map(b => (
                            <Link
                                key={b.slug}
                                to={ROUTES.SEO_LANDING.replace(':role', b.slug)}
                                className="px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
                            >
                                {b.title} Resume
                            </Link>
                        ))}
                        <Link
                            to={ROUTES.SEO_LANDING.replace(':role', 'digital-marketing-specialist')}
                            className="px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
                        >
                            Digital Marketing Specialist
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};
