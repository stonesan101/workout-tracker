import {useId} from "react";
import {useEscapeKey} from "./useEscapeKey.js";

/** Backdrop + panel shared by every pop-up. Escape or a click outside closes it. */
export default function Modal({title, description, role = "dialog", onClose, size = "sm", children}) {
    const titleId = useId();
    const descriptionId = useId();
    useEscapeKey(onClose);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                role={role}
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
                onClick={(e) => e.stopPropagation()}
                className={`w-full ${size === "sm" ? "max-w-sm" : "max-w-md"} max-h-[80vh] overflow-y-auto rounded-xl border border-stone-700 bg-stone-900 p-4 shadow-xl`}
            >
                <h2 id={titleId} className="text-sm font-semibold text-stone-100">{title}</h2>
                {description && <p id={descriptionId} className="mt-1 text-xs text-stone-400">{description}</p>}
                {children}
            </div>
        </div>
    );
}
