import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Persona } from "@/lib/types";

interface PersonasContextType {
  personas: Persona[];
  loading: boolean;
  error: Error | null;
  getPersonaById: (id: string) => Persona | undefined;
  refetch: () => void;
}

const PersonasContext = createContext<PersonasContextType | undefined>(undefined);

export function usePersonasContext() {
  const context = useContext(PersonasContext);
  if (!context) {
    throw new Error("usePersonasContext must be used within a PersonasProvider");
  }
  return context;
}

interface PersonasProviderProps {
  children: ReactNode;
}

export function PersonasProvider({ children }: PersonasProviderProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPersonas = () => {
    setLoading(true);
    setError(null);

    fetch("/api/config/personas")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load personas: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setPersonas(data.personas || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load personas:", err);
        setError(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPersonas();
  }, []);

  const getPersonaById = (id: string) => {
    return personas.find((persona) => persona.id === id);
  };

  return (
    <PersonasContext.Provider
      value={{
        personas,
        loading,
        error,
        getPersonaById,
        refetch: fetchPersonas,
      }}
    >
      {children}
    </PersonasContext.Provider>
  );
}
