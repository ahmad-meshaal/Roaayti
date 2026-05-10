import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const login = useLogin();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: FormData) => {
    login.mutate({ data }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/");
      },
      onError: () => {
        toast({ title: "خطأ", description: "البريد أو كلمة المرور غير صحيحة", variant: "destructive" });
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">وَرَق</h1>
          <p className="text-muted-foreground text-sm">أهلاً بعودتك إلى عالم الكلمات</p>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-8 shadow-md">
          <h2 className="text-xl font-serif font-semibold mb-6 text-foreground">تسجيل الدخول</h2>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="email">
                البريد الإلكتروني
              </label>
              <input
                id="email"
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
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="password">
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                data-testid="input-password"
                {...form.register("password")}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground"
                placeholder="••••••••"
                dir="ltr"
              />
              {form.formState.errors.password && (
                <p className="text-destructive text-xs mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={login.isPending}
              data-testid="button-submit"
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60 mt-2"
            >
              {login.isPending ? "جاري الدخول..." : "دخول"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ليس لديك حساب؟{" "}
            <Link href="/register">
              <span className="text-primary hover:underline cursor-pointer font-medium">انضم الآن</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
