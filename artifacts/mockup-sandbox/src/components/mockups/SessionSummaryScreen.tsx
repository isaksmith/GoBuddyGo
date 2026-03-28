export default function SessionSummaryScreen() {
  const badges = [
    { label: "Cheer Leader" },
    { label: "High Fiver" },
    { label: "Team Player" },
    { label: "???", locked: true },
    { label: "???", locked: true },
    { label: "???", locked: true },
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

      <div className="flex-1 flex flex-col px-5 py-5 gap-4 overflow-hidden">
        <div className="bg-gray-800 rounded-2xl p-4 text-center shadow">
          <div className="w-12 h-12 bg-gray-600 rounded-full mx-auto mb-2 flex items-center justify-center">
            <div className="w-6 h-6 bg-gray-400 rounded" />
          </div>
          <div className="h-5 bg-gray-500 rounded w-40 mx-auto mb-1" />
          <div className="h-3 bg-gray-600 rounded w-28 mx-auto" />
          <div className="text-gray-500 text-xs mt-1">Mission Complete Banner</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-gray-300 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-12" />
          </div>
          <div className="flex gap-4 justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">2</div>
              <div className="text-xs text-gray-400">Missions Done</div>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">3</div>
              <div className="text-xs text-gray-400">Badges Earned</div>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">12m</div>
              <div className="text-xs text-gray-400">Session Time</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="h-4 bg-gray-300 rounded w-28 mb-3" />
          <div className="grid grid-cols-3 gap-3">
            {badges.map((badge, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-14 h-14 rounded-xl border-2 border-dashed flex items-center justify-center ${
                    badge.locked ? "border-gray-200 bg-gray-50" : "border-gray-300 bg-gray-100"
                  }`}
                >
                  {badge.locked ? (
                    <div className="w-5 h-5 bg-gray-200 rounded" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-lg" />
                  )}
                </div>
                <div className="text-center">
                  <div className={`h-2 rounded w-12 ${badge.locked ? "bg-gray-100" : "bg-gray-200"}`} />
                </div>
                <div className="text-xs text-gray-400 text-center leading-tight">{badge.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 mt-auto">
          <div className="w-full h-12 bg-gray-800 rounded-xl flex items-center justify-center shadow">
            <div className="h-4 bg-gray-500 rounded w-28" />
          </div>
          <div className="text-center text-xs text-gray-400">Share Recap button</div>
          <div className="w-full h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center">
            <div className="h-3 bg-gray-200 rounded w-24" />
          </div>
          <div className="text-center text-xs text-gray-400">Play Again / Go Home</div>
        </div>
      </div>

      <div className="bg-gray-100 border-t border-gray-200 px-4 py-2">
        <div className="text-xs text-gray-400 text-center font-medium">Screen 4 — Session Summary</div>
      </div>
    </div>
  );
}
