import React, { useState, useEffect } from 'react';
import { 
  Trophy, Swords, BookOpen, LogOut, FileText, PenTool, 
  CheckSquare, Square, TrendingUp, Calendar, Shield, ShieldAlert, Plus, X, Eye, Trash2, Settings,
  Crown, Scroll, Sparkles
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';
import { cbTasksContent } from './data/cbTasksContent';
import { cbTasksPages } from './data/cbTasksPages';
import { vnTasksPages } from './data/vnTasksPages';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'motion/react';
import { DragonIcon, KnightIcon, CrestLogo, BabyDragonIcon } from './components/Icons';

// --- MASCOT COMPONENT ---
const DragonMascot = () => {
  const [pos, setPos] = useState({ x: 50, y: 80 });
  const [isBreathingFire, setIsBreathingFire] = useState(false);
  const [isBeingPetted, setIsBeingPetted] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left

  useEffect(() => {
    const moveInterval = setInterval(() => {
      if (isBeingPetted || isBreathingFire) return;

      setPos(prev => {
        const nextX = Math.max(10, Math.min(90, prev.x + (Math.random() - 0.5) * 20));
        const nextY = Math.max(10, Math.min(90, prev.y + (Math.random() - 0.5) * 20));
        if (nextX > prev.x) setDirection(1);
        else if (nextX < prev.x) setDirection(-1);
        return { x: nextX, y: nextY };
      });

      // Occasionally breathe fire
      if (Math.random() > 0.7) {
        setIsBreathingFire(true);
        setTimeout(() => setIsBreathingFire(false), 2000);
      }
    }, 3000);

    return () => clearInterval(moveInterval);
  }, [isBeingPetted, isBreathingFire]);

  const handlePet = () => {
    setIsBeingPetted(true);
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
    setTimeout(() => setIsBeingPetted(false), 2000);
  };

  return (
    <motion.div
      className="fixed z-[5000] cursor-pointer pointer-events-auto"
      animate={{ 
        left: `${pos.x}%`, 
        top: `${pos.y}%`,
        scale: isBeingPetted ? 1.2 : 1
      }}
      transition={{ duration: 2, ease: "easeInOut" }}
      onClick={handlePet}
    >
      <div className="relative group">
        {/* Fire Breath Effect */}
        <AnimatePresence>
          {isBreathingFire && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -left-8 top-4 w-12 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full blur-sm"
              style={{ transform: direction === 1 ? 'scaleX(1)' : 'scaleX(-1)' }}
            />
          )}
        </AnimatePresence>

        {/* Petting Hearts */}
        <AnimatePresence>
          {isBeingPetted && (
            <motion.div
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -40, opacity: [0, 1, 0] }}
              className="absolute -top-8 left-4 text-red-500"
            >
              ❤️
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          animate={{ 
            rotate: isBeingPetted ? [0, -10, 10, 0] : [0, 2, -2, 0],
            y: [0, -5, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: isBeingPetted ? 0.3 : 2 
          }}
          style={{ transform: `scaleX(${direction})` }}
        >
          <BabyDragonIcon className="w-16 h-16 text-[#84cc16] drop-shadow-[0_0_15px_rgba(132,204,22,0.6)]" />
        </motion.div>

        {/* Interaction Prompt */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
          Me dê carinho!
        </div>
      </div>
    </motion.div>
  );
};
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// --- MOCK DATA ---
const weeklySchedule = [
  { time: '1h', days: ['Conhecimentos Bancários', 'Conhecimentos Bancários', 'Conhecimentos Bancários', 'Conhecimentos Bancários', 'Conhecimentos Bancários', 'Conhecimentos Bancários', 'Conhecimentos Bancários'] },
  { time: '1h', days: ['Vendas e Negociação', 'Vendas e Negociação', 'Vendas e Negociação', 'Vendas e Negociação', 'Vendas e Negociação', 'Vendas e Negociação', 'Vendas e Negociação'] },
  { time: '1h', days: ['Rev. Mat. Estudadas', 'Rev. Mat. Estudadas', 'Rev. Mat. Estudadas', 'Rev. Mat. Estudadas', 'Rev. Mat. Estudadas', 'Rev. Mat. Estudadas', 'Rev. Mat. Estudadas'] },
];

const battleTable = [
  { subject: 'Conhecimentos Bancários', conquest: '0/7', progress: 0 },
  { subject: 'Vendas e Negociação', conquest: '1/7', progress: 14 },
  { subject: 'Rev. Mat. Estudadas', conquest: '0/7', progress: 0 },
];

const weeklyHistory = [
  { date: '16/03 - 22/03', cycles: '7/21 ciclos', progress: 33 },
  { date: '09/03 - 15/03', cycles: '18/21 ciclos', progress: 86 },
  { date: '02/03 - 08/03', cycles: '2/21 ciclos', progress: 10 },
];

const subjectTasks: Record<string, { id: string, title: string }[]> = {
  'Conhecimentos Bancários': [
    { id: 'cb_1', title: 'Dia 1: TAREFA 1 – Estudo da Aula 00 (toda a teoria) + resolver 12 questões' },
    { id: 'cb_2', title: 'Dia 2: TAREFA 2 – Revisão da Aula 00 + resolver questões 13 a 43' },
    { id: 'cb_3', title: 'Dia 3: TAREFA 3 – 20 questões do Estratégia Questões (Aula 00 – SFN)' },
    { id: 'cb_4', title: 'Dia 4: TAREFA 4 – Estudo da Aula 01 (toda a teoria) + 12 questões' },
    { id: 'cb_5', title: 'Dia 5: TAREFA 5 – Revisão da Aula 01 + questões 13 a 44' },
    { id: 'cb_6', title: 'Dia 6: TAREFA 6 – 20 questões do Estratégia Questões (Aula 01)' },
    { id: 'cb_7', title: 'Dia 7: TAREFA 7 – Estudo da Aula 02 (toda a teoria) + 6 questões' },
    { id: 'cb_8', title: 'Dia 8: TAREFA 8 – Revisão da Aula 02 + questões 7 a 21' },
    { id: 'cb_9', title: 'Dia 9: TAREFA 9 – 18–20 questões do Estratégia Questões (Aula 02)' },
    { id: 'cb_10', title: 'Dia 10: TAREFA 10 – Estudo da Aula 03 (“Cartões” até “Investimentos”)' },
    { id: 'cb_11', title: 'Dia 11: TAREFA 11 – Estudo da Aula 03 (“Sistema Nacional de Seguros Privados” até fim da teoria)' },
    { id: 'cb_12', title: 'Dia 12: TAREFA 12 – Revisão da Aula 03 + questões 1 a 24' },
    { id: 'cb_13', title: 'Dia 13: TAREFA 13 – Questões 25 a 62 da Aula 03' },
    { id: 'cb_14', title: 'Dia 14: TAREFA 14 – 15–20 questões do Estratégia Questões (Produtos Bancários – Aula 03)' },
    { id: 'cb_15', title: 'Dia 15: TAREFA 15 – Estudo da Aula 04 (toda a teoria)' },
    { id: 'cb_16', title: 'Dia 16: TAREFA 16 – Revisão da Aula 04 + questões 1 a 32' },
    { id: 'cb_17', title: 'Dia 17: TAREFA 17 – 20 questões do Estratégia Questões (Aula 04 – Mercado de Capitais)' },
    { id: 'cb_18', title: 'Dia 18: TAREFA 18 – Estudo da Aula 05 (toda a teoria) + questões 1 a 10' },
    { id: 'cb_19', title: 'Dia 19: TAREFA 19 – Revisão da Aula 05 + questões 11 a 38' },
    { id: 'cb_20', title: 'Dia 20: TAREFA 20 – 14 questões do Estratégia Questões (Aula 05 – Câmbio)' },
    { id: 'cb_21', title: 'Dia 21: TAREFA 21 – Estudo da Aula 06 (toda a teoria) + 4 questões' },
    { id: 'cb_22', title: 'Dia 22: TAREFA 22 – Revisão da Aula 06 + questões 5 a 12' },
    { id: 'cb_23', title: 'Dia 23: TAREFA 23 – Estudo da Aula 07 (toda a teoria) + 10 questões' },
    { id: 'cb_24', title: 'Dia 24: TAREFA 24 – Revisão da Aula 07 + questões 11 a 23' },
    { id: 'cb_25', title: 'Dia 25: TAREFA 25 – 15 questões do Estratégia Questões (Garantias – Aula 07)' },
    { id: 'cb_26', title: 'Dia 26: TAREFA 26 – Estudo da Aula 08 (toda a teoria)' },
    { id: 'cb_27', title: 'Dia 27: TAREFA 27 – Revisão da Aula 08 + questões 1 a 29' },
    { id: 'cb_28', title: 'Dia 28: TAREFA 28 – 20 questões do Estratégia Questões (Aula 08 – PLD/FT)' },
    { id: 'cb_29', title: 'Dia 29: TAREFA 29 – Estudo da Aula 09 (toda a teoria) + 9 questões' },
    { id: 'cb_30', title: 'Dia 30: TAREFA 30 – Revisão da Aula 09 + questões 10 a 20' },
    { id: 'cb_31', title: 'Dia 31: TAREFA 31 – 15 questões do Estratégia Questões (Aula 09 – Autorregulação)' },
    { id: 'cb_32', title: 'Dia 32: TAREFA 32 – Estudo integral da Aula 10 + questões 1 a 3' },
    { id: 'cb_33', title: 'Dia 33: TAREFA 33 – Revisão da Aula 10 + questões 4 a 14 + 11 questões do SQ' },
    { id: 'cb_34', title: 'Dia 34: TAREFA 34 – Estudo da Aula 11 (toda a teoria LGPD) + questões 1 a 7' },
    { id: 'cb_35', title: 'Dia 35: TAREFA 35 – Revisão da Aula 11 + questões 8 a 17 + 24 questões do SQ' },
    { id: 'cb_36', title: 'Dia 36: TAREFA 36 – Estudo da Aula 12 (Lei Anticorrupção + Decreto)' },
    { id: 'cb_37', title: 'Dia 37: TAREFA 37 – Revisão da Aula 12 + questões 1 a 17 + 9 questões do SQ' },
    { id: 'cb_38', title: 'Dia 38: TAREFA 38 – Estudo da Aula 13 (Res. 4.893/2021) + questões 1 e 2' },
    { id: 'cb_39', title: 'Dia 39: TAREFA 39 – Revisão da Aula 13 + questões 3 a 11' },
    { id: 'cb_40', title: 'Dia 40: TAREFA 40 – Estudo da Aula 14 (toda a teoria) + questões 1 a 20' },
    { id: 'cb_41', title: 'Dia 41: TAREFA 41 – Leitura do Resumo da Aula 14 + questões 21 a 50' },
    { id: 'cb_42', title: 'Dia 42: TAREFA 42 – Questões 51 a 100 da Aula 14' },
    { id: 'cb_43', title: 'Dia 43: TAREFA 43 – Estudo da Aula 16 (Código de Ética do BB)' },
    { id: 'cb_44', title: 'Dia 44: TAREFA 44 – 18 questões da Aula 16' },
    { id: 'cb_45', title: 'Dia 45: TAREFA 45 – Estudo da Aula 17 (PRSAC) + questões 1 a 4' },
    { id: 'cb_46', title: 'Dia 46: TAREFA 46 – Revisão da Aula 17 + 10 questões do caderno indicado' },
    { id: 'cb_47', title: 'Dia 47: TAREFA 47 – Revisão Geral Parte I – 50 questões inéditas C/E (caderno do link)' },
    { id: 'cb_48', title: 'Dia 48: TAREFA 48 – Revisão Geral Parte II – 24 questões Cesgranrio 2021 BB' },
  ],
  'Vendas e Negociação': [
    { id: 'vn_1', title: 'Dia 1: TAREFA 1 – Estudo da teoria da aula 01' },
    { id: 'vn_2', title: 'Dia 2: TAREFA 2 – Questões 1 a 32 da aula 01 + revisão/resumo estratégico' },
    { id: 'vn_3', title: 'Dia 3: TAREFA 3 – Estudo da teoria da aula 02 (até “Cadeia de Valor”)' },
    { id: 'vn_4', title: 'Dia 4: TAREFA 4 – Teoria da aula 02 (“Elaboração do Plano de Ação” até o fim) + questões 1 a 20' },
    { id: 'vn_5', title: 'Dia 5: TAREFA 5 – Questões 21 a 50 da aula 02 + revisão/resumo estratégico' },
    { id: 'vn_6', title: 'Dia 6: TAREFA 6 – Estudo da teoria da aula 03 + questões 1 a 10' },
    { id: 'vn_7', title: 'Dia 7: TAREFA 7 – Questões 11 a 33 da aula 03 + revisão/resumo estratégico' },
    { id: 'vn_8', title: 'Dia 8: TAREFA 8 – Estudo da teoria da aula 04 (início até “Proatividade”)' },
    { id: 'vn_9', title: 'Dia 9: TAREFA 9 – Teoria da aula 04 (“SERVQUAL” até o fim) + questões comentadas' },
    { id: 'vn_10', title: 'Dia 10: TAREFA 10 – Revisão da aula 04 (resumo estratégico ou seus resumos)' },
    { id: 'vn_11', title: 'Dia 11: TAREFA 11 – 52 questões da aula 05 (somente pares) + revisão da aula 05' },
    { id: 'vn_12', title: 'Dia 12: TAREFA 12 – Teoria da aula 06 (até “Capital Intelectual”)' },
    { id: 'vn_13', title: 'Dia 13: TAREFA 13 – Teoria da aula 06 (“Gestão do Conhecimento em Organizações Públicas” até o fim) + questões 1 a 10' },
    { id: 'vn_14', title: 'Dia 14: TAREFA 14 – Questões 11 a 37 da aula 06 + revisão/resumo estratégico' },
    { id: 'vn_15', title: 'Dia 15: TAREFA 15 – Teoria da aula 07 (até “Desafios em Sustentabilidade”)' },
    { id: 'vn_16', title: 'Dia 16: TAREFA 16 – Teoria da aula 07 (do tópico “Relações entre Desafios, Indicadores e ODS” até o fim) + 17 questões' },
    { id: 'vn_17', title: 'Dia 17: TAREFA 17 – 17 questões da aula 07 + revisão/resumo estratégico' },
    { id: 'vn_18', title: 'Dia 18: TAREFA 18 – Teoria da aula 08 (“O que é Administração?” até “Diferenças entre Vendas e Marketing”)' },
    { id: 'vn_19', title: 'Dia 19: TAREFA 19 – Teoria da aula 08 (“Planejamento da Força de Vendas” até “Remuneração da Força de Vendas”)' },
    { id: 'vn_20', title: 'Dia 20: TAREFA 20 – Teoria da aula 08 (“Direção da Força de Vendas” até o fim)' },
    { id: 'vn_21', title: 'Dia 21: TAREFA 21 – Questões 01 a 74 (somente pares) da aula 09 + revisão da aula 08' },
    { id: 'vn_22', title: 'Dia 22: TAREFA 22 – Estudo da teoria da aula 10 (Negociação)' },
    { id: 'vn_23', title: 'Dia 23: TAREFA 23 – 18 questões da aula 10 + revisão/resumo estratégico' },
    { id: 'vn_24', title: 'Dia 24: TAREFA 24 – Teoria da aula 11 (“Visão Geral do Marketing” até “SOAR”)' },
    { id: 'vn_25', title: 'Dia 25: TAREFA 25 – Teoria da aula 11 (“Noções de Marketing Digital” até “Dimensões de Valor”)' },
    { id: 'vn_26', title: 'Dia 26: TAREFA 26 – Teoria da aula 11 (“Marketing de Relacionamento e Retenção de Clientes” até o fim)' },
    { id: 'vn_27', title: 'Dia 27: TAREFA 27 – Questões 01 a 37 da aula 12' },
    { id: 'vn_28', title: 'Dia 28: TAREFA 28 – Questões 38 a 74 da aula 12 + revisão da aula 11' },
    { id: 'vn_29', title: 'Dia 29: TAREFA 29 – Estudo da teoria da aula 13' },
    { id: 'vn_30', title: 'Dia 30: TAREFA 30 – 24 questões da aula 13 + revisão/resumo estratégico' },
    { id: 'vn_31', title: 'Dia 31: TAREFA 31 – Teoria da aula 14 + 11 questões' },
    { id: 'vn_32', title: 'Dia 32: TAREFA 32 – Revisão da aula 14' },
    { id: 'vn_33', title: 'Dia 33: TAREFA 33 – Teoria da aula 15 + 10 questões' },
    { id: 'vn_34', title: 'Dia 34: TAREFA 34 – Revisão da aula 15' },
    { id: 'vn_35', title: 'Dia 35: TAREFA 35 – Simulado da aula 16 (revisão geral pela prova)' },
    { id: 'vn_36', title: 'Dia 36: TAREFA 36 – Aula 17 em vídeo (Questões CESGRANRIO)' },
    { id: 'vn_37', title: 'Dia 37: TAREFA 37 – Estudo da aula 18' },
    { id: 'vn_38', title: 'Dia 38: TAREFA 38 – Estudo da aula 19' },
    { id: 'vn_39', title: 'Dia 39: TAREFA 39 – Revisão das aulas 18 e 19' },
    { id: 'vn_40', title: 'Dia 40: TAREFA 40 – Revisão geral com bateria de questões no SQ (caderno com mais de 200 exercícios)' },
  ]
};

// --- REUSABLE COMPONENTS ---
const Panel = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`medieval-panel rounded-sm ${className}`}>
    <div className="medieval-panel-inner h-full">
      {children}
    </div>
  </div>
);

const PanelHeader = ({ title, icon: Icon }: { title: string, icon?: React.ElementType }) => (
  <div className="bg-quest-red-dark border-b-2 border-quest-gold-dark px-4 py-3 flex items-center justify-center relative shadow-md">
    <div className="absolute left-3 w-2 h-2 bg-quest-gold rotate-45 shadow-[0_0_5px_var(--color-quest-gold)]"></div>
    <div className="flex items-center gap-2 text-quest-gold font-serif tracking-widest text-sm uppercase text-shadow-sm">
      {Icon && <Icon size={18} />}
      <span>{title}</span>
    </div>
    <div className="absolute right-3 w-2 h-2 bg-quest-gold rotate-45 shadow-[0_0_5px_var(--color-quest-gold)]"></div>
  </div>
);

const ProgressBar = ({ progress, className = '' }: { progress: number, className?: string }) => (
  <div className={`h-2 bg-quest-panel-light border border-quest-gold-dark/50 rounded-full overflow-hidden shadow-inner ${className}`}>
    <div 
      className="h-full bg-gradient-to-r from-quest-red-dark via-quest-red to-quest-gold shadow-[0_0_10px_rgba(58,90,64,0.5)] transition-all duration-700 ease-out"
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

export const CONTESTS = [
  {
    id: 'bb',
    name: 'Banco do Brasil',
    cutoffScore: 80,
    warningScore: 72,
    subjects: [
      { name: 'Língua Portuguesa', questions: 10, weight: 1.5 },
      { name: 'Língua Inglesa', questions: 5, weight: 1.0 },
      { name: 'Matemática', questions: 5, weight: 1.5 },
      { name: 'Atualidades do Mercado Financeiro', questions: 5, weight: 1.0 },
      { name: 'Matemática Financeira', questions: 5, weight: 1.5 },
      { name: 'Conhecimentos Bancários', questions: 10, weight: 1.5 },
      { name: 'Conhecimentos de Informática', questions: 15, weight: 1.5 },
      { name: 'Vendas e Negociação', questions: 15, weight: 1.5 },
    ]
  }
];

const MedievalRain = () => {
  const items = [Swords, Shield, Crown, Scroll, Sparkles];
  const drops = Array.from({ length: 40 }).map((_, i) => {
    const Icon = items[Math.floor(Math.random() * items.length)];
    return {
      id: i,
      Icon,
      left: `${Math.random() * 100}vw`,
      duration: Math.random() * 2 + 2,
      delay: Math.random() * 0.5,
      size: Math.random() * 24 + 16,
      rotation: Math.random() * 360
    };
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {drops.map(drop => (
        <motion.div
          key={drop.id}
          initial={{ y: '-10vh', x: drop.left, rotate: 0, opacity: 0 }}
          animate={{ 
            y: '110vh', 
            rotate: drop.rotation,
            opacity: [0, 1, 1, 0]
          }}
          transition={{ 
            duration: drop.duration, 
            delay: drop.delay, 
            ease: "linear",
            repeat: 0
          }}
          className="absolute text-quest-gold drop-shadow-[0_0_8px_rgba(184,155,94,0.6)]"
        >
          <drop.Icon size={drop.size} />
        </motion.div>
      ))}
    </div>
  );
};

const DragonEncounter = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden flex items-center justify-center">
      {/* Background Dimming */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0.8, 0] }}
        transition={{ duration: 7, ease: "easeInOut" }}
        className="absolute inset-0 bg-black/80"
      />

      {/* Dragon */}
      <motion.div
        initial={{ x: '100vw', y: '-20vh', scale: 0.5, opacity: 0 }}
        animate={{ 
          x: ['100vw', '10vw', '10vw', '-100vw'], 
          y: ['-20vh', '0vh', '0vh', '-50vh'],
          scale: [0.5, 3, 3, 1],
          opacity: [0, 1, 1, 0],
          rotate: [0, -10, 10, -10, 10, 0] // Aggressive shake
        }}
        transition={{ 
          duration: 6, 
          ease: "easeInOut",
          rotate: { repeat: Infinity, duration: 0.15 } // Very fast shake
        }}
        className="absolute left-1/2 top-1/2 -translate-y-1/2 flex items-center"
      >
        {/* Left Head Fire Breath */}
        <motion.div 
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 0, 2, 2, 0], opacity: [0, 0, 1, 1, 0] }}
          transition={{ duration: 6, ease: "easeInOut", times: [0, 0.2, 0.25, 0.4, 0.45] }}
          className="absolute right-[80%] top-[20%] h-48 w-[500px] bg-gradient-to-l from-red-600 via-orange-500 to-transparent origin-right blur-2xl rounded-full"
          style={{ filter: 'drop-shadow(0 0 60px rgba(255,0,0,1))', transform: 'rotate(-15deg)' }}
        />
        {/* Right Head Fire Breath */}
        <motion.div 
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 0, 2, 2, 0], opacity: [0, 0, 1, 1, 0] }}
          transition={{ duration: 6, ease: "easeInOut", times: [0, 0.22, 0.27, 0.42, 0.47] }}
          className="absolute right-[80%] top-[50%] h-48 w-[500px] bg-gradient-to-l from-red-600 via-orange-500 to-transparent origin-right blur-2xl rounded-full"
          style={{ filter: 'drop-shadow(0 0 60px rgba(255,0,0,1))', transform: 'rotate(10deg)' }}
        />
        <DragonIcon className="w-80 h-80 text-red-700 drop-shadow-[0_0_50px_rgba(185,28,28,0.8)]" />
      </motion.div>

      {/* Knight */}
      <motion.div
        initial={{ x: '-100vw', y: '20vh', scale: 0.5, opacity: 0 }}
        animate={{ 
          x: ['-100vw', '-20vw', '-20vw', '-100vw'], 
          y: ['20vh', '10vh', '10vh', '50vh'],
          scale: [0.5, 2, 2, 1],
          opacity: [0, 1, 1, 0]
        }}
        transition={{ duration: 7, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 -translate-y-1/2"
      >
        <KnightIcon className="w-40 h-40 text-quest-gold drop-shadow-[0_0_20px_rgba(184,155,94,0.8)] transform -scale-x-100" />
      </motion.div>
      
      {/* Clash Flash */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 0, 1, 0], scale: [0, 0, 2, 0] }}
        transition={{ duration: 7, ease: "easeInOut", times: [0, 0.24, 0.25, 0.35] }}
        className="absolute w-full h-full bg-white mix-blend-overlay"
      />
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showRain, setShowRain] = useState(false);
  const [showDragon, setShowDragon] = useState(false);

  const triggerDragonEncounter = () => {
    setShowDragon(true);
    
    // Angry Dragon Roar (Layered for intensity)
    const roar1 = new Audio('https://assets.mixkit.co/active_storage/sfx/1192/1192-preview.mp3');
    const roar2 = new Audio('https://assets.mixkit.co/active_storage/sfx/1192/1192-preview.mp3');
    roar1.volume = 0.9;
    roar2.volume = 0.7;
    roar2.playbackRate = 0.8; // Deeper roar
    roar1.play().catch(e => console.log("Audio play failed", e));
    setTimeout(() => roar2.play().catch(e => console.log("Audio play failed", e)), 200);

    // Intense Medieval Battle Music
    const music = new Audio('https://assets.mixkit.co/active_storage/sfx/1997/1997-preview.mp3');
    music.volume = 0.8;
    music.play().catch(e => console.log("Audio play failed", e));
    
    // Stop music after 10 seconds
    setTimeout(() => {
      music.pause();
      music.currentTime = 0;
    }, 10000);

    // Knight Sword Clash & Shield Impact
    setTimeout(() => {
      const clash = new Audio('https://assets.mixkit.co/active_storage/sfx/1196/1196-preview.mp3');
      clash.volume = 0.9;
      clash.play().catch(e => console.log("Audio play failed", e));
    }, 1500);

    setTimeout(() => setShowDragon(false), 6000);
  };

  const triggerMedievalEffects = () => {
    // Upbeat Medieval Fanfare (Animated Music)
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio play failed", e));
    
    // Stop audio after 10 seconds
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 10000);

    // Rain happens with 40% probability
    if (Math.random() < 0.4) {
      setShowRain(true);
      setTimeout(() => setShowRain(false), 10000);
    }
  };

  const playClickSound = () => {
    // Solid wooden/metallic click
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.volume = 0.4;
    audio.play().catch(e => console.log("Audio play failed", e));
  };
  
  // Data State
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [taskCompletions, setTaskCompletions] = useState<Record<string, boolean>>({});
  const [simulados, setSimulados] = useState<any[]>([]);
  const [detailedSimulados, setDetailedSimulados] = useState<any[]>([]);
  const [userContests, setUserContests] = useState<any[]>([]);
  const [redacoes, setRedacoes] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTaskContent, setSelectedTaskContent] = useState<{title: string, content: string, taskId: string, subject: string} | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [genericPdfPage, setGenericPdfPage] = useState(1);
  const [isSimuladoModalOpen, setIsSimuladoModalOpen] = useState(false);
  const [simuladoModalTab, setSimuladoModalTab] = useState<'registrar' | 'novo_concurso'>('registrar');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'simulados'>('dashboard');
  
  // Forms State
  const [newSimulado, setNewSimulado] = useState({ title: '', score: 0, targetScore: 80 });
  const [newDetailedSimulado, setNewDetailedSimulado] = useState({ title: '', contestId: 'bb', subjectScores: {} as Record<string, number> });
  const [newContest, setNewContest] = useState({ name: '', cutoffScore: 80, warningScore: 72, subjects: [{ name: '', questions: 10, weight: 1 }] });
  const [newRedacao, setNewRedacao] = useState({ theme: '', score: 0 });
  const [selectedContestId, setSelectedContestId] = useState('bb');
  const [deletingSimuladoId, setDeletingSimuladoId] = useState<string | null>(null);
  const [deletingRedacaoId, setDeletingRedacaoId] = useState<string | null>(null);

  const [isDbSetupError, setIsDbSetupError] = useState(false);

  const completedSubjects = Object.keys(subjectTasks).filter(subject => {
    const tasks = subjectTasks[subject];
    return tasks.length > 0 && tasks.every(task => !!taskCompletions[`${subject}_${task.id}`]);
  });

  const activeWeeklySchedule = weeklySchedule.filter(row => 
    row.days.some(subject => !completedSubjects.includes(subject))
  );

  const allContests = [...CONTESTS, ...userContests];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state change:", _event, session?.user?.id);
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Listen to Completions (Missions)
    const fetchCompletions = async () => {
      const { data, error } = await supabase
        .from('completions')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        if (error.message?.includes('schema cache')) {
          setIsDbSetupError(true);
        }
        console.error("Erro ao buscar missões:", error);
        return;
      }
      
      if (data) {
        const newCompletions: Record<string, boolean> = {};
        data.forEach(item => {
          newCompletions[`${item.date}_${item.subject}`] = true;
        });
        setCompletions(newCompletions);
      }
    };

    fetchCompletions();

    const completionsSubscription = supabase
      .channel('completions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'completions' }, (payload) => {
        // Refetch on any change to the table. The fetch function filters by user_id.
        fetchCompletions();
      })
      .subscribe();

    // Listen to Task Completions
    const fetchTaskCompletions = async () => {
      const { data, error } = await supabase
        .from('task_completions')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Erro ao buscar tarefas:", error);
        return;
      }
      
      if (data) {
        const newTaskCompletions: Record<string, boolean> = {};
        data.forEach(item => {
          newTaskCompletions[`${item.subject}_${item.task_id}`] = true;
        });
        setTaskCompletions(newTaskCompletions);
      }
    };

    fetchTaskCompletions();

    const taskCompletionsSubscription = supabase
      .channel('task_completions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_completions' }, (payload) => {
        fetchTaskCompletions();
      })
      .subscribe();

    // Listen to Simulados
    const fetchSimulados = async () => {
      try {
        const { data, error } = await supabase
          .from('simulados')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error("Erro ao buscar simulados:", error);
          return;
        }
        if (data) {
          console.log("Simulados buscados:", data.length);
          setSimulados(data);
        }
      } catch (err) {
        console.error("Erro inesperado ao buscar simulados:", err);
      }
    };

    fetchSimulados();

    const simuladosSubscription = supabase
      .channel('simulados_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'simulados' }, (payload) => {
        fetchSimulados();
      })
      .subscribe();

    // Listen to Detailed Simulados
    const fetchDetailedSimulados = async () => {
      try {
        const { data, error } = await supabase
          .from('detailed_simulados')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error("Erro ao buscar simulados detalhados:", error);
          return;
        }
        if (data) {
          console.log("Simulados detalhados buscados:", data.length);
          const mappedSimulados = data.map(s => ({
            id: s.id,
            title: s.title,
            contestId: s.contest_id,
            subjectScores: s.subject_scores,
            totalScore: s.total_score,
            date: s.date
          }));
          setDetailedSimulados(mappedSimulados);
        }
      } catch (err) {
        console.error("Erro inesperado ao buscar simulados detalhados:", err);
      }
    };

    fetchDetailedSimulados();

    const detailedSimuladosSubscription = supabase
      .channel('detailed_simulados_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'detailed_simulados' }, (payload) => {
        fetchDetailedSimulados();
      })
      .subscribe();

    // Listen to User Contests
    const fetchUserContests = async () => {
      try {
        const { data, error } = await supabase
          .from('user_contests')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) {
          console.error("Erro ao buscar concursos do usuário:", error);
          return;
        }
        if (data) {
          console.log("Concursos do usuário buscados:", data.length);
          const mappedContests = data.map(c => ({
            id: c.id,
            name: c.name,
            cutoffScore: c.cutoff_score,
            warningScore: c.warning_score,
            subjects: c.subjects
          }));
          setUserContests(mappedContests);
        }
      } catch (err) {
        console.error("Erro inesperado ao buscar concursos:", err);
      }
    };

    fetchUserContests();

    const userContestsSubscription = supabase
      .channel('user_contests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_contests' }, (payload) => {
        fetchUserContests();
      })
      .subscribe();

    // Listen to Redacoes
    const fetchRedacoes = async () => {
      try {
        const { data, error } = await supabase
          .from('redacoes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Erro ao buscar redações:", error);
          return;
        }
        if (data) {
          console.log("Redações buscadas:", data.length);
          setRedacoes(data);
        }
      } catch (err) {
        console.error("Erro inesperado ao buscar redações:", err);
      }
    };

    fetchRedacoes();

    const redacoesSubscription = supabase
      .channel('redacoes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'redacoes' }, (payload) => {
        fetchRedacoes();
      })
      .subscribe();

    return () => {
      completionsSubscription.unsubscribe();
      taskCompletionsSubscription.unsubscribe();
      simuladosSubscription.unsubscribe();
      detailedSimuladosSubscription.unsubscribe();
      userContestsSubscription.unsubscribe();
      redacoesSubscription.unsubscribe();
    };
  }, [user]);

  const [loginEmail, setLoginEmail] = useState('admin@admin.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
    } catch (err: any) {
      setLoginError(err.message);
      console.error('Falha no login:', err);
    }
  };

  const handleLogout = () => supabase.auth.signOut();

  const toggleMission = async (subject: string, isCompleted: boolean) => {
    if (!user) return;
    const dateStr = new Date().toISOString().split('T')[0];
    const docId = `${user.id}_${dateStr}_${encodeURIComponent(subject)}`;
    
    try {
      if (isCompleted) {
        const { error } = await supabase.from('completions').delete().eq('id', docId);
        if (error) throw error;
        // Optimistic update or manual refetch
        setCompletions(prev => {
          const next = { ...prev };
          delete next[`${dateStr}_${subject}`];
          return next;
        });
      } else {
        playClickSound();
        const { error } = await supabase.from('completions').upsert({
          id: docId,
          user_id: user.id,
          date: dateStr,
          subject: subject
        });
        if (error) throw error;
        
        // Optimistic update
        setCompletions(prev => ({ ...prev, [`${dateStr}_${subject}`]: true }));
        
        // Determine if this is the last mission of the day being completed
        const todayDayOfWeek = new Date().getDay();
        const todaysMissions = weeklySchedule.map(row => ({
          subject: row.days[todayDayOfWeek],
          completed: !!completions[`${dateStr}_${row.days[todayDayOfWeek]}`] || row.days[todayDayOfWeek] === subject
        }));
        
        const otherMissions = todaysMissions.filter(m => m.subject !== subject);
        const allOthersCompleted = otherMissions.every(m => m.completed);
        
        if (allOthersCompleted && todaysMissions.length > 0) {
          triggerDragonEncounter();
        } else {
          triggerMedievalEffects();
        }
      }
    } catch (err: any) {
      if (err.message?.includes('schema cache')) {
        console.error("ERRO CRÍTICO: A tabela 'completions' não foi encontrada no banco de dados. Por favor, execute o script SQL de migração no seu painel do Supabase.");
      } else {
        console.error("Erro ao atualizar missão: " + err.message);
      }
    }
  };

  const toggleFlashcards = async (isCompleted: boolean) => {
    if (!user) return;
    const dateStr = new Date().toISOString().split('T')[0];
    const docId = `${user.id}_${dateStr}_Flashcards`;
    
    try {
      if (isCompleted) {
        const { error } = await supabase.from('completions').delete().eq('id', docId);
        if (error) throw error;
        setCompletions(prev => {
          const next = { ...prev };
          delete next[`${dateStr}_Flashcards`];
          return next;
        });
      } else {
        playClickSound();
        const { error } = await supabase.from('completions').upsert({
          id: docId,
          user_id: user.id,
          date: dateStr,
          subject: 'Flashcards'
        });
        if (error) throw error;
        setCompletions(prev => ({ ...prev, [`${dateStr}_Flashcards`]: true }));
        
        // Medieval flashcard sound (sword sheathe)
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1197/1197-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play failed", e));
      }
    } catch (err: any) {
      if (err.message?.includes('schema cache')) {
        console.error("ERRO CRÍTICO: A tabela 'completions' não foi encontrada no banco de dados. Por favor, execute o script SQL de migração no seu painel do Supabase.");
      } else {
        console.error("Erro ao atualizar flashcards: " + err.message);
      }
    }
  };

  const toggleTask = async (subject: string, taskId: string, isCompleted: boolean) => {
    if (!user) return;
    const docId = `${user.id}_${encodeURIComponent(subject)}_${taskId}`;
    
    try {
      if (isCompleted) {
        const { error } = await supabase.from('task_completions').delete().eq('id', docId);
        if (error) throw error;
        setTaskCompletions(prev => {
          const next = { ...prev };
          delete next[`${subject}_${taskId}`];
          return next;
        });
      } else {
        playClickSound();
        const { error } = await supabase.from('task_completions').upsert({
          id: docId,
          user_id: user.id,
          subject: subject,
          task_id: taskId
        });
        if (error) throw error;
        setTaskCompletions(prev => ({ ...prev, [`${subject}_${taskId}`]: true }));
        triggerMedievalEffects();
      }
    } catch (err: any) {
      if (err.message?.includes('schema cache')) {
        console.error("ERRO CRÍTICO: A tabela 'task_completions' não foi encontrada no banco de dados. Por favor, execute o script SQL de migração no seu painel do Supabase.");
      } else {
        console.error("Erro ao atualizar tarefa: " + err.message);
      }
    }
  };

  const addSimulado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSimulado.title.trim() || !user) return;
    try {
      await supabase.from('simulados').insert({
        user_id: user.id,
        title: newSimulado.title,
        score: Number(newSimulado.score),
        target_score: Number(newSimulado.targetScore),
        date: new Date().toISOString().split('T')[0]
      });
      setNewSimulado({ title: '', score: 0, targetScore: 80 });
    } catch (err: any) {
      console.error("Erro ao registrar simulado: " + err.message);
    }
  };

  const addDetailedSimulado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDetailedSimulado.title.trim() || !user) return;
    
    const contest = allContests.find(c => c.id === newDetailedSimulado.contestId);
    if (!contest) return;

    let totalScore = 0;
    contest.subjects.forEach((sub: any) => {
      const score = newDetailedSimulado.subjectScores[sub.name] || 0;
      totalScore += score * sub.weight;
    });

    try {
      await supabase.from('detailed_simulados').insert({
        user_id: user.id,
        title: newDetailedSimulado.title,
        contest_id: newDetailedSimulado.contestId,
        subject_scores: newDetailedSimulado.subjectScores,
        total_score: totalScore,
        date: new Date().toISOString().split('T')[0]
      });
      setNewDetailedSimulado({ title: '', contestId: 'bb', subjectScores: {} });
      setIsSimuladoModalOpen(false);
    } catch (err: any) {
      console.error("Erro ao registrar simulado detalhado: " + err.message);
    }
  };

  const addContest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContest.name.trim() || !user) return;
    
    try {
      await supabase.from('user_contests').insert({
        user_id: user.id,
        name: newContest.name,
        cutoff_score: Number(newContest.cutoffScore),
        warning_score: Number(newContest.warningScore),
        subjects: newContest.subjects.map(s => ({
          name: s.name,
          questions: Number(s.questions),
          weight: Number(s.weight)
        }))
      });
      setNewContest({ name: '', cutoffScore: 80, warningScore: 72, subjects: [{ name: '', questions: 10, weight: 1 }] });
      setSimuladoModalTab('registrar');
    } catch (err: any) {
      console.error("Erro ao registrar concurso: " + err.message);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        >
          <CrestLogo className="w-32 h-32 text-quest-gold drop-shadow-[0_0_20px_rgba(184,155,94,0.8)] mb-6" />
        </motion.div>
        <h1 className="font-serif text-3xl text-quest-gold tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] animate-pulse">
          FORJANDO O REINO...
        </h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Panel className="w-full max-w-md p-8 text-center">
          <CrestLogo className="w-24 h-24 mx-auto text-quest-gold mb-4 drop-shadow-[0_0_15px_rgba(184,155,94,0.6)]" />
          <h1 className="font-serif text-3xl text-quest-gold mb-2">Quest Studies</h1>
          <p className="text-quest-text-muted mb-8 italic">Identifique-se, viajante.</p>
          
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-quest-gold-dark text-xs uppercase tracking-widest mb-1">E-mail</label>
              <input 
                type="email" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-quest-panel-dark border border-quest-gold-dark/30 rounded-sm p-2 text-quest-gold focus:outline-none focus:border-quest-gold"
                required
              />
            </div>
            <div>
              <label className="block text-quest-gold-dark text-xs uppercase tracking-widest mb-1">Senha</label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-quest-panel-dark border border-quest-gold-dark/30 rounded-sm p-2 text-quest-gold focus:outline-none focus:border-quest-gold"
                required
              />
            </div>
            {loginError && <p className="text-red-500 text-xs italic">{loginError}</p>}
            <button type="submit" className="w-full medieval-button mt-4 flex items-center justify-center gap-2">
              <Shield size={18} /> Entrar no Reino
            </button>
          </form>
        </Panel>
      </div>
    );
  }

  const addRedacao = async () => {
    if (!newRedacao.theme.trim() || !user) return;
    
    // Handle comma instead of dot
    const parsedScore = Number(String(newRedacao.score).replace(',', '.'));
    const finalScore = isNaN(parsedScore) ? 0 : parsedScore;

    try {
      const { error } = await supabase.from('redacoes').insert({
        user_id: user.id,
        theme: newRedacao.theme,
        score: finalScore,
        date: new Date().toISOString().split('T')[0]
      });
      
      if (error) throw error;
      setNewRedacao({ theme: '', score: 0 });
    } catch (err: any) {
      console.error("Erro ao salvar redação: " + err.message);
    }
  };

  const getWeekDates = () => {
    const today = new Date();
    const day = today.getDay();
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - day + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const getTaskContent = (subject: string, taskId: string) => {
    if (subject === 'Conhecimentos Bancários') {
      return cbTasksContent[taskId] || 'Conteúdo detalhado não disponível para esta tarefa no momento.';
    }
    return 'Conteúdo detalhado não disponível para esta tarefa no momento.';
  };

  const weekDates = getWeekDates();
  const todayDayOfWeek = new Date().getDay();
  const todayDateStr = new Date().toISOString().split('T')[0];

  const currentWeekFlashcards = weekDates.filter(date => completions[`${date}_Flashcards`]).length;
  const currentWeekCycles = weekDates.reduce((acc, date, colIdx) => {
    let count = 0;
    weeklySchedule.forEach(row => {
      if (completions[`${date}_${row.days[colIdx]}`]) count++;
    });
    return acc + count;
  }, 0);
  const totalWeeklyCycles = weeklySchedule.length * 7;
  const currentWeekProgress = Math.round((currentWeekCycles / totalWeeklyCycles) * 100);
  
  const currentWeekLabel = `${weekDates[0].split('-').reverse().slice(0,2).join('/')} - ${weekDates[6].split('-').reverse().slice(0,2).join('/')}`;

  const dynamicWeeklyHistory = [
    { 
      date: currentWeekLabel, 
      cycles: `${currentWeekCycles}/${totalWeeklyCycles} ciclos`, 
      progress: currentWeekProgress,
      flashcards: currentWeekFlashcards
    },
    ...weeklyHistory.map(w => ({ ...w, flashcards: 0 }))
  ];

  const todaysMissions = weeklySchedule
    .map(row => ({
      subject: row.days[todayDayOfWeek],
      time: row.time,
      completed: !!completions[`${todayDateStr}_${row.days[todayDayOfWeek]}`]
    }))
    .filter(mission => !completedSubjects.includes(mission.subject));

  const completedMissions = currentWeekCycles;
  const totalMissions = totalWeeklyCycles;
  const questProgress = currentWeekProgress;

  const chartData = detailedSimulados.map(s => ({
    name: s.title,
    score: s.totalScore,
    target: allContests.find(c => c.id === s.contestId)?.cutoffScore || 80
  }));

  const activeContest = allContests.find(c => c.id === selectedContestId) || allContests[0];

  // Calculate Battle Table
  const battleStats: Record<string, { total: number, completed: number }> = {};
  weeklySchedule.forEach(row => {
    row.days.forEach((subject, colIdx) => {
      if (!battleStats[subject]) battleStats[subject] = { total: 0, completed: 0 };
      battleStats[subject].total += 1;
      const dateStr = weekDates[colIdx];
      if (completions[`${dateStr}_${subject}`]) {
        battleStats[subject].completed += 1;
      }
    });
  });

  const dynamicBattleTable = Object.keys(battleStats)
    .filter(subject => {
      const stats = battleStats[subject];
      const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      // Hide if 100% progress OR if all tasks are completed
      return progress < 100 && !completedSubjects.includes(subject);
    })
    .map(subject => {
      const stats = battleStats[subject];
      const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      return {
        subject,
        conquest: `${stats.completed}/${stats.total}`,
        progress
      };
    });

  const completedSubjectsData = completedSubjects.map(subject => {
    const stats = battleStats[subject] || { completed: 0, total: 0 };
    return {
      subject,
      conquest: `${stats.completed}/${stats.total}`,
      progress: 100
    };
  });

  return (
    <div className="min-h-screen p-4 md:p-8 selection:bg-quest-red selection:text-white relative">
      <div className="fixed inset-0 pointer-events-none z-[50] shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
      {showRain && <MedievalRain />}
      {showDragon && <DragonEncounter />}
      <DragonMascot />
      
      {isDbSetupError && (
        <div className="max-w-6xl mx-auto mb-6 p-4 bg-green-900/80 border-2 border-quest-red text-white rounded-lg shadow-[0_0_20px_rgba(58,90,64,0.5)] flex flex-col items-center gap-3 text-center">
          <ShieldAlert size={32} className="text-quest-gold animate-pulse" />
          <div>
            <h3 className="font-serif text-lg tracking-widest text-quest-gold">ERRO DE CONFIGURAÇÃO DO REINO</h3>
            <p className="text-sm italic">As tabelas do banco de dados não foram encontradas. Por favor, execute o script SQL de migração no seu painel do Supabase para inicializar o reino.</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 border-b-2 border-quest-gold-dark/50 pb-6 relative">
        <div className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-quest-gold to-transparent"></div>
        
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="w-14 h-14 rounded-full bg-quest-red-dark border-2 border-quest-gold flex items-center justify-center shadow-[0_0_20px_rgba(184, 155, 94, 0.4)] relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <CrestLogo className="w-8 h-8 text-quest-gold relative z-10" />
          </div>
          <div>
            <h1 className="font-serif text-3xl text-quest-gold tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">QUEST STUDIES</h1>
            <p className="text-sm text-quest-gold-dark italic">A Jornada do Guerreiro - Concursos</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-serif tracking-wider text-quest-gold-dark">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex items-center gap-2 transition-colors hover:drop-shadow-[0_0_5px_rgba(184, 155, 94, 0.8)] ${activeTab === 'dashboard' ? 'text-quest-gold' : 'hover:text-quest-gold'}`}
          >
            <Shield size={18} />
            DASHBOARD
          </button>
          <button 
            onClick={() => setActiveTab('simulados')} 
            className={`flex items-center gap-2 transition-colors hover:drop-shadow-[0_0_5px_rgba(184, 155, 94, 0.8)] ${activeTab === 'simulados' ? 'text-quest-gold' : 'hover:text-quest-gold'}`}
          >
            <Trophy size={18} />
            SIMULADOS
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 hover:text-quest-gold transition-colors hover:drop-shadow-[0_0_5px_rgba(184, 155, 94, 0.8)]">
            <LogOut size={18} />
            SAIR DO REINO
          </button>
        </div>
      </header>

      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-6xl mx-auto space-y-8"
      >
        
        {activeTab === 'dashboard' && (
          <>
            {/* TOP STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Panel className="p-6 relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-quest-red-dark/40 border border-quest-red flex items-center justify-center shadow-[0_0_10px_rgba(139,0,0,0.5)]">
                <Trophy className="text-quest-gold" size={24} />
              </div>
              <div>
                <h3 className="text-sm text-quest-text-muted uppercase tracking-widest mb-1 font-serif">Progresso da Quest</h3>
                <p className="font-serif text-4xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{questProgress}%</p>
              </div>
            </div>
            <ProgressBar progress={questProgress} />
          </Panel>

          <Panel className="p-6 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-quest-red-dark/40 border border-quest-red flex items-center justify-center shadow-[0_0_10px_rgba(139,0,0,0.5)]">
                <Swords className="text-quest-gold" size={24} />
              </div>
              <div>
                <h3 className="text-sm text-quest-text-muted uppercase tracking-widest mb-1 font-serif">Missões Concluídas</h3>
                <p className="font-serif text-4xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  <span className="text-quest-gold">{completedMissions}</span>
                  <span className="text-quest-text-muted text-2xl">/{totalMissions}</span>
                </p>
              </div>
            </div>
          </Panel>
        </div>

        {/* MISSÃO DO DIA */}
        <Panel>
          <PanelHeader title={`PERGAMINHO DE MISSÕES - ${['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'][todayDayOfWeek]}`} />
          <div className="p-2">
            {todaysMissions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-quest-text-muted italic mb-4">Nenhuma missão para hoje.</p>
              </div>
            ) : (
              todaysMissions.map((mission, idx) => (
                <motion.div 
                  key={idx} 
                  initial={false}
                  animate={{ scale: mission.completed ? 0.98 : 1 }}
                  className={`flex items-center justify-between p-4 border-b border-quest-gold-dark/20 last:border-0 hover:bg-quest-panel-light transition-colors ${mission.completed ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <motion.button 
                      whileTap={{ scale: 0.8 }}
                      className="text-quest-gold-dark hover:text-quest-gold transition-colors drop-shadow-md"
                      onClick={() => toggleMission(mission.subject, mission.completed)}
                    >
                      {mission.completed ? <CheckSquare className="text-quest-red" size={24} /> : <Square size={24} />}
                    </motion.button>
                    <span 
                      className={`text-lg cursor-pointer flex-1 flex items-center gap-2 ${mission.completed ? 'line-through text-quest-text-muted' : 'text-quest-text hover:text-quest-gold'}`}
                      onClick={() => setSelectedSubject(mission.subject)}
                    >
                      {mission.subject}
                      {completedSubjects.includes(mission.subject) && (
                        <span className="text-[10px] bg-quest-gold/20 text-quest-gold px-2 py-0.5 rounded-full border border-quest-gold/30 font-serif tracking-tighter">100% VENCIDA</span>
                      )}
                    </span>
                  </div>
                  <span className="text-sm text-quest-gold-dark">{mission.time}</span>
                </motion.div>
              ))
            )}
          </div>
        </Panel>

        {/* FLASHCARDS */}
        <Panel>
          <div 
            className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${!!completions[`${todayDateStr}_Flashcards`] ? 'opacity-50 hover:opacity-80' : 'hover:bg-quest-panel-light'}`}
            onClick={() => toggleFlashcards(!!completions[`${todayDateStr}_Flashcards`])}
          >
            <div className={`flex items-center gap-3 ${!!completions[`${todayDateStr}_Flashcards`] ? 'text-quest-text-muted line-through' : 'text-quest-gold-dark hover:text-quest-gold'}`}>
              <BookOpen size={18} />
              <span className="font-serif tracking-widest text-sm uppercase">FLASHCARDS DO DIA</span>
            </div>
            <div className="text-quest-gold-dark">
              {!!completions[`${todayDateStr}_Flashcards`] ? <CheckSquare className="text-quest-red" size={24} /> : <Square size={24} />}
            </div>
          </div>
        </Panel>

        {/* MAPA DA JORNADA SEMANAL */}
        <Panel>
          <PanelHeader title="MAPA DA JORNADA SEMANAL" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center border-collapse">
              <thead>
                <tr className="bg-quest-red-dark/20 text-quest-gold font-serif text-xs tracking-widest uppercase border-b border-quest-gold-dark/50">
                  <th className="p-4 font-normal border-r border-quest-gold-dark/20">Tempo</th>
                  <th className="p-4 font-normal border-r border-quest-gold-dark/20">Domingo</th>
                  <th className="p-4 font-normal border-r border-quest-gold-dark/20">Segunda</th>
                  <th className="p-4 font-normal border-r border-quest-gold-dark/20">Terça</th>
                  <th className="p-4 font-normal border-r border-quest-gold-dark/20">Quarta</th>
                  <th className="p-4 font-normal border-r border-quest-gold-dark/20">Quinta</th>
                  <th className="p-4 font-normal border-r border-quest-gold-dark/20">Sexta</th>
                  <th className="p-4 font-normal">Sábado</th>
                </tr>
              </thead>
              <tbody className="text-xs text-quest-text-muted">
                {activeWeeklySchedule.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center italic text-quest-text-muted">
                      Todas as matérias desta jornada foram vencidas! Veja o Salão dos Heróis abaixo.
                    </td>
                  </tr>
                ) : (
                  activeWeeklySchedule.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-quest-gold-dark/20 last:border-0 hover:bg-quest-panel-light/50">
                      <td className="p-4 border-r border-quest-gold-dark/20 font-mono">{row.time}</td>
                      {row.days.map((subject, colIdx) => {
                        const dateStr = weekDates[colIdx];
                        const isChecked = !!completions[`${dateStr}_${subject}`];
                        const isCompleted = completedSubjects.includes(subject);
                        
                        if (isCompleted) {
                          return (
                            <td key={colIdx} className="p-4 border-r border-quest-gold-dark/20 last:border-0 bg-quest-gold/5 opacity-20">
                              {/* Hidden 100% Completed Subject */}
                            </td>
                          );
                        }

                        return (
                          <td key={colIdx} className="p-4 border-r border-quest-gold-dark/20 last:border-0 cursor-pointer hover:bg-quest-panel-light/50 transition-colors" onClick={() => setSelectedSubject(subject)}>
                            <div className={`flex flex-col items-center justify-center gap-1 transition-opacity ${isChecked ? 'opacity-40' : 'opacity-100'}`}>
                              <span className={isChecked ? 'text-quest-text-muted line-through' : 'text-quest-text'}>
                                {subject}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* TABELA DE BATALHA */}
        <div className="pt-4">
          <h2 className="font-serif text-quest-text text-lg tracking-widest uppercase mb-4 flex items-center gap-2">
            <span className="text-quest-gold-dark">×</span> TABELA DE BATALHA
          </h2>
          <Panel>
            <PanelHeader title="MATÉRIAS — PROGRESSO DE GUERRA" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-quest-red-dark/20 text-quest-gold font-serif text-xs tracking-widest uppercase border-b border-quest-gold-dark/50">
                    <th className="p-4 font-normal border-r border-quest-gold-dark/20 w-1/2">Matéria</th>
                    <th className="p-4 font-normal border-r border-quest-gold-dark/20 text-center">Conquista</th>
                    <th className="p-4 font-normal text-center w-1/4">Progresso</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {dynamicBattleTable.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-quest-text-muted italic">
                        {completedSubjectsData.length > 0 
                          ? "Todas as matérias desta jornada foram vencidas! Veja o Salão dos Heróis abaixo."
                          : "Nenhuma matéria em batalha no momento."}
                      </td>
                    </tr>
                  ) : (
                    dynamicBattleTable.map((row, idx) => (
                      <tr key={idx} className={`border-b border-quest-gold-dark/20 last:border-0 hover:bg-quest-panel-light/50 cursor-pointer ${completedSubjects.includes(row.subject) ? 'bg-quest-gold/5' : ''}`} onClick={() => setSelectedSubject(row.subject)}>
                        <td className="p-4 border-r border-quest-gold-dark/20 text-quest-text">
                          <div className="flex items-center gap-2">
                            {row.subject}
                            {completedSubjects.includes(row.subject) && (
                              <span className="text-[9px] bg-quest-gold/20 text-quest-gold px-1.5 py-0.5 rounded-full border border-quest-gold/30 font-serif tracking-tighter">100%</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 border-r border-quest-gold-dark/20 text-center font-mono text-quest-text-muted">{row.conquest}</td>
                        <td className="p-4 flex items-center gap-3">
                          <ProgressBar progress={row.progress} className="flex-1" />
                          <span className="font-mono text-quest-text-muted w-8 text-right">{row.progress}%</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {completedSubjectsData.length > 0 && dynamicBattleTable.length > 0 && (
              <div className="p-2 text-center border-t border-quest-gold-dark/10">
                <p className="text-[10px] text-quest-gold-dark italic uppercase tracking-widest">
                  Matérias 100% concluídas são movidas para o Salão dos Heróis no final da página.
                </p>
              </div>
            )}
          </Panel>
        </div>

        {/* REDAÇÕES */}
        <div className="pt-4">
          <h2 className="font-serif text-quest-gold text-xl tracking-widest uppercase mb-4 flex items-center gap-3 drop-shadow-md">
            <PenTool size={24} className="text-quest-red" /> TOMO DE REDAÇÕES
          </h2>
          <Panel>
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-quest-gold-dark/30 bg-black/20">
              <input 
                type="text" 
                value={newRedacao.theme}
                onChange={e => setNewRedacao({...newRedacao, theme: e.target.value})}
                placeholder="Tema da Redação" 
                className="md:col-span-2 medieval-input"
              />
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={newRedacao.score || ''}
                  onChange={e => setNewRedacao({...newRedacao, score: Number(e.target.value)})}
                  placeholder="Nota" 
                  className="w-24 medieval-input"
                />
                <button onClick={addRedacao} className="flex-1 medieval-button flex items-center justify-center gap-2">
                  <Plus size={16} /> Salvar
                </button>
              </div>
            </div>
            <div className="p-4">
              {redacoes.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-quest-text-muted">
                  <PenTool size={32} className="mb-4 opacity-30" />
                  <p className="italic text-lg">Nenhum pergaminho escrito ainda.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* CHART */}
                  <div className="h-48 w-full bg-black/20 p-4 rounded border border-quest-gold-dark/20">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={redacoes.slice().reverse().map(r => ({ name: r.date.split('-').reverse().join('/'), score: r.score, theme: r.theme }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#8c7335" opacity={0.2} />
                        <XAxis dataKey="name" stroke="#a39b8f" fontSize={12} tickMargin={10} />
                        <YAxis stroke="#a39b8f" fontSize={12} domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1814', borderColor: '#8c7335', color: '#e8e0d5' }}
                          itemStyle={{ color: '#d4af37' }}
                          formatter={(value: number) => [`${value} pts`, 'Nota']}
                          labelFormatter={(label) => `Data: ${label}`}
                        />
                        <ReferenceLine y={70} stroke="#8b0000" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Aprovação (70)', fill: '#8b0000', fontSize: 12 }} />
                        <Line type="monotone" dataKey="score" stroke="#d4af37" strokeWidth={2} dot={{ fill: '#1a1814', stroke: '#d4af37', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#d4af37' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    {redacoes.map(r => {
                      const isApproved = r.score >= 70;
                      return (
                        <div key={r.id} className="flex justify-between items-center p-3 bg-quest-panel-light border border-quest-gold-dark/20 rounded">
                          <div>
                            <p className="text-quest-text text-lg">{r.theme}</p>
                            <p className="text-xs text-quest-gold-dark">{r.date.split('-').reverse().join('/')}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className={`text-2xl font-serif drop-shadow-md ${isApproved ? 'text-green-500' : 'text-quest-gold'}`}>{r.score}</div>
                            {deletingRedacaoId === r.id ? (
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={async () => {
                                    try {
                                      // Optimistic update
                                      setRedacoes(prev => prev.filter(item => item.id !== r.id));
                                      await supabase.from('redacoes').delete().eq('id', r.id);
                                      setDeletingRedacaoId(null);
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="text-quest-red font-bold text-xs uppercase hover:underline"
                                >
                                  Confirmar
                                </button>
                                <button 
                                  onClick={() => setDeletingRedacaoId(null)}
                                  className="text-quest-text-muted text-xs uppercase hover:underline"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setDeletingRedacaoId(r.id)}
                                className="text-quest-red-dark hover:text-quest-red transition-colors p-2"
                                title="Excluir Redação"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* TEMPORADA DE SIMULADOS */}
        <div className="pt-4">
          <h2 className="font-serif text-quest-gold text-xl tracking-widest uppercase mb-4 flex items-center gap-3 drop-shadow-md">
            <Trophy size={24} className="text-quest-red" /> TEMPORADA DE SIMULADOS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <Panel className="p-8 flex flex-col items-center justify-center text-center relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,0,0,0.1)_0%,transparent_70%)]"></div>
              <h3 className="text-sm text-quest-text-muted uppercase tracking-widest mb-4 font-serif relative z-10">Última Batalha</h3>
              {detailedSimulados.length > 0 ? (
                <>
                  <p className={`font-serif text-6xl mb-2 relative z-10 drop-shadow-md ${
                    detailedSimulados[detailedSimulados.length - 1].totalScore >= (allContests.find(c => c.id === detailedSimulados[detailedSimulados.length - 1].contestId)?.cutoffScore || 80) 
                      ? 'text-green-500' 
                      : detailedSimulados[detailedSimulados.length - 1].totalScore >= (allContests.find(c => c.id === detailedSimulados[detailedSimulados.length - 1].contestId)?.warningScore || 72)
                        ? 'text-yellow-500'
                        : 'text-red-500'
                  }`}>
                    {detailedSimulados[detailedSimulados.length - 1].totalScore.toFixed(1)}
                  </p>
                  <p className="text-sm text-quest-text-muted italic mb-1 relative z-10">Pontuação Total</p>
                  <p className="text-sm text-quest-gold uppercase tracking-widest font-serif relative z-10">
                    {detailedSimulados[detailedSimulados.length - 1].title}
                  </p>
                </>
              ) : (
                <p className="font-serif text-4xl text-quest-gold mb-2 drop-shadow-md relative z-10">0</p>
              )}
            </Panel>

            <Panel className="md:col-span-2 flex flex-col">
              <div className="px-4 py-3 border-b-2 border-quest-gold-dark/30 flex items-center gap-2 text-quest-gold text-sm font-serif tracking-widest uppercase bg-black/20">
                <TrendingUp size={16} /> EVOLUÇÃO DO GUERREIRO
              </div>
              <div className="flex-1 p-4 min-h-[250px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="name" stroke="#8c7335" tick={{ fill: '#a39b8f', fontSize: 12, fontFamily: 'MedievalSharp' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#8c7335" tick={{ fill: '#a39b8f', fontSize: 12, fontFamily: 'MedievalSharp' }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1814', borderColor: '#8c7335', color: '#d4af37', fontFamily: 'MedievalSharp' }}
                        itemStyle={{ color: '#d4af37' }}
                      />
                      <Line type="monotone" dataKey="score" name="Sua Nota" stroke="#8b0000" strokeWidth={3} dot={{ fill: '#8b0000', r: 5, strokeWidth: 2, stroke: '#d4af37' }} activeDot={{ r: 8, fill: '#d4af37' }} />
                      <Line type="monotone" dataKey="target" name="Nota de Corte" stroke="#8c7335" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-quest-text-muted italic">
                    Registre simulados para ver sua evolução.
                  </div>
                )}
              </div>
            </Panel>
          </div>
          
          {/* DASHBOARD DE MATÉRIAS */}
          {detailedSimulados.length > 0 && (
            <Panel className="mb-6">
              <div className="px-4 py-3 border-b-2 border-quest-gold-dark/30 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-2 text-quest-gold text-sm font-serif tracking-widest uppercase">
                  <BookOpen size={16} /> DESEMPENHO POR MATÉRIA
                </div>
                <select 
                  value={selectedContestId}
                  onChange={e => setSelectedContestId(e.target.value)}
                  className="bg-transparent border border-quest-gold-dark/50 text-quest-gold text-xs p-1 rounded font-serif"
                >
                  {allContests.map(c => (
                    <option key={c.id} value={c.id} className="bg-quest-panel">{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-quest-red-dark/20 text-quest-gold font-serif text-xs tracking-widest uppercase border-b border-quest-gold-dark/50">
                      <th className="p-3 font-normal border-r border-quest-gold-dark/20">Matéria</th>
                      <th className="p-3 font-normal border-r border-quest-gold-dark/20 text-center">Peso</th>
                      {detailedSimulados.filter(s => s.contestId === selectedContestId).map(s => (
                        <th key={s.id} className="p-3 font-normal border-r border-quest-gold-dark/20 text-center">{s.title}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {activeContest.subjects.map((sub, idx) => (
                      <tr key={idx} className="border-b border-quest-gold-dark/20 last:border-0 hover:bg-quest-panel-light/50">
                        <td className="p-3 border-r border-quest-gold-dark/20 text-quest-text">{sub.name}</td>
                        <td className="p-3 border-r border-quest-gold-dark/20 text-center text-quest-text-muted">{sub.weight}</td>
                        {detailedSimulados.filter(s => s.contestId === selectedContestId).map(s => {
                          const score = s.subjectScores[sub.name] || 0;
                          const percentage = (score / sub.questions) * 100;
                          return (
                            <td key={s.id} className="p-3 border-r border-quest-gold-dark/20 text-center">
                              <span className={`font-mono ${percentage >= 80 ? 'text-green-400' : percentage >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {score}/{sub.questions}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}
        </div>

        {/* HISTÓRICO SEMANAL */}
        <div className="pt-4">
          <h2 className="font-serif text-quest-text text-lg tracking-widest uppercase mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-quest-gold-dark" /> HISTÓRICO SEMANAL
          </h2>
          <Panel className="p-6 space-y-6">
            {dynamicWeeklyHistory.map((week, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-quest-text">
                    <Calendar size={14} className="text-quest-gold-dark" />
                    <span>{week.date}</span>
                    {week.flashcards > 0 && (
                      <span className="ml-2 flex items-center gap-1 text-quest-gold-dark opacity-80" title={`${week.flashcards} dias de flashcards concluídos`}>
                        <BookOpen size={12} />
                        {week.flashcards}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-quest-text-muted">{week.cycles}</span>
                </div>
                <div className="flex items-center gap-4">
                  <ProgressBar progress={week.progress} className="flex-1" />
                  <span className="font-mono text-quest-text-muted text-xs w-8 text-right">{week.progress}%</span>
                </div>
              </div>
            ))}
          </Panel>
        </div>

        {/* MATÉRIAS CONCLUÍDAS */}
        {completedSubjectsData.length > 0 && (
          <div className="pt-4">
            <h2 className="font-serif text-quest-gold text-lg tracking-widest uppercase mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-quest-gold animate-pulse" /> MATÉRIAS CONCLUÍDAS (100%)
            </h2>
            <Panel className="border-quest-gold/50 shadow-[0_0_15px_rgba(184,155,94,0.2)]">
              <PanelHeader title="SALÃO DOS HERÓIS — MATÉRIAS VENCIDAS" />
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedSubjectsData.map((row, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedSubject(row.subject)}
                    className="bg-quest-panel-light/30 border border-quest-gold/30 p-4 rounded-sm flex items-center justify-between relative overflow-hidden group cursor-pointer hover:bg-quest-panel-light/50 transition-colors"
                  >
                    <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-30 transition-opacity">
                      <Trophy size={40} className="text-quest-gold" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-quest-gold font-serif tracking-widest text-sm uppercase mb-1">{row.subject}</h3>
                      <p className="text-xs text-quest-text-muted italic">Missão Cumprida!</p>
                    </div>
                    <div className="text-right relative z-10">
                      <div className="flex items-center gap-2 text-quest-gold mb-1">
                        <Crown size={16} />
                        <span className="font-mono text-lg">100%</span>
                      </div>
                      <p className="text-[10px] text-quest-gold-dark uppercase tracking-tighter">Conquista: {row.conquest}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Panel>
          </div>
        )}
          </>
        )}

        {activeTab === 'simulados' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setSimuladoModalTab('registrar');
                    setIsSimuladoModalOpen(true);
                  }} 
                  className="medieval-button flex items-center gap-2 bg-quest-red-dark hover:bg-quest-red"
                >
                  <Plus size={18} /> NOVO SIMULADO
                </button>
                <button 
                  onClick={() => {
                    setSimuladoModalTab('novo_concurso');
                    setIsSimuladoModalOpen(true);
                  }} 
                  className="medieval-button flex items-center gap-2 bg-quest-panel hover:bg-quest-panel-light"
                >
                  <Settings size={18} /> GERENCIAR CONCURSOS
                </button>
              </div>
              
              <select 
                value={selectedContestId}
                onChange={e => setSelectedContestId(e.target.value)}
                className="bg-transparent border border-quest-gold-dark/50 text-quest-gold p-2 rounded font-serif text-lg"
              >
                {allContests.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#1a1814]">{c.name}</option>
                ))}
              </select>
            </div>

            <h2 className="font-serif text-quest-gold text-xl tracking-widest uppercase flex items-center gap-3 drop-shadow-md border-b border-quest-gold-dark/30 pb-2">
              ⚔ {activeContest.name} <span className="text-sm text-quest-text-muted normal-case">(corte: {activeContest.cutoffScore})</span>
            </h2>

            <div className="space-y-6">
              {detailedSimulados.filter(s => s.contestId === selectedContestId).length === 0 ? (
                <div className="text-center py-12 text-quest-text-muted italic font-serif">
                  Nenhum simulado registrado para este concurso.
                </div>
              ) : (
                detailedSimulados
                  .filter(s => s.contestId === selectedContestId)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(simulado => {
                    const isApproved = simulado.totalScore >= activeContest.cutoffScore;
                    const isWarning = simulado.totalScore >= activeContest.warningScore && !isApproved;
                    
                    return (
                      <Panel className="p-0 overflow-hidden">
                        <div className="p-4 border-b border-quest-gold-dark/30 flex justify-between items-start bg-black/20">
                          <div>
                            <h3 className="font-serif text-quest-gold text-lg tracking-widest uppercase">{simulado.title}</h3>
                            <p className="text-xs text-quest-text-muted">{simulado.date.split('-').reverse().join('/')}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`font-serif text-4xl ${isApproved ? 'text-quest-gold' : isWarning ? 'text-yellow-500' : 'text-red-400'}`}>
                                {simulado.totalScore.toFixed(1)}
                              </p>
                              <p className={`text-xs tracking-widest uppercase ${isApproved ? 'text-quest-gold' : isWarning ? 'text-yellow-500' : 'text-red-400'}`}>
                                {isApproved ? 'APROVADO' : 'REPROVADO'}
                              </p>
                            </div>
                            {deletingSimuladoId === simulado.id ? (
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={async () => {
                                    try {
                                      // Optimistic update
                                      setDetailedSimulados(prev => prev.filter(item => item.id !== simulado.id));
                                      await supabase.from('detailed_simulados').delete().eq('id', simulado.id);
                                      setDeletingSimuladoId(null);
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="text-quest-red font-bold text-xs uppercase hover:underline"
                                >
                                  Confirmar
                                </button>
                                <button 
                                  onClick={() => setDeletingSimuladoId(null)}
                                  className="text-quest-text-muted text-xs uppercase hover:underline"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setDeletingSimuladoId(simulado.id)}
                                className="text-quest-red-dark hover:text-quest-red transition-colors p-2"
                                title="Excluir Simulado"
                              >
                                <Trash2 size={20} />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-quest-gold-dark/20">
                          {activeContest.subjects.map((sub: any, idx: number) => {
                            const score = simulado.subjectScores[sub.name] || 0;
                            return (
                              <div key={idx} className="bg-quest-panel p-4 flex flex-col items-center justify-center text-center">
                                <p className="text-xs text-quest-gold-dark mb-1 font-serif">{sub.name}</p>
                                <p className="font-serif text-xl text-quest-gold">{score}/{sub.questions}</p>
                              </div>
                            );
                          })}
                        </div>
                      </Panel>
                    );
                  })
              )}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="pt-16 pb-8 text-center relative">
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-quest-gold-dark to-transparent"></div>
          <div className="flex justify-center mb-6">
            <CrestLogo className="w-10 h-10 text-quest-gold-dark/40" />
          </div>
          <p className="font-serif italic text-quest-gold text-lg drop-shadow-md">
            "O dragão que guarda o tesouro não dorme — e nem o guerreiro que estuda"
          </p>
        </footer>

      </motion.main>

      {/* SIMULADO MODAL */}
      <AnimatePresence>
      {isSimuladoModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-quest-panel border-2 border-quest-gold-dark rounded-sm max-w-4xl w-full max-h-[90vh] flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.8)]"
          >
            <div className="p-4 border-b-2 border-quest-gold-dark/30 flex justify-between items-center bg-black/40">
              <h2 className="font-serif text-quest-gold text-xl tracking-widest uppercase flex items-center gap-2">
                <Trophy size={20} className="text-quest-gold" /> 
                ÁREA DE SIMULADOS
              </h2>
              <button onClick={() => setIsSimuladoModalOpen(false)} className="text-quest-text-muted hover:text-quest-red transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex border-b border-quest-gold-dark/30">
              <button 
                className={`flex-1 py-3 font-serif tracking-widest uppercase text-sm transition-colors ${simuladoModalTab === 'registrar' ? 'bg-quest-red-dark/20 text-quest-gold border-b-2 border-quest-gold' : 'text-quest-text-muted hover:bg-white/5'}`}
                onClick={() => setSimuladoModalTab('registrar')}
              >
                Registrar Nota
              </button>
              <button 
                className={`flex-1 py-3 font-serif tracking-widest uppercase text-sm transition-colors ${simuladoModalTab === 'novo_concurso' ? 'bg-quest-red-dark/20 text-quest-gold border-b-2 border-quest-gold' : 'text-quest-text-muted hover:bg-white/5'}`}
                onClick={() => setSimuladoModalTab('novo_concurso')}
              >
                Novo Concurso
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {simuladoModalTab === 'registrar' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <input 
                      type="text" 
                      value={newDetailedSimulado.title}
                      onChange={e => setNewDetailedSimulado({...newDetailedSimulado, title: e.target.value})}
                      placeholder="Nome do Simulado (ex: Simulado 1)" 
                      className="flex-1 medieval-input"
                    />
                    <select 
                      value={newDetailedSimulado.contestId}
                      onChange={e => setNewDetailedSimulado({...newDetailedSimulado, contestId: e.target.value, subjectScores: {}})}
                      className="medieval-input md:w-1/3"
                    >
                      {allContests.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allContests.find(c => c.id === newDetailedSimulado.contestId)?.subjects.map((sub: any) => (
                      <div key={sub.name} className="flex flex-col gap-1">
                        <label className="text-xs text-quest-text-muted font-serif tracking-wide">
                          {sub.name} (Peso {sub.weight} | Máx {sub.questions})
                        </label>
                        <input 
                          type="number" 
                          min="0"
                          max={sub.questions}
                          value={newDetailedSimulado.subjectScores[sub.name] || ''}
                          onChange={e => {
                            const val = Math.min(Math.max(0, Number(e.target.value)), sub.questions);
                            setNewDetailedSimulado({
                              ...newDetailedSimulado,
                              subjectScores: { ...newDetailedSimulado.subjectScores, [sub.name]: val }
                            });
                          }}
                          placeholder="Acertos" 
                          className="medieval-input"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-quest-gold-dark/20">
                    <button onClick={addDetailedSimulado} className="medieval-button flex items-center justify-center gap-2">
                      <Plus size={16} /> Registrar Simulado
                    </button>
                  </div>
                </div>
              )}

              {simuladoModalTab === 'novo_concurso' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <input 
                      type="text" 
                      value={newContest.name}
                      onChange={e => setNewContest({...newContest, name: e.target.value})}
                      placeholder="Nome do Concurso" 
                      className="flex-1 medieval-input"
                    />
                    <input 
                      type="number" 
                      value={newContest.cutoffScore || ''}
                      onChange={e => setNewContest({...newContest, cutoffScore: Number(e.target.value)})}
                      placeholder="Nota de Corte" 
                      className="medieval-input md:w-1/4"
                    />
                    <input 
                      type="number" 
                      value={newContest.warningScore || ''}
                      onChange={e => setNewContest({...newContest, warningScore: Number(e.target.value)})}
                      placeholder="Nota de Alerta" 
                      className="medieval-input md:w-1/4"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-serif text-quest-gold text-lg border-b border-quest-gold-dark/30 pb-2">Matérias</h3>
                    {newContest.subjects.map((sub, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row gap-2 items-center bg-black/20 p-2 rounded border border-quest-gold-dark/20">
                        <input 
                          type="text" 
                          value={sub.name}
                          onChange={e => {
                            const newSubjects = [...newContest.subjects];
                            newSubjects[idx].name = e.target.value;
                            setNewContest({...newContest, subjects: newSubjects});
                          }}
                          placeholder="Nome da Matéria" 
                          className="flex-1 medieval-input text-sm"
                        />
                        <input 
                          type="number" 
                          value={sub.questions || ''}
                          onChange={e => {
                            const newSubjects = [...newContest.subjects];
                            newSubjects[idx].questions = Number(e.target.value);
                            setNewContest({...newContest, subjects: newSubjects});
                          }}
                          placeholder="Qtd. Questões" 
                          className="medieval-input w-32 text-sm"
                        />
                        <input 
                          type="number" 
                          step="0.1"
                          value={sub.weight || ''}
                          onChange={e => {
                            const newSubjects = [...newContest.subjects];
                            newSubjects[idx].weight = Number(e.target.value);
                            setNewContest({...newContest, subjects: newSubjects});
                          }}
                          placeholder="Peso" 
                          className="medieval-input w-24 text-sm"
                        />
                        <button 
                          onClick={() => {
                            const newSubjects = newContest.subjects.filter((_, i) => i !== idx);
                            setNewContest({...newContest, subjects: newSubjects});
                          }}
                          className="p-2 text-quest-text-muted hover:text-quest-red transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => setNewContest({...newContest, subjects: [...newContest.subjects, { name: '', questions: 10, weight: 1 }]})}
                      className="text-sm font-serif text-quest-gold hover:text-quest-red transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} /> Adicionar Matéria
                    </button>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-quest-gold-dark/20">
                    <button onClick={addContest} className="medieval-button flex items-center justify-center gap-2">
                      <Plus size={16} /> Salvar Concurso
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* TASK MODAL */}
      <AnimatePresence>
      {selectedSubject && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-quest-panel border-2 border-quest-gold-dark rounded-sm max-w-2xl w-full max-h-[80vh] flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.8)]"
          >
            <div className="flex justify-between items-center p-4 border-b border-quest-gold-dark/50 bg-quest-red-dark">
              <h2 className="font-serif text-quest-gold text-xl tracking-widest uppercase">{selectedSubject} - Tarefas</h2>
              <button onClick={() => setSelectedSubject(null)} className="text-quest-gold hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            {subjectTasks[selectedSubject] && (
              <div className="px-4 pt-4 pb-2 border-b border-quest-gold-dark/20 bg-quest-panel">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-quest-text-muted uppercase tracking-widest font-serif">Progresso das Tarefas</span>
                  <span className="text-xs text-quest-gold font-mono">
                    {subjectTasks[selectedSubject].filter(t => taskCompletions[`${selectedSubject}_${t.id}`]).length} / {subjectTasks[selectedSubject].length}
                  </span>
                </div>
                <ProgressBar progress={Math.round((subjectTasks[selectedSubject].filter(t => taskCompletions[`${selectedSubject}_${t.id}`]).length / subjectTasks[selectedSubject].length) * 100)} />
              </div>
            )}
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {subjectTasks[selectedSubject] ? (
                subjectTasks[selectedSubject].map(task => {
                  const isTaskCompleted = !!taskCompletions[`${selectedSubject}_${task.id}`];
                  return (
                    <motion.div 
                      key={task.id}
                      initial={false}
                      animate={{ scale: isTaskCompleted ? 0.98 : 1 }}
                      className={`flex items-start gap-3 p-3 border border-quest-gold-dark/20 rounded hover:bg-quest-panel-light transition-all ${isTaskCompleted ? 'opacity-50 bg-black/30' : 'bg-black/10'}`}
                    >
                      <motion.button 
                        whileTap={{ scale: 0.8 }}
                        className="mt-0.5 text-quest-gold-dark hover:text-quest-gold transition-colors"
                        onClick={() => setSelectedTaskContent({ 
                          title: task.title, 
                          content: getTaskContent(selectedSubject, task.id),
                          taskId: task.id,
                          subject: selectedSubject
                        })}
                        title="Ver conteúdo da tarefa"
                      >
                        <Eye size={20} />
                      </motion.button>
                      <motion.div 
                        whileTap={{ scale: 0.8 }}
                        className="mt-0.5 text-quest-gold-dark cursor-pointer"
                        onClick={() => toggleTask(selectedSubject, task.id, isTaskCompleted)}
                      >
                        {isTaskCompleted ? <CheckSquare className="text-quest-red" size={20} /> : <Square size={20} />}
                      </motion.div>
                      <span 
                        className={`text-sm cursor-pointer flex-1 ${isTaskCompleted ? 'line-through text-quest-text-muted' : 'text-quest-text'}`}
                        onClick={() => toggleTask(selectedSubject, task.id, isTaskCompleted)}
                      >
                        {task.title}
                      </span>
                    </motion.div>
                  );
                })
              ) : (
                <p className="text-quest-text-muted italic text-center py-8">Nenhuma tarefa detalhada para esta matéria ainda.</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* TASK CONTENT MODAL */}
      <AnimatePresence>
      {selectedTaskContent && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-quest-panel border-2 border-quest-gold-dark rounded-sm max-w-4xl w-full h-[90vh] flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.8)]"
          >
            <div className="flex justify-between items-center p-4 border-b border-quest-gold-dark/50 bg-quest-red-dark">
              <h2 className="font-serif text-quest-gold text-xl tracking-widest uppercase truncate pr-4">{selectedTaskContent.title}</h2>
              <button onClick={() => setSelectedTaskContent(null)} className="text-quest-gold hover:text-white transition-colors flex-shrink-0">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-[#fdfbf7] text-gray-800 font-sans text-base leading-relaxed">
              <div className="max-w-3xl mx-auto flex flex-col items-center">
                {selectedTaskContent.subject === 'Conhecimentos Bancários' && cbTasksPages[selectedTaskContent.taskId] ? (
                  <div className="w-full flex flex-col items-center gap-4">
                    <Document
                      file="/conhecimentos_bancarios.pdf"
                      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                      loading={<div className="p-8 text-center text-gray-500">Carregando PDF...</div>}
                      error={<div className="p-8 text-center text-red-500">Erro ao carregar o PDF. Verifique se o arquivo conhecimentos_bancarios.pdf está na pasta public.</div>}
                    >
                      {cbTasksPages[selectedTaskContent.taskId].map(pageNumber => (
                        <div key={pageNumber} className="mb-6 shadow-lg border border-gray-200 bg-white">
                          <Page 
                            pageNumber={pageNumber} 
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            width={Math.min(window.innerWidth * 0.8, 800)}
                          />
                        </div>
                      ))}
                    </Document>
                  </div>
                ) : selectedTaskContent.subject === 'Vendas e Negociação' && vnTasksPages[selectedTaskContent.taskId] ? (
                  <div className="w-full flex flex-col items-center gap-4">
                    <Document
                      file="/vendas.pdf"
                      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                      loading={<div className="p-8 text-center text-gray-500">Carregando PDF...</div>}
                      error={<div className="p-8 text-center text-red-500">Erro ao carregar o PDF. Verifique se o arquivo vendas.pdf está na pasta public.</div>}
                    >
                      {vnTasksPages[selectedTaskContent.taskId].map(pageNumber => (
                        <div key={pageNumber} className="mb-6 shadow-lg border border-gray-200 bg-white">
                          <Page 
                            pageNumber={pageNumber} 
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            width={Math.min(window.innerWidth * 0.8, 800)}
                          />
                        </div>
                      ))}
                    </Document>
                  </div>
                ) : selectedTaskContent.subject === 'Vendas e Negociação' ? (
                  <div className="whitespace-pre-wrap w-full">
                    {selectedTaskContent.content}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap w-full">
                    {selectedTaskContent.content}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
