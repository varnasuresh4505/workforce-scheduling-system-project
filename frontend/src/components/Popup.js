import React, { useEffect } from "react";

export default function Popup({
  open,
  type = "success",
  message,
  onClose,
  duration = 2200,
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  const borderColor =
    type === "success"
      ? "border-l-[6px] border-green-600"
      : type === "error"
      ? "border-l-[6px] border-red-600"
      : "border-l-[6px] border-blue-600";

  const title =
    type === "success" ? "Success" : type === "error" ? "Error" : "Info";

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/45"
      onClick={onClose}
    >
      <div
        className={`w-[360px] max-w-[92vw] rounded-[14px] border border-slate-200 bg-white p-4 shadow-[0px_18px_60px_rgba(15,23,42,0.25)] ${borderColor}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-[6px] text-[16px] font-bold text-slate-900">
          {title}
        </div>

        <div className="mb-[14px] text-[14px] leading-[1.35] text-slate-600">
          {message}
        </div>

        <button
          className="h-[42px] w-full rounded-[10px] bg-slate-900 font-semibold text-white transition hover:bg-slate-800"
          onClick={onClose}
          type="button"
        >
          OK
        </button>
      </div>
    </div>
  );
}