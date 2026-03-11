import Link from 'next/link';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { ChevronLeft, List, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';

export default async function MangaDetail({ params }: { params: { id: string } }) {
    const { id } = params;
    
    const supabase = await createClient();
    
    // Fetch manga details
    const { data: manga, error: mangaError } = await supabase
        .from('mangas')
        .select('*')
        .eq('id', id)
        .single();
        
    if (mangaError || !manga) {
        return notFound();
    }
    
    // Fetch associated chapters ordered by chapter_number
    const { data: chapters } = await supabase
        .from('chapters')
        .select('*')
        .eq('manga_id', id)
        .order('chapter_number', { ascending: true });

    return (
        <div className="container mx-auto px-4 py-8 animate-in slide-in-from-bottom-4 duration-500 flex flex-col gap-8 mb-12">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-purple-400 transition-colors self-start bg-slate-800/50 py-2 px-4 rounded-full border border-slate-700 hover:bg-slate-800">
                <ChevronLeft size={16} className="mr-1" />
                Back to Home
            </Link>

            <div className="flex flex-col lg:flex-row gap-10 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-[2.5rem] p-8 lg:p-12 border border-slate-700/50 backdrop-blur-md shadow-2xl shadow-black/50 relative overflow-hidden">
                {/* Decorative background blur */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="w-full lg:w-1/3 max-w-[320px] shrink-0 mx-auto lg:mx-0 relative z-10">
                    <div className="aspect-[3/4] relative rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/20 border border-slate-700/50 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                        <img
                            src={manga.cover_url}
                            alt={manga.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center relative z-10">
                    <span className="inline-block px-5 py-1.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black tracking-widest uppercase mb-5 self-start border border-purple-500/30">
                        {manga.category}
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 leading-tight">
                        {manga.title}
                    </h1>
                    <h2 className="text-lg font-bold text-slate-300 mb-3 flex items-center gap-2">
                        Synopsis
                    </h2>
                    <p className="text-slate-400 leading-relaxed max-w-3xl mb-10 text-lg">
                        {manga.story}
                    </p>

                    <div className="flex gap-4 mt-auto">
                        {chapters && chapters.length > 0 ? (
                            <Link
                                href={`/manga/${id}/chapter/${chapters[0].id}`}
                                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-10 rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(147,51,234,0.5)] flex items-center gap-2"
                            >
                                Read First Chapter
                            </Link>
                        ) : (
                            <button
                                disabled
                                className="bg-slate-700 text-slate-400 font-bold py-4 px-10 rounded-full cursor-not-allowed flex items-center gap-2"
                            >
                                No Chapters Yet
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 max-w-5xl">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-800/50">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <List className="text-purple-400" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold">Chapters <span className="text-slate-500 font-normal">({chapters?.length || 0})</span></h2>
                </div>

                <div className="grid gap-4">
                    {chapters && chapters.map((chapter) => (
                        <Link
                            key={chapter.id}
                            href={`/manga/${id}/chapter/${chapter.id}`}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-3xl bg-slate-800/40 border border-slate-700/40 hover:bg-slate-800 hover:border-purple-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/5 relative overflow-hidden"
                        >
                            {/* Highlight effect on hover */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-center" />

                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-xl text-slate-300 border border-slate-800 group-hover:bg-purple-500/10 group-hover:text-purple-400 group-hover:border-purple-500/30 transition-colors shadow-inner">
                                    {chapter.chapter_number}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">
                                        Chapter {chapter.chapter_number}{chapter.title ? <span className="text-slate-400 font-medium"> : {chapter.title}</span> : ''}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2 text-sm font-medium text-slate-500">
                                        <Calendar size={14} />
                                        <span>{new Date(chapter.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center text-sm font-bold text-purple-400 bg-purple-500/10 px-6 py-3 rounded-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all">
                                Read Chapter
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
