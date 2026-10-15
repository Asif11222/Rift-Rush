import { LocalStorageState, PlayerSettings, RunRecord, SkinId } from '../types/game';

const STORAGE_KEY = 'RIFT_RUSH_SAVE_V1';

export const SKINS_DATA: Record<
  SkinId,
  {
    id: SkinId;
    name: string;
    tagline: string;
    primaryColor: string;
    secondaryColor: string;
    trailColor: string;
    visorColor: string;
    unlockCondition: string;
  }
> = {
  cyan: {
    id: 'cyan',
    name: 'Cyan Courier',
    tagline: 'Standard issue Chrono-vanguard harness',
    primaryColor: '#00E5FF',
    secondaryColor: '#007A99',
    trailColor: 'rgba(0, 229, 255, 0.4)',
    visorColor: '#FFFFFF',
    unlockCondition: 'Unlocked by default',
  },
  amber: {
    id: 'amber',
    name: 'Amber Runner',
    tagline: 'High-voltage bazaar scavenger suit',
    primaryColor: '#FFB703',
    secondaryColor: '#FB8500',
    trailColor: 'rgba(255, 183, 3, 0.45)',
    visorColor: '#FFF3B0',
    unlockCondition: 'Clear Sector 2 (Circuit Bazaar)',
  },
  violet: {
    id: 'violet',
    name: 'Violet Phantom',
    tagline: 'Phase-shifted vault infiltrator plating',
    primaryColor: '#9B5CFF',
    secondaryColor: '#5A189A',
    trailColor: 'rgba(155, 92, 255, 0.45)',
    visorColor: '#E0AAFF',
    unlockCondition: 'Clear Sector 4 (Prism Vault)',
  },
  white: {
    id: 'white',
    name: 'White Comet',
    tagline: 'Singularity-forged vanguard relic',
    primaryColor: '#FFFFFF',
    secondaryColor: '#94A3B8',
    trailColor: 'rgba(255, 255, 255, 0.55)',
    visorColor: '#38BDF8',
    unlockCondition: 'Complete the entire run (Escape Sector 5)',
  },
};

const DEFAULT_SETTINGS: PlayerSettings = {
  sfxVolume: 0.75,
  musicVolume: 0.5,
  muted: false,
  highContrast: false,
  reducedMotion: false,
};

const DEFAULT_STATE: LocalStorageState = {
  version: 1,
  nickname: 'Guest',
  settings: DEFAULT_SETTINGS,
  selectedSkin: 'cyan',
  unlockedSkins: ['cyan'],
  personalBestScore: 0,
  records: [],
  hasCompletedTutorial: false,
};

class GameStorageManager {
  private state: LocalStorageState;
  public isStorageAvailable: boolean = true;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): LocalStorageState {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        this.isStorageAvailable = false;
        return { ...DEFAULT_STATE };
      }

      // Test access
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);

      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { ...DEFAULT_STATE };
      }

      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const unlockedSkins: SkinId[] = Array.isArray(parsed.unlockedSkins)
          ? parsed.unlockedSkins.filter((s: string) => ['cyan', 'amber', 'violet', 'white'].includes(s))
          : ['cyan'];
        if (!unlockedSkins.includes('cyan')) {
          unlockedSkins.push('cyan');
        }

        const selectedSkin: SkinId =
          unlockedSkins.includes(parsed.selectedSkin) ? parsed.selectedSkin : 'cyan';

        const rawNick = typeof parsed.nickname === 'string' ? parsed.nickname.trim() : 'Guest';
        const nickname = this.sanitizeNickname(rawNick);

        const settings: PlayerSettings = {
          sfxVolume: typeof parsed.settings?.sfxVolume === 'number' ? Math.max(0, Math.min(1, parsed.settings.sfxVolume)) : DEFAULT_SETTINGS.sfxVolume,
          musicVolume: typeof parsed.settings?.musicVolume === 'number' ? Math.max(0, Math.min(1, parsed.settings.musicVolume)) : DEFAULT_SETTINGS.musicVolume,
          muted: Boolean(parsed.settings?.muted),
          highContrast: Boolean(parsed.settings?.highContrast),
          reducedMotion: Boolean(parsed.settings?.reducedMotion),
        };

        const records: RunRecord[] = Array.isArray(parsed.records)
          ? parsed.records.filter((r: unknown) => {
              if (!r || typeof r !== 'object') return false;
              const rec = r as RunRecord;
              return (
                typeof rec.id === 'string' &&
                typeof rec.score === 'number' &&
                typeof rec.furthestSector === 'number' &&
                typeof rec.victory === 'boolean'
              );
            })
          : [];

        return {
          version: 1,
          nickname,
          settings,
          selectedSkin,
          unlockedSkins,
          personalBestScore: typeof parsed.personalBestScore === 'number' ? parsed.personalBestScore : 0,
          records: this.sortRecords(records),
          hasCompletedTutorial: Boolean(parsed.hasCompletedTutorial),
        };
      }
    } catch {
      this.isStorageAvailable = false;
    }
    return { ...DEFAULT_STATE };
  }

  private persistState(): void {
    if (!this.isStorageAvailable) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      this.isStorageAvailable = false;
    }
  }

  public sanitizeNickname(raw: string): string {
    const clean = raw.replace(/[^\w\s-]/gi, '').trim();
    if (!clean) return 'Guest';
    return clean.slice(0, 16);
  }

  public getState(): LocalStorageState {
    return { ...this.state };
  }

  public setNickname(nick: string): void {
    this.state.nickname = this.sanitizeNickname(nick);
    this.persistState();
  }

  public setSettings(settings: Partial<PlayerSettings>): void {
    this.state.settings = { ...this.state.settings, ...settings };
    this.persistState();
  }

  public setSelectedSkin(skin: SkinId): boolean {
    if (this.state.unlockedSkins.includes(skin)) {
      this.state.selectedSkin = skin;
      this.persistState();
      return true;
    }
    return false;
  }

  public unlockSkin(skin: SkinId): boolean {
    if (!this.state.unlockedSkins.includes(skin)) {
      this.state.unlockedSkins.push(skin);
      this.persistState();
      return true;
    }
    return false;
  }

  public setTutorialCompleted(): void {
    this.state.hasCompletedTutorial = true;
    this.persistState();
  }

  private sortRecords(records: RunRecord[]): RunRecord[] {
    return records
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.durationSeconds - b.durationSeconds;
      })
      .slice(0, 10);
  }

  public recordRun(record: Omit<RunRecord, 'id' | 'date'>): RunRecord {
    const fullRecord: RunRecord = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    if (record.score > this.state.personalBestScore) {
      this.state.personalBestScore = record.score;
    }

    const updated = [...this.state.records, fullRecord];
    this.state.records = this.sortRecords(updated);
    this.persistState();
    return fullRecord;
  }

  public resetProgress(): void {
    this.state = {
      ...DEFAULT_STATE,
      settings: { ...this.state.settings }, // keep audio/contrast preferences
    };
    this.persistState();
  }
}

export const gameStorage = new GameStorageManager();
