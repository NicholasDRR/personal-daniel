
import { useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseAutoSaveOptions<T> {
  data: T;
  key: string;
  onRestore?: (data: T) => void;
  debounceMs?: number;
  enabled?: boolean;
}

export const useAutoSave = <T extends Record<string, any>>({
  data,
  key,
  onRestore,
  debounceMs = 2000,
  enabled = true,
}: UseAutoSaveOptions<T>) => {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const hasRestoredRef = useRef(false);

  // Salvar dados no localStorage (debounced)
  const saveData = useCallback(() => {
    if (!enabled) return;

    const dataToSave = {
      data,
      timestamp: Date.now(),
    };
    
    localStorage.setItem(`autosave_${key}`, JSON.stringify(dataToSave));
  }, [data, key, enabled]);

  // Auto-save com debounce
  useEffect(() => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(saveData, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveData, debounceMs, enabled]);

  // Restaurar dados salvos
  const restoreData = useCallback(() => {
    if (!enabled || hasRestoredRef.current) return null;

    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      if (!saved) return null;

      const { data: savedData, timestamp } = JSON.parse(saved);
      
      // Verificar se os dados não são muito antigos (24 horas)
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - timestamp > maxAge) {
        clearSavedData();
        return null;
      }

      hasRestoredRef.current = true;
      
      if (onRestore) {
        onRestore(savedData);
      }

      // Mostrar notificação discreta
      toast({
        title: "Rascunho recuperado",
        description: "Seus dados foram restaurados automaticamente",
        duration: 3000,
      });

      return savedData;
    } catch (error) {
      console.error('Erro ao restaurar dados:', error);
      return null;
    }
  }, [key, onRestore, toast, enabled]);

  // Limpar dados salvos
  const clearSavedData = useCallback(() => {
    localStorage.removeItem(`autosave_${key}`);
    hasRestoredRef.current = false;
  }, [key]);

  // Verificar se há dados salvos
  const hasSavedData = useCallback(() => {
    if (!enabled) return false;
    const saved = localStorage.getItem(`autosave_${key}`);
    return !!saved;
  }, [key, enabled]);

  // Descartar rascunho
  const discardDraft = useCallback(() => {
    clearSavedData();
    toast({
      title: "Rascunho descartado",
      description: "Os dados salvos foram removidos",
      duration: 2000,
    });
  }, [clearSavedData, toast]);

  return {
    restoreData,
    clearSavedData,
    hasSavedData,
    discardDraft,
  };
};
