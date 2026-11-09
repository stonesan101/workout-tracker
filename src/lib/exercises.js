import {createId} from "./ids.js";

export function createExercise(name) {
    return {
        id: createId(),
        name,
        baseWeight: "",
        machineSetting: "",
        sets: [],
        personalBests: [],
        sessions: [],
    };
}

export function createSet() {
    return {id: createId(), weight: "", reps: ""};
}

export function capitalizeWords(value) {
    return value
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" ");
}

export function getCompletedSets(exercise) {
    return (exercise.sets || []).filter((s) => s.weight !== "" && s.reps !== "");
}

export function findExercise(groups, groupName, exerciseId) {
    return groups[groupName]?.exercises.find((ex) => ex.id === exerciseId) ?? null;
}

function replaceExercises(groups, groupName, exercises) {
    return {...groups, [groupName]: {...groups[groupName], exercises}};
}

export function addExercise(groups, groupName, exercise) {
    return replaceExercises(groups, groupName, [...groups[groupName].exercises, exercise]);
}

/**
 * Update one exercise by id. `changes` is either an object merged into the
 * exercise or a function that receives the exercise and returns a new one.
 */
export function updateExercise(groups, groupName, exerciseId, changes) {
    const apply = typeof changes === "function" ? changes : (ex) => ({...ex, ...changes});
    return replaceExercises(
        groups,
        groupName,
        groups[groupName].exercises.map((ex) => (ex.id === exerciseId ? apply(ex) : ex)),
    );
}

export function removeExercise(groups, groupName, exerciseId) {
    return replaceExercises(
        groups,
        groupName,
        groups[groupName].exercises.filter((ex) => ex.id !== exerciseId),
    );
}
