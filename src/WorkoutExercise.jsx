import {Pencil, Trash2} from "lucide-react";

export default function WorkoutExercise({
                                            ex,
                                            groupName,
                                            exerciseIndex,
                                            expanded,
                                            weightStep,
                                            editingExercise,
                                            setEditingExercise,
                                            capitalizeWords,
                                            toggleWorkout,
                                            updateExerciseName,
                                            updateExerciseBaseWeight,
                                            updateExerciseMachineSetting,
                                            updateSet,
                                            removeSet,
                                            addSet,
                                            getMachineAdjustedMetrics,
                                            finishExercise,
                                            getCurrentPersonalBest,
                                            onShowHistory,
                                        }) {
    const currentPB = getCurrentPersonalBest(ex, "e1RM");
    return (<div className="pl-3 border-l-2 border-stone-700">
        <div className="mb-1 flex items-center gap-2">
            {editingExercise?.groupName === groupName && editingExercise?.exerciseIndex === exerciseIndex ? (<input
                autoFocus
                type="text"
                value={ex.name}
                onChange={(e) => updateExerciseName(groupName, exerciseIndex, e.target.value)}
                onBlur={(e) => {
                    updateExerciseName(groupName, exerciseIndex, capitalizeWords(e.target.value));
                    setEditingExercise(null);
                }}
                className="bg-stone-800 rounded px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-amber-500/50"
            />) : (<>
                <span>{ex.name}</span>
                <button
                    onClick={() => setEditingExercise({groupName, exerciseIndex})}
                    className="text-stone-500 hover:text-amber-400"
                >
                    <Pencil className="w-3 h-3"/>
                </button>
            </>)}

            <button
                type="button"
                onClick={() => toggleWorkout(groupName, exerciseIndex)}
                className="ml-auto text-xs text-stone-400 hover:text-amber-300"
            >
                {expanded ? "▼" : "▶"}
            </button>
        </div>

        {expanded && (<>
            <label className="mb-1 flex items-center gap-2">Base Weight
                <input
                    type="number"
                    min="0"
                    step={weightStep}
                    value={ex.baseWeight ?? 0}
                    onChange={(e) => updateExerciseBaseWeight(groupName, exerciseIndex, e.target.value)}
                    className="w-20 bg-stone-800 rounded px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-amber-500/50"
                    placeholder="base"
                />
                <button
                    type="button"
                    onClick={() => finishExercise(groupName, exerciseIndex)}
                    className="text-xs bg-emerald-600 text-stone-950 font-medium px-2 py-1 rounded-md hover:bg-emerald-500 transition-colors"
                >
                    Finished
                </button>
            </label>


            <label className="mb-1 flex items-center gap-2">Machine Setting
                <input
                    type="text"
                    value={ex.machineSetting ?? 0}
                    onChange={(e) => updateExerciseMachineSetting(groupName, exerciseIndex, e.target.value)}
                    className="w-28 bg-stone-800 rounded px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <button
                    type="button"
                    onClick={onShowHistory}
                    className="text-xs text-stone-400 hover:text-amber-300 underline"
                >
                    History
                </button>
            </label>

            {ex.sets.length > 0 && (<table className="text-xs mb-1">
                <thead>
                <tr className="text-stone-500">
                    <th className="text-left font-medium pr-3 py-1 w-8">Set</th>
                    <th className="text-left font-medium pr-3 py-1">Weight</th>
                    <th className="text-left font-medium pr-3 py-1">Reps</th>
                    <th className="w-6"></th>
                </tr>
                </thead>
                <tbody>
                {ex.sets.map((s, setIndex) => (<tr key={setIndex}>
                    <td className="pr-3 py-1 text-stone-500 font-mono">{setIndex + 1}</td>
                    <td className="pr-3 py-1">
                        <input
                            type="number"
                            min="0"
                            step={weightStep}
                            value={s.weight}
                            onChange={(e) => updateSet(groupName, exerciseIndex, setIndex, "weight", e.target.value)}
                            placeholder="lb"
                            className="w-16 bg-stone-800 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                    </td>
                    <td className="pr-3 py-1">
                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={s.reps}
                            onChange={(e) => updateSet(groupName, exerciseIndex, setIndex, "reps", e.target.value)}
                            placeholder="reps"
                            className="w-16 bg-stone-800 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                    </td>
                    <td className="py-1 text-right">
                        <button
                            onClick={() => removeSet(groupName, exerciseIndex, setIndex)}
                            className="text-stone-600 hover:text-red-400"
                        >
                            <Trash2 className="w-3 h-3"/>
                        </button>
                    </td>
                </tr>))}
                </tbody>
            </table>)}

            <div className="flex items-center gap-2">
                <button onClick={() => addSet(groupName, exerciseIndex)}
                        className="text-xs text-stone-500 hover:text-amber-400">
                    + Add set
                </button>
                {currentPB && (<span className="text-xs text-amber-400 font-mono">
                PB: {currentPB.source.bestSet.reps}@{currentPB.source.bestSet.weight}
            </span>)}
            </div>

            {(() => {
                const metrics = getMachineAdjustedMetrics(ex);
                return metrics.effort || metrics.oneRepMax ? (<div
                    className="mt-2 rounded-md bg-stone-950/60 border border-stone-800 px-3 py-2 text-xs text-stone-300">
                    {metrics.effort && (<p>Effort: {metrics.effort}</p>)}
                    {metrics.oneRepMax && <p>1RM: {metrics.oneRepMax.toFixed(1)} lb</p>}
                    {metrics.recommendedFiveRep && <p>Five Rep: {metrics.recommendedFiveRep.toFixed(1)} lb</p>}
                </div>) : null;
            })()}
        </>)}
    </div>);
}
