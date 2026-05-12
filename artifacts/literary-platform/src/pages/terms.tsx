export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-3">شروط الاستخدام</h1>
        <p className="text-muted-foreground text-sm mb-10">آخر تحديث: مايو 2025</p>

        <div className="space-y-10 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">الموافقة على الشروط</h2>
            <p>
              باستخدامك منصة <strong>روايتي</strong>، فإنك توافق على الالتزام بهذه الشروط والأحكام.
              إذا كنت لا توافق على أي من هذه الشروط، يُرجى التوقف عن استخدام المنصة.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">استخدام المنصة</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground/80">
              <li>يجب أن يكون عمرك 13 سنة أو أكثر لاستخدام المنصة.</li>
              <li>أنت مسؤول عن الحفاظ على أمان حسابك وكلمة مرورك.</li>
              <li>يُحظر استخدام المنصة لنشر محتوى مسيء أو مضلل أو غير قانوني.</li>
              <li>يُحظر انتهاك حقوق الملكية الفكرية للآخرين.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">المحتوى والملكية الفكرية</h2>
            <p className="text-foreground/80">
              أنت تحتفظ بحقوق الملكية الكاملة لكل ما تنشره على المنصة. بنشر محتواك، فإنك تمنح
              روايتي ترخيصاً غير حصري لعرض المحتوى وتوزيعه داخل المنصة.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">الإعلانات</h2>
            <p className="text-foreground/80">
              تعرض المنصة إعلانات عبر Google AdSense. لا نتحمل مسؤولية محتوى الإعلانات الخارجية.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">إنهاء الحساب</h2>
            <p className="text-foreground/80">
              نحتفظ بالحق في تعليق أو إنهاء أي حساب يخالف هذه الشروط دون إشعار مسبق.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">تعديل الشروط</h2>
            <p className="text-foreground/80">
              قد نعدّل هذه الشروط من وقت لآخر. سيُعلَم المستخدمون بأي تغييرات جوهرية.
              استمرار استخدامك للمنصة بعد التعديل يعني قبولك للشروط الجديدة.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">التواصل معنا</h2>
            <p className="text-foreground/80">
              لأي استفسارات حول شروط الاستخدام:{" "}
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
