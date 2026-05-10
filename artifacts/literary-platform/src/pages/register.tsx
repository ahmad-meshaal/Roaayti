import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  displayName: z.string().min(1, "الاسم مطلوب").max(60),
  username: z.string().min(3, "اسم المستخدم 3 أحرف على الأقل").max(30).regex(/^[a-z0-9_]+$/, "أحرف إنجليزية صغيرة وأرقام وشرطة سفلية فقط"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const register = useRegister();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: "", username: "", email: "", password: "" },
  });

  const onSubmit = (data: FormData) => {
    register.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/settings");
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
        toast({ title: "خطأ في التسجيل", description: msg ?? "حدث خطأ ما، حاول مرة أخرى", variant: "destructive" });
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">وَرَق</h1>
          <p className="text-muted-foreground text-sm">انضم إلى مجتمع الكتّاب والقرّاء</p>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-8 shadow-md">
          <h2 className="text-xl font-serif font-semibold mb-6 text-foreground">إنشاء حساب</h2>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">الاسم الظاهر</label>
              <input
                type="text"
                data-testid="input-displayName"
                {...form.register("displayName")}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground"
                placeholder="اسمك كما تريد أن يظهر"
              />
              {form.formState.errors.displayName && (
                <p className="text-destructive text-xs mt-1">{form.formState.errors.displayName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">اسم المستخدم</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <input
                  type="text"
                  data-testid="input-username"
                  {...form.register("username")}
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground"
                  placeholder="username"
                  dir="ltr"
                />
              </div>
              {form.formState.errors.username && (
                <p className="text-destructive text-xs mt-1">{form.formState.errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                data-testid="input-email"
                {...form.register("email")}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground"
                placeholder="name@example.com"
                dir="ltr"
              />
              {form.formState.errors.email && (
                <p className="text-destructive text-xs mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">كلمة المرور</label>
              <input
                type="password"
                data-testid="input-password"
                {...form.register("password")}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground"
                placeholder="8 أحرف على الأقل"
                dir="ltr"
              />
              {form.formState.errors.password && (
                <p className="text-destructive text-xs mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={register.isPending}
              data-testid="button-submit"
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
            >
              {register.isPending ? "جاري الإنشاء..." : "إنشاء الحساب"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            لديك حساب بالفعل؟{" "}
            <Link href="/login">
              <span className="text-primary hover:underline cursor-pointer font-medium">تسجيل الدخول</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
