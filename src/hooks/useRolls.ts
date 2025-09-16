import { useCallback, useSyncExternalStore } from "react";
import type { RollResult } from "../domain/types";
import { repo } from "../storage/localStorageRepo";

type Listener = () => void;
const listeners = new Set<Listener>();
function emit() {
  for (const listener of listeners) listener();
}

// Cache last snapshot to keep referential stability when contents unchanged
let lastRollsSnapshot: RollResult[] = [];
function getRollsSnapshot(): RollResult[] {
  const fresh = repo.getRolls();
  if (
    lastRollsSnapshot.length === fresh.length &&
    lastRollsSnapshot.every((item, index) => item === fresh[index])
  ) {
    return lastRollsSnapshot;
  }
  lastRollsSnapshot = fresh;
  return lastRollsSnapshot;
}

export function useRolls() {
  const subscribe = useCallback((listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);
  const rolls = useSyncExternalStore(
    subscribe,
    getRollsSnapshot,
    getRollsSnapshot
  );
  const addRoll = useCallback((roll: RollResult) => {
    repo.addRoll(roll);
    emit();
  }, []);
  return { rolls, addRoll };
}
