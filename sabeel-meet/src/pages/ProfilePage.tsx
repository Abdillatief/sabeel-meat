import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Pencil, ArrowUpRight, Mail, MapPin, GraduationCap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatLocalizedNumber } from '../i18n/translations';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Skeleton } from '../components/ui/Skeleton';
import { PageTransition } from '../components/ui/PageTransition';

const TIMEZONES = [
  'Asia/Riyadh',
  'Asia/Dubai',
  'Africa/Cairo',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'UTC',
];

export function ProfilePage() {
  const {
    user,
    userLoading,
    updateUser,
    classes,
    meetings,
    teachers,
    students,
    language,
    t,
  } = useApp();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [cohort, setCohort] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (user && !editing) {
      setName(user.name);
      setDepartment(user.department);
      setCohort(user.cohort);
      setTimezone(user.timezone || 'UTC');
      setBio(user.bio);
    }
  }, [user, editing]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateUser({
        name: name.trim() || user.name,
        department: department.trim(),
        cohort: cohort.trim(),
        timezone: timezone.trim() || user.timezone,
        bio: bio.trim(),
      });
      setEditing(false);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2600);
    } finally {
      setSaving(false);
    }
  };

  const completedMeetingsCount = meetings.filter((m) => m.status === 'completed').length;

  const accountMetrics = [
    {
      label: t.profile.classesMetric,
      value: formatLocalizedNumber(classes.length, language),
    },
    {
      label: t.profile.meetingsMetric,
      value: formatLocalizedNumber(meetings.length, language),
    },
    {
      label: t.profile.completedMetric,
      value: formatLocalizedNumber(completedMeetingsCount, language),
    },
    {
      label: t.profile.teachersMetric,
      value: formatLocalizedNumber(teachers.length, language),
    },
    {
      label: t.profile.studentsMetric,
      value: formatLocalizedNumber(students.length, language),
    },
  ];

  const timezoneOptions =
    user?.timezone && !TIMEZONES.includes(user.timezone)
      ? [user.timezone, ...TIMEZONES]
      : TIMEZONES;

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B0F15] dark:text-white">
            {t.profile.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t.profile.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedNotice && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#16A34A] dark:text-emerald-400">
              <Check className="w-3.5 h-3.5" />
              {t.profile.profileUpdated}
            </span>
          )}
          <Button
            variant={editing ? 'secondary' : 'primary'}
            size="md"
            disabled={userLoading || !user}
            icon={<Pencil className="w-4 h-4" />}
            onClick={() => {
              if (!editing && user) {
                setName(user.name);
                setDepartment(user.department);
                setCohort(user.cohort);
                setTimezone(user.timezone || 'UTC');
                setBio(user.bio);
              }
              setEditing((prev) => !prev);
            }}
          >
            {editing ? t.profile.cancelEdit : t.profile.editProfile}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Identity & Real Metrics Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card padding="lg">
            {userLoading || !user ? (
              <div className="space-y-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row lg:flex-col items-start gap-5">
                  <Avatar
                    src={user.avatarUrl}
                    name={user.name}
                    initials={user.initials}
                    size="xl"
                  />
                  <div className="space-y-2 min-w-0">
                    <div>
                      <h2 className="font-display text-xl font-bold text-[#0B0F15] dark:text-white">
                        {user.name}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {t.enums.roles[user.role]}
                        {user.cohort ? ` · ${user.cohort}` : ''}
                      </p>
                    </div>

                    <div className="pt-2 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate" dir="ltr">
                          {user.email || t.common.notSpecified}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{user.department || t.common.notSpecified}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span dir="ltr">{user.timezone || t.common.notSpecified}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-[#E3EAF2] dark:border-white/[0.08]">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    {t.profile.academicFocus}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {user.bio || t.profile.noBioYet}
                  </p>
                </div>
              </>
            )}
          </Card>

          {/* Real Firestore Account Metrics */}
          <Card padding="lg">
            <div className="mb-4">
              <h3 className="font-display text-base font-bold text-[#0B0F15] dark:text-white">
                {t.profile.overviewStatsTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.profile.overviewStatsSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {accountMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="p-3.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/[0.08]"
                >
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {metric.label}
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-[#0B0F15] dark:text-white tabular-nums">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right/End Column: Edit Form + Real Classes */}
        <div className="lg:col-span-7 space-y-6">
          {editing && (
            <Card padding="lg">
              <h2 className="font-display text-lg font-bold text-[#0B0F15] dark:text-white mb-4">
                {t.profile.editForm.title}
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="prof-name"
                      className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                    >
                      {t.profile.editForm.fullName}
                    </label>
                    <input
                      id="prof-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="prof-tz"
                      className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                    >
                      {t.profile.editForm.timezone}
                    </label>
                    <select
                      id="prof-tz"
                      dir="ltr"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
                    >
                      {timezoneOptions.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="prof-dept"
                      className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                    >
                      {t.profile.editForm.department}
                    </label>
                    <input
                      id="prof-dept"
                      type="text"
                      value={department}
                      placeholder={t.profile.editForm.departmentPlaceholder}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="prof-cohort"
                      className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                    >
                      {t.profile.editForm.cohort}
                    </label>
                    <input
                      id="prof-cohort"
                      type="text"
                      value={cohort}
                      placeholder={t.profile.editForm.cohortPlaceholder}
                      onChange={(e) => setCohort(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="prof-bio"
                    className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                  >
                    {t.profile.editForm.bio}
                  </label>
                  <textarea
                    id="prof-bio"
                    rows={3}
                    value={bio}
                    placeholder={t.profile.editForm.bioPlaceholder}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                    {t.common.cancel}
                  </Button>
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? t.common.saving : t.profile.editForm.saveChanges}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <Card padding="lg">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0B0F15] dark:text-white">
                  {t.profile.enrolledClassesTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t.profile.enrolledClassesSubtitle(classes.length)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowUpRight className="w-3.5 h-3.5 rtl:-scale-x-100" />}
                onClick={() => navigate('/classes')}
              >
                {t.profile.manage}
              </Button>
            </div>

            {classes.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
                {t.profile.noClassesYet}
              </p>
            ) : (
              <div className="divide-y divide-[#E3EAF2] dark:divide-white/[0.07]">
                {classes.map((cls) => {
                  const pct =
                    cls.totalSessions > 0
                      ? Math.round((cls.completedSessions / cls.totalSessions) * 100)
                      : 0;
                  return (
                    <div
                      key={cls.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-mono-tabular font-semibold text-[#1D74CE] dark:text-[#69B6FF]">
                            {cls.code}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{cls.instructorName}</span>
                        </div>
                        <p className="mt-0.5 text-sm font-semibold text-[#0B0F15] dark:text-white truncate">
                          {cls.title}
                        </p>
                      </div>
                      <div className="text-end shrink-0">
                        <p className="font-mono-tabular text-sm font-semibold text-[#0B0F15] dark:text-white">
                          {formatLocalizedNumber(pct, language)}%
                        </p>
                        <p className="text-[11px] text-slate-400 tabular-nums">
                          {t.profile.sessionsFraction(
                            cls.completedSessions,
                            cls.totalSessions
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
