import { Switch, Route, Router as WouterRouter, useLocation, Link } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/lib/language";
import { Navbar, MobileBottomNav } from "@/components/Navbar";

import HomePage from "@/pages/home";
import ExplorePage from "@/pages/explore";
import ReadPage from "@/pages/read";
import WritePage from "@/pages/write";
import WriteBookPage from "@/pages/write-book";
import ProfilePage from "@/pages/profile";
import SettingsPage from "@/pages/settings";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
  },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(to: string): string {
  if (basePath && to.startsWith(basePath + "/")) return to.slice(basePath.length);
  if (basePath && to === basePath) return "/";
  return to;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.png`,
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "#000000",
    colorForeground: "#111111",
    colorMutedForeground: "#6b7280",
    colorDanger: "#dc2626",
    colorBackground: "#ffffff",
    colorInput: "#f9fafb",
    colorInputForeground: "#111111",
    colorNeutral: "#e5e7eb",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "font-serif text-gray-900",
    headerSubtitle: "text-gray-500 font-sans",
    socialButtonsBlockButtonText: "text-gray-800 font-medium font-sans",
    formFieldLabel: "text-gray-700 font-sans text-sm",
    footerActionLink: "text-black font-semibold font-sans",
    footerActionText: "text-gray-500 font-sans",
    dividerText: "text-gray-400 font-sans",
    identityPreviewEditButton: "text-black font-sans",
    formFieldSuccessText: "text-green-600 font-sans",
    alertText: "text-gray-700 font-sans",
    logoBox: "flex justify-center",
    logoImage: "h-10 w-auto",
    socialButtonsBlockButton: "border border-gray-200 hover:border-gray-400 bg-white transition-colors",
    formButtonPrimary: "bg-black text-white hover:bg-gray-800 font-sans",
    formFieldInput: "border-gray-200 bg-gray-50 text-gray-900 rounded-lg font-sans",
    footerAction: "border-t border-gray-100 bg-gray-50",
    dividerLine: "bg-gray-200",
    alert: "border border-red-100 bg-red-50 rounded-lg",
    otpCodeFieldInput: "border-gray-200 text-gray-900",
    formFieldRow: "gap-2",
    main: "px-2",
  },
};

function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12" dir="rtl">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/`}
        appearance={clerkAppearance}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12" dir="rtl">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={`${basePath}/settings`}
        appearance={clerkAppearance}
      />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 mt-16 pb-20 md:pb-0" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-muted-foreground text-sm font-sans">
            © {new Date().getFullYear()} روايتي — جميع الحقوق محفوظة
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-sans">
            {[
              { href: "/about", label: "من نحن" },
              { href: "/privacy", label: "سياسة الخصوصية" },
              { href: "/terms", label: "شروط الاستخدام" },
              { href: "/contact", label: "تواصل معنا" },
            ].map(({ href, label }) => (
              <Link key={href} href={href}>
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  {label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/explore" component={ExplorePage} />
      <Route path="/read/:bookId" component={ReadPage} />
      <Route path="/write" component={WritePage} />
      <Route path="/write/:bookId" component={WriteBookPage} />
      <Route path="/profile/:username" component={ProfilePage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" dir="rtl">
      <Navbar />
      <main className="flex-1">
        <AppRouter />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey ?? ""}
      proxyUrl={clerkProxyUrl}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      afterSignOutUrl={`${basePath}/`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
      appearance={clerkAppearance}
      localization={{
        signIn: {
          start: {
            title: "أهلاً بعودتك",
            subtitle: "سجّل دخولك إلى روايتي",
          },
        },
        signUp: {
          start: {
            title: "انضم إلى روايتي",
            subtitle: "ابدأ رحلتك الأدبية اليوم",
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <TooltipProvider>
                <Layout />
                <Toaster />
              </TooltipProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
