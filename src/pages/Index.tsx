
import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { Services } from "@/components/landing/Services";
import { Values } from "@/components/landing/Values";
import { Metrics } from "@/components/landing/Metrics";
import { Testimonials } from "@/components/landing/Testimonials";
import { Gallery } from "@/components/landing/Gallery";
import { Contact } from "@/components/landing/Contact";
import { ChatBot } from "@/components/chatbot/ChatBot";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { ChatBotProvider } from "@/contexts/ChatBotContext";
import { SimpleSubscriptionCheck } from "@/components/SimpleSubscriptionCheck";

const Index = () => {
  return (
    <SimpleSubscriptionCheck>
      <ChatBotProvider>
        <div className="min-h-screen bg-white">
          <Header />
          <main className="relative">
            <Hero />
            <About />
            <Services />
            <Values />
            <Metrics />
            <Testimonials />
            <Gallery />
            <Contact />
          </main>
          <Footer />
          <ChatBot />
        </div>
      </ChatBotProvider>
    </SimpleSubscriptionCheck>
  );
};

export default Index;
