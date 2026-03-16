import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle, ArrowRight, User, AtSign, Building } from 'lucide-react';

export const Contact: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        setTimeout(() => setStatus('success'), 1500);
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-white dark:bg-black pt-24 pb-20 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-500">
                    <div className="mx-auto w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/10">
                        <CheckCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-neutral-900 dark:text-white">Message Received</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                        Thanks for reaching out! Our team will get back to you within 24 hours.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black font-bold rounded-2xl hover:scale-105 transition-all shadow-xl"
                    >
                        Back Home <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white pt-24 pb-20">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Left Side: Content */}
                    <div className="space-y-8">
                        <div>
                            <div className="inline-flex items-center justify-center p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-6">
                                <MessageSquare className="w-8 h-8" />
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
                                Get in <span className="text-indigo-600 dark:text-indigo-400">Touch</span>
                            </h1>
                            <p className="text-xl text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                                Have questions about Navigator Pro, enterprise licensing, or just want to share feedback? We're here to help you scale your career.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                                <div className="p-2 bg-white dark:bg-neutral-800 rounded-xl shadow-sm">
                                    <Mail className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900 dark:text-white">Email Us</h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">support@navigator.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                                <div className="p-2 bg-white dark:bg-neutral-800 rounded-xl shadow-sm">
                                    <AtSign className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900 dark:text-white">Social</h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">@navigator_ai on X & LinkedIn</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-[3rem]" />
                        <form
                            onSubmit={handleSubmit}
                            className="relative bg-white dark:bg-neutral-900 p-8 md:p-10 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-6"
                        >
                            <div className="space-y-4">
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Full Name"
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-sm font-bold"
                                    />
                                </div>

                                <div className="relative">
                                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="Email Address"
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-sm font-bold"
                                    />
                                </div>

                                <div className="relative">
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <input
                                        type="text"
                                        placeholder="Company (Optional)"
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-sm font-bold"
                                    />
                                </div>

                                <textarea
                                    required
                                    placeholder="Tell us how we can help..."
                                    rows={4}
                                    className="w-full px-6 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all text-sm font-bold resize-none"
                                />
                            </div>

                            <button
                                disabled={status === 'sending'}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 group transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {status === 'sending' ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Send Message <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
