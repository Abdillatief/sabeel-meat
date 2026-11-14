import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Sun,
  Moon,
  Mic,
  Video,
  Volume2,
  Bell,
  Shield,
  LogOut,
  Check,
  Globe,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageTransition } from '../components/ui/PageTransition';

type SettingsTab = 'appearance' | 'av' | 'notifications' | 'account';

interface MediaDeviceOption {
  deviceId: string;
  label: string;
}

function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#0B0F15] dark:text-white">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        dir="ltr"
        aria-checked={checked}
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors duration-150 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF] ${
          checked ? 'bg-[#69B6FF]' : 'bg-slate-200 dark:bg-white/15'
        }`}
      >
        <motion.span
          animate={{ x: checked ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          className={`block w-5 h-5 rounded-full shadow-sm ${
            checked ? 'bg-[#0B0F15]' : 'bg-white'
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsPage() {
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    settings,
    updateSettings,
    user,
    logout,
    t,
  } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [testingMic, setTestingMic] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [micError, setMicError] = useState('');
  const [savedPing, setSavedPing] = useState(false);

  const [mics, setMics] = useState<MediaDeviceOption[]>([]);
  const [cams, setCams] = useState<MediaDeviceOption[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceOption[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  // Enumerate real hardware devices and listen for hot-plug/permission updates
  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    let mounted = true;

    const loadDevices = () => {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          if (!mounted) return;
          const audioIn = devices
            .filter((d) => d.kind === 'audioinput' && Boolean(d.deviceId))
            .map((d, idx) => ({
              deviceId: d.deviceId,
              label: d.label || `${t.settings.avSection.micLabel} ${idx + 1}`,
            }));
          const videoIn = devices
            .filter((d) => d.kind === 'videoinput' && Boolean(d.deviceId))
            .map((d, idx) => ({
              deviceId: d.deviceId,
              label: d.label || `${t.settings.avSection.camLabel} ${idx + 1}`,
            }));
          const audioOut = devices
            .filter((d) => d.kind === 'audiooutput' && Boolean(d.deviceId))
            .map((d, idx) => ({
              deviceId: d.deviceId,
              label: d.label || `${t.settings.avSection.spkLabel} ${idx + 1}`,
            }));
          setMics(audioIn);
          setCams(videoIn);
          setSpeakers(audioOut);
        })
        .catch(() => {
          // Silently retain System Default option if browser restricts enumeration
        });
    };

    loadDevices();
    navigator.mediaDevices.addEventListener?.('devicechange', loadDevices);

    return () => {
      mounted = false;
      navigator.mediaDevices.removeEventListener?.('devicechange', loadDevices);
    };
  }, [t.settings.avSection.camLabel, t.settings.avSection.micLabel, t.settings.avSection.spkLabel]);

  // Real Web Audio API microphone test
  useEffect(() => {
    if (!testingMic) {
      setMicLevel(0);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((tr) => tr.stop());
        streamRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      return;
    }

    let cancelled = false;
    setMicError('');

    async function startRealMicMeter() {
      try {
        const audioConstraint: MediaTrackConstraints | boolean = settings.microphoneId
          ? { deviceId: { ideal: settings.microphoneId } }
          : true;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraint });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;

        // Re-enumerate now that permission has been granted so real labels appear
        navigator.mediaDevices.enumerateDevices?.().then((devices) => {
          if (cancelled) return;
          setMics(
            devices
              .filter((d) => d.kind === 'audioinput' && Boolean(d.deviceId))
              .map((d, idx) => ({
                deviceId: d.deviceId,
                label: d.label || `${t.settings.avSection.micLabel} ${idx + 1}`,
              }))
          );
          setCams(
            devices
              .filter((d) => d.kind === 'videoinput' && Boolean(d.deviceId))
              .map((d, idx) => ({
                deviceId: d.deviceId,
                label: d.label || `${t.settings.avSection.camLabel} ${idx + 1}`,
              }))
          );
          setSpeakers(
            devices
              .filter((d) => d.kind === 'audiooutput' && Boolean(d.deviceId))
              .map((d, idx) => ({
                deviceId: d.deviceId,
                label: d.label || `${t.settings.avSection.spkLabel} ${idx + 1}`,
              }))
          );
        }).catch(() => {});

        const AudioContextCtor = window.AudioContext;
        const ctx = new AudioContextCtor();
        audioCtxRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const data = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          if (cancelled) return;
          analyser.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i += 1) {
            sum += data[i];
          }
          const avg = sum / data.length;
          const pct = Math.min(100, Math.round((avg / 128) * 100));
          setMicLevel(pct);
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        if (!cancelled) {
          setMicError(t.settings.avSection.micPermissionError);
          setTestingMic(false);
        }
      }
    }

    startRealMicMeter();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((tr) => tr.stop());
        streamRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [testingMic, settings.microphoneId, t.settings.avSection.micPermissionError]);

  const notifySaved = () => {
    setSavedPing(true);
    setTimeout(() => setSavedPing(false), 1800);
  };

  const tabs: Array<{ id: SettingsTab; label: string }> = [
    { id: 'appearance', label: t.settings.tabs.appearance },
    { id: 'av', label: t.settings.tabs.av },
    { id: 'notifications', label: t.settings.tabs.notifications },
    { id: 'account', label: t.settings.tabs.account },
  ];

  return (
    <PageTransition className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B0F15] dark:text-white">
            {t.settings.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t.settings.subtitle}
          </p>
        </div>

        {savedPing && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#16A34A] dark:text-emerald-400">
            <Check className="w-3.5 h-3.5" />
            {t.settings.preferencesSaved}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label={t.settings.title}
        className="flex items-center gap-1.5 p-1.5 rounded-[14px] bg-[#EEF4F9] dark:bg-[#121822] border border-[#E3EAF2] dark:border-white/[0.08] overflow-x-auto"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 rounded-[10px] text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF] ${
                active
                  ? 'text-[#0B0F15] dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#0B0F15] dark:hover:text-white'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="settings-tab"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-[10px] bg-white dark:bg-[#18202D] shadow-sm border border-[#E3EAF2]/80 dark:border-white/10"
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Appearance & Language Tab */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          {/* Language Switcher Card */}
          <Card padding="lg">
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-[#1D74CE] dark:text-[#69B6FF]" />
              <h2 className="font-display text-lg font-bold text-[#0B0F15] dark:text-white">
                {t.settings.languageSection.title}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
              {t.settings.languageSection.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                aria-pressed={language === 'ar'}
                onClick={() => {
                  setLanguage('ar');
                  notifySaved();
                }}
                className={`p-4 rounded-[16px] border text-start transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF] ${
                  language === 'ar'
                    ? 'border-[#69B6FF] ring-2 ring-[#69B6FF]/25 bg-[#F7FAFC] dark:bg-white/[0.04]'
                    : 'border-[#E3EAF2] dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-base font-bold text-[#0B0F15] dark:text-white">
                    {t.settings.languageSection.arabicName}
                  </span>
                  <span className="font-mono-tabular text-[11px] font-semibold text-[#1D74CE] dark:text-[#69B6FF]">
                    RTL
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {t.settings.languageSection.arabicSub}
                </p>
              </button>

              <button
                type="button"
                aria-pressed={language === 'en'}
                onClick={() => {
                  setLanguage('en');
                  notifySaved();
                }}
                className={`p-4 rounded-[16px] border text-start transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF] ${
                  language === 'en'
                    ? 'border-[#69B6FF] ring-2 ring-[#69B6FF]/25 bg-[#F7FAFC] dark:bg-white/[0.04]'
                    : 'border-[#E3EAF2] dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-base font-bold text-[#0B0F15] dark:text-white">
                    {t.settings.languageSection.englishName}
                  </span>
                  <span className="font-mono-tabular text-[11px] font-semibold text-[#1D74CE] dark:text-[#69B6FF]">
                    LTR
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {t.settings.languageSection.englishSub}
                </p>
              </button>
            </div>
          </Card>

          {/* Theme Card */}
          <Card padding="lg">
            <h2 className="font-display text-lg font-bold text-[#0B0F15] dark:text-white">
              {t.settings.themeSection.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
              {t.settings.themeSection.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                aria-pressed={theme === 'light'}
                onClick={() => {
                  setTheme('light');
                  notifySaved();
                }}
                className={`p-4 rounded-[16px] border text-start transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF] ${
                  theme === 'light'
                    ? 'border-[#69B6FF] ring-2 ring-[#69B6FF]/25 bg-[#F7FAFC] dark:bg-white/[0.04]'
                    : 'border-[#E3EAF2] dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="h-24 rounded-[12px] bg-[#F7FAFC] border border-[#E3EAF2] p-3 flex flex-col justify-between mb-3">
                  <div className="flex items-center justify-between">
                    <span className="w-14 h-2.5 rounded bg-[#0B0F15]/15" />
                    <span className="w-6 h-2.5 rounded bg-[#69B6FF]" />
                  </div>
                  <div className="h-10 rounded-[8px] bg-white border border-[#E3EAF2]" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-[#1D74CE] dark:text-[#69B6FF]" />
                    <span className="text-sm font-semibold text-[#0B0F15] dark:text-white">
                      {t.settings.themeSection.lightMode}
                    </span>
                  </div>
                  <span className="font-mono-tabular text-[11px] text-slate-400" dir="ltr">
                    #F7FAFC
                  </span>
                </div>
              </button>

              <button
                type="button"
                aria-pressed={theme === 'dark'}
                onClick={() => {
                  setTheme('dark');
                  notifySaved();
                }}
                className={`p-4 rounded-[16px] border text-start transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF] ${
                  theme === 'dark'
                    ? 'border-[#69B6FF] ring-2 ring-[#69B6FF]/25 bg-[#F7FAFC] dark:bg-white/[0.04]'
                    : 'border-[#E3EAF2] dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="h-24 rounded-[12px] bg-[#0B0F15] border border-white/10 p-3 flex flex-col justify-between mb-3">
                  <div className="flex items-center justify-between">
                    <span className="w-14 h-2.5 rounded bg-white/20" />
                    <span className="w-6 h-2.5 rounded bg-[#69B6FF]" />
                  </div>
                  <div className="h-10 rounded-[8px] bg-[#121822] border border-white/10" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-[#1D74CE] dark:text-[#69B6FF]" />
                    <span className="text-sm font-semibold text-[#0B0F15] dark:text-white">
                      {t.settings.themeSection.darkMode}
                    </span>
                  </div>
                  <span className="font-mono-tabular text-[11px] text-slate-400" dir="ltr">
                    #0B0F15
                  </span>
                </div>
              </button>
            </div>
          </Card>

          <Card padding="lg">
            <h2 className="font-display text-lg font-bold text-[#0B0F15] dark:text-white mb-4">
              {t.settings.layoutSection.title}
            </h2>
            <div className="divide-y divide-[#E3EAF2] dark:divide-white/[0.07]">
              <ToggleSwitch
                checked={settings.compactSchedule}
                onChange={() => {
                  updateSettings({ compactSchedule: !settings.compactSchedule });
                  notifySaved();
                }}
                label={t.settings.layoutSection.compactLabel}
                description={t.settings.layoutSection.compactDesc}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Audio & Video Hardware Tab */}
      {activeTab === 'av' && (
        <div className="space-y-6">
          <Card padding="lg" className="space-y-5">
            <div>
              <h2 className="font-display text-lg font-bold text-[#0B0F15] dark:text-white">
                {t.settings.avSection.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t.settings.avSection.description}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="set-mic"
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                >
                  <Mic className="w-3.5 h-3.5" />
                  {t.settings.avSection.micLabel}
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <select
                    id="set-mic"
                    value={settings.microphoneId}
                    onChange={(e) => {
                      updateSettings({ microphoneId: e.target.value });
                      notifySaved();
                    }}
                    className="flex-1 px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
                  >
                    <option value="">{t.settings.avSection.systemDefault}</option>
                    {mics.map((m) => (
                      <option key={m.deviceId} value={m.deviceId}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant={testingMic ? 'primary' : 'secondary'}
                    size="md"
                    onClick={() => setTestingMic((prev) => !prev)}
                  >
                    {testingMic ? t.settings.avSection.stopTest : t.settings.avSection.testMic}
                  </Button>
                </div>

                {micError && (
                  <p className="mt-2 text-xs text-[#DC2626]">{micError}</p>
                )}

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{t.settings.avSection.inputLevel}</span>
                    <span className="font-mono-tabular">
                      {testingMic
                        ? t.settings.avSection.receivingSignal(micLevel)
                        : t.settings.avSection.idle}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#EEF4F9] dark:bg-white/[0.08] overflow-hidden">
                    <motion.div
                      animate={{ width: `${micLevel}%` }}
                      transition={{ duration: 0.08 }}
                      className="h-full rounded-full bg-[#69B6FF]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="set-cam"
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                >
                  <Video className="w-3.5 h-3.5" />
                  {t.settings.avSection.camLabel}
                </label>
                <select
                  id="set-cam"
                  value={settings.cameraId}
                  onChange={(e) => {
                    updateSettings({ cameraId: e.target.value });
                    notifySaved();
                  }}
                  className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
                >
                  <option value="">{t.settings.avSection.systemDefault}</option>
                  {cams.map((c) => (
                    <option key={c.deviceId} value={c.deviceId}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="set-spk"
                  className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {t.settings.avSection.spkLabel}
                </label>
                <select
                  id="set-spk"
                  value={settings.speakerId}
                  onChange={(e) => {
                    updateSettings({ speakerId: e.target.value });
                    notifySaved();
                  }}
                  className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
                >
                  <option value="">{t.settings.avSection.systemDefault}</option>
                  {speakers.map((s) => (
                    <option key={s.deviceId} value={s.deviceId}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="font-display text-base font-bold text-[#0B0F15] dark:text-white mb-4">
              {t.settings.avSection.entryDefaultsTitle}
            </h3>
            <div className="divide-y divide-[#E3EAF2] dark:divide-white/[0.07]">
              <ToggleSwitch
                checked={settings.autoMuteOnJoin}
                onChange={() => {
                  updateSettings({ autoMuteOnJoin: !settings.autoMuteOnJoin });
                  notifySaved();
                }}
                label={t.settings.avSection.muteOnEntryLabel}
                description={t.settings.avSection.muteOnEntryDesc}
              />
              <ToggleSwitch
                checked={settings.cameraOffOnJoin}
                onChange={() => {
                  updateSettings({ cameraOffOnJoin: !settings.cameraOffOnJoin });
                  notifySaved();
                }}
                label={t.settings.avSection.camOffOnEntryLabel}
                description={t.settings.avSection.camOffOnEntryDesc}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card padding="lg">
          <div className="flex items-center gap-2.5 mb-5">
            <Bell className="w-4 h-4 text-[#1D74CE] dark:text-[#69B6FF]" />
            <h2 className="font-display text-lg font-bold text-[#0B0F15] dark:text-white">
              {t.settings.notificationsSection.title}
            </h2>
          </div>

          <div className="divide-y divide-[#E3EAF2] dark:divide-white/[0.07]">
            <ToggleSwitch
              checked={settings.sessionReminders}
              onChange={() => {
                updateSettings({ sessionReminders: !settings.sessionReminders });
                notifySaved();
              }}
              label={t.settings.notificationsSection.remindersLabel}
              description={t.settings.notificationsSection.remindersDesc}
            />
            <ToggleSwitch
              checked={settings.chatMentions}
              onChange={() => {
                updateSettings({ chatMentions: !settings.chatMentions });
                notifySaved();
              }}
              label={t.settings.notificationsSection.mentionsLabel}
              description={t.settings.notificationsSection.mentionsDesc}
            />
            <ToggleSwitch
              checked={settings.materialUploads}
              onChange={() => {
                updateSettings({ materialUploads: !settings.materialUploads });
                notifySaved();
              }}
              label={t.settings.notificationsSection.materialsLabel}
              description={t.settings.notificationsSection.materialsDesc}
            />
            <ToggleSwitch
              checked={settings.weeklyDigest}
              onChange={() => {
                updateSettings({ weeklyDigest: !settings.weeklyDigest });
                notifySaved();
              }}
              label={t.settings.notificationsSection.digestLabel}
              description={t.settings.notificationsSection.digestDesc}
            />
          </div>
        </Card>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <Card padding="lg" className="space-y-6">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-[#1D74CE] dark:text-[#69B6FF]" />
            <h2 className="font-display text-lg font-bold text-[#0B0F15] dark:text-white">
              {t.settings.accountSection.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-[14px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/[0.08] text-sm">
            <div>
              <p className="text-xs text-slate-400">{t.settings.accountSection.signedInAs}</p>
              <p className="mt-0.5 font-semibold text-[#0B0F15] dark:text-white">
                {user?.name || t.common.notSpecified}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">{t.settings.accountSection.emailLabel}</p>
              <p className="mt-0.5 font-medium text-[#0B0F15] dark:text-white truncate" dir="ltr">
                {user?.email || t.common.notSpecified}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">{t.settings.accountSection.roleLabel}</p>
              <p className="mt-0.5 font-medium text-[#0B0F15] dark:text-white">
                {user ? t.enums.roles[user.role] : t.common.notSpecified}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#E3EAF2] dark:border-white/[0.07]">
            <div>
              <p className="text-sm font-semibold text-[#0B0F15] dark:text-white">
                {t.settings.accountSection.signOutTitle}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.settings.accountSection.signOutDesc}
              </p>
            </div>
            <Button
              variant="danger"
              size="md"
              icon={<LogOut className="w-4 h-4 rtl:-scale-x-100" />}
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
            >
              {t.settings.accountSection.signOutBtn}
            </Button>
          </div>
        </Card>
      )}
    </PageTransition>
  );
}
