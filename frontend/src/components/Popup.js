import React, { useEffect } from "react";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiX,
} from "react-icons/fi";

export default function Popup({
  open,
  type = "success",
  title,
  message,
  onClose,
  duration = 2400,
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  const config = {
    success: {
      heading: title || "Success",
      icon: <FiCheckCircle className="text-[22px]" />,
      iconWrap:
        "bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50",
      accent: "border-emerald-200",
      button:
        "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-200",
    },
    error: {
      heading: title || "Error",
      icon: <FiAlertCircle className="text-[22px]" />,
      iconWrap: "bg-rose-100 text-rose-600 ring-4 ring-rose-50",
      accent: "border-rose-200",
      button: "bg-rose-600 hover:bg-rose-700 focus:ring-rose-200",
    },
    info: {
      heading: title || "Information",
      icon: <FiInfo className="text-[22px]" />,
      iconWrap: "bg-sky-100 text-sky-600 ring-4 ring-sky-50",
      accent: "border-sky-200",
      button: "bg-slate-900 hover:bg-slate-800 focus:ring-slate-200",
    },
  };

  const active = config[type] || config.success;

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-[420px] rounded-[24px] border ${active.accent} bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.22)]`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-live="polite"
      >
        <button
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          onClick={onClose}
          type="button"
          aria-label="Close popup"
        >
          <FiX />
        </button>

        <div className="flex items-start gap-4 pr-8">
          <div
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${active.iconWrap}`}
          >
            {active.icon}
          </div>

          <div className="flex-1">
            <h3 className="text-[20px] font-bold tracking-[-0.02em] text-slate-900">
              {active.heading}
            </h3>

            <p className="mt-2 text-[14px] leading-6 text-slate-600">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className={`inline-flex h-11 items-center justify-center rounded-[14px] px-5 text-[14px] font-semibold text-white transition focus:outline-none focus:ring-4 ${active.button}`}
            onClick={onClose}
            type="button"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}