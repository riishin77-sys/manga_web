import Link from 'next/link';
import { Search, Flame, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-900/70 backdrop-blur-xl transition-all">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 hover:opacity-80 transition-opacity">
                    <Flame size={28} className="text-purple-500" />
                    MangaStream
                </Link>

                <div className="flex-1 max-w-xl mx-8 hidden md:block">
                    <form action="/" className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                        <input
                            type="text"
                            name="q"
                            placeholder="Search manga, authors, or genres..."
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-2.5 pl-12 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 focus:bg-slate-800 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-500"
                        />
                    </form>
                </div>

                <div className="flex items-center gap-6">
                    <Link href="/admin" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-semibold hover:bg-white/5 px-3 py-2 rounded-lg">
                        <LayoutDashboard size={18} />
                        <span className="hidden sm:inline">Admin</span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
