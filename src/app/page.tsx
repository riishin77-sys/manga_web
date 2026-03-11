import Link from 'next/link';
import MangaCard from '@/components/MangaCard';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const awaitedParams = await searchParams;
  const query = awaitedParams.q || '';
  const category = awaitedParams.category || 'All';

  const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
          auth: {
              persistSession: false
          }
      }
  );

  let dbQuery = supabase
    .from('mangas')
    .select('*')
    .order('created_at', { ascending: false });

  if (query) {
    dbQuery = dbQuery.ilike('title', `%${query}%`);
  }
  if (category && category !== 'All') {
    dbQuery = dbQuery.ilike('category', `%${category}%`);
  }

  const { data: mangas, error } = await dbQuery;

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
          {['All', 'Action', 'Romance', 'Fantasy', 'Sci-Fi'].map((genre) => {
            const isActive = category === genre;
            const href = genre === 'All' ? '/' : `/?category=${genre}`;
            
            return (
              <Link
                key={genre}
                href={href}
                className={`px-5 py-2 rounded-full border text-sm font-semibold transition-all whitespace-nowrap
                  ${isActive
                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-300'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600'
                  }`}
              >
                {genre}
              </Link>
            );
          })}
        </div>
      </div>

      {error && (
          <div className="text-red-500 text-center p-10 text-xl font-bold bg-red-500/10 rounded-2xl border border-red-500/20 col-span-full">
            Error fetching data: {error.message}
          </div>
      )}

      {!error && mangas && mangas.length === 0 && (
          <div className="text-white text-center p-10 text-xl bg-slate-800/50 rounded-2xl border border-slate-700/50 col-span-full">
            No mangas found in database. (Array is empty)
          </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {mangas && mangas.map((manga: any) => (
          <MangaCard 
            key={manga.id} 
            id={manga.id} 
            title={manga.title} 
            category={manga.category} 
            coverUrl={manga.cover_url} 
          />
        ))}
      </div>
    </div>
  );
}
