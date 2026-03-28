import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "cheer" | "interact" | "count" | "move";
  difficulty: "easy" | "medium" | "hard";
  enabled: boolean;
}

export interface SessionMission extends Mission {
  completed: boolean;
  completedAt?: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: number;
}

export interface SessionRecord {
  id: string;
  date: number;
  missionsCompleted: number;
  totalMissions: number;
  durationSeconds: number;
  badges: Badge[];
  childName: string;
}

export interface AppSettings {
  childName: string;
  sessionDurationMinutes: number;
  difficulty: "easy" | "medium" | "all";
  enabledMissionIds: string[];
  parentPin: string;
}

const ALL_MISSIONS: Mission[] = [
  {
    id: "m1",
    title: "Cheer Loud!",
    description: "Cheer for the driver for 5 seconds!",
    icon: "megaphone",
    category: "cheer",
    difficulty: "easy",
    enabled: true,
  },
  {
    id: "m2",
    title: "High Five!",
    description: "Give the driver a high five",
    icon: "hand-right",
    category: "interact",
    difficulty: "easy",
    enabled: true,
  },
  {
    id: "m3",
    title: "Count to 10!",
    description: "Count to 10 out loud together",
    icon: "calculator",
    category: "count",
    difficulty: "easy",
    enabled: true,
  },
  {
    id: "m4",
    title: "Do a Dance!",
    description: "Do a little dance while they drive",
    icon: "musical-notes",
    category: "move",
    difficulty: "easy",
    enabled: true,
  },
  {
    id: "m5",
    title: "Thumbs Up!",
    description: "Give a big thumbs up from the sideline",
    icon: "thumbs-up",
    category: "interact",
    difficulty: "easy",
    enabled: true,
  },
  {
    id: "m6",
    title: "Speed Reporter",
    description: "Announce the driver's speed in your best sports voice",
    icon: "radio",
    category: "cheer",
    difficulty: "medium",
    enabled: true,
  },
  {
    id: "m7",
    title: "Steer Together",
    description: "Point left and right as the driver turns",
    icon: "navigate",
    category: "interact",
    difficulty: "medium",
    enabled: true,
  },
  {
    id: "m8",
    title: "Count Wheels",
    description: "Count how many times the wheels spin",
    icon: "sync",
    category: "count",
    difficulty: "medium",
    enabled: true,
  },
  {
    id: "m9",
    title: "Victory Lap Cheer",
    description: "Run alongside and cheer for a full lap",
    icon: "trophy",
    category: "move",
    difficulty: "hard",
    enabled: true,
  },
  {
    id: "m10",
    title: "Secret Signal",
    description: "Create a secret signal with the driver and use it",
    icon: "hand-left",
    category: "interact",
    difficulty: "hard",
    enabled: true,
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  childName: "",
  sessionDurationMinutes: 10,
  difficulty: "all",
  enabledMissionIds: ALL_MISSIONS.map((m) => m.id),
  parentPin: "1234",
};

export interface LastSessionResult {
  missions: SessionMission[];
  badges: Badge[];
  completed: number;
  total: number;
  durationSeconds: number;
  childName: string;
}

interface AppContextValue {
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => Promise<void>;
  missions: Mission[];
  sessionMissions: SessionMission[];
  sessionActive: boolean;
  sessionStartTime: number | null;
  sessionHistory: SessionRecord[];
  currentBadges: Badge[];
  lastSessionResult: LastSessionResult | null;
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  completeMission: (missionId: string) => void;
  isLoaded: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  settings: "@gobabygobr_settings",
  history: "@gobabygobr_history",
  session: "@gobabygobr_session",
};

function selectSessionMissions(
  missions: Mission[],
  settings: AppSettings
): Mission[] {
  const enabled = missions.filter(
    (m) => settings.enabledMissionIds.includes(m.id) && m.enabled
  );
  const filtered =
    settings.difficulty === "all"
      ? enabled
      : enabled.filter(
          (m) =>
            m.difficulty === settings.difficulty ||
            m.difficulty === "easy"
        );
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

function generateBadges(
  missions: SessionMission[],
  durationSeconds: number
): Badge[] {
  const badges: Badge[] = [];
  const completed = missions.filter((m) => m.completed).length;

  if (completed >= 1) {
    badges.push({
      id: "first-mission",
      title: "First Mission!",
      description: "Completed your first mission",
      icon: "star",
      earnedAt: Date.now(),
    });
  }
  if (completed >= 3) {
    badges.push({
      id: "triple",
      title: "Triple Threat!",
      description: "Completed 3 missions",
      icon: "flame",
      earnedAt: Date.now(),
    });
  }
  if (completed === missions.length && missions.length > 0) {
    badges.push({
      id: "perfect",
      title: "Perfect Co-Pilot!",
      description: "Completed all missions!",
      icon: "rocket",
      earnedAt: Date.now(),
    });
  }
  if (durationSeconds >= 300) {
    badges.push({
      id: "endurance",
      title: "Endurance Champ",
      description: "Stayed for 5+ minutes",
      icon: "timer",
      earnedAt: Date.now(),
    });
  }
  return badges;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);
  const [sessionMissions, setSessionMissions] = useState<SessionMission[]>([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [currentBadges, setCurrentBadges] = useState<Badge[]>([]);
  const [lastSessionResult, setLastSessionResult] = useState<LastSessionResult | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [rawSettings, rawHistory, rawSession] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.settings),
          AsyncStorage.getItem(STORAGE_KEYS.history),
          AsyncStorage.getItem(STORAGE_KEYS.session),
        ]);
        if (rawSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) });
        if (rawHistory) setSessionHistory(JSON.parse(rawHistory));
        if (rawSession) {
          const session = JSON.parse(rawSession) as {
            missions: SessionMission[];
            active: boolean;
            startTime: number | null;
          };
          if (session.active) {
            setSessionMissions(session.missions);
            setSessionActive(true);
            setSessionStartTime(session.startTime);
          }
        }
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const updateSettings = useCallback(
    async (updates: Partial<AppSettings>) => {
      const next = { ...settings, ...updates };
      setSettings(next);
      await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(next));
    },
    [settings]
  );

  const startSession = useCallback(async () => {
    const selected = selectSessionMissions(ALL_MISSIONS, settings);
    const missions: SessionMission[] = selected.map((m) => ({ ...m, completed: false }));
    const startTime = Date.now();
    setSessionMissions(missions);
    setSessionActive(true);
    setSessionStartTime(startTime);
    setCurrentBadges([]);
    await AsyncStorage.setItem(
      STORAGE_KEYS.session,
      JSON.stringify({ missions, active: true, startTime })
    );
  }, [settings]);

  const completeMission = useCallback(
    (missionId: string) => {
      setSessionMissions((prev) => {
        const updated = prev.map((m) =>
          m.id === missionId ? { ...m, completed: true, completedAt: Date.now() } : m
        );
        AsyncStorage.setItem(
          STORAGE_KEYS.session,
          JSON.stringify({ missions: updated, active: true, startTime: sessionStartTime })
        ).catch(() => {});
        return updated;
      });
    },
    [sessionStartTime]
  );

  const endSession = useCallback(async () => {
    if (!sessionStartTime) return;
    const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
    const badges = generateBadges(sessionMissions, duration);
    const completedCount = sessionMissions.filter((m) => m.completed).length;
    setCurrentBadges(badges);

    const snapshot: LastSessionResult = {
      missions: sessionMissions,
      badges,
      completed: completedCount,
      total: sessionMissions.length,
      durationSeconds: duration,
      childName: settings.childName,
    };
    setLastSessionResult(snapshot);

    const record: SessionRecord = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: Date.now(),
      missionsCompleted: completedCount,
      totalMissions: sessionMissions.length,
      durationSeconds: duration,
      badges,
      childName: settings.childName,
    };

    const newHistory = [record, ...sessionHistory].slice(0, 50);
    setSessionHistory(newHistory);
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.history, JSON.stringify(newHistory)),
      AsyncStorage.removeItem(STORAGE_KEYS.session),
    ]);
    setSessionActive(false);
    setSessionStartTime(null);
    setSessionMissions([]);
  }, [sessionStartTime, sessionMissions, sessionHistory, settings.childName]);

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        missions: ALL_MISSIONS,
        sessionMissions,
        sessionActive,
        sessionStartTime,
        sessionHistory,
        currentBadges,
        lastSessionResult,
        startSession,
        endSession,
        completeMission,
        isLoaded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
