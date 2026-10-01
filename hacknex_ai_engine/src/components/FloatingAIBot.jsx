import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquare, X, Send, Bot, User, Sparkles, Compass,
  ExternalLink, ChevronRight, RefreshCw, Globe, HelpCircle,
  ShieldCheck, AlertCircle, ArrowUpRight
} from 'lucide-react';

const QUICK_PROMPTS = [
  { label: '🌾 Compensation Rules', query: 'How is land compensation calculated under RFCTLARR Act 2013?' },
  { label: '📐 Check Boundary Overlap', query: 'How can I verify if my parcel overlaps with forest or corridor land?' },
  { label: '⚖️ Section 15 Objection', query: 'What is the procedure and timeline to file objections under Section 15?' },
  { label: '🚜 Take me to Farmer Portal', query: 'Where can I check survey status and submit a vernacular grievance?' },
];

export default function FloatingAIBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '**Namaste! I am the NLAMS AI Sahayak & Web Navigator.**\n\n' +
        'I can guide you through the entire portal and solve your land acquisition, compensation, and boundary inquiries.\n\n' +
        'How can I help you today?',
      navigation_action: '/farmer-dashboard',
      suggested_links: [
        { title: 'Open Farmer & Landowner Portal', url: '/farmer-dashboard', is_external: false },
        { title: 'Open District LAO Dashboard', url: '/district-dashboard', is_external: false }
      ],
      suggested_questions: [
        'How is compensation calculated under RFCTLARR 2013?',
        'How do I verify parcel boundaries on GIS map?',
        'Where can I submit a new acquisition proposal?'
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      // Connect to FastAPI AI Engine endpoint
      const response = await fetch('http://localhost:8000/api/v1/navigator-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessage.content,
          current_path: location.pathname,
          user_role: 'citizen',
          language: 'auto',
          history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const botMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        navigation_action: data.navigation_action,
        suggested_links: data.suggested_links || [],
        suggested_questions: data.suggested_questions || [],
        problem_category: data.problem_category,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      // Resilient Client-side fallback if backend service is not running
      const fallbackReply = generateClientFallback(query);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackReply.content,
        navigation_action: fallbackReply.navigation_action,
        suggested_links: fallbackReply.suggested_links,
        suggested_questions: fallbackReply.suggested_questions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const generateClientFallback = (q) => {
    const lower = q.toLowerCase();
    if (lower.includes('compensation') || lower.includes('paisa') || lower.includes('rate') || lower.includes('formula')) {
      return {
        content: 'Under RFCTLARR Act 2013 First Schedule:\n• **Market Value** = Circle rate or average sale deed value.\n• **Multiplier:** 1.0x (Urban) to 2.0x (Rural).\n• **Solatium:** Mandatory 100% addition.\n• **Interest:** 12% p.a. from Section 11 to award.',
        navigation_action: '/farmer-dashboard',
        suggested_links: [{ title: 'Farmer Dashboard', url: '/farmer-dashboard', is_external: false }],
        suggested_questions: ['What is Solatium?', 'Where to check survey number?']
      };
    }
    if (lower.includes('boundary') || lower.includes('overlap') || lower.includes('forest') || lower.includes('map')) {
      return {
        content: 'Boundary conflicts and environmental buffer overlaps can be verified using the **District LAO Geometry Verifier** or on the **Interactive GIS Map**.',
        navigation_action: '/district-dashboard',
        suggested_links: [
          { title: 'District LAO Dashboard', url: '/district-dashboard', is_external: false },
          { title: 'GIS Map', url: '/map', is_external: false }
        ],
        suggested_questions: ['How to check buffer zones?', 'What is STRtree spatial index?']
      };
    }
    return {
      content: 'I have processed your query. You can explore relevant records on our **Farmer Portal** or **District Dashboard** for live status.',
      navigation_action: '/farmer-dashboard',
      suggested_links: [{ title: 'Farmer Portal', url: '/farmer-dashboard', is_external: false }],
      suggested_questions: ['Check my survey number status', 'How to contact Special LAO?']
    };
  };

  const handleNavigate = (path) => {
    if (path.startsWith('http')) {
      window.open(path, '_blank');
    } else {
      navigate(path);
      // Keep chat accessible or minimized on mobile
      if (window.innerWidth < 640) {
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      {/* ── FLOATING TRIGGER BUTTON ── */}
      <div className="fixed bottom-6 right-6 z-[90] flex items-center gap-3">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={() => setIsOpen(true)}
              className="hidden md:flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-xl border border-orange-200 cursor-pointer hover:border-orange-400 transition-colors group"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#138808] animate-pulse" />
              <span className="text-xs font-bold text-[#1a1a2e] group-hover:text-[#FF9933]">
                AI Sahayak & Web Navigator
              </span>
              <Compass size={14} className="text-[#FF9933] group-hover:rotate-45 transition-transform" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white focus:outline-none"
          style={{
            background: 'linear-gradient(135deg, #FF9933 0%, #138808 100%)',
            boxShadow: '0 8px 24px rgba(255, 153, 51, 0.4)'
          }}
          aria-label="Toggle AI Sahayak"
        >
          {isOpen ? (
            <X size={24} className="text-white" />
          ) : (
            <>
              <Bot size={26} className="text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </>
          )}
        </motion.button>
      </div>

      {/* ── EXPANDABLE CHAT MODAL ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-24 right-4 sm:right-6 z-[95] w-[94vw] sm:w-[420px] max-h-[82vh] h-[650px] bg-white rounded-3xl shadow-2xl border border-orange-100 flex flex-col overflow-hidden"
            style={{ boxShadow: '0 20px 50px rgba(0, 51, 160, 0.18)' }}
          >
            {/* Top Tiranga Strip */}
            <div className="h-1.5 w-full tiranga-bar" />

            {/* Chat Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#1a1a2e] to-[#0d1f0a] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF9933]/20 border border-[#FF9933]/40 flex items-center justify-center">
                  <Bot size={20} className="text-[#FF9933]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm tracking-wide">NLAMS AI Sahayak</h3>
                    <span className="text-[10px] bg-[#138808]/80 text-white font-semibold px-2 py-0.5 rounded-full">
                      Online
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300">Web Navigator & Problem Solver</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMessages(messages.slice(0, 1))}
                  title="Reset conversation"
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <RefreshCw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Quick Context Bar */}
            <div className="px-4 py-2 bg-orange-50/70 border-b border-orange-100 flex items-center justify-between text-[11px] text-gray-600">
              <span className="flex items-center gap-1 truncate max-w-[240px]">
                <Compass size={13} className="text-[#FF9933] shrink-0" />
                Current Page: <strong className="text-[#1a1a2e]">{location.pathname}</strong>
              </span>
              <span className="text-[#138808] font-bold">RFCTLARR 2013</span>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm bg-gradient-to-b from-white to-[#FFF8F0]/30">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-start gap-2 max-w-[90%]">
                    {m.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-[#FF9933]/15 border border-[#FF9933]/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot size={14} className="text-[#FF9933]" />
                      </div>
                    )}

                    <div
                      className={`rounded-2xl p-3.5 shadow-sm text-xs leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-[#003580] text-white rounded-tr-none'
                          : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                      }`}
                    >
                      <div className="whitespace-pre-line font-medium">
                        {m.content}
                      </div>

                      {/* In-App Direct Navigation Action Button */}
                      {m.navigation_action && m.role === 'assistant' && (
                        <div className="mt-3 pt-2.5 border-t border-gray-100">
                          <button
                            onClick={() => handleNavigate(m.navigation_action)}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white transition-transform active:scale-95 shadow-sm"
                            style={{ background: 'linear-gradient(135deg, #FF9933, #E07800)' }}
                          >
                            <span className="flex items-center gap-1.5">
                              <Compass size={14} />
                              Open {m.navigation_action.replace('/', '').toUpperCase() || 'PAGE'}
                            </span>
                            <ArrowUpRight size={14} />
                          </button>
                        </div>
                      )}

                      {/* Suggested Links */}
                      {m.suggested_links && m.suggested_links.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-gray-100 space-y-1">
                          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                            Direct Navigation & Links
                          </span>
                          {m.suggested_links.map((link, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleNavigate(link.url)}
                              className="w-full text-left flex items-center justify-between text-[11px] text-[#003580] hover:text-[#FF9933] font-medium py-1 px-1.5 rounded hover:bg-orange-50 transition-colors"
                            >
                              <span className="truncate">{link.title}</span>
                              {link.is_external ? <ExternalLink size={12} /> : <ChevronRight size={12} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contextual Suggested Questions Chips */}
                  {m.suggested_questions && m.suggested_questions.length > 0 && (
                    <div className="mt-2 pl-9 flex flex-wrap gap-1.5">
                      {m.suggested_questions.map((sq, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(sq)}
                          className="text-[10px] bg-white border border-orange-200 text-gray-700 hover:border-orange-400 hover:text-[#FF9933] px-2.5 py-1 rounded-full transition-colors font-medium text-left"
                        >
                          {sq}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] text-gray-400 mt-1 px-1">
                    {m.timestamp}
                  </span>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-gray-400 text-xs pl-2">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center animate-spin">
                    <Sparkles size={12} className="text-[#FF9933]" />
                  </div>
                  <span>AI Sahayak is analyzing your query...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 overflow-x-auto flex gap-1.5 scrollbar-none">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.query)}
                  className="whitespace-nowrap text-[10px] font-semibold bg-white border border-gray-200 text-gray-700 hover:text-[#003580] hover:border-[#003580] px-2.5 py-1 rounded-lg transition-all"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask in Hindi, English, or Hinglish..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#FF9933] transition-colors"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || loading}
                className="w-9 h-9 rounded-xl bg-[#003580] hover:bg-[#002560] text-white flex items-center justify-center disabled:opacity-40 transition-colors shadow-sm"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
