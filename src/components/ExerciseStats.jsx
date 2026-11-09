import {getMachineAdjustedMetrics} from "../lib/metrics.js";
import {getCurrentPersonalBest} from "../lib/personalBests.js";
import {formatSet} from "../lib/format.js";

export default function ExerciseStats({exercise}) {
    const metrics = getMachineAdjustedMetrics(exercise);
    const currentPB = getCurrentPersonalBest(exercise, "e1RM");
    if (!metrics.effort && !currentPB) return null;

    return (
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 rounded-md border border-stone-800 bg-stone-950/60 px-3 py-2 text-xs text-stone-300">
            {currentPB && (
                <p className="col-span-2 font-mono text-amber-400">{`PB: ${formatSet(currentPB.source.bestSet)} lb`}</p>
            )}
            {metrics.effort && (
                <div title="Average volume per set (weight × reps, including base weight)">
                    <span className="text-stone-500">Avg volume/set: </span>
                    <span>{metrics.effort}</span>
                </div>
            )}
            {metrics.oneRepMax && (
                <div>
                    <span className="text-stone-500">Est. 1RM: </span>
                    <span>{metrics.oneRepMax.toFixed(1)} lb</span>
                </div>
            )}
            {metrics.recommendedFiveRep && (
                <div>
                    <span className="text-stone-500">5-rep target: </span>
                    <span>{metrics.recommendedFiveRep.toFixed(1)} lb</span>
                </div>
            )}
        </div>
    );
}
