import React from 'react';
import { Shield, Lock, Database, EyeOff, Server, Trash2 } from 'lucide-react';

export const Privacy: React.FC = () => {

    const SimpleCard = ({ icon: Icon, title, description, color }: { icon: React.ElementType; title: string; description: string; color: { bg: string; text: string; accent: string; iconBg: string } }) => (
        <div className={`group relative h-full flex flex-col p-6 rounded-3xl border transition-all duration-300 ${color.bg} ${color.accent} hover:shadow-xl hover:-translate-y-1`}>
            <div className={`mb-4 inline-flex items-center justify-center w-12 h-12 rounded-2xl ${color.iconBg} text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className={`text-lg font-bold mb-2 ${color.text}`}>
                {title}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {description}
            </p>
        </div>
    );

    const cards = [
        {
            id: 'no-training',
            icon: EyeOff,
            title: 'We Don\'t Train on Your Work',
            description: "We use the paid Enterprise tier of Google's Gemini API, which contractually guarantees your data is never used to train their models.",
            colors: {
                bg: 'bg-indigo-50/50 dark:bg-indigo-500/5',
                text: 'text-indigo-600 dark:text-indigo-400',
                accent: 'border-indigo-500/10 dark:border-indigo-500/20',
                iconBg: 'bg-indigo-600',
            },
            colSpan: 'md:col-span-1'
        },
        {
            id: 'encryption',
            icon: Lock,
            title: 'Locked on Your Device',
            description: "Your resumes and keys stay on your computer, encrypted so only you can read them.",
            colors: {
                bg: 'bg-emerald-50/50 dark:bg-emerald-500/5',
                text: 'text-emerald-600 dark:text-emerald-400',
                accent: 'border-emerald-500/10 dark:border-emerald-500/20',
                iconBg: 'bg-emerald-600',
            },
            colSpan: 'md:col-span-1'
        },
        {
            id: 'cloud',
            icon: Server,
            title: 'Syncs Safely',
            description: "When you switch devices, your data travels through a secure tunnel that even we can't see inside.",
            colors: {
                bg: 'bg-violet-50/50 dark:bg-violet-500/5',
                text: 'text-violet-600 dark:text-violet-400',
                accent: 'border-violet-500/10 dark:border-violet-500/20',
                iconBg: 'bg-violet-600',
            },
            colSpan: 'md:col-span-1'
        },
        {
            id: 'tracking',
            icon: Database,
            title: 'No Creepy Tracking',
            description: "We don't sell your data or follow you around the web. You're the customer, not the product.",
            colors: {
                bg: 'bg-rose-50/50 dark:bg-rose-500/5',
                text: 'text-rose-600 dark:text-rose-400',
                accent: 'border-rose-500/10 dark:border-rose-500/20',
                iconBg: 'bg-rose-600',
            },
            colSpan: 'md:col-span-1'
        },
        {
            id: 'data',
            icon: Trash2,
            title: 'You\'re in Control',
            description: "Export your data or delete your account anytime. It's your stuff, we're just holding the door.",
            colors: {
                bg: 'bg-amber-50/50 dark:bg-amber-500/5',
                text: 'text-amber-600 dark:text-amber-400',
                accent: 'border-amber-500/10 dark:border-amber-500/20',
                iconBg: 'bg-amber-600',
            },
            colSpan: 'md:col-span-1'
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white pt-24 pb-20">
            <div className="max-w-5xl mx-auto px-4">

                <div className="max-w-3xl mx-auto text-center mb-16">
                    <div className="inline-flex items-center justify-center p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-6">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                        Your Privacy is Our <span className="text-emerald-600 dark:text-emerald-400">Business Model</span>
                    </h1>
                    <p className="text-xl text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        Navigator operates on a simple promise: you pay for the tool (or use the free tier), and we don't sell your data. We've architected every feature to minimize data retention and maximize your control.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 mb-32">
                    {cards.map((card) => (
                        <div key={card.id} className={`${card.colSpan} h-full`}>
                            <SimpleCard
                                icon={card.icon}
                                title={card.title}
                                description={card.description}
                                color={card.colors}
                            />
                        </div>
                    ))}
                </div>

                {/* Privacy Policy Content */}
                <div className="relative max-w-3xl mx-auto">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-neutral-400 dark:text-neutral-500 mb-4 uppercase tracking-widest">
                            Effective Date: February 17, 2026
                        </p>

                        <div className="prose prose-neutral dark:prose-invert prose-lg md:prose-xl prose-headings:font-black prose-headings:tracking-tight prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline">
                            <p className="lead text-neutral-600 dark:text-neutral-400">
                                This Privacy Policy describes how Navigator ("we," "our," or "us") collects, uses, and discloses your information in connection with our services, website, and applications (collectively, the "Service").
                            </p>

                            <div className="space-y-20 mt-20">
                                <section>
                                    <h3 className="text-lg md:text-xl font-bold mb-4">
                                        1. Information We Collect
                                    </h3>
                                    <div className="space-y-6">
                                        <p>
                                            <strong>Account Information:</strong> When you create an account, we collect your name, email address, and authentication credentials. We use Supabase for secure authentication and data management.
                                        </p>
                                        <p>
                                            <strong>User Content:</strong> We store the resumes, job descriptions, transcripts, and career goals you upload or generate. This data is associated with your account and is protected by Row Level Security (RLS) and encryption at rest.
                                        </p>
                                        <p>
                                            <strong>Usage Data:</strong> We collect non-identifiable usage patterns, such as features used, time spent, and engagement with new designs. This data helps us prioritize improvements and ensure the tool remains intuitive.
                                        </p>
                                        <p>
                                            <strong>AI Quality Logs:</strong> To prevent "hallucinations" and improve accuracy, we log certain AI interactions (prompts and responses). However, all personal identifiers (such as email addresses and phone numbers) are programmatically redacted on your device before these logs ever leave your machine.
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-lg md:text-xl font-bold mb-4">
                                        2. How We Use Your Information
                                    </h3>
                                    <div className="space-y-6">
                                        <p>
                                            We use the information we collect to provide, maintain, and improve the Service. Specifically:
                                        </p>
                                        <ul className="list-none space-y-4 pl-0">
                                            <li className="flex gap-4">
                                                <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                <span><strong>To provide the Service:</strong> Enabling you to analyze jobs, track skills, and manage your career roadmap.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                <span><strong>To improve the Service:</strong> Using aggregated, anonymous data to optimize our AI prompts and UI design.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                <span><strong>To communicate:</strong> Sending account-related notifications or updates about the Service.</span>
                                            </li>
                                        </ul>
                                        <p>
                                            <strong>AI Processing:</strong> Navigator uses Google&apos;s Vertex AI and Gemini models. We operate on enterprise-tier APIs where data is <strong>never used for model training</strong>. Your resumes and job match analyses remain yours.
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-lg md:text-xl font-bold mb-4">
                                        3. Data Retention & Deletion
                                    </h3>
                                    <div className="space-y-6">
                                        <p>
                                            We retain your information for as long as your account is active or as needed to provide you the Service.
                                        </p>
                                        <p>
                                            <strong>Manual Deletion:</strong> You can delete specific resumes or data points at any time through the application interface.
                                        </p>
                                        <p>
                                            <strong>Account Deletion:</strong> If you choose to delete your account, all your personal data, resumes, and history will be cryptographically erased from our active databases. Some non-identifiable aggregate data may be retained for analytical purposes.
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-lg md:text-xl font-bold mb-4">
                                        4. Data Sharing and Disclosure
                                    </h3>
                                    <div className="space-y-6">
                                        <p>
                                            We do not sell your personal data. We only share information with third parties in the following circumstances:
                                        </p>
                                        <ul className="list-none space-y-4 pl-0">
                                            <li className="flex gap-4">
                                                <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                <span><strong>Sub-processors:</strong> Essential service providers like Supabase (Database/Auth) and Google Cloud (AI Analysis).</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                <span><strong>Legal Requirements:</strong> If required by law to comply with a subpoena or similar legal process.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-lg md:text-xl font-bold mb-4">
                                        5. International Data Transfers
                                    </h3>
                                    <div className="space-y-6">
                                        <p>
                                            Our Service is hosted in the United States. If you are accessing the Service from outside the U.S., please be aware that your information may be transferred to, stored, and processed in the U.S. where our servers are located. We use standard contractual clauses to ensure your data remains protected.
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-lg md:text-xl font-bold mb-4">
                                        6. Your Rights and Control
                                    </h3>
                                    <div className="space-y-6">
                                        <p>
                                            Depending on your location (e.g., EU/GDPR or California/CCPA), you may have specific rights regarding your data:
                                        </p>
                                        <ul className="list-none space-y-4 pl-0">
                                            <li className="flex gap-4">
                                                <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                <span><strong>Access & Export:</strong> Request a copy of your data in a portable format.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                <span><strong>Correction:</strong> Update inaccurate or incomplete information.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                <span><strong>Deletion:</strong> Request that we erase your personal data.</span>
                                            </li>
                                            <li className="flex gap-4">
                                                <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                <span><strong>Object or Restrict:</strong> Object to certain types of processing.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-lg md:text-xl font-bold mb-4">
                                        7. Contact Us
                                    </h3>
                                    <p>
                                        If you have any questions or concerns about this Privacy Policy, please contact our data protection team:
                                    </p>
                                    <div className="mt-12 p-8 rounded-[2rem] bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                                        <p className="m-0 font-bold text-emerald-600 dark:text-emerald-400">Privacy Team</p>
                                        <p className="m-0 text-neutral-500 dark:text-neutral-400">Navigator Career Tools</p>
                                        <a href="mailto:privacy@navigator.com" className="inline-block mt-4 text-2xl font-black">privacy@navigator.com</a>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-12 border-t border-neutral-100 dark:border-neutral-800 text-center">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Last Updated: February 2026
                    </p>
                </div>
            </div>
        </div>
    );
};
