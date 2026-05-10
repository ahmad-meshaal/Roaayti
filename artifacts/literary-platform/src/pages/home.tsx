import { Link } from "wouter";
import { useGetTrendingBooks, useGetPlatformStats } from "@workspace/api-client-react";
import { BookCard } from "@/components/BookCard";
import { BookOpen, Users, FileText, ArrowLeft } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const logoUrl = `${import.meta.env.BASE_URL}logo.png`;

export default function HomePage() {
  const { data: trending, isLoading: trendingLoading } = useGetTrendingBooks();
  const { data: stats } = useGetPlatformStats();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 md:py-36 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/60 to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <img
              src={logoUrl}
              alt="روايتي"
              className="h-14 w-14 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <span className="font-serif text-4xl font-bold text-foreground">روايتي</span>
          </div>
          <div className="inline-block px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium mb-6 font-sans tracking-wide border border-border">
            منصة الكتّاب العرب
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground leading-tight mb-6">
            حيث تعيش
            <span className="relative mx-3">
              <span className="relative z-10"> الكلمات</span>
              <span className="absolute inset-x-0 bottom-1 h-3 bg-muted -z-0 rounded" />
            </span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto leading-relaxed font-sans font-light mb-10">
            منصة للكتّاب والقرّاء. اكتب روايتك بمساعدة الذكاء الاصطناعي، شارك أعمالك، وابنِ جمهورك.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/sign-up">
              <button
                data-testid="button-get-started"
                className="px-8 py-3.5 rounded-xl bg-foreground text-background font-medium text-sm hover:opacity-80 transition-all hover:shadow-lg active:scale-[0.98]"
              >
                ابدأ الكتابة مجاناً
              </button>
            </Link>
            <Link href="/explore">
              <button
                data-testid="button-explore"
                className="px-8 py-3.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors flex items-center gap-2"
              >
                تصفّح الكتب
                <ArrowLeft size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="max-w-4xl mx-auto px-4 mb-20">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {[
              { icon: BookOpen, label: "كتاب منشور", value: stats.totalBooks },
              { icon: Users, label: "كاتب مبدع", value: stats.totalAuthors },
              { icon: FileText, label: "فصل متاح", value: stats.totalChapters },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-card border border-card-border rounded-2xl p-6 text-center shadow-sm">
                <Icon className="mx-auto mb-3 text-foreground opacity-60" size={24} />
                <div className="text-3xl font-serif font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground mt-1 font-sans">{label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Books */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-semibold text-foreground">الأكثر تداولاً</h2>
          <Link href="/explore">
            <span className="text-sm text-foreground hover:underline cursor-pointer font-medium font-sans flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
              عرض الكل <ArrowLeft size={14} />
            </span>
          </Link>
        </div>

        {trendingLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-muted animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : trending && trending.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {trending.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
            <p className="font-sans">لا توجد كتب منشورة بعد. كن أول من ينشر!</p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-foreground py-20 px-4 text-center">
        <h2 className="text-3xl font-serif font-bold text-background mb-4">لديك قصة تستحق أن تُروى؟</h2>
        <p className="text-background/70 mb-8 max-w-md mx-auto font-sans">
          أنشئ ملفك الشخصي الآن، اكتب رواياتك بمساعدة الذكاء الاصطناعي، وشارك رابط بايو مع متابعيك.
        </p>
        <Link href="/sign-up">
          <button className="px-8 py-3.5 rounded-xl bg-background text-foreground font-medium text-sm hover:opacity-90 transition-all">
            ابدأ اليوم — مجاناً
          </button>
        </Link>
      </section>
    </div>
  );
}
