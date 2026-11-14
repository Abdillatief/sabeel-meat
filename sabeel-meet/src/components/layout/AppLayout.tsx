import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const navigate = useNavigate();
  const { classes, setActiveMeetingId, t } = useApp();

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = roomCode.trim().toUpperCase();
    if (!cleaned) {
      setCodeError(t.topbar.joinModal.invalidEmpty);
      return;
    }
    const matched = classes.find((c) => c.roomCode.toUpperCase() === cleaned);
    if (!matched) {
      setCodeError(t.topbar.joinModal.notFound(cleaned));
      return;
    }
    setActiveMeetingId(matched.id);
    setCodeError('');
    setJoinModalOpen(false);
    navigate(`/meeting/${matched.id}`);
  };

  return (
    <div className="min-h-screen flex bg-[#F7FAFC] dark:bg-[#0B0F15] text-[#0B0F15] dark:text-slate-100">
      <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenJoinModal={() => {
            setCodeError('');
            setJoinModalOpen(true);
          }}
        />

        <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <Outlet />
        </main>
      </div>

      <Modal
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        title={t.topbar.joinModal.title}
        description={t.topbar.joinModal.description}
      >
        <form onSubmit={handleJoinByCode} className="space-y-4">
          <div>
            <label
              htmlFor="room-code-input"
              className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5"
            >
              {t.topbar.joinModal.roomCodeLabel}
            </label>
            <input
              id="room-code-input"
              type="text"
              dir="ltr"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value);
                setCodeError('');
              }}
              placeholder={t.topbar.joinModal.roomCodePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10 text-sm font-mono-tabular uppercase tracking-wide text-[#0B0F15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#69B6FF]"
            />
            {codeError && (
              <p className="mt-1.5 text-xs text-[#DC2626]">{codeError}</p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.topbar.joinModal.availableRooms}
            </p>
            {classes.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-3 px-3.5 rounded-[12px] bg-[#F7FAFC] dark:bg-[#0B0F15] border border-[#E3EAF2] dark:border-white/10">
                {t.topbar.joinModal.noRoomsAvailable}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {classes.slice(0, 4).map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setRoomCode(cls.roomCode)}
                    className={`p-2.5 rounded-[12px] border text-start transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#69B6FF] ${
                      roomCode.toUpperCase() === cls.roomCode
                        ? 'border-[#69B6FF] bg-[#69B6FF]/10'
                        : 'border-[#E3EAF2] dark:border-white/10 hover:bg-[#F7FAFC] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <p className="text-xs font-mono-tabular font-semibold text-[#1D74CE] dark:text-[#69B6FF]">
                      {cls.roomCode}
                    </p>
                    <p className="text-xs font-medium text-[#0B0F15] dark:text-white truncate mt-0.5">
                      {cls.code} · {cls.title}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setJoinModalOpen(false)}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<ArrowRight className="w-4 h-4 rtl:-scale-x-100" />}
            >
              {t.topbar.joinModal.enterRoom}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
