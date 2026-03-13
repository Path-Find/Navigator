
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export const ComparisonTable = () => {
    const features = [
        { name: 'Monthly Cost', nav: '$19', jobscan: '$49.95', teal: '$29', rezi: '$29' },
        { name: 'Unlimited Analyses', nav: true, jobscan: false, teal: false, rezi: false },
        { name: 'Auto-save from Email', nav: true, jobscan: false, teal: true, rezi: false },
        { name: 'Daily Job Alerts', nav: true, jobscan: true, teal: true, rezi: false },
        { name: 'Career Coach AI', nav: true, jobscan: false, teal: true, rezi: false },
        { name: 'Skills Audit & Gap Analysis', nav: true, jobscan: true, teal: true, rezi: true },
        { name: 'Skill Verification Interviews', nav: true, jobscan: false, teal: false, rezi: false },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-24 mt-16 max-w-5xl mx-auto px-4"
        >
            <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-neutral-900 dark:text-white mb-4 tracking-tight">Why pay more for less?</h2>
                <p className="text-neutral-500 font-medium">See how Navigator stacks up against the competition.</p>
            </div>

            <div className="overflow-hidden rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl shadow-2xl shadow-neutral-900/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20">
                                <th className="p-6 text-[10px] font-black text-neutral-400 tracking-[0.2em]">Feature</th>
                                <th className="p-6 text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10 tracking-[0.2em]">Navigator Plus</th>
                                <th className="p-6 text-[10px] font-black text-neutral-900 dark:text-white tracking-[0.2em]">Jobscan</th>
                                <th className="p-6 text-[10px] font-black text-neutral-900 dark:text-white tracking-[0.2em]">Teal</th>
                                <th className="p-6 text-[10px] font-black text-neutral-900 dark:text-white tracking-[0.2em]">Rezi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                            {features.map((feature, idx) => (
                                <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                                    <td className="p-6 text-sm font-bold text-neutral-700 dark:text-neutral-300">{feature.name}</td>
                                    <td className="p-6 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-900/10">
                                        {typeof feature.nav === 'boolean' ? (
                                            feature.nav ? <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> : <span className="text-neutral-300">-</span>
                                        ) : feature.nav}
                                    </td>
                                    <td className="p-6 text-sm text-neutral-600 dark:text-neutral-400">
                                        {typeof feature.jobscan === 'boolean' ? (
                                            feature.jobscan ? <Check className="w-5 h-5 text-emerald-500" /> : <div className="text-neutral-300"><span className="sr-only">Not Included</span>&times;</div>
                                        ) : feature.jobscan}
                                    </td>
                                    <td className="p-6 text-sm text-neutral-600 dark:text-neutral-400">
                                        {typeof feature.teal === 'boolean' ? (
                                            feature.teal ? <Check className="w-5 h-5 text-emerald-500" /> : <div className="text-neutral-300"><span className="sr-only">Not Included</span>&times;</div>
                                        ) : feature.teal}
                                    </td>
                                    <td className="p-6 text-sm text-neutral-600 dark:text-neutral-400">
                                        {typeof feature.rezi === 'boolean' ? (
                                            feature.rezi ? <Check className="w-5 h-5 text-emerald-500" /> : <div className="text-neutral-300"><span className="sr-only">Not Included</span>&times;</div>
                                        ) : feature.rezi}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};
