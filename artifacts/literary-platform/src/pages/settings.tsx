import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation, Link } from "wouter";
import {
  useUpdateMyProfile, useUploadAvatar, useGetMyLinks, useCreateLink,
  useUpdateLink, useDeleteLink,
  getGetMeQueryKey, getGetMyLinksQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";
import { Plus, Trash2, Camera, ExternalLink, Lock, Save, ArrowRight } from "lucide-react";

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkIcon, setNewLinkIcon] = useState("");

  const { data: links } = useGetMyLinks({ query: { queryKey: getGetMyLinksQueryKey(), enabled: !!user } });
  const updateProfile = useUpdateMyProfile();
  const uploadAvatar = useUploadAvatar();
  const createLink = useCreateLink();
  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? "");
      setBio(user.bio ?? "");
    }
  }, [user]);

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
        <Lock size={32} className="text-muted-foreground opacity-30" />
        <h2 className="text-2xl font-serif font-bold text-foreground">تسجيل الدخول مطلوب</h2>
        <Link href="/sign-in"><button className="px-6 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium">دخول</button></Link>
      </div>
    );
  }

  const handleSaveProfile = () => {
    updateProfile.mutate(
      { data: { displayName: displayName.trim(), bio: bio.trim() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          toast({ title: "تم حفظ الملف الشخصي" });
        },
        onError: () => toast({ title: "خطأ", description: "تعذّر الحفظ", variant: "destructive" }),
      }
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "الصورة كبيرة جداً", description: "الحد الأقصى 5 ميجابايت", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      uploadAvatar.mutate({ data: { dataUrl } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          toast({ title: "تم تحديث الصورة الشخصية" });
        },
        onError: () => toast({ title: "خطأ", description: "تعذّر رفع الصورة", variant: "destructive" }),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      toast({ title: "خطأ", description: "العنوان والرابط مطلوبان", variant: "destructive" });
      return;
    }
    let url = newLinkUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) url = "https://" + url;
    createLink.mutate(
      { data: { title: newLinkTitle.trim(), url, icon: newLinkIcon.trim() || undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMyLinksQueryKey() });
          setNewLinkTitle(""); setNewLinkUrl(""); setNewLinkIcon("");
          toast({ title: "تم إضافة الرابط" });
        },
        onError: () => toast({ title: "خطأ", description: "تعذّر إضافة الرابط", variant: "destructive" }),
      }
    );
  };

  const handleDeleteLink = (id: number) => {
    deleteLink.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetMyLinksQueryKey() }),
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 pb-28 md:pb-10">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">الإعدادات</h1>
        {user && (
          <Link href={`/profile/${user.username}`}>
            <button className="flex items-center gap-1.5 text-xs text-primary hover:underline font-sans">
              <ExternalLink size={12} />
              عرض ملفي
            </button>
          </Link>
        )}
      </div>

      {/* Avatar */}
      <div className="bg-card border border-card-border rounded-2xl p-6 mb-6 shadow-sm">
        <h2 className="text-base font-serif font-semibold mb-5 text-foreground">الصورة الشخصية</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold overflow-hidden shadow ring-2 ring-primary/20">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" data-testid="img-avatar" />
              ) : (
                <span className="font-serif">{user ? getInitials(user.displayName) : ""}</span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
              data-testid="button-upload-avatar"
            >
              <Camera size={12} />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground font-sans">{user?.displayName}</p>
            <p className="text-xs text-muted-foreground font-sans">@{user?.username}</p>
            <button onClick={() => fileRef.current?.click()} className="text-xs text-primary hover:underline mt-1 font-sans">
              {uploadAvatar.isPending ? "جاري الرفع..." : "تغيير الصورة"}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
      </div>

      {/* Profile info */}
      <div className="bg-card border border-card-border rounded-2xl p-6 mb-6 shadow-sm">
        <h2 className="text-base font-serif font-semibold mb-5 text-foreground">المعلومات الشخصية</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5 font-sans">الاسم الظاهر</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={60}
              data-testid="input-displayName"
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5 font-sans">
              نبذة شخصية <span className="text-muted-foreground font-normal">({bio.length}/300)</span>
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value.slice(0, 300))}
              rows={4}
              maxLength={300}
              data-testid="textarea-bio"
              placeholder="اكتب نبذة عنك، عن أسلوبك في الكتابة، أو ما تحب..."
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none placeholder:text-muted-foreground"
              dir="auto"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={updateProfile.isPending}
            data-testid="button-save-profile"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            <Save size={14} />
            {updateProfile.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </div>

      {/* Links */}
      <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-serif font-semibold mb-2 text-foreground">روابط البايو</h2>
        <p className="text-xs text-muted-foreground mb-5 font-sans">أضف روابط حساباتك الخارجية لتظهر في ملفك الشخصي</p>

        {/* Existing links */}
        <div className="space-y-2 mb-5">
          {(links ?? []).map(link => (
            <div key={link.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30" data-testid={`link-item-${link.id}`}>
              {link.icon && <span className="text-lg w-7 text-center">{link.icon}</span>}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate font-sans">{link.title}</p>
                <p className="text-xs text-muted-foreground truncate font-sans" dir="ltr">{link.url}</p>
              </div>
              <button
                onClick={() => handleDeleteLink(link.id)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                data-testid={`button-delete-link-${link.id}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add new link */}
        <div className="border border-dashed border-border rounded-xl p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground font-sans">إضافة رابط جديد</p>
          <input
            type="text"
            placeholder="الاسم (مثال: قناتي على يوتيوب)"
            value={newLinkTitle}
            onChange={e => setNewLinkTitle(e.target.value)}
            data-testid="input-link-title"
            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground"
          />
          <input
            type="url"
            placeholder="الرابط (https://...)"
            value={newLinkUrl}
            onChange={e => setNewLinkUrl(e.target.value)}
            data-testid="input-link-url"
            dir="ltr"
            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground"
          />
          <input
            type="text"
            placeholder="أيقونة (اختياري، مثال: 🎬)"
            value={newLinkIcon}
            onChange={e => setNewLinkIcon(e.target.value)}
            data-testid="input-link-icon"
            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground"
          />
          <button
            onClick={handleAddLink}
            disabled={createLink.isPending}
            data-testid="button-add-link"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            <Plus size={14} />
            {createLink.isPending ? "جاري الإضافة..." : "إضافة الرابط"}
          </button>
        </div>
      </div>
    </div>
  );
}
