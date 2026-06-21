/**
 * useBoard — the board state hook. Loads from / persists to the BoardStore port (D2),
 * runs the pure automation + move + intake engines, and exposes board operations.
 *
 * The brand/project leaks NOTHING into here: it takes a BoardConfig + a BoardStore and
 * is otherwise generic. Persistence is debounced through the injected port — there is no
 * endpoint, no brand, no fetch in this file.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { evaluateBoard } from "./automations";
import { createLead, type IntakeResult, type LeadInput } from "./intake";
import { moveCard, type MoveResult } from "./move";
import type { BoardCard, BoardConfig, BoardState, CardFlags } from "./types";
import type { BoardStore } from "./board-store";

export interface UseBoardOptions {
  config: BoardConfig;
  store: BoardStore;
  /** Initial cards used only when the store has nothing persisted yet. */
  seed?: BoardCard[];
  /** Debounce window for persistence (ms). */
  saveDebounceMs?: number;
  /** Injectable clock for deterministic tests. */
  now?: () => number;
}

export interface UseBoard {
  hydrated: boolean;
  cards: BoardCard[];
  flags: Map<string, CardFlags>;
  atRiskCount: number;
  /** Add a quick card (title only) to a stage. */
  quickAdd: (stageId: string, title: string) => void;
  /** Intake a lead; returns the result so the UI can surface a dedupe toast. */
  intake: (input: LeadInput) => IntakeResult;
  /** Move a card; returns the result so the UI can toast a blocked move. */
  move: (cardId: string, toStageId: string, opts?: { lostReason?: string }) => MoveResult;
  /** Patch arbitrary card fields (e.g. set nextStep, flip a `requires` field). */
  patch: (cardId: string, changes: Partial<BoardCard>) => void;
  remove: (cardId: string) => void;
}

export function useBoard({
  config,
  store,
  seed = [],
  saveDebounceMs = 400,
  now = Date.now,
}: UseBoardOptions): UseBoard {
  const [cards, setCards] = useState<BoardCard[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load once from the port; seed only if nothing persisted.
  useEffect(() => {
    let alive = true;
    store.load(config.id).then((state) => {
      if (!alive) {
        return;
      }
      setCards(state?.cards ?? seed);
      setHydrated(true);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.id]);

  // Debounced persistence through the port.
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    saveTimer.current = setTimeout(() => {
      const state: BoardState = { configId: config.id, cards };
      void store.save(state);
    }, saveDebounceMs);
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [cards, hydrated, config.id, store, saveDebounceMs]);

  const flags = useMemo(() => evaluateBoard(cards, config, now()), [cards, config, now]);
  const atRiskCount = useMemo(() => [...flags.values()].filter((f) => f.atRisk).length, [flags]);

  const quickAdd = useCallback(
    (stageId: string, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) {
        return;
      }
      const iso = new Date(now()).toISOString();
      const card: BoardCard = {
        id: `c_${now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        stage: stageId,
        title: trimmed,
        status: "active",
        nextStep: "",
        createdAt: iso,
        updatedAt: iso,
      };
      setCards((prev) => [card, ...prev]);
    },
    [now],
  );

  const intake = useCallback(
    (input: LeadInput): IntakeResult => {
      const result = createLead(input, cards, config, now());
      if (result.ok) {
        setCards((prev) => [result.card, ...prev]);
      }
      return result;
    },
    [cards, config, now],
  );

  const move = useCallback(
    (cardId: string, toStageId: string, opts?: { lostReason?: string }): MoveResult => {
      const card = cards.find((c) => c.id === cardId);
      if (!card) {
        return { ok: false, reason: "requires", message: "Card not found." };
      }
      const result = moveCard(card, toStageId, config, { ...opts, now: now() });
      if (result.ok) {
        setCards((prev) => prev.map((c) => (c.id === cardId ? result.card : c)));
      }
      return result;
    },
    [cards, config, now],
  );

  const patch = useCallback(
    (cardId: string, changes: Partial<BoardCard>) => {
      setCards((prev) =>
        prev.map((c) =>
          c.id === cardId ? { ...c, ...changes, updatedAt: new Date(now()).toISOString() } : c,
        ),
      );
    },
    [now],
  );

  const remove = useCallback((cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  }, []);

  return { hydrated, cards, flags, atRiskCount, quickAdd, intake, move, patch, remove };
}
