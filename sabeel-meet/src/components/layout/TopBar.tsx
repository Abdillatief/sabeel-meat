import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Video, Hash } from 'lucide-react';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { formatLocalizedDate } from '../../i18n/translations';

interface TopBarProps {
  onOpenMobileMenu: () => void;
  onOpenJoinModal: () => void;
}

export function TopBar({ onOpenMobileMenu, onOpenJoinModal }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { classes, setActiveMeetingId, language, t } = useApp();

  const liveClass = classes.find((c) => c.isLiveNow) ?? classes[0];
  const todayFormatted = formatLocalizedDate(new Date(), language);

  const routeMeta: Record<string, { title: string; subtitle: string }> = {
    '/dashboard': {
      title: t.topbar.routes.dashboardTitle,
      subtitle: `${todayFormatted} · ${t.topbar.routes.dashboardSubtitle}`,
    },
    '/classes': {
      title: t.topbar.routes.classesTitle,
      subtitle: t.topbar.routes.classesSubtitle(classes.length),
    },
    '/schedule': {
      title: t.topbar.routes.scheduleTitle,
      subtitle: t.topbar.routes.scheduleSubtitle,
    },
    '/profile': {
      title: t.topbar.routes.profileTitle,
      subtitle: t.topbar.routes.profileSubtitle,
    },
    '/settings': {
      title: t.topbar.routes.settingsTitle,
      subtitle: t.topbar.routes.settingsSubtitle,
    },
  };

  const meta = routeMeta[location.pathname] ?? {
    title: t.brandName,
    subtitle: t.topbar.routes.fallbackSubtitle,
  };

  return (
    <header className="sticky top-0 z-20 h-16 px-4 sm:px-8 flex items-center justify-between gap-3 bg-[#F7FAFC]/85 dark:bg-[#0B0F15]/85 backdrop-blur-md border-b border-[#E3EAF2] dark:border-white/[0.08]">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label={t.nav.openMenu}
          className="lg:hidden p-2 -ms-2 rounded-[10px] text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/[0.06] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2.5 text-sm">
            <span className="font-display font-bold text-[#0B0F15] dark:text-white truncate">
              {meta.title}
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-600" aria-hidden="true">
              /
            </span>
            <span className="hidden md:inline text-xs text-slate-500 dark:text-slate-400 truncate">
              {meta.subtitle}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <Button
          variant="secondary"
          size="sm"
          icon={<Hash className="w-3.5 h-3.5" />}
          onClick={onOpenJoinModal}
        >
          <span className="hidden sm:inline">{t.topbar.joinByCode}</span>
          <span className="sm:hidden">{t.topbar.joinByCodeShort}</span>
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={<Video className="w-3.5 h-3.5" />}
          onClick={() => {
            if (liveClass) {
              setActiveMeetingId(liveClass.id);
              navigate(`/meeting/${liveClass.id}`);
            } else {
              navigate('/meeting');
            }
          }}
        >
          <span className="hidden sm:inline">{t.topbar.joinLiveClass}</span>
          <span className="sm:hidden">{t.topbar.joinLiveShort}</span>
        </Button>
      </div>
    </header>
  );
}
