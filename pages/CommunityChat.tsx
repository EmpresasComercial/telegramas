import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../components/Toast";
import { cn } from "../lib/utils";
import { 
  ChevronLeft, 
  Paperclip, 
  Send, 
  X, 
  CheckCheck,
  MoreVertical,
  ArrowDown,
  Download,
  Smile,
  Mic,
  ArrowLeft,
  Pencil,
  MessageCircle,
  Bell,
  LogOut,
  QrCode,
  UserPlus,
  Check,
  Reply,
  Copy,
  Trash2,
  ChevronRight
} from 'lucide-react';

const FORBIDDEN_WORDS = Array.from(new Set([
  "burla", "burlas", "fraude", "fraudes", "scam", "scams", "golpe", "golpes", 
  "ladrão", "ladrao", "ladrões", "ladroes", "roubo", "roubos", "bosta", "bostas", 
  "merda", "merdas", "caralho", "caralhos", "foda", "fodas", "fodase", "foda-se", 
  "porra", "porras", "puta", "putas", "puta que pariu", "filho da puta", "fdp", 
  "cabrao", "cabrão", "cabroes", "cabrões", "corno", "cornos", "vagabundo", "vagabundos", 
  "desgraçado", "desgracado", "desgraçados", "animal", "animais", "idiota", "idiotas", 
  "imbecil", "imbecis", "otario", "otário", "otarios", "otários", "retardado", "retardados", 
  "estupido", "estúpido", "estupidos", "estúpidos", "palhaço", "palhaco", "palhaços", "palhacos", 
  "lixo", "lixos", "nojento", "nojentos", "maldito", "malditos", "cão", "cao", "macaco", "macacos", 
  "burro", "burros", "cala boca", "vai se ferrar", "vai te ferrar", "vai morrer", 
  "sexo", "nude", "nudes", "porn", "porno", "pornografia", "pênis", "penis", 
  "piroca", "pirocas", "cona", "conas", "vagina", "buceta", "bucetas", "cu", "cus", 
  "rabeta", "mamar", "chupar", "mata", "morrer", "suicida", "suicidio", "terrorista", "nazista", "racista", 
  "vou denunciar", "vou processar", "processo", "crime", "polícia", "policia", 
  "tribunal", "interpol", "cadeia", "prisão", "prisao", "fbi", "investigação", "investigacao", 
  "viado", "viados", "gayzinho", "bicha", "bichas", "boiola", "sapatão", "sapatao", 
  "golpista", "golpistas", "burlador", "burladores", "fraudador", "fraudadores", 
  "scammer", "scammers", "pirâmide", "piramide", "esquema ponzi", "ponzi", 
  "roubaram", "roubaste", "roubado", "roubando", "empresa falsa", "site falso", 
  "aplicativo falso", "app falso", "fake", "farsa", "enganador", "enganadora", 
  "trapaceiro", "vigarista", "171", "mafioso", "máfia", "mafia", 
  "admin ladrão", "admin ladrao", "suporte lixo", "suporte inútil", "suporte inutil", 
  "admin inútil", "admin inutil", "adm corrupto", "admin corrupto", "moderador corrupto", 
  "staff lixo", "staff incompetente", "empresa corrupta", "empresa de ladrões", "empresa de ladroes", 
  "dono ladrão", "dono ladrao", "vocês roubam", "voces roubam", "estão roubando", "estao roubando", 
  "vocês são burlões", "voces sao burloes", 
  "não paga", "nao paga", "não pagam", "nao pagam", "perdi dinheiro", "perdi tudo", 
  "não recebi", "nao recebi", "sumiram com dinheiro", "bloquearam saque", "não consigo sacar", 
  "nao consigo sacar", "site caiu", "empresa faliu", "empresa vai fechar", "vai fechar", 
  "quebrou", "falida", "falido", "sistema roubando", "dinheiro preso", "não vale nada", "nao vale nada", 
  "ganha dinheiro rapido", "dinheiro facil", "hack", "hacker", "clonar", 
  "cartão roubado", "cartao roubado", "bitcoin gratis", "investimento falso", 
  "entra no meu link", "usa meu link", "me chama no privado", "grupo fake", "grupo falso", 
  "tenho hack", "hack saque", "hack sistema", "bug de saque", "método secreto", "metodo secreto", 
  "ganhar sem investir", "dinheiro fácil", "lucro garantido", "100% garantido", 
  "não confiem", "nao confiem", "não invistam", "nao invistam", "isso é golpe", "isso e golpe", 
  "empresa scam", "site scam", "app scam", "plataforma scam", "plataforma falsa", "empresa fake", 
  "saque falso", "pagamento falso"
]));

const ESCAPED_FORBIDDEN = FORBIDDEN_WORDS.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const FORBIDDEN_REGEX = new RegExp(`(?:^|[^\\p{L}\\p{N}])(?:${ESCAPED_FORBIDDEN.join('|')})(?:[^\\p{L}\\p{N}]|$)`, 'iu');

const CONTEXT_GROUPS: Record<string, { path: string, keywords: string[] }> = {
  TelegramBusiness: { path: "/telegramBussiness", keywords: ["telegram business", "negócios", "conversas", "chats", "painel", "início", "inicio"] },
  Withdraw: { path: "/retirada", keywords: ["saque", "sacar", "retirada", "retirar", "levantamento", "levantar dinheiro", "withdraw", "withdrawal", "retrait", "retirer"] },
  Recharge: { path: "/recarregar", keywords: ["recarga", "recarregar", "depósito", "depositar", "recharge"] },
  Invite: { path: "/convite", keywords: ["convite", "convidar", "amigo", "afiliado", "indicar"] },
  Support: { path: "/telegramBussiness", keywords: ["suporte", "ajuda", "atendimento", "help"] },
  Operations: { path: "/operacoes", keywords: ["operações", "operacoes", "trabalho", "tarefa", "tarefas"] },
  ProductDetails: { path: "/bot-pay", keywords: ["produto", "investimento", "plano", "lucro"] }
};

const KEYWORD_TO_PATH: Record<string, string> = {};
Object.values(CONTEXT_GROUPS).forEach(group => {
  group.keywords.forEach(kw => {
    KEYWORD_TO_PATH[kw.toLowerCase()] = group.path;
  });
});

const ALL_KEYWORDS_SORTED = Object.keys(KEYWORD_TO_PATH).sort((a, b) => b.length - a.length);
const SMART_CONTEXT_REGEX = new RegExp(`(${ALL_KEYWORDS_SORTED.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');

const translationCache = new Map<string, string>();
const translationQueue: (() => Promise<void>)[] = [];
let isTranslating = false;

const processTranslationQueue = async () => {
  if (isTranslating) return;
  isTranslating = true;
  while (translationQueue.length > 0) {
    const task = translationQueue.shift();
    if (task) {
      await task();
      await new Promise(r => setTimeout(r, 100));
    }
  }
  isTranslating = false;
};

const translateTextAPI = (text: string, lang: string): Promise<string> => {
  return new Promise((resolve) => {
    if (!text || text.trim() === '') return resolve(text);
    const cacheKey = `${lang}:${text}`;
    if (translationCache.has(cacheKey)) return resolve(translationCache.get(cacheKey)!);
    
    translationQueue.push(async () => {
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json && json[0]) {
          const result = json[0].map((item: any) => item[0]).join('');
          translationCache.set(cacheKey, result);
          resolve(result);
        } else resolve(text);
      } catch {
        resolve(text);
      }
    });
    processTranslationQueue();
  });
};

const TranslatedMessage = ({ text, language, renderFormatted }: { text: string, language: string, renderFormatted: (t: string) => React.ReactNode }) => {
  const [translated, setTranslated] = useState<string>(text);

  useEffect(() => {
    let isMounted = true;
    if (!text) return;
    if (language === 'pt') { setTranslated(text); return; }
    setTranslated(translationCache.get(`${language}:${text}`) || text);
    translateTextAPI(text, language).then(result => { if (isMounted) setTranslated(result); });
    return () => { isMounted = false; };
  }, [text, language]);

  return <>{renderFormatted(translated)}</>;
};

const USER_COLORS = [
  "#229ED9", "#E56555", "#8E44AD", "#27AE60", "#D35400", "#16A085", "#C0392B", "#2980B9"
];

function getUserColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

const formatSenderPhone = (p?: string | null) => {
  if (!p) return 'Contacto';
  const clean = p.replace(/^\+?244\s*/, '').trim();
  if (/^\d{9}$/.test(clean)) {
    return `+244 ${clean.slice(0, 3)} *** ${clean.slice(6)}`;
  }
  return p;
};

const phoneCache: Record<string, string> = {};

const GROUP_MEMBERS = [
  {
    id: 'm1',
    name: 'Thomas Hall',
    badge: 'Admin',
    badgeType: 'admin',
    status: 'online',
    isOnline: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
  },
  {
    id: 'm2',
    name: 'Lauren Gabriella 🥰',
    status: 'visto às 20:31',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
  },
  {
    id: 'm3',
    name: 'Brilson Edlézio',
    status: 'visto às 20:13',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
  },
  {
    id: 'm4',
    name: 'ID 4700',
    badge: 'Dono',
    badgeType: 'owner',
    status: 'visto às 20:13',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop'
  },
  {
    id: 'm5',
    name: 'Chrina Manual',
    status: 'visto às 19:57',
    avatar: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&h=100&fit=crop'
  },
  {
    id: 'm6',
    name: 'PATRICIA',
    status: 'visto às 19:42',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
  },
  {
    id: 'm7',
    name: 'Carlos Manuel',
    status: 'visto às 19:15',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop'
  },
  {
    id: 'm8',
    name: 'Mariana Santos',
    status: 'visto às 18:50',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
  },
  {
    id: 'm9',
    name: 'João Pedro',
    status: 'visto às 18:22',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop'
  },
  {
    id: 'm10',
    name: 'Nelson Mandela Neto',
    status: 'visto às 17:40',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop'
  }
];

const COMMUNITY_QUICK_REACTIONS = ['❤️', '🤷‍♂️', '👍', '👎', '🔥', '🥰', '🎉', '👏', '😂', '😮', '😢'];

type GroupTab = 'members' | 'media' | 'files' | 'links';
const GROUP_TABS: { id: GroupTab; label: string }[] = [
  { id: 'members', label: 'Membros' },
  { id: 'media', label: 'Mídia' },
  { id: 'files', label: 'Ficheiros' },
  { id: 'links', label: 'Links' },
];

export default function CommunityChat() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const user = session?.user;
  const { showToast } = useToast();
  const { language } = useLanguage();

  const [publicMessages, setPublicMessages] = useState<any[]>([]);
  const [, setIsLoading] = useState(true);
  const [publicInput, setPublicInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [editingMessage, setEditingMessage] = useState<any | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [activeGroupTab, setActiveGroupTab] = useState<GroupTab>('members');
  const [isGroupMuted, setIsGroupMuted] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [reactionMenuId, setReactionMenuId] = useState<number | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  // ── Context Menu Telegram ──
  const [contextMenu, setContextMenu] = useState<{ message: any; isMe: boolean } | null>(null);
  const [showAllReactions, setShowAllReactions] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  };

  const handleTouchEnd = (e: React.TouchEvent, m: any, isMe: boolean) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const diffX = Math.abs(touch.clientX - touchStartRef.current.x);
    const diffY = Math.abs(touch.clientY - touchStartRef.current.y);
    const duration = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    if (diffX < 12 && diffY < 12 && duration < 600) {
      e.preventDefault();
      setContextMenu({ message: m, isMe });
      setShowAllReactions(false);
    }
  };

  const closeContextMenu = () => {
    setContextMenu(null);
    setShowAllReactions(false);
  };

  const handleDeleteMessage = async (msgId: number) => {
    if (editingMessage?.id === msgId) {
      setEditingMessage(null);
      setPublicInput("");
    }
    try {
      await supabase.from('chat_gruop').delete().eq('id', msgId);
    } catch {}
    setPublicMessages(prev => prev.filter(m => m.id !== msgId));
    showToast('Mensagem apagada', 'info');
    closeContextMenu();
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  // IDs de mensagens com reações em voo (impede o realtime de sobrescrever estado otimista)
  const pendingReactionIds = useRef<Set<number>>(new Set());

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        if (behavior === "auto") {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        } else {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth"
          });
        }
      }
    });
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
      setShowScrollDown(!isAtBottom);
    }
  };

  const renderFormattedMessage = (text: string) => {
    if (!text) return null;
    const parts = text.split(SMART_CONTEXT_REGEX);
    const usedGroups = new Set<string>();

    return parts.map((part, i) => {
      const lowerPart = part.toLowerCase();
      const path = KEYWORD_TO_PATH[lowerPart];
      if (path && !usedGroups.has(path)) {
        usedGroups.add(path);
        return (
          <span 
            key={i}
            onClick={(e) => { e.stopPropagation(); navigate(path); }}
            className="text-[#229ED9] font-medium underline cursor-pointer hover:opacity-80 transition-opacity"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const isFetchingRef = useRef(false);

  const fetchMessages = async (isInitial = false) => {
    if (isFetchingRef.current && !isInitial) return;
    isFetchingRef.current = true;
    try {
      const { data, error } = await supabase
        .from('chat_gruop')
        .select('*')
        .order('data_registrada', { ascending: false })
        .limit(60);
      if (error) throw error;
      if (data) {
        const uncachedIds = Array.from(new Set(data.map((m: any) => m.uid_emissor).filter((id: string) => id && !phoneCache[id])));
        if (uncachedIds.length > 0) {
          const { data: profiles } = await supabase
            .from('sys_t500')
            .select('id, telefone, nome_exibicao')
            .in('id', uncachedIds);
          if (profiles) {
            profiles.forEach((p: any) => {
              phoneCache[p.id] = p.nome_exibicao || p.telefone || "Telefone Desconhecido";
            });
          }
        }

        const dataWithPhones = data.map((m: any) => ({
          ...m,
          perfil: { 
            telefone: phoneCache[m.uid_emissor] || "Telefone Desconhecido",
            nome_exibicao: phoneCache[m.uid_emissor] || "Membro"
          }
        }));

        const sorted = dataWithPhones.reverse();
        setPublicMessages(prev => {
          const withoutTemp = prev.filter(m => {
            if (typeof m.id === 'number' && m.id > 1000000000000) {
              return !sorted.some((s: any) => s.uid_emissor === m.uid_emissor && s.mensagem === m.mensagem);
            }
            return true;
          });

          const msgMap = new Map();
          withoutTemp.forEach(m => msgMap.set(m.id, m));
          sorted.forEach((m: any) => msgMap.set(m.id, m));
          const result = Array.from(msgMap.values()).sort((a, b) =>
            new Date(a.data_registrada).getTime() - new Date(b.data_registrada).getTime()
          );

          if (prev.length === result.length) {
            let unchanged = true;
            for (let i = 0; i < result.length; i++) {
              if (
                prev[i]?.id !== result[i]?.id ||
                prev[i]?.mensagem !== result[i]?.mensagem ||
                JSON.stringify(prev[i]?.detalhes) !== JSON.stringify(result[i]?.detalhes) ||
                prev[i]?.perfil?.telefone !== result[i]?.perfil?.telefone ||
                prev[i]?.perfil?.nome_exibicao !== result[i]?.perfil?.nome_exibicao
              ) {
                unchanged = false;
                break;
              }
            }
            if (unchanged) return prev;
          }

          return result;
        });
        if (isInitial) scrollToBottom("auto");
      }
    } catch (err) {
      console.error("Não foi possivél carregar mensagens, por favor atualize a pagina", err);
    } finally {
      isFetchingRef.current = false;
      if (isInitial) setIsLoading(false);
    }
  };

  useEffect(() => {
    try { localStorage.removeItem('community_chat_cache'); } catch {}
    fetchMessages(true);
    pollingRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchMessages(false);
      }
    }, 3500);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel("tg_community_chat_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_gruop" }, async (payload) => {
        if (payload.eventType === "DELETE") {
          setPublicMessages(prev => prev.filter(m => m.id !== payload.old.id));
          return;
        }
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          const { data } = await supabase.from("chat_gruop").select('*').eq("id", payload.new.id).single();
          if (data) { 
            let tel = phoneCache[data.uid_emissor] || null;
            if (!tel && data.uid_emissor) {
              const { data: prof } = await supabase
                .from('sys_t500')
                .select('telefone, nome_exibicao')
                .eq('id', data.uid_emissor)
                .maybeSingle();
              if (prof) {
                tel = prof.nome_exibicao || prof.telefone || "Telefone Desconhecido";
                phoneCache[data.uid_emissor] = tel;
              }
            }
            const dataWithPhone = { 
              ...data, 
              perfil: { 
                telefone: tel || "Telefone Desconhecido",
                nome_exibicao: tel || "Membro"
              } 
            };
            setPublicMessages((c) => {
              const withoutTemp = c.filter(m => !(
                typeof m.id === 'number' &&
                m.id > 1000000000000 &&
                m.uid_emissor === data.uid_emissor &&
                m.mensagem === data.mensagem
              ));
              const msgMap = new Map(withoutTemp.map(m => [m.id, m]));
              // Se a mensagem tem reação pendente, mesclar reacoes locais
              // para evitar que o realtime sobrescreva o estado otimista
              if (pendingReactionIds.current.has(data.id)) {
                const localMsg = c.find(m => m.id === data.id);
                const localDetalhes = (localMsg?.detalhes && typeof localMsg.detalhes === 'object') ? (localMsg.detalhes as any) : {} as any;
                const serverDetalhes = (dataWithPhone.detalhes && typeof dataWithPhone.detalhes === 'object') ? (dataWithPhone.detalhes as any) : {} as any;
                // Usar as reacoes locais (otimistas) em vez das do servidor
                const mergedDetalhes = { ...serverDetalhes, reacoes: localDetalhes.reacoes || serverDetalhes.reacoes };
                msgMap.set(data.id, { ...dataWithPhone, detalhes: mergedDetalhes });
              } else {
                msgMap.set(data.id, dataWithPhone);
              }
              return Array.from(msgMap.values()).sort((a, b) => 
                new Date(a.data_registrada).getTime() - new Date(b.data_registrada).getTime()
              );
            }); 
            if (payload.eventType === "INSERT" && scrollRef.current) scrollToBottom();
          }
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const validateMessage = (text: string) => {
    if (text.length > 2000) return "A mensagem é muito longa.";
    if (FORBIDDEN_REGEX.test(text)) return "Por favor, evite termos ofensivos.";
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
    const matches = text.match(urlRegex);
    if (matches) {
      const allowed = ['azure', 'mcn', 'telegram business', 't.me'];
      if (matches.some(m => !allowed.some(d => m.toLowerCase().includes(d))))
        return "Não são permitidos links externos.";
    }
    return null;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast("Máximo 5MB.", "error"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSend = async () => {
    if (!user || (!publicInput.trim() && !imagePreview)) return;
    if (publicInput.trim()) {
      const err = validateMessage(publicInput.trim());
      if (err) { showToast(err, "error"); return; }
    }
    const tempMsg = publicInput.trim();

    // ── Fluxo de Edição de Mensagem Existente ──
    if (editingMessage) {
      const msgIdToEdit = editingMessage.id;
      const prevDetalhes = (editingMessage.detalhes && typeof editingMessage.detalhes === 'object')
        ? { ...editingMessage.detalhes }
        : {};
      const updatedDetalhes = {
        ...prevDetalhes,
        editado: true,
        editado_em: new Date().toISOString()
      };

      setEditingMessage(null);
      setPublicInput("");
      if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.style.height = "auto";
      }

      // Atualização otimista local imediata
      setPublicMessages(prev => prev.map(m => {
        if (m.id === msgIdToEdit) {
          return {
            ...m,
            mensagem: tempMsg,
            detalhes: updatedDetalhes
          };
        }
        return m;
      }));

      setIsSending(true);
      try {
        const { error } = await supabase
          .from("chat_gruop")
          .update({
            mensagem: tempMsg,
            detalhes: updatedDetalhes
          })
          .eq("id", msgIdToEdit);

        if (error) {
          console.error('[CommunityChat] Erro ao editar mensagem:', error);
          showToast('Erro ao atualizar a mensagem', 'error');
        } else {
          showToast('Mensagem editada', 'success');
        }
      } catch (err) {
        console.error('[CommunityChat] Falha na edição:', err);
        showToast('Erro ao atualizar a mensagem', 'error');
      } finally {
        setIsSending(false);
      }
      return;
    }

    const tempImg = imagePreview;
    const tempReply = replyTo;
    const detalhes: Record<string, any> = {};
    if (tempImg) { detalhes.imagem_url = tempImg; detalhes.tipo_midia = 'imagem'; }
    if (tempReply) { detalhes.resposta_para_id = tempReply.id; detalhes.reply = { id: tempReply.id, text: tempReply.mensagem, sender: tempReply.perfil?.nome_exibicao || tempReply.perfil?.telefone || '' }; }

    setPublicInput("");
    setImagePreview(null);
    setReplyTo(null);
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.style.height = "auto";
      inputRef.current.focus();
    }

    const tempId = Date.now();
    const optimisticMessage = {
      id: tempId,
      uid_emissor: user.id,
      mensagem: tempMsg || "",
      detalhes,
      data_registrada: new Date().toISOString(),
      perfil: { telefone: "Eu", nome_exibicao: "Eu" }
    };
    setPublicMessages(prev => [...prev, optimisticMessage]);
    scrollToBottom();

    setIsSending(true);
    try {
      const payload = {
        uid_emissor: user.id,
        mensagem: tempMsg || " ",
        detalhes,
      };
      console.log('[CommunityChat] Enviando para chat_gruop:', payload);
      const { data: insertedMsg, error } = await supabase
        .from("chat_gruop")
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('[CommunityChat] Erro insert:', error.code, error.message, error.details, error.hint);
        throw error;
      }
      if (insertedMsg) {
        setPublicMessages(prev => prev.map(m => m.id === tempId ? {
          ...insertedMsg,
          perfil: { 
            telefone: phoneCache[user.id] || "Eu",
            nome_exibicao: phoneCache[user.id] || "Eu"
          }
        } : m));
      }
      console.log('[CommunityChat] Mensagem inserida com sucesso');
      scrollToBottom();
    } catch (err: any) { 
      console.error("Ops! mensagem não enviada", err);
      setPublicMessages(prev => prev.filter(m => m.id !== tempId));
      const errorMsg = err?.message || err?.error_description || "Ops! mensagem não enviada";
      showToast(`Erro ao enviar: ${errorMsg}`, "error"); 
    } finally { 
      setIsSending(false); 
    }

  };

  const handleToggleReaction = async (messageId: number, emoji: string) => {
    if (!user) return;
    setReactionMenuId(null);
    closeContextMenu();

    const targetMsg = publicMessages.find(m => m.id === messageId);
    if (!targetMsg) return;

    const prevDetalhes = (targetMsg.detalhes && typeof targetMsg.detalhes === 'object')
      ? { ...targetMsg.detalhes }
      : {};
    const currentReactions: Record<string, string[]> = { ...(prevDetalhes.reacoes || {}) };
    const usersForEmoji: string[] = Array.isArray(currentReactions[emoji]) 
      ? [...currentReactions[emoji]] 
      : [];
    const hasReacted = usersForEmoji.includes(user.id);

    if (hasReacted) {
      const filtered = usersForEmoji.filter(uid => uid !== user.id);
      if (filtered.length === 0) {
        delete currentReactions[emoji];
      } else {
        currentReactions[emoji] = filtered;
      }
    } else {
      currentReactions[emoji] = [...usersForEmoji, user.id];
    }

    const updatedDetalhes = {
      ...prevDetalhes,
      reacoes: currentReactions
    };

    // 1. Marcar como pendente para o realtime não sobrescrever
    pendingReactionIds.current.add(messageId);

    // 2. Atualização otimista imediata no estado local
    setPublicMessages(prev => prev.map(m => m.id === messageId ? { ...m, detalhes: updatedDetalhes } : m));

    // 3. Persistir no Supabase chat_gruop
    try {
      const { error } = await supabase
        .from('chat_gruop')
        .update({ detalhes: updatedDetalhes })
        .eq('id', messageId);

      if (error) {
        console.error('[CommunityChat] Erro ao salvar reação:', error);
      }
    } catch (err) {
      console.error('[CommunityChat] Falha ao persistir reação:', err);
    } finally {
      // 4. Remover da lista de pendentes após 3s (tempo suficiente para o realtime processar)
      setTimeout(() => pendingReactionIds.current.delete(messageId), 3000);
    }
  };

  const handleLongPressStart = (id: number) => {
    const timer = setTimeout(() => {
      setReactionMenuId(id);
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => { if (longPressTimer) clearTimeout(longPressTimer); };

  const formatTime = (ts: string) => ts ? new Date(ts).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }) : "";
  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Hoje";
    if (days === 1) return "Ontem";
    return d.toLocaleDateString("pt-PT", { day: "numeric", month: "long" });
  };

  const formatSenderPhone = (p: string) => {
    if (!p || p === "Membro") return "Membro";
    const clean = p.replace(/^\+?244\s*/, '').trim();
    if (/^\d{9}$/.test(clean)) {
      return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
    }
    return clean;
  };

  const handleDownloadImage = async (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `imagem_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('Download concluído!', 'success');
    } catch {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.target = '_blank';
      link.download = `imagem_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // ── Ações do Menu de Contexto Telegram ──
  const menuActions = contextMenu ? [
    { 
      icon: Reply, 
      label: 'Responder', 
      onClick: () => { 
        setEditingMessage(null);
        setReplyTo(contextMenu.message); 
        closeContextMenu(); 
        setTimeout(() => inputRef.current?.focus(), 100); 
      }, 
      color: '#2481cc' 
    },
    { 
      icon: Copy, 
      label: 'Copiar', 
      onClick: () => { 
        navigator.clipboard.writeText(contextMenu.message.mensagem || '').catch(() => {}); 
        showToast('Mensagem copiada!', 'success'); 
        closeContextMenu(); 
      }, 
      color: '#555' 
    },
    ...(contextMenu.isMe ? [{ 
      icon: Pencil, 
      label: 'Editar', 
      onClick: () => { 
        setReplyTo(null);
        setEditingMessage(contextMenu.message); 
        setPublicInput(contextMenu.message.mensagem || ''); 
        closeContextMenu(); 
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.style.height = "auto";
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 100)}px`;
            inputRef.current.selectionStart = inputRef.current.value.length;
            inputRef.current.selectionEnd = inputRef.current.value.length;
          }
        }, 100); 
      }, 
      color: '#555' 
    }] : []),
    ...(contextMenu.isMe ? [{ 
      icon: Trash2, 
      label: 'Apagar', 
      onClick: () => handleDeleteMessage(contextMenu.message.id), 
      color: '#e53e3e',
      subLabel: 'Autoexcluirá em 31 dias'
    }] : [])
  ] : [];

  return (
    <div 
      className="w-full h-[100dvh] font-sans antialiased text-[#202020] select-none tg-chat-no-select flex flex-col items-stretch overflow-hidden relative tg-wallpaper transition-colors"
      onContextMenu={(e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target?.tagName !== 'INPUT' && target?.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }}
    >
      <header className="w-full bg-[#517da2] dark:bg-[#242f3d] text-white px-3 sm:px-6 py-2 sticky top-0 z-40 flex items-center justify-between shadow-xs select-none">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button 
            onClick={() => navigate('/telegramBussiness')} 
            className="w-10 h-10 -ml-1 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer shrink-0"
            aria-label="Voltar aos chats"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>

          <div 
            onClick={() => setShowInfo(true)} 
            className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-xs shrink-0 border border-white/30">
              <img src="/logo-tb.jpg" alt="Telegram" className="w-full h-full object-cover" />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <h1 className="text-[15.5px] font-semibold text-white tracking-tight truncate leading-tight">
                  Telegram Business Oficial
                </h1>
                <span className="w-4 h-4 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 shadow-2xs">
                  <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />
                </span>
              </div>
              <span className="text-[12px] text-white/80 font-normal leading-tight">
                54 281 membros, 1 420 online
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowInfo(true)} 
            className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
            aria-label="Mais informações"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main 
        ref={scrollRef} 
        onScroll={handleScroll}
        className="w-full flex-1 overflow-y-auto no-scrollbar px-3 sm:px-6 md:px-10 lg:px-16 pt-2 pb-24 space-y-2.5 relative scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {publicMessages.map((m, i) => {
          const isMe = m.uid_emissor === user?.id;
          const displayName = isMe 
            ? "Eu" 
            : (m.perfil?.nome_exibicao || formatSenderPhone(m.perfil?.telefone));
          const showDate = i === 0 || formatDateLabel(m.data_registrada) !== formatDateLabel(publicMessages[i-1].data_registrada);
          const authorColor = getUserColor(displayName);

          const parsedData: any = (m.detalhes && typeof m.detalhes === 'object') ? m.detalhes : {};
          const reply = parsedData.reply;
          const reactions = parsedData.reacoes || {};
          const isEdited = Boolean(parsedData.editado);

          return (
            <React.Fragment key={m.id}>
              {showDate && (
                <div className="flex justify-center my-3">
                  <span className="text-[12px] font-medium text-white bg-black/35 backdrop-blur-xs rounded-full px-3.5 py-0.5 shadow-2xs">
                    {formatDateLabel(m.data_registrada)}
                  </span>
                </div>
              )}
              
              <motion.div 
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-1.5 ${isMe ? "justify-end" : "justify-start"} relative group`}
              >
                {!isMe && (
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0 mb-0.5 shadow-xs overflow-hidden"
                    style={{ backgroundColor: authorColor }}
                  >
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}

                {/* ── Mensagem só com imagem (sem balão) ── */}
                {parsedData.imagem_url && !m.mensagem?.trim() ? (
                  <div
                    className="relative cursor-pointer rounded-[18px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.18)] max-w-[72vw] sm:max-w-[320px]"
                    onClick={(e) => { e.stopPropagation(); setContextMenu({ message: m, isMe }); setShowAllReactions(false); }}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={(e) => handleTouchEnd(e, m, isMe)}
                    style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                  >
                    <img
                      src={parsedData.imagem_url}
                      alt="Foto"
                      className="w-full h-auto block rounded-[18px] cursor-pointer active:opacity-90"
                      style={{ maxHeight: '340px', objectFit: 'cover' }}
                      onClick={(e) => { e.stopPropagation(); setZoomedImage(parsedData.imagem_url); }}
                      onTouchStart={(e) => e.stopPropagation()}
                      onTouchEnd={(e) => e.stopPropagation()}
                    />
                    {/* Timestamp sobreposto */}
                    <div className="absolute bottom-1.5 right-2 flex items-center gap-1 bg-black/40 rounded-full px-1.5 py-0.5 select-none">
                      {isEdited && (
                        <span className="text-[9.5px] font-normal text-white/85 select-none">editada</span>
                      )}
                      <span className="text-[10px] font-normal text-white">{formatTime(m.data_registrada)}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-white stroke-[2.4]" />}
                    </div>
                    {/* Reações */}
                    {Object.keys(reactions).length > 0 && (
                      <div className="absolute -bottom-5 left-0 flex flex-wrap gap-1">
                        {Object.entries(reactions).map(([emoji, users]: [string, any]) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleToggleReaction(m.id, emoji)}
                            className="bg-white/90 border border-black/5 rounded-full px-2 py-0.5 flex items-center gap-1 shadow-sm hover:bg-white active:scale-95 transition-transform cursor-pointer"
                          >
                            <span className="text-[11px]">{emoji}</span>
                            <span className="text-[10px] font-bold text-[#555555]">{(users as any[]).length}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* ── Mensagem normal (texto ± imagem) ── */
                  <div
                    onClick={(e) => { e.stopPropagation(); setContextMenu({ message: m, isMe }); setShowAllReactions(false); }}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={(e) => handleTouchEnd(e, m, isMe)}
                    className={cn(
                      "tg-bubble max-w-[82%] px-3.5 py-2 text-[#202020] dark:text-[#f3f4f6] shadow-[0_1px_2px_rgba(0,0,0,0.06)] relative cursor-pointer active:brightness-95 active:scale-[0.985] transition-all select-none",
                      isMe ? "bg-[#dcf8c6] dark:bg-[#2b5278] is-me" : "bg-white dark:bg-[#182533] is-other",
                      contextMenu?.message.id === m.id && "brightness-90 scale-[0.985]"
                    )}
                    style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                  >
                    {/* Ponta de agulha (Speech bubble tail Telegram) */}
                    {isMe ? (
                      <svg
                        className="absolute bottom-0 -right-[8px] w-[9px] h-[16px] text-[#dcf8c6] dark:text-[#2b5278] fill-current pointer-events-none"
                        viewBox="0 0 9 16"
                      >
                        <path d="M0 16C4.58866 16 7.85994 13.7431 8.87707 9.22918C9.69176 5.61483 8.35626 2.37324 0 0V16Z" />
                      </svg>
                    ) : (
                      <svg
                        className="absolute bottom-0 -left-[8px] w-[9px] h-[16px] text-white dark:text-[#182533] fill-current pointer-events-none"
                        viewBox="0 0 9 16"
                        style={{ transform: 'scaleX(-1)' }}
                      >
                        <path d="M0 16C4.58866 16 7.85994 13.7431 8.87707 9.22918C9.69176 5.61483 8.35626 2.37324 0 0V16Z" />
                      </svg>
                    )}
                    {!isMe && (
                      <p 
                        className="text-[13px] font-bold mb-0.5 cursor-pointer truncate"
                        style={{ color: authorColor }}
                      >
                        {displayName}
                      </p>
                    )}

                    {reply && (
                      <div className={cn(
                        "rounded-[8px] px-2.5 py-1 mb-1.5 text-[11px] border-l-[3px] bg-black/5 overflow-hidden",
                        isMe ? "border-[#25D366] text-[#444444]" : "border-[#2b82c9] text-[#555555]"
                      )}>
                        <p className="font-bold text-[11px] text-[#2b82c9] truncate">{reply.sender}</p>
                        <p className="truncate italic text-[11px] text-[#666666]">{reply.text || "📷 Foto"}</p>
                      </div>
                    )}

                    {parsedData.imagem_url && (
                      <div className="mb-1.5 -mx-1.5 -mt-0.5 overflow-hidden rounded-[14px]">
                        <img
                          src={parsedData.imagem_url}
                          alt="Anexo"
                          className="w-full h-auto max-h-[260px] object-cover cursor-pointer active:opacity-90 rounded-[14px]"
                          onClick={(e) => { e.stopPropagation(); setZoomedImage(parsedData.imagem_url); }}
                          onTouchStart={(e) => e.stopPropagation()}
                          onTouchEnd={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}

                    <div className="relative">
                      <p className={cn("text-[14.5px] leading-relaxed break-words whitespace-pre-wrap text-[#202020] font-normal", isEdited ? "pr-20" : "pr-12")}>
                        <TranslatedMessage text={m.mensagem} language={language} renderFormatted={renderFormattedMessage} />
                      </p>
                      
                      <div className="absolute right-0 bottom-[-2px] flex items-center gap-1 select-none">
                        {isEdited && (
                          <span className={`text-[10px] font-normal select-none ${isMe ? 'text-[#55864e]/85' : 'text-[#8e8e93]'}`}>
                            editada
                          </span>
                        )}
                        <span className={`text-[10.5px] font-normal ${isMe ? 'text-[#55864e]' : 'text-[#8e8e93]'}`}>
                          {formatTime(m.data_registrada)}
                        </span>
                        {isMe && (
                          <CheckCheck className="w-3.5 h-3.5 text-[#4fae4e] stroke-[2.4]" />
                        )}
                      </div>
                    </div>

                    {Object.keys(reactions).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-black/5">
                        {Object.entries(reactions).map(([emoji, users]: [string, any]) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleToggleReaction(m.id, emoji)}
                            className="bg-white/80 border border-black/5 rounded-full px-2 py-0.5 flex items-center gap-1 shadow-2xs hover:bg-white active:scale-95 transition-transform cursor-pointer"
                          >
                            <span className="text-[11px]">{emoji}</span>
                            <span className="text-[10px] font-bold text-[#555555]">{(users as any[]).length}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </React.Fragment>
          );
        })}
      </main>

      <AnimatePresence>
        {showScrollDown && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollToBottom()}
            className="fixed bottom-[74px] right-4 w-10 h-10 bg-white text-gray-700 rounded-full shadow-lg flex items-center justify-center z-40 active:scale-90 transition-transform cursor-pointer border border-gray-100"
            aria-label="Rolar para o fundo"
          >
            <ArrowDown className="w-5 h-5 stroke-[2.2]" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 p-2.5 z-40 flex justify-center">
        <div className="w-full max-w-[480px] flex flex-col gap-1.5">
          <AnimatePresence>
            {editingMessage && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="bg-white/95 backdrop-blur-md border-l-[3px] border-[#2481cc] rounded-[14px] px-3 py-1.5 shadow-md flex justify-between items-center"
              >
                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                  <Pencil className="w-4 h-4 text-[#2481cc] shrink-0 stroke-[2.2]" />
                  <div className="truncate flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-[#2481cc] leading-tight">
                      Editar mensagem
                    </p>
                    <p className="text-[11px] text-[#777777] truncate italic leading-tight">
                      {editingMessage.mensagem || 'Foto'}
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingMessage(null);
                    setPublicInput("");
                    if (inputRef.current) {
                      inputRef.current.value = "";
                      inputRef.current.style.height = "auto";
                    }
                  }} 
                  className="text-gray-400 hover:text-black p-1 cursor-pointer shrink-0"
                  title="Cancelar edição"
                >
                  <X className="w-4 h-4 stroke-[2]" />
                </button>
              </motion.div>
            )}

            {replyTo && !editingMessage && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="bg-white/95 backdrop-blur-md border-l-[3px] border-[#2481cc] rounded-[14px] px-3 py-1.5 shadow-md flex justify-between items-center"
              >
                <div className="truncate flex-1">
                  <p className="text-[11px] font-bold text-[#2481cc]">
                    A responder a {replyTo.perfil?.nome_exibicao || formatSenderPhone(replyTo.perfil?.telefone)}
                  </p>
                  <p className="text-[11px] text-[#777777] truncate italic">
                    <TranslatedMessage text={replyTo.mensagem} language={language} renderFormatted={(t: string) => t || 'Foto'} />
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setReplyTo(null)} 
                  className="text-gray-400 hover:text-black p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
            />

            <div className="flex-1 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] flex items-center px-3.5 py-1.5 min-h-[46px] border border-gray-100/80">
              <button 
                type="button" 
                className="text-gray-400 hover:text-gray-600 p-1 active:scale-90 transition-transform shrink-0"
                title="Emojis"
              >
                <Smile className="w-6 h-6 stroke-[1.8]" />
              </button>

              {imagePreview && (
                <div className="relative mr-2 shrink-0">
                  <img src={imagePreview} alt="preview" className="w-8 h-8 object-cover rounded-lg border border-gray-200" />
                  <button 
                    type="button" 
                    onClick={() => setImagePreview(null)} 
                    className="absolute -top-1 -right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-black"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}

              <textarea
                ref={inputRef}
                value={publicInput}
                onChange={(e) => {
                  setPublicInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
                }}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter' && !e.shiftKey) { 
                    e.preventDefault(); 
                    handleSend(); 
                  } else if (e.key === 'Escape' && editingMessage) {
                    e.preventDefault();
                    setEditingMessage(null);
                    setPublicInput("");
                    if (inputRef.current) {
                      inputRef.current.value = "";
                      inputRef.current.style.height = "auto";
                    }
                  }
                }}
                placeholder={editingMessage ? "Editar mensagem..." : "Message"}
                className="w-full px-2 py-1.5 text-[15px] bg-transparent resize-none outline-none max-h-[100px] text-black placeholder:text-gray-400 font-normal leading-snug"
                rows={1}
              />

              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()} 
                className="text-gray-400 hover:text-gray-600 p-1 active:scale-90 transition-transform shrink-0 rotate-[-45deg]"
                title="Anexar foto"
              >
                <Paperclip className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            <button 
              type="button"
              onClick={handleSend}
              disabled={isSending}
              style={{ borderRadius: '9999px' }}
              className="w-[46px] h-[46px] !rounded-full rounded-full bg-[#2481cc] hover:bg-[#1f72b5] text-white flex items-center justify-center active:scale-90 transition-transform shrink-0 shadow-[0_2px_10px_rgba(36,129,204,0.4)] cursor-pointer"
              title={editingMessage ? "Salvar alterações" : "Enviar"}
            >
              {editingMessage ? (
                <Check className="w-5 h-5 text-white stroke-[2.5]" />
              ) : (publicInput.trim() || imagePreview) ? (
                <Send className="w-5 h-5 text-white ml-0.5 stroke-[2]" />
              ) : (
                <Mic className="w-5 h-5 text-white stroke-[2]" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            key="group-info"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed inset-0 z-[250] bg-[#f0f0f0] dark:bg-[#17212b] overflow-y-auto flex flex-col select-none"
          >
            <div className="w-full max-w-[560px] mx-auto min-h-screen flex flex-col">

              {/* ── Cabeçalho: ← Group Info ── */}
              <div className="w-full flex items-center justify-between px-2 pt-3 pb-2 bg-white dark:bg-[#1c2733] sticky top-0 z-10 shadow-[0_1px_0_rgba(0,0,0,0.08)]">
                <button
                  type="button"
                  onClick={() => setShowInfo(false)}
                  className="flex items-center gap-1 text-[#2AABEE] font-medium px-2 py-2 rounded-xl active:bg-[#2AABEE]/10 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                </button>
                <h2 className="text-[17px] font-semibold text-[#111] dark:text-white tracking-tight">
                  Informações do Grupo
                </h2>
                <button
                  type="button"
                  onClick={() => showToast('Apenas administradores podem editar', 'info')}
                  className="px-3 py-2 text-[#2AABEE] text-[15px] font-medium active:opacity-60 transition-opacity cursor-pointer"
                >
                  Editar
                </button>
              </div>

              {/* ── Foto + Nome + Membros ── */}
              <div className="flex flex-col items-center bg-white dark:bg-[#1c2733] pt-6 pb-5 px-4">
                <div
                  className="w-[90px] h-[90px] rounded-full overflow-hidden shadow-md mb-3 cursor-pointer active:opacity-80"
                  onClick={() => setZoomedImage('/logo-tb.jpg')}
                >
                  <img src="/logo-tb.jpg" alt="Telegram" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-[20px] font-bold text-[#111] dark:text-white text-center leading-tight mb-0.5">
                  Telegram Business Oficial
                </h1>
                <p className="text-[14px] text-gray-500 dark:text-gray-400">
                  54 281 membros
                </p>
              </div>

              {/* ── Separador ── */}
              <div className="h-[6px] bg-[#f0f0f0] dark:bg-[#17212b]" />

              {/* ── Bloco: Link + Notificações ── */}
              <div className="bg-white dark:bg-[#1c2733]">
                {/* Link */}
                <div
                  className="flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-gray-100 dark:active:bg-[#243040] transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText('https://t.me/TelegramBusinessOficial');
                    setIsCopiedLink(true);
                    showToast('Link copiado!', 'success');
                    setTimeout(() => setIsCopiedLink(false), 2000);
                  }}
                >
                  <div className="w-[34px] h-[34px] rounded-full bg-[#FF9500] flex items-center justify-center shrink-0">
                    <QrCode className="w-[18px] h-[18px] text-white stroke-[2]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[15px] text-[#2AABEE] font-normal leading-tight truncate">
                      {isCopiedLink ? 'Copiado!' : 'https://t.me/TelegramBusinessOficial'}
                    </span>
                    <span className="text-[12px] text-gray-400 mt-0.5">Link</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 dark:bg-white/8 ml-[60px]" />

                {/* Notificações */}
                <div className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-[34px] h-[34px] rounded-full bg-[#FF3B30] flex items-center justify-center shrink-0">
                    <Bell className="w-[18px] h-[18px] text-white stroke-[2]" />
                  </div>
                  <span className="flex-1 text-[15px] text-[#111] dark:text-white font-normal">
                    Notificações
                  </span>
                  {/* Switch toggle estilo iOS/Telegram */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsGroupMuted(!isGroupMuted);
                      showToast(isGroupMuted ? 'Notificações ativadas' : 'Notificações silenciadas', 'info');
                    }}
                    className="relative w-[51px] h-[31px] rounded-full transition-colors duration-200 cursor-pointer focus:outline-none shrink-0"
                    style={{ backgroundColor: isGroupMuted ? '#E5E5EA' : '#34C759' }}
                    aria-label="Toggle notificações"
                  >
                    <span
                      className="absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-md transition-transform duration-200"
                      style={{ transform: isGroupMuted ? 'translateX(2px)' : 'translateX(22px)' }}
                    />
                  </button>
                </div>
              </div>

              {/* ── Separador ── */}
              <div className="h-[6px] bg-[#f0f0f0] dark:bg-[#17212b]" />

              {/* ── Abas: Members / Media / Files / Links ── */}
              <div className="bg-white dark:bg-[#1c2733] sticky top-[52px] z-[9]">
                <div className="flex border-b border-gray-200 dark:border-white/10">
                  {GROUP_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveGroupTab(tab.id)}
                      className={`flex-1 py-3 text-[13px] font-semibold transition-colors cursor-pointer ${
                        activeGroupTab === tab.id
                          ? 'text-[#2AABEE] border-b-2 border-[#2AABEE]'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Conteúdo das Abas ── */}
              <div className="flex-1 bg-white dark:bg-[#1c2733]">
                {activeGroupTab === 'members' && (
                  <div className="divide-y divide-gray-100 dark:divide-white/8">
                    {/* Adicionar Membro */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-gray-50 dark:active:bg-[#243040] transition-colors"
                      onClick={() => showToast('Apenas administradores podem adicionar membros', 'info')}
                    >
                      <div className="w-[46px] h-[46px] rounded-full bg-[#2AABEE]/15 flex items-center justify-center shrink-0">
                        <UserPlus className="w-5 h-5 text-[#2AABEE] stroke-[2]" />
                      </div>
                      <span className="text-[15px] text-[#2AABEE] font-medium">Adicionar Membro</span>
                    </div>
                    {/* Membros fictícios */}
                    {[
                      { name: 'Pavel Durov', role: 'Fundador', avatar: '/pavel_durov.jpg' },
                      { name: 'Telegram Business', role: 'Administrador', avatar: '/logo-tb.jpg' },
                      { name: 'BotFather', role: 'Bot', avatar: '/BotFather.jpg' },
                    ].map((member) => (
                      <div key={member.name} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-[46px] h-[46px] rounded-full overflow-hidden shrink-0 bg-gray-200">
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover"
                            onError={(e: any) => { e.target.src = '/logo-tb.jpg'; }}
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[15px] font-medium text-[#111] dark:text-white truncate">{member.name}</span>
                          <span className="text-[13px] text-gray-400">{member.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeGroupTab === 'media' && (
                  <div className="p-4 text-center text-gray-400 text-[14px] pt-12">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#242f3d] flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    Nenhuma mídia partilhada ainda
                  </div>
                )}

                {activeGroupTab === 'files' && (
                  <div className="p-4 text-center text-gray-400 text-[14px] pt-12">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#242f3d] flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    Nenhum ficheiro partilhado ainda
                  </div>
                )}

                {activeGroupTab === 'links' && (
                  <div
                    className="flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-gray-50 dark:active:bg-[#243040] transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText('https://t.me/TelegramBusinessOficial');
                      showToast('Link copiado!', 'success');
                    }}
                  >
                    <div className="w-[46px] h-[46px] rounded-xl bg-[#2AABEE]/15 flex items-center justify-center shrink-0">
                      <QrCode className="w-5 h-5 text-[#2AABEE] stroke-[2]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[15px] text-[#2AABEE] truncate">https://t.me/TelegramBusinessOficial</span>
                      <span className="text-[12px] text-gray-400 mt-0.5">Link de convite</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {zoomedImage && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-2" 
            onClick={() => setZoomedImage(null)}
          >
            <img src={zoomedImage} className="max-w-full max-h-full object-contain rounded-[12px]" alt="Zoom" />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button 
                type="button"
                className="text-white p-2 hover:bg-white/10 rounded-full cursor-pointer flex items-center justify-center transition-colors"
                onClick={(e) => handleDownloadImage(zoomedImage, e)}
                title="Baixar imagem"
              >
                <Download className="w-6 h-6 stroke-[2]" />
              </button>
              <button 
                type="button"
                className="text-white hover:text-[#FE384F] p-2 hover:bg-white/10 rounded-full cursor-pointer flex items-center justify-center transition-colors"
                onClick={() => setZoomedImage(null)}
                title="Fechar"
              >
                <X className="w-6 h-6 stroke-[2]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONTEXT MENU — TOPO DA TELA (slide-down) ── */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-[200] bg-black/40"
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          onClick={closeContextMenu}
        >
          {/* Painel que desce do topo */}
          <div
            className="absolute top-0 left-0 right-0 bg-white dark:bg-[#1e1e1e] select-none shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'slideDownMenu 0.22s cubic-bezier(0.16, 1, 0.3, 1) both',
              touchAction: 'manipulation',
              borderBottomLeftRadius: '20px',
              borderBottomRightRadius: '20px',
            }}
          >
            {/* ── Barra de Reações ── */}
            <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100 dark:border-white/8">
              {(showAllReactions ? COMMUNITY_QUICK_REACTIONS : COMMUNITY_QUICK_REACTIONS.slice(0, 7)).map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    handleToggleReaction(contextMenu.message.id, emoji);
                    showToast(`Reação ${emoji} adicionada!`, 'success');
                    closeContextMenu();
                  }}
                  className="w-10 h-10 flex items-center justify-center text-[26px] leading-none active:scale-125 transition-transform rounded-full cursor-pointer"
                  style={{ touchAction: 'manipulation' }}
                  title={`Reagir com ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowAllReactions(!showAllReactions)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#3a3a3a] flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-200 active:scale-90 transition-transform cursor-pointer"
                style={{ touchAction: 'manipulation' }}
                title="Mais reações"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* ── Lista de Ações Verticais ── */}
            {menuActions.map((action, idx) => (
              <React.Fragment key={action.label}>
                <button
                  type="button"
                  onClick={action.onClick}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] active:bg-gray-100 dark:active:bg-[#333] transition-colors cursor-pointer text-left"
                  style={{ touchAction: 'manipulation' }}
                >
                  <action.icon
                    className="w-5 h-5 shrink-0"
                    style={{ color: action.color }}
                  />
                  <div>
                    <span
                      className="text-[15px] font-medium block leading-tight text-gray-900 dark:text-gray-100"
                      style={{ color: action.color === '#e53e3e' ? '#e53e3e' : undefined }}
                    >
                      {action.label}
                    </span>
                    {action.subLabel && (
                      <span className="text-[11px] text-gray-400 block mt-0.5">{action.subLabel}</span>
                    )}
                  </div>
                </button>
                {idx < menuActions.length - 1 && (
                  <div className="h-px bg-gray-100 dark:bg-[#2e2e2e] mx-5" />
                )}
              </React.Fragment>
            ))}

            {/* ── Fechar / handle ── */}
            <div className="flex justify-center py-3">
              <button
                type="button"
                onClick={closeContextMenu}
                className="flex items-center gap-2 text-[13px] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer select-none"
                style={{ touchAction: 'manipulation' }}
              >
                <X className="w-4 h-4" />
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Animações CSS injetadas ── */}
      <style>{`
        @keyframes slideDownMenu {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0);     }
        }
      `}</style>
    </div>
  );
}
