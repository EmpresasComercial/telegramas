import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  QrCode,
  Wallet,
  PlusCircle,
  CreditCard,
  MessageSquare,
  ShieldAlert,
  Volume2,
  Building2,
  MessagesSquare,
  Smartphone,
  Globe,
  ChevronRight,
  Star,
  Store,
  Gift,
  HelpCircle,
  Lightbulb,
  Lock,
  LogOut,
  Camera,
  ChevronLeft,
  Edit3,
  Download,
  Phone,
  AtSign,
  Settings,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../contexts/LanguageContext";
import { formatCurrency } from "../../lib/currency";
import { useToast } from "../../components/Toast";
import EditProfileModal from "./components/EditProfileModal";

export default function Profile() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const settingsSectionRef = useRef<HTMLDivElement>(null);

  const [showLanguage, setShowLanguage] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [totalDeposits, setTotalDeposits] = useState<number>(0);
  const [totalWithdrawals, setTotalWithdrawals] = useState<number>(0);
  const [comissaoEquipe, setComissaoEquipe] = useState<number>(0);
  const [refCode, setRefCode] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [userBio, setUserBio] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // Busca dados reais do banco via RPC segura (SECURITY DEFINER)
  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const meta = user.user_metadata || {};
        const fName = meta.first_name || (meta.name || meta.full_name || "").split(" ")[0];
        const lName = meta.last_name || (meta.name || meta.full_name || "").split(" ").slice(1).join(" ");
        setFirstName(fName);
        setLastName(lName);
        setUserName([fName, lName].filter(Boolean).join(" "));
        if (meta.bio) setUserBio(meta.bio);
        if (meta.avatar_url) setAvatarUrl(meta.avatar_url);
      }

      const { data, error } = await supabase.rpc("get_my_account_data");
      if (!error && data && data.length > 0) {
        const d = data[0] as any;
        setBalance(Number(d.saldo_disponivel ?? 0));
        setTotalDeposits(Number(d.total_recarregado ?? 0));
        setTotalWithdrawals(Number(d.total_retirado ?? 0));
        setComissaoEquipe(Number(d.total_comissao_equipe ?? 0));
        if (d.telefone) setPhone(d.telefone);
        if (d.nome_exibicao) setUserName(d.nome_exibicao);
        if (d.codigo_meu_refferal) setRefCode(d.codigo_meu_refferal);
      }
    } catch {
      // Falha silenciosa
    }
  }, []);

  const handleQrCodeClick = () => {
    const inviteCode = refCode || "";
    const inviteUrl = inviteCode ? `https://join-t.me/t?${inviteCode}` : window.location.origin;
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(inviteUrl);
      }
    } catch {
      // ignore
    }
    showToast(
      inviteCode
        ? `🔥 Convite VIP Copiado! Partilhe o link (código: ${inviteCode}) e ganhe até 18% de comissão diária da sua equipa! 🚀💰`
        : `🔥 Atenção VIP! Convide amigos para a equipa e ganhe até 18% de comissões diárias garantidas! 🚀💰`,
      "success"
    );
  };

  // Realtime: atualiza saldo/recargas/retiradas em tempo real
  useEffect(() => {
    fetchData();

    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel(`profile_realtime_${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'sys_t500',
          filter: `id=eq.${user.id}`
        }, () => {
          fetchData();
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'renda_diaria_mcpn',
          filter: `user_id=eq.${user.id}`
        }, () => { fetchData(); })
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const scrollToSettings = () => {
    settingsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      showToast("Sessão terminada com sucesso", "success");
      navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  return (
    <div className="w-full min-h-[100dvh] bg-[#f0f2f5] dark:bg-[#0e1621] font-sans text-black pb-28">

      {/* ── TOP BAR TELEGRAM WEB ── */}
      <header className="w-full bg-[#517da2] dark:bg-[#242f3d] text-white px-3 py-2.5 sticky top-0 z-30 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/telegramBussiness')}
            className="p-1 rounded-full hover:bg-white/15 active:bg-white/25 transition-colors cursor-pointer" 
            aria-label="Voltar"
          >
            <ChevronLeft className="w-6 h-6 text-white stroke-[2.2]" />
          </button>
          <h1 className="text-[17px] font-semibold text-white tracking-tight">Definições</h1>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => setShowEditProfile(true)}
            className="p-1.5 rounded-full hover:bg-white/15 active:bg-white/25 transition-colors cursor-pointer text-white" 
            title="Editar Perfil"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── AVATAR & PERFIL TELEGRAM WEB ── */}
      <section className="bg-white dark:bg-[#17212b] border-b border-gray-100 dark:border-[#202b36] pt-6 pb-5 px-4 flex flex-col items-center shadow-2xs mb-3">
        <div className="relative mb-3 cursor-pointer" onClick={() => setShowEditProfile(true)}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName}
              className="w-[96px] h-[96px] rounded-full object-cover shadow-sm ring-4 ring-[#2481cc]/20"
            />
          ) : (
            <div className="w-[96px] h-[96px] rounded-full bg-gradient-to-br from-[#3390ec] to-[#1e6dc8] flex items-center justify-center shadow-sm ring-4 ring-[#2481cc]/20">
              <span className="text-[38px] font-bold text-white">{firstName.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setShowEditProfile(true); }}
            className="absolute bottom-0 right-0 w-[34px] h-[34px] bg-[#3390ec] rounded-full flex items-center justify-center border-[2.5px] border-white shadow-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            aria-label="Editar perfil"
          >
            <Camera className="w-[16px] h-[16px] text-white" strokeWidth={2.5} />
          </button>
        </div>
        <h2 className="text-[20px] font-bold tracking-tight text-black dark:text-white mb-0.5 text-center">{userName}</h2>
        {userBio ? (
          <p className="text-[13px] text-[#707579] dark:text-[#8e9aa5] text-center max-w-[280px] mb-1">{userBio}</p>
        ) : null}
        <p className="text-[13px] text-[#2481cc] font-medium flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-[#707579] dark:text-[#8e9aa5]">Balance</span>
          <span className="font-bold text-[#2481cc]">{formatCurrency(balance, 'KZ')}</span>
        </p>
      </section>

      <main className="px-3 flex flex-col gap-3.5 max-w-2xl mx-auto">

        {/* CARD DE CONTATO */}
        <div className="bg-white rounded-[18px] overflow-hidden shadow-2xs border border-gray-100">
          <div className="flex items-center px-4 py-3 hover:bg-gray-50/80 active:bg-gray-100 cursor-pointer transition-colors border-b border-gray-100">
            <div className="w-[32px] h-[32px] rounded-[10px] bg-[#34c759] flex items-center justify-center shrink-0 mr-3.5 shadow-2xs">
              <Phone className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex-1 flex flex-col justify-center py-0.5">
              <span className="text-[15px] font-medium text-black leading-tight mb-0.5">
                {phone || "+244 941 465 064"}
              </span>
              <span className="text-[13px] font-normal text-[#8e8e93] leading-tight truncate">
                Phone
              </span>
            </div>
          </div>
          
          <div className="flex items-center px-4 py-3 hover:bg-gray-50/80 active:bg-gray-100 cursor-pointer transition-colors">
            <div className="w-[32px] h-[32px] rounded-[10px] bg-[#3390ec] flex items-center justify-center shrink-0 mr-3.5 shadow-2xs">
              <AtSign className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 flex flex-col justify-center py-0.5">
              <span className="text-[15px] font-medium text-black leading-tight mb-0.5">
                {userName ? `@${userName.replace(/\s+/g, '').toLowerCase()}` : "@asiarymoto"}
              </span>
              <span className="text-[13px] font-normal text-[#8e8e93] leading-tight truncate">
                Username
              </span>
            </div>
            <div 
              className="ml-2 flex-shrink-0 cursor-pointer p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              onClick={(e) => { e.stopPropagation(); handleQrCodeClick(); }}
            >
              <QrCode className="w-[20px] h-[20px] text-black" />
            </div>
          </div>
        </div>

        {/* ACÇÕES RÁPIDAS (Estilo Lista) */}
        <div className="bg-white rounded-[18px] overflow-hidden shadow-2xs border border-gray-100">
          <SettingsItem
            icon={<Wallet className="w-5 h-5 text-white" />}
            iconBg="bg-[#0284c7]"
            title="Retirar"
            subtitle="Solicite o levantamento dos seus fundos"
            onClick={() => navigate("/retirada")}
          />
          <SettingsItem
            icon={<PlusCircle className="w-5 h-5 text-white" />}
            iconBg="bg-[#10b981]"
            title="Carregar"
            subtitle="Faça um depósito na sua conta"
            onClick={() => navigate("/recarregar")}
          />
          <SettingsItem
            icon={<Store className="w-5 h-5 text-white" />}
            iconBg="bg-[#f2a93b]"
            title="Meus Bots"
            subtitle="Faça a gestão dos seus robôs"
            onClick={() => navigate("/minhas-compras")}
          />
          <SettingsItem
            icon={<Gift className="w-5 h-5 text-white" />}
            iconBg="bg-[#e95171]"
            title="Prémios"
            subtitle="Consulte as suas recompensas e bónus"
            isLast={true}
            onClick={scrollToSettings}
          />
        </div>



        {/* ═══ SEÇÃO DE SETTINGS UNIFICADA ═══ */}
        <div ref={settingsSectionRef} className="flex flex-col gap-3.5 pt-1">

          {/* CARD 1: PRINCIPAL */}
          <div className="bg-white rounded-[18px] overflow-hidden shadow-2xs border border-gray-100">
            <SettingsItem
              icon={<Lightbulb className="w-5 h-5 text-white fill-white" />}
              iconBg="bg-[#b375d6]"
              title="Introdução ao Telegram"
              subtitle="Descubra novas funcionalidades"
              onClick={() => navigate("/sobre-telegram business")}
            />

            <SettingsItem
              icon={<MessageSquare className="w-5 h-5 text-white" />}
              iconBg="bg-[#f2a93b]"
              title="Chat da comunidade"
              subtitle="Converse com membros da comunidade"
              onClick={() => navigate("/telegramBussiness")}
            />

            <SettingsItem
              icon={<Volume2 className="w-5 h-5 text-white fill-white" />}
              iconBg="bg-[#fe384f]"
              title="Notifications"
              subtitle="Sounds, Calls, Badges"
              onClick={() => {
                if ("Notification" in window) {
                  Notification.requestPermission();
                  showToast("Configuração de notificações atualizada", "info");
                }
              }}
            />

            <SettingsItem
              icon={<Download className="w-5 h-5 text-white" />}
              iconBg="bg-[#e95171]"
              title="Download Telegram Business"
              subtitle="Página comercial e ferramentas"
              onClick={() => {
                const promptEvent = (window as any).deferredPwaPrompt;
                if (promptEvent) {
                  promptEvent.prompt();
                  promptEvent.userChoice.then(() => {
                    (window as any).deferredPwaPrompt = null;
                  });
                } else {
                  showToast("Instalação automática indisponível. Para instalar, toque no menu do seu navegador (⋮) e selecione 'Adicionar à Tela Inicial' ou 'Instalar Aplicativo'.", "info");
                }
              }}
            />

            <SettingsItem
              icon={<MessagesSquare className="w-5 h-5 text-white" />}
              iconBg="bg-[#3390ec]"
              title="Anúncio telegram postes"
              subtitle="Aceder aos anúncios do Telegram e às provas de retirada"
              onClick={() => navigate("/canal-oficial")}
            />

            <SettingsItem
              icon={<CreditCard className="w-5 h-5 text-white" />}
              iconBg="bg-[#3390ec]"
              title="Conta"
              subtitle="Adicionar cartão bancário"
              onClick={() => navigate("/adicionar-banco")}
            />

            <SettingsItem
              icon={<Building2 className="w-5 h-5 text-white" />}
              iconBg="bg-[#3390ec]"
              title="Informações Bancárias"
              subtitle="Ver conta bancária adicionada"
              isLast={true}
              onClick={() => navigate("/informacao-bancaria")}
            />
          </div>

          {/* CARD 2: AJUDA & SUPORTE */}
          <div className="bg-white rounded-[18px] overflow-hidden shadow-2xs border border-gray-100">
            <div className="px-4 py-2 pt-3">
              <span className="text-[13px] font-semibold text-[#2481cc] tracking-wide">Ajuda</span>
            </div>

            <SettingsItem
              icon={<HelpCircle className="w-5 h-5 text-white" />}
              iconBg="bg-[#3390ec]"
              title="Perguntas Frequentes"
              subtitle="Tire as suas dúvidas"
              onClick={() => navigate("/help-faq")}
            />

            <SettingsItem
              icon={<Globe className="w-5 h-5 text-white" />}
              iconBg="bg-[#b375d6]"
              title="Idioma"
              subtitle="Português (Brasil)"
              onClick={() => setShowLanguage(true)}
            />

            <SettingsItem
              icon={<ShieldAlert className="w-5 h-5 text-white" />}
              iconBg="bg-[#2481cc]"
              title="Redefinir Senha"
              subtitle="Altere a sua senha de acesso"
              onClick={() => navigate("/alterar-senha")}
            />

            <SettingsItem
              icon={<Smartphone className="w-5 h-5 text-white" />}
              iconBg="bg-[#46c2ca]"
              title="Termos de uso e privacidade"
              subtitle="Ver versão e actualizar a aplicação"
              isLast={true}
              onClick={() => navigate("/devices")}
            />
          </div>

          {/* CARD 4: LOGOUT */}
          <div className="bg-white rounded-[18px] overflow-hidden shadow-2xs border border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3.5 text-left hover:bg-red-50/50 active:bg-red-50 transition-colors cursor-pointer"
            >
              <div className="w-[32px] h-[32px] rounded-[10px] bg-red-500 flex items-center justify-center shrink-0 mr-4">
                <LogOut className="w-5 h-5 text-white" />
              </div>
              <span className="text-[15px] font-semibold text-red-600">Sair da Conta</span>
            </button>
          </div>

        </div>

      </main>

      {/* MODAL DE IDIOMA */}
      {showLanguage && (
        <div className="fixed inset-0 z-50 bg-[#f1f1f2] overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            {/* Header do Modal */}
            <div className="flex items-center px-4 pt-5 pb-3 bg-[#f1f1f2] sticky top-0 z-10 border-b border-gray-200/60">
              <button onClick={() => setShowLanguage(false)} className="mr-3 p-1 rounded-full active:opacity-50">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M5 12l7-7M5 12l7 7" />
                </svg>
              </button>
              <span className="text-[18px] font-bold flex-1">Idioma</span>
            </div>

            <div className="px-3 flex flex-col gap-4 pb-12 pt-3">
              {/* Traduzir Mensagens Card */}
              <div className="bg-white rounded-[18px] overflow-hidden shadow-2xs border border-gray-100">
                <div className="px-4 pt-3 pb-1">
                  <span className="text-[13px] font-semibold text-[#2481cc]">Traduzir Mensagens</span>
                </div>
                <TranslateRow label="Mostrar o Botão Traduzir" defaultOn={true} />
                <TranslateRow label="Traduzir Chats Inteiros" locked={true} />
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[15px] text-black">Não Traduzir</span>
                  <span className="text-[13px] font-medium text-[#2481cc]">3 Idiomas</span>
                </div>
              </div>

              {/* Lista de Idiomas */}
              <div className="bg-white rounded-[18px] overflow-hidden shadow-2xs border border-gray-100">
                <div className="px-4 pt-3 pb-1">
                  <span className="text-[13px] font-semibold text-[#2481cc]">Idioma do Aplicativo</span>
                </div>
                <LangRow label="Português (Brasil)" sub="Portuguese (Brazil)" code="pt" available />
                <LangRow label="English" sub="English" code="en" available />
                <LangRow label="Français" sub="French" code="fr" available />
                <LangRow label="العربية" sub="Arabic" code="ar" />
                <LangRow label="简体中文" sub="Chinese (Simplified)" code="zh-hans" />
                <LangRow label="Español" sub="Spanish" code="es" isLast />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PERFIL */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        initialData={{ firstName, lastName, bio: userBio, avatarUrl, phone }}
        totalDeposits={totalDeposits}
        totalWithdrawals={totalWithdrawals}
        comissaoEquipe={comissaoEquipe}
        onSaved={({ firstName: fn, lastName: ln, bio: b, avatarUrl: av }) => {
          setFirstName(fn);
          setLastName(ln);
          setUserName([fn, ln].filter(Boolean).join(" "));
          setUserBio(b);
          setAvatarUrl(av);
        }}
      />

    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   COMPONENTES AUXILIARES
══════════════════════════════════════════════════════════════ */
function SettingsItem({
  icon,
  iconBg,
  title,
  subtitle,
  isLast = false,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  isLast?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className="flex items-center px-4 py-3 hover:bg-gray-50/80 active:bg-gray-100 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className={`w-[32px] h-[32px] rounded-[10px] ${iconBg} flex items-center justify-center shrink-0 mr-3.5 shadow-2xs`}>
        {icon}
      </div>
      <div className={`flex-1 flex flex-col justify-center py-0.5 ${!isLast ? "border-b border-gray-100" : ""}`}>
        <span className="text-[15px] font-medium text-black leading-tight mb-0.5">{title}</span>
        {subtitle && (
          <span className="text-[12.5px] font-normal text-[#8e8e93] leading-tight truncate">
            {subtitle}
          </span>
        )}
      </div>
      {onClick && <ChevronRight className="w-4 h-4 text-[#c7c7cc] shrink-0 ml-2" />}
    </div>
  );
}

function TranslateRow({
  label,
  defaultOn = false,
  locked = false,
}: {
  label: string;
  defaultOn?: boolean;
  locked?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e5e5]">
      <span className="text-[15px] text-black">{label}</span>
      {locked ? (
        <div className="w-[44px] h-[26px] rounded-full bg-gray-200 flex items-center justify-center relative">
          <div className="w-[22px] h-[22px] bg-white rounded-full shadow flex items-center justify-center absolute left-0.5">
            <Lock className="w-3 h-3 text-gray-400" />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOn(!on)}
          className={`w-[44px] h-[26px] rounded-full transition-colors relative cursor-pointer ${
            on ? "bg-[#2481cc]" : "bg-gray-300"
          }`}
        >
          <div
            className={`w-[22px] h-[22px] bg-white rounded-full shadow absolute top-0.5 transition-all ${
              on ? "left-[20px]" : "left-0.5"
            }`}
          />
        </button>
      )}
    </div>
  );
}

function LangRow({
  label,
  sub,
  code,
  available = false,
  isLast = false,
}: {
  label: string;
  sub: string;
  code: string;
  available?: boolean;
  isLast?: boolean;
}) {
  const { language, setLanguage } = useLanguage();
  const isSelected = language === code;
  const handleClick = () => {
    if (available) setLanguage(code as any);
  };
  return (
    <div
      className={`flex items-center px-4 py-3 ${
        !isLast ? "border-b border-[#e5e5e5]" : ""
      } ${available ? "cursor-pointer hover:bg-gray-50 active:bg-gray-100" : "opacity-60 cursor-default"}`}
      onClick={handleClick}
    >
      <div
        className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center mr-3.5 shrink-0 ${
          isSelected ? "border-[#2481cc]" : "border-gray-300"
        }`}
      >
        {isSelected && <div className="w-[10px] h-[10px] rounded-full bg-[#2481cc]" />}
      </div>
      <div className="flex flex-col flex-1">
        <span className="text-[15px] font-medium text-black leading-tight">{label}</span>
        <span className="text-[12.5px] text-[#8e8e93]">{sub}</span>
      </div>
    </div>
  );
}
