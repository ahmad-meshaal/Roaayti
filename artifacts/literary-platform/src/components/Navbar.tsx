import { Link, useLocation } from "wouter";
import { useClerk } from "@clerk/react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useLanguage } from "@/lib/language";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { Sun, Moon, BookOpen, Compass, PenLine, User, LogOut, Menu, X } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { useState } from "react";

const logoUrl = `${import.meta.env.BASE_URL}logo.png`;

export function Navbar() {
  const { user, isLoading } = useAuth();
  const { theme, toggle } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const [location] = useLocation();
  const queryClient = useQueryClient();
  const { signOut } = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    queryClient.clear();
  };

  const navLinks = [
    { href: "/", label: t("الرئيسية", "Home"), icon: BookOpen },
    { href: "/explore", label: t("اكتشف", "Explore"), icon: Compass },
    ...(user ? [{ href: "/write", label: t("اكتب", "Write"), icon: PenLine }] : []),
    ...(user ? [{ href: `/profile/${user.username}`, label: t("ملفي", "Profile"), icon: User }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <span className="flex items-center gap-2.5 cursor-pointer group">
            <img
              src={logoUrl}
              alt="روايتي"
              className="h-8 w-8 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <span className="font-serif text-xl font-bold text-foreground tracking-tight group-hover:opacity-80 transition-opacity">
              {t("روايتي", "Riwayati")}
            </span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <span
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                  ${location === href
                    ? "text-foreground bg-muted font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
              >
                <Icon size={16} />
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs font-bold"
            aria-label="تبديل اللغة"
          >
            {lang === "ar" ? "EN" : "ع"}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="تبديل الوضع"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Auth section — skeleton while loading, real content after */}
          <div className="hidden md:flex items-center gap-2">
            {isLoading ? (
              /* Skeleton during auth check — prevents flash of "انضم" */
              <div className="w-24 h-8 rounded-lg bg-muted animate-pulse" />
            ) : user ? (
              <>
                <Link href="/settings">
                  <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity overflow-hidden border border-border">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-serif text-xs">{getInitials(user.displayName)}</span>
                    )}
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <button className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    {t("دخول", "Sign In")}
                  </button>
                </Link>
                <Link href="/sign-up">
                  <button className="px-4 py-1.5 text-sm font-medium bg-foreground text-background rounded-lg hover:opacity-80 transition-opacity">
                    {t("انضم", "Join")}
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <span
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
                  ${location === href ? "text-foreground bg-muted font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={16} />
                {label}
              </span>
            </Link>
          ))}

          {isLoading ? (
            <div className="w-full h-10 rounded-lg bg-muted animate-pulse mt-2" />
          ) : !user ? (
            <>
              <Link href="/sign-in">
                <button className="w-full mt-2 px-3 py-2 text-sm font-medium text-center text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>
                  {t("دخول", "Sign In")}
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="w-full px-3 py-2 text-sm font-medium text-center bg-foreground text-background rounded-lg hover:opacity-80" onClick={() => setMobileOpen(false)}>
                  {t("انضم مجاناً", "Join Free")}
                </button>
              </Link>
            </>
          ) : (
            <button
              onClick={() => { handleLogout(); setMobileOpen(false); }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-muted mt-2"
            >
              <LogOut size={16} /> {t("خروج", "Sign Out")}
            </button>
          )}
        </div>
      )}
    </header>
  );
}

export function MobileBottomNav() {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();

  const navLinks = [
    { href: "/", label: t("الرئيسية", "Home"), icon: BookOpen },
    { href: "/explore", label: t("اكتشف", "Explore"), icon: Compass },
    ...(user
      ? [{ href: "/write", label: t("اكتب", "Write"), icon: PenLine }]
      : [{ href: "/sign-in", label: t("دخول", "Sign In"), icon: User }]),
    ...(user ? [{ href: `/profile/${user.username}`, label: t("ملفي", "Profile"), icon: User }] : []),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1 px-4 py-1">
              <div className="w-6 h-6 rounded bg-muted animate-pulse" />
              <div className="w-10 h-2 rounded bg-muted animate-pulse" />
            </div>
          ))
        ) : (
          navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <div className={`flex flex-col items-center gap-1 px-4 py-1 cursor-pointer transition-colors
                ${location === href ? "text-foreground" : "text-muted-foreground"}`}>
                <Icon size={22} strokeWidth={location === href ? 2.5 : 1.75} />
                <span className="text-[10px] font-medium">{label}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </nav>
  );
}
