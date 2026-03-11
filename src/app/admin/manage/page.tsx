'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Edit2, Trash2, Library, AlertTriangle, List } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ManageMangaPage() {
    const [mangas, setMangas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [mangaToDelete, setMangaToDelete] = useState<any | null>(null);

    useEffect(() => {
        const fetchMangas = async () => {
            setIsLoading(true); // Keep isLoading true at the start of fetch
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('Unauthorized');
                setIsLoading(false); // Ensure loading state is reset even if unauthorized
                return;
            }

            const { data, error } = await supabase
                .from('mangas')
                .select(`
                    *,
                    chapters (count)
                `)
                .order('created_at', { ascending: false });

            if (data) {
                // Supabase returns count as an array with one object { count: number } or just the count depending on the query shape.
                // We'll normalize it here.
                const normalizedData = data.map((manga: any) => ({
                    ...manga,
                    chapterCount: manga.chapters?.[0]?.count || 0
                }));
                setMangas(normalizedData);
            }
            if (error) {
                toast.error('Failed to load catalog');
                console.error(error);
            }
            setIsLoading(false);
        };
        fetchMangas();
    }, []);

    const confirmDelete = (manga: any) => {
        setMangaToDelete(manga);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!mangaToDelete) return;

        setDeleteModalOpen(false);
        const toastId = toast.loading('Deleting manga and associated resources...');

        try {
            // If the manga has an associated Google Drive folder, delete it first
            if (mangaToDelete.drive_folder_id) {
                toast.loading('Deleting files from Google Drive...', { id: toastId });
                const driveRes = await fetch(`/api/drive/delete/${mangaToDelete.drive_folder_id}`, {
                    method: 'DELETE'
                });
                
                if (!driveRes.ok) {
                    const errorData = await driveRes.json();
                    console.error('Google Drive Delete Error:', errorData);
                    throw new Error(`Failed to delete Google Drive files: ${errorData.error || 'Unknown error'}. Database record kept safe.`);
                }
            }

            toast.loading('Deleting from database...', { id: toastId });
            
            // Due to CASCADE delete on foreign key in Postgres, deleting manga deletes its chapters automatically
            const { error } = await supabase
                .from('mangas')
                .delete()
                .eq('id', mangaToDelete.id);

            if (error) {
                throw error;
            }

            toast.success('Manga deleted successfully.', { id: toastId });
            setMangas(prev => prev.filter(m => m.id !== mangaToDelete.id));

        } catch (error: any) {
             toast.error(`Delete failed: ${error.message}`, { id: toastId });
        } finally {
            setMangaToDelete(null);
        }
    };

    return (
        <div className="animate-in fade-in zoom-in-95 duration-500 relative z-10">
            <h2 className="text-2xl font-bold mb-6 pb-4 border-b border-slate-800 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <Library size={22} className="text-emerald-500" />
                </div>
                Manage Catalog
            </h2>

            {isLoading ? (
                <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin mb-4" />
                    Loading catalog...
                </div>
            ) : mangas.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-slate-950/30 rounded-3xl border border-slate-800/50 backdrop-blur-sm">
                    No manga found. Go add some!
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400 text-sm">
                                <th className="pb-3 px-4 font-bold">Cover & Title</th>
                                <th className="pb-3 px-4 font-bold">Categories</th>
                                <th className="pb-3 px-4 font-bold text-center">Chapters</th>
                                <th className="pb-3 px-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {mangas.map(manga => (
                                <tr key={manga.id} className="hover:bg-slate-800/20 transition-colors group">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-16 rounded-lg overflow-hidden border border-slate-700 shadow-lg bg-slate-900 shrink-0">
                                                <img src={manga.cover_url} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x150/1e293b/475569?text=X')} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-base group-hover:text-emerald-400 transition-colors">{manga.title}</div>
                                                <div className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-[200px]">{manga.story}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 align-top">
                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                            {manga.category?.split(',').map((cat: string) => (
                                                <span key={cat} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                                    {cat.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 align-top text-center">
                                        <div className="inline-flex px-3 py-1 rounded-lg bg-slate-950/50 border border-slate-800 font-mono text-slate-300 shadow-inner">
                                            {manga.chapters?.[0]?.count || 0}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 align-top text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/manage/${manga.id}/chapters`} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all border border-transparent hover:border-blue-500/30" title="Manage Chapters">
                                                <List size={18} />
                                            </Link>
                                            <Link href={`/admin/edit/${manga.id}`} className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all border border-transparent hover:border-emerald-500/30" title="Edit">
                                                <Edit2 size={18} />
                                            </Link>
                                            <button onClick={() => confirmDelete(manga)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/30" title="Delete">
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
            {deleteModalOpen && mangaToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6 border border-red-500/20">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Delete Manga?</h3>
                        <p className="text-slate-400 mb-8">
                            Are you sure you want to delete <strong className="text-slate-200">"{mangaToDelete.title}"</strong>? This will permanently erase all data and associated chapters.
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
