import {ChevronDown, ChevronRight, Plus} from "lucide-react";
import {inputClass} from "./fields.js";
import {pluralize} from "../lib/format.js";

export default function MuscleGroupSection({name, exerciseCount, expanded, onToggle, draft, onDraftChange, onAdd, children}) {
    return (
        <section className="rounded-xl border border-stone-800 bg-stone-900/60 px-4 py-3">
            <button
                type="button"
                aria-expanded={expanded}
                onClick={onToggle}
                className="flex w-full items-center gap-2 text-left font-medium text-stone-100 hover:text-amber-300"
            >
                <span>{name}</span>
                <span className="text-xs font-normal text-stone-500">{pluralize(exerciseCount, "exercise")}</span>
                <span className="ml-auto text-stone-400">
                    {expanded ? <ChevronDown className="h-4 w-4"/> : <ChevronRight className="h-4 w-4"/>}
                </span>
            </button>

            {expanded && (
                <div className="mt-3 space-y-3">
                    {children}
                    <form
                        className="flex gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            onAdd();
                        }}
                    >
                        <input
                            type="text"
                            value={draft}
                            onChange={(e) => onDraftChange(e.target.value)}
                            placeholder={`Add ${name.toLowerCase()} exercise…`}
                            className={`flex-1 py-1.5 text-sm ${inputClass}`}
                        />
                        <button
                            type="submit"
                            className="flex items-center gap-1 rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-stone-950 transition-colors hover:bg-amber-400"
                        >
                            <Plus className="h-3.5 w-3.5"/> Add
                        </button>
                    </form>
                </div>
            )}
        </section>
    );
}
