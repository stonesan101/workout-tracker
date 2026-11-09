import {Trash2} from "lucide-react";
import {deleteIconButtonClass, inputClass} from "./fields.js";

/**
 * Weight/reps rows for today. Empty rows show last session's numbers as
 * placeholders so you know what to aim for.
 */
export default function SetTable({sets, lastSession, onChange, onWeightBlur, onRemove}) {
    if (sets.length === 0) return null;

    return (
        <table className="mb-1 text-xs">
            <thead>
            <tr className="text-stone-500">
                <th className="w-8 py-1 pr-3 text-left font-medium">Set</th>
                <th className="py-1 pr-3 text-left font-medium">Weight</th>
                <th className="py-1 pr-3 text-left font-medium">Reps</th>
                <th className="w-6"><span className="sr-only">Remove</span></th>
            </tr>
            </thead>
            <tbody>
            {sets.map((set, index) => {
                const previous = lastSession?.sets[index];
                const number = index + 1;
                return (
                    <tr key={set.id}>
                        <td className="py-1 pr-3 font-mono text-stone-500">{number}</td>
                        <td className="py-1 pr-3">
                            <input
                                type="text"
                                inputMode="decimal"
                                aria-label={`Set ${number} weight`}
                                value={set.weight}
                                onChange={(e) => onChange(set.id, "weight", e.target.value)}
                                onBlur={() => onWeightBlur(set.id)}
                                placeholder={previous?.weight ?? "lb"}
                                className={`w-16 ${inputClass}`}
                            />
                        </td>
                        <td className="py-1 pr-3">
                            <input
                                type="text"
                                inputMode="numeric"
                                aria-label={`Set ${number} reps`}
                                value={set.reps}
                                onChange={(e) => onChange(set.id, "reps", e.target.value)}
                                placeholder={previous?.reps ?? "reps"}
                                className={`w-16 ${inputClass}`}
                            />
                        </td>
                        <td className="py-1 text-right">
                            <button
                                type="button"
                                aria-label={`Remove set ${number}`}
                                onClick={() => onRemove(set.id)}
                                className={deleteIconButtonClass}
                            >
                                <Trash2 className="h-3 w-3"/>
                            </button>
                        </td>
                    </tr>
                );
            })}
            </tbody>
        </table>
    );
}
