import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {Dumbbell} from "lucide-react"

const muscleGroups = ["Chest", "Back", "Legs", "Shoulders", "Bicep", "Triceps", "Core"];

function WorkoutTracker() {
    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 p-6 md:p-10">
            <header className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <Dumbbell className="w-5 h-5 text-amber-400"/>
                </div>
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Session Log
                    </h1>
                </div>
            </header>

            <div className="space-y-4 container">
                {muscleGroups.map((group) => (
                    <section
                        key={group}
                        className="rounded-xl border border-stone-800 bg-stone-900/60 px-4 py-3"
                    >
                        <h2 className="font-medium text-stone-100">{group}</h2>
                        <p className="text-xs text-stone-500 mt-1">
                        </p>
                    </section>
                ))}
            </div>
        </div>
    );
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <WorkoutTracker/>
    </StrictMode>
)