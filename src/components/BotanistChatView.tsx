import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquareQuote, 
  Send, 
  Sparkles, 
  Sprout, 
  Trash2, 
  Loader2, 
  HelpCircle,
  Leaf
} from "lucide-react";
import { ChatMessage } from "../types";

const SUGGESTION_CHIPS = [
  "Como combater pulgões e cochonilhas sem veneno?",
  "Qual a melhor fase lunar para podar meu limoeiro?",
  "Quais plantas companheiras afastam pragas na horta?",
  "Como fazer biofertilizante de casca de banana e cinzas?",
  "Quais são os melhores chás para digestão e gases?",
  "Como fazer mudas por estaquia de alecrim e ora-pro-nóbis?",
];

export const BotanistChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-msg",
      sender: "bot",
      text: "Saudações, guardião da terra! Sou o **Mestre do Almanaque Botânico**. Trago a união entre a sabedoria ancestral dos almanaques perpétuos, a botânica rigorosa e a fitoterapia tradicional.\n\nQual segredo do reino vegetal, dúvida de cultivo ou receita de farmácia viva você gostaria de desvendar hoje?",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/botanical-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro na resposta do Mestre Botânico.");
      }

      const data = await response.json();
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.reply || "A natureza fala em silêncio, mas sempre acolhe.",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: "bot",
        text: "Desculpe, o vento da conexão oscilou. Verifique as configurações de chave e tente me perguntar novamente.",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: "bot",
        text: "Caderno de consultas renovado! O que deseja saber sobre as plantas?",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Hero Chat Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#233825] via-[#2f4931] to-[#1c2c1c] text-[#f7f3e8] p-6 sm:p-8 border border-[#3e5e3f] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18291a] text-[#bce3b2] text-xs font-semibold uppercase tracking-wider border border-[#375939]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Oráculo & Sábio Botânico com Gemini 3.7 Flash</span>
          </div>
          <h1 className="font-serif-botanic text-3xl font-bold text-[#f4efe4]">
            Pergunte ao Mestre Botânico
          </h1>
          <p className="text-xs sm:text-sm text-[#d8cfbe] font-narrative">
            Tire dúvidas de poda, compostagem, plantio lunar, dosagens de chás medicinais e pragas do jardim.
          </p>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2.5 rounded-xl bg-[#1d301f] hover:bg-[#2e4730] text-[#d6ccb8] border border-[#3b543c] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          title="Limpar Conversa"
        >
          <Trash2 className="w-4 h-4" />
          <span>Limpar</span>
        </button>
      </div>

      {/* Suggestion Chips */}
      <div className="space-y-2">
        <span className="text-[11px] font-cinzel font-bold uppercase tracking-wider text-[#695d47] block">
          Perguntas Frequentes do Almanaque:
        </span>
        <div className="flex flex-wrap gap-2">
          {SUGGESTION_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="px-3 py-1.5 rounded-xl bg-[#f0ebd9] hover:bg-[#e4ddcb] border border-[#ded5c2] text-xs text-[#4b402f] font-medium transition-all hover:scale-102 cursor-pointer text-left"
            >
              🌿 {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-[#f5efe3] rounded-3xl border border-[#ded5c2] p-4 sm:p-6 shadow-xs flex flex-col h-[520px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#284229] flex items-center justify-center text-[#9fd590] shrink-0 mt-1 shadow-xs">
                    <Sprout className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-1.5 shadow-xs ${
                    isUser
                      ? "bg-[#284229] text-[#f7f5ee] rounded-tr-xs"
                      : "bg-[#faf7f2] text-[#2c3328] border border-[#ded5c2] rounded-tl-xs"
                  }`}
                >
                  <div className="text-xs sm:text-sm leading-relaxed font-narrative whitespace-pre-wrap">
                    {msg.text}
                  </div>
                  <div
                    className={`text-[10px] text-right font-mono ${
                      isUser ? "text-[#a0cfa0]" : "text-[#877a64]"
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#284229] flex items-center justify-center text-[#9fd590] shrink-0 animate-pulse">
                <Leaf className="w-4 h-4" />
              </div>
              <div className="bg-[#faf7f2] border border-[#ded5c2] rounded-2xl p-3.5 text-xs text-[#594d3a] flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#3b6637]" />
                <span className="font-serif-botanic italic">
                  O Mestre Botânico está consultando os compêndios ancestrais...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-[#ded5c2]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Digite sua dúvida sobre plantas, remédios caseiros ou horta..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-[#faf7f2] border border-[#d6ccb8] text-sm text-[#2c3328] placeholder-[#968b75] focus:outline-hidden focus:ring-2 focus:ring-[#406343]"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-5 py-3 rounded-xl bg-[#284229] hover:bg-[#1a2f1b] disabled:opacity-50 text-[#f7f5ee] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
