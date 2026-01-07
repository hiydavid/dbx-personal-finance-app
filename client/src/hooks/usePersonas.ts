import { usePersonasContext } from "@/contexts/PersonasContext";

/**
 * Custom hook to access persona metadata from the PersonasContext.
 * The actual fetch happens once in the PersonasProvider.
 */
export function usePersonas() {
  return usePersonasContext();
}
