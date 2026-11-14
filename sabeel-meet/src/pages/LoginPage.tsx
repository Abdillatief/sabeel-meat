import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Globe, Mail, Moon, Sun } from 'lucide-react';
import { BrandLogo } from '../components/ui/BrandLogo';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';

export function LoginPage() {
  const { login, theme, toggleTheme, language, setLanguage, t } = useApp();
  const navigate = useNavigate();

  const [emailHint, setEmailHint] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = emailHint.trim();
    if (trimmed && !trimmed.includes('@')) {
      setErrorMsg(t.login.invalidEmailError);
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await login(trimmed || undefined, rememberMe);
      navigate('/dashboard');
    } catch (err) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code?: unknown }).code)
          : '';
      if (code === 'auth/popup-closed-by-user') {
        setErrorMsg(t.login.popupClosedError);
      } else if (code === 'auth/popup-blocked') {
        setErrorMsg(t.login.popupBlockedError);
      } else {
        setErrorMsg(t.login.authFailedError);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F7FAFC] dark:bg-[#0B0F15] text-[#0B0F15] dark:text-slate-100">
      {/* Architectural Hero Panel */}
      <div className="relative lg:w-[48%] xl:w-[52%] min-h-[260px] lg:min-h-screen overflow-hidden bg-[#0B0F15]">
        <img
          src="/src/assets/images/login_study_architecture_1794679661562.jpg"
          alt={t.brandName}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F15]/92 via-[#0B0F15]/50 to-[#0B0F15]/25" />

        <div className="relative z-10 h-full flex flex-col justify-between p-6 sm:p-10 lg:p-12">
          <BrandLogo darkText={false} />

          <div className="max-w-lg space-y-4 mt-12 lg:mt-0">
            <p className="text-xs font-semibold text-[#69B6FF]">
              {t.login.eyebrow}
            </p>
            <h1 className="font-display text-2xl sm:text-4xl font-bold text-white leading-[1.2] text-balance">
              {t.login.heroTitle}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-md">
              {t.login.heroBody}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
              <span>{t.login.feature1}</span>
              <span aria-hidden="true">·</span>
              <span>{t.login.feature2}</span>
              <span aria-hidden="true">·</span>
              <span>{t.login.feature3}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sign-In Panel */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-[10px] text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#121822] border border-[#E3EAF2] dark:border-white/10 hover:border-[#69B6FF]/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF]"
          >
            <Globe className="w-3.5 h-3.5 text-[#1D74CE] dark:text-[#69B6FF]" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t.login.toggleTheme}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-[10px] text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#121822] border border-[#E3EAF2] dark:border-white/10 hover:border-[#69B6FF]/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF]"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5" />
                <span>{t.nav.darkMode}</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-[#69B6FF]" />
                <span>{t.nav.lightMode}</span>
              </>
            )}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[430px] mx-auto my-8"
        >
          <div className="mb-7">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B0F15] dark:text-white">
              {t.login.heading}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.login.subheading}
            </p>
          </div>

          <div className="sabeel-card p-6 sm:p-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  {t.login.googleEmailHintLabel}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    dir="ltr"
                    value={emailHint}
                    onChange={(e) => setEmailHint(e.target.value)}
                    autoComplete="email"
                    placeholder={t.login.googleEmailHintPlaceholder}
                    className="w-full ps-10 pe-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm text-[#0B0F15] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E3EAF2] text-[#69B6FF] focus:ring-[#69B6FF]"
                />
                {t.login.rememberDevice}
              </label>

              {errorMsg && (
                <p
                  role="alert"
                  className="text-xs text-[#DC2626] font-medium leading-relaxed"
                >
                  {errorMsg}
                </p>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  icon={<ArrowRight className="w-4 h-4 rtl:-scale-x-100" />}
                  className="w-full"
                >
                  {isSubmitting ? t.login.signingIn : t.login.continueWithGoogle}
                </Button>
              </div>
            </form>
          </div>

          <p className="mt-5 text-xs text-center text-slate-500 dark:text-slate-400">
            {t.login.authFooter}
          </p>
        </motion.div>

        <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-between gap-4">
          <span>{t.login.suiteName}</span>
          <span>{t.common.privacyTerms}</span>
        </div>
      </div>
    </div>
  );
}
