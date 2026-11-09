import {createId} from "./ids.js";

export const initialGroups = {
    Chest: {exercises: []},
    Back: {exercises: []},
    Legs: {exercises: []},
    Shoulders: {exercises: []},
    Bicep: {exercises: []},
    Triceps: {exercises: []},
    Core: {exercises: []},
};

export const storageKey = "workout-tracker-groups";

export function loadGroups(storage = globalThis.localStorage) {
    const saved = storage.getItem(storageKey);
    if (!saved) return initialGroups;

    try {
        return mergeWithInitialGroups(normalizeGroups(JSON.parse(saved)));
    } catch (error) {
        // Keep the unreadable data so it can be recovered by hand, then start fresh.
        storage.setItem(`${storageKey}:corrupt`, saved);
        console.error("Saved workout data could not be read; starting fresh.", error);
        return initialGroups;
    }
}

export function saveGroups(groups, storage = globalThis.localStorage) {
    storage.setItem(storageKey, JSON.stringify(groups));
}

function withId(item) {
    return item.id ? item : {...item, id: createId()};
}

function normalizeExercise(exercise) {
    return {
        ...withId(exercise),
        baseWeight: exercise.baseWeight ?? "",
        machineSetting: exercise.machineSetting ?? "",
        sets: (exercise.sets || []).map(withId),
        personalBests: (Array.isArray(exercise.personalBests) ? exercise.personalBests : []).map(withId),
        sessions: (Array.isArray(exercise.sessions) ? exercise.sessions : []).map(withId),
    };
}

function normalizeGroups(groups) {
    if (!groups || typeof groups !== "object") throw new Error("Saved data is not an object");
    return Object.fromEntries(
        Object.entries(groups).map(([groupName, group]) => [
            groupName,
            {...group, exercises: (group.exercises || []).map(normalizeExercise)},
        ]),
    );
}

function mergeWithInitialGroups(groups) {
    return {...initialGroups, ...groups};
}
