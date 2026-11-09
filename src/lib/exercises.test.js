import {describe, expect, it} from "vitest";
import {
    addExercise,
    capitalizeWords,
    createExercise,
    createSet,
    findExercise,
    getCompletedSets,
    removeExercise,
    updateExercise,
} from "./exercises.js";

function groupsWith(...names) {
    return {Chest: {exercises: names.map(createExercise)}, Back: {exercises: []}};
}

describe("createExercise / createSet", () => {
    it("gives each exercise and set a unique id", () => {
        const a = createExercise("Bench");
        const b = createExercise("Bench");
        expect(a.id).toBeTruthy();
        expect(a.id).not.toBe(b.id);
        expect(a).toMatchObject({name: "Bench", sets: [], personalBests: [], sessions: []});
        expect(createSet().id).not.toBe(createSet().id);
    });
});

describe("capitalizeWords", () => {
    it("title-cases and collapses spaces", () => {
        expect(capitalizeWords("  incline   bench press ")).toBe("Incline Bench Press");
    });
});

describe("group updates by id", () => {
    it("adds an exercise to the end of a group", () => {
        const groups = groupsWith("Bench");
        const next = addExercise(groups, "Chest", createExercise("Fly"));
        expect(next.Chest.exercises.map((e) => e.name)).toEqual(["Bench", "Fly"]);
        expect(groups.Chest.exercises).toHaveLength(1);
    });

    it("updates only the matching exercise, with an object or a function", () => {
        const groups = groupsWith("Bench", "Fly");
        const [bench, fly] = groups.Chest.exercises;

        const renamed = updateExercise(groups, "Chest", fly.id, {name: "Cable Fly"});
        expect(renamed.Chest.exercises[1].name).toBe("Cable Fly");
        expect(renamed.Chest.exercises[0]).toBe(bench);

        const withSet = updateExercise(groups, "Chest", bench.id, (ex) => ({...ex, sets: [createSet()]}));
        expect(withSet.Chest.exercises[0].sets).toHaveLength(1);
    });

    it("removes an exercise by id and leaves the others", () => {
        const groups = groupsWith("Bench", "Fly", "Dips");
        const fly = groups.Chest.exercises[1];
        const next = removeExercise(groups, "Chest", fly.id);
        expect(next.Chest.exercises.map((e) => e.name)).toEqual(["Bench", "Dips"]);
        expect(next.Back).toBe(groups.Back);
    });

    it("finds an exercise by id", () => {
        const groups = groupsWith("Bench");
        const bench = groups.Chest.exercises[0];
        expect(findExercise(groups, "Chest", bench.id)).toBe(bench);
        expect(findExercise(groups, "Chest", "missing")).toBeNull();
    });
});

describe("getCompletedSets", () => {
    it("ignores rows missing weight or reps", () => {
        const ex = {sets: [{weight: "100", reps: "5"}, {weight: "", reps: "5"}, {weight: "100", reps: ""}]};
        expect(getCompletedSets(ex)).toEqual([{weight: "100", reps: "5"}]);
    });
});
