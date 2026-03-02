import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    glowColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = "",
    glowColor = "rgba(139, 92, 246, 0.15)", // Default Electric Violet glow
    ...props
}) => {
    return (
        <motion.div
            className={`relative rounded-2xl border border-white/10 bg-[#18181A]/60 backdrop-blur-xl overflow-hidden shadow-2xl ${className}`}
            {...props}
        >
            {/* Subtle ambient glow behind the card */}
            <div
                className="absolute -inset-[100px] opacity-50 blur-[80px] rounded-full pointer-events-none"
                style={{
                    background: `radial-gradient(circle at 50% 0%, ${glowColor}, transparent 70%)`
                }}
            />

            {/* Content wrapper to ensure it stays above the glow */}
            <div className="relative z-10 w-full h-full p-8">
                {children}
            </div>

            {/* Subtle top highlight for extra 3D feel */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        </motion.div>
    );
};
