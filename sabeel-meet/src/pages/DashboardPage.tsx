import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Video,
  Clock,
  CalendarPlus,
  ArrowUpRight,
  SlidersHorizontal,
  BookOpen,
  FileText,
  CheckCircle2,
  FolderPlus,
  Bell,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Discipline, SessionType } from '../types';
import {
  formatLocalizedDate,
  formatLocalizedNumber,
  formatLocalizedTime,
  getFirestoreErrorMessage,
} from '../i18n/translations';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { PageTransition } from '../components/ui/PageTransition';

const DISCIPLINES: Discipline[] = [
  'Computer Science',
  'Mathematics',
  'Humanities',
  'Economics',
  'Sciences',
  'Languages',
];

const SESSION_TYPES: SessionType[] = [
  'Live Lecture',
  'Seminar Discussion',
  'Lab Workshop',
];

function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function DashboardPage() {
  const {
    user,
    userLoading,
    classes,
    classesLoading,
    classesError,
    createClass,
    meetings,
    meetingsLoading,
    meetingsError,
    createMeeting,
    notifications,
    notificationsLoading,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveMeetingId,
    language,
    t,
  } = useApp();
  const navigate = useNavigate();

  const todayIso = getTodayIsoDate();

  // Create Class Modal State
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [clsCode, setClsCode] = useState('');
  const [clsTitle, setClsTitle] = useState('');
  const [clsDiscipline, setClsDiscipline] = useState<Discipline>('Computer Science');
  const [clsInstructor, setClsInstructor] = useState('');
  const [clsInstructorTitle, setClsInstructorTitle] = useState('');
  const [clsRoomCode, setClsRoomCode] = useState('');
  const [clsSchedule, setClsSchedule] = useState('');
  const [clsTotalSessions, setClsTotalSessions] = useState(12);
  const [clsDescription, setClsDescription] = useState('');
  const [clsTopics, setClsTopics] = useState('');
  const [clsLiveNow, setClsLiveNow] = useState(false);
  const [clsSubmitting, setClsSubmitting] = useState(false);
  const [clsError, setClsError] = useState('');

  // Schedule Meeting Modal State
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [mtgClassId, setMtgClassId] = useState('');
  const [mtgTitle, setMtgTitle] = useState('');
  const [mtgDate, setMtgDate] = useState(todayIso);
  const [mtgStart, setMtgStart] = useState('10:00');
  const [mtgEnd, setMtgEnd] = useState('11:00');
  const [mtgType, setMtgType] = useState<SessionType>('Live Lecture');
  const [mtgLiveNow, setMtgLiveNow] = useState(false);
  const [mtgSubmitting, setMtgSubmitting] = useState(false);
  const [mtgError, setMtgError] = useState('');

  useEffect(() => {
    if (!mtgClassId && classes[0]?.id) {
      setMtgClassId(classes[0].id);
    }
  }, [classes, mtgClassId]);

  const showSkeleton = userLoading || classesLoading || meetingsLoading;
  const loadError = classesError || meetingsError;

  const todayMeetings = meetings.filter((m) => m.scheduledDate === todayIso);
  const liveMeeting =
    meetings.find((m) => m.status === 'live') ?? todayMeetings[0];
  const liveClass = classes.find((c) => c.isLiveNow) ?? classes[0];
  const featuredClasses = classes.slice(0, 3);

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t.dashboard.greetingMorning
      : hour < 17
      ? t.dashboard.greetingAfternoon
      : t.dashboard.greetingEvening;

  const firstName = user?.name?.trim().split(/\s+/)[0] ?? '';
  const formattedToday = formatLocalizedDate(new Date(), language, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const totalHours = Number(
    (meetings.reduce((acc, m) => acc + m.durationMinutes, 0) / 60).toFixed(1)
  );
  const totalCompletedSessions = classes.reduce(
    (acc, c) => acc + c.completedSessions,
    0
  );
  const totalTermSessions = classes.reduce((acc, c) => acc + c.totalSessions, 0);
  const completionPct =
    totalTermSessions > 0
      ? Math.round((totalCompletedSessions / totalTermSessions) * 100)
      : 0;
  const liveMeetingsCount = meetings.filter((m) => m.status === 'live').length;

  const handleJoinRoom = (classId: string) => {
    setActiveMeetingId(classId);
    navigate(`/meeting/${classId}`);
  };

  const handleCreateClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !clsCode.trim() ||
      !clsTitle.trim() ||
      !clsInstructor.trim() ||
      !clsRoomCode.trim()
    ) {
      setClsError(t.classes.modalCreate.validationError);
      return;
    }
    setClsError('');
    setClsSubmitting(true);
    try {
      const createdId = await createClass({
        code: clsCode,
        title: clsTitle,
        discipline: clsDiscipline,
        instructorName: clsInstructor,
        instructorTitle: clsInstructorTitle,
        roomCode: clsRoomCode,
        scheduleSummary: clsSchedule,
        totalSessions: Number(clsTotalSessions) || 12,
        description: clsDescription,
        syllabusTopics: clsTopics.split('\n'),
        isLiveNow: clsLiveNow,
      });
      if (createdId) {
        setMtgClassId(createdId);
      }
      setClsCode('');
      setClsTitle('');
      setClsInstructor('');
      setClsInstructorTitle('');
      setClsRoomCode('');
      setClsSchedule('');
      setClsDescription('');
      setClsTopics('');
      setClsLiveNow(false);
      setClassModalOpen(false);
    } catch (err) {
      if (err instanceof Error && err.message === 'VALIDATION_ERROR') {
        setClsError(t.classes.modalCreate.validationError);
      } else {
        setClsError(getFirestoreErrorMessage(err, t));
      }
    } finally {
      setClsSubmitting(false);
    }
  };

  const handleCreateMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mtgClassId || !mtgTitle.trim()) {
      setMtgError(t.schedule.modal.validationError);
      return;
    }
    setMtgError('');
    setMtgSubmitting(true);
    try {
      await createMeeting({
        classId: mtgClassId,
        title: mtgTitle,
        scheduledDate: mtgDate,
        startTime: mtgStart,
        endTime: mtgEnd,
        sessionType: mtgType,
        isLiveNow: mtgLiveNow,
      });
      setMtgTitle('');
      setMtgLiveNow(false);
      setMeetingModalOpen(false);
    } catch (err) {
      if (err instanceof Error && err.message === 'VALIDATION_ERROR') {
        setMtgError(t.schedule.modal.validationError);
      } else {
        setMtgError(getFirestoreErrorMessage(err, t));
      }
    } finally {
      setMtgSubmitting(false);
    }
  };

  const stats = [
    {
      label: t.dashboard.stats.activeClasses,
      value: formatLocalizedNumber(classes.length, language),
      detail: t.dashboard.stats.activeClassesDetail,
    },
    {
      label: t.dashboard.stats.todaysMeetings,
      value: formatLocalizedNumber(todayMeetings.length, language),
      detail:
        liveMeetingsCount > 0
          ? t.dashboard.stats.liveCountDetail(liveMeetingsCount)
          : t.dashboard.stats.noLiveNow,
    },
    {
      label: t.dashboard.stats.weeklyHours,
      value: `${formatLocalizedNumber(totalHours, language)} ${t.common.hoursShort}`,
      detail: t.dashboard.stats.acrossMeetings(meetings.length),
    },
    {
      label: t.dashboard.stats.completionRate,
      value: `${formatLocalizedNumber(completionPct, language)}%`,
      detail: t.dashboard.stats.sessionsProgress(totalCompletedSessions, totalTermSessions),
    },
  ];

  const subtitleText =
    user?.department && user?.cohort
      ? `${user.department} · ${user.cohort}`
      : user?.department || user?.cohort || t.dashboard.workspaceHeaderFallback;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <PageTransition className="space-y-7">
      {/* Header & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {subtitleText}
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B0F15] dark:text-white">
            {firstName ? `${greeting}${language === 'ar' ? '،' : ','} ${firstName}` : greeting}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="md"
            icon={<FolderPlus className="w-4 h-4" />}
            onClick={() => {
              setClsError('');
              setClassModalOpen(true);
            }}
          >
            {t.dashboard.createClass}
          </Button>
          {classes.length > 0 && (
            <Button
              variant="secondary"
              size="md"
              icon={<CalendarPlus className="w-4 h-4" />}
              onClick={() => {
                setMtgError('');
                setMeetingModalOpen(true);
              }}
            >
              {t.dashboard.scheduleMeeting}
            </Button>
          )}
          {liveMeeting && (
            <Button
              variant="primary"
              size="md"
              icon={<Video className="w-4 h-4" />}
              onClick={() => handleJoinRoom(liveMeeting.classId)}
            >
              {t.dashboard.joinLiveMeeting}
            </Button>
          )}
        </div>
      </div>

      {loadError && (
        <Card padding="md" className="border-red-300 dark:border-red-500/30 flex items-center gap-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{t.common.errorOccurred}</span>
        </Card>
      )}

      {showSkeleton ? (
        <DashboardSkeleton />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* 4-Column Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
              >
                <Card padding="md" className="h-full flex flex-col justify-between">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-2 font-display text-3xl font-bold tracking-tight text-[#0B0F15] dark:text-white tabular-nums">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    {stat.detail}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Primary 8-Column Area */}
            <div className="lg:col-span-8 space-y-6">
              {/* Today's Schedule */}
              <Card padding="lg">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="font-display text-lg font-bold text-[#0B0F15] dark:text-white">
                      {t.dashboard.todaysSchedule}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {formattedToday} · {t.dashboard.scheduledCount(todayMeetings.length)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<ArrowUpRight className="w-3.5 h-3.5 rtl:-scale-x-100" />}
                    onClick={() => navigate('/schedule')}
                  >
                    {t.dashboard.fullSchedule}
                  </Button>
                </div>

                {todayMeetings.length === 0 ? (
                  <div className="py-10 text-center space-y-3">
                    <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[#0B0F15] dark:text-white">
                        {t.dashboard.noMeetingsToday}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        {t.dashboard.noMeetingsTodayHint}
                      </p>
                    </div>
                    {classes.length > 0 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<CalendarPlus className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setMtgError('');
                          setMeetingModalOpen(true);
                        }}
                      >
                        {t.dashboard.scheduleMeeting}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-[#E3EAF2] dark:divide-white/[0.07]">
                    {todayMeetings.map((mtg) => {
                      const isLive = mtg.status === 'live';
                      return (
                        <div
                          key={mtg.id}
                          className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-4 min-w-0">
                            <div className="w-20 shrink-0 pt-0.5">
                              <p className="font-mono-tabular text-sm font-semibold text-[#0B0F15] dark:text-white">
                                {formatLocalizedTime(mtg.startTime, language)}
                              </p>
                              <p className="font-mono-tabular text-xs text-slate-400">
                                {formatLocalizedTime(mtg.endTime, language)}
                              </p>
                            </div>

                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                                <span className="font-mono-tabular font-semibold text-[#1D74CE] dark:text-[#69B6FF]">
                                  {mtg.courseCode}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span>{t.enums.sessionTypes[mtg.sessionType]}</span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono-tabular">{mtg.roomCode}</span>
                                {isLive && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="font-semibold text-[#16A34A] dark:text-emerald-400">
                                      {t.common.liveNow}
                                    </span>
                                  </>
                                )}
                              </div>

                              <h3 className="font-display text-base font-semibold text-[#0B0F15] dark:text-white truncate">
                                {mtg.title}
                              </h3>

                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <Avatar
                                  src={mtg.instructorAvatar}
                                  name={mtg.instructorName}
                                  initials={mtg.instructorName.slice(0, 2).toUpperCase()}
                                  size="xs"
                                />
                                <span>{mtg.instructorName}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 sm:ps-4">
                            <Button
                              variant={isLive ? 'primary' : 'secondary'}
                              size="sm"
                              icon={<Video className="w-3.5 h-3.5" />}
                              onClick={() => handleJoinRoom(mtg.classId)}
                            >
                              {isLive ? t.dashboard.joinClassBtn : t.dashboard.enterRoomBtn}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* My Classes Grid */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-[#0B0F15] dark:text-white">
                    {t.dashboard.upcomingClasses}
                  </h2>
                  {classes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => navigate('/classes')}
                      className="text-xs font-medium text-[#1D74CE] dark:text-[#69B6FF] hover:underline cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF]"
                    >
                      {t.dashboard.viewAllClasses(classes.length)}
                    </button>
                  )}
                </div>

                {classes.length === 0 ? (
                  <Card padding="lg" className="text-center py-12 space-y-3">
                    <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[#0B0F15] dark:text-white">
                        {t.dashboard.noClassesFound}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        {t.dashboard.noClassesFoundHint}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<FolderPlus className="w-4 h-4" />}
                      onClick={() => {
                        setClsError('');
                        setClassModalOpen(true);
                      }}
                    >
                      {t.dashboard.createFirstClass}
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {featuredClasses.map((cls) => {
                      const progressPct =
                        cls.totalSessions > 0
                          ? Math.round((cls.completedSessions / cls.totalSessions) * 100)
                          : 0;
                      return (
                        <Card
                          key={cls.id}
                          interactive
                          padding="md"
                          ariaLabel={`${cls.code}: ${cls.title}`}
                          className="flex flex-col justify-between gap-4"
                          onClick={() => handleJoinRoom(cls.id)}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <span className="font-mono-tabular font-semibold text-[#1D74CE] dark:text-[#69B6FF]">
                                {cls.code}
                              </span>
                              <span className="truncate">
                                {t.enums.disciplines[cls.discipline]}
                              </span>
                            </div>

                            <h3 className="font-display text-base font-bold text-[#0B0F15] dark:text-white leading-snug">
                              {cls.title}
                            </h3>

                            {cls.scheduleSummary && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{cls.scheduleSummary}</span>
                              </p>
                            )}
                          </div>

                          <div className="space-y-3 pt-2 border-t border-[#E3EAF2] dark:border-white/[0.07]">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                                <span>{t.dashboard.termProgress}</span>
                                <span>
                                  {formatLocalizedNumber(cls.completedSessions, language)}/
                                  {formatLocalizedNumber(cls.totalSessions, language)} (
                                  {formatLocalizedNumber(progressPct, language)}%)
                                </span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-[#EEF4F9] dark:bg-white/[0.08] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#69B6FF]"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <Avatar
                                  src={cls.instructorAvatar}
                                  name={cls.instructorName}
                                  initials={cls.instructorName.slice(0, 2).toUpperCase()}
                                  size="xs"
                                />
                                <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                                  {cls.instructorName}
                                </span>
                              </div>
                              <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0 rtl:-scale-x-100" />
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Secondary 4-Column Sidebar: Quick Actions + Notifications */}
            <div className="lg:col-span-4 space-y-6">
              <Card padding="lg">
                <h2 className="font-display text-lg font-bold text-[#0B0F15] dark:text-white mb-4">
                  {t.dashboard.quickActions}
                </h2>
                <div className="space-y-2.5">
                  {liveClass && (
                    <button
                      type="button"
                      onClick={() => handleJoinRoom(liveClass.id)}
                      className="w-full flex items-center justify-between p-3.5 rounded-[12px] bg-[#69B6FF]/15 hover:bg-[#69B6FF]/25 border border-[#69B6FF]/35 text-start transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Video className="w-4 h-4 text-[#1D74CE] dark:text-[#69B6FF] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#0B0F15] dark:text-white truncate">
                            {t.dashboard.actions.joinActiveTitle}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                            {t.dashboard.actions.joinActiveRoom(liveClass.code, liveClass.roomCode)}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#1D74CE] dark:text-[#69B6FF] shrink-0 rtl:-scale-x-100" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setClsError('');
                      setClassModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15]/60 hover:bg-[#EEF4F9] dark:hover:bg-white/[0.05] border border-[#E3EAF2] dark:border-white/[0.08] text-start transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FolderPlus className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0B0F15] dark:text-white truncate">
                          {t.dashboard.actions.createClassTitle}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {t.dashboard.actions.createClassDesc}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0 rtl:-scale-x-100" />
                  </button>

                  {classes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setMtgError('');
                        setMeetingModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15]/60 hover:bg-[#EEF4F9] dark:hover:bg-white/[0.05] border border-[#E3EAF2] dark:border-white/[0.08] text-start transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <CalendarPlus className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#0B0F15] dark:text-white truncate">
                            {t.dashboard.actions.scheduleMeetingTitle}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {t.dashboard.actions.scheduleMeetingDesc}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0 rtl:-scale-x-100" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => navigate('/classes')}
                    className="w-full flex items-center justify-between p-3.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15]/60 hover:bg-[#EEF4F9] dark:hover:bg-white/[0.05] border border-[#E3EAF2] dark:border-white/[0.08] text-start transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <BookOpen className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0B0F15] dark:text-white truncate">
                          {t.dashboard.actions.browseClassesTitle}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {t.dashboard.actions.browseClassesDesc}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0 rtl:-scale-x-100" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/settings')}
                    className="w-full flex items-center justify-between p-3.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15]/60 hover:bg-[#EEF4F9] dark:hover:bg-white/[0.05] border border-[#E3EAF2] dark:border-white/[0.08] text-start transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <SlidersHorizontal className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0B0F15] dark:text-white truncate">
                          {t.dashboard.actions.avSettingsTitle}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {t.dashboard.actions.avSettingsDesc}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0 rtl:-scale-x-100" />
                  </button>
                </div>
              </Card>

              {/* Real Firestore Notifications */}
              <Card padding="lg">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h2 className="font-display text-lg font-bold text-[#0B0F15] dark:text-white">
                    {t.dashboard.notificationsTitle}
                  </h2>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => markAllNotificationsRead()}
                      className="text-xs font-medium text-[#1D74CE] dark:text-[#69B6FF] hover:underline cursor-pointer"
                    >
                      {t.dashboard.notificationsMarkAll}
                    </button>
                  )}
                </div>

                {notificationsLoading ? (
                  <p className="text-xs text-slate-400 py-4">{t.common.loading}</p>
                ) : notifications.length === 0 ? (
                  <div className="py-6 text-center space-y-2">
                    <Bell className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-sm font-medium text-[#0B0F15] dark:text-white">
                      {t.dashboard.noNotifications}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t.dashboard.noNotificationsHint}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.slice(0, 5).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (!item.read) markNotificationRead(item.id);
                        }}
                        className="w-full text-start flex items-start gap-3 pb-4 last:pb-0 border-b last:border-b-0 border-[#E3EAF2] dark:border-white/[0.07] cursor-pointer group"
                      >
                        <div
                          className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5 ${
                            item.read
                              ? 'bg-[#EEF4F9] dark:bg-white/[0.06] text-slate-400'
                              : 'bg-[#69B6FF]/15 text-[#1D74CE] dark:text-[#69B6FF]'
                          }`}
                        >
                          {item.category === 'material' ? (
                            <FileText className="w-4 h-4" />
                          ) : item.category === 'session' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                            <span className="font-mono-tabular font-medium text-[#1D74CE] dark:text-[#69B6FF]">
                              {item.courseCode}
                            </span>
                            {item.createdAt > 0 && (
                              <span className="shrink-0">
                                {formatLocalizedDate(item.createdAt, language, {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-sm font-medium text-[#0B0F15] dark:text-white leading-snug">
                            {item.title}
                          </p>
                          {item.detail && (
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                              {item.detail}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </motion.div>
      )}

      {/* Modal: Create Class */}
      <Modal
        open={classModalOpen}
        onClose={() => setClassModalOpen(false)}
        title={t.classes.modalCreate.title}
        description={t.classes.modalCreate.description}
        maxWidthClass="max-w-xl"
      >
        <form onSubmit={handleCreateClassSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.classes.modalCreate.codeLabel}
              </label>
              <input
                type="text"
                required
                dir="ltr"
                value={clsCode}
                onChange={(e) => setClsCode(e.target.value)}
                placeholder={t.classes.modalCreate.codePlaceholder}
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm font-mono-tabular text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.classes.modalCreate.roomCodeLabel}
              </label>
              <input
                type="text"
                required
                dir="ltr"
                value={clsRoomCode}
                onChange={(e) => setClsRoomCode(e.target.value)}
                placeholder={t.classes.modalCreate.roomCodePlaceholder}
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm font-mono-tabular text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {t.classes.modalCreate.titleLabel}
            </label>
            <input
              type="text"
              required
              value={clsTitle}
              onChange={(e) => setClsTitle(e.target.value)}
              placeholder={t.classes.modalCreate.titlePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.classes.modalCreate.disciplineLabel}
              </label>
              <select
                value={clsDiscipline}
                onChange={(e) => setClsDiscipline(e.target.value as Discipline)}
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
              >
                {DISCIPLINES.map((d) => (
                  <option key={d} value={d}>
                    {t.enums.disciplines[d]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.classes.modalCreate.totalSessionsLabel}
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={clsTotalSessions}
                onChange={(e) => setClsTotalSessions(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm font-mono-tabular text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.classes.modalCreate.instructorLabel}
              </label>
              <input
                type="text"
                required
                value={clsInstructor}
                onChange={(e) => setClsInstructor(e.target.value)}
                placeholder={t.classes.modalCreate.instructorPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.classes.modalCreate.instructorTitleLabel}
              </label>
              <input
                type="text"
                value={clsInstructorTitle}
                onChange={(e) => setClsInstructorTitle(e.target.value)}
                placeholder={t.classes.modalCreate.instructorTitlePlaceholder}
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {t.classes.modalCreate.scheduleLabel}
            </label>
            <input
              type="text"
              value={clsSchedule}
              onChange={(e) => setClsSchedule(e.target.value)}
              placeholder={t.classes.modalCreate.schedulePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {t.classes.modalCreate.descriptionLabel}
            </label>
            <textarea
              rows={2}
              value={clsDescription}
              onChange={(e) => setClsDescription(e.target.value)}
              placeholder={t.classes.modalCreate.descriptionPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {t.classes.modalCreate.topicsLabel}
            </label>
            <textarea
              rows={2}
              value={clsTopics}
              onChange={(e) => setClsTopics(e.target.value)}
              placeholder={t.classes.modalCreate.topicsPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
            />
          </div>

          <label className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={clsLiveNow}
              onChange={(e) => setClsLiveNow(e.target.checked)}
              className="w-4 h-4 rounded border-[#E3EAF2] text-[#69B6FF] focus:ring-[#69B6FF]"
            />
            {t.classes.modalCreate.liveNowLabel}
          </label>

          {clsError && <p className="text-xs text-[#DC2626]">{clsError}</p>}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setClassModalOpen(false)}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={clsSubmitting}>
              {clsSubmitting ? t.common.saving : t.classes.modalCreate.submit}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Schedule Meeting */}
      <Modal
        open={meetingModalOpen}
        onClose={() => setMeetingModalOpen(false)}
        title={t.schedule.modal.title}
        description={t.schedule.modal.description}
      >
        <form onSubmit={handleCreateMeetingSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {t.schedule.modal.classLabel}
            </label>
            <select
              value={mtgClassId}
              onChange={(e) => setMtgClassId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {t.schedule.modal.topicLabel}
            </label>
            <input
              type="text"
              required
              value={mtgTitle}
              onChange={(e) => setMtgTitle(e.target.value)}
              placeholder={t.schedule.modal.topicPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.schedule.modal.dateLabel}
              </label>
              <input
                type="date"
                required
                dir="ltr"
                value={mtgDate}
                onChange={(e) => setMtgDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm font-mono-tabular text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.schedule.modal.startTimeLabel}
              </label>
              <input
                type="time"
                required
                dir="ltr"
                value={mtgStart}
                onChange={(e) => setMtgStart(e.target.value)}
                className="w-full px-3 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm font-mono-tabular text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.schedule.modal.endTimeLabel}
              </label>
              <input
                type="time"
                required
                dir="ltr"
                value={mtgEnd}
                onChange={(e) => setMtgEnd(e.target.value)}
                className="w-full px-3 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm font-mono-tabular text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {t.schedule.modal.sessionTypeLabel}
            </label>
            <select
              value={mtgType}
              onChange={(e) => setMtgType(e.target.value as SessionType)}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
            >
              {SESSION_TYPES.map((st) => (
                <option key={st} value={st}>
                  {t.enums.sessionTypes[st]}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={mtgLiveNow}
              onChange={(e) => setMtgLiveNow(e.target.checked)}
              className="w-4 h-4 rounded border-[#E3EAF2] text-[#69B6FF] focus:ring-[#69B6FF]"
            />
            {t.schedule.modal.markLiveLabel}
          </label>

          {mtgError && <p className="text-xs text-[#DC2626]">{mtgError}</p>}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setMeetingModalOpen(false)}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={mtgSubmitting}>
              {mtgSubmitting ? t.common.saving : t.schedule.modal.submit}
            </Button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
}
