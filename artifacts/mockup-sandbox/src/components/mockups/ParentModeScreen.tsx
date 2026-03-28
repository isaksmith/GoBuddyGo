export default function ParentModeScreen() {
  const missions = [
    { label: "Cheer for 5 seconds", active: true },
    { label: "High-five the driver", active: true },
    { label: "Count to 10 together", active: true },
    { label: "Do a victory dance", active: false },
    { label: "Give a thumbs up", active: false },
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

      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-gray-400 rounded" />
        </div>
        <div>
          <div className="h-4 bg-gray-300 rounded w-32 mb-1" />
          <div className="h-2 bg-gray-200 rounded w-24" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-4 py-4 space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-400 rounded" />
              </div>
              <div className="h-4 bg-gray-300 rounded w-32" />
            </div>
            <div className="text-xs text-gray-400">PIN Gate</div>
          </div>

          <div className="flex gap-2 justify-center mb-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-10 h-12 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full" />
              </div>
            ))}
          </div>
          <div className="text-center text-xs text-gray-400">4-digit PIN entry</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="h-4 bg-gray-300 rounded w-36 mb-3" />

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="h-3 bg-gray-300 rounded w-28" />
                <div className="h-3 bg-gray-200 rounded w-12" />
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gray-500 rounded-full" style={{ width: "50%" }} />
              </div>
              <div className="text-xs text-gray-400 mt-1">Session Duration slider (5–30 min)</div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="h-3 bg-gray-300 rounded w-24" />
              </div>
              <div className="flex gap-2">
                {["Easy", "Medium", "Hard"].map((level, i) => (
                  <div
                    key={i}
                    className={`flex-1 py-2 rounded-lg border text-center text-xs font-medium ${
                      i === 1
                        ? "bg-gray-700 border-gray-700 text-white"
                        : "bg-white border-gray-200 text-gray-400"
                    }`}
                  >
                    {level}
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-1">Difficulty selector</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-gray-300 rounded w-28" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>

          <div className="space-y-2">
            {missions.map((mission, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                <div className="h-3 bg-gray-200 rounded w-48" />
                <div
                  className={`w-10 h-5 rounded-full flex items-center px-0.5 ${
                    mission.active ? "bg-gray-700 justify-end" : "bg-gray-200 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full shadow" />
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-2">Toggle missions on/off</div>
        </div>
      </div>

      <div className="bg-gray-100 border-t border-gray-200 px-4 py-2">
        <div className="text-xs text-gray-400 text-center font-medium">Screen 5 — Parent / Therapist Mode</div>
      </div>
    </div>
  );
}
