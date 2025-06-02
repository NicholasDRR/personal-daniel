
import { useToast } from "@/hooks/use-toast";
import { useRef, useCallback } from "react";

interface SmartToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
  sessionKey?: string; // Para evitar repetição na mesma sessão
}

export const useSmartToast = () => {
  const { toast } = useToast();
  const shownToasts = useRef(new Set<string>());

  const showToast = useCallback((options: SmartToastOptions) => {
    const { sessionKey, ...toastOptions } = options;
    
    // Se tem sessionKey, verificar se já foi mostrado nesta sessão
    if (sessionKey) {
      const sessionStorageKey = `toast_shown_${sessionKey}`;
      const alreadyShown = sessionStorage.getItem(sessionStorageKey);
      
      if (alreadyShown) {
        return; // Não mostrar novamente
      }
      
      // Marcar como mostrado
      sessionStorage.setItem(sessionStorageKey, 'true');
    }

    // Mostrar toast
    toast({
      ...toastOptions,
      duration: options.duration || 4000,
    });
  }, [toast]);

  const showWelcomeBack = useCallback(() => {
    // Toast discreto para "bem-vindo de volta"
    toast({
      title: "Bem-vindo de volta",
      duration: 2000,
      variant: "default",
    });
  }, [toast]);

  const clearSessionToasts = useCallback(() => {
    // Limpar toasts da sessão (útil para logout)
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('toast_shown_')) {
        sessionStorage.removeItem(key);
      }
    });
  }, []);

  return {
    showToast,
    showWelcomeBack,
    clearSessionToasts,
  };
};
