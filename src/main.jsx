import {useEffect, useState} from "react";
import {Dumbbell, Plus} from "lucide-react";
import {createRoot} from "react-dom/client";
import WorkoutExercise from "./WorkoutExercise.jsx";
import {createExercise, createSet, initialGroups, loadGroups, saveGroups, getCurrentPersonalBest, appendPersonalBest, getPersonalBestHistory} from "./storage.js";

const weightStep = .5;

function capitalizeWords(value) {
    return value
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" ");
}

function getBestSet(ex) {
    const base = Number(ex.baseWeight || 0);
    const completedSets = ex.sets.filter((s) => s.weight !== "" && s.reps !== "");
    if (completedSets.length === 0) return null;

    return completedSets.reduce((best, current) => {
        const currentOneRM = (Number(current.weight) + base) * (1 + Number(current.reps) / 30);
        return !best || currentOneRM > best.oneRepMax ? {...current, oneRepMax: currentOneRM} : best;
    }, null);
}

function getMachineAdjustedMetrics(ex) {
    const base = Number(ex.baseWeight || 0);
    const completedSets = ex.sets.filter((s) => s.weight !== "" && s.reps !== "");
    if (completedSets.length === 0) return {effort: null, oneRepMax: null, recommendedFiveRep: null};

    const effort = (completedSets.reduce((sum, s) => sum + (Number(s.weight) + base) * Number(s.reps), 0) / completedSets.length).toFixed(1);
    const best = getBestSet(ex);
    const oneRepMax = best ? best.oneRepMax : 0;

    return {
        effort,
        oneRepMax: oneRepMax > 0 ? oneRepMax - base : null,
        recommendedFiveRep: oneRepMax > 0 ? oneRepMax * 0.86 - base : null,
    };
}

export default function WorkoutTracker() {
    const [groups, setGroups] = useState(loadGroups);
    const [workout, setWorkout] = useState({});
    const [editingExercise, setEditingExercise] = useState(null);
    const [expandedGroups, setExpandedGroups] = useState(() =>
        Object.keys(initialGroups).reduce((acc, groupName) => {
            acc[groupName] = false;
            return acc;
        }, {}),
    );
    const [historyModal, setHistoryModal] = useState(null); // {groupName, exerciseIndex} | null
    const [expandedWorkouts, setExpandedWorkouts] = useState({});

    useEffect(() => {
        saveGroups(groups);
    }, [groups]);

    function handleDraftChange(groupName, value) {
        setWorkout({...workout, [groupName]: value});
    }

    function addExercise(groupName) {
        const name = capitalizeWords((workout[groupName] || "").trim());
        if (!name) return;

        // Exercises are now objects, not plain strings — each one needs its
        // own `sets` array to hold weight/reps rows, same reason muscle
        // groups became objects back in step 2b.
        setGroups({
            ...groups, [groupName]: {
                ...groups[groupName],                 exercises: [...groups[groupName].exercises, createExercise(name)],
            },
        });
        setExpandedWorkouts((prev) => ({
            ...prev,
            [`${groupName}:${groups[groupName].exercises.length}`]: true,
        }));

        setWorkout({...workout, [groupName]: ""});
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
            ...groups, [groupName]: {
                ...groups[groupName], exercises: groups[groupName].exercises.map((ex, i) => i === exerciseIndex ? {
                    ...ex, sets: [...ex.sets, createSet()]
                } : ex),
            },
        });
    }

    // Same shape as addSet, but goes one level deeper still: now we're
    // .map()-ing over exercises to find the right one, AND .map()-ing over
    // that exercise's sets to find the right row, AND spreading the field
    // that changed (weight or reps) onto that one set.
    function updateSet(groupName, exerciseIndex, setIndex, field, value) {
        let nextValue = value;

        if (field === "weight") {
            const parsed = value === "" ? "" : Math.max(0, Math.round(Number(value) / weightStep) * weightStep);
            nextValue = parsed === "" ? "" : parsed.toFixed(1).replace(/\.0$/, "");
        } else if (field === "reps") {
            const parsed = value === "" ? "" : Math.max(0, Math.floor(Number(value)));
            nextValue = parsed === "" ? "" : String(parsed);
        }

        setGroups({
            ...groups, [groupName]: {
                ...groups[groupName], exercises: groups[groupName].exercises.map((ex, i) => i === exerciseIndex ? {
                    ...ex, sets: ex.sets.map((s, si) => si === setIndex ? {...s, [field]: nextValue} : s),
                } : ex),
            },
        });
    }

    function removeSet(groupName, exerciseIndex, setIndex) {
        setGroups({
            ...groups, [groupName]: {
                ...groups[groupName], exercises: groups[groupName].exercises.map((ex, i) => i === exerciseIndex ? {
                    ...ex, sets: ex.sets.filter((_, si) => si !== setIndex)
                } : ex),
            },
        });
    }

    function updateExerciseBaseWeight(groupName, exerciseIndex, value) {
        const nextValue = value === "" ? "" : Math.max(0, Number(value));
        setGroups({
            ...groups, [groupName]: {
                ...groups[groupName], exercises: groups[groupName].exercises.map((ex, i) => i === exerciseIndex ? {
                    ...ex, baseWeight: nextValue
                } : ex),
            },
        });
    }

    function updateExerciseMachineSetting(groupName, exerciseIndex, value) {
        setGroups({
            ...groups, [groupName]: {
                ...groups[groupName], exercises: groups[groupName].exercises.map((ex, i) => i === exerciseIndex ? {
                    ...ex, machineSetting: value,
                } : ex),
            },
        });
    }

    function updateExerciseName(groupName, exerciseIndex, value) {
        setGroups({
            ...groups, [groupName]: {
                ...groups[groupName], exercises: groups[groupName].exercises.map((ex, i) => i === exerciseIndex ? {
                    ...ex, name: value,
                } : ex),
            },
        });
    }
    function finishExercise(groupName, exerciseIndex) {
        const ex = groups[groupName].exercises[exerciseIndex];
        const metrics = getMachineAdjustedMetrics(ex);
        if (metrics.oneRepMax === null) return; // nothing logged this session

        const newE1RM = Number(metrics.oneRepMax);
        const currentPB = getCurrentPersonalBest(ex, "e1RM");
        if (currentPB && newE1RM <= currentPB.value) return; // not a new PB

        const bestSet = getBestSet(ex);
        const completedSets = ex.sets.filter((s) => s.weight !== "" && s.reps !== "");

        const updatedExercise = appendPersonalBest(ex, {
            type: "e1RM",
            value: newE1RM,
            achievedAt: new Date().toISOString(),
            source: {
                sets: completedSets.map((s) => ({weight: s.weight, reps: s.reps})),
                bestSet: {weight: bestSet.weight, reps: bestSet.reps},
            },
        });

        setGroups({
            ...groups, [groupName]: {
                ...groups[groupName],
                exercises: groups[groupName].exercises.map((e, i) => i === exerciseIndex ? updatedExercise : e),
            },
        });
    }

    function toggleGroup(groupName) {
        setExpandedGroups((prev) => ({...prev, [groupName]: !prev[groupName]}));
    }

    function toggleWorkout(groupName, exerciseIndex) {
        const key = `${groupName}:${exerciseIndex}`;
        setExpandedWorkouts((prev) => ({...prev, [key]: !prev[key]}));
    }

    return (<div className="min-h-screen bg-stone-950 text-stone-100 p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
            <header className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <Dumbbell className="w-5 h-5 text-amber-400"/>
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
                {Object.entries(groups).map(([groupName, group]) => (<section
                    key={groupName}
                    className="rounded-xl border border-stone-800 bg-stone-900/60 px-4 py-3"
                >
                    <button
                        type="button"
                        onClick={() => toggleGroup(groupName)}
                        className="mb-2 w-full text-center font-medium text-stone-100 flex items-center justify-center gap-2 hover:text-amber-300"
                    >
                        <span>{groupName}</span>
                        <span className="text-xs text-stone-400">
                            {expandedGroups[groupName] ? "▼" : "▶"}
                        </span>
                    </button>

                    {expandedGroups[groupName] && group.exercises.length > 0 && (<div className="mb-3 space-y-3">
                        {/* exerciseIndex (the "i" here) is what every set-level
                      function above uses to find its way back to this
                      exact exercise. */}
                        {group.exercises.map((ex, exerciseIndex) => (<WorkoutExercise
                            key={exerciseIndex}
                            ex={ex}
                            groupName={groupName}
                            exerciseIndex={exerciseIndex}
                            expanded={Boolean(expandedWorkouts[`${groupName}:${exerciseIndex}`])}
                            weightStep={weightStep}
                            editingExercise={editingExercise}
                            setEditingExercise={setEditingExercise}
                            capitalizeWords={capitalizeWords}
                            toggleWorkout={toggleWorkout}
                            updateExerciseName={updateExerciseName}
                            updateExerciseBaseWeight={updateExerciseBaseWeight}
                            updateExerciseMachineSetting={updateExerciseMachineSetting}
                            updateSet={updateSet}
                            removeSet={removeSet}
                            addSet={addSet}
                            getMachineAdjustedMetrics={getMachineAdjustedMetrics}
                            finishExercise={finishExercise}
                            getCurrentPersonalBest={getCurrentPersonalBest}
                            onShowHistory={() => setHistoryModal({groupName, exerciseIndex})}
                        />))}
                    </div>)}

                    {expandedGroups[groupName] && (
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
                                <Plus className="w-3.5 h-3.5"/> Add
                            </button>
                        </div>
                    )}
                </section>))}
                {historyModal && (() => {
                    const ex = groups[historyModal.groupName].exercises[historyModal.exerciseIndex];
                    const history = getPersonalBestHistory(ex, "e1RM").slice().sort((a, b) => new Date(b.achievedAt) - new Date(a.achievedAt));
                    return (
                        <div
                            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
                            onClick={() => setHistoryModal(null)}
                        >
                            <div
                                className="bg-stone-900 border border-stone-700 rounded-xl max-w-sm w-full max-h-[70vh] overflow-y-auto p-4"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-sm font-semibold text-stone-100">{ex.name} — PB History</h2>
                                    <button onClick={() => setHistoryModal(null)} className="text-stone-500 hover:text-stone-200 text-sm">✕</button>
                                </div>
                                {history.length === 0 ? (
                                    <p className="text-xs text-stone-500">No PBs recorded yet.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {history.map((entry, i) => (
                                            <li key={i} className="flex items-center justify-between text-xs border-b border-stone-800 pb-2">
                                <span className="text-stone-300 font-mono">
                                    {entry.source.bestSet.reps}@{entry.source.bestSet.weight}
                                </span>
                                                <span className="text-stone-500">e1RM {entry.value.toFixed(1)}</span>
                                                <span className="text-stone-600">
                                    {new Date(entry.achievedAt).toLocaleDateString()}
                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    </div>);
}

createRoot(document.getElementById("root")).render(<WorkoutTracker/>);