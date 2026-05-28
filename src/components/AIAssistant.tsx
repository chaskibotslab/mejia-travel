'use client';
import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2, MessageCircle } from 'lucide-react';

type Msg = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = [
  '¿Dónde comer hornado en Machachi?',
  '¿Qué hacer este fin de semana?',
  '¿Cómo llegar al Cotopaxi?',
  '¿Cuáles son las aguas termales?',
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        '¡Hola! Soy Meji 🏔, tu guía del Cantón Mejía. Puedo ayudarte a descubrir lugares, eventos, gastronomía o cómo moverte. ¿Qué te gustaría saber?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function send(text?: string) {
    const message = (text ?? input).trim();
    if (!message || loading) return;

    const newMessages: Msg[] = [...messages, { role: 'user', content: message }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: '😔 No pude conectar con mi cerebro. Intenta de nuevo en unos segundos.' },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: '😔 Tuve un problema de conexión. Intenta de nuevo.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 via-brand-600 to-accent-500 text-white shadow-card flex items-center justify-center hover:scale-110 active:scale-95 transition-transform ${
          open ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-label="Abrir asistente IA"
      >
        <Sparkles className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-400 rounded-full animate-pulse" />
      </button>

      {/* Panel del chat */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl h-[85vh] sm:h-[600px] flex flex-col shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3 bg-gradient-to-r from-brand-600 to-accent-500 text-white sm:rounded-t-3xl rounded-t-3xl">
              <div className="w-10 h-10 rounded-full bg-white/20 grid place-items-center backdrop-blur">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Meji · Asistente IA</p>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                  En línea
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="p-2 rounded-full hover:bg-white/20 active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensajes */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-brand-600 text-white rounded-br-md'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-soft'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-soft">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                  </div>
                </div>
              )}

              {/* Sugerencias iniciales */}
              {messages.length === 1 && !loading && (
                <div className="pt-2 space-y-2">
                  <p className="text-xs text-slate-400 font-medium">Pregúntame algo:</p>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="block w-full text-left text-sm px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition text-slate-700"
                    >
                      <MessageCircle className="inline w-3.5 h-3.5 mr-1.5 text-brand-500" />
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="border-t border-slate-200 p-3 flex items-center gap-2 bg-white sm:rounded-b-3xl"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta..."
                disabled={loading}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-brand-400 text-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-brand-600 text-white grid place-items-center disabled:opacity-40 hover:bg-brand-700 active:scale-90 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </>
  );
}
