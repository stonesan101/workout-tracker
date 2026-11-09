import {useEffect, useRef, useState} from "react";
import {ChevronDown, ChevronRight, Pencil, Trash2} from "lucide-react";
import SetTable from "./SetTable.jsx";
import ExerciseStats from "./ExerciseStats.jsx";
import {getLastSession} from "../lib/sessions.js";
import {getCurrentPersonalBest} from "../lib/personalBests.js";
import {formatDate, formatSet} from "../lib/format.js";
import {
    deleteIconButtonClass,
    iconButtonClass,
    inputClass,
    primaryButtonClass,
    secondaryButtonClass,
} from "./fields.js";

function finishMessage(result) {
    if (!result.saved) return "Log at least one set with weight and reps first.";
    if (!result.isNewPB) return "Session saved.";
    const was = result.previousPB ? ` (was ${formatSet(result.previousPB.source.bestSet)})` : "";
    return `New PB! ${formatSet(result.session.bestSet)} lb${was}. Session saved.`;
}

/** One-line summary so collapsed exercises are easy to tell apart. */
function summaryText(exercise, lastSession) {
    const pb = getCurrentPersonalBest(exercise, "e1RM");
    const parts = [];
    if (pb) parts.push(`PB ${formatSet(pb.source.bestSet)} lb`);
    if (lastSession) parts.push(`last ${formatDate(lastSession.finishedAt)}`);
    return parts.length ? parts.join(" · ") : "No sessions yet";
}

function RenameInput({name, onDone}) {
    const [draft, setDraft] = useState(name);
    return (
        <input
            autoFocus
            type="text"
            aria-label="Exercise name"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => onDone(draft)}
            onKeyDown={(e) => {
                if (e.key === "Enter") onDone(draft);
                if (e.key === "Escape") onDone(null);
            }}
            className={`flex-1 ${inputClass}`}
        />
    );
}

export default function ExerciseCard({
                                         exercise,
                                         groupName,
                                         expanded,
                                         onToggle,
                                         onRename,
                                         onFieldChange,
                                         onFieldBlur,
                                         onAddSet,
                                         onSetChange,
                                         onSetWeightBlur,
                                         onRemoveSet,
                                         onFinish,
                                         onShowHistory,
                                         onDelete,
                                     }) {
    const [renaming, setRenaming] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const cardRef = useRef(null);
    const [wasExpanded, setWasExpanded] = useState(expanded);
    const lastSession = getLastSession(exercise);

    // Clear the "Session saved" message once the card is closed.
    if (expanded !== wasExpanded) {
        setWasExpanded(expanded);
        if (!expanded) setFeedback(null);
    }

    // Bring the newly opened exercise into view so it's obvious which one you're on.
    useEffect(() => {
        if (expanded) cardRef.current?.scrollIntoView?.({block: "nearest", behavior: "smooth"});
    }, [expanded]);

    function handleFinish() {
        setFeedback(finishMessage(onFinish()));
    }

    function finishRename(value) {
        if (value !== null) onRename(value); // blank names are ignored upstream
        setRenaming(false);
    }

    return (
        <article
            ref={cardRef}
            role="region"
            aria-label={`${groupName}: ${exercise.name}`}
            aria-current={expanded ? "true" : undefined}
            className={`rounded-lg border transition-colors ${expanded
                ? "border-amber-500/70 bg-stone-900 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
                : "border-stone-800 bg-stone-900/40 hover:border-stone-700"}`}
        >
            <header className="flex items-center gap-1 px-3 py-2">
                {renaming ? (
                    <RenameInput name={exercise.name} onDone={finishRename}/>
                ) : (
                    <button
                        type="button"
                        aria-label={`${expanded ? "Collapse" : "Expand"} ${exercise.name}`}
                        aria-expanded={expanded}
                        onClick={onToggle}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                        <span className="text-stone-400">
                            {expanded ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                        </span>
                        <span className="min-w-0">
                            {expanded && (
                                <span className="block text-[10px] font-medium uppercase tracking-wider text-amber-400/80">
                                    {groupName}
                                </span>
                            )}
                            <span className={`block truncate ${expanded ? "text-base font-semibold text-stone-50" : "font-medium text-stone-200"}`}>
                                {exercise.name}
                            </span>
                            {!expanded && (
                                <span className="block truncate text-xs text-stone-500">{summaryText(exercise, lastSession)}</span>
                            )}
                        </span>
                    </button>
                )}
                <button type="button" aria-label={`Rename ${exercise.name}`} onClick={() => setRenaming(true)} className={iconButtonClass}>
                    <Pencil className="h-3.5 w-3.5"/>
                </button>
                <button type="button" aria-label={`Delete ${exercise.name}`} onClick={onDelete} className={deleteIconButtonClass}>
                    <Trash2 className="h-3.5 w-3.5"/>
                </button>
            </header>

            {expanded && (
                <div className="space-y-3 border-t border-stone-800 px-3 pb-3 pt-3">
                    <div className="grid grid-cols-2 gap-2 text-xs text-stone-400">
                        <label className="flex items-center gap-2">
                            Base weight
                            <input
                                type="text"
                                inputMode="decimal"
                                value={exercise.baseWeight ?? ""}
                                onChange={(e) => onFieldChange("baseWeight", e.target.value)}
                                onBlur={() => onFieldBlur("baseWeight")}
                                placeholder="0"
                                className={`w-16 ${inputClass}`}
                            />
                        </label>
                        <label className="flex items-center gap-2">
                            Machine setting
                            <input
                                type="text"
                                value={exercise.machineSetting ?? ""}
                                onChange={(e) => onFieldChange("machineSetting", e.target.value)}
                                className={`w-16 ${inputClass}`}
                            />
                        </label>
                    </div>

                    <SetTable
                        sets={exercise.sets}
                        lastSession={lastSession}
                        onChange={onSetChange}
                        onWeightBlur={onSetWeightBlur}
                        onRemove={onRemoveSet}
                    />

                    <div className="flex items-center gap-2">
                        <button type="button" onClick={onAddSet} className="text-xs text-stone-400 hover:text-amber-400">
                            + Add set
                        </button>
                        <button type="button" onClick={onShowHistory} className={`ml-auto ${secondaryButtonClass}`}>
                            History
                        </button>
                        <button type="button" onClick={handleFinish} className={primaryButtonClass}>
                            Finished
                        </button>
                    </div>

                    {feedback && <p role="status" className="text-xs text-emerald-400">{feedback}</p>}

                    <ExerciseStats exercise={exercise}/>
                </div>
            )}
        </article>
    );
}
