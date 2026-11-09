import Modal from "./Modal.jsx";

/**
 * "Are you sure?" dialog. Cancel has focus, so Enter, Escape or a click
 * outside all back out; only the red button deletes.
 */
export default function ConfirmDialog({title, message, confirmLabel = "Delete", onConfirm, onCancel}) {
    return (
        <Modal role="alertdialog" title={title} description={message} onClose={onCancel}>
            <div className="mt-4 flex justify-end gap-2">
                <button
                    type="button"
                    autoFocus
                    onClick={onCancel}
                    className="rounded-md bg-stone-800 px-3 py-1.5 text-sm text-stone-100 hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/60"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400/60"
                >
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
}
