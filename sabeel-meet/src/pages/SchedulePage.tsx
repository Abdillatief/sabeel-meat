import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Bell,
  BellOff,
  CalendarPlus,
  Video,
  Clock,
  CheckCircle2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SessionType } from '../types';
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
import { Skeleton } from '../components/ui/Skeleton';
import { PageTransition } from '../components/ui/PageTransition';

const SESSION_TYPES: SessionType[] = [
  'Live Lecture',
  'Seminar Discussion',
  'Lab Workshop',
];

function getTodayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

function getTomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function SchedulePage() {
  const {
    meetings,
    meetingsLoading,
    meetingsError,
    classes,
    classesLoading,
    settings,
    createMeeting,
    toggleMeetingReminder,
    updateMeetingStatus,
    deleteMeeting,
    setActiveMeetingId,
    language,
    t,
  } = useApp();
  const navigate = useNavigate();

  const todayIso = getTodayIso();
  const tomorrowIso = getTomorrowIso();

  const [selectedDate, setSelectedDate] = useState<'all' | string>('all');
  const [createOpen, setCreateOpen] = useState(false);

  const [classId, setClassId] = useState('');
  const [topic, setTopic] = useState('');
  const [scheduledDate, setScheduledDate] = useState(todayIso);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [sessionType, setSessionType] = useState<SessionType>('Live Lecture');
  const [isLiveNow, setIsLiveNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!classId && classes[0]?.id) {
      setClassId(classes[0].id);
    }
  }, [classes, classId]);

  const uniqueDates = useMemo(() => {
    const dates = Array.from(new Set(meetings.map((m) => m.scheduledDate))).sort();
    return dates;
  }, [meetings]);

  const visibleMeetings = useMemo(() => {
    if (selectedDate === 'all') return meetings;
    return meetings.filter((m) => m.scheduledDate === selectedDate);
  }, [meetings, selectedDate]);

  const formatDateBadge = (iso: string) => {
    if (iso === todayIso) return t.common.today;
    if (iso === tomorrowIso) return t.common.tomorrow;
    return formatLocalizedDate(iso, language, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleJoin = (id: string) => {
    setActiveMeetingId(id);
    navigate(`/meeting/${id}`);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !topic.trim()) {
      setFormError(t.schedule.modal.validationError);
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      await createMeeting({
        classId,
        title: topic,
        scheduledDate,
        startTime,
        endTime,
        sessionType,
        isLiveNow,
      });
      setTopic('');
      setIsLiveNow(false);
      setSelectedDate(scheduledDate);
      setCreateOpen(false);
    } catch (err) {
      if (err instanceof Error && err.message === 'VALIDATION_ERROR') {
        setFormError(t.schedule.modal.validationError);
      } else {
        setFormError(getFirestoreErrorMessage(err, t));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B0F15] dark:text-white">
            {t.schedule.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t.schedule.subtitle}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<CalendarPlus className="w-4 h-4" />}
          disabled={classes.length === 0}
          onClick={() => {
            setFormError('');
            setCreateOpen(true);
          }}
        >
          {t.schedule.scheduleMeeting}
        </Button>
      </div>

      {/* Dynamic Date Filter Strip */}
      <div
        role="group"
        aria-label={t.schedule.title}
        className="flex items-center gap-1.5 p-1.5 rounded-[14px] bg-[#EEF4F9] dark:bg-[#121822] border border-[#E3EAF2] dark:border-white/[0.08] overflow-x-auto"
      >
        <button
          type="button"
          aria-pressed={selectedDate === 'all'}
          onClick={() => setSelectedDate('all')}
          className={`relative px-4 py-2 rounded-[10px] text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF] ${
            selectedDate === 'all'
              ? 'text-[#0B0F15] dark:text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-[#0B0F15] dark:hover:text-white'
          }`}
        >
          {selectedDate === 'all' && (
            <motion.span
              layoutId="schedule-day-tab"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="absolute inset-0 rounded-[10px] bg-white dark:bg-[#18202D] shadow-sm border border-[#E3EAF2]/80 dark:border-white/10"
            />
          )}
          <span className="relative z-10">{t.schedule.allDays(meetings.length)}</span>
        </button>

        {uniqueDates.map((dateIso) => {
          const count = meetings.filter((m) => m.scheduledDate === dateIso).length;
          const active = selectedDate === dateIso;
          return (
            <button
              key={dateIso}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedDate(dateIso)}
              className={`relative px-4 py-2 rounded-[10px] text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF] ${
                active
                  ? 'text-[#0B0F15] dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#0B0F15] dark:hover:text-white'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="schedule-day-tab"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-[10px] bg-white dark:bg-[#18202D] shadow-sm border border-[#E3EAF2]/80 dark:border-white/10"
                />
              )}
              <span className="relative z-10 tabular-nums">
                {formatDateBadge(dateIso)} · {formatLocalizedNumber(count, language)}
              </span>
            </button>
          );
        })}
      </div>

      {meetingsError && (
        <Card padding="md" className="border-red-300 dark:border-red-500/30 flex items-center gap-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{t.common.errorOccurred}</span>
        </Card>
      )}

      {/* Meetings List */}
      {meetingsLoading || classesLoading ? (
        <div className="space-y-3.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="sabeel-card p-6 flex flex-col sm:flex-row justify-between gap-4"
            >
              <div className="space-y-2.5 flex-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-44" />
              </div>
              <Skeleton className="h-9 w-28" />
            </div>
          ))}
        </div>
      ) : visibleMeetings.length === 0 ? (
        <Card padding="lg" className="text-center py-14 space-y-3">
          <Clock className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-display text-base font-bold text-[#0B0F15] dark:text-white">
            {t.schedule.noMeetingsScheduled}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {classes.length === 0 ? t.schedule.needClassFirst : t.schedule.noMeetingsDayHint}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            {selectedDate !== 'all' && meetings.length > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setSelectedDate('all')}>
                {t.schedule.viewAllDays}
              </Button>
            )}
            {classes.length === 0 ? (
              <Button variant="primary" size="sm" onClick={() => navigate('/classes')}>
                {t.meeting.goToClasses}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setFormError('');
                  setCreateOpen(true);
                }}
              >
                {t.schedule.scheduleMeeting}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {visibleMeetings.map((mtg, idx) => {
            const isLive = mtg.status === 'live';
            const isCompleted = mtg.status === 'completed';
            return (
              <motion.div
                key={mtg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, delay: idx * 0.03 }}
              >
                <Card
                  interactive
                  padding={settings.compactSchedule ? 'sm' : 'md'}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 min-w-0">
                    <div className="sm:w-36 shrink-0">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {formatDateBadge(mtg.scheduledDate)}
                      </p>
                      <p className="mt-0.5 font-mono-tabular text-sm sm:text-base font-bold text-[#0B0F15] dark:text-white">
                        {formatLocalizedTime(mtg.startTime, language)} –{' '}
                        {formatLocalizedTime(mtg.endTime, language)}
                      </p>
                      <p className="text-[11px] font-mono-tabular text-slate-400">
                        {formatLocalizedNumber(mtg.durationMinutes, language)}{' '}
                        {t.common.minutesShort}
                      </p>
                    </div>

                    <div className="min-w-0 space-y-1.5">
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
                        {isCompleted && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-medium text-slate-400">
                              {t.common.completed}
                            </span>
                          </>
                        )}
                      </div>

                      <h3 className="font-display text-base sm:text-lg font-bold text-[#0B0F15] dark:text-white truncate">
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

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {!isCompleted && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={
                            mtg.reminderEnabled ? (
                              <Bell className="w-3.5 h-3.5 text-[#1D74CE] dark:text-[#69B6FF]" />
                            ) : (
                              <BellOff className="w-3.5 h-3.5 text-slate-400" />
                            )
                          }
                          onClick={() => toggleMeetingReminder(mtg.id)}
                        >
                          {mtg.reminderEnabled ? t.schedule.reminderOn : t.schedule.remindMe}
                        </Button>

                        <button
                          type="button"
                          title={t.schedule.markCompleted}
                          aria-label={t.schedule.markCompleted}
                          onClick={() => updateMeetingStatus(mtg.id, 'completed')}
                          className="p-2 rounded-[10px] text-slate-400 hover:text-[#16A34A] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <Button
                      variant={isLive ? 'primary' : 'secondary'}
                      size="sm"
                      icon={<Video className="w-3.5 h-3.5" />}
                      onClick={() => handleJoin(mtg.classId)}
                    >
                      {isLive ? t.schedule.joinLive : t.schedule.enterRoom}
                    </Button>

                    <button
                      type="button"
                      title={t.common.delete}
                      aria-label={t.common.delete}
                      onClick={() => deleteMeeting(mtg.id)}
                      className="p-2 rounded-[10px] text-slate-400 hover:text-[#DC2626] hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal: Schedule Meeting */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t.schedule.modal.title}
        description={t.schedule.modal.description}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {t.schedule.modal.classLabel}
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
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
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
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
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
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
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
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
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm font-mono-tabular text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {t.schedule.modal.sessionTypeLabel}
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as SessionType)}
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
              checked={isLiveNow}
              onChange={(e) => setIsLiveNow(e.target.checked)}
              className="w-4 h-4 rounded border-[#E3EAF2] text-[#69B6FF] focus:ring-[#69B6FF]"
            />
            {t.schedule.modal.markLiveLabel}
          </label>

          {formError && <p className="text-xs text-[#DC2626]">{formError}</p>}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? t.common.saving : t.schedule.modal.submit}
            </Button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
}
