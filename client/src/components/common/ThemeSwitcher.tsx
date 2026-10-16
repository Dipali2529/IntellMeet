
import { useEffect, useState } from "react";
import {
  Sun,
  Moon,
  Monitor,
  Check,
  ChevronDown,
} from "lucide-react";

type Theme = "light" | "dark" | "system";

const getSavedTheme = (): Theme => {
  const saved = localStorage.getItem("intellmeet-theme");

  if (saved === "light" || saved === "dark" || saved === "system") {
    return saved;
  }

  return "system";
};

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>(getSavedTheme);
  const [isOpen, setIsOpen] = useState(false);
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const updateSystemTheme = () => setSystemDark(media.matches);

    updateSystemTheme();
    media.addEventListener("change", updateSystemTheme);

    return () => {
      media.removeEventListener("change", updateSystemTheme);
    };
  }, []);

  useEffect(() => {
    const isDark = theme === "dark" || (theme === "system" && systemDark);

    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    localStorage.setItem("intellmeet-theme", theme);
  }, [theme, systemDark]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const effectiveDark =
    theme === "dark" || (theme === "system" && systemDark);

  const CurrentIcon = effectiveDark ? Moon : Sun;

  const options: {
    value: Theme;
    label: string;
    Icon: typeof Sun;
  }[] = [
    { value: "light", label: "Light", Icon: Sun },
    { value: "dark", label: "Dark", Icon: Moon },
    { value: "system", label: "System", Icon: Monitor },
  ];

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label="Choose theme"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        title="Change theme"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 items-center gap-1.5 rounded-xl px-3 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <CurrentIcon size={21} />
        <ChevronDown size={14} className="hidden sm:block" />
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close theme menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />

          <div
            role="menu"
            aria-label="Theme options"
            className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {options.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={theme === value}
                onClick={() => {
                  setTheme(value);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Icon size={20} />
                <span className="flex-1">{label}</span>
                {theme === value && <Check size={18} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
