import {useCallback, useEffect, useState} from "react";
import {Dumbbell} from "lucide-react";
import MuscleGroupSection from "./components/MuscleGroupSection.jsx";
import ExerciseCard from "./components/ExerciseCard.jsx";
import HistoryModal from "./components/HistoryModal.jsx";
import ConfirmDialog from "./components/ConfirmDialog.jsx";
import UndoToast from "./components/UndoToast.jsx";
import {loadGroups, saveGroups} from "./lib/storage.js";
import {
    addExercise,
    capitalizeWords,
    createExercise,
    createSet,
    findExercise,
    removeExercise,
    updateExercise,
} from "./lib/exercises.js";
import {roundWeight, sanitizeDecimalInput, sanitizeIntegerInput} from "./lib/numbers.js";
import {finishExercise, removeSession} from "./lib/sessions.js";
import {removePersonalBest} from "./lib/personalBests.js";
import {formatDate, formatSet, pluralize} from "./lib/format.js";

function sanitizeSetField(field, value) {
    return field === "weight" ? sanitizeDecimalInput(value) : sanitizeIntegerInput(value);
}

export default function App() {
    const [groups, setGroups] = useState(loadGroups);
    const [drafts, setDrafts] = useState({});
    const [expandedGroups, setExpandedGroups] = useState({});
    const [openExerciseId, setOpenExerciseId] = useState(null); // only one exercise open at a time
    const [historyFor, setHistoryFor] = useState(null); // {groupName, exerciseId}
    const [pendingDelete, setPendingDelete] = useState(null); // {title, message, undoMessage, apply}
    const [undo, setUndo] = useState(null); // {message, snapshot}

    useEffect(() => {
        saveGroups(groups);
    }, [groups]);

    const dismissUndo = useCallback(() => setUndo(null), []);

    // --- exercise-level helpers -------------------------------------------

    function changeExercise(groupName, exerciseId, changes) {
        setGroups((prev) => updateExercise(prev, groupName, exerciseId, changes));
    }

    function changeSets(groupName, exerciseId, mapSets) {
        changeExercise(groupName, exerciseId, (ex) => ({...ex, sets: mapSets(ex.sets)}));
    }

    function handleAddExercise(groupName) {
        const name = capitalizeWords(drafts[groupName] || "");
        if (!name) return;
        const exercise = createExercise(name);
        setGroups((prev) => addExercise(prev, groupName, exercise));
        setOpenExerciseId(exercise.id);
        setDrafts((prev) => ({...prev, [groupName]: ""}));
    }

    function handleRename(groupName, exerciseId, value) {
        const name = capitalizeWords(value);
        if (name) changeExercise(groupName, exerciseId, {name});
    }

    function handleFinish(groupName, exerciseId) {
        const {exercise, result} = finishExercise(findExercise(groups, groupName, exerciseId));
        if (result.saved) changeExercise(groupName, exerciseId, () => exercise);
        return result;
    }

    // --- deleting, always behind a confirm dialog -------------------------

    function confirmDelete() {
        const {apply, undoMessage} = pendingDelete;
        setUndo({message: undoMessage, snapshot: groups});
        setGroups(apply);
        setPendingDelete(null);
    }

    function handleUndo() {
        setGroups(undo.snapshot);
        setUndo(null);
    }

    function requestDeleteExercise(groupName, exercise) {
        const sessions = exercise.sessions?.length ?? 0;
        const pbs = exercise.personalBests?.length ?? 0;
        setPendingDelete({
            title: `Delete ${exercise.name}?`,
            message: `This removes the exercise with its ${pluralize(sessions, "saved session")} and ${pluralize(pbs, "PB")}.`,
            undoMessage: `Deleted ${exercise.name}`,
            apply: (prev) => removeExercise(prev, groupName, exercise.id),
        });
    }

    function requestDeleteSession(groupName, exerciseId, session) {
        const date = formatDate(session.finishedAt);
        setPendingDelete({
            title: `Delete session from ${date}?`,
            message: "Its sets are removed from your history. Any PB it set stays in the PB list.",
            undoMessage: `Deleted session from ${date}`,
            apply: (prev) => updateExercise(prev, groupName, exerciseId, (ex) => removeSession(ex, session.id)),
        });
    }

    function requestDeletePersonalBest(groupName, exerciseId, entry) {
        const label = `${formatSet(entry.source.bestSet)} lb from ${formatDate(entry.achievedAt)}`;
        setPendingDelete({
            title: `Delete PB ${label}?`,
            message: "Your current PB is recalculated from the ones left.",
            undoMessage: `Deleted PB ${formatSet(entry.source.bestSet)}`,
            apply: (prev) => updateExercise(prev, groupName, exerciseId, (ex) => removePersonalBest(ex, entry.id)),
        });
    }

    const historyExercise = historyFor && findExercise(groups, historyFor.groupName, historyFor.exerciseId);

    return (
        <div className="min-h-screen bg-stone-950 p-6 text-stone-100 md:p-10">
            <div className="mx-auto max-w-3xl">
                <header className="mb-8 flex items-center gap-3">
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2">
                        <Dumbbell className="h-5 w-5 text-amber-400"/>
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Session Log</h1>
                        <p className="text-sm text-stone-400">Add exercises, log sets, then press Finished to save the session.</p>
                    </div>
                </header>

                <main className="space-y-4">
                    {Object.entries(groups).map(([groupName, group]) => (
                        <MuscleGroupSection
                            key={groupName}
                            name={groupName}
                            exerciseCount={group.exercises.length}
                            expanded={Boolean(expandedGroups[groupName])}
                            onToggle={() => setExpandedGroups((prev) => ({...prev, [groupName]: !prev[groupName]}))}
                            draft={drafts[groupName] || ""}
                            onDraftChange={(value) => setDrafts((prev) => ({...prev, [groupName]: value}))}
                            onAdd={() => handleAddExercise(groupName)}
                        >
                            {group.exercises.map((exercise) => {
                                const id = exercise.id;
                                return (
                                    <ExerciseCard
                                        key={id}
                                        exercise={exercise}
                                        groupName={groupName}
                                        expanded={openExerciseId === id}
                                        onToggle={() => setOpenExerciseId((prev) => (prev === id ? null : id))}
                                        onRename={(value) => handleRename(groupName, id, value)}
                                        onFieldChange={(field, value) => changeExercise(groupName, id, {
                                            [field]: field === "baseWeight" ? sanitizeDecimalInput(value) : value,
                                        })}
                                        onFieldBlur={(field) => changeExercise(groupName, id, (ex) => ({...ex, [field]: roundWeight(ex[field])}))}
                                        onAddSet={() => changeSets(groupName, id, (sets) => [...sets, createSet()])}
                                        onSetChange={(setId, field, value) => changeSets(groupName, id, (sets) =>
                                            sets.map((s) => (s.id === setId ? {...s, [field]: sanitizeSetField(field, value)} : s)))}
                                        onSetWeightBlur={(setId) => changeSets(groupName, id, (sets) =>
                                            sets.map((s) => (s.id === setId ? {...s, weight: roundWeight(s.weight)} : s)))}
                                        onRemoveSet={(setId) => changeSets(groupName, id, (sets) => sets.filter((s) => s.id !== setId))}
                                        onFinish={() => handleFinish(groupName, id)}
                                        onShowHistory={() => setHistoryFor({groupName, exerciseId: id})}
                                        onDelete={() => requestDeleteExercise(groupName, exercise)}
                                    />
                                );
                            })}
                        </MuscleGroupSection>
                    ))}
                </main>
            </div>

            {historyExercise && (
                <HistoryModal
                    exercise={historyExercise}
                    onClose={() => setHistoryFor(null)}
                    onDeleteSession={(session) => requestDeleteSession(historyFor.groupName, historyExercise.id, session)}
                    onDeletePersonalBest={(entry) => requestDeletePersonalBest(historyFor.groupName, historyExercise.id, entry)}
                />
            )}

            {pendingDelete && (
                <ConfirmDialog
                    title={pendingDelete.title}
                    message={pendingDelete.message}
                    onConfirm={confirmDelete}
                    onCancel={() => setPendingDelete(null)}
                />
            )}

            {undo && <UndoToast message={undo.message} onUndo={handleUndo} onDismiss={dismissUndo}/>}
        </div>
    );
}
