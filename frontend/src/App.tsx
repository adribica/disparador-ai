import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Loader2, Play, Square, MessageSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard';
import { ProspectForm } from './components/ProspectForm';

// Puxa a URL pela variável de ambiente (Vercel) ou usa localhost como fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function App() {
    const [activeTab, setActiveTab] = useState<'disparador' | 'extractor' | 'prospector' | 'testador'>('testador');
    // Disparador states
    const [isRunning, setIsRunning] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [baseMessage, setBaseMessage] = useState('Olá! Gostaríamos de apresentar nosso novo produto revolucionário. Dê uma olhada no site que nossa inteligência artificial montou pra você:');
    const [numbersList, setNumbersList] = useState('Pizzaria do Zé, São Paulo, +5511999999999\nClínica Sorriso, Rio de Janeiro, +5521888888888');

    // Prospector states
    const [prospectStatus, setProspectStatus] = useState<'idle' | 'generating' | 'success'>('idle');
    const [loadingText, setLoadingText] = useState('');

    // Testador states
    const [testCompany, setTestCompany] = useState('');
    const [testCity, setTestCity] = useState('');
    const [testNumber, setTestNumber] = useState('5531987425504');
    const [testMessage, setTestMessage] = useState('Dá uma olhada nessa demonstração premium que criamos pra você. O que achou?');
    const [testStatus, setTestStatus] = useState<'idle' | 'generating' | 'success'>('idle');

    // Estado dos Logs e Controle avançado
    const [logs, setLogs] = useState<{ message: string, type: string, timestamp: string }[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const logsEndRef = React.useRef<HTMLDivElement>(null);

    // Escuta logs Server-Sent Events do Backend
    useEffect(() => {
        if (!isRunning) return;

        const eventSource = new EventSource(`${API_BASE_URL}/logs`);

        eventSource.onmessage = (event) => {
            const newLog = JSON.parse(event.data);
            setLogs(prev => [...prev, newLog]);
        };

        eventSource.onerror = () => eventSource.close();

        return () => eventSource.close();
    }, [isRunning]);

    // Auto-scroll nos logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleStartDisparo = async () => {
        const lines = numbersList.split('\n').map(n => n.trim()).filter(n => n.length > 5);

        const leads = lines.map(line => {
            const parts = line.split(',').map(p => p.trim());
            return {
                companyName: parts[0] || 'Empresa',
                city: parts[1] || 'Sua Cidade',
                number: parts[2] || parts[0]
            };
        });

        try {
            setLogs([{ message: 'Iniciando orquestração inteligente de disparo em massa...', type: 'info', timestamp: new Date().toISOString() }]);
            setIsRunning(true);
            setIsPaused(false);
            await axios.post(`${API_BASE_URL}/prospect/bulk`, { baseMessage, leads });
        } catch (error: any) {
            setLogs(prev => [...prev, { message: error?.response?.data?.error || 'Erro ao iniciar', type: 'error', timestamp: new Date().toISOString() }]);
            setIsRunning(false);
        }
    };

    const handleStopDisparo = async () => {
        try {
            await axios.post(`${API_BASE_URL}/stop`);
        } catch (error) { }
    };

    const handlePauseDisparo = async () => {
        try {
            await axios.post(`${API_BASE_URL}/pause`);
            setIsPaused(true);
        } catch (error) { }
    };

    const handleResumeDisparo = async () => {
        try {
            await axios.post(`${API_BASE_URL}/resume`);
            setIsPaused(false);
        } catch (error) { }
    };

    // (Outros handlers permanecem os mesmos)
    // ... no return do component (Aba disparador):
    return (
        <div className={`min-h-screen flex flex-col items-center py-10 transition-colors ${activeTab === 'prospector' ? 'bg-[#F5F5F7] text-[#1d1d1f] selection:bg-blue-500/30' : 'bg-gray-50'}`}>

            {/* Ambient background for Prospector */}
            {activeTab === 'prospector' && (
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-white">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/40 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-slate-100/40 blur-[100px]" />
                </div>
            )}

            <div className={`w-full max-w-5xl z-10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden transition-all ${activeTab === 'prospector' ? 'bg-white/80 border border-gray-200/50 backdrop-blur-xl' : 'bg-white border border-gray-100'}`}>

                {/* Header */}
                <div className={`p-8 relative overflow-hidden transition-all ${activeTab === 'prospector' || activeTab === 'testador' ? 'bg-gradient-to-r from-slate-50 to-white border-b border-gray-100 text-[#1d1d1f]' : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'}`}>
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl backdrop-blur-sm border ${activeTab === 'prospector' || activeTab === 'testador' ? 'bg-blue-50/50 border-blue-100/50' : 'bg-white/10 border-white/20'}`}>
                                {activeTab === 'prospector' ? <Sparkles className="w-8 h-8 text-blue-600" /> : <Send className="w-8 h-8 text-blue-100" />}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {activeTab === 'prospector' ? 'Stitch MCP' : activeTab === 'testador' ? 'Modo de Teste' : 'AntiGravity Disparador'}
                                </h1>
                                <p className={`mt-1 text-sm ${activeTab === 'prospector' || activeTab === 'testador' ? 'text-gray-500' : 'text-blue-100 opacity-90'}`}>
                                    {activeTab === 'prospector' ? 'Automação de Landing Pages' : activeTab === 'testador' ? 'Simulação de Envio Local (Sem Créditos)' : 'Automação Inteligente de WhatsApp com AI'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className={`flex flex-wrap border-b ${activeTab === 'prospector' || activeTab === 'testador' ? 'border-gray-100' : 'border-gray-200'}`}>
                    <button
                        onClick={() => setActiveTab('disparador')}
                        className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'disparador' ? 'border-b-2 border-blue-600 text-blue-600' : activeTab === 'prospector' || activeTab === 'testador' ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <MessageSquare className="w-5 h-5" /> Disparo em Massa
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('testador')}
                        className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'testador' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Send className="w-5 h-5" /> Teste Individual
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('prospector')}
                        className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'prospector' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5" /> Prospector (Old n8n)
                        </div>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {activeTab === 'disparador' && (
                        <div className="space-y-6">

                            {/* Controle Superior */}
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-6 border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-full ${isRunning ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Loader2 className={`w-5 h-5 ${isRunning && !isPaused ? 'animate-spin' : ''}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 border-none m-0 p-0 text-base">Automação de Captura</h3>
                                        <p className="text-sm text-gray-500 m-0">
                                            {isRunning ? (
                                                isPaused ? 'Em pausa de segurança' : 'Rodando extrações e envios em background'
                                            ) : 'Aguardando ação...'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    {!isRunning ? (
                                        <button
                                            onClick={handleStartDisparo}
                                            className="w-full md:w-auto bg-[#1d1d1f] hover:bg-black text-white px-8 py-3 rounded-lg font-medium transition shadow-md flex items-center justify-center gap-2"
                                        >
                                            <Play className="w-4 h-4" /> Start Motor
                                        </button>
                                    ) : (
                                        <>
                                            {isPaused ? (
                                                <button
                                                    onClick={handleResumeDisparo}
                                                    className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2"
                                                >
                                                    <Play className="w-4 h-4" /> Continuar
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handlePauseDisparo}
                                                    className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2"
                                                >
                                                    <Loader2 className="w-4 h-4" /> Pausar
                                                </button>
                                            )}
                                            <button
                                                onClick={handleStopDisparo}
                                                className="w-full md:w-auto bg-red-100 hover:bg-red-200 text-red-700 px-6 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2"
                                            >
                                                <Square className="w-4 h-4" /> Parar
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Formulário de Input Esquerda */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Lista de Contatos
                                        </label>
                                        <textarea
                                            rows={8}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white font-mono text-sm transition-colors"
                                            value={numbersList}
                                            onChange={(e) => setNumbersList(e.target.value)}
                                            disabled={isRunning}
                                            placeholder="Exemplo:\nPizzaria do Zé, São Paulo, +5511999999999"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Mensagem Base / Copy Principal
                                        </label>
                                        <textarea
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white text-sm transition-colors"
                                            rows={4}
                                            value={baseMessage}
                                            onChange={(e) => setBaseMessage(e.target.value)}
                                            disabled={isRunning}
                                        />
                                    </div>
                                </div>
                                {/* Terminal Logs Direita */}
                                <div className="h-full flex flex-col">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex justify-between">
                                        Monitoramento de Execução
                                        <span className="text-xs font-normal text-blue-600">Tempo Real</span>
                                    </label>
                                    <div className="flex-1 min-h-[300px] max-h-[460px] bg-[#1d1d1f] rounded-xl overflow-hidden flex flex-col shadow-inner">
                                        <div className="h-8 bg-[#2d2d2f] border-b border-[#3d3d3f] flex items-center px-4 gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                            <div className="w-3 h-3 rounded-full bg-green-500" />
                                            <span className="ml-2 text-xs text-gray-400 font-mono">logs@vercel-node</span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
                                            {logs.length === 0 && (
                                                <p className="text-gray-500 italic">Aguardando comando de start. Nenhum sistema na esteira rodando.</p>
                                            )}
                                            {logs.map((log, index) => (
                                                <div key={index} className={`leading-relaxed break-words ${log.type === 'error' ? 'text-red-400' :
                                                        log.type === 'success' ? 'text-green-400' :
                                                            log.type === 'warning' ? 'text-yellow-400' :
                                                                'text-gray-300'
                                                    }`}>
                                                    <span className="text-gray-600 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                                    {log.message}
                                                </div>
                                            ))}
                                            <div ref={logsEndRef} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'prospector' && (
                        <div className="w-full grid md:grid-cols-2 gap-8 items-center py-4">
                            {/* Left Side: Presentation */}
                            <div className="space-y-6 md:pr-8">
                                <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] text-[#1d1d1f]">
                                    Prospecção <br />Autônoma.
                                </h2>
                                <p className="text-gray-500 leading-relaxed text-lg">
                                    Nossa IA extrai o design system do cliente, desenha uma nova Landing Page Premium usando <span className="text-[#1d1d1f] font-semibold">Google Stitch</span> e envia a demonstração visual via WhatsApp.
                                </p>

                                <div className="flex flex-col gap-3 pt-4">
                                    {['Análise Semântica (Scraping)', 'Geração de UI (Stitch MCP)', 'Envio Automático (Evolution)'].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3 text-gray-600 font-medium text-sm">
                                            <CheckCircle2 className="w-5 h-5 text-blue-500" />
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
                                        <GlassCard glowColor="rgba(34, 197, 94, 0.05)" className="w-full max-w-md flex flex-col items-center justify-center p-12 text-center border-green-500/20 bg-white/60">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-100"
                                            >
                                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                                            </motion.div>
                                            <h3 className="text-2xl font-bold text-[#1d1d1f] mb-2">Disparado!</h3>
                                            <p className="text-gray-500 text-sm">
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

                    {activeTab === 'testador' && (
                        <div className="max-w-xl mx-auto space-y-6">
                            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start gap-4 text-sm border border-blue-100">
                                <div><Send className="w-5 h-5" /></div>
                                <div>
                                    <p className="font-semibold">Teste o Fluxo Sem Gastar IA (100% Mock Local)</p>
                                    <p className="mt-1 opacity-90">Coloque o nome e cidade de uma empresa abaixo. Nosso backend usará templates locais para gerar o print e enviar *diretamente* ao seu WhatsApp, sem demoras do fluxo em massa.</p>
                                </div>
                            </div>

                            {testStatus === 'success' && (
                                <div className="bg-green-50 text-green-700 p-4 rounded-lg flex flex-col items-center justify-center border border-green-200 shadow-sm animate-fade-in-up">
                                    <CheckCircle2 className="w-8 h-8 mb-2 text-green-500" />
                                    <p className="font-bold">Enviado!</p>
                                    <p className="text-sm">Confira seu WhatsApp.</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Empresa a Simular</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Ex: Padaria Bella Vista"
                                    value={testCompany}
                                    onChange={(e) => setTestCompany(e.target.value)}
                                    disabled={testStatus === 'generating'}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cidade Base</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Ex: São Paulo"
                                        value={testCity}
                                        onChange={(e) => setTestCity(e.target.value)}
                                        disabled={testStatus === 'generating'}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Seu WhatsApp</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="5531..."
                                        value={testNumber}
                                        onChange={(e) => setTestNumber(e.target.value)}
                                        disabled={testStatus === 'generating'}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Mensagem Exemplo</label>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    rows={3}
                                    value={testMessage}
                                    onChange={(e) => setTestMessage(e.target.value)}
                                    disabled={testStatus === 'generating'}
                                />
                            </div>

                            <button
                                onClick={handleSingleTest}
                                disabled={testStatus === 'generating' || !testCompany || !testCity}
                                className="w-full bg-[#1d1d1f] disabled:bg-gray-400 hover:bg-black text-white font-bold py-3.5 px-6 rounded-lg transition-transform active:scale-[0.98] flex justify-center items-center gap-2 shadow-lg"
                            >
                                {testStatus === 'generating' ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Processando Teste...</>
                                ) : (
                                    <><Play className="w-5 h-5" /> Enviar Teste Imediato </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
