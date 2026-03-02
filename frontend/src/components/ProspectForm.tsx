import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Building2, MapPin, ArrowRight, Loader } from 'lucide-react';

interface ProspectData {
    companyName: string;
    city: string;
}

interface ProspectFormProps {
    onSubmit: (data: ProspectData) => Promise<void>;
    isLoading: boolean;
    statusText: string;
}

export const ProspectForm: React.FC<ProspectFormProps> = ({ onSubmit, isLoading, statusText }) => {
    const [formData, setFormData] = useState<ProspectData>({
        companyName: '',
        city: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.companyName || !formData.city) return;
        onSubmit(formData);
    };

    return (
        <div className="w-full max-w-md">
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center p-3 mb-4 rounded-xl bg-white/5 border border-white/10 ring-1 ring-white/5 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                    <Sparkles className="w-6 h-6 text-violet-500" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                    Nova Prospecção
                </h2>
                <p className="text-zinc-400 text-sm">
                    Insira os dados do lead para gerar uma landing page baseada em inteligência artificial.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label htmlFor="companyName" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                        Nome do Comércio
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                            <Building2 className="w-4 h-4 text-zinc-500 group-focus-within:text-violet-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            id="companyName"
                            disabled={isLoading}
                            value={formData.companyName}
                            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                            className="w-full bg-[#18181a] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all disabled:opacity-50"
                            placeholder="Ex: Pizzaria do Zé"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="city" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                        Cidade e Estado
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                            <MapPin className="w-4 h-4 text-zinc-500 group-focus-within:text-violet-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            id="city"
                            disabled={isLoading}
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full bg-[#18181a] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all disabled:opacity-50"
                            placeholder="Ex: São Paulo, SP"
                            required
                        />
                    </div>
                </div>

                <motion.button
                    type="submit"
                    disabled={isLoading || !formData.companyName || !formData.city}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full overflow-hidden rounded-xl bg-violet-600 text-white font-medium py-3.5 mt-8 disabled:opacity-70 disabled:cursor-not-allowed group transition-all hover:bg-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                >
                    {/* Subtle gradient overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                    <div className="relative flex items-center justify-center gap-2">
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-2"
                                >
                                    <Loader className="w-5 h-5 animate-spin" />
                                    <span>{statusText || "Gerando Site..."}</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="flex items-center gap-2"
                                >
                                    <span>Iniciar Geração Automática</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.button>
            </form>
        </div>
    );
};
