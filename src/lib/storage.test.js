import {describe, expect, it} from "vitest";
import {initialGroups, loadGroups, saveGroups, storageKey} from "./storage.js";

describe("loadGroups", () => {
    it("returns the default muscle groups when nothing is saved", () => {
        expect(Object.keys(loadGroups())).toEqual(Object.keys(initialGroups));
    });

    it("backfills ids and missing arrays on old saves", () => {
        localStorage.setItem(storageKey, JSON.stringify({
            Chest: {exercises: [{name: "Bench", baseWeight: 0, sets: [{weight: "100", reps: "5"}], personalBests: [
                {type: "e1RM", value: 116, achievedAt: "2026-10-01", source: {bestSet: {weight: "100", reps: "5"}}},
            ]}]},
        }));

        const groups = loadGroups();
        const [bench] = groups.Chest.exercises;
        expect(bench.id).toBeTruthy();
        expect(bench.sets[0].id).toBeTruthy();
        expect(bench.personalBests[0].id).toBeTruthy();
        expect(bench.sessions).toEqual([]);
        expect(groups.Back).toEqual({exercises: []});
    });

    it("keeps a copy of corrupted data and falls back to defaults instead of crashing", () => {
        localStorage.setItem(storageKey, "{not json");
        expect(Object.keys(loadGroups())).toEqual(Object.keys(initialGroups));
        expect(localStorage.getItem(`${storageKey}:corrupt`)).toBe("{not json");
    });

    it("round-trips through saveGroups", () => {
        const groups = loadGroups();
        saveGroups(groups);
        expect(loadGroups()).toEqual(groups);
    });
});
