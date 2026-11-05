import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  notify: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const DURASI_MS = 5000;

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(item.id), DURASI_MS);
    return () => window.clearTimeout(timer);
  }, [item.id, onDismiss]);

  const Icon =
    item.kind === "success"
      ? CheckCircle2
      : item.kind === "error"
        ? AlertCircle
        : Info;

  return (
    <div
      className={`toast toast-${item.kind}`}
      role={item.kind === "error" ? "alert" : "status"}
    >
      <Icon size={19} aria-hidden="true" className="toast-icon" />
      <p>{item.message}</p>
      <button
        type="button"
        className="toast-close"
        onClick={() => onDismiss(item.id)}
        aria-label="Tutup notifikasi"
      >
        <X size={17} aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((message: string, kind: ToastKind = "success") => {
    const id = ++nextId.current;
    setItems((prev) => [...prev.slice(-2), { id, kind, message }]);
  }, []);

  const api = useMemo<ToastApi>(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-viewport" aria-live="polite">
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast harus digunakan di dalam ToastProvider");
  }
  return context;
}
