import { useApp } from '../../context/AppContext';

interface BrandLogoProps {
  collapsed?: boolean;
  darkText?: boolean;
}

export function BrandLogo({ collapsed = false, darkText }: BrandLogoProps) {
  const { t } = useApp();

  return (
    <div className="flex items-center gap-3 select-none shrink-0">
      <div className="w-9 h-9 rounded-[11px] bg-[#69B6FF] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(105,182,255,0.32)]">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M5 7.5C5 6.11929 6.11929 5 7.5 5H13.5C14.8807 5 16 6.11929 16 7.5V16.5C16 17.8807 14.8807 19 13.5 19H7.5C6.11929 19 5 17.8807 5 16.5V7.5Z"
            stroke="#0B0F15"
            strokeWidth="2"
          />
          <path
            d="M16 9.5L20 7.25V16.75L16 14.5"
            stroke="#0B0F15"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 10H12.5M8.5 14H11"
            stroke="#0B0F15"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {!collapsed && (
        <span
          className={`font-display text-[17px] font-bold tracking-tight whitespace-nowrap shrink-0 ${
            darkText === true
              ? 'text-[#0B0F15]'
              : darkText === false
              ? 'text-white'
              : 'text-[#0B0F15] dark:text-white'
          }`}
        >
          {t.brandName}
        </span>
      )}
    </div>
  );
}
