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
  category: "cheer" | "interact" | "count" | "move" | "ar-game";
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
  driverName: string;
}

export interface AppSettings {
  childName: string;
  driverName: string;
  sessionDurationMinutes: number;
  difficulty: "easy" | "medium" | "all";
  enabledMissionIds: string[];
  parentPin: string;
  soundsEnabled: boolean;
  proximityAlertsEnabled: boolean;
  textSize: "small" | "medium" | "large";
}

export interface PlacedSticker {
  uid: string;
  stickerId: string;
  x: number;
  y: number;
}

export type Model3dStatus = "idle" | "pending" | "succeeded" | "failed";

export interface SavedCar {
  id: string;
  name: string;
  photoUri: string;
  stickers: PlacedSticker[];
  model3dTaskId?: string | null;
  model3dStatus?: Model3dStatus;
  model3dUrl?: string | null;
  createdAt: number;
  isDefault?: boolean;
}

export const DEFAULT_CAR: SavedCar = {
  id: "default-car",
  name: "Buddy Car",
  photoUri: "",
  stickers: [],
  createdAt: 0,
  isDefault: true,
};

export interface CarDesign {
  id: string;
  name: string;
  vehicleType: string;
  primaryColor: string;
  accentColor: string;
  accessories: string[];
  createdAt: number;
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

export interface VehicleType {
  id: string;
  label: string;
  emoji: string;
  defaultPrimary: string;
  defaultAccent: string;
  modelUrl?: string;
}

export const VEHICLE_TYPES: VehicleType[] = [
  { id: "speeder", label: "Speeder", emoji: "🏎️", defaultPrimary: "#FF3B30", defaultAccent: "#1C1C1E" },
  { id: "cruiser", label: "Cruiser", emoji: "🚗", defaultPrimary: "#007AFF", defaultAccent: "#C0C0C0" },
  { id: "monster", label: "Monster", emoji: "🚛", defaultPrimary: "#34C759", defaultAccent: "#FFD60A" },
  { id: "rescue", label: "Rescue", emoji: "🚒", defaultPrimary: "#FF3B30", defaultAccent: "#FFFFFF" },
  { id: "explorer", label: "Explorer", emoji: "🚙", defaultPrimary: "#FF9500", defaultAccent: "#1C1C1E" },
  { id: "rocket", label: "Rocket Ride", emoji: "🚀", defaultPrimary: "#AF52DE", defaultAccent: "#FFD60A" },
  { id: "jeep", label: "Jeep", emoji: "🚙", defaultPrimary: "#FF69B4", defaultAccent: "#8B4513", modelUrl: "/api/models/jeep.glb" },
];

export const DESIGN_COLORS = [
  "#FF3B30", "#FF9500", "#FFD60A", "#34C759",
  "#007AFF", "#5856D6", "#AF52DE", "#FF2D55",
  "#FFFFFF", "#C0C0C0", "#4A4A4A", "#1C1C1E",
];

export const DESIGN_ACCESSORIES = [
  { id: "flames", emoji: "🔥", label: "Flames" },
  { id: "stars", emoji: "⭐", label: "Stars" },
  { id: "lightning", emoji: "⚡", label: "Lightning" },
  { id: "crown", emoji: "👑", label: "Crown" },
  { id: "rainbow", emoji: "🌈", label: "Rainbow" },
  { id: "heart", emoji: "❤️", label: "Heart" },
  { id: "diamond", emoji: "💎", label: "Diamond" },
  { id: "rocket", emoji: "🚀", label: "Rocket" },
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
    id: "m8",
    title: "Count Wheels",
    description: "Count how many times the wheels spin",
    icon: "sync",
    category: "count",
    difficulty: "easy",
    enabled: true,
  },
  {
    id: "m9",
    title: "Victory Lap Cheer",
    description: "Run alongside and cheer for a full lap",
    icon: "trophy",
    category: "move",
    difficulty: "easy",
    enabled: true,
  },
  {
    id: "coin-dash",
    title: "AR Drive!",
    description: "Watch your car cruise around in augmented reality — move your phone to follow!",
    icon: "car-sport",
    category: "ar-game",
    difficulty: "medium",
    enabled: true,
  },
];

const DEFAULT_SETTINGS: AppSettings = {
  childName: "",
  driverName: "",
  sessionDurationMinutes: 10,
  difficulty: "all",
  enabledMissionIds: ALL_MISSIONS.map((m) => m.id),
  parentPin: "0000",
  soundsEnabled: true,
  proximityAlertsEnabled: true,
  textSize: "medium",
};

export interface LastSessionResult {
  missions: SessionMission[];
  badges: Badge[];
  completed: number;
  total: number;
  durationSeconds: number;
  childName: string;
  driverName: string;
}

interface AppContextValue {
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => Promise<void>;
  resetProgress: () => Promise<void>;
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
  isStickerUnlocked: (sticker: StickerDefinition) => boolean;
  savedCars: SavedCar[];
  addSavedCar: (photoUri: string, name?: string) => Promise<SavedCar>;
  updateSavedCar: (id: string, updates: Partial<Omit<SavedCar, "id" | "createdAt">>) => Promise<void>;
  deleteSavedCar: (id: string) => Promise<void>;
  designs: CarDesign[];
  addDesign: (data: Omit<CarDesign, "id" | "createdAt">) => Promise<CarDesign>;
  updateDesign: (id: string, updates: Partial<Omit<CarDesign, "id" | "createdAt">>) => Promise<void>;
  deleteDesign: (id: string) => Promise<void>;
  gamesPlayed: number;
  incrementGamesPlayed: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEYS = {
  settings: "@gobabygobr_settings",
  history: "@gobabygobr_history",
  session: "@gobabygobr_session",
  savedCars: "@gobabygobr_saved_cars",
  designs: "@gobabygobr_designs",
  gamesPlayed: "@gobabygobr_games_played",
  legacyGarage: "@gobabygobr_garage",
};

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function makeStickerUid(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

export function countAvailableSessionMissions(missions: Mission[], settings: AppSettings): number {
  const enabled = missions.filter(
    (m) => settings.enabledMissionIds.includes(m.id) && m.enabled && m.category !== "ar-game"
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
    (m) => settings.enabledMissionIds.includes(m.id) && m.enabled && m.category !== "ar-game"
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
      id: "first-victory",
      title: "First Victory",
      description: "Completed your first mission",
      icon: "first-victory",
      earnedAt: Date.now(),
    });
  }
  if (completed >= 3) {
    badges.push({
      id: "gearhead",
      title: "Gearhead",
      description: "Completed 3 missions",
      icon: "gearhead",
      earnedAt: Date.now(),
    });
  }
  if (completed === missions.length && missions.length > 0) {
    badges.push({
      id: "perfect-start",
      title: "Perfect Start",
      description: "Completed all missions!",
      icon: "perfect-start",
      earnedAt: Date.now(),
    });
  }
  if (durationSeconds >= 300) {
    badges.push({
      id: "endurance",
      title: "Endurance",
      description: "Stayed for 5+ minutes",
      icon: "endurance",
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
  const [savedCars, setSavedCars] = useState<SavedCar[]>([]);
  const [designs, setDesigns] = useState<CarDesign[]>([]);
  const [gamesPlayed, setGamesPlayed] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [rawSettings, rawHistory, rawSession, rawSavedCars, rawDesigns, rawLegacyGarage, rawGamesPlayed] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.settings),
          AsyncStorage.getItem(STORAGE_KEYS.history),
          AsyncStorage.getItem(STORAGE_KEYS.session),
          AsyncStorage.getItem(STORAGE_KEYS.savedCars),
          AsyncStorage.getItem(STORAGE_KEYS.designs),
          AsyncStorage.getItem(STORAGE_KEYS.legacyGarage),
          AsyncStorage.getItem(STORAGE_KEYS.gamesPlayed),
        ]);
        if (rawGamesPlayed) setGamesPlayed(parseInt(rawGamesPlayed, 10) || 0);
        if (rawSettings) {
          const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) };
          const allMissionIds = ALL_MISSIONS.filter((m) => m.enabled).map((m) => m.id);
          const merged = Array.from(new Set([...parsed.enabledMissionIds, ...allMissionIds.filter((id) => !parsed.enabledMissionIds.includes(id))]));
          parsed.enabledMissionIds = merged;
          setSettings(parsed);
        }
        if (rawHistory) setSessionHistory(JSON.parse(rawHistory));
        if (rawSession) {
          const session = JSON.parse(rawSession) as { missions: SessionMission[]; active: boolean; startTime: number | null };
          if (session.active) {
            setSessionMissions(session.missions);
            setSessionActive(true);
            setSessionStartTime(session.startTime);
          }
        }

        let initialCars: SavedCar[] = rawSavedCars ? JSON.parse(rawSavedCars) : [];

        if (initialCars.length === 0 && rawLegacyGarage) {
          const legacy = JSON.parse(rawLegacyGarage) as {
            photoUri?: string | null;
            vehicleName?: string;
            stickers?: PlacedSticker[];
            model3dTaskId?: string | null;
            model3dStatus?: Model3dStatus;
            model3dUrl?: string | null;
          };
          if (legacy.photoUri) {
            const migratedCar: SavedCar = {
              id: makeId(),
              name: legacy.vehicleName ?? "My Ride",
              photoUri: legacy.photoUri,
              stickers: legacy.stickers ?? [],
              model3dTaskId: legacy.model3dTaskId ?? null,
              model3dStatus: legacy.model3dStatus ?? "idle",
              model3dUrl: legacy.model3dUrl ?? null,
              createdAt: Date.now(),
            };
            initialCars = [migratedCar];
            await AsyncStorage.setItem(STORAGE_KEYS.savedCars, JSON.stringify(initialCars));
          }
        }

        if (!initialCars.some((c) => c.isDefault)) {
          initialCars = [DEFAULT_CAR, ...initialCars];
          await AsyncStorage.setItem(STORAGE_KEYS.savedCars, JSON.stringify(initialCars));
        }
        setSavedCars(initialCars);
        if (rawDesigns) setDesigns(JSON.parse(rawDesigns));
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const persistCars = useCallback(async (cars: SavedCar[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.savedCars, JSON.stringify(cars));
  }, []);

  const persistDesigns = useCallback(async (list: CarDesign[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.designs, JSON.stringify(list));
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(next));
  }, [settings]);

  const addSavedCar = useCallback(async (photoUri: string, name?: string): Promise<SavedCar> => {
    const car: SavedCar = {
      id: makeId(),
      name: name ?? `Car ${Date.now()}`,
      photoUri,
      stickers: [],
      model3dTaskId: null,
      model3dStatus: "idle",
      model3dUrl: null,
      createdAt: Date.now(),
    };
    let next: SavedCar[] = [];
    setSavedCars((prev) => {
      next = [...prev, car];
      return next;
    });
    await persistCars(next.length ? next : [car]);
    return car;
  }, [persistCars]);

  const updateSavedCar = useCallback(async (id: string, updates: Partial<Omit<SavedCar, "id" | "createdAt">>) => {
    let next: SavedCar[] = [];
    setSavedCars((prev) => {
      next = prev.map((c) => c.id === id ? { ...c, ...updates } : c);
      return next;
    });
    await persistCars(next);
  }, [persistCars]);

  const deleteSavedCar = useCallback(async (id: string) => {
    if (id === DEFAULT_CAR.id) return;
    let next: SavedCar[] = [];
    setSavedCars((prev) => {
      next = prev.filter((c) => c.id !== id);
      return next;
    });
    await persistCars(next);
  }, [persistCars]);

  const addDesign = useCallback(async (data: Omit<CarDesign, "id" | "createdAt">): Promise<CarDesign> => {
    const design: CarDesign = { ...data, id: makeId(), createdAt: Date.now() };
    let next: CarDesign[] = [];
    setDesigns((prev) => {
      next = [...prev, design];
      return next;
    });
    await persistDesigns(next.length ? next : [design]);
    return design;
  }, [persistDesigns]);

  const updateDesign = useCallback(async (id: string, updates: Partial<Omit<CarDesign, "id" | "createdAt">>) => {
    let next: CarDesign[] = [];
    setDesigns((prev) => {
      next = prev.map((d) => d.id === id ? { ...d, ...updates } : d);
      return next;
    });
    await persistDesigns(next);
  }, [persistDesigns]);

  const deleteDesign = useCallback(async (id: string) => {
    let next: CarDesign[] = [];
    setDesigns((prev) => {
      next = prev.filter((d) => d.id !== id);
      return next;
    });
    await persistDesigns(next);
  }, [persistDesigns]);

  const incrementGamesPlayed = useCallback(async () => {
    setGamesPlayed((prev) => {
      const next = prev + 1;
      AsyncStorage.setItem(STORAGE_KEYS.gamesPlayed, String(next));
      return next;
    });
  }, []);

  const isStickerUnlocked = useCallback((sticker: StickerDefinition): boolean => {
    if (!sticker.unlockCondition) return true;
    const historicBadges = sessionHistory.reduce((sum, r) => sum + r.badges.length, 0);
    const totalBadges = historicBadges + currentBadges.length;
    const totalSessions = sessionHistory.length;
    if (sticker.unlockCondition.type === "sessions") return totalSessions >= sticker.unlockCondition.count;
    if (sticker.unlockCondition.type === "badges") return totalBadges >= sticker.unlockCondition.count;
    return false;
  }, [sessionHistory, currentBadges]);

  const startSession = useCallback(async () => {
    const selected = selectSessionMissions(ALL_MISSIONS, settings);
    if (selected.length < 3) return;
    const missions: SessionMission[] = selected.map((m) => ({ ...m, completed: false }));
    const startTime = Date.now();
    setSessionMissions(missions);
    setSessionActive(true);
    setSessionStartTime(startTime);
    setCurrentBadges([]);
    await AsyncStorage.setItem(STORAGE_KEYS.session, JSON.stringify({ missions, active: true, startTime }));
  }, [settings]);

  const startSingleMission = useCallback(async (missionId: string): Promise<boolean> => {
    const enabled = ALL_MISSIONS.filter((m) => settings.enabledMissionIds.includes(m.id) && m.enabled);
    const filtered = settings.difficulty === "all" ? enabled : enabled.filter((m) => m.difficulty === settings.difficulty || m.difficulty === "easy");
    const mission = filtered.find((m) => m.id === missionId);
    if (!mission) return false;
    const missions: SessionMission[] = [{ ...mission, completed: false }];
    const startTime = Date.now();
    setSessionMissions(missions);
    setSessionActive(true);
    setSessionStartTime(startTime);
    setCurrentBadges([]);
    await AsyncStorage.setItem(STORAGE_KEYS.session, JSON.stringify({ missions, active: true, startTime }));
    return true;
  }, [settings]);

  const completeMission = useCallback((missionId: string) => {
    setSessionMissions((prev) => {
      const updated = prev.map((m) => m.id === missionId ? { ...m, completed: true, completedAt: Date.now() } : m);
      AsyncStorage.setItem(STORAGE_KEYS.session, JSON.stringify({ missions: updated, active: true, startTime: sessionStartTime })).catch(() => {});
      return updated;
    });
  }, [sessionStartTime]);

  const resetProgress = useCallback(async () => {
    setSessionHistory([]);
    setCurrentBadges([]);
    setLastSessionResult(null);
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.history),
      AsyncStorage.removeItem(STORAGE_KEYS.session),
    ]);
    setSessionActive(false);
    setSessionStartTime(null);
    setSessionMissions([]);
  }, []);

  const endSession = useCallback(async () => {
    if (!sessionStartTime) return;
    const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
    const badges = generateBadges(sessionMissions, duration);
    const completedCount = sessionMissions.filter((m) => m.completed).length;
    setCurrentBadges(badges);
    const snapshot: LastSessionResult = { missions: sessionMissions, badges, completed: completedCount, total: sessionMissions.length, durationSeconds: duration, childName: settings.childName, driverName: settings.driverName ?? "" };
    setLastSessionResult(snapshot);
    const record: SessionRecord = { id: makeId(), date: Date.now(), missionsCompleted: completedCount, totalMissions: sessionMissions.length, durationSeconds: duration, badges, childName: settings.childName, driverName: settings.driverName ?? "" };
    const newHistory = [record, ...sessionHistory].slice(0, 50);
    setSessionHistory(newHistory);
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.history, JSON.stringify(newHistory)),
      AsyncStorage.removeItem(STORAGE_KEYS.session),
    ]);
    setSessionActive(false);
    setSessionStartTime(null);
    setSessionMissions([]);
  }, [sessionStartTime, sessionMissions, sessionHistory, settings.childName, settings.driverName]);

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        resetProgress,
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
        isStickerUnlocked,
        savedCars,
        addSavedCar,
        updateSavedCar,
        deleteSavedCar,
        designs,
        addDesign,
        updateDesign,
        deleteDesign,
        gamesPlayed,
        incrementGamesPlayed,
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

export { makeStickerUid };
