'use client';

import { useState } from 'react';
import { PlusCircle, Image as ImageIcon, Tags } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const AVAILABLE_CATEGORIES = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
    'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Thriller'
];

export default function AddMangaPage() {
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [title, setTitle] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string>('');
    const [story, setStory] = useState('');

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleAddManga = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedCategories.length === 0) {
            toast.error('Please select at least one category');
            return;
        }

        if (!coverFile) {
            toast.error('Please select a cover image');
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading('Uploading Cover...');

        try {
            // 1. Upload the image to Google Drive
            const formData = new FormData();
            formData.append('file', coverFile);
            formData.append('title', title);

            const uploadRes = await fetch('/api/upload/cover', {
                method: 'POST',
                body: formData
            });

            const uploadData = await uploadRes.json();

            if (!uploadRes.ok || !uploadData.success) {
                throw new Error(uploadData.error || 'Failed to upload cover');
            }

            const finalCoverUrl = uploadData.url;
            const mangaFolderId = uploadData.mangaFolderId;
            toast.loading('Saving Manga to Database...', { id: toastId });

            // 2. Save Manga Data into Supabase
            const { error: sbError } = await supabase
                .from('mangas')
                .insert([
                    {
                        title: title,
                        category: selectedCategories.join(', '),
                        cover_url: finalCoverUrl,
                        story: story,
                        drive_folder_id: mangaFolderId
                    }
                ]);

            if (sbError) {
                throw sbError;
            }

            // Success
            toast.success('Manga added successfully!', { id: toastId });

            // Clean up UI manually since page doesn't unmount
            setTitle('');
            setSelectedCategories([]);
            setCoverFile(null);
            setCoverPreview('');
            setStory('');

        } catch (err: any) {
            toast.error(`Error: ${err.message}`, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleAddManga} className="space-y-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-800">
                <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 shadow-[0_0_20px_-5px_rgba(147,51,234,0.3)]">
                    <ImageIcon size={28} className="text-purple-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Add New Manga</h2>
                    <p className="text-slate-400 font-medium text-sm">Create a new entry in your database catalog.</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Manga Title</label>
                    <input
                        required
                        disabled={isLoading}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-600 font-medium disabled:opacity-50"
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
                                disabled={isLoading}
                                onClick={() => toggleCategory(category)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${selectedCategories.includes(category)
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
                    <label className="block text-sm font-bold text-slate-300 mb-2">Cover Image Upload</label>
                    <input
                        required={!coverFile}
                        disabled={isLoading}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverSelect}
                        className="w-full file:bg-purple-500/10 file:text-purple-500 file:border-0 file:rounded-xl file:px-4 file:py-2 file:mr-4 file:font-bold hover:file:bg-purple-500/20 text-slate-400 bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all disabled:opacity-50"
                    />
                    {coverPreview && (
                        <div className="mt-4 w-32 h-44 rounded-xl overflow-hidden border border-slate-700 shadow-xl relative group">
                            <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Synopsis / Story</label>
                    <textarea
                        required
                        disabled={isLoading}
                        rows={6}
                        value={story}
                        onChange={(e) => setStory(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-600 resize-none font-medium leading-relaxed disabled:opacity-50"
                        placeholder="Brief summary of the story..."
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
                <button
                    disabled={isLoading}
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2 border border-purple-500 shadow-[0_0_30px_-10px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:cursor-wait hover:shadow-[0_0_40px_-5px_rgba(147,51,234,0.6)]"
                >
                    {isLoading ? 'Creating Manga...' : (
                        <>
                            <PlusCircle size={20} /> Create Manga Entry
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
