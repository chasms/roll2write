import { useCallback, useSyncExternalStore } from "react";
import { repo } from "../storage/localStorageRepo";
import type { Song } from "../domain/types";

type Listener = () => void;
const listeners = new Set<Listener>();
function emit() {
  for (const listener of listeners) listener();
}

// Cache last snapshot to keep referential stability when contents unchanged
let lastSongsSnapshot: Song[] = [];
function getSongsSnapshot(): Song[] {
  const fresh = repo.getSongs();
  if (
    lastSongsSnapshot.length === fresh.length &&
    lastSongsSnapshot.every((item, index) => item === fresh[index])
  ) {
    return lastSongsSnapshot;
  }
  lastSongsSnapshot = fresh;
  return lastSongsSnapshot;
}

export function useSongs() {
  const subscribe = useCallback((listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);
  const songs = useSyncExternalStore(
    subscribe,
    getSongsSnapshot,
    getSongsSnapshot,
  );
  const addSong = useCallback((song: Song) => {
    repo.addSong(song);
    emit();
  }, []);
  return { songs, addSong };
}
