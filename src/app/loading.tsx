export default function HomeSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                        Latest Updates
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base">Discover trending and newly updated manga.</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 scrollbar-none">
                    {['All', 'Action', 'Romance', 'Fantasy', 'Sci-Fi'].map((genre, i) => (
                        <div
                            key={genre}
                            className={`px-5 py-4 rounded-full border border-slate-700/50 min-w-[80px] animate-pulse
                                ${i === 0 ? 'bg-purple-500/10' : 'bg-slate-800/50'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="group relative flex flex-col gap-2 animate-pulse">
                        <div className="w-full aspect-[3/4] rounded-2xl bg-slate-800/80 border border-slate-700/30 overflow-hidden relative">
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent block" />
                        </div>
                        <div className="px-1 space-y-2 mt-1">
                            <div className="h-4 bg-slate-800/80 rounded w-3/4" />
                            <div className="h-3 bg-slate-800/50 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
