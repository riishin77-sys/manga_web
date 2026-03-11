'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, FileText, Hash, Layers } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function AddChapterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Form states
    const [mangaId, setMangaId] = useState('');
    const [chapterNumber, setChapterNumber] = useState('');
    const [title, setTitle] = useState('');
    const [chapterFiles, setChapterFiles] = useState<File[]>([]);

    // Mangas list for selection
    const [mangas, setMangas] = useState<any[]>([]);

    useEffect(() => {
        const fetchMangas = async () => {
            const { data, error } = await supabase.from('mangas').select('id, title, drive_folder_id').order('title');
            if (data) setMangas(data);
            if (error) console.error(error);
        };
        fetchMangas();
    }, []);

    const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            // Convert FileList to Array and sort naturally by name (e.g. 01.jpg, 02.jpg)
            const filesArray = Array.from(e.target.files).sort((a, b) =>
                a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
            );
            setChapterFiles(filesArray);
        }
    };

    const handleAddChapter = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!mangaId) {
            toast.error('Please select a Manga');
            return;
        }

        if (chapterFiles.length === 0) {
            toast.error('Please select at least one chapter image');
            return;
        }

        setIsLoading(true);
        setUploadProgress(0);
        let finalFolderId = '';

        const toastId = toast.loading(`Uploading 0 of ${chapterFiles.length} pages...`);

        try {
            // 1. Upload first image sequentially to create the Chapter folder
            const firstFile = chapterFiles[0];
            const firstFormData = new FormData();
            firstFormData.append('file', firstFile);
            firstFormData.append('chapterNumber', chapterNumber);

            const selectedManga = mangas.find(m => m.id === mangaId);
            if (selectedManga?.drive_folder_id) {
                firstFormData.append('mangaFolderId', selectedManga.drive_folder_id);
            }

            toast.loading(`Uploading page 1 of ${chapterFiles.length} (Creating Folder)...`, { id: toastId });

            const firstUploadRes = await fetch('/api/upload/chapter', {
                method: 'POST',
                body: firstFormData
            });

            const firstUploadData = await firstUploadRes.json();

            if (!firstUploadRes.ok || !firstUploadData.success) {
                throw new Error(firstUploadData.error || `Failed to upload ${firstFile.name}`);
            }

            finalFolderId = firstUploadData.folderId;
            setUploadProgress(Math.round((1 / chapterFiles.length) * 100));

            // 2. Upload remaining images in parallel batches of 5
            const remainingFiles = chapterFiles.slice(1);
            const BATCH_SIZE = 5;
            let completedUploads = 1;

            for (let i = 0; i < remainingFiles.length; i += BATCH_SIZE) {
                const batch = remainingFiles.slice(i, i + BATCH_SIZE);
                
                toast.loading(`Uploading pages ${completedUploads + 1}-${Math.min(completedUploads + batch.length, chapterFiles.length)} of ${chapterFiles.length}...`, { id: toastId });

                const uploadPromises = batch.map(async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('chapterNumber', chapterNumber);
                    formData.append('folderId', finalFolderId);
                    
                    if (selectedManga?.drive_folder_id) {
                        formData.append('mangaFolderId', selectedManga.drive_folder_id);
                    }

                    const res = await fetch('/api/upload/chapter', {
                        method: 'POST',
                        body: formData
                    });

                    const data = await res.json();
                    if (!res.ok || !data.success) {
                        throw new Error(data.error || `Failed to upload ${file.name}`);
                    }
                    return data;
                });

                // Wait for the entire batch of 5 to finish before starting the next
                await Promise.all(uploadPromises);
                
                completedUploads += batch.length;
                setUploadProgress(Math.round((completedUploads / chapterFiles.length) * 100));
            }

            toast.loading('Saving Chapter to Database...', { id: toastId });

            // Save Chapter linking Drive Folder to Manga
            const { error: sbError } = await supabase
                .from('chapters')
                .insert([
                    {
                        manga_id: mangaId,
                        chapter_number: parseFloat(chapterNumber),
                        title: title || null,
                        drive_folder_id: finalFolderId
                    }
                ]);

            if (sbError) {
                throw sbError;
            }

            toast.success('Chapter published successfully!', { id: toastId });

            // Clean up UI manually
            setChapterNumber('');
            setTitle('');
            setChapterFiles([]);
            setUploadProgress(0);

            // Reset file input element visually
            const fileInput = document.getElementById('chapter-files-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (err: any) {
            toast.error(`Error: ${err.message}`, { id: toastId });
        } finally {
            setIsLoading(false);
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

    return (
        <form onSubmit={handleAddChapter} className="space-y-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-800">
                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]">
                    <FileText size={28} className="text-indigo-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Add Chapter</h2>
                    <p className="text-slate-400 font-medium text-sm">Upload chapter images directly to a manga.</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">Select Manga</label>
                    <select
                        required
                        disabled={isLoading}
                        value={mangaId}
                        onChange={(e) => setMangaId(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium appearance-none disabled:opacity-50"
                    >
                        <option value="" disabled className="bg-slate-900">Select a manga...</option>
                        {mangas.map((manga) => (
                            <option key={manga.id} value={manga.id} className="bg-slate-900">
                                {manga.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                            <Hash size={16} /> Chapter Number
                        </label>
                        <input
                            required
                            disabled={isLoading}
                            type="number"
                            step="0.1"
                            value={chapterNumber}
                            onChange={(e) => setChapterNumber(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 font-medium disabled:opacity-50"
                            placeholder="e.g. 1 or 1.5"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Chapter Title (Optional)</label>
                        <input
                            disabled={isLoading}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 font-medium disabled:opacity-50"
                            placeholder="The Awakening"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                        <Layers size={16} /> Chapter Images (Multi-select)
                    </label>
                    <input
                        required={chapterFiles.length === 0}
                        id="chapter-files-input"
                        disabled={isLoading}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFilesSelect}
                        className="w-full file:bg-indigo-500/10 file:text-indigo-500 file:border-0 file:rounded-xl file:px-4 file:py-2 file:mr-4 file:font-bold hover:file:bg-indigo-500/20 text-slate-400 bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                        Select all image files containing the chapter. They will be uploaded sequentially to bypass payload limits.
                    </p>

                    {chapterFiles.length > 0 && (
                        <div className="mt-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 max-h-40 overflow-y-auto custom-scrollbar">
                            <h4 className="text-sm font-bold text-indigo-400 mb-2">{chapterFiles.length} files queued for upload:</h4>
                            <ul className="text-xs space-y-1 font-mono text-slate-400">
                                {chapterFiles.map((f, i) => (
                                    <li key={i}>{f.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {isLoading && uploadProgress > 0 && (
                    <div className="w-full bg-slate-800 rounded-full h-2.5 mt-4 overflow-hidden">
                        <div
                            className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                )}
            </div>

            <div className="pt-4 border-t border-slate-800">
                <button
                    disabled={isLoading}
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2 border border-indigo-500 shadow-[0_0_30px_-10px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-wait hover:shadow-[0_0_40px_-5px_rgba(99,102,241,0.6)]"
                >
                    {isLoading ? `Uploading... ${uploadProgress}%` : (
                        <>
                            <PlusCircle size={20} /> Publish Chapter
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
