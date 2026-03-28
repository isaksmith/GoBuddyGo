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

export interface PlacedSticker {
  uid: string;
  stickerId: string;
  x: number;
  y: number;
}

export interface GarageVehicle {
  photoUri: string | null;
  vehicleName: string;
  stickers: PlacedSticker[];
}

export interface StickerDefinition {
  id: string;
  emoji: string;
  label: string;
  color: string;
  unlockCondition: null | { type: "sessions"; count: number } | { type: "badges"; count: number };
}

export const STICKER_CATALOG: StickerDefinition[] = [
  { id: "s_star", emoji: "⭐", label: "Star", color: "#F5C518", unlockCondition: null },
  { id: "s_fire", emoji: "🔥", label: "Flames", color: "#F4633A", unlockCondition: null },
  { id: "s_lightning", emoji: "⚡", label: "Lightning", color: "#FFE135", unlockCondition: null },
  { id: "s_heart", emoji: "❤️", label: "Heart", color: "#EF476F", unlockCondition: null },
  { id: "s_rocket", emoji: "🚀", label: "Rocket", color: "#4FC3F7", unlockCondition: null },
  { id: "s_thumbsup", emoji: "👍", label: "Thumbs Up", color: "#3ECF8E", unlockCondition: null },
  { id: "s_rainbow", emoji: "🌈", label: "Rainbow", color: "#B39DDB", unlockCondition: { type: "sessions", count: 1 } },
  { id: "s_trophy", emoji: "🏆", label: "Trophy", color: "#F5C518", unlockCondition: { type: "sessions", count: 2 } },
  { id: "s_crown", emoji: "👑", label: "Crown", color: "#F5C518", unlockCondition: { type: "badges", count: 1 } },
  { id: "s_diamond", emoji: "💎", label: "Diamond", color: "#4FC3F7", unlockCondition: { type: "badges", count: 2 } },
  { id: "s_zap", emoji: "🎯", label: "Bullseye", color: "#EF476F", unlockCondition: { type: "sessions", count: 3 } },
  { id: "s_unicorn", emoji: "🦄", label: "Unicorn", color: "#CE93D8", unlockCondition: { type: "badges", count: 3 } },
  { id: "s_explosion", emoji: "💥", label: "Blast!", color: "#FF7043", unlockCondition: { type: "sessions", count: 5 } },
  { id: "s_alien", emoji: "👾", label: "Alien", color: "#4FC3F7", unlockCondition: { type: "sessions", count: 5 } },
];

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

const DEFAULT_GARAGE: GarageVehicle = {
  photoUri: null,
  vehicleName: "My Ride",
  stickers: [],
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
  startSingleMission: (missionId: string) => Promise<boolean>;
  endSession: () => Promise<void>;
  completeMission: (missionId: string) => void;
  isLoaded: boolean;
  garage: GarageVehicle;
  setVehiclePhoto: (uri: string) => Promise<void>;
  setVehicleName: (name: string) => Promise<void>;
  placeSticker: (stickerId: string, x: number, y: number) => Promise<void>;
  removeSticker: (uid: string) => Promise<void>;
  moveSticker: (uid: string, x: number, y: number) => Promise<void>;
  isStickerUnlocked: (sticker: StickerDefinition) => boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  settings: "@gobabygobr_settings",
  history: "@gobabygobr_history",
  session: "@gobabygobr_session",
  garage: "@gobabygobr_garage",
};

export function countAvailableSessionMissions(missions: Mission[], settings: AppSettings): number {
  const enabled = missions.filter(
    (m) => settings.enabledMissionIds.includes(m.id) && m.enabled
  );
  const filtered =
    settings.difficulty === "all"
      ? enabled
      : enabled.filter(
          (m) => m.difficulty === settings.difficulty || m.difficulty === "easy"
        );
  return filtered.length;
}

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
  if (filtered.length < 3) {
    return [];
  }
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

function makeStickerUid(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
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
  const [garage, setGarageState] = useState<GarageVehicle>(DEFAULT_GARAGE);

  useEffect(() => {
    (async () => {
      try {
        const [rawSettings, rawHistory, rawSession, rawGarage] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.settings),
          AsyncStorage.getItem(STORAGE_KEYS.history),
          AsyncStorage.getItem(STORAGE_KEYS.session),
          AsyncStorage.getItem(STORAGE_KEYS.garage),
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
        if (rawGarage) setGarageState({ ...DEFAULT_GARAGE, ...JSON.parse(rawGarage) });
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const persistGarage = useCallback(async (next: GarageVehicle) => {
    await AsyncStorage.setItem(STORAGE_KEYS.garage, JSON.stringify(next));
  }, []);

  const updateSettings = useCallback(
    async (updates: Partial<AppSettings>) => {
      const next = { ...settings, ...updates };
      setSettings(next);
      await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(next));
    },
    [settings]
  );

  const setVehiclePhoto = useCallback(
    async (uri: string) => {
      let next: GarageVehicle = DEFAULT_GARAGE;
      setGarageState((prev) => {
        next = { ...prev, photoUri: uri };
        return next;
      });
      await persistGarage(next);
    },
    [persistGarage]
  );

  const setVehicleName = useCallback(
    async (name: string) => {
      let next: GarageVehicle = DEFAULT_GARAGE;
      setGarageState((prev) => {
        next = { ...prev, vehicleName: name };
        return next;
      });
      await persistGarage(next);
    },
    [persistGarage]
  );

  const placeSticker = useCallback(
    async (stickerId: string, x: number, y: number) => {
      const newSticker: PlacedSticker = { uid: makeStickerUid(), stickerId, x, y };
      let next: GarageVehicle = DEFAULT_GARAGE;
      setGarageState((prev) => {
        next = { ...prev, stickers: [...prev.stickers, newSticker] };
        return next;
      });
      await persistGarage(next);
    },
    [persistGarage]
  );

  const removeSticker = useCallback(
    async (uid: string) => {
      let next: GarageVehicle = DEFAULT_GARAGE;
      setGarageState((prev) => {
        next = { ...prev, stickers: prev.stickers.filter((s) => s.uid !== uid) };
        return next;
      });
      await persistGarage(next);
    },
    [persistGarage]
  );

  const moveSticker = useCallback(
    async (uid: string, x: number, y: number) => {
      let next: GarageVehicle = DEFAULT_GARAGE;
      setGarageState((prev) => {
        next = { ...prev, stickers: prev.stickers.map((s) => (s.uid === uid ? { ...s, x, y } : s)) };
        return next;
      });
      await persistGarage(next);
    },
    [persistGarage]
  );

  const isStickerUnlocked = useCallback(
    (sticker: StickerDefinition): boolean => {
      if (!sticker.unlockCondition) return true;
      const historicBadges = sessionHistory.reduce((sum, r) => sum + r.badges.length, 0);
      const totalBadges = historicBadges + currentBadges.length;
      const totalSessions = sessionHistory.length;
      if (sticker.unlockCondition.type === "sessions") {
        return totalSessions >= sticker.unlockCondition.count;
      }
      if (sticker.unlockCondition.type === "badges") {
        return totalBadges >= sticker.unlockCondition.count;
      }
      return false;
    },
    [sessionHistory, currentBadges]
  );

  const startSession = useCallback(async () => {
    const selected = selectSessionMissions(ALL_MISSIONS, settings);
    if (selected.length < 3) {
      return;
    }
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

  const startSingleMission = useCallback(async (missionId: string): Promise<boolean> => {
    const enabled = ALL_MISSIONS.filter(
      (m) => settings.enabledMissionIds.includes(m.id) && m.enabled
    );
    const filtered =
      settings.difficulty === "all"
        ? enabled
        : enabled.filter(
            (m) => m.difficulty === settings.difficulty || m.difficulty === "easy"
          );
    const mission = filtered.find((m) => m.id === missionId);
    if (!mission) return false;
    const missions: SessionMission[] = [{ ...mission, completed: false }];
    const startTime = Date.now();
    setSessionMissions(missions);
    setSessionActive(true);
    setSessionStartTime(startTime);
    setCurrentBadges([]);
    await AsyncStorage.setItem(
      STORAGE_KEYS.session,
      JSON.stringify({ missions, active: true, startTime })
    );
    return true;
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
        startSingleMission,
        endSession,
        completeMission,
        isLoaded,
        garage,
        setVehiclePhoto,
        setVehicleName,
        placeSticker,
        removeSticker,
        moveSticker,
        isStickerUnlocked,
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
