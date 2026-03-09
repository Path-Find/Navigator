import React from 'react';
import { Scale, CheckCircle2, ShieldAlert, FileText, Ban, AlertTriangle } from 'lucide-react';

export const Terms: React.FC = () => {

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
            id: 'agreement',
            icon: CheckCircle2,
            title: 'Simple Agreement',
            description: "By using Navigator, you agree to these fair rules. If you don't agree, please don't use the service.",
            colors: {
                bg: 'bg-indigo-50/50 dark:bg-indigo-500/5',
                text: 'text-indigo-600 dark:text-indigo-400',
                accent: 'border-indigo-500/10 dark:border-indigo-500/20',
                iconBg: 'bg-indigo-600',
            },
            colSpan: 'md:col-span-1'
        },
        {
            id: 'ai-disclaimer',
            icon: AlertTriangle,
            title: 'Verify AI Output',
            description: "AI is powerful but not perfect. Always double-check career advice and resume edits before applying.",
            colors: {
                bg: 'bg-amber-50/50 dark:bg-amber-500/5',
                text: 'text-amber-600 dark:text-amber-400',
                accent: 'border-amber-500/10 dark:border-amber-500/20',
                iconBg: 'bg-amber-600',
            },
            colSpan: 'md:col-span-1'
        },
        {
            id: 'ownership',
            icon: FileText,
            title: 'Your Data, Your Rights',
            description: "You own every resume and transcript you upload. We just provide the tools to make them better.",
            colors: {
                bg: 'bg-emerald-50/50 dark:bg-emerald-500/5',
                text: 'text-emerald-600 dark:text-emerald-400',
                accent: 'border-emerald-500/10 dark:border-emerald-500/20',
                iconBg: 'bg-emerald-600',
            },
            colSpan: 'md:col-span-1'
        },
        {
            id: 'no-abuse',
            icon: Ban,
            title: 'No Reverse Engineering',
            description: "Please don't try to break, scrape, or reverse-engineer our AI models or platform code.",
            colors: {
                bg: 'bg-rose-50/50 dark:bg-rose-500/5',
                text: 'text-rose-600 dark:text-rose-400',
                accent: 'border-rose-500/10 dark:border-rose-500/20',
                iconBg: 'bg-rose-600',
            },
            colSpan: 'md:col-span-1'
        },
        {
            id: 'termination',
            icon: ShieldAlert,
            title: 'Fair Usage',
            description: "We reserve the right to end service for accounts that abuse the platform or violate these terms.",
            colors: {
                bg: 'bg-violet-50/50 dark:bg-violet-500/5',
                text: 'text-violet-600 dark:text-violet-400',
                accent: 'border-violet-500/10 dark:border-violet-500/20',
                iconBg: 'bg-violet-600',
            },
            colSpan: 'md:col-span-1'
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white pt-24 pb-20">
            <div className="max-w-5xl mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-6">
                        <Scale className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                        Terms of <span className="text-indigo-600 dark:text-indigo-400">Service</span>
                    </h1>
                    <p className="text-xl text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        By using Navigator, you agree to these terms. We keep them simple and fair because we believe in transparency.
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

                {/* Terms of Service Content */}
                <div className="relative max-w-3xl mx-auto">
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-neutral-400 dark:text-neutral-500 mb-4 uppercase tracking-widest text-center md:text-left">
                            Effective Date: February 17, 2026
                        </p>

                        <div className="prose prose-neutral dark:prose-invert prose-lg md:prose-xl prose-headings:font-black prose-headings:tracking-tight prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline">
                            <div className="space-y-20 mt-12 [&>section>p]:leading-relaxed">
                                <section>
                                    <h3 className="text-lg md:text-xl font-bold mb-4">
                                        1. Acceptance of Terms
                                    </h3>
                                    <p>
                                        By accessing or using Navigator, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, then you may not access the service.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-lg md:text-xl font-bold mb-4">
                                        2. Description of Service
                                    </h3>
                                    <p>
                                        Navigator provides AI-powered tools for career management, including resume analysis, job matching, and skill gap identification. The service is provided "as is" and "as available."
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-lg md:text-xl font-bold mb-4">
                                        3. User Accounts
                                    </h3>
                                    <p>
                                        You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately of any unauthorized use of your account.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-lg md:text-xl font-bold mb-4">
                                        4. User Content
                                    </h3>
                                    <p>
                                        You retain all rights to the resumes, transcripts, and other content you upload. By using the service, you grant Navigator a limited license to process this content solely for the purpose of providing the service to you.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-lg md:text-xl font-bold mb-4">
                                        5. Acceptable Use
                                    </h3>
                                    <p>
                                        You agree not to use the service for any unlawful purposes or to conduct any activity that would disrupt the service for other users. This includes attempts to reverse-engineer our AI models or bypass service limits.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-lg md:text-xl font-bold mb-4">
                                        6. Intellectual Property
                                    </h3>
                                    <p>
                                        The Navigator application, including its design, code, and brand elements, is the property of Navigator and is protected by copyright and other intellectual property laws.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-lg md:text-xl font-bold mb-4">
                                        7. AI Disclaimer
                                    </h3>
                                    <p>
                                        Navigator uses advanced AI models to provide insights. While we strive for accuracy, AI can occasionally generate incorrect or biased information. You are responsible for reviewing and verifying any career advice or analysis provided by the service.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-lg md:text-xl font-bold mb-4">
                                        8. Limitation of Liability
                                    </h3>
                                    <p>
                                        Navigator shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the service or any career outcomes related to the service.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-lg md:text-xl font-bold mb-4">
                                        9. Termination
                                    </h3>
                                    <p>
                                        We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms of Service.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-lg md:text-xl font-bold mb-4">
                                        10. Contact
                                    </h3>
                                    <p>
                                        Questions about the Terms of Service should be sent to:
                                    </p>
                                    <div className="mt-12 p-8 rounded-[2rem] bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                                        <p className="m-0 font-bold text-indigo-600 dark:text-indigo-400">Legal Team</p>
                                        <p className="m-0 text-neutral-500 dark:text-neutral-400">Navigator Career Tools</p>
                                        <a href="mailto:legal@navigator.com" className="inline-block mt-4 text-2xl font-black">legal@navigator.com</a>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
