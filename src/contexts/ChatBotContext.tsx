import { createContext, useState, ReactNode } from 'react';

interface ChatBotContextType {
  isOpen: boolean;
  selectedPlan: any | null;
  openChatWithPlan: (plan: any) => void;
  closeChatBot: () => void;
}

export const ChatBotContext = createContext<ChatBotContextType>({
  isOpen: false,
  selectedPlan: null,
  openChatWithPlan: () => {},
  closeChatBot: () => {},
});

interface ChatBotProviderProps {
  children: ReactNode;
}

export const ChatBotProvider = ({ children }: ChatBotProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

  const openChatWithPlan = (plan: any) => {
    setSelectedPlan(plan);
    setIsOpen(true);
  };

  const closeChatBot = () => {
    setIsOpen(false);
    setSelectedPlan(null);
  };

  return (
    <ChatBotContext.Provider
      value={{
        isOpen,
        selectedPlan,
        openChatWithPlan,
        closeChatBot,
      }}
    >
      {children}
    </ChatBotContext.Provider>
  );
}; 