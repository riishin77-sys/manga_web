import Link from 'next/link';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { ChevronLeft, Info, List, ServerCrash } from 'lucide-react';
import ChapterViewer from '@/components/ChapterViewer';
import { supabase } from '@/lib/supabase';
import { getDriveImages } from '@/lib/drive';

export default async function ChapterPage({ params }: { params: { id: string, chapterId: string } }) {
    const { id, chapterId } = params;

    const { data: chapter, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', chapterId)
        .single();

    // Fetch all chapters for this manga to determine next/prev
    const { data: allChapters } = await supabase
        .from('chapters')
        .select('id, chapter_number')
        .eq('manga_id', id)
        .order('chapter_number', { ascending: true });

    let prevChapterId = null;
    let nextChapterId = null;

    if (allChapters && chapter) {
        const currentIndex = allChapters.findIndex(c => c.id === chapter.id);
        if (currentIndex > 0) {
            prevChapterId = allChapters[currentIndex - 1].id;
        }
        if (currentIndex < allChapters.length - 1) {
            nextChapterId = allChapters[currentIndex + 1].id;
        }
    }

    let images: string[] = [];
    let fetchError = null;

    if (chapter && chapter.drive_folder_id) {
        try {
            images = await getDriveImages(chapter.drive_folder_id);
        } catch (e: any) {
            fetchError = e.message;
        }
    } else {
        fetchError = error ? `Chapter not found: ${error.message}` : "No associated Google Drive Folder ID found for this chapter.";
    }

    return (
        <div className="bg-slate-950 min-h-screen animate-in fade-in duration-700">
            {/* Top Navigation Bar for Reading Mode */}
            <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 px-4 py-3 flex items-center justify-between shadow-2xl shadow-black/50 transition-transform duration-300">
                <Link href={`/manga/${id}`} className="group flex items-center text-sm font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800">
                    <ChevronLeft size={18} className="mr-1 text-purple-500 group-hover:-translate-x-1 transition-transform" />
                    Back to Manga
                </Link>
                <div className="font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400 tracking-wider hidden md:block">
                    CHAPTER <span className="text-purple-400">{chapter?.chapter_number || '??'}</span>
                </div>
                <div className="flex items-center gap-2">
                    {prevChapterId ? (
                        <Link href={`/manga/${id}/chapter/${prevChapterId}`} className="p-2.5 text-slate-400 hover:text-purple-400 bg-slate-900 rounded-xl border border-slate-800 hover:border-purple-500/30 transition-all hover:bg-slate-800" title="Previous Chapter">
                            <ChevronLeft size={20} />
                        </Link>
                    ) : (
                        <button disabled className="p-2.5 text-slate-600 bg-slate-900/50 rounded-xl border border-slate-800/50 cursor-not-allowed">
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    
                    <Link href={`/manga/${id}`} className="p-2.5 text-slate-400 hover:text-purple-400 bg-slate-900 rounded-xl border border-slate-800 hover:border-purple-500/30 transition-all hover:bg-slate-800" title="Chapter List">
                        <List size={20} />
                    </Link>

                    {nextChapterId ? (
                        <Link href={`/manga/${id}/chapter/${nextChapterId}`} className="p-2.5 text-slate-400 hover:text-purple-400 bg-slate-900 rounded-xl border border-slate-800 hover:border-purple-500/30 transition-all hover:bg-slate-800" title="Next Chapter">
                            <ChevronLeft size={20} className="rotate-180" />
                        </Link>
                    ) : (
                        <button disabled className="p-2.5 text-slate-600 bg-slate-900/50 rounded-xl border border-slate-800/50 cursor-not-allowed">
                            <ChevronLeft size={20} className="rotate-180" />
                        </button>
                    )}
                </div>
            </div>

            {fetchError || images.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 px-4 text-center">
                    <ServerCrash size={48} className="text-slate-600 mb-4" />
                    <h2 className="text-xl font-bold text-slate-300 mb-2">Unable to Load Images</h2>
                    <p className="max-w-md">{fetchError || "No images found in this Google Drive folder."}</p>
                </div>
            ) : (
                <div className="pb-24">
                    <ChapterViewer images={images} />
                    
                    {/* Bottom Navigation */}
                    <div className="max-w-3xl mx-auto px-4 mt-12 flex items-center justify-between gap-4">
                        {prevChapterId ? (
                            <Link href={`/manga/${id}/chapter/${prevChapterId}`} className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all">
                                <ChevronLeft size={20} /> Previous
                            </Link>
                        ) : (
                            <button disabled className="flex-1 flex items-center justify-center gap-2 bg-slate-900/50 text-slate-600 font-bold py-4 px-6 rounded-2xl border border-slate-800/50 cursor-not-allowed">
                                <ChevronLeft size={20} /> Previous
                            </button>
                        )}

                        {nextChapterId ? (
                            <Link href={`/manga/${id}/chapter/${nextChapterId}`} className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-purple-900/20">
                                Next <ChevronLeft size={20} className="rotate-180" />
                            </Link>
                        ) : (
                            <button disabled className="flex-1 flex items-center justify-center gap-2 bg-slate-900/50 text-slate-600 font-bold py-4 px-6 rounded-2xl border border-slate-800/50 cursor-not-allowed">
                                Next <ChevronLeft size={20} className="rotate-180" />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


