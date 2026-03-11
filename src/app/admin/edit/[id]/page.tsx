'use client';

import { useState, useEffect, use } from 'react';
import { Save, Image as ImageIcon, Tags, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Link from 'next/link';

const AVAILABLE_CATEGORIES = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
    'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Thriller'
];

export default function EditMangaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Form states
    const [title, setTitle] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [coverUrl, setCoverUrl] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [mangaFolderId, setMangaFolderId] = useState('');
    const [story, setStory] = useState('');

    useEffect(() => {
        const fetchManga = async () => {
            const { data, error } = await supabase
                .from('mangas')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                setTitle(data.title);
                setCoverUrl(data.cover_url || '');
                setMangaFolderId(data.drive_folder_id || '');
                setStory(data.story || '');
                if (data.category) {
                    setSelectedCategories(data.category.split(',').map((c: string) => c.trim()));
                }
            } else if (error) {
                toast.error('Failed to load manga details.');
            }
            setIsFetching(false);
        };
        fetchManga();
    }, [id]);

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleUpdateManga = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedCategories.length === 0) {
            toast.error('Please select at least one category');
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading('Updating manga...');

        try {
            let finalCoverUrl = coverUrl;

            // If user selected a new cover file, upload it!
            if (coverFile && mangaFolderId) {
                toast.loading('Uploading new cover image...', { id: toastId });
                const formData = new FormData();
                formData.append('file', coverFile);
                formData.append('mangaFolderId', mangaFolderId);

                const uploadRes = await fetch('/api/upload/cover/edit', {
                    method: 'POST',
                    body: formData,
                });

                const uploadData = await uploadRes.json();
                if (!uploadRes.ok || !uploadData.success) {
                    throw new Error(uploadData.error || 'Failed to upload new cover image');
                }

                finalCoverUrl = uploadData.url;
            }

            toast.loading('Saving changes to database...', { id: toastId });
            const { error } = await supabase
                .from('mangas')
                .update({
                    title: title,
                    category: selectedCategories.join(', '),
                    cover_url: finalCoverUrl,
                    story: story
                })
                .eq('id', id);

            if (error) throw error;
            
            setCoverUrl(finalCoverUrl);
            setCoverFile(null);
            toast.success('Manga updated successfully!', { id: toastId });
            
        } catch (error: any) {
            toast.error(`Failed to update: ${error.message}`, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 rounded-full border-4 border-slate-800 border-t-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <form onSubmit={handleUpdateManga} className="space-y-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-800">
                <Link href="/admin/manage" className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-xl">
                        <ImageIcon size={22} className="text-purple-500" />
                    </div>
                    Edit Manga
                </h2>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Manga Title</label>
                    <input
                        required
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-600 font-medium"
                        placeholder="Ex: Solo Leveling"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                        <Tags size={16} />
                        Categories
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {AVAILABLE_CATEGORIES.map(category => (
                            <button
                                key={category}
                                type="button"
                                onClick={() => toggleCategory(category)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${selectedCategories.includes(category)
                                        ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_-3px_rgba(147,51,234,0.5)]'
                                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-purple-500/50 hover:text-purple-300'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Cover Image URL (or upload a new one)</label>
                    <input
                        required={!coverFile && !coverUrl}
                        type="url"
                        value={coverUrl}
                        onChange={(e) => setCoverUrl(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-600 font-medium mb-3"
                        placeholder="https://example.com/cover.jpg"
                    />
                    
                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold border border-slate-700 transition-colors text-sm">
                            Upload New Cover
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setCoverFile(e.target.files[0]);
                                    }
                                }}
                            />
                        </label>
                        {coverFile && <span className="text-purple-400 text-sm font-medium animate-pulse">New file selected: {coverFile.name}</span>}
                    </div>

                    {(coverUrl || coverFile) && (
                        <div className="mt-4 w-32 h-44 rounded-xl overflow-hidden border border-slate-700 shadow-xl relative group">
                            <img 
                                src={coverFile ? URL.createObjectURL(coverFile) : coverUrl} 
                                alt="Cover Preview" 
                                className="w-full h-full object-cover" 
                                onError={(e) => (e.currentTarget.src = 'https://placehold.co/200x300/1e293b/475569?text=Invalid+Image')} 
                            />
                            {coverFile && (
                                <div className="absolute inset-0 bg-purple-500/20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded">New</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Synopsis / Story</label>
                    <textarea
                        required
                        rows={6}
                        value={story}
                        onChange={(e) => setStory(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-600 resize-none font-medium leading-relaxed"
                        placeholder="Brief summary of the story..."
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex gap-4">
                <Link href="/admin/manage" className="px-8 py-4 rounded-2xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors text-center w-full max-w-xs">
                    Cancel
                </Link>
                <button
                    disabled={isLoading}
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2 border border-purple-500 shadow-[0_0_30px_-10px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_40px_-5px_rgba(147,51,234,0.6)]"
                >
                    {isLoading ? 'Saving Changes...' : (
                        <>
                            <Save size={20} /> Update Manga
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
