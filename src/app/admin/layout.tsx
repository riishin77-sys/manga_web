import Link from 'next/link';
import { PlusCircle, List, LayoutDashboard } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl animate-in fade-in duration-500 mb-20 flex flex-col gap-8">
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div>
                    <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                        <LayoutDashboard className="text-purple-500" size={32} />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 tracking-tight">
                            Admin Dashboard
                        </span>
                    </h1>
                    <p className="text-slate-400 font-medium">Manage your manga catalog, chapters, and content links.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
                    <Link href="/admin/add" className="flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold bg-slate-900/80 border border-slate-800 hover:bg-purple-600 hover:border-purple-500 hover:text-white transition-all text-slate-400 group">
                        <PlusCircle size={20} className="group-hover:scale-110 transition-transform" />
                        Add Manga
                    </Link>
                    <Link href="/admin/chapters" className="flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold bg-slate-900/80 border border-slate-800 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white transition-all text-slate-400 group">
                        <PlusCircle size={20} className="group-hover:scale-110 transition-transform" />
                        Add Chapter
                    </Link>
                    <Link href="/admin/manage" className="flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold bg-slate-900/80 border border-slate-800 hover:bg-purple-600 hover:border-purple-500 hover:text-white transition-all text-slate-400 group">
                        <List size={20} className="group-hover:scale-110 transition-transform" />
                        Manage Catalog
                    </Link>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-[2rem] p-6 lg:p-10 shadow-2xl relative overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
}
