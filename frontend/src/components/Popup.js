import React, { useEffect } from "react";
import "./Popup.css";

export default function Popup({ open, type = "success", message, onClose, duration = 2200 }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className="vv-pop-overlay" onClick={onClose}>
      <div
        className={`vv-pop-card ${type}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="vv-pop-title">
          {type === "success" ? "Success" : type === "error" ? "Error" : "Info"}
        </div>
        <div className="vv-pop-msg">{message}</div>

        <button className="vv-pop-btn" onClick={onClose} type="button">
          OK
        </button>
      </div>
    </div>
  );
}