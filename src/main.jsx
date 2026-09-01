import { useState } from "react";
import { Dumbbell, Plus, Trash2 } from "lucide-react";
import { createRoot } from "react-dom/client";

const initialGroups = {
    Chest: { exercises: [] },
    Back: { exercises: [] },
    Legs: { exercises: [] },
    Shoulders: { exercises: [] },
    Arms: { exercises: [] },
    Core: { exercises: [] },
};

export default function WorkoutTracker() {
    const [groups, setGroups] = useState(initialGroups);
    const [workout, setWorkout] = useState({});

    function handleDraftChange(groupName, value) {
        setWorkout({ ...workout, [groupName]: value });
    }

    function addExercise(groupName) {
        const name = (workout[groupName] || "").trim();
        if (!name) return;

        // Exercises are now objects, not plain strings — each one needs its
        // own `sets` array to hold weight/reps rows, same reason muscle
        // groups became objects back in step 2b.
        setGroups({
            ...groups,
            [groupName]: {
                ...groups[groupName],
                exercises: [...groups[groupName].exercises, { name, sets: [] }],
            },
        });

        setWorkout({ ...workout, [groupName]: "" });
    }

    // Add one empty set row to a specific exercise.
    // Read this outward-in: the innermost part (ex.sets) is a NEW array
    // with one more empty set. That new exercise object gets built by
    // .map()-ing over exercises and only touching the matching index.
    // That new exercises array gets attached to a new group object.
    // That new group gets merged back into a new groups object.
    // Four "new"s, one changed value — that's the cost of nesting.
    function addSet(groupName, exerciseIndex) {
        setGroups({
            ...groups,
            [groupName]: {
                ...groups[groupName],
                exercises: groups[groupName].exercises.map((ex, i) =>
                    i === exerciseIndex
                        ? { ...ex, sets: [...ex.sets, { weight: "", reps: "" }] }
                        : ex
                ),
            },
        });
    }

    // Same shape as addSet, but goes one level deeper still: now we're
    // .map()-ing over exercises to find the right one, AND .map()-ing over
    // that exercise's sets to find the right row, AND spreading the field
    // that changed (weight or reps) onto that one set.
    function updateSet(groupName, exerciseIndex, setIndex, field, value) {
        setGroups({
            ...groups,
            [groupName]: {
                ...groups[groupName],
                exercises: groups[groupName].exercises.map((ex, i) =>
                    i === exerciseIndex
                        ? {
                            ...ex,
                            sets: ex.sets.map((s, si) =>
                                si === setIndex ? { ...s, [field]: value } : s
                            ),
                        }
                        : ex
                ),
            },
        });
    }

    function removeSet(groupName, exerciseIndex, setIndex) {
        setGroups({
            ...groups,
            [groupName]: {
                ...groups[groupName],
                exercises: groups[groupName].exercises.map((ex, i) =>
                    i === exerciseIndex
                        ? { ...ex, sets: ex.sets.filter((_, si) => si !== setIndex) }
                        : ex
                ),
            },
        });
    }

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 p-6 md:p-10">
            <div className="max-w-3xl mx-auto">
                <header className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <Dumbbell className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Session Log
                        </h1>
                        <p className="text-sm text-stone-400">
                            Add exercises, then log sets under each one.
                        </p>
                    </div>
                </header>

                <div className="space-y-4">
                    {Object.entries(groups).map(([groupName, group]) => (
                        <section
                            key={groupName}
                            className="rounded-xl border border-stone-800 bg-stone-900/60 px-4 py-3"
                        >
                            <h2 className="font-medium text-stone-100 mb-2">
                                {groupName}
                            </h2>

                            {group.exercises.length > 0 && (
                                <div className="mb-3 space-y-3">
                                    {/* exerciseIndex (the "i" here) is what every set-level
                      function above uses to find its way back to this
                      exact exercise. */}
                                    {group.exercises.map((ex, exerciseIndex) => (
                                        <div
                                            key={exerciseIndex}
                                            className="pl-3 border-l-2 border-stone-700"
                                        >
                                            <p className="text-sm text-stone-200 mb-1">{ex.name}</p>

                                            {ex.sets.length > 0 && (
                                                <table className="text-xs mb-1">
                                                    <thead>
                                                    <tr className="text-stone-500">
                                                        <th className="text-left font-medium pr-3 py-1 w-8">
                                                            Set
                                                        </th>
                                                        <th className="text-left font-medium pr-3 py-1">
                                                            Weight
                                                        </th>
                                                        <th className="text-left font-medium pr-3 py-1">
                                                            Reps
                                                        </th>
                                                        <th className="w-6"></th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {ex.sets.map((s, setIndex) => (
                                                        <tr key={setIndex}>
                                                            <td className="pr-3 py-1 text-stone-500 font-mono">
                                                                {setIndex + 1}
                                                            </td>
                                                            <td className="pr-3 py-1">
                                                                <input
                                                                    type="number"
                                                                    value={s.weight}
                                                                    onChange={(e) =>
                                                                        updateSet(
                                                                            groupName,
                                                                            exerciseIndex,
                                                                            setIndex,
                                                                            "weight",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    placeholder="lb"
                                                                    className="w-16 bg-stone-800 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-amber-500/50"
                                                                />
                                                            </td>
                                                            <td className="pr-3 py-1">
                                                                <input
                                                                    type="number"
                                                                    value={s.reps}
                                                                    onChange={(e) =>
                                                                        updateSet(
                                                                            groupName,
                                                                            exerciseIndex,
                                                                            setIndex,
                                                                            "reps",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    placeholder="reps"
                                                                    className="w-16 bg-stone-800 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-amber-500/50"
                                                                />
                                                            </td>
                                                            <td className="py-1 text-right">
                                                                <button
                                                                    onClick={() =>
                                                                        removeSet(groupName, exerciseIndex, setIndex)
                                                                    }
                                                                    className="text-stone-600 hover:text-red-400"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            )}

                                            <button
                                                onClick={() => addSet(groupName, exerciseIndex)}
                                                className="text-xs text-stone-500 hover:text-amber-400"
                                            >
                                                + Add set
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={workout[groupName] || ""}
                                    onChange={(e) => handleDraftChange(groupName, e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addExercise(groupName)}
                                    placeholder={`Add ${groupName.toLowerCase()} exercise…`}
                                    className="flex-1 bg-stone-800 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-stone-600"
                                />
                                <button
                                    onClick={() => addExercise(groupName)}
                                    className="flex items-center gap-1 bg-amber-500 text-stone-950 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-amber-400 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add
                                </button>
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}

createRoot(document.getElementById("root")).render(<WorkoutTracker />);