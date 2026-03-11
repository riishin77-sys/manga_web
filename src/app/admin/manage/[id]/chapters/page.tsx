'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, ArrowLeft, AlertTriangle, List } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ManageChaptersPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: mangaId } = use(params);
    const [chapters, setChapters] = useState<any[]>([]);
    const [mangaTitle, setMangaTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [chapterToDelete, setChapterToDelete] = useState<any | null>(null);

    useEffect(() => {
        const fetchChapters = async () => {
            setIsLoading(true);

            // Fetch Manga Title
            const { data: mangaData } = await supabase
                .from('mangas')
                .select('title')
                .eq('id', mangaId)
                .single();
            
            if (mangaData) {
                setMangaTitle(mangaData.title);
            }

            // Fetch Chapters
            const { data, error } = await supabase
                .from('chapters')
                .select('*')
                .eq('manga_id', mangaId)
                .order('chapter_number', { ascending: false });

            if (data) {
                setChapters(data);
            }
            if (error) {
                toast.error('Failed to load chapters');
            }
            setIsLoading(false);
        };
        fetchChapters();
    }, [mangaId]);

    const confirmDelete = (chapter: any) => {
        setChapterToDelete(chapter);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!chapterToDelete) return;

        setDeleteModalOpen(false);
        const toastId = toast.loading('Deleting chapter and associated Google Drive files...');

        try {
            // Delete folder from Google Drive first
            if (chapterToDelete.drive_folder_id) {
                toast.loading('Deleting files from Google Drive...', { id: toastId });
                const driveRes = await fetch(`/api/drive/delete/${chapterToDelete.drive_folder_id}`, {
                    method: 'DELETE'
                });
                
                if (!driveRes.ok) {
                    const errorData = await driveRes.json();
                    throw new Error(`Failed to delete Google Drive files: ${errorData.error || 'Unknown error'}. Database record kept safe.`);
                }
            }

            toast.loading('Deleting from database...', { id: toastId });
            
            // Delete from Supabase Database
            const { error } = await supabase
                .from('chapters')
                .delete()
                .eq('id', chapterToDelete.id);

            if (error) {
                throw error;
            }

            toast.success(`Chapter ${chapterToDelete.chapter_number} deleted successfully.`, { id: toastId });
            setChapters(prev => prev.filter(c => c.id !== chapterToDelete.id));

        } catch (error: any) {
             toast.error(`Delete failed: ${error.message}`, { id: toastId });
        } finally {
            setChapterToDelete(null);
        }
    };

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 relative z-10">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-800">
                <Link href="/admin/manage" className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl">
                        <List size={22} className="text-blue-500" />
                    </div>
                    Manage Chapters {mangaTitle ? `for "${mangaTitle}"` : ''}
                </h2>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin mb-4" />
                    Loading chapters...
                </div>
            ) : chapters.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-slate-950/30 rounded-3xl border border-slate-800/50 backdrop-blur-sm">
                    No chapters found for this manga.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400 text-sm">
                                <th className="pb-3 px-4 font-bold">Chapter Number</th>
                                <th className="pb-3 px-4 font-bold">Title (Optional)</th>
                                <th className="pb-3 px-4 font-bold text-center">Drive Folder ID</th>
                                <th className="pb-3 px-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {chapters.map(chapter => (
                                <tr key={chapter.id} className="hover:bg-slate-800/20 transition-colors group">
                                    <td className="py-4 px-4 font-bold text-white text-lg">
                                        Chapter {chapter.chapter_number}
                                    </td>
                                    <td className="py-4 px-4 text-slate-400 font-medium">
                                        {chapter.title || <span className="text-slate-600 italic">No Title</span>}
                                    </td>
                                    <td className="py-4 px-4 align-top text-center">
                                        <div className="inline-flex px-3 py-1 rounded-lg bg-slate-950/50 border border-slate-800 font-mono text-slate-500 shadow-inner text-xs">
                                            {chapter.drive_folder_id || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 align-top text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => confirmDelete(chapter)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/30" title="Delete Chapter">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && chapterToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Delete Chapter {chapterToDelete.chapter_number}?</h3>
                        <p className="text-slate-400 mb-8">
                            Are you sure you want to delete <strong className="text-slate-200">Chapter {chapterToDelete.chapter_number}</strong>? This will permanently erase the chapter details and all images in Google Drive.
                        </p>
                        <div className="flex gap-4 w-full">
                            <button onClick={() => setDeleteModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleDelete} className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/25">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
