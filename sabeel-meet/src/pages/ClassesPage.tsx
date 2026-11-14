import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Search,
  Video,
  BookOpen,
  Users,
  Clock,
  CheckCircle2,
  FolderPlus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassDoc, Discipline } from '../types';
import { formatLocalizedNumber, getFirestoreErrorMessage } from '../i18n/translations';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { PageTransition } from '../components/ui/PageTransition';

const FILTERS: Array<'All' | Discipline> = [
  'All',
  'Computer Science',
  'Mathematics',
  'Humanities',
  'Economics',
  'Sciences',
  'Languages',
];

const DISCIPLINES: Discipline[] = [
  'Computer Science',
  'Mathematics',
  'Humanities',
  'Economics',
  'Sciences',
  'Languages',
];

export function ClassesPage() {
  const {
    classes,
    classesLoading,
    classesError,
    createClass,
    deleteClass,
    setActiveMeetingId,
    language,
    t,
  } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<'All' | Discipline>('All');
  const [selectedClass, setSelectedClass] = useState<ClassDoc | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [discipline, setDiscipline] = useState<Discipline>('Computer Science');
  const [instructorName, setInstructorName] = useState('');
  const [instructorTitle, setInstructorTitle] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [scheduleSummary, setScheduleSummary] = useState('');
  const [totalSessions, setTotalSessions] = useState(12);
  const [description, setDescription] = useState('');
  const [topicsText, setTopicsText] = useState('');
  const [isLiveNow, setIsLiveNow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const matchesDiscipline =
        selectedDiscipline === 'All' || cls.discipline === selectedDiscipline;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        cls.title.toLowerCase().includes(q) ||
        cls.code.toLowerCase().includes(q) ||
        cls.instructorName.toLowerCase().includes(q);
      return matchesDiscipline && matchesSearch;
    });
  }, [classes, selectedDiscipline, searchQuery]);

  const handleJoinClass = (classId: string) => {
    setActiveMeetingId(classId);
    navigate(`/meeting/${classId}`);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !code.trim() ||
      !title.trim() ||
      !instructorName.trim() ||
      !roomCode.trim()
    ) {
      setFormError(t.classes.modalCreate.validationError);
      return;
    }

    setFormError('');
    setSubmitting(true);
    try {
      await createClass({
        code,
        title,
        discipline,
        instructorName,
        instructorTitle,
        roomCode,
        scheduleSummary,
        totalSessions: Number(totalSessions) || 12,
        description,
        syllabusTopics: topicsText.split('\n'),
        isLiveNow,
      });
      setCode('');
      setTitle('');
      setInstructorName('');
      setInstructorTitle('');
      setRoomCode('');
      setScheduleSummary('');
      setDescription('');
      setTopicsText('');
      setIsLiveNow(false);
      setCreateOpen(false);
    } catch (err) {
      if (err instanceof Error && err.message === 'VALIDATION_ERROR') {
        setFormError(t.classes.modalCreate.validationError);
      } else {
        setFormError(getFirestoreErrorMessage(err, t));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B0F15] dark:text-white">
            {t.classes.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t.classes.subtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              aria-label={t.classes.searchAriaLabel}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.classes.searchPlaceholder}
              className="w-full ps-10 pe-4 py-2.5 rounded-[12px] bg-white dark:bg-[#121822] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
            />
          </div>

          <Button
            variant="primary"
            size="md"
            icon={<FolderPlus className="w-4 h-4" />}
            onClick={() => {
              setFormError('');
              setCreateOpen(true);
            }}
          >
            {t.classes.createClass}
          </Button>
        </div>
      </div>

      {/* Discipline Filter Tabs */}
      <div
        role="group"
        aria-label={t.classes.modalCreate.disciplineLabel}
        className="flex items-center gap-1.5 p-1.5 rounded-[14px] bg-[#EEF4F9] dark:bg-[#121822] border border-[#E3EAF2] dark:border-white/[0.08] overflow-x-auto"
      >
        {FILTERS.map((filter) => {
          const active = selectedDiscipline === filter;
          const label =
            filter === 'All'
              ? t.classes.allDisciplines
              : t.enums.disciplines[filter];
          return (
            <button
              key={filter}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedDiscipline(filter)}
              className={`relative px-3.5 py-2 rounded-[10px] text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF] ${
                active
                  ? 'text-[#0B0F15] dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#0B0F15] dark:hover:text-white'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="classes-filter-tab"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-[10px] bg-white dark:bg-[#18202D] shadow-sm border border-[#E3EAF2]/80 dark:border-white/10"
                />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </div>

      {classesError && (
        <Card padding="md" className="border-red-300 dark:border-red-500/30 flex items-center gap-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{t.common.errorOccurred}</span>
        </Card>
      )}

      {/* Class Grid */}
      {classesLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="sabeel-card p-6 space-y-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <Card padding="lg" className="text-center py-14 space-y-3">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-display text-base font-bold text-[#0B0F15] dark:text-white">
            {t.classes.noClassesFound}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {t.classes.noClassesFoundHint}
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              icon={<FolderPlus className="w-4 h-4" />}
              onClick={() => {
                setFormError('');
                setCreateOpen(true);
              }}
            >
              {t.classes.createClass}
            </Button>
          </div>
        </Card>
      ) : filteredClasses.length === 0 ? (
        <Card padding="lg" className="text-center py-14 space-y-3">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-display text-base font-bold text-[#0B0F15] dark:text-white">
            {t.classes.noMatchingClasses}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {t.classes.noMatchingClassesHint}
          </p>
          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedDiscipline('All');
              }}
            >
              {t.common.clearFilters}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredClasses.map((cls, index) => {
            const pct =
              cls.totalSessions > 0
                ? Math.round((cls.completedSessions / cls.totalSessions) * 100)
                : 0;
            return (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: index * 0.04 }}
              >
                <Card
                  interactive
                  padding="lg"
                  className="h-full flex flex-col justify-between gap-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono-tabular font-semibold text-[#1D74CE] dark:text-[#69B6FF]">
                          {cls.code}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{t.enums.disciplines[cls.discipline]}</span>
                      </div>
                      {cls.isLiveNow && (
                        <span className="text-xs font-semibold text-[#16A34A] dark:text-emerald-400 shrink-0">
                          {t.common.liveNow}
                        </span>
                      )}
                    </div>

                    <div>
                      <h2 className="font-display text-lg font-bold text-[#0B0F15] dark:text-white leading-snug">
                        {cls.title}
                      </h2>
                      {cls.description && (
                        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {cls.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <Avatar
                        src={cls.instructorAvatar}
                        name={cls.instructorName}
                        initials={cls.instructorName.slice(0, 2).toUpperCase()}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#0B0F15] dark:text-white truncate">
                          {cls.instructorName}
                        </p>
                        {cls.instructorTitle && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {cls.instructorTitle}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-3 border-t border-[#E3EAF2] dark:border-white/[0.07]">
                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">
                          {cls.scheduleSummary || cls.roomCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end tabular-nums">
                        <Users className="w-3.5 h-3.5 shrink-0" />
                        <span>{t.classes.enrolledCount(cls.enrolledCount)}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        <span>{t.classes.sessionsCompleted}</span>
                        <span className="font-medium text-[#0B0F15] dark:text-white">
                          {formatLocalizedNumber(cls.completedSessions, language)}/
                          {formatLocalizedNumber(cls.totalSessions, language)} (
                          {formatLocalizedNumber(pct, language)}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#EEF4F9] dark:bg-white/[0.08] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#69B6FF] transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant={cls.isLiveNow ? 'primary' : 'secondary'}
                        size="sm"
                        icon={<Video className="w-3.5 h-3.5" />}
                        onClick={() => handleJoinClass(cls.id)}
                        className="flex-1"
                      >
                        {cls.isLiveNow ? t.classes.joinLiveRoom : t.classes.enterRoom}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedClass(cls)}
                      >
                        {t.classes.syllabus}
                      </Button>
                      <button
                        type="button"
                        aria-label={t.classes.deleteClass}
                        title={t.classes.deleteClass}
                        onClick={() => deleteClass(cls.id)}
                        className="p-2 rounded-[10px] text-slate-400 hover:text-[#DC2626] hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal: Syllabus Details */}
      <Modal
        open={Boolean(selectedClass)}
        onClose={() => setSelectedClass(null)}
        title={selectedClass ? `${selectedClass.code} · ${selectedClass.title}` : ''}
        description={selectedClass?.instructorName}
        maxWidthClass="max-w-xl"
      >
        {selectedClass && (
          <div className="space-y-5">
            {selectedClass.description && (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedClass.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/[0.08] text-xs">
              <div>
                <p className="text-slate-400">{t.classes.modalSyllabus.roomCode}</p>
                <p className="mt-0.5 font-mono-tabular font-semibold text-[#0B0F15] dark:text-white">
                  {selectedClass.roomCode}
                </p>
              </div>
              <div>
                <p className="text-slate-400">{t.classes.modalSyllabus.weeklySchedule}</p>
                <p className="mt-0.5 font-medium text-[#0B0F15] dark:text-white">
                  {selectedClass.scheduleSummary || t.common.notSpecified}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t.classes.modalSyllabus.modulesTitle}
              </h4>
              {selectedClass.syllabusTopics.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.classes.modalSyllabus.noTopics}
                </p>
              ) : (
                <ul className="space-y-2">
                  {selectedClass.syllabusTopics.map((topic, idx) => (
                    <li
                      key={`${topic}-${idx}`}
                      className="flex items-center gap-3 text-sm text-[#0B0F15] dark:text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#1D74CE] dark:text-[#69B6FF] shrink-0" />
                      <span className="font-mono-tabular text-xs text-slate-400 w-5">
                        {formatLocalizedNumber(idx + 1, language)}.
                      </span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button variant="ghost" onClick={() => setSelectedClass(null)}>
                {t.common.close}
              </Button>
              <Button
                variant="primary"
                icon={<Video className="w-4 h-4" />}
                onClick={() => {
                  const id = selectedClass.id;
                  setSelectedClass(null);
                  handleJoinClass(id);
                }}
              >
                {t.classes.modalSyllabus.enterRoom}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Create Class */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t.classes.modalCreate.title}
        description={t.classes.modalCreate.description}
        maxWidthClass="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                {t.classes.modalCreate.codeLabel}
              </label>
              <input
                type="text"
                required
                dir="ltr"
                value={code}
                onChange={(e) => setCode(e.target.value)}
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
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value as Discipline)}
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
                value={totalSessions}
                onChange={(e) => setTotalSessions(Number(e.target.value))}
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
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
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
                value={instructorTitle}
                onChange={(e) => setInstructorTitle(e.target.value)}
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
              value={scheduleSummary}
              onChange={(e) => setScheduleSummary(e.target.value)}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              value={topicsText}
              onChange={(e) => setTopicsText(e.target.value)}
              placeholder={t.classes.modalCreate.topicsPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
            />
          </div>

          <label className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isLiveNow}
              onChange={(e) => setIsLiveNow(e.target.checked)}
              className="w-4 h-4 rounded border-[#E3EAF2] text-[#69B6FF] focus:ring-[#69B6FF]"
            />
            {t.classes.modalCreate.liveNowLabel}
          </label>

          {formError && <p className="text-xs text-[#DC2626]">{formError}</p>}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? t.common.saving : t.classes.modalCreate.submit}
            </Button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
}
