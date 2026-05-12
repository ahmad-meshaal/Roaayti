const logoUrl = `${import.meta.env.BASE_URL}logo.png`;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-8">
          <img
            src={logoUrl}
            alt="روايتي"
            className="h-14 w-14 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <h1 className="font-serif text-4xl font-bold text-foreground">من نحن</h1>
        </div>

        <div className="space-y-10 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">قصتنا</h2>
            <p>
              <strong>روايتي</strong> منصة أدبية عربية أُسِّست لتمكين الكتّاب العرب من نشر أعمالهم ومشاركتها مع القرّاء
              حول العالم. نؤمن بأن كل قصة تستحق أن تُروى، وكل صوت أدبي يستحق أن يُسمع.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">رسالتنا</h2>
            <p>
              نسعى لبناء مجتمع أدبي عربي متكامل يجمع الكتّاب والقرّاء في فضاء رقمي آمن وملهم،
              مدعوماً بتقنيات الذكاء الاصطناعي لمساعدة الكتّاب على إطلاق إبداعهم دون حدود.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">ما نقدمه</h2>
            <ul className="list-disc list-inside space-y-3 text-foreground/80">
              <li>
                <strong>الكتابة بمساعدة الذكاء الاصطناعي</strong> — أداة كتابة ذكية تساعدك على تطوير روايتك وفصولها
                باللغة العربية أو الإنجليزية.
              </li>
              <li>
                <strong>نشر الروايات</strong> — شارك أعمالك مع جمهور واسع من القرّاء العرب.
              </li>
              <li>
                <strong>ملف المؤلف</strong> — اعرض أعمالك وروابطك الاجتماعية في صفحة شخصية احترافية.
              </li>
              <li>
                <strong>اكتشاف الأعمال</strong> — استكشف روايات جديدة من كتّاب متميزين.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">تواصل معنا</h2>
            <p className="text-foreground/80">
              نسعد بتلقي آرائك واقتراحاتك على:{" "}
              <a
                href="mailto:ahmad.meshaalp@gmail.com"
                className="underline hover:text-foreground transition-colors"
              >
                ahmad.meshaalp@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
