import Modal from "./Modal";

export interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  onConfirm: () => void;
  onClose: () => void;
}

/** Konfirmasi memakai modal yang sama dengan form, bukan window.confirm. */
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  tone = "danger",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal title={title} onClose={onClose}>
      <div className="modal-body">
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={tone === "danger" ? "btn-danger" : "btn-primary"}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
