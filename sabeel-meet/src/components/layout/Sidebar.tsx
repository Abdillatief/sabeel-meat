import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  User,
  Settings,
  Video,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  LogOut,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../ui/BrandLogo';
import { Avatar } from '../ui/Avatar';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const {
    sidebarCollapsed,
    toggleSidebar,
    theme,
    toggleTheme,
    user,
    logout,
    t,
    isRtl,
  } = useApp();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { to: '/classes', label: t.nav.classes, icon: BookOpen },
    { to: '/schedule', label: t.nav.schedule, icon: Calendar },
    { to: '/meeting', label: t.nav.meeting, icon: Video },
    { to: '/profile', label: t.nav.profile, icon: User },
    { to: '/settings', label: t.nav.settings, icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = user?.name || t.common.loading;
  const displayRole = user ? t.enums.roles[user.role] : '';
  const displayInitials = user?.initials || 'U';

  const renderNavLinks = (isCollapsed: boolean) => (
    <nav aria-label={t.brandName} className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onCloseMobile}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              `relative group flex items-center gap-3 min-h-[40px] px-3 py-2.5 rounded-[12px] text-sm font-medium transition-colors duration-150 whitespace-nowrap overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF] ${
                isActive
                  ? 'text-[#0B0F15] dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-[#0B0F15] dark:hover:text-white hover:bg-[#EEF4F9]/70 dark:hover:bg-white/[0.04]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-indicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-[12px] bg-[#69B6FF]/20 dark:bg-[#69B6FF]/15 border border-[#69B6FF]/35 dark:border-[#69B6FF]/25"
                  />
                )}
                <Icon
                  className={`relative z-10 w-[18px] h-[18px] shrink-0 transition-colors ${
                    isActive
                      ? 'text-[#1D74CE] dark:text-[#69B6FF]'
                      : 'text-slate-500 dark:text-slate-400 group-hover:text-[#0B0F15] dark:group-hover:text-white'
                  }`}
                />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: isRtl ? 4 : -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRtl ? 4 : -4 }}
                    transition={{ duration: 0.14 }}
                    className="relative z-10 truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  const renderFooter = (isCollapsed: boolean) => (
    <div className="p-3 border-t border-[#E3EAF2] dark:border-white/[0.08] space-y-2">
      <button
        type="button"
        onClick={toggleTheme}
        title={theme === 'light' ? t.nav.darkMode : t.nav.lightMode}
        className="w-full min-h-[40px] flex items-center gap-3 px-3 py-2 rounded-[12px] text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-[#EEF4F9] dark:hover:bg-white/[0.05] transition-colors cursor-pointer whitespace-nowrap overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF]"
      >
        {theme === 'light' ? (
          <Moon className="w-[18px] h-[18px] shrink-0 text-slate-500" />
        ) : (
          <Sun className="w-[18px] h-[18px] shrink-0 text-[#69B6FF]" />
        )}
        {!isCollapsed && (
          <span className="truncate">
            {theme === 'light' ? t.nav.darkMode : t.nav.lightMode}
          </span>
        )}
      </button>

      <div
        className={`flex items-center gap-3 px-2.5 py-2 rounded-[14px] bg-[#F7FAFC] dark:bg-[#0B0F15]/70 border border-[#E3EAF2] dark:border-white/[0.06] ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        <button
          type="button"
          onClick={() => {
            navigate('/profile');
            onCloseMobile();
          }}
          aria-label={displayName}
          className="flex items-center gap-2.5 min-w-0 text-start cursor-pointer rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF]"
        >
          <Avatar
            src={user?.avatarUrl}
            name={displayName}
            initials={displayInitials}
            size="sm"
          />
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#0B0F15] dark:text-white truncate">
                {displayName}
              </p>
              {displayRole && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {displayRole}
                </p>
              )}
            </div>
          )}
        </button>

        {!isCollapsed && (
          <button
            type="button"
            onClick={handleLogout}
            title={t.nav.signOut}
            aria-label={t.nav.signOut}
            className="p-1.5 rounded-[8px] text-slate-400 hover:text-[#DC2626] hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF]"
          >
            <LogOut className="w-4 h-4 rtl:-scale-x-100" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Collapsible Sidebar (automatically sits on right in RTL, left in LTR) */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 76 : 256 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-col shrink-0 h-screen sticky top-0 bg-white dark:bg-[#121822] border-e border-[#E3EAF2] dark:border-white/[0.08] z-30 select-none"
      >
        <div
          className={`h-16 flex items-center px-4 border-b border-[#E3EAF2] dark:border-white/[0.08] ${
            sidebarCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <BrandLogo collapsed={sidebarCollapsed} />
          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={t.nav.collapseSidebar}
              className="p-1.5 rounded-[9px] text-slate-400 hover:text-[#0B0F15] dark:hover:text-white hover:bg-[#EEF4F9] dark:hover:bg-white/[0.06] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF]"
            >
              <PanelLeftClose className="w-4 h-4 rtl:-scale-x-100" />
            </button>
          )}
        </div>

        {sidebarCollapsed && (
          <div className="px-3 pt-3 flex justify-center">
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={t.nav.expandSidebar}
              title={t.nav.expandSidebar}
              className="p-2 rounded-[10px] text-slate-400 hover:text-[#0B0F15] dark:hover:text-white hover:bg-[#EEF4F9] dark:hover:bg-white/[0.06] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF]"
            >
              <PanelLeftOpen className="w-4 h-4 rtl:-scale-x-100" />
            </button>
          </div>
        )}

        {renderNavLinks(sidebarCollapsed)}
        {renderFooter(sidebarCollapsed)}
      </motion.aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-[#0B0F15]/45 backdrop-blur-[2px]"
            />
            <motion.aside
              initial={{ x: isRtl ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '100%' : '-100%' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-72 max-w-[85vw] h-full bg-white dark:bg-[#121822] border-e border-[#E3EAF2] dark:border-white/[0.08] flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-[#E3EAF2] dark:border-white/[0.08]">
                <BrandLogo />
                <button
                  type="button"
                  onClick={onCloseMobile}
                  aria-label={t.nav.closeMenu}
                  className="p-2 rounded-[10px] text-slate-400 hover:text-[#0B0F15] dark:hover:text-white hover:bg-[#EEF4F9] dark:hover:bg-white/[0.06] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {renderNavLinks(false)}
              {renderFooter(false)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
