export default function HomeScreen() {
  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="bg-gray-200 border-b border-gray-300 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-500 font-mono">9:41 AM</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-gray-400 rounded-sm" />
          <div className="w-3 h-2 bg-gray-400 rounded-sm" />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pt-10 pb-6 gap-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center border-2 border-dashed border-gray-400">
            <span className="text-gray-500 text-xs text-center leading-tight">App<br />Logo</span>
          </div>
          <div className="h-5 bg-gray-300 rounded w-48 mx-auto mb-1" />
          <div className="h-3 bg-gray-200 rounded w-32 mx-auto" />
        </div>

        <div className="w-full bg-white border border-gray-300 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Welcome back</div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-1" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
        </div>

        <div className="w-full space-y-3">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Child Name</div>
          <div className="w-full h-10 bg-white border-2 border-gray-300 rounded-lg flex items-center px-3">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="ml-auto w-3 h-4 bg-gray-300 rounded-sm animate-pulse" />
          </div>
          <div className="text-xs text-gray-400">Name stored locally on device</div>
        </div>

        <div className="w-full space-y-3 mt-2">
          <div className="w-full h-14 bg-gray-800 rounded-xl flex items-center justify-center shadow">
            <div className="h-4 bg-gray-500 rounded w-28" />
          </div>
          <div className="text-center text-xs text-gray-400">Primary CTA — "Start Mission"</div>
        </div>

        <div className="w-full bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-400 rounded" />
            </div>
            <div>
              <div className="h-3 bg-gray-200 rounded w-24 mb-1" />
              <div className="h-2 bg-gray-100 rounded w-16" />
            </div>
            <div className="ml-auto">
              <div className="h-3 bg-gray-300 rounded w-12" />
            </div>
          </div>
        </div>

        <div className="w-full flex items-center justify-center gap-2 mt-auto">
          <div className="w-2 h-2 bg-gray-300 rounded-full" />
          <div className="text-xs text-gray-300">Hidden PIN entry for Parent Mode</div>
          <div className="w-2 h-2 bg-gray-300 rounded-full" />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-6 py-3 flex justify-around">
        <div className="flex flex-col items-center gap-1">
          <div className="w-6 h-6 bg-gray-800 rounded" />
          <div className="h-2 bg-gray-300 rounded w-8" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-6 h-6 bg-gray-200 rounded" />
          <div className="h-2 bg-gray-200 rounded w-8" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-6 h-6 bg-gray-200 rounded" />
          <div className="h-2 bg-gray-200 rounded w-8" />
        </div>
      </div>

      <div className="bg-gray-100 border-t border-gray-200 px-4 py-2">
        <div className="text-xs text-gray-400 text-center font-medium">Screen 1 — Home</div>
      </div>
    </div>
  );
}
