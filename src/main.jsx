import {useState} from "react";
import {Dumbbell, Plus} from "lucide-react";
import {createRoot} from "react-dom/client";


const initialGroups = {
    Chest: {exercises: []},
    Back: {exercises: []},
    Legs: {exercises: []},
    Shoulders: {exercises: []},
    Arms: {exercises: []},
    Core: {exercises: []},
};

export default function WorkoutTracker() {
    const [groups, setGroups] = useState(initialGroups);
    const [drafts, setDrafts] = useState({});

    function handleDraftChange(groupName, value) {
        setDrafts({...drafts, [groupName]: value});
    }

    function addExercise(groupName) {
        const name = (drafts[groupName] || "").trim();
        if (!name) return;
        setGroups({
            ...groups,
            [groupName]: {
                ...groups[groupName],
                exercises: [...groups[groupName].exercises, name],
            },
        });

        setDrafts({...drafts, [groupName]: ""});
    }

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 p-6 md:p-10">
            <div className="max-w-3xl mx-auto">
                <header className="flex items-center gap-3 mb-8">
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <Dumbbell className="w-5 h-5 text-amber-400"/>
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Session Log
                        </h1>
                        <p className="text-sm text-stone-400">
                            Add exercises under each muscle group.
                        </p>
                    </div>
                </header>

                <div className="space-y-4">
                    {Object.entries(groups).map(([groupName, group]) => (
                        <section
                            key={groupName}
                            className="rounded-xl border border-stone-800 bg-stone-900/60 px-4 py-3"
                        >
                            <h2 className="font-medium text-stone-100 mb-2">
                                {groupName}
                            </h2>

                            {group.exercises.length > 0 && (
                                <ul className="mb-2 space-y-1">
                                    {group.exercises.map((ex, i) => (
                                        <li
                                            key={i}
                                            className="text-sm text-stone-300 pl-3 border-l-2 border-stone-700"
                                        >
                                            {ex}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={drafts[groupName] || ""}
                                    onChange={(e) => handleDraftChange(groupName, e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addExercise(groupName)}
                                    placeholder={`Add ${groupName.toLowerCase()} exercise…`}
                                    className="flex-1 bg-stone-800 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-stone-600"
                                />
                                <button
                                    onClick={() => addExercise(groupName)}
                                    className="flex items-center gap-1 bg-amber-500 text-stone-950 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-amber-400 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5"/> Add
                                </button>
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}

createRoot(document.getElementById("root")).render(<WorkoutTracker/>);