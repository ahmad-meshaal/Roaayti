import { Mail, MessageCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-3">تواصل معنا</h1>
        <p className="text-muted-foreground mb-12">
          يسعدنا سماع آرائك واقتراحاتك وأسئلتك. نرد على جميع الرسائل خلال 48 ساعة.
        </p>

        <div className="space-y-6">
          {/* Email card */}
          <a
            href="mailto:ahmad.meshaalp@gmail.com"
            className="flex items-center gap-5 p-6 rounded-2xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Mail size={22} />
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">البريد الإلكتروني</p>
              <p className="text-muted-foreground text-sm">ahmad.meshaalp@gmail.com</p>
            </div>
          </a>

          {/* Response time info */}
          <div className="flex items-center gap-5 p-6 rounded-2xl border border-border bg-muted/30">
            <div className="w-12 h-12 rounded-xl bg-foreground/10 text-foreground flex items-center justify-center shrink-0">
              <MessageCircle size={22} />
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">وقت الاستجابة</p>
              <p className="text-muted-foreground text-sm">نرد خلال 24–48 ساعة في أيام العمل</p>
            </div>
          </div>
        </div>

        {/* Topics */}
        <div className="mt-12">
          <h2 className="font-serif text-xl font-semibold text-foreground mb-4">يمكنك التواصل بشأن</h2>
          <ul className="space-y-2 text-foreground/80 text-sm">
            {[
              "الإبلاغ عن محتوى مسيء أو انتهاك لحقوق النشر",
              "اقتراحات لتحسين المنصة",
              "مشاكل تقنية أو أخطاء في الموقع",
              "طلبات الشراكة والتعاون",
              "أسئلة حول الخصوصية وبياناتك الشخصية",
            ].map((topic) => (
              <li key={topic} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/40 shrink-0" />
                {topic}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
