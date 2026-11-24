import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Save, ShieldCheck, Trash2 } from 'lucide-react';
import { Button, LinkButton } from '@/components/common/Button';
import { SectionCard } from '@/components/common/Card';
import { PageHeader } from '@/components/common/Feedback';
import { Modal, useToast } from '@/components/common/Feedback';
import { InlineNotice, Skeleton } from '@/components/common/States';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { RequireAuth } from '@/routes/guards';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { errorMessage } from '@/services/api/errors';
import { punjabDistricts } from '@/data/welfare';
import { formatDate } from '@/utils/cn';
import type { Language } from '@/types/domain';

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}

function ProfileContent() {
  useDocumentTitle('Profile & settings', 'Manage your profile, language preference and stored data.');
  const { user, logout, updateProfile, initializing, isAdmin } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? '');
  const [district, setDistrict] = useState(user?.district ?? '');
  const [preferred, setPreferred] = useState<Language>(user?.preferredLanguage ?? language);
  const [saving, setSaving] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  if (initializing) return <Skeleton className="mx-auto h-60 max-w-2xl" />;
  if (!user) return null;

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() || user.name, preferredLanguage: preferred, district: district || null });
      setLanguage(preferred);
      toast('Profile updated for this demonstration session.', 'success');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const clearLocalData = () => {
    const keys = [
      'sahara.demo.drafts',
      'sahara.savedServices',
      'sahara.recentlyViewed',
      'sahara.assistant.thread',
    ];
    keys.forEach((key) => {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    });
    setConfirmClear(false);
    toast('Saved drafts, bookmarks and history were cleared from this browser.', 'success');
  };

  return (
    <div className="container-page max-w-3xl py-6 sm:py-8">
      <PageHeader
        eyebrow="Your account"
        title="Profile & settings"
        description="Manage your details, interface language and the data stored by this development build."
      />

      <div className="mt-6 space-y-4">
        <SectionCard title="Profile" description="Changes apply to this demonstration session.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="profile-name" className="mb-1.5 block text-sm font-medium text-ink-800">
                Full name
              </label>
              <input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-lg border border-ink-300 px-3 text-sm"
              />
            </div>
            <div>
              <label htmlFor="profile-email" className="mb-1.5 block text-sm font-medium text-ink-800">
                Email
              </label>
              <input
                id="profile-email"
                value={user.email}
                readOnly
                className="h-11 w-full rounded-lg border border-ink-200 bg-ink-50 px-3 text-sm text-ink-600"
                aria-describedby="profile-email-help"
              />
              <p id="profile-email-help" className="mt-1 text-xs text-ink-500">
                Email changes require re-verification and are not available in this build.
              </p>
            </div>
            <div>
              <label htmlFor="profile-district" className="mb-1.5 block text-sm font-medium text-ink-800">
                District
              </label>
              <select
                id="profile-district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="h-11 w-full rounded-lg border border-ink-300 bg-white px-3 text-sm"
              >
                <option value="">Not set</option>
                {punjabDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-ink-800">Account role</p>
              <p className="flex h-11 items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 px-3 text-sm text-ink-700">
                <ShieldCheck className="size-4 text-brand-700" aria-hidden="true" />
                {user.role} · demo session
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button onClick={() => void save()} loading={saving} leadingIcon={<Save className="size-4" aria-hidden="true" />}>
              Save profile
            </Button>
            <p className="text-xs text-ink-500">Joined {formatDate(user.createdAt)}</p>
          </div>
        </SectionCard>

        <SectionCard title="Language preferences" description="The interface language and layout direction.">
          <div className="max-w-xs">
            <LanguageSelector
              label={t('lang.interface')}
              value={preferred}
              onChange={(lang) => setPreferred(lang)}
            />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-500">
            Urdu and Punjabi are displayed right-to-left. Some interface labels are still only available in English —
            the language menu notes this rather than showing a raw key.
          </p>
        </SectionCard>

        <SectionCard title="Privacy and data controls" description="You control what this build stores on your device.">
          <ul className="space-y-2 text-sm text-ink-700">
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
              No CNIC number, password or OTP is stored by the frontend.
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
              Drafts, bookmarks and recent services live in this browser only and can be deleted at any time.
            </li>
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmClear(true)}
              leadingIcon={<Trash2 className="size-4" aria-hidden="true" />}
            >
              Clear stored data
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              leadingIcon={<LogOut className="size-4" aria-hidden="true" />}
            >
              Log out
            </Button>
          </div>
        </SectionCard>

        {isAdmin && (
          <InlineNotice tone="info" title="Administrator access">
            <p>You are signed in as an administrator. The admin area is available from the header menu.</p>
            <LinkButton to="/admin" variant="outline" size="sm" className="mt-2">
              Open admin dashboard
            </LinkButton>
          </InlineNotice>
        )}
      </div>

      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear stored data?"
        description="This removes locally saved drafts, bookmarks, recently viewed services and the assistant conversation from this browser."
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={clearLocalData}>
              Clear data
            </Button>
          </>
        }
      />
    </div>
  );
}
