import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetUserProfile } from "@workspace/api-client-react";
import { BookCard } from "@/components/BookCard";
import { getInitials, formatDate } from "@/lib/utils";
import { ExternalLink, BookOpen, Calendar, Share2, Users, UserCheck, UserPlus, UserMinus, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface FollowUser {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
}

function UserListModal({ title, users, onClose }: { title: string; users: FollowUser[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-serif font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {users.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground font-sans text-sm">لا يوجد مستخدمون</p>
          ) : (
            users.map((u) => (
              <Link key={u.id} href={`/profile/${u.username}`} onClick={onClose}>
                <div className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold overflow-hidden flex-none">
                    {u.avatarUrl ? <img src={u.avatarUrl} alt={u.displayName} className="w-full h-full object-cover" /> : <span className="font-serif">{getInitials(u.displayName)}</span>}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground font-sans">{u.displayName}</p>
                    <p className="text-xs text-muted-foreground font-sans">@{u.username}</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params.username ?? "";
  const { user: me } = useAuth();
  const { toast } = useToast();

  const [modal, setModal] = useState<"followers" | "following" | null>(null);
  const [followersData, setFollowersData] = useState<FollowUser[] | null>(null);
  const [followingData, setFollowingData] = useState<FollowUser[] | null>(null);
  const [followersCount, setFollowersCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);

  const { data: profile, isLoading } = useGetUserProfile(username, {
    query: {
      enabled: !!username,
      queryKey: ["getUserProfile", username],
    },
  });

  const loadStats = async () => {
    if (statsLoaded) return;
    setStatsLoaded(true);
    try {
      const [statsRes, followRes] = await Promise.all([
        fetch(`/api/users/${username}/follow-stats`),
        me ? fetch(`/api/users/${username}/is-following`, { credentials: "include" }) : Promise.resolve(null),
      ]);
      if (statsRes.ok) {
        const s = await statsRes.json() as { followers: number; following: number };
        setFollowersCount(s.followers);
        setFollowingCount(s.following);
      }
      if (followRes?.ok) {
        const f = await followRes.json() as { following: boolean };
        setIsFollowing(f.following);
      }
    } catch { /* ignore */ }
  };

  if (!statsLoaded && username) loadStats();

  const handleFollow = async () => {
    if (!me) { toast({ title: "سجّل دخولك أولاً", variant: "destructive" }); return; }
    setFollowLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/users/${username}/follow`, { method, credentials: "include" });
      if (res.ok) {
        const data = await res.json() as { following: boolean };
        setIsFollowing(data.following);
        setFollowersCount((c) => (c ?? 0) + (data.following ? 1 : -1));
      }
    } catch { /* ignore */ } finally { setFollowLoading(false); }
  };

  const openModal = async (type: "followers" | "following") => {
    setModal(type);
    const url = type === "followers" ? `/api/users/${username}/followers` : `/api/users/${username}/following`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json() as FollowUser[];
        if (type === "followers") setFollowersData(data);
        else setFollowingData(data);
      }
    } catch { /* ignore */ }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title: profile?.displayName ?? "ملف شخصي", url }); }
    else { await navigator.clipboard.writeText(url); toast({ title: "تم نسخ الرابط" }); }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
      <p className="font-serif text-xl">المستخدم غير موجود</p>
      <Link href="/explore"><button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90">تصفّح الكتب</button></Link>
    </div>
  );

  const publishedBooks = (profile.books ?? []).filter((b) => !b.isAdult);
  const isOwnProfile = me?.username === username;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 pb-28 md:pb-12">
      <div className="text-center mb-10">
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold mx-auto mb-5 overflow-hidden shadow-lg ring-4 ring-primary/20">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" data-testid="img-avatar" />
          ) : (
            <span className="font-serif">{getInitials(profile.displayName)}</span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-1" data-testid="text-displayName">{profile.displayName}</h1>
        <p className="text-muted-foreground text-sm font-sans mb-3" data-testid="text-username">@{profile.username}</p>
        {profile.bio && <p className="text-foreground/80 text-sm leading-relaxed max-w-sm mx-auto font-sans mb-4" dir="auto" data-testid="text-bio">{profile.bio}</p>}

        {/* Stats: followers / following / books */}
        <div className="flex items-center justify-center gap-6 mb-5">
          <button onClick={() => openModal("followers")} className="flex flex-col items-center hover:opacity-70 transition-opacity cursor-pointer">
            <span className="text-xl font-bold font-serif text-foreground">{followersCount ?? "—"}</span>
            <span className="text-xs text-muted-foreground font-sans flex items-center gap-1"><Users size={11} /> متابعون</span>
          </button>
          <div className="w-px h-8 bg-border" />
          <button onClick={() => openModal("following")} className="flex flex-col items-center hover:opacity-70 transition-opacity cursor-pointer">
            <span className="text-xl font-bold font-serif text-foreground">{followingCount ?? "—"}</span>
            <span className="text-xs text-muted-foreground font-sans flex items-center gap-1"><UserCheck size={11} /> يتابع</span>
          </button>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold font-serif text-foreground">{publishedBooks.length}</span>
            <span className="text-xs text-muted-foreground font-sans flex items-center gap-1"><BookOpen size={11} /> رواية</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3">
          {!isOwnProfile && me && (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium font-sans transition-all disabled:opacity-60 border"
              style={isFollowing
                ? { background: "transparent", borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }
                : { background: "hsl(var(--foreground))", color: "hsl(var(--background))", borderColor: "hsl(var(--foreground))" }}
            >
              {isFollowing ? <UserMinus size={14} /> : <UserPlus size={14} />}
              {isFollowing ? "إلغاء المتابعة" : "متابعة"}
            </button>
          )}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium font-sans border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <Share2 size={14} /> مشاركة الملف
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-4 font-sans">
          <Calendar size={12} /><span>عضو منذ {formatDate(profile.createdAt)}</span>
        </div>
      </div>

      {/* Links */}
      {profile.links && profile.links.length > 0 && (
        <section className="mb-10">
          <div className="flex flex-col gap-3">
            {profile.links.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" data-testid={`link-external-${link.id}`}
                className="group flex items-center justify-between px-6 py-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-accent/30 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <div className="flex items-center gap-3">
                  {link.icon && <span className="text-lg w-6 text-center">{link.icon}</span>}
                  <span className="text-sm font-medium text-foreground font-sans">{link.title}</span>
                </div>
                <ExternalLink size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Books */}
      <section>
        {publishedBooks.length > 0 && (
          <h2 className="text-sm font-sans font-semibold text-muted-foreground uppercase tracking-widest mb-4">الأعمال المنشورة</h2>
        )}
        {publishedBooks.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-serif text-lg">لم يُنشر أي عمل بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {publishedBooks.map((book) => (
              <div key={book.id} className="group relative">
                <BookCard book={book} />
                <button
                  onClick={async (e) => {
                    e.preventDefault(); e.stopPropagation();
                    const url = `${window.location.origin}/read/${book.id}`;
                    if (navigator.share) await navigator.share({ title: book.title, url });
                    else { await navigator.clipboard.writeText(url); toast({ title: "تم نسخ رابط الرواية" }); }
                  }}
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-all"
                  title="مشاركة الرواية"
                >
                  <Share2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Follower/Following Modals */}
      {modal === "followers" && <UserListModal title="المتابعون" users={followersData ?? []} onClose={() => setModal(null)} />}
      {modal === "following" && <UserListModal title="يتابع" users={followingData ?? []} onClose={() => setModal(null)} />}
    </div>
  );
}
