export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-3">سياسة الخصوصية</h1>
        <p className="text-muted-foreground text-sm mb-10">آخر تحديث: مايو 2025</p>

        <div className="space-y-10 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">مقدمة</h2>
            <p>
              نرحب بك في منصة <strong>روايتي</strong>. نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.
              توضح هذه السياسة كيفية جمع معلوماتك واستخدامها والحفاظ عليها عند استخدامك لمنصتنا.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">المعلومات التي نجمعها</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground/80">
              <li>معلومات الحساب: الاسم، البريد الإلكتروني، الصورة الشخصية عند التسجيل.</li>
              <li>المحتوى الذي تنشئه: الروايات والفصول وبيانات ملفك الشخصي.</li>
              <li>بيانات الاستخدام: سجلات الوصول، صفحات مُشاهَدة، والتفاعلات داخل المنصة.</li>
              <li>معلومات الجهاز: نوع المتصفح، نظام التشغيل، وعنوان IP.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">كيف نستخدم معلوماتك</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground/80">
              <li>تشغيل الخدمة وتحسين تجربة المستخدم.</li>
              <li>التواصل معك بشأن حسابك أو التحديثات المهمة.</li>
              <li>تحليل استخدام المنصة لتطوير ميزات جديدة.</li>
              <li>الامتثال للمتطلبات القانونية.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">الإعلانات — Google AdSense</h2>
            <p className="text-foreground/80 mb-2">
              نستخدم Google AdSense لعرض الإعلانات على المنصة. قد تستخدم Google ملفات تعريف الارتباط (Cookies)
              لعرض إعلانات مخصصة بناءً على زياراتك السابقة لهذا الموقع أو مواقع أخرى.
            </p>
            <p className="text-foreground/80">
              يمكنك إلغاء الاشتراك في الإعلانات المخصصة عبر{" "}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                إعدادات إعلانات Google
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">مشاركة المعلومات</h2>
            <p className="text-foreground/80">
              لا نبيع معلوماتك الشخصية لأي طرف ثالث. قد نشارك البيانات فقط مع مزودي الخدمات الضروريين
              لتشغيل المنصة (مثل خدمات المصادقة والاستضافة) أو عند اشتراط القانون ذلك.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">أمان البيانات</h2>
            <p className="text-foreground/80">
              نطبق إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح به أو التعديل أو الكشف.
              تُخزَّن البيانات على خوادم مؤمَّنة مع تشفير الاتصالات عبر HTTPS.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">حقوقك</h2>
            <ul className="list-disc list-inside space-y-2 text-foreground/80">
              <li>طلب الاطلاع على بياناتك الشخصية أو تصحيحها.</li>
              <li>طلب حذف حسابك وبياناتك.</li>
              <li>الاعتراض على معالجة بياناتك في حالات معينة.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">التواصل معنا</h2>
            <p className="text-foreground/80">
              لأي استفسارات حول سياسة الخصوصية، يرجى التواصل عبر:{" "}
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
