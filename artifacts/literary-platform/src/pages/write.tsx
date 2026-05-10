import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetMyBooks, useCreateBook, getGetMyBooksQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { BookCard } from "@/components/BookCard";
import { Plus, PenLine, BookOpen, Lock } from "lucide-react";
import { formatDate } from "@/lib/utils";

const GENRES = ["fiction", "romance", "drama", "history", "science", "mystery", "fantasy", "horror", "poetry"];
const GENRE_LABELS: Record<string, string> = {
  fiction: "خيال", romance: "رومانسي", drama: "دراما",
  history: "تاريخ", science: "علوم", mystery: "غموض",
  fantasy: "فانتازيا", horror: "رعب", poetry: "شعر",
};

export default function WritePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: books, isLoading } = useGetMyBooks({
    query: { queryKey: getGetMyBooksQueryKey(), enabled: !!user },
  });

  const createBook = useCreateBook();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("fiction");
  const [description, setDescription] = useState("");

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Lock size={24} className="text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">سجّل الدخول للكتابة</h2>
          <p className="text-muted-foreground font-sans text-sm">انضم إلى آلاف الكتّاب وابدأ قصتك اليوم</p>
        </div>
        <div className="flex gap-3">
          <Link href="/sign-in"><button className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">دخول</button></Link>
          <Link href="/sign-up"><button className="px-6 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity">انضم مجاناً</button></Link>
        </div>
      </div>
    );
  }

  const handleCreate = () => {
    if (!title.trim()) {
      toast({ title: "خطأ", description: "عنوان الكتاب مطلوب", variant: "destructive" });
      return;
    }
    createBook.mutate(
      { data: { title: title.trim(), genre, description: description.trim() || undefined } },
      {
        onSuccess: (book) => {
          queryClient.invalidateQueries({ queryKey: getGetMyBooksQueryKey() });
          setShowForm(false);
          setTitle(""); setGenre("fiction"); setDescription("");
          setLocation(`/write/${book.id}`);
        },
        onError: () => {
          toast({ title: "خطأ", description: "تعذّر إنشاء الكتاب", variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 pb-28 md:pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1">مساحتك الإبداعية</h1>
          <p className="text-muted-foreground font-sans text-sm">
            {books?.length ?? 0} {books?.length === 1 ? "كتاب" : "كتب"}
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          data-testid="button-new-book"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all active:scale-95"
        >
          <Plus size={16} />
          كتاب جديد
        </button>
      </div>

      {/* New book form */}
      {showForm && (
        <div className="bg-card border border-card-border rounded-2xl p-6 mb-8 shadow-md">
          <h2 className="text-lg font-serif font-semibold mb-5 text-foreground">كتاب جديد</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground font-sans">العنوان *</label>
              <input
                type="text"
                data-testid="input-book-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="عنوان روايتك..."
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground font-sans">التصنيف</label>
              <select
                value={genre}
                onChange={e => setGenre(e.target.value)}
                data-testid="select-genre"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              >
                {GENRES.map(g => (
                  <option key={g} value={g}>{GENRE_LABELS[g]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground font-sans">نبذة مختصرة</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="صِف قصتك في بضعة أسطر..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleCreate}
                disabled={createBook.isPending}
                data-testid="button-create-book"
                className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                {createBook.isPending ? "جاري الإنشاء..." : "إنشاء الكتاب"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Books grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-muted animate-pulse aspect-[3/4]" />
          ))}
        </div>
      ) : books && books.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {books.map(book => (
            <div key={book.id} className="relative group">
              <div onClick={() => setLocation(`/write/${book.id}`)} className="cursor-pointer">
                <div className="rounded-xl overflow-hidden border border-card-border bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  {/* Cover */}
                  <div className="aspect-[3/4] w-full overflow-hidden bg-muted relative">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent">
                        <PenLine size={32} className="text-primary/30" />
                      </div>
                    )}
                    {/* Status badge */}
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium font-sans ${book.status === "published" ? "bg-green-500/90 text-white" : "bg-muted/90 text-muted-foreground"}`}>
                      {book.status === "published" ? "منشور" : "مسودة"}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-serif font-semibold text-sm leading-snug line-clamp-2 text-foreground mb-1">{book.title}</h3>
                    <p className="text-xs text-muted-foreground font-sans">{GENRE_LABELS[book.genre] ?? book.genre}</p>
                    <p className="text-xs text-muted-foreground font-sans mt-1">{book.chapterCount ?? 0} فصل</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-serif text-lg mb-2">لم تكتب شيئاً بعد</p>
          <p className="text-sm font-sans mb-6">ابدأ بإنشاء كتابك الأول</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            إنشاء كتاب جديد
          </button>
        </div>
      )}
    </div>
  );
}
