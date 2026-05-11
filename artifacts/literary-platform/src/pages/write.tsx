import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetMyBooks, useCreateBook, useDeleteBook, getGetMyBooksQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { BookCard } from "@/components/BookCard";
import { Plus, PenLine, BookOpen, Lock, Trash2 } from "lucide-react";

const GENRES = ["fiction", "romance", "drama", "history", "science", "mystery", "fantasy", "horror", "poetry"];
const GENRE_LABELS_AR: Record<string, string> = {
  fiction: "خيال", romance: "رومانسي", drama: "دراما",
  history: "تاريخ", science: "علوم", mystery: "غموض",
  fantasy: "فانتازيا", horror: "رعب", poetry: "شعر",
};
const GENRE_LABELS_EN: Record<string, string> = {
  fiction: "Fiction", romance: "Romance", drama: "Drama",
  history: "History", science: "Science", mystery: "Mystery",
  fantasy: "Fantasy", horror: "Horror", poetry: "Poetry",
};

export default function WritePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: books, isLoading } = useGetMyBooks({
    query: { queryKey: getGetMyBooksQueryKey(), enabled: !!user },
  });

  const createBook = useCreateBook();
  const deleteBook = useDeleteBook();
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
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">{t("سجّل الدخول للكتابة", "Sign in to Write")}</h2>
          <p className="text-muted-foreground font-sans text-sm">{t("انضم إلى آلاف الكتّاب وابدأ قصتك اليوم", "Join thousands of writers and start your story today")}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/sign-in"><button className="px-6 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">{t("دخول", "Sign In")}</button></Link>
          <Link href="/sign-up"><button className="px-6 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity">{t("انضم مجاناً", "Join Free")}</button></Link>
        </div>
      </div>
    );
  }

  const handleCreate = () => {
    if (!title.trim()) {
      toast({ title: t("خطأ", "Error"), description: t("عنوان الكتاب مطلوب", "Book title is required"), variant: "destructive" });
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
          toast({ title: t("خطأ", "Error"), description: t("تعذّر إنشاء الكتاب", "Failed to create book"), variant: "destructive" });
        },
      }
    );
  };

  const handleDeleteBook = (e: React.MouseEvent, bookId: number, bookTitle: string) => {
    e.stopPropagation();
    if (!confirm(t(`هل أنت متأكد من حذف "${bookTitle}"؟ سيُحذف الكتاب وجميع فصوله نهائياً.`, `Are you sure you want to delete "${bookTitle}"? This will permanently delete the book and all its chapters.`))) return;
    deleteBook.mutate({ id: bookId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyBooksQueryKey() });
        toast({ title: t("تم حذف الكتاب", "Book deleted") });
      },
      onError: () => toast({ title: t("خطأ", "Error"), description: t("تعذّر الحذف", "Failed to delete"), variant: "destructive" }),
    });
  };

  const GENRE_LABELS = t("ar", "en") === "ar" ? GENRE_LABELS_AR : GENRE_LABELS_EN;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 pb-28 md:pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1">{t("مساحتك الإبداعية", "Your Creative Space")}</h1>
          <p className="text-muted-foreground font-sans text-sm">
            {books?.length ?? 0} {t("كتب", "books")}
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          data-testid="button-new-book"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all active:scale-95"
        >
          <Plus size={16} />
          {t("كتاب جديد", "New Book")}
        </button>
      </div>

      {/* New book form */}
      {showForm && (
        <div className="bg-card border border-card-border rounded-2xl p-6 mb-8 shadow-md">
          <h2 className="text-lg font-serif font-semibold mb-5 text-foreground">{t("كتاب جديد", "New Book")}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground font-sans">{t("العنوان *", "Title *")}</label>
              <input
                type="text"
                data-testid="input-book-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t("عنوان روايتك...", "Your novel title...")}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground font-sans">{t("التصنيف", "Genre")}</label>
              <select
                value={genre}
                onChange={e => setGenre(e.target.value)}
                data-testid="select-genre"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              >
                {GENRES.map(g => (
                  <option key={g} value={g}>{GENRE_LABELS_AR[g]} / {GENRE_LABELS_EN[g]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground font-sans">{t("نبذة مختصرة", "Short Description")}</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={t("صِف قصتك في بضعة أسطر...", "Describe your story in a few lines...")}
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
                {createBook.isPending ? t("جاري الإنشاء...", "Creating...") : t("إنشاء الكتاب", "Create Book")}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                {t("إلغاء", "Cancel")}
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
                      {book.status === "published" ? t("منشور", "Published") : t("مسودة", "Draft")}
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteBook(e, book.id, book.title)}
                      className="absolute top-2 left-2 w-7 h-7 rounded-full bg-destructive/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive shadow-md"
                      title={t("حذف الكتاب", "Delete book")}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="font-serif font-semibold text-sm leading-snug line-clamp-2 text-foreground mb-1">{book.title}</h3>
                    <p className="text-xs text-muted-foreground font-sans">{GENRE_LABELS_AR[book.genre] ?? book.genre}</p>
                    <p className="text-xs text-muted-foreground font-sans mt-1">{book.chapterCount ?? 0} {t("فصل", "chapters")}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-serif text-lg mb-2">{t("لم تكتب شيئاً بعد", "Nothing written yet")}</p>
          <p className="text-sm font-sans mb-6">{t("ابدأ بإنشاء كتابك الأول", "Start by creating your first book")}</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {t("إنشاء كتاب جديد", "Create New Book")}
          </button>
        </div>
      )}
    </div>
  );
}
