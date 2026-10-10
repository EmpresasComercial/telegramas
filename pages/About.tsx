import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Apple } from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-white text-[#222222] font-sans antialiased pb-28 select-none">
      <style>{`
        @keyframes duckBounce {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.02); }
        }
        @keyframes duckWiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-4deg); }
          75% { transform: rotate(4deg); }
        }
        @keyframes duckFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        .duck-bounce { animation: duckBounce 2.6s ease-in-out infinite; }
        .duck-wiggle { animation: duckWiggle 3s ease-in-out infinite; }
        .duck-float { animation: duckFloat 3.2s ease-in-out infinite; }
      `}</style>

      {/* ── HEADER TELEGRAM ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-[17px] font-bold text-[#222222] tracking-tight">
              Telegram
            </h1>
          </div>
        </div>
      </header>

      {/* ── CONTEÚDO PRINCIPAL (SEM CARDS / SEM CONTAINERS ARTIFICIAIS) ── */}
      <main className="max-w-[860px] mx-auto px-4 pt-8 space-y-16">

        {/* 1. MOCKUPS MOBILE (DIRETO NA PÁGINA) */}
        <section className="text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-6 mb-4">
            <img
              src="/SiteAndroid_2x.webp"
              alt="Telegram para Android"
              className="w-[140px] sm:w-[220px] h-auto object-contain pointer-events-none select-none hover:scale-105 transition-transform duration-300"
            />
            <img
              src="/SiteiOS_2x.webp"
              alt="Telegram para iPhone / iPad"
              className="w-[140px] sm:w-[220px] h-auto object-contain pointer-events-none select-none hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 pt-1 text-[15px]">
            <a
              href="https://telegram.org/android"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#168acd] hover:text-[#0d699e] transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-1.0002s.4482-1.0002.9993-1.0002c.552 0 1.0001.4486 1.0001 1.0002 0 .5516-.4481 1.0002-1.0001 1.0002m-11.046 0c-.5511 0-.9993-.4486-.9993-1.0002s.4482-1.0002.9993-1.0002c.552 0 1.0001.4486 1.0001 1.0002 0 .5516-.4481 1.0002-1.0001 1.0002m11.4045-6.02l1.996-3.4572c.1082-.1874.0441-.4275-.1433-.5357-.1874-.1082-.4276-.044-.5358.1433l-2.0226 3.5033C15.5398 8.4239 13.8247 8.099 12 8.099c-1.8247 0-3.5398.3249-5.1758.876L4.8016 5.4717c-.1082-.1873-.3484-.2515-.5358-.1433-.1874.1082-.2515.3483-.1433.5357l1.996 3.4572C2.6889 11.2867.3466 15.0113 0 19.467h24c-.3466-4.4557-2.6889-8.1803-6.1185-10.1456"/>
              </svg>
              <span>Telegram para <b className="font-bold">Android</b></span>
            </a>

            <a
              href="https://telegram.org/dl/ios"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#168acd] hover:text-[#0d699e] transition-colors"
            >
              <Apple className="w-4 h-4 fill-current" />
              <span>Telegram para <b className="font-bold">iPhone</b> / <b className="font-bold">iPad</b></span>
            </a>
          </div>
        </section>

        {/* 2. MOCKUPS DESKTOP (DIRETO NA PÁGINA) */}
        <section className="text-center pt-2">
          <div className="flex justify-center mb-4">
            <img
              src="/SiteDesktop_2x.webp"
              alt="Telegram Desktop"
              className="w-full max-w-[580px] h-auto object-contain pointer-events-none select-none hover:scale-[1.02] transition-transform duration-300"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 pt-1 text-[15px]">
            <a
              href="https://desktop.telegram.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#168acd] hover:text-[#0d699e] transition-colors"
            >
              Telegram para <b className="font-bold">PC / Linux</b>
            </a>
            <a
              href="https://macos.telegram.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#168acd] hover:text-[#0d699e] transition-colors"
            >
              Telegram para <b className="font-bold">macOS</b>
            </a>
          </div>
        </section>

        {/* 3. NOVIDADES (DIRETO NA PÁGINA COM IMAGENS OFICIAIS) */}
        <section className="pt-4">
          <div className="text-center mb-8">
            <h2 className="text-[28px] font-bold text-[#168acd]">
              <a href="https://telegram.org/blog" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Novidades
              </a>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
            {/* Card 1 com a imagem oficial 0e567958d5b96a2184.webp */}
            <div className="flex flex-col text-left group">
              <a href="https://telegram.org/blog/welcome-messages-buttons-TG-13/pt-br" target="_blank" rel="noopener noreferrer">
                <img
                  src="/0e567958d5b96a2184.webp"
                  alt="Mensagens de Boas-Vindas"
                  className="w-full h-auto rounded-3xl object-cover hover:opacity-95 transition-opacity"
                />
              </a>
              <h3 className="text-[17px] font-bold text-[#168acd] hover:underline mt-4 cursor-pointer leading-snug">
                <a href="https://telegram.org/blog/welcome-messages-buttons-TG-13/pt-br" target="_blank" rel="noopener noreferrer">
                  Mensagens de Boas-Vindas, Botões nas Mensagens e Presentes Assinados
                </a>
              </h3>
              <p className="text-[14px] text-[#444444] mt-2 leading-relaxed">
                Apresentamos as Mensagens de Boas-Vindas para saudar novos membros dos grupos ou canais, os Botões nas Mensagens para links interativos e mais.
              </p>
              <span className="text-[12px] text-gray-400 mt-2 block">
                15 de ago de 2026
              </span>
            </div>

            {/* Card 2 com a imagem oficial 6a362dadee6e7e6011.webp */}
            <div className="flex flex-col text-left group">
              <a href="https://telegram.org/blog/communities-editor-invisible-messages/pt-br" target="_blank" rel="noopener noreferrer">
                <img
                  src="/6a362dadee6e7e6011.webp"
                  alt="Editor de Texto Formatado e Comunidades"
                  className="w-full h-auto rounded-3xl object-cover hover:opacity-95 transition-opacity"
                />
              </a>
              <h3 className="text-[17px] font-bold text-[#168acd] hover:underline mt-4 cursor-pointer leading-snug">
                <a href="https://telegram.org/blog/communities-editor-invisible-messages/pt-br" target="_blank" rel="noopener noreferrer">
                  Editor de Texto Formatado, Comunidades, Mensagens Efêmeras em Grupos, 550 Milhões de GIFs
                </a>
              </h3>
              <p className="text-[14px] text-[#444444] mt-2 leading-relaxed">
                Apresentando o Editor de Texto Formatado para formatar mensagens com facilidade, as Comunidades do Telegram com tópicos organizados e suporte a 550 Milhões de GIFs.
              </p>
              <span className="text-[12px] text-gray-400 mt-2 block">
                14 de jul de 2026
              </span>
            </div>
          </div>
        </section>

        {/* 4. POR QUE O TELEGRAM? (9 PATOS OFICIAIS COM ANIMAÇÃO, SEM BORDAS/CARDS) */}
        <section className="pt-6">
          <div className="text-center mb-10">
            <h2 className="text-[28px] font-bold text-[#222222]">
              Por que o Telegram?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-8 text-center">

            {/* 1. SIMPLES */}
            <div className="flex flex-col items-center group">
              <div className="w-24 h-24 mb-3 flex items-center justify-center duck-bounce">
                <img
                  src="/tg_duck_simples.png"
                  alt="Simples"
                  className="w-20 h-20 object-contain hover:scale-110 active:scale-95 transition-transform duration-300"
                />
              </div>
              <h3 className="text-[17px] font-bold text-[#168acd] mb-1">
                Simples
              </h3>
              <p className="text-[13.5px] text-[#555555] leading-relaxed max-w-[220px]">
                O <b className="font-semibold text-gray-900">Telegram</b> é tão simples que você já sabe como usar.
              </p>
            </div>

            {/* 2. PRIVADO */}
            <div className="flex flex-col items-center group">
              <div className="w-24 h-24 mb-3 flex items-center justify-center duck-wiggle">
                <img
                  src="/tg_duck_privado.png"
                  alt="Privado"
                  className="w-20 h-20 object-contain hover:scale-110 active:scale-95 transition-transform duration-300"
                />
              </div>
              <h3 className="text-[17px] font-bold text-[#168acd] mb-1">
                Privado
              </h3>
              <p className="text-[13.5px] text-[#555555] leading-relaxed max-w-[220px]">
                Mensagens no <b className="font-semibold text-gray-900">Telegram</b> têm forte criptografia e podem autodestruir.
              </p>
            </div>

            {/* 3. SINCRONIZADO */}
            <div className="flex flex-col items-center group">
              <div className="w-24 h-24 mb-3 flex items-center justify-center duck-float">
                <img
                  src="/tg_duck_sincronizado.png"
                  alt="Sincronizado"
                  className="w-20 h-20 object-contain hover:scale-110 active:scale-95 transition-transform duration-300"
                />
              </div>
              <h3 className="text-[17px] font-bold text-[#168acd] mb-1">
                Sincronizado
              </h3>
              <p className="text-[13.5px] text-[#555555] leading-relaxed max-w-[220px]">
                O <b className="font-semibold text-gray-900">Telegram</b> te permite acessar seus chats com vários dispositivos.
              </p>
            </div>

            {/* 4. RÁPIDO */}
            <div className="flex flex-col items-center group">
              <div className="w-24 h-24 mb-3 flex items-center justify-center duck-bounce">
                <img
                  src="/tg_duck_rapido.png"
                  alt="Rápido"
                  className="w-20 h-20 object-contain hover:scale-110 active:scale-95 transition-transform duration-300"
                />
              </div>
              <h3 className="text-[17px] font-bold text-[#168acd] mb-1">
                Rápido
              </h3>
              <p className="text-[13.5px] text-[#555555] leading-relaxed max-w-[220px]">
                O <b className="font-semibold text-gray-900">Telegram</b> entrega as mensagens mais rápido que qualquer app.
              </p>
            </div>

            {/* 5. PODEROSO */}
            <div className="flex flex-col items-center group">
              <div className="w-24 h-24 mb-3 flex items-center justify-center duck-wiggle">
                <img
                  src="/tg_duck_poderoso.png"
                  alt="Poderoso"
                  className="w-20 h-20 object-contain hover:scale-110 active:scale-95 transition-transform duration-300"
                />
              </div>
              <h3 className="text-[17px] font-bold text-[#168acd] mb-1">
                Poderoso
              </h3>
              <p className="text-[13.5px] text-[#555555] leading-relaxed max-w-[220px]">
                O <b className="font-semibold text-gray-900">Telegram</b> não tem limites para o tamanho das suas mídias e chats.
              </p>
            </div>

            {/* 6. ABERTO */}
            <div className="flex flex-col items-center group">
              <div className="w-24 h-24 mb-3 flex items-center justify-center duck-float">
                <img
                  src="/tg_duck_aberto.png"
                  alt="Aberto"
                  className="w-20 h-20 object-contain hover:scale-110 active:scale-95 transition-transform duration-300"
                />
              </div>
              <h3 className="text-[17px] font-bold text-[#168acd] mb-1">
                Aberto
              </h3>
              <p className="text-[13.5px] text-[#555555] leading-relaxed max-w-[220px]">
                O <b className="font-semibold text-gray-900">Telegram</b> tem uma <a href="https://core.telegram.org/api" target="_blank" rel="noopener noreferrer" className="text-[#168acd] hover:underline">API</a> aberta e código-fonte livre para todos.
              </p>
            </div>

            {/* 7. SEGURO */}
            <div className="flex flex-col items-center group">
              <div className="w-24 h-24 mb-3 flex items-center justify-center duck-bounce">
                <img
                  src="/tg_duck_seguro.png"
                  alt="Seguro"
                  className="w-20 h-20 object-contain hover:scale-110 active:scale-95 transition-transform duration-300"
                />
              </div>
              <h3 className="text-[17px] font-bold text-[#168acd] mb-1">
                Seguro
              </h3>
              <p className="text-[13.5px] text-[#555555] leading-relaxed max-w-[220px]">
                O <b className="font-semibold text-gray-900">Telegram</b> protege as mensagens contra ataques de hackers.
              </p>
            </div>

            {/* 8. SOCIAL */}
            <div className="flex flex-col items-center group">
              <div className="w-24 h-24 mb-3 flex items-center justify-center duck-wiggle">
                <img
                  src="/tg_duck_social.png"
                  alt="Social"
                  className="w-20 h-20 object-contain hover:scale-110 active:scale-95 transition-transform duration-300"
                />
              </div>
              <h3 className="text-[17px] font-bold text-[#168acd] mb-1">
                Social
              </h3>
              <p className="text-[13.5px] text-[#555555] leading-relaxed max-w-[220px]">
                O <b className="font-semibold text-gray-900">Telegram</b> suporta grupos de até 200.000 membros.
              </p>
            </div>

            {/* 9. EXPRESSIVO */}
            <div className="flex flex-col items-center group">
              <div className="w-24 h-24 mb-3 flex items-center justify-center duck-float">
                <img
                  src="/tg_duck_expressivo.png"
                  alt="Expressivo"
                  className="w-20 h-20 object-contain hover:scale-110 active:scale-95 transition-transform duration-300"
                />
              </div>
              <h3 className="text-[17px] font-bold text-[#168acd] mb-1">
                Expressivo
              </h3>
              <p className="text-[13.5px] text-[#555555] leading-relaxed max-w-[220px]">
                O <b className="font-semibold text-gray-900">Telegram</b> permite que você personalize o app por completo.
              </p>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
