import React from 'react';
import { Briefcase, Code, Zap, Sparkles, Heart } from 'lucide-react';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { Card } from '../../components/ui/Card';

const PARSING_MESSAGES = [
    { title: "Summoning achievement hunters...", subtitle: "Scouring your past for those gold-medal moments.", icon: Briefcase },
    { title: "Powering up impact engine...", subtitle: "Translating your hard work into career-defining fuel.", icon: Zap },
    { title: "Deciphering skill matrix...", subtitle: "Translating your 'can-do' attitude into 'done-that' proof.", icon: Code },
    { title: "Celebrating your altruism...", subtitle: "Ensuring your community impact gets the spotlight it deserves.", icon: Heart },
    { title: "Adding finishing sparkles...", subtitle: "Polishing every bullet point until it shines like a supernova.", icon: Sparkles }
] as const;

export const ResumeParsingScreen: React.FC = () => {
    const [parsingMessageIndex, setParsingMessageIndex] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setParsingMessageIndex((prev) => (prev + 1) % PARSING_MESSAGES.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const CurrentIcon = PARSING_MESSAGES[parsingMessageIndex].icon;

    return (
        <SharedPageLayout>
            <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12 animate-in fade-in zoom-in-95 duration-1000">
                <div className="relative group">
                    <div className="absolute inset-x-[-100px] inset-y-[-100px] bg-indigo-500/10 blur-[100px] rounded-full animate-pulse transition-all duration-1000" />

                    <div className="relative">
                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-200/50 animate-[spin_10s_linear_infinite]" />

                        <Card variant="glass" className="relative w-32 h-32 flex items-center justify-center rounded-[2.5rem] shadow-2xl border-indigo-100/50 dark:border-white/5 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CurrentIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-in zoom-in-50 fade-in duration-500" key={parsingMessageIndex} />
                        </Card>

                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-bounce" />
                    </div>
                </div>

                <div className="text-center space-y-6 max-w-md mx-auto relative px-4">
                    <div className="space-y-2">
                        <h2 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight animate-in slide-in-from-bottom-4 duration-700" key={`title-${parsingMessageIndex}`}>
                            {PARSING_MESSAGES[parsingMessageIndex].title}
                        </h2>
                        <p className="text-lg text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed animate-in slide-in-from-bottom-2 duration-700 delay-100" key={`subtitle-${parsingMessageIndex}`}>
                            {PARSING_MESSAGES[parsingMessageIndex].subtitle}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/50 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 tracking-wider">
                            Intelligence Engine Active
                        </span>
                    </div>

                    <div className="flex gap-2">
                        {PARSING_MESSAGES.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-500 ${i === parsingMessageIndex ? 'w-8 bg-indigo-500' : 'w-1.5 bg-neutral-200 dark:bg-neutral-800'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </SharedPageLayout>
    );
};

export default ResumeParsingScreen;

