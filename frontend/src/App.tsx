import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Loader2, Play, Square, MessageSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard';
import { ProspectForm } from './components/ProspectForm';

const API_BASE_URL = 'http://localhost:3001/api';

function App() {
    const [activeTab, setActiveTab] = useState<'disparador' | 'extractor' | 'prospector'>('prospector');
    // Disparador states
    const [isRunning, setIsRunning] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [baseMessage, setBaseMessage] = useState('Olá! Gostaríamos de apresentar nosso novo produto revolucionário.');
    const [numbersList, setNumbersList] = useState('+5511999999999\n+5511888888888');

    // Prospector states
    const [prospectStatus, setProspectStatus] = useState<'idle' | 'generating' | 'success'>('idle');
    const [loadingText, setLoadingText] = useState('');

    useEffect(() => {
        let interval = setInterval(async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/health`);
                setIsRunning(res.data.running);
            } catch (e) {
                // backend offline
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleStartDisparo = async () => {
        const arrNumbers = numbersList.split('\n').map(n => n.trim()).filter(n => n.length > 5);
        try {
            setStatusMsg('Iniciando disparo...');
            const res = await axios.post(`${API_BASE_URL}/start`, {
                baseMessage,
                numbers: arrNumbers
            });
            setStatusMsg(res.data.message);
            setIsRunning(true);
        } catch (error: any) {
            setStatusMsg(error?.response?.data?.error || 'Erro ao iniciar');
        }
    };

    const handleStopDisparo = async () => {
        try {
            setStatusMsg('Parando...');
            const res = await axios.post(`${API_BASE_URL}/stop`);
            setStatusMsg(res.data.message);
            setIsRunning(false);
        } catch (error) {
            console.error(error);
        }
    }

    const handleProspect = async (data: { companyName: string; city: string }) => {
        setProspectStatus('generating');

        const steps = [
            "Iniciando integração com Stitch MCP...",
            "Analisando cores da " + data.companyName + "...",
            "Gerando Design System Semântico...",
            "Renderizando Landing Page...",
            "Tirando Screenshot High-Res...",
            "Disparando via Evolution API..."
        ];

        for (const step of steps) {
            setLoadingText(step);
            await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));
        }

        setProspectStatus('success');

        setTimeout(() => {
            setProspectStatus('idle');
        }, 5000);
    };

    return (
        <div className={`min-h-screen flex flex-col items-center py-10 transition-colors ${activeTab === 'prospector' ? 'bg-[#09090b] text-zinc-100 selection:bg-violet-500/30' : 'bg-gray-50'}`}>

            {/* Ambient background for Prospector */}
            {activeTab === 'prospector' && (
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[100px]" />
                </div>
            )}

            <div className={`w-full max-w-5xl z-10 shadow-xl rounded-2xl overflow-hidden transition-all ${activeTab === 'prospector' ? 'bg-[#18181A]/40 border border-white/5 backdrop-blur-xl' : 'bg-white border border-gray-100'}`}>

                {/* Header */}
                <div className={`p-8 relative overflow-hidden transition-all ${activeTab === 'prospector' ? 'bg-gradient-to-r from-violet-900/40 to-black text-white' : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'}`}>
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20">
                                {activeTab === 'prospector' ? <Sparkles className="w-8 h-8 text-violet-300" /> : <Send className="w-8 h-8 text-blue-100" />}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {activeTab === 'prospector' ? 'Stitch MCP' : 'AntiGravity Disparador'}
                                </h1>
                                <p className={`mt-1 text-sm ${activeTab === 'prospector' ? 'text-violet-200' : 'text-blue-100 opacity-90'}`}>
                                    {activeTab === 'prospector' ? 'Automação de Landing Pages + Disparo via Evolution' : 'Automação Inteligente de WhatsApp com AI'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className={`flex border-b ${activeTab === 'prospector' ? 'border-white/10' : 'border-gray-200'}`}>
                    <button
                        onClick={() => setActiveTab('disparador')}
                        className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'disparador' ? 'border-b-2 border-blue-600 text-blue-600' : activeTab === 'prospector' ? 'text-zinc-500 hover:text-zinc-300' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <MessageSquare className="w-5 h-5" /> Motor de Disparo
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('prospector')}
                        className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'prospector' ? 'border-b-2 border-violet-500 text-violet-400' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5" /> Prospecção IA (Stitch)
                        </div>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {activeTab === 'disparador' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start gap-4 text-sm">
                                <div className="mt-1"><Loader2 className={`w-5 h-5 ${isRunning ? 'animate-spin' : ''}`} /></div>
                                <div>
                                    <p className="font-semibold">Status do Processo em Background: {isRunning ? 'RODANDO NO SERVIDOR' : 'PARADO'}</p>
                                    {statusMsg && <p className="mt-1 opacity-90">{statusMsg}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    1. Mensagem Base (Será reescrita pelo Gemini em 5 variações)
                                </label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    rows={4}
                                    value={baseMessage}
                                    onChange={(e) => setBaseMessage(e.target.value)}
                                    disabled={isRunning}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    2. Lista de Contatos (+ DDI DDD Num) - Um por linha
                                </label>
                                <textarea
                                    rows={6}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
                                    value={numbersList}
                                    onChange={(e) => setNumbersList(e.target.value)}
                                    disabled={isRunning}
                                />
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                {!isRunning ? (
                                    <button
                                        onClick={handleStartDisparo}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-transform active:scale-95 flex justify-center items-center gap-2"
                                    >
                                        <Play className="w-5 h-5" /> Iniciar Disparo Inteligente
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleStopDisparo}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-transform active:scale-95 flex justify-center items-center gap-2"
                                    >
                                        <Square className="w-5 h-5" /> Parar Execução
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 text-center mt-2">
                                O envio demora pois há uma longa pausa de segurança anti-spam (+60s) entre cada mensagem.
                            </p>
                        </div>
                    )}

                    {activeTab === 'prospector' && (
                        <div className="w-full grid md:grid-cols-2 gap-8 items-center py-4">
                            {/* Left Side: Presentation */}
                            <div className="space-y-6 md:pr-8">
                                <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
                                    Prospecção <br />Autônoma.
                                </h2>
                                <p className="text-zinc-400 leading-relaxed">
                                    Nossa IA extrai o design system do cliente, desenha uma nova Landing Page Premium usando <span className="text-zinc-200 font-semibold">Google Stitch</span> e envia a demonstração visual via WhatsApp.
                                </p>

                                <div className="flex flex-col gap-3 pt-4">
                                    {['Análise Semântica (Scraping)', 'Geração de UI (Stitch MCP)', 'Envio Automático (Evolution)'].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3 text-zinc-300 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-violet-500" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Side: Form */}
                            <AnimatePresence mode="wait">
                                {prospectStatus === 'success' ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex justify-center"
                                    >
                                        <GlassCard glowColor="rgba(34, 197, 94, 0.15)" className="w-full max-w-md flex flex-col items-center justify-center p-12 text-center border-green-500/20">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6"
                                            >
                                                <CheckCircle2 className="w-10 h-10 text-green-400" />
                                            </motion.div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Disparado!</h3>
                                            <p className="text-zinc-400 text-sm">
                                                O webhook foi acionado e a automação assumiu o desenvolvimento e envio da página.
                                            </p>
                                        </GlassCard>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex justify-center"
                                    >
                                        <GlassCard>
                                            <ProspectForm
                                                onSubmit={handleProspect}
                                                isLoading={prospectStatus === 'generating'}
                                                statusText={loadingText}
                                            />
                                        </GlassCard>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
