import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface Book {
  id: number;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  genre: string;
  authorUsername: string;
  authorDisplayName: string;
  chapterCount?: number;
  isAdult?: boolean;
}

interface BookCardProps {
  book: Book;
  className?: string;
}

const GENRE_COLORS: Record<string, string> = {
  fiction: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  romance: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  drama: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  history: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  science: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  mystery: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
  fantasy: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  horror: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  poetry: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
};

export function BookCard({ book, className }: BookCardProps) {
  const genres = book.genre ? book.genre.split(",").map(g => g.trim()).filter(Boolean) : [];

  return (
    <Link href={`/read/${book.id}`}>
      <div
        data-testid={`card-book-${book.id}`}
        className={cn(
          "group relative bg-card border border-card-border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
          className
        )}
      >
        {/* Cover */}
        <div className="aspect-[3/4] w-full overflow-hidden bg-muted relative">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent">
              <span className="font-serif text-5xl text-primary/30 select-none">و</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Info */}
        <div className="p-4">
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {genres.map((g, i) => (
                <span key={i} className={cn("inline-block text-xs font-medium px-2 py-0.5 rounded-full", GENRE_COLORS[g.toLowerCase()] ?? "bg-muted text-muted-foreground")}>
                  {g}
                </span>
              ))}
            </div>
          )}
          <h3 className="font-serif font-semibold text-base leading-snug line-clamp-2 mb-1 text-foreground group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground font-sans">{book.authorDisplayName}</p>
          {book.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{book.description}</p>
          )}
          {typeof book.chapterCount === "number" && (
            <p className="text-xs text-muted-foreground mt-2">{book.chapterCount} فصل</p>
          )}
        </div>
      </div>
    </Link>
  );
}
