import {describe, expect, it} from "vitest";
import {getMachineAdjustedMetrics} from "./metrics.js";

describe("getMachineAdjustedMetrics", () => {
    it("is empty with no completed sets", () => {
        expect(getMachineAdjustedMetrics({sets: []})).toEqual({effort: null, oneRepMax: null, recommendedFiveRep: null});
    });

    it("reports average volume, 1RM and a five-rep target net of base weight", () => {
        const metrics = getMachineAdjustedMetrics({baseWeight: 0, sets: [{weight: "100", reps: "5"}, {weight: "90", reps: "10"}]});
        expect(metrics.effort).toBe("700.0");
        expect(metrics.oneRepMax).toBeCloseTo(120);
        expect(metrics.recommendedFiveRep).toBeCloseTo(120 * 0.86);
    });
});
