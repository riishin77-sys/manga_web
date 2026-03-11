'use client';

import LazyLoad from 'react-lazyload';
import { Loader2 } from 'lucide-react';

interface ChapterViewerProps {
    images: string[];
}

export default function ChapterViewer({ images }: ChapterViewerProps) {
    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto bg-slate-950 min-h-screen pb-20">
            {images.map((src, index) => (
                <div key={index} className="w-full relative min-h-[50vh] md:min-h-[80vh] flex items-center justify-center bg-slate-900/50 mb-1">
                    <LazyLoad
                        height="100%"
                        offset={1200} // Load images well in advance (1200px before they appear)
                        placeholder={
                            <div className="flex flex-col items-center justify-center h-[50vh] w-full text-purple-500/50 gap-4">
                                <Loader2 size={48} className="animate-spin" />
                                <span className="text-sm font-semibold tracking-widest text-slate-500 uppercase">Loading Page {index + 1}...</span>
                            </div>
                        }
                        once
                    >
                        <img
                            src={src}
                            alt={`Page ${index + 1}`}
                            className="w-full h-auto object-contain bg-slate-950 shadow-2xl transition-opacity duration-700"
                            onLoad={(e) => {
                                // Remove the enforced min-height once loaded to allow natural aspect ratio
                                const parent = (e.target as HTMLElement).parentElement;
                                if (parent && parent.classList.contains('min-h-[50vh]')) {
                                    parent.classList.remove('min-h-[50vh]', 'md:min-h-[80vh]');
                                }
                            }}
                        />
                    </LazyLoad>
                </div>
            ))}
            <div className="py-16 text-center">
                <div className="inline-block px-8 py-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-bold tracking-widest text-sm uppercase">
                    End of Chapter
                </div>
            </div>
        </div>
    );
}
