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
                <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-blue-50 border border-blue-100 shadow-sm">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-[#1d1d1f] mb-2">
                    Nova Prospecção
                </h2>
                <p className="text-gray-500 text-sm">
                    Insira os dados do lead para gerar uma landing page baseada em inteligência artificial.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="companyName" className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                        Nome do Comércio
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                            <Building2 className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            id="companyName"
                            disabled={isLoading}
                            value={formData.companyName}
                            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                            className="w-full bg-[#f5f5f7] border border-transparent rounded-2xl py-3.5 pl-11 pr-4 text-[#1d1d1f] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                            placeholder="Ex: Pizzaria do Zé"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                        Cidade e Estado
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                            <MapPin className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            id="city"
                            disabled={isLoading}
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full bg-[#f5f5f7] border border-transparent rounded-2xl py-3.5 pl-11 pr-4 text-[#1d1d1f] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
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
                    className="relative w-full overflow-hidden rounded-full bg-blue-600 text-white font-medium py-4 mt-8 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:bg-blue-500 group"
                >
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
