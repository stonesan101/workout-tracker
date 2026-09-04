export const initialGroups = {
    Chest: {exercises: []},
    Back: {exercises: []},
    Legs: {exercises: []},
    Shoulders: {exercises: []},
    Arms: {exercises: []},
    Core: {exercises: []},
};

export const storageKey = "workout-tracker-groups";

export function loadGroups() {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return initialGroups;
    return normalizeGroups(JSON.parse(saved));
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

export function getPersonalBestHistory(exercise, type) {
    const history = Array.isArray(exercise.personalBests) ? exercise.personalBests : [];
    if (!type) return history;
    return history.filter((entry) => entry.type === type);
}

export function getCurrentPersonalBest(exercise, type) {
    const history = getPersonalBestHistory(exercise, type);
    if (history.length === 0) return null;
    return history.reduce((best, entry) => entry.value > best.value ? entry : best, history[0]);
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
