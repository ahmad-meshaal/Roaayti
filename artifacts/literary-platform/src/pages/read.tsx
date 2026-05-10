import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetBook, useGetChapter, getGetChapterQueryKey } from "@workspace/api-client-react";
import { useTheme } from "@/lib/theme";
import { ArrowRight, ChevronLeft, ChevronRight, Sun, Moon, BookOpen, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type FontSize = "sm" | "md" | "lg" | "xl";

const FONT_SIZES: Record<FontSize, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
};

export default function ReadPage() {
  const params = useParams<{ bookId: string }>();
  const bookId = parseInt(params.bookId ?? "0", 10);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const { theme, toggle } = useTheme();

  const { data: book, isLoading } = useGetBook(bookId, {
    query: { enabled: !!bookId, queryKey: ["getBook", bookId] },
  });

  const { data: chapter, isLoading: chapterLoading } = useGetChapter(
    selectedChapterId!,
    {
      query: {
        enabled: !!selectedChapterId,
        queryKey: getGetChapterQueryKey(selectedChapterId!),
      },
    }
  );

  const chapters = book?.chapters ?? [];
  const currentIndex = chapters.findIndex(c => c.id === selectedChapterId);

  const fontSizeOptions: FontSize[] = ["sm", "md", "lg", "xl"];
  const currentFontIndex = fontSizeOptions.indexOf(fontSize);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-muted-foreground gap-4">
        <BookOpen size={48} className="opacity-20" />
        <p className="font-serif text-xl">الكتاب غير موجود</p>
        <Link href="/explore">
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90">
            العودة للاكتشاف
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Book header */}
      {!selectedChapterId && (
        <div className="max-w-3xl mx-auto px-4 py-10 pb-24 md:pb-10">
          <Link href="/explore">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors font-sans">
              <ArrowRight size={16} />
              العودة
            </button>
          </Link>

          <div className="flex gap-6 md:gap-10 mb-10">
            {/* Cover */}
            <div className="flex-none w-32 md:w-48 aspect-[3/4] rounded-xl overflow-hidden bg-muted shadow-lg">
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent">
                  <span className="font-serif text-6xl text-primary/30">و</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-3 font-sans">
                {book.genre}
              </span>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground leading-snug mb-2">{book.title}</h1>
              <Link href={`/profile/${book.authorUsername}`}>
                <p className="text-primary text-sm font-medium hover:underline cursor-pointer mb-4 font-sans">{book.authorDisplayName}</p>
              </Link>
              {book.description && (
                <p className="text-muted-foreground text-sm leading-relaxed font-sans line-clamp-4">{book.description}</p>
              )}
            </div>
          </div>

          {/* Chapters list */}
          <h2 className="text-xl font-serif font-semibold mb-4 text-foreground">الفصول</h2>
          {chapters.length === 0 ? (
            <p className="text-muted-foreground font-sans text-sm py-8 text-center">لا توجد فصول بعد</p>
          ) : (
            <div className="divide-y divide-border">
              {chapters.map((ch, i) => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChapterId(ch.id)}
                  data-testid={`button-chapter-${ch.id}`}
                  className="w-full text-right py-4 px-2 flex items-center justify-between hover:bg-muted/50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground w-6">{i + 1}</span>
                    <span className="font-sans font-medium text-foreground group-hover:text-primary transition-colors text-sm">
                      {ch.title}
                    </span>
                  </div>
                  <ChevronLeft size={16} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reading view */}
      {selectedChapterId && (
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 pb-32 md:pb-16">
          {/* Controls */}
          <div className="flex items-center justify-between mb-8 sticky top-16 z-10 bg-background/80 backdrop-blur-sm py-3 -mx-4 px-4 border-b border-border">
            <button
              onClick={() => setSelectedChapterId(null)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors font-sans"
              data-testid="button-back-to-chapters"
            >
              <ArrowRight size={16} />
              <span className="hidden sm:inline">{book.title}</span>
            </button>

            <div className="flex items-center gap-3">
              {/* Font size */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => currentFontIndex > 0 && setFontSize(fontSizeOptions[currentFontIndex - 1])}
                  disabled={currentFontIndex === 0}
                  className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  data-testid="button-font-decrease"
                >
                  <Minus size={14} />
                </button>
                <span className="text-xs font-sans text-muted-foreground px-1">أ</span>
                <button
                  onClick={() => currentFontIndex < fontSizeOptions.length - 1 && setFontSize(fontSizeOptions[currentFontIndex + 1])}
                  disabled={currentFontIndex === fontSizeOptions.length - 1}
                  className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  data-testid="button-font-increase"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Dark mode */}
              <button
                onClick={toggle}
                className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-reading-theme"
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>

          {chapterLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : chapter ? (
            <>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-10 leading-snug">
                {chapter.title}
              </h2>
              <div
                className={cn(
                  "reading-prose text-foreground leading-[2] whitespace-pre-wrap font-serif",
                  FONT_SIZES[fontSize]
                )}
              >
                {chapter.content || <span className="text-muted-foreground">هذا الفصل فارغ</span>}
              </div>
            </>
          ) : null}

          {/* Chapter navigation */}
          <div className="flex items-center justify-between mt-16 pt-8 border-t border-border">
            <button
              onClick={() => currentIndex > 0 && setSelectedChapterId(chapters[currentIndex - 1].id)}
              disabled={currentIndex <= 0}
              className="flex items-center gap-2 text-sm font-sans text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
              data-testid="button-prev-chapter"
            >
              <ChevronRight size={16} />
              الفصل السابق
            </button>
            <button
              onClick={() => currentIndex < chapters.length - 1 && setSelectedChapterId(chapters[currentIndex + 1].id)}
              disabled={currentIndex >= chapters.length - 1}
              className="flex items-center gap-2 text-sm font-sans text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
              data-testid="button-next-chapter"
            >
              الفصل التالي
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
