import HomeScreen from "./HomeScreen";
import ARCoPilotScreen from "./ARCoPilotScreen";
import MissionsScreen from "./MissionsScreen";
import SessionSummaryScreen from "./SessionSummaryScreen";
import ParentModeScreen from "./ParentModeScreen";

const SCREENS = [
  {
    id: 1,
    name: "Home",
    component: HomeScreen,
    desc: "Welcome, child name input,\nStart Mission CTA, PIN access",
  },
  {
    id: 2,
    name: "AR Co-Pilot",
    component: ARCoPilotScreen,
    desc: "Camera viewport, AR overlays,\nmission HUD, End Session",
  },
  {
    id: 3,
    name: "Missions",
    component: MissionsScreen,
    desc: "Mission list, progress bar,\ntap-to-complete checkboxes",
  },
  {
    id: 4,
    name: "Session Summary",
    component: SessionSummaryScreen,
    desc: "Mission Complete banner, badges,\nstats, Share Recap button",
  },
  {
    id: 5,
    name: "Parent Mode",
    component: ParentModeScreen,
    desc: "PIN gate, duration slider,\ndifficulty, mission toggles",
  },
];

function Arrow() {
  return (
    <div className="flex flex-col items-center justify-center flex-shrink-0 self-center" style={{ width: 64 }}>
      <div className="flex flex-col items-center gap-1">
        <svg width="48" height="24" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="4" y1="12" x2="36" y2="12" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4 3" />
          <path d="M36 6L44 12L36 18" stroke="#9CA3AF" strokeWidth="2" strokeLinejoin="round" fill="none" />
        </svg>
        <div className="text-gray-400 text-xs text-center leading-tight" style={{ fontSize: 10 }}>
          navigate
        </div>
      </div>
    </div>
  );
}

function PhoneFrame({ children, label, description, screenNum }: {
  children: React.ReactNode;
  label: string;
  description: string;
  screenNum: number;
}) {
  return (
    <div className="flex flex-col items-center flex-shrink-0" style={{ width: 200 }}>
      <div className="mb-3 text-center">
        <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-700 text-white text-xs font-bold mb-1">
          {screenNum}
        </div>
        <div className="text-sm font-semibold text-gray-700">{label}</div>
      </div>

      <div className="relative bg-gray-900 rounded-3xl shadow-xl overflow-hidden" style={{ width: 160, height: 320, padding: "6px 4px" }}>
        <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-gray-700 rounded-full z-10" />
        <div className="w-full h-full rounded-2xl overflow-hidden bg-white">
          <div style={{ transform: "scale(0.40)", transformOrigin: "top left", width: "250%", height: "250%", pointerEvents: "none" }}>
            {children}
          </div>
        </div>
      </div>

      <div className="mt-3 text-center px-1">
        <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">{description}</p>
      </div>
    </div>
  );
}

export default function GoBabyGoBuddyLinkCanvas() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">GoBabyGo Buddy-Link AR App</h1>
            <p className="text-sm text-gray-500 mt-0.5">Wireframe Canvas — All 5 screens, left-to-right user journey</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 border border-dashed border-gray-400 rounded-sm" />
              <span className="text-xs text-gray-500">Placeholder content</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="20" height="10" viewBox="0 0 20 10">
                <line x1="2" y1="5" x2="14" y2="5" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3 2" />
                <path d="M14 2L18 5L14 8" stroke="#9CA3AF" strokeWidth="1.5" fill="none" />
              </svg>
              <span className="text-xs text-gray-500">Navigation flow</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 py-10">
        <div className="flex items-start justify-center gap-0 overflow-x-auto">
          {SCREENS.map((screen, i) => {
            const ScreenComp = screen.component;
            return (
              <div key={screen.id} className="flex items-center">
                <PhoneFrame label={screen.name} description={screen.desc} screenNum={screen.id}>
                  <ScreenComp />
                </PhoneFrame>
                {i < SCREENS.length - 1 && <Arrow />}
              </div>
            );
          })}
        </div>

        <div className="mt-10 bg-white rounded-xl border border-gray-200 p-5 shadow-sm max-w-3xl mx-auto w-full">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Navigation Flow Notes</h2>
          <div className="space-y-2">
            {[
              { from: "Home", to: "AR Co-Pilot", action: "Tap 'Start Mission' button" },
              { from: "AR Co-Pilot", to: "Missions", action: "Tap mission panel / bottom HUD tab" },
              { from: "AR Co-Pilot", to: "Session Summary", action: "Tap 'End Session' button" },
              { from: "Session Summary", to: "Home", action: "Tap 'Play Again' or 'Go Home'" },
              { from: "Home", to: "Parent Mode", action: "Hidden PIN tap zone (long-press logo area)" },
            ].map((note, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{note.from}</span>
                <svg width="16" height="10" viewBox="0 0 16 10">
                  <line x1="1" y1="5" x2="11" y2="5" stroke="#9CA3AF" strokeWidth="1.5" />
                  <path d="M11 2L15 5L11 8" stroke="#9CA3AF" strokeWidth="1.5" fill="none" />
                </svg>
                <span className="font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{note.to}</span>
                <span className="text-gray-400">—</span>
                <span>{note.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-8 py-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">GoBabyGo Buddy-Link — Wireframe Blueprint v1</span>
        <span className="text-xs text-gray-400">5 screens · Static wireframes · No final branding</span>
      </div>
    </div>
  );
}
