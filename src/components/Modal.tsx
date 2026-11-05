import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

const SELECTOR_FOKUS = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/**
 * Modal bersama untuk semua form.
 * Mengunci scroll, menahan Tab di dalam dialog, dan mengembalikan fokus
 * ke elemen pemicu saat ditutup.
 */
export default function Modal({ title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  // Selalu pakai callback terbaru tanpa memasang ulang listener tiap render.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const daftarFokus = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(SELECTOR_FOKUS) ?? [],
      ).filter((el) => el.offsetParent !== null);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const items = daftarFokus();
      if (items.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const pertama = items[0];
      const terakhir = items[items.length - 1];
      const aktif = document.activeElement;

      if (event.shiftKey && (aktif === pertama || aktif === dialogRef.current)) {
        event.preventDefault();
        terakhir.focus();
      } else if (!event.shiftKey && aktif === terakhir) {
        event.preventDefault();
        pertama.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    const kontrolPertama =
      dialogRef.current?.querySelector<HTMLElement>(
        "input:not([type='hidden']), select, textarea",
      ) ?? daftarFokus()[0];
    (kontrolPertama ?? dialogRef.current)?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl focus:outline-none"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <h3 id={titleId} className="text-lg font-bold text-slate-800">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="grid min-h-11 min-w-11 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
