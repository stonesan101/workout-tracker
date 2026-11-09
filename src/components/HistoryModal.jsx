import {useState} from "react";
import {Trash2} from "lucide-react";
import Modal from "./Modal.jsx";
import {getSessionHistory} from "../lib/sessions.js";
import {getPersonalBestHistory} from "../lib/personalBests.js";
import {formatDate, formatSet} from "../lib/format.js";
import {deleteIconButtonClass} from "./fields.js";

const TABS = ["Sessions", "PBs"];

function EmptyState({children}) {
    return <p className="text-xs text-stone-500">{children}</p>;
}

function SessionList({exercise, onDelete}) {
    const sessions = getSessionHistory(exercise);
    if (sessions.length === 0) return <EmptyState>No sessions saved yet. Press Finished after logging sets.</EmptyState>;

    return (
        <ul className="space-y-2">
            {sessions.map((session) => (
                <li key={session.id} className="flex items-start gap-2 border-b border-stone-800 pb-2 text-xs">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-stone-300">{formatDate(session.finishedAt)}</span>
                            {session.isPB && <span className="rounded bg-amber-500/15 px-1 text-[10px] text-amber-400">PB</span>}
                            <span className="ml-auto text-stone-500">e1RM {session.e1RM.toFixed(1)}</span>
                        </div>
                        <p className="font-mono text-stone-400">{session.sets.map(formatSet).join(", ")}</p>
                    </div>
                    <button
                        type="button"
                        aria-label={`Delete session from ${formatDate(session.finishedAt)}`}
                        onClick={() => onDelete(session)}
                        className={deleteIconButtonClass}
                    >
                        <Trash2 className="h-3 w-3"/>
                    </button>
                </li>
            ))}
        </ul>
    );
}

function PersonalBestList({exercise, onDelete}) {
    const history = getPersonalBestHistory(exercise, "e1RM")
        .slice()
        .sort((a, b) => new Date(b.achievedAt) - new Date(a.achievedAt));
    if (history.length === 0) return <EmptyState>No PBs recorded yet.</EmptyState>;

    return (
        <ul className="space-y-2">
            {history.map((entry) => {
                const label = `${formatSet(entry.source.bestSet)} from ${formatDate(entry.achievedAt)}`;
                return (
                    <li key={entry.id} className="flex items-center gap-2 border-b border-stone-800 pb-2 text-xs">
                        <span className="font-mono text-stone-300">{formatSet(entry.source.bestSet)}</span>
                        <span className="text-stone-500">e1RM {entry.value.toFixed(1)}</span>
                        <span className="ml-auto text-stone-600">{formatDate(entry.achievedAt)}</span>
                        <button
                            type="button"
                            aria-label={`Delete PB ${label}`}
                            onClick={() => onDelete(entry)}
                            className={deleteIconButtonClass}
                        >
                            <Trash2 className="h-3 w-3"/>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}

export default function HistoryModal({exercise, onClose, onDeleteSession, onDeletePersonalBest}) {
    const [tab, setTab] = useState("Sessions");

    return (
        <Modal title={`${exercise.name} history`} onClose={onClose} size="md">
            <div role="tablist" className="my-3 flex gap-1 rounded-md bg-stone-800/60 p-1 text-xs">
                {TABS.map((name) => (
                    <button
                        key={name}
                        type="button"
                        role="tab"
                        aria-selected={tab === name}
                        onClick={() => setTab(name)}
                        className={`flex-1 rounded px-2 py-1 ${tab === name ? "bg-stone-700 text-stone-100" : "text-stone-400 hover:text-stone-200"}`}
                    >
                        {name}
                    </button>
                ))}
            </div>
            <div role="tabpanel">
                {tab === "Sessions"
                    ? <SessionList exercise={exercise} onDelete={onDeleteSession}/>
                    : <PersonalBestList exercise={exercise} onDelete={onDeletePersonalBest}/>}
            </div>
            <div className="mt-4 flex justify-end">
                <button type="button" onClick={onClose} className="text-xs text-stone-400 hover:text-stone-100">
                    Close
                </button>
            </div>
        </Modal>
    );
}
