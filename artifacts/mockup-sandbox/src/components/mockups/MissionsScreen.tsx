export default function MissionsScreen() {
  const missions = [
    { label: "Cheer for 5 seconds", done: true },
    { label: "High-five the driver", done: true },
    { label: "Count to 10 together", done: false },
    { label: "Do a victory dance", done: false },
    { label: "Give a thumbs up", done: false },
  ];

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="bg-gray-200 border-b border-gray-300 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-500 font-mono">9:41 AM</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-gray-400 rounded-sm" />
          <div className="w-3 h-2 bg-gray-400 rounded-sm" />
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="h-5 bg-gray-300 rounded w-32 mb-2" />
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gray-500 rounded-full" style={{ width: "40%" }} />
          </div>
          <div className="text-xs text-gray-500 font-medium">2 / 5</div>
        </div>
        <div className="text-xs text-gray-400 mt-1">Progress indicator</div>
      </div>

      <div className="flex-1 overflow-hidden px-4 py-4 space-y-3">
        {missions.map((mission, i) => (
          <div
            key={i}
            className={`bg-white border rounded-xl p-4 flex items-start gap-3 shadow-sm ${
              mission.done ? "border-gray-300 opacity-60" : "border-gray-200"
            }`}
          >
            <div
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                mission.done ? "bg-gray-400 border-gray-400" : "border-gray-300"
              }`}
            >
              {mission.done && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="h-3 bg-gray-300 rounded w-full mb-1.5" />
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="text-xs text-gray-400 italic">"{mission.label}"</div>
            </div>

            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                mission.done ? "bg-gray-200" : "bg-gray-100"
              }`}
            >
              <div className={`w-4 h-4 rounded ${mission.done ? "bg-gray-400" : "bg-gray-300"}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border-t border-gray-200 px-6 py-3 flex justify-around">
        <div className="flex flex-col items-center gap-1">
          <div className="w-6 h-6 bg-gray-200 rounded" />
          <div className="h-2 bg-gray-200 rounded w-8" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-6 h-6 bg-gray-200 rounded" />
          <div className="h-2 bg-gray-200 rounded w-8" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-6 h-6 bg-gray-800 rounded" />
          <div className="h-2 bg-gray-300 rounded w-8" />
        </div>
      </div>

      <div className="bg-gray-100 border-t border-gray-200 px-4 py-2">
        <div className="text-xs text-gray-400 text-center font-medium">Screen 3 — Missions</div>
      </div>
    </div>
  );
}
