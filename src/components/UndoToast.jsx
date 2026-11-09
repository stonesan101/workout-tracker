import {useEffect} from "react";

export const UNDO_TIMEOUT_MS = 6000;

export default function UndoToast({message, onUndo, onDismiss}) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, UNDO_TIMEOUT_MS);
        return () => clearTimeout(timer);
    }, [message, onDismiss]);

    return (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
            <div className="flex items-center gap-4 rounded-lg border border-stone-700 bg-stone-800 px-4 py-2 text-sm text-stone-100 shadow-lg">
                <span>{message}</span>
                <button type="button" onClick={onUndo} className="font-medium text-amber-400 hover:text-amber-300">
                    Undo
                </button>
            </div>
        </div>
    );
}
