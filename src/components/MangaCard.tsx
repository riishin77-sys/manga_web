import Link from 'next/link';
import { BookOpen } from 'lucide-react';

interface MangaCardProps {
    id: string;
    title: string;
    coverUrl: string | null;
    category: string | null;
}

export default function MangaCard({ id, title, coverUrl, category }: MangaCardProps) {
    return (
        <Link href={`/manga/${id}`} className="group relative rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/50 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10 flex flex-col h-full hover:-translate-y-1">
            <div className="relative aspect-[3/4] overflow-hidden bg-slate-900 rounded-t-2xl">
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                        <BookOpen size={48} />
                    </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
            </div>

            <div className="p-4 flex flex-col flex-1 absolute bottom-0 left-0 right-0 pt-12 z-10 pointer-events-none">
                {category && (
                    <span className="text-[10px] sm:text-xs font-bold tracking-widest text-purple-400 uppercase mb-1 drop-shadow-md">
                        {category}
                    </span>
                )}
                <h3 className="font-bold text-slate-100 text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors drop-shadow-md">
                    {title}
                </h3>
            </div>
        </Link>
    );
}
