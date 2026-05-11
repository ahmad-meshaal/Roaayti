import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { useLocation, Link } from "wouter";
import {
  useUpdateMyProfile, useUploadAvatar, useUpdateMyUsername, useGetMyLinks, useCreateLink,
  useUpdateLink, useDeleteLink,
  getGetMeQueryKey, getGetMyLinksQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";
import { Plus, Trash2, Camera, ExternalLink, Lock, Save, AtSign } from "lucide-react";

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkIcon, setNewLinkIcon] = useState("");

  const { data: links } = useGetMyLinks({ query: { queryKey: getGetMyLinksQueryKey(), enabled: !!user } });
  const updateProfile = useUpdateMyProfile();
  const uploadAvatar = useUploadAvatar();
  const updateUsername = useUpdateMyUsername();
  const createLink = useCreateLink();
  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? "");
      setBio(user.bio ?? "");
      setNewUsername(user.username ?? "");
    }
  }, [user]);

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
        <Lock size={32} className="text-muted-foreground opacity-30" />
        <h2 className="text-2xl font-serif font-bold text-foreground">{t("تسجيل الدخول مطلوب", "Sign in required")}</h2>
        <Link href="/sign-in"><button className="px-6 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium">{t("دخول", "Sign In")}</button></Link>
      </div>
    );
  }

  const handleSaveProfile = () => {
    updateProfile.mutate(
      { data: { displayName: displayName.trim(), bio: bio.trim() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          toast({ title: t("تم حفظ الملف الشخصي", "Profile saved") });
        },
        onError: () => toast({ title: t("خطأ", "Error"), description: t("تعذّر الحفظ", "Failed to save"), variant: "destructive" }),
      }
    );
  };

  const validateUsername = (val: string) => {
    if (!val) return t("اسم المستخدم مطلوب", "Username is required");
    if (val.length < 3) return t("3 أحرف على الأقل", "At least 3 characters");
    if (val.length > 30) return t("30 حرفاً كحد أقصى", "Max 30 characters");
    if (!/^[a-z0-9_]+$/.test(val)) return t("حروف إنجليزية صغيرة وأرقام وشرطة سفلية فقط", "Lowercase letters, numbers, and underscores only");
    return "";
  };

  const handleSaveUsername = () => {
    const err = validateUsername(newUsername);
    if (err) { setUsernameError(err); return; }
    setUsernameError("");
    updateUsername.mutate(
      { data: { username: newUsername.toLowerCase() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          toast({ title: t("تم تغيير اسم المستخدم", "Username updated") });
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
          toast({ title: t("خطأ", "Error"), description: msg ?? t("اسم المستخدم مستخدم بالفعل", "Username already taken"), variant: "destructive" });
        },
      }
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t("الصورة كبيرة جداً", "Image too large"), description: t("الحد الأقصى 5 ميجابايت", "Max 5MB"), variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      uploadAvatar.mutate({ data: { dataUrl } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          toast({ title: t("تم تحديث الصورة الشخصية", "Avatar updated") });
        },
        onError: () => toast({ title: t("خطأ", "Error"), description: t("تعذّر رفع الصورة", "Failed to upload avatar"), variant: "destructive" }),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      toast({ title: t("خطأ", "Error"), description: t("العنوان والرابط مطلوبان", "Title and URL are required"), variant: "destructive" });
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
          toast({ title: t("تم إضافة الرابط", "Link added") });
        },
        onError: () => toast({ title: t("خطأ", "Error"), description: t("تعذّر إضافة الرابط", "Failed to add link"), variant: "destructive" }),
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
        <h1 className="text-3xl font-serif font-bold text-foreground">{t("الإعدادات", "Settings")}</h1>
        {user && (
          <Link href={`/profile/${user.username}`}>
            <button className="flex items-center gap-1.5 text-xs text-primary hover:underline font-sans">
              <ExternalLink size={12} />
              {t("عرض ملفي", "View Profile")}
            </button>
          </Link>
        )}
      </div>

      {/* Avatar */}
      <div className="bg-card border border-card-border rounded-2xl p-6 mb-6 shadow-sm">
        <h2 className="text-base font-serif font-semibold mb-5 text-foreground">{t("الصورة الشخصية", "Profile Picture")}</h2>
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
              {uploadAvatar.isPending ? t("جاري الرفع...", "Uploading...") : t("تغيير الصورة", "Change Picture")}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
      </div>

      {/* Username */}
      <div className="bg-card border border-card-border rounded-2xl p-6 mb-6 shadow-sm">
        <h2 className="text-base font-serif font-semibold mb-1 text-foreground">{t("اسم المستخدم", "Username")}</h2>
        <p className="text-xs text-muted-foreground mb-5 font-sans">{t("يجب أن يكون فريداً ويحتوي على حروف إنجليزية صغيرة وأرقام وشرطة سفلية فقط", "Must be unique: lowercase letters, numbers, underscores only")}</p>
        <div className="flex gap-2 items-start">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground text-sm">@</span>
              <input
                type="text"
                value={newUsername}
                onChange={e => { setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")); setUsernameError(""); }}
                maxLength={30}
                dir="ltr"
                placeholder="username"
                className="w-full pr-7 pl-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>
            {usernameError && <p className="text-destructive text-xs mt-1">{usernameError}</p>}
          </div>
          <button
            onClick={handleSaveUsername}
            disabled={updateUsername.isPending || newUsername === user?.username}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap"
          >
            <AtSign size={14} />
            {updateUsername.isPending ? t("جاري...", "Saving...") : t("حفظ", "Save")}
          </button>
        </div>
      </div>

      {/* Profile info */}
      <div className="bg-card border border-card-border rounded-2xl p-6 mb-6 shadow-sm">
        <h2 className="text-base font-serif font-semibold mb-5 text-foreground">{t("المعلومات الشخصية", "Personal Info")}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5 font-sans">{t("الاسم الظاهر", "Display Name")}</label>
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
              {t("نبذة شخصية", "Bio")} <span className="text-muted-foreground font-normal">({bio.length}/300)</span>
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value.slice(0, 300))}
              rows={4}
              maxLength={300}
              data-testid="textarea-bio"
              placeholder={t("اكتب نبذة عنك...", "Write a short bio...")}
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
            {updateProfile.isPending ? t("جاري الحفظ...", "Saving...") : t("حفظ التغييرات", "Save Changes")}
          </button>
        </div>
      </div>

      {/* Links */}
      <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-serif font-semibold mb-2 text-foreground">{t("روابط البايو", "Bio Links")}</h2>
        <p className="text-xs text-muted-foreground mb-5 font-sans">{t("أضف روابط حساباتك الخارجية لتظهر في ملفك الشخصي", "Add your external links to appear on your profile")}</p>

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

        <div className="border border-dashed border-border rounded-xl p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground font-sans">{t("إضافة رابط جديد", "Add new link")}</p>
          <input
            type="text"
            placeholder={t("الاسم (مثال: قناتي على يوتيوب)", "Name (e.g. My YouTube channel)")}
            value={newLinkTitle}
            onChange={e => setNewLinkTitle(e.target.value)}
            data-testid="input-link-title"
            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground"
          />
          <input
            type="url"
            placeholder="https://..."
            value={newLinkUrl}
            onChange={e => setNewLinkUrl(e.target.value)}
            data-testid="input-link-url"
            dir="ltr"
            className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground"
          />
          <input
            type="text"
            placeholder={t("أيقونة (اختياري، مثال: 🎬)", "Icon (optional, e.g. 🎬)")}
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
            {createLink.isPending ? t("جاري الإضافة...", "Adding...") : t("إضافة الرابط", "Add Link")}
          </button>
        </div>
      </div>
    </div>
  );
}
