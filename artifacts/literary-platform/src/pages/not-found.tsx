import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
      <span className="font-serif text-8xl text-primary/20 select-none">٤٠٤</span>
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground mb-2">الصفحة غير موجودة</h1>
        <p className="text-muted-foreground font-sans text-sm">ربما أُزيل هذا الرابط أو لم يكن موجوداً أصلاً</p>
      </div>
      <Link href="/">
        <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          العودة للرئيسية
        </button>
      </Link>
    </div>
  );
}
