import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, Link } from "wouter";
import {
  useGetBook, useUpdateBook, useGetChapters, useCreateChapter,
  useUpdateChapter, useDeleteChapter,
  getGetBookQueryKey, getGetChaptersQueryKey, getGetMyBooksQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Plus, Trash2, Check, ChevronRight, Lock, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

const GENRES = ["fiction", "romance", "drama", "history", "science", "mystery", "fantasy", "horror", "poetry"];
const GENRE_LABELS: Record<string, string> = {
  fiction: "خيال", romance: "رومانسي", drama: "دراما",
  history: "تاريخ", science: "علوم", mystery: "غموض",
  fantasy: "فانتازيا", horror: "رعب", poetry: "شعر",
};

export default function WriteBookPage() {
  const params = useParams<{ bookId: string }>();
  const bookId = parseInt(params.bookId ?? "0", 10);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeChapterId, setActiveChapterId] = useState<number | null>(null);
  const [chapterContent, setChapterContent] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [bookDesc, setBookDesc] = useState("");
  const [bookGenre, setBookGenre] = useState("fiction");
  const [bookStatus, setBookStatus] = useState<"draft" | "published">("draft");
  const [bookIsAdult, setBookIsAdult] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showAi, setShowAi] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const { data: book, isLoading } = useGetBook(bookId, {
    query: { enabled: !!bookId, queryKey: getGetBookQueryKey(bookId) },
  });
  const { data: chapters } = useGetChapters(bookId, {
    query: { enabled: !!bookId, queryKey: getGetChaptersQueryKey(bookId) },
  });

  const updateBook = useUpdateBook();
  const createChapter = useCreateChapter();
  const updateChapter = useUpdateChapter();
  const deleteChapter = useDeleteChapter();

  useEffect(() => {
    if (book) {
      setBookTitle(book.title);
      setBookDesc(book.description ?? "");
      setBookGenre(book.genre);
      setBookStatus(book.status as "draft" | "published");
      setBookIsAdult(book.isAdult);
    }
  }, [book]);

  const handleSelectChapter = useCallback((chId: number) => {
    setActiveChapterId(chId);
    const ch = chapters?.find(c => c.id === chId);
    if (ch) {
      setChapterTitle(ch.title);
      setChapterContent(ch.content ?? "");
    }
  }, [chapters]);

  const debounceSave = useCallback((content: string, title: string) => {
    if (!activeChapterId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setSaving(true);
      updateChapter.mutate(
        { id: activeChapterId, data: { content, title } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetChaptersQueryKey(bookId) });
            setSaving(false);
          },
          onError: () => setSaving(false),
        }
      );
    }, 1200);
  }, [activeChapterId, bookId, queryClient, updateChapter]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChapterContent(e.target.value);
    debounceSave(e.target.value, chapterTitle);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChapterTitle(e.target.value);
    debounceSave(chapterContent, e.target.value);
  };

  const handleCreateChapter = () => {
    if (!newChapterTitle.trim()) return;
    createChapter.mutate(
      { id: bookId, data: { title: newChapterTitle.trim() } },
      {
        onSuccess: (ch) => {
          queryClient.invalidateQueries({ queryKey: getGetChaptersQueryKey(bookId) });
          setNewChapterTitle("");
          handleSelectChapter(ch.id);
        },
        onError: () => toast({ title: "خطأ", description: "تعذّر إنشاء الفصل", variant: "destructive" }),
      }
    );
  };

  const handleDeleteChapter = (chId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الفصل؟")) return;
    deleteChapter.mutate({ id: chId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetChaptersQueryKey(bookId) });
        if (activeChapterId === chId) {
          setActiveChapterId(null);
          setChapterContent("");
          setChapterTitle("");
        }
      },
    });
  };

  const handleSaveBookSettings = () => {
    updateBook.mutate(
      { id: bookId, data: { title: bookTitle, description: bookDesc, genre: bookGenre, status: bookStatus, isAdult: bookIsAdult } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetBookQueryKey(bookId) });
          queryClient.invalidateQueries({ queryKey: getGetMyBooksQueryKey() });
          setShowSettings(false);
          toast({ title: "تم الحفظ" });
        },
        onError: () => toast({ title: "خطأ", description: "تعذّر حفظ الإعدادات", variant: "destructive" }),
      }
    );
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim() || !activeChapterId) return;
    setAiLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const response = await fetch("/api/ai/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, genre: book?.genre, title: book?.title }),
        signal: ctrl.signal,
      });

      if (!response.ok || !response.body) throw new Error("Failed to generate");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";
      setChapterContent("");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6)) as { content?: string; done?: boolean; error?: string };
            if (data.content) {
              accumulated += data.content;
              setChapterContent(prev => prev + data.content);
            }
            if (data.done) {
              setShowAi(false);
              debounceSave(accumulated, chapterTitle);
            }
            if (data.error) {
              toast({ title: "خطأ في التوليد", description: data.error, variant: "destructive" });
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err: unknown) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        toast({ title: "تعذّر توليد المحتوى", variant: "destructive" });
      }
    } finally {
      setAiLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Lock size={32} className="opacity-30" />
          <p className="font-serif">تسجيل الدخول مطلوب</p>
          <Link href="/sign-in">
            <button className="px-4 py-2 rounded-lg bg-foreground text-background text-sm">دخول</button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-foreground border-t-transparent animate-spin" /></div>;
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <p className="font-serif text-xl">الكتاب غير موجود</p>
        <Link href="/write"><button className="px-4 py-2 rounded-lg bg-foreground text-background text-sm hover:opacity-90">العودة</button></Link>
      </div>
    );
  }

  if (book.authorId !== user.id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Lock size={32} className="opacity-30" />
        <p className="font-serif text-xl">غير مصرّح لك بتعديل هذا الكتاب</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden relative">
      {/* Sidebar */}
      <aside className="w-64 flex-none border-l border-border bg-card overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-border">
          <Link href="/write">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs transition-colors mb-3 font-sans">
              <ArrowRight size={14} />
              مكتبتي
            </button>
          </Link>
          <h2 className="font-serif font-semibold text-sm text-foreground leading-snug line-clamp-2">{book.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-sans", book.status === "published" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground")}>
              {book.status === "published" ? "منشور" : "مسودة"}
            </span>
            <button onClick={() => setShowSettings(v => !v)} className="text-[10px] text-muted-foreground hover:text-foreground underline font-sans">إعدادات</button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="p-4 border-b border-border bg-muted/30 space-y-3">
            <input
              value={bookTitle}
              onChange={e => setBookTitle(e.target.value)}
              placeholder="عنوان الكتاب"
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <textarea
              value={bookDesc}
              onChange={e => setBookDesc(e.target.value)}
              placeholder="نبذة مختصرة"
              rows={2}
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
            <select value={bookGenre} onChange={e => setBookGenre(e.target.value)} className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
              {GENRES.map(g => <option key={g} value={g}>{GENRE_LABELS[g]}</option>)}
            </select>
            <select value={bookStatus} onChange={e => setBookStatus(e.target.value as "draft" | "published")} className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="draft">مسودة</option>
              <option value="published">نشر</option>
            </select>
            <button onClick={handleSaveBookSettings} disabled={updateBook.isPending} className="w-full py-2 text-xs rounded-lg bg-foreground text-background hover:opacity-90 disabled:opacity-60 font-sans font-medium">
              حفظ الإعدادات
            </button>
          </div>
        )}

        {/* Chapters */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-sans mb-2 px-1">الفصول</p>
            {(chapters ?? []).map((ch, i) => (
              <div
                key={ch.id}
                className={cn("group flex items-center gap-1 px-2 py-2 rounded-lg cursor-pointer transition-colors mb-0.5",
                  activeChapterId === ch.id ? "bg-muted text-foreground" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
                onClick={() => handleSelectChapter(ch.id)}
                data-testid={`button-chapter-${ch.id}`}
              >
                <span className="text-[10px] w-5 text-center opacity-50 font-mono flex-none">{i + 1}</span>
                <span className="text-xs flex-1 min-w-0 truncate font-sans">{ch.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteChapter(ch.id); }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-all"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}

            {/* Add chapter */}
            <div className="mt-3 flex gap-1">
              <input
                type="text"
                placeholder="فصل جديد..."
                value={newChapterTitle}
                onChange={e => setNewChapterTitle(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreateChapter()}
                className="flex-1 min-w-0 px-2 py-1.5 text-xs rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                data-testid="input-new-chapter"
              />
              <button
                onClick={handleCreateChapter}
                disabled={!newChapterTitle.trim() || createChapter.isPending}
                className="p-1.5 rounded-lg bg-foreground text-background hover:opacity-90 disabled:opacity-40 transition-opacity"
                data-testid="button-add-chapter"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Editor */}
      <main className="flex-1 overflow-y-auto bg-background">
        {!activeChapterId ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
            <ChevronRight size={40} className="opacity-20" />
            <p className="font-serif text-lg">اختر فصلاً للبدء بالكتابة</p>
            <p className="text-sm font-sans opacity-70">أو أنشئ فصلاً جديداً من القائمة الجانبية</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-6 py-10">
            {/* Chapter header */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <input
                type="text"
                value={chapterTitle}
                onChange={handleTitleChange}
                placeholder="عنوان الفصل"
                className="flex-1 text-2xl font-serif font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                data-testid="input-chapter-title"
              />
              <div className="flex items-center gap-2">
                {/* AI button */}
                <button
                  onClick={() => setShowAi(v => !v)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-sans transition-colors border",
                    showAi
                      ? "bg-foreground text-background border-foreground"
                      : "text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                  )}
                  title="الكتابة بالذكاء الاصطناعي"
                >
                  <Sparkles size={12} />
                  ذكاء اصطناعي
                </button>
                <div className={cn("flex items-center gap-1 text-xs font-sans transition-opacity", saving ? "opacity-100 text-muted-foreground" : "opacity-30 text-muted-foreground")}>
                  {saving ? <><div className="w-2 h-2 rounded-full bg-foreground/50 animate-pulse" /> حفظ...</> : <><Check size={12} /> محفوظ</>}
                </div>
              </div>
            </div>

            {/* Content area */}
            <textarea
              value={chapterContent}
              onChange={handleContentChange}
              placeholder="ابدأ الكتابة هنا... كل كلمة تكتبها تُحفظ تلقائياً"
              className="w-full min-h-[calc(100vh-280px)] bg-transparent border-none outline-none text-foreground font-serif text-lg leading-[1.9] resize-none placeholder:text-muted-foreground/40"
              data-testid="textarea-chapter-content"
              dir="auto"
            />
          </div>
        )}
      </main>

      {/* AI Panel — slide up from bottom */}
      {showAi && activeChapterId && (
        <div className="absolute bottom-0 left-64 right-0 z-40 bg-background border-t border-border shadow-2xl rounded-t-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-foreground" />
              <h3 className="font-serif font-semibold text-sm text-foreground">الكتابة بالذكاء الاصطناعي</h3>
            </div>
            <button onClick={() => setShowAi(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-3 font-sans">
            أخبر الذكاء الاصطناعي بفكرة الفصل وسيكتب لك نصاً طويلاً جاهزاً للتعديل
          </p>
          <textarea
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            placeholder="مثال: بطلنا يكتشف رسالة سرية في مكتبة قديمة تقوده إلى كنز مخفي منذ قرون..."
            rows={3}
            disabled={aiLoading}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none placeholder:text-muted-foreground mb-3 disabled:opacity-60"
            dir="auto"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAiGenerate}
              disabled={aiLoading || !aiPrompt.trim()}
              className="flex-1 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
            >
              {aiLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  جارٍ التوليد...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  توليد الفصل
                </>
              )}
            </button>
            {aiLoading && (
              <button
                onClick={() => { abortRef.current?.abort(); setAiLoading(false); }}
                className="px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                إيقاف
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
