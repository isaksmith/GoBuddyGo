export default function ARCoPilotScreen() {
  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="bg-gray-200 border-b border-gray-300 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-500 font-mono">9:41 AM</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-gray-400 rounded-sm" />
          <div className="w-3 h-2 bg-gray-400 rounded-sm" />
        </div>
      </div>

      <div className="relative flex-1 bg-gray-700 overflow-hidden flex flex-col">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500 text-sm font-medium">[ Camera Viewport ]</div>
        </div>

        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="border border-gray-400" />
          ))}
        </div>

        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <div className="bg-black bg-opacity-50 rounded-lg p-2">
            <div className="text-gray-300 text-xs mb-1 font-semibold">Session Timer</div>
            <div className="h-4 bg-gray-500 rounded w-16" />
          </div>
          <div className="bg-black bg-opacity-50 rounded-lg p-2">
            <div className="text-gray-300 text-xs mb-1 font-semibold">Missions</div>
            <div className="h-4 bg-gray-500 rounded w-12" />
          </div>
        </div>

        <div className="absolute top-1/4 left-1/4">
          <div className="w-24 h-24 border-2 border-dashed border-yellow-300 border-opacity-60 rounded-full flex items-center justify-center">
            <span className="text-yellow-200 text-xs text-center opacity-80">Sparkle<br />Trail</span>
          </div>
        </div>

        <div className="absolute top-1/3 right-8">
          <div className="w-16 h-16 border-2 border-dashed border-blue-300 border-opacity-60 rounded-lg flex items-center justify-center">
            <span className="text-blue-200 text-xs text-center opacity-80">Mission<br />Shield</span>
          </div>
        </div>

        <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2">
          <div className="w-14 h-14 border-2 border-dashed border-green-300 border-opacity-60 rounded-full flex items-center justify-center">
            <span className="text-green-200 text-xs text-center opacity-80">Speed<br />Star</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1">
              <div className="text-gray-400 text-xs mb-1 font-semibold uppercase tracking-wide">Current Mission</div>
              <div className="h-3 bg-gray-500 rounded w-full mb-1" />
              <div className="h-3 bg-gray-600 rounded w-3/4" />
            </div>
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-400 rounded" />
            </div>
          </div>

          <div className="flex gap-3 mb-3">
            <div className="flex-1 bg-gray-600 rounded-lg p-2 text-center">
              <div className="h-2 bg-gray-500 rounded w-full mb-1" />
              <div className="text-gray-400 text-xs">Missions Done</div>
            </div>
            <div className="flex-1 bg-gray-600 rounded-lg p-2 text-center">
              <div className="h-2 bg-gray-500 rounded w-full mb-1" />
              <div className="text-gray-400 text-xs">Badges</div>
            </div>
            <div className="flex-1 bg-gray-600 rounded-lg p-2 text-center">
              <div className="h-2 bg-gray-500 rounded w-full mb-1" />
              <div className="text-gray-400 text-xs">Time Left</div>
            </div>
          </div>

          <div className="w-full h-10 bg-red-900 bg-opacity-60 border border-red-500 border-opacity-40 rounded-lg flex items-center justify-center">
            <div className="h-3 bg-red-400 bg-opacity-50 rounded w-24" />
          </div>
          <div className="text-center text-xs text-gray-500 mt-1">End Session button</div>
        </div>
      </div>

      <div className="bg-gray-100 border-t border-gray-200 px-4 py-2">
        <div className="text-xs text-gray-400 text-center font-medium">Screen 2 — AR Co-Pilot</div>
      </div>
    </div>
  );
}
