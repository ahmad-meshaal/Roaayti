import { useState } from "react";
import { useExploreBooks, getExploreBooksQueryKey } from "@workspace/api-client-react";
import { BookCard } from "@/components/BookCard";
import { Search, BookOpen } from "lucide-react";

const GENRES = ["الكل", "fiction", "romance", "drama", "history", "science", "mystery", "fantasy", "horror", "poetry"];
const GENRE_LABELS: Record<string, string> = {
  "الكل": "الكل",
  fiction: "خيال",
  romance: "رومانسي",
  drama: "دراما",
  history: "تاريخ",
  science: "علوم",
  mystery: "غموض",
  fantasy: "فانتازيا",
  horror: "رعب",
  poetry: "شعر",
};

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("الكل");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useExploreBooks(
    {
      ...(genre !== "الكل" ? { genre } : {}),
      ...(search ? { search } : {}),
      page,
      limit,
    },
    {
      query: {
        queryKey: getExploreBooksQueryKey({ genre: genre !== "الكل" ? genre : undefined, search: search || undefined, page, limit }),
        staleTime: 30_000,
      },
    }
  );

  const books = data?.books?.filter(b => !b.isAdult) ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 pb-24 md:pb-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">اكتشف</h1>
        <p className="text-muted-foreground font-sans text-sm">تصفّح آلاف الروايات والقصص من كتّاب عرب مبدعين</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="search"
          data-testid="input-search"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="ابحث عن كتاب أو كاتب..."
          className="w-full pr-10 pl-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground"
        />
      </div>

      {/* Genre filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {GENRES.map(g => (
          <button
            key={g}
            onClick={() => { setGenre(g); setPage(1); }}
            data-testid={`button-genre-${g}`}
            className={`flex-none px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap
              ${genre === g
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              }`}
          >
            {GENRE_LABELS[g] ?? g}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-xs text-muted-foreground mb-4 font-sans">
          {total} نتيجة {genre !== "الكل" && `في تصنيف "${GENRE_LABELS[genre] ?? genre}"`}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-muted animate-pulse aspect-[3/4]" />
          ))}
        </div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {books.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-serif text-lg">لا توجد نتائج</p>
          <p className="text-sm font-sans mt-2">جرّب البحث بكلمات مختلفة أو تصنيف آخر</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted transition-colors"
          >
            السابق
          </button>
          <span className="text-sm text-muted-foreground font-sans">{page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-40 hover:bg-muted transition-colors"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}
