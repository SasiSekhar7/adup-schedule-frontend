"use client";

import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Radio, type LucideIcon } from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: { title: string; url: string }[];
}

interface MobileBottomNavProps {
  items: NavItem[];
  /** Optional center floating action button, e.g. "Live" preview */
  fab?: {
    label: string;
    icon?: LucideIcon;
    onClick?: () => void;
    url?: string;
  };
  /** Limit how many sidebar items surface as tabs (rest still live in the sidebar) */
  maxTabs?: number;
}

/**
 * Bottom tab bar shown only on small screens, styled to match the
 * mobile app: white bar, active tab in primary blue, inactive in muted
 * slate, with an optional raised circular "LIVE" button in the center.
 */
export function MobileBottomNav({
  items,
  fab = { label: "Live", icon: Radio },
  maxTabs = 4,
}: MobileBottomNavProps) {
  const location = useLocation();

  const tabs = items.slice(0, maxTabs);
  const FabIcon = fab.icon ?? Radio;

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-40
        flex md:hidden
        border-t border-border bg-card
        pb-[env(safe-area-inset-bottom)]
      "
    >
      <div className="relative flex w-full items-stretch justify-between px-2">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon ?? Radio;

          const activeItem =
            tab.items?.find((item) => item.isActive) || tab.items?.[0];

          const tabUrl = activeItem?.url || tab.url;

          const isActive =
            tab.items?.some((item) => item.isActive) ||
            location.pathname.startsWith(tab.url);

          const isMidpoint = idx === Math.floor(tabs.length / 2);

          return (
            <React.Fragment key={tab.url}>
              {isMidpoint && fab && (
                <div className="w-16 shrink-0" aria-hidden />
              )}

              <Link
                to={tabUrl}
                className={`
          flex flex-1 flex-col items-center justify-center gap-1
          py-2 text-[11px] font-medium transition-colors
          ${isActive ? "text-primary" : "text-muted-foreground"}
        `}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2.4 : 2}
                />
                <span className="truncate max-w-[64px]">{tab.title}</span>
              </Link>
            </React.Fragment>
          );
        })}

        {/* Floating center action button, like the app's blue "LIVE" pill */}
        {fab && (
          <button
            onClick={fab.onClick}
            aria-label={fab.label}
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--primary-600)) 0%, hsl(var(--primary-700)) 100%)",
            }}
            className="
              absolute -top-6 left-1/2 -translate-x-1/2
              flex h-14 w-14 items-center justify-center
              rounded-full text-primary-foreground
              shadow-hero-glow ring-4 ring-background
              active:scale-95 transition-transform
            "
          >
            <FabIcon className="h-6 w-6" />
          </button>
        )}
      </div>
    </nav>
  );
}
