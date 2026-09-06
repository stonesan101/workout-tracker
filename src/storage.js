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

export function loadGroups() {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return initialGroups;

    const normalized = normalizeGroups(JSON.parse(saved));

    return mergeWithInitialGroups(normalized);
}

export function saveGroups(groups) {
    localStorage.setItem(storageKey, JSON.stringify(groups));
}

export function createExercise(name) {
    return {
        name,
        baseWeight: 0,
        machineSetting: "",
        sets: [],
        personalBests: [],
    };
}

export function createSet() {
    return {
        weight: "",
        reps: "",
    };
}

export function createPersonalBest({type, value, achievedAt, source}) {
    return {type, value, achievedAt, source};
}

export function getPersonalBestWeight(entry) {
    return Number(entry?.source?.bestSet?.weight ?? 0);
}

export function isPBBetter(a, b) {
    if (a.weight !== b.weight) return a.weight > b.weight;
    return a.value > b.value;
}

export function getPersonalBestHistory(exercise, type) {
    const history = Array.isArray(exercise.personalBests) ? exercise.personalBests : [];
    if (!type) return history;
    return history.filter((entry) => entry.type === type);
}

export function getCurrentPersonalBest(exercise, type) {
    const history = getPersonalBestHistory(exercise, type);
    if (history.length === 0) return null;
    return history.reduce((best, entry) => {
        const entryCandidate = {weight: getPersonalBestWeight(entry), value: entry.value};
        const bestCandidate = {weight: getPersonalBestWeight(best), value: best.value};
        return isPBBetter(entryCandidate, bestCandidate) ? entry : best;
    }, history[0]);
}

export function appendPersonalBest(exercise, candidate) {
    return {
        ...exercise,
        personalBests: [...getPersonalBestHistory(exercise), createPersonalBest(candidate)],
    };
}

function normalizeExercise(exercise) {
    return {
        ...exercise,
        personalBests: Array.isArray(exercise.personalBests) ? exercise.personalBests : [],
    };
}

function normalizeGroups(groups) {
    return Object.entries(groups).reduce((acc, [groupName, group]) => {
        acc[groupName] = {
            ...group,
            exercises: (group.exercises || []).map(normalizeExercise),
        };
        return acc;
    }, {});
}

function mergeWithInitialGroups(groups) {
    return {
        ...groups,
        ...Object.entries(initialGroups).reduce((acc, [groupName, group]) => {
            acc[groupName] = groups[groupName] || group;
            return acc;
        }, {}),
    };
}