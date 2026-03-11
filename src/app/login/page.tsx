'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const toastId = toast.loading('Authenticating...');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setIsLoading(false);
                toast.error(error.message || 'Authentication failed', { id: toastId });
            } else if (data.user) {
                toast.success('Welcome back, Admin!', { id: toastId });
                router.push('/admin');
                router.refresh(); // Important for middleware to recognize the new cookie instantly
            }
        } catch (err: any) {
            setIsLoading(false);
            console.error("Login Exception:", err);
            toast.error(err.message || String(err) || 'An unexpected error occurred', { id: toastId });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 relative z-10 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/20 shadow-[0_0_30px_-5px_rgba(147,51,234,0.3)]">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Admin Gateway</h1>
                    <p className="text-slate-400 font-medium">Enter your credentials to access the dashboard.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-600 font-medium"
                                placeholder="admin@mangastream.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-600 font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        disabled={isLoading}
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2 border border-purple-500 shadow-[0_0_30px_-10px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:cursor-not-allowed group mt-4"
                    >
                        {isLoading ? 'Authenticating...' : (
                            <>
                                Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
