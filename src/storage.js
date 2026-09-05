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
    const migrated = migrateLegacyArmGroup(normalized);

    return mergeWithInitialGroups(migrated);
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

function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function getPersonalBestWeight(entry) {
    return toNumber(entry?.source?.bestSet?.weight);
}

function getPersonalBestOneRepMax(entry) {
    return toNumber(entry?.value);
}

export function comparePersonalBestEntries(left, right) {
    const weightDiff = getPersonalBestWeight(left) - getPersonalBestWeight(right);
    if (weightDiff !== 0) return weightDiff;

    const oneRepMaxDiff = getPersonalBestOneRepMax(left) - getPersonalBestOneRepMax(right);
    if (oneRepMaxDiff !== 0) return oneRepMaxDiff;

    return 0;
}

export function isBetterPersonalBest(candidate, current) {
    if (!current) return true;
    return comparePersonalBestEntries(candidate, current) > 0;
}

export function getPersonalBestHistory(exercise, type) {
    const history = Array.isArray(exercise.personalBests) ? exercise.personalBests : [];
    if (!type) return history;
    return history.filter((entry) => entry.type === type);
}

export function getCurrentPersonalBest(exercise, type) {
    const history = getPersonalBestHistory(exercise, type);
    if (history.length === 0) return null;
    return history.reduce((best, entry) => comparePersonalBestEntries(entry, best) > 0 ? entry : best, history[0]);
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

function migrateLegacyArmGroup(groups) {
    const legacyGroupNames = ["Arms", "arm", "arms", "Bicept"];
    const legacyExercises = legacyGroupNames.flatMap((groupName) => {
        const exercises = groups[groupName]?.exercises;
        return Array.isArray(exercises) ? exercises : [];
    });

    const nextGroups = {...groups};
    const existingBicep = nextGroups.Bicep?.exercises || [];

    if (legacyExercises.length > 0 || nextGroups.Bicept) {
        nextGroups.Bicep = {
            ...(nextGroups.Bicep || initialGroups.Bicep),
            exercises: [...existingBicep, ...legacyExercises],
        };
    }

    legacyGroupNames.forEach((groupName) => {
        delete nextGroups[groupName];
    });

    return nextGroups;
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

