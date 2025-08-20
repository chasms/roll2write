import { useCallback, useSyncExternalStore } from "react";
import type { DieDefinition } from "../domain/types";
import { repo } from "../storage/localStorageRepo";

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l();
}

// Cache last snapshot to keep referential stability when contents unchanged.
let lastSnapshot: DieDefinition[] = [];
function getSnapshot(): DieDefinition[] {
  const fresh = repo.getDice(); // returns new array copy currently
  if (lastSnapshot.length === fresh.length && lastSnapshot.every((item, idx) => item === fresh[idx])) {
    return lastSnapshot; // reuse previous reference
  }
  lastSnapshot = fresh;
  return lastSnapshot;
}

export function useDice() {
  const subscribe = useCallback((listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);
  const dice = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const addDie = useCallback((die: DieDefinition) => {
    repo.addDie(die);
    emit();
  }, []);
  const updateDie = useCallback((id: string, updater: (prev: DieDefinition) => DieDefinition) => {
    repo.updateDie(id, updater);
    emit();
  }, []);
  return { dice, addDie, updateDie };
}
