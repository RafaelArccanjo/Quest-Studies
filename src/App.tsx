import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, Swords, BookOpen, LogOut, FileText, PenTool, 
  CheckSquare, Square, TrendingUp, Calendar, Shield, ShieldAlert, Plus, Minus, X, Eye, Trash2, Settings,
  Crown, Scroll, Sparkles, Timer, History, RotateCcw, Play, Pause, SkipForward, Flame, Coffee, CheckCircle2, RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';
import { cbTasksContent } from './data/cbTasksContent';
import { cbTasksPages } from './data/cbTasksPages';
import { vnTasksPages } from './data/vnTasksPages';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { CrestLogo } from './components/Icons';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

// --- REUSABLE COMPONENTS ---
const DEFAULT_STUDY_CYCLE = [
  'Língua Portuguesa e Redação Oficial',
  'Direitos Humanos e Tratamento Penal',
  'Direito Administrativo',
  'Direito Penal',
  'Administração Pública',
  'Direito Constitucional',
  'Ética Profissional',
  'Informática',
  'Lei de Execução Penal',
  'Vendas e Negociação',
  'Conhecimentos Bancários',
  'Matemática'
];

const battleTable = [
  { subject: 'Língua Portuguesa e Redação Oficial', conquest: '0/0', progress: 0 },
  { subject: 'Direitos Humanos e Tratamento Penal', conquest: '0/0', progress: 0 },
  { subject: 'Direito Administrativo', conquest: '0/0', progress: 0 },
  { subject: 'Direito Penal', conquest: '0/0', progress: 0 },
  { subject: 'Administração Pública', conquest: '0/0', progress: 0 },
  { subject: 'Direito Constitucional', conquest: '0/0', progress: 0 },
  { subject: 'Ética Profissional', conquest: '0/0', progress: 0 },
  { subject: 'Informática', conquest: '0/0', progress: 0 },
  { subject: 'Lei de Execução Penal', conquest: '0/0', progress: 0 },
  { subject: 'Vendas e Negociação', conquest: '0/40', progress: 0 },
  { subject: 'Conhecimentos Bancários', conquest: '0/48', progress: 0 },
  { subject: 'Matemática', conquest: '0/0', progress: 0 },
];

const weeklyHistory = [
  { date: '16/03 - 22/03', cycles: '7/21 ciclos', progress: 33 },
  { date: '09/03 - 15/03', cycles: '18/21 ciclos', progress: 86 },
  { date: '02/03 - 08/03', cycles: '2/21 ciclos', progress: 10 },
];

const subjectTasks: Record<string, { id: string, title: string }[]> = {
  'Língua Portuguesa e Redação Oficial': [],
  'Direitos Humanos e Tratamento Penal': [],
  'Direito Administrativo': [],
  'Direito Penal': [],
  'Administração Pública': [],
  'Direito Constitucional': [],
  'Ética Profissional': [],
  'Informática': [],
  'Lei de Execução Penal': [],
  'Matemática': [],
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

const ProgressBar = ({ progress, className = '', onClick }: { progress: number, className?: string, onClick?: () => void }) => (
  <div className={`h-2 bg-quest-panel-light border border-quest-gold-dark/50 rounded-full overflow-hidden shadow-inner ${className}`} onClick={onClick}>
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

// --- MAIN APP ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showRain, setShowRain] = useState(false);

  const [studyCycle, setStudyCycle] = useState<string[]>(() => {
    const saved = localStorage.getItem('studyCycleOrder');
    return saved ? JSON.parse(saved) : DEFAULT_STUDY_CYCLE;
  });

  useEffect(() => {
    localStorage.setItem('studyCycleOrder', JSON.stringify(studyCycle));
  }, [studyCycle]);

  const triggerDragonEncounter = () => {
    setShowRain(true);
    
    // Quick, low-volume metal clink
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio play failed", e));

    setTimeout(() => setShowRain(false), 5000);
  };

  const triggerMedievalEffects = () => {
    // Quick, low-volume metal clink
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    audio.volume = 0.4;
    audio.play().catch(e => console.log("Audio play failed", e));
    
    setShowRain(true);
    setTimeout(() => setShowRain(false), 4000);
  };

  const playClickSound = () => {
    // Quick, low-volume metal clink
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    audio.volume = 0.3;
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'simulados' | 'ciclo'>('dashboard');
  const [cicloView, setCicloView] = useState<'ativo' | 'config' | 'historico'>('config');
  const [subjectModalTab, setSubjectModalTab] = useState<'tasks' | 'notes'>('tasks');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [currentNoteText, setCurrentNoteText] = useState('');

  useEffect(() => {
    if (selectedSubject) {
      setSubjectModalTab('tasks');
      setIsAddingNote(false);
      setCurrentNoteText('');
    }
  }, [selectedSubject]);

  const [subjectNotes, setSubjectNotes] = useState<Record<string, {id: string, date: string, text: string}[]>>(() => {
    const saved = localStorage.getItem('subjectNotes');
    if (!saved) return {};
    try {
      const parsed = JSON.parse(saved);
      const migrated: Record<string, {id: string, date: string, text: string}[]> = {};
      Object.keys(parsed).forEach(key => {
        if (Array.isArray(parsed[key])) {
          migrated[key] = parsed[key];
        } else if (typeof parsed[key] === 'string') {
          migrated[key] = [{
            id: 'legacy-' + Math.random().toString(36).substr(2, 9),
            date: 'Antiga',
            text: parsed[key]
          }];
        }
      });
      return migrated;
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('subjectNotes', JSON.stringify(subjectNotes));
  }, [subjectNotes]);

  const saveSubjectNote = (subject: string) => {
    if (!currentNoteText.trim()) return;

    const newNote = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('pt-BR'),
      text: currentNoteText
    };

    setSubjectNotes(prev => ({
      ...prev,
      [subject]: [newNote, ...(prev[subject] || [])]
    }));
    
    setCurrentNoteText('');
    setIsAddingNote(false);
    addToast("Anotação de revisão salva!", "success");
  };

  const deleteSubjectNote = (subject: string, noteId: string) => {
    setSubjectNotes(prev => ({
      ...prev,
      [subject]: prev[subject].filter(note => note.id !== noteId)
    }));
    addToast("Anotação excluída.", "success");
  };

  // --- CICLO DE ESTUDOS STATE ---
  const [cycleQueue, setCycleQueue] = useState<string[]>([]);
  const [currentCycleIdx, setCurrentCycleIdx] = useState(0);
  const [cycleTimeLeft, setCycleTimeLeft] = useState(0);
  const [cyclePhase, setCyclePhase] = useState<'idle' | 'study' | 'break'>('idle');
  const [isCycleRunning, setIsCycleRunning] = useState(false);
  const [doublePending, setDoublePending] = useState(false);
  const [isDouble, setIsDouble] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [studiedMinutes, setStudiedMinutes] = useState(0);
  const [doubleCount, setDoubleCount] = useState(0);
  const [cycleHistory, setCycleHistory] = useState<any[]>([]);
  const [studyMin, setStudyMin] = useState(50);
  const [breakMin, setBreakMin] = useState(10);
  const [selectedCycleSubjects, setSelectedCycleSubjects] = useState<string[]>([]);
  const [toasts, setToasts] = useState<any[]>([]);

  const [reviewSubjects, setReviewSubjects] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('reviewSubjects');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('reviewSubjects', JSON.stringify(reviewSubjects));
  }, [reviewSubjects]);

  const toggleReviewSubject = (subject: string) => {
    setReviewSubjects(prev => ({
      ...prev,
      [subject]: !prev[subject]
    }));
    addToast(reviewSubjects[subject] ? `📚 ${subject} removida da revisão.` : `🔄 ${subject} marcada para revisão!`, "success");
  };

  const weekDates = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - day + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const completedSubjects = useMemo(() => {
    return studyCycle.filter(subject => {
      // A subject is completed if it has been finished 2 times in the current week
      let count = 0;
      weekDates.forEach(date => {
        if (completions[`${date}_${subject}`]) count++;
      });
      return count >= 2;
    });
  }, [completions, studyCycle, weekDates]);

  const activeStudyCycle = useMemo(() => {
    return studyCycle.filter(subject => !completedSubjects.includes(subject) || reviewSubjects[subject]);
  }, [completedSubjects, studyCycle, reviewSubjects]);

  const cycleSubjects = activeStudyCycle;

  const addToast = (message: string, type: 'success' | 'warning' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const addHistoryEvent = (subject: string, note: string, type: 'study' | 'double' | 'break') => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCycleHistory(prev => [{
      id: Date.now(),
      subject,
      note,
      type,
      time: timeStr
    }, ...prev]);
  };

  const startStudyPhase = () => {
    setCyclePhase('study');
    setCycleTimeLeft(studyMin * 60);
    setIsCycleRunning(true);
  };

  const startBreakPhase = () => {
    addHistoryEvent(cycleQueue[currentCycleIdx], `${studyMin}min de estudo concluídos`, 'study');
    setCompletedCycles(prev => prev + 1);
    setStudiedMinutes(prev => prev + studyMin);
    
    setCyclePhase('break');
    setCycleTimeLeft(breakMin * 60);
    addToast(`☕ Pausa de ${breakMin}min! Descanse, guerreiro.`, 'success');
  };

  const advanceToNextSubject = () => {
    addHistoryEvent('Pausa', `${breakMin}min de pausa`, 'break');
    
    if (doublePending) {
      setIsDouble(true);
      setDoublePending(false);
      setDoubleCount(prev => prev + 1);
      // Keep currentIdx
    } else {
      setIsDouble(false);
      setCurrentCycleIdx(prev => (prev + 1) % cycleQueue.length);
    }
    
    startStudyPhase();
  };

  const skipPhase = () => {
    playClickSound();
    if (cyclePhase === 'study') {
      startBreakPhase();
    } else if (cyclePhase === 'break') {
      advanceToNextSubject();
    }
  };

  const activateDouble = () => {
    if (cyclePhase === 'study' && !doublePending) {
      playClickSound();
      setDoublePending(true);
      addHistoryEvent(cycleQueue[currentCycleIdx], "Ciclo duplo ativado", 'double');
      addToast(`🔥 Ciclo duplo ativado! ${studyMin}min extras na mesma matéria.`, 'warning');
    }
  };

  const resetCycle = () => {
    if (window.confirm("Deseja realmente reiniciar o ciclo? Isso zerará todos os contadores.")) {
      setCompletedCycles(0);
      setStudiedMinutes(0);
      setDoubleCount(0);
      setCycleHistory([]);
      setCyclePhase('idle');
      setIsCycleRunning(false);
      setCycleTimeLeft(0);
      setCurrentCycleIdx(0);
      setDoublePending(false);
      setIsDouble(false);
      addToast("🔄 Ciclo reiniciado!", "warning");
    }
  };

  const startCycle = () => {
    if (selectedCycleSubjects.length === 0) {
      addToast("Selecione ao menos uma matéria!", "warning");
      return;
    }
    setCycleQueue(selectedCycleSubjects);
    setCurrentCycleIdx(0);
    setCompletedCycles(0);
    setStudiedMinutes(0);
    setDoubleCount(0);
    setCycleHistory([]);
    setDoublePending(false);
    setIsDouble(false);
    setCyclePhase('study');
    setCycleTimeLeft(studyMin * 60);
    setIsCycleRunning(false); // Wait for click to start
    setCicloView('ativo');
    addToast(`🏰 Ciclo configurado! ${selectedCycleSubjects.length} matérias na fila.`, "success");
  };

  useEffect(() => {
    let timer: any;
    if (isCycleRunning && cycleTimeLeft > 0) {
      timer = setInterval(() => {
        setCycleTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isCycleRunning && cycleTimeLeft === 0) {
      if (cyclePhase === 'study') {
        startBreakPhase();
      } else if (cyclePhase === 'break') {
        advanceToNextSubject();
      }
    }
    return () => clearInterval(timer);
  }, [isCycleRunning, cycleTimeLeft, cyclePhase]);
  const [newSimulado, setNewSimulado] = useState({ title: '', score: 0, targetScore: 80 });
  const [newDetailedSimulado, setNewDetailedSimulado] = useState({ title: '', contestId: 'bb', subjectScores: {} as Record<string, number> });
  const [newContest, setNewContest] = useState({ name: '', cutoffScore: 80, warningScore: 72, subjects: [{ name: '', questions: 10, weight: 1 }] });
  const [newRedacao, setNewRedacao] = useState({ theme: '', score: 0 });
  const [editingRedacao, setEditingRedacao] = useState<any | null>(null);
  const [selectedContestId, setSelectedContestId] = useState('bb');
  const [dailyMissionsLimit, setDailyMissionsLimit] = useState(3);
  const [deletingSimuladoId, setDeletingSimuladoId] = useState<string | null>(null);
  const [deletingRedacaoId, setDeletingRedacaoId] = useState<string | null>(null);
  const [editingSimulado, setEditingSimulado] = useState<any | null>(null);

  const [isDbSetupError, setIsDbSetupError] = useState(false);
  const [loginEmail, setLoginEmail] = useState('admin@admin.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState<string | null>(null);

  const todayDayOfWeek = useMemo(() => new Date().getDay(), []);
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const flashcardHistory = useMemo(() => {
    const history = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      history.push({
        date: dStr,
        completed: !!completions[`${dStr}_Flashcards`]
      });
    }
    return history;
  }, [completions]);

  const allContests = useMemo(() => [...CONTESTS, ...userContests], [userContests]);

  const chartData = useMemo(() => {
    return [
      ...simulados.map(s => ({
        name: s.title || 'Simulado',
        score: Number(s.score || 0),
        target: Number(s.target_score || 80),
        date: s.date || s.created_at || new Date().toISOString()
      })),
      ...detailedSimulados.map(s => ({
        name: s.title || 'Simulado Detalhado',
        score: Number(s.totalScore || 0),
        target: Number(allContests.find(c => c.id === s.contestId)?.cutoffScore || 80),
        date: s.date || s.created_at || new Date().toISOString()
      }))
    ].filter(d => {
      const time = new Date(d.date).getTime();
      return !isNaN(time);
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [simulados, detailedSimulados, allContests]);

  // Debug log for chart data
  useEffect(() => {
    console.log("Chart Data state:", {
      simuladosCount: simulados.length,
      detailedSimuladosCount: detailedSimulados.length,
      chartDataCount: chartData.length,
      chartData: chartData
    });
  }, [simulados.length, detailedSimulados.length, chartData.length]);

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
            date: s.date,
            created_at: s.created_at
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

  const currentWeekFlashcards = useMemo(() => {
    return weekDates.filter(date => completions[`${date}_Flashcards`]).length;
  }, [weekDates, completions]);

  const currentWeekCycles = useMemo(() => {
    return studyCycle.reduce((acc, subject) => {
      let count = 0;
      weekDates.forEach(date => {
        if (completions[`${date}_${subject}`]) count++;
      });
      return acc + Math.min(count, 2);
    }, 0);
  }, [weekDates, completions, studyCycle]);

  const totalWeeklyCycles = useMemo(() => studyCycle.length * 2, [studyCycle]);
  
  const currentWeekProgress = useMemo(() => {
    return totalWeeklyCycles > 0 ? Math.round((currentWeekCycles / totalWeeklyCycles) * 100) : 0;
  }, [currentWeekCycles, totalWeeklyCycles]);
  
  const currentWeekLabel = useMemo(() => {
    return `${weekDates[0].split('-').reverse().slice(0,2).join('/')} - ${weekDates[6].split('-').reverse().slice(0,2).join('/')}`;
  }, [weekDates]);

  const dynamicWeeklyHistory = useMemo(() => {
    return [
      { 
        date: currentWeekLabel, 
        cycles: `${currentWeekCycles}/${totalWeeklyCycles} ciclos`, 
        progress: currentWeekProgress,
        flashcards: currentWeekFlashcards
      },
      ...weeklyHistory.map(w => ({ ...w, flashcards: 0 }))
    ];
  }, [currentWeekLabel, currentWeekCycles, totalWeeklyCycles, currentWeekProgress, currentWeekFlashcards]);

  const todaysMissions = useMemo(() => {
    // Find the first N subjects not completed today
    const missions: { subject: string; time: string; completed: boolean }[] = [];
    let count = 0;
    
    for (const subject of studyCycle) {
      if (count >= dailyMissionsLimit) break;
      const completedToday = !!completions[`${todayDateStr}_${subject}`];
      const isLongTermCompleted = completedSubjects.includes(subject);
      
      if (!isLongTermCompleted) {
        missions.push({
          subject,
          time: '1h',
          completed: completedToday
        });
        if (!completedToday) count++;
      }
    }
    
    return missions;
  }, [completions, todayDateStr, completedSubjects, studyCycle, dailyMissionsLimit]);

  const completedMissions = currentWeekCycles;
  const totalMissions = totalWeeklyCycles;
  const questProgress = currentWeekProgress;

  const activeContest = useMemo(() => allContests.find(c => c.id === selectedContestId) || allContests[0], [allContests, selectedContestId]);

  // Calculate Battle Table
  const battleStats = useMemo(() => {
    const stats: Record<string, { total: number, completed: number }> = {};
    studyCycle.forEach(subject => {
      if (!stats[subject]) stats[subject] = { total: 0, completed: 0 };
      stats[subject].total = 2; // Goal of 2 completions per week
      weekDates.forEach(dateStr => {
        if (completions[`${dateStr}_${subject}`]) {
          stats[subject].completed += 1;
        }
      });
    });
    return stats;
  }, [weekDates, completions, studyCycle]);

  const dynamicBattleTable = useMemo(() => {
    return studyCycle.map(subject => {
      const stats = battleStats[subject] || { completed: 0, total: 2 };
      const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      return {
        subject,
        conquest: `${stats.completed}/${stats.total}`,
        progress
      };
    });
  }, [battleStats, studyCycle]);

  const completedSubjectsData = useMemo(() => {
    return completedSubjects.map(subject => {
      const stats = battleStats[subject] || { completed: 0, total: 0 };
      return {
        subject,
        conquest: `${stats.completed}/${stats.total}`,
        progress: 100
      };
    });
  }, [completedSubjects, battleStats]);

  const addRedacao = async () => {
    if (!newRedacao.theme.trim() || !user) return;
    
    // Handle comma instead of dot
    const parsedScore = Number(String(newRedacao.score).replace(',', '.'));
    const finalScore = isNaN(parsedScore) ? 0 : parsedScore;

    try {
      if (editingRedacao) {
        const { error } = await supabase.from('redacoes').update({
          theme: newRedacao.theme,
          score: finalScore,
        }).eq('id', editingRedacao.id);
        if (error) throw error;
        setEditingRedacao(null);
      } else {
        const { error } = await supabase.from('redacoes').insert({
          user_id: user.id,
          theme: newRedacao.theme,
          score: finalScore,
          date: new Date().toISOString().split('T')[0]
        });
        if (error) throw error;
      }
      
      setNewRedacao({ theme: '', score: 0 });
    } catch (err: any) {
      console.error("Erro ao salvar redação: " + err.message);
    }
  };

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
        playClickSound();
        const { error } = await supabase.from('completions').delete().eq('id', docId);
        if (error) throw error;
        // Optimistic update or manual refetch
        setCompletions(prev => {
          const next = { ...prev };
          delete next[`${dateStr}_${subject}`];
          return next;
        });
      } else {
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
        const currentTodaysMissions = studyCycle.map(subject => ({
          subject,
          completed: !!completions[`${dateStr}_${subject}`] || subject === subject
        })).slice(0, 3);
        
        const otherMissions = currentTodaysMissions.filter(m => m.subject !== subject);
        const allOthersCompleted = otherMissions.every(m => m.completed);
        
        if (allOthersCompleted && currentTodaysMissions.length > 0) {
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
        playClickSound();
        const { error } = await supabase.from('completions').delete().eq('id', docId);
        if (error) throw error;
        setCompletions(prev => {
          const next = { ...prev };
          delete next[`${dateStr}_Flashcards`];
          return next;
        });
      } else {
        const { error } = await supabase.from('completions').upsert({
          id: docId,
          user_id: user.id,
          date: dateStr,
          subject: 'Flashcards'
        });
        if (error) throw error;
        setCompletions(prev => ({ ...prev, [`${dateStr}_Flashcards`]: true }));
        
        triggerMedievalEffects();
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
        playClickSound();
        const { error } = await supabase.from('task_completions').delete().eq('id', docId);
        if (error) throw error;
        setTaskCompletions(prev => {
          const next = { ...prev };
          delete next[`${subject}_${taskId}`];
          return next;
        });
      } else {
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
      if (editingSimulado) {
        const { error } = await supabase.from('detailed_simulados').update({
          title: newDetailedSimulado.title,
          contest_id: newDetailedSimulado.contestId,
          subject_scores: newDetailedSimulado.subjectScores,
          total_score: totalScore,
        }).eq('id', editingSimulado.id);
        if (error) throw error;
        addToast("⚔️ Simulado atualizado com sucesso!", "success");
        setEditingSimulado(null);
      } else {
        const { error } = await supabase.from('detailed_simulados').insert({
          user_id: user.id,
          title: newDetailedSimulado.title,
          contest_id: newDetailedSimulado.contestId,
          subject_scores: newDetailedSimulado.subjectScores,
          total_score: totalScore,
          date: new Date().toISOString().split('T')[0]
        });
        if (error) throw error;
        addToast("🏆 Simulado registrado com sucesso!", "success");
      }
      setNewDetailedSimulado({ title: '', contestId: 'bb', subjectScores: {} });
      setIsSimuladoModalOpen(false);
    } catch (err: any) {
      console.error("Erro ao registrar simulado detalhado: " + err.message);
      addToast("❌ Erro ao salvar simulado: " + err.message, "warning");
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

  const getTaskContent = (subject: string, taskId: string) => {
    if (subject === 'Conhecimentos Bancários') {
      return cbTasksContent[taskId] || 'Conteúdo detalhado não disponível para esta tarefa no momento.';
    }
    return 'Conteúdo detalhado não disponível para esta tarefa no momento.';
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

  const renderCicloContent = () => {
    if (cicloView === 'config') {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <Panel>
            <PanelHeader title="Configurar Ciclo" icon={Settings} />
            <div className="p-6 space-y-6">
              <p className="text-quest-text-muted italic text-center font-serif">
                Selecione as matérias que farão parte da sua jornada hoje.
              </p>
              
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setSelectedCycleSubjects(cycleSubjects)}
                  className="text-xs uppercase tracking-widest text-quest-gold hover:underline"
                >
                  Selecionar todas
                </button>
                <button 
                  onClick={() => setSelectedCycleSubjects([])}
                  className="text-xs uppercase tracking-widest text-quest-text-muted hover:underline"
                >
                  Desmarcar todas
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {cycleSubjects.map(subject => {
                  const isSelected = selectedCycleSubjects.includes(subject);
                  return (
                    <button
                      key={subject}
                      onClick={() => {
                        setSelectedCycleSubjects(prev => 
                          prev.includes(subject) 
                            ? prev.filter(s => s !== subject) 
                            : [...prev, subject]
                        );
                      }}
                      className={`p-3 text-left border transition-all flex items-center gap-3 rounded-sm ${
                        isSelected 
                          ? 'bg-quest-gold/20 border-quest-gold text-quest-gold shadow-[0_0_10px_rgba(184,155,94,0.2)]' 
                          : 'bg-quest-panel-light border-quest-gold-dark/30 text-quest-text-muted hover:border-quest-gold-dark/60'
                      }`}
                    >
                      {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                      <span className="text-sm font-medium">{subject}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-quest-gold-dark/20">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-quest-gold-dark mb-2">Tempo de Estudo (min)</label>
                  <input 
                    type="number" 
                    value={studyMin}
                    onChange={e => setStudyMin(Number(e.target.value))}
                    className="w-full bg-quest-panel-dark border border-quest-gold-dark/30 rounded-sm p-3 text-quest-gold focus:outline-none focus:border-quest-gold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-quest-gold-dark mb-2">Tempo de Pausa (min)</label>
                  <input 
                    type="number" 
                    value={breakMin}
                    onChange={e => setBreakMin(Number(e.target.value))}
                    className="w-full bg-quest-panel-dark border border-quest-gold-dark/30 rounded-sm p-3 text-quest-gold focus:outline-none focus:border-quest-gold font-mono"
                  />
                </div>
              </div>

              <button 
                onClick={startCycle}
                className="w-full medieval-button py-4 text-lg tracking-[0.2em] flex items-center justify-center gap-3"
              >
                <Play size={24} /> Iniciar Ciclo com Matérias Selecionadas
              </button>
            </div>
          </Panel>
        </motion.div>
      );
    }

    if (cicloView === 'historico') {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-2xl text-quest-gold tracking-widest uppercase">Histórico do Ciclo</h2>
            <button 
              onClick={() => setCycleHistory([])}
              className="flex items-center gap-2 text-xs uppercase tracking-widest text-quest-red hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} /> Limpar
            </button>
          </div>

          <Panel>
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {cycleHistory.length === 0 ? (
                <div className="text-center py-20 text-quest-text-muted italic font-serif">
                  📜 Nenhum registro ainda. Inicie um ciclo!
                </div>
              ) : (
                cycleHistory.map(event => (
                  <div key={event.id} className="flex items-center gap-4 p-3 bg-black/20 border border-quest-gold-dark/10 rounded-sm">
                    <div className={`w-12 h-12 flex items-center justify-center rounded-sm border ${
                      event.type === 'study' ? 'bg-quest-gold/10 border-quest-gold text-quest-gold' :
                      event.type === 'double' ? 'bg-orange-500/10 border-orange-500 text-orange-500' :
                      'bg-green-500/10 border-green-500 text-green-500'
                    }`}>
                      {event.type === 'study' ? <BookOpen size={20} /> :
                       event.type === 'double' ? <Flame size={20} /> :
                       <Coffee size={20} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-quest-gold uppercase tracking-wider text-sm">{event.subject}</h4>
                        <span className="text-[10px] font-mono text-quest-text-muted">{event.time}</span>
                      </div>
                      <p className="text-xs text-quest-text-muted italic">{event.note}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>
          
          <button 
            onClick={() => setCicloView('ativo')}
            className="w-full p-3 border border-quest-gold-dark/30 text-quest-gold-dark hover:text-quest-gold hover:border-quest-gold transition-all uppercase tracking-widest text-xs font-serif"
          >
            Voltar ao Ciclo Ativo
          </button>
        </motion.div>
      );
    }

    // View: Ativo
    const currentSubject = cycleQueue[currentCycleIdx] || "Nenhuma matéria";
    const totalSeconds = cyclePhase === 'study' ? studyMin * 60 : breakMin * 60;
    const progress = totalSeconds > 0 ? (cycleTimeLeft / totalSeconds) * 100 : 0;
    
    // SVG Ring Logic
    const radius = 88;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - cycleTimeLeft / totalSeconds);

    const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        {/* STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Panel className="p-4 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-quest-text-muted mb-1 font-serif">Ciclos Completos</p>
            <p className="text-3xl font-serif text-quest-gold drop-shadow-md">{completedCycles}</p>
          </Panel>
          <Panel className="p-4 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-quest-text-muted mb-1 font-serif">Tempo Estudado</p>
            <p className="text-3xl font-serif text-quest-gold drop-shadow-md">
              {studiedMinutes >= 60 ? `${(studiedMinutes / 60).toFixed(1)}h` : `${studiedMinutes}m`}
            </p>
          </Panel>
          <Panel className="p-4 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-quest-text-muted mb-1 font-serif">Ciclos Duplos</p>
            <p className="text-3xl font-serif text-quest-gold drop-shadow-md">{doubleCount}</p>
          </Panel>
          <Panel className="p-4 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-quest-text-muted mb-1 font-serif">Matéria Atual</p>
            <p className="text-xl font-serif text-quest-gold truncate px-2">{currentCycleIdx + 1} de {cycleQueue.length}</p>
          </Panel>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* TIMER CARD */}
          <div className="lg:col-span-2 space-y-6">
            <Panel className="p-8">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="space-y-1">
                  <h2 className="font-cinzel text-4xl text-quest-gold tracking-widest uppercase drop-shadow-[0_0_10px_rgba(184,155,94,0.4)]">
                    {cyclePhase === 'break' ? 'PAUSA' : currentSubject}
                  </h2>
                  <p className="text-xs uppercase tracking-[0.3em] text-quest-gold-dark">Ciclo #{completedCycles + 1}</p>
                </div>

                {/* CIRCULAR TIMER */}
                <div className="relative flex items-center justify-center w-[200px] h-[200px] md:w-[240px] md:h-[240px]">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="50%" cy="50%" r={radius}
                      className="stroke-quest-panel-light fill-none"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="50%" cy="50%" r={radius}
                      className={`fill-none transition-all duration-1000 linear ${
                        cyclePhase === 'break' ? 'stroke-green-500' : 'stroke-quest-gold'
                      }`}
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono text-5xl md:text-6xl tabular-nums text-white drop-shadow-lg">
                      {formatTime(cycleTimeLeft)}
                    </span>
                    <div className={`mt-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 ${
                      cyclePhase === 'break' ? 'bg-green-500/20 text-green-400' : 'bg-quest-gold/20 text-quest-gold'
                    }`}>
                      {cyclePhase === 'break' ? (
                        <><Coffee size={12} /> PAUSA — DESCANSE</>
                      ) : (
                        <><Swords size={12} /> FASE DE ESTUDO</>
                      )}
                    </div>
                  </div>
                </div>

                {/* LINEAR PROGRESS */}
                <div className="w-full max-w-md space-y-2">
                  <ProgressBar progress={progress} className="h-3" />
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-quest-gold-dark font-serif">
                    <span>Início</span>
                    <span>Conclusão</span>
                  </div>
                </div>

                {/* CONTROLS */}
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsCycleRunning(!isCycleRunning)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                      isCycleRunning 
                        ? 'bg-quest-panel border-2 border-quest-gold text-quest-gold hover:bg-quest-gold/10' 
                        : 'bg-quest-gold text-quest-bg hover:bg-quest-gold/90'
                    }`}
                  >
                    {isCycleRunning ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                  </button>
                  
                  {isCycleRunning && (
                    <button 
                      onClick={skipPhase}
                      className="w-12 h-12 rounded-full bg-quest-panel border border-quest-gold-dark/50 text-quest-gold-dark flex items-center justify-center hover:text-quest-gold hover:border-quest-gold transition-all"
                      title="Pular Fase"
                    >
                      <SkipForward size={24} />
                    </button>
                  )}
                </div>

                {/* BADGES */}
                <div className="flex gap-3">
                  {isDouble && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-[10px] font-bold tracking-widest uppercase animate-pulse">
                      <Flame size={12} /> Ciclo Duplo
                    </div>
                  )}
                  {doublePending && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-quest-gold/20 text-quest-gold border border-quest-gold/30 rounded-full text-[10px] font-bold tracking-widest uppercase">
                      <Timer size={12} /> Duplo Agendado
                    </div>
                  )}
                </div>
              </div>
            </Panel>

            {/* DOUBLE CYCLE ZONE */}
            <Panel className="bg-gradient-to-br from-quest-panel to-quest-panel-light">
              <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-sm bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
                    <Flame size={28} />
                  </div>
                  <div>
                    <h3 className="font-serif text-orange-500 tracking-widest uppercase">🔥 Estendendo o Foco</h3>
                    <p className="text-xs text-quest-text-muted italic max-w-xs">
                      Repita a matéria atual por mais um ciclo completo após a pausa.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={activateDouble}
                  disabled={doublePending || cyclePhase !== 'study'}
                  className={`px-8 py-3 font-serif tracking-widest uppercase text-sm transition-all border rounded-sm ${
                    doublePending 
                      ? 'bg-quest-gold/10 border-quest-gold/30 text-quest-gold/50 cursor-not-allowed' 
                      : cyclePhase === 'study'
                        ? 'bg-orange-600 border-orange-400 text-white hover:bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                        : 'bg-quest-panel-light border-quest-gold-dark/30 text-quest-text-muted cursor-not-allowed'
                  }`}
                >
                  {doublePending ? '✓ Duplo Agendado' : 'Ciclo Duplo'}
                </button>
              </div>
            </Panel>
          </div>

          {/* QUEUE SIDEBAR */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-serif text-quest-gold tracking-widest uppercase text-sm">Fila de Matérias</h3>
              <button 
                onClick={() => setCicloView('historico')}
                className="text-[10px] uppercase tracking-widest text-quest-text-muted hover:text-quest-gold flex items-center gap-1"
              >
                <History size={12} /> Histórico
              </button>
            </div>
            
            <div className="space-y-2">
              {cycleQueue.map((subject, idx) => {
                const isCurrent = idx === currentCycleIdx;
                const isPast = idx < currentCycleIdx;
                
                return (
                  <div 
                    key={idx}
                    className={`relative p-4 border transition-all rounded-sm flex items-center justify-between ${
                      isCurrent 
                        ? 'bg-quest-gold/10 border-quest-gold shadow-[0_0_15px_rgba(184,155,94,0.15)]' 
                        : isDouble && isCurrent
                          ? 'border-orange-500 ring-1 ring-orange-500/50'
                          : 'bg-quest-panel border-quest-gold-dark/20'
                    } ${isPast ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-xs ${isCurrent ? 'text-quest-gold' : 'text-quest-text-muted'}`}>
                        {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <span className={`text-sm font-medium ${isCurrent ? 'text-quest-gold' : isPast ? 'line-through' : 'text-quest-text'}`}>
                        {subject}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      {isCurrent && (
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold tracking-widest uppercase ${
                          cyclePhase === 'break' ? 'bg-blue-500/20 text-blue-400' : 'bg-quest-gold/20 text-quest-gold'
                        }`}>
                          {cyclePhase === 'break' ? 'Pausa' : 'Em foco'}
                        </span>
                      )}
                      {isPast && <CheckCircle2 size={14} className="text-quest-gold" />}
                      {isDouble && isCurrent && (
                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-[8px] font-bold tracking-widest uppercase">
                          🔥 Duplo
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => setCicloView('config')}
              className="w-full p-3 border border-quest-gold-dark/30 text-quest-gold-dark hover:text-quest-gold hover:border-quest-gold transition-all uppercase tracking-widest text-xs font-serif"
            >
              Alterar Configurações
            </button>
            
            <button 
              onClick={resetCycle}
              className="w-full p-3 border border-quest-red/30 text-quest-red/60 hover:text-quest-red hover:border-quest-red transition-all uppercase tracking-widest text-xs font-serif"
            >
              Reiniciar Ciclo
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-8 selection:bg-quest-red selection:text-white relative">
      <div className="fixed inset-0 pointer-events-none z-[50] shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
      {showRain && <MedievalRain />}

      {/* TOASTS */}
      <div className="fixed top-4 right-4 z-[10001] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className={`px-4 py-3 rounded-sm border-l-4 shadow-lg pointer-events-auto min-w-[250px] ${
                toast.type === 'success' 
                  ? 'bg-quest-panel border-green-500 text-green-100' 
                  : 'bg-quest-panel border-quest-gold text-quest-gold'
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
                <span className="text-sm font-medium">{toast.message}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
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
          <button 
            onClick={() => setActiveTab('ciclo')} 
            className={`flex items-center gap-2 transition-colors hover:drop-shadow-[0_0_5px_rgba(184, 155, 94, 0.8)] ${activeTab === 'ciclo' ? 'text-quest-gold' : 'hover:text-quest-gold'}`}
          >
            <Timer size={18} />
            CICLO
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
          <PanelHeader title="PERGAMINHO DE MISSÕES (CICLO ATUAL)" />
          <div className="p-2">
            <div className="flex justify-end px-4 py-2">
              <button 
                onClick={() => setDailyMissionsLimit(prev => prev === 3 ? 4 : 3)}
                className="flex items-center gap-2 text-[10px] font-serif tracking-widest uppercase px-3 py-1.5 rounded-lg border border-quest-gold/30 text-quest-gold hover:bg-quest-gold/10 transition-all shadow-[0_0_10px_rgba(184,155,94,0.1)] hover:shadow-[0_0_15px_rgba(184,155,94,0.2)]"
              >
                {dailyMissionsLimit === 3 ? (
                  <>
                    <Plus size={12} /> ADICIONAR 4ª MATÉRIA
                  </>
                ) : (
                  <>
                    <Minus size={12} /> VOLTAR PARA 3 MATÉRIAS
                  </>
                )}
              </button>
            </div>
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
              <div className="flex flex-col">
                <span className="font-serif tracking-widest text-sm uppercase">FLASHCARDS DO DIA</span>
                <div className="flex gap-1 mt-1.5">
                  {flashcardHistory.map((day, idx) => (
                    <div 
                      key={idx}
                      className={`w-1 h-1 rounded-full transition-colors duration-500 ${day.completed ? 'bg-quest-red shadow-[0_0_4px_rgba(239,68,68,0.6)]' : 'bg-quest-gold-dark/20'}`}
                      title={day.date}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="text-quest-gold-dark">
              {!!completions[`${todayDateStr}_Flashcards`] ? <CheckSquare className="text-quest-red" size={24} /> : <Square size={24} />}
            </div>
          </div>
        </Panel>

        {/* MAPA DA JORNADA (CICLO COMPLETO) */}
        <Panel>
          <PanelHeader title="MAPA DA JORNADA (CICLO COMPLETO)" />
          <div className="p-6">
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => {
                  setStudyCycle(DEFAULT_STUDY_CYCLE);
                  addToast("Ordem do ciclo restaurada!", "success");
                }}
                className="text-[10px] font-serif text-quest-gold/60 hover:text-quest-gold transition-colors flex items-center gap-1 border border-quest-gold/20 px-2 py-0.5 rounded-sm bg-quest-gold/5"
              >
                <RotateCcw size={10} /> Restaurar Ordem Padrão
              </button>
            </div>
            <Reorder.Group axis="x" values={studyCycle} onReorder={setStudyCycle} className="flex flex-wrap justify-center gap-6 relative">
              {studyCycle.map((subject, idx) => {
                const isCheckedToday = !!completions[`${todayDateStr}_${subject}`];
                const isLongTermCompleted = completedSubjects.includes(subject);
                const isNextToStudy = todaysMissions.some(m => m.subject === subject && !m.completed);
                const isReview = !!reviewSubjects[subject];
                const isNew = !isLongTermCompleted && !isReview;
                
                return (
                  <Reorder.Item 
                    key={subject} 
                    value={subject}
                    className={`relative flex flex-col items-center group cursor-grab active:cursor-grabbing transition-all duration-300 ${isLongTermCompleted ? 'opacity-30 grayscale' : ''}`}
                    onClick={() => setSelectedSubject(subject)}
                  >
                    <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative ${
                      isNextToStudy 
                        ? 'bg-quest-gold/20 border-quest-gold shadow-[0_0_15px_rgba(184,155,94,0.6)] scale-110' 
                        : isCheckedToday 
                          ? 'bg-quest-red/10 border-quest-red/50' 
                          : isNew
                            ? 'bg-yellow-400/20 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-105'
                            : 'bg-quest-panel-light border-quest-gold-dark/30 hover:border-quest-gold/50'
                    }`}>
                      {isCheckedToday ? (
                        <CheckCircle2 className="text-quest-red" size={32} />
                      ) : (
                        <span className={`font-serif text-xl ${isNew ? 'text-yellow-400 font-bold' : 'text-quest-gold'}`}>{idx + 1}</span>
                      )}

                      {/* Símbolos de Status */}
                      {!isCheckedToday && !isLongTermCompleted && (
                        <div className="absolute -top-2 -right-2 flex flex-col gap-1">
                          {isNew && (
                            <div className="bg-yellow-400 rounded-full p-1.5 shadow-[0_0_8px_rgba(250,204,21,0.8)] border-2 border-black/20 animate-pulse" title="Matéria Nova">
                              <Sparkles size={12} className="text-black" />
                            </div>
                          )}
                          {isReview && (
                            <div className="bg-quest-red rounded-full p-1.5 shadow-[0_0_8px_rgba(58,90,64,0.6)] border-2 border-quest-gold-dark/30" title="Revisão">
                              <RefreshCw size={12} className="text-quest-gold" />
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Destaque de Próxima Missão (Linha Brilhosa) */}
                      {isNextToStudy && (
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-quest-gold to-transparent shadow-[0_0_15px_rgba(184,155,94,1)] rounded-full animate-pulse" />
                      )}
                    </div>
                    <div className="mt-3 text-center max-w-[120px]">
                      <p className={`text-xs font-serif tracking-wider uppercase ${isNextToStudy ? 'text-quest-gold font-bold' : 'text-quest-text'}`}>
                        {subject}
                      </p>
                      {isCheckedToday && <span className="text-[10px] text-quest-red font-bold uppercase mt-1 block">Concluído Hoje</span>}
                      {!isCheckedToday && !isLongTermCompleted && (
                        <div className="flex justify-center gap-1 mt-1">
                          {isNew && <span className="text-[8px] text-yellow-400 font-bold uppercase px-1 bg-yellow-400/20 rounded-sm border border-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.4)]">Nova</span>}
                          {isReview && <span className="text-[8px] text-quest-gold font-bold uppercase px-1 bg-quest-red/20 rounded-sm border border-quest-red/30">Revisão</span>}
                        </div>
                      )}
                    </div>
                    {idx < studyCycle.length - 1 && (
                      <div className="hidden lg:block absolute -right-6 top-8 w-6 h-[2px] bg-quest-gold-dark/20"></div>
                    )}
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
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
                    dynamicBattleTable.map((row, idx) => {
                      const isReview = !!reviewSubjects[row.subject];
                      const isNew = !completedSubjects.includes(row.subject) && !isReview;
                      const isCompleted = row.progress === 100;

                      return (
                        <tr key={idx} className={`border-b border-quest-gold-dark/20 last:border-0 hover:bg-quest-panel-light/50 cursor-pointer ${isCompleted ? 'bg-quest-gold/5' : ''}`}>
                          <td className="p-4 border-r border-quest-gold-dark/20 text-quest-text" onClick={() => setSelectedSubject(row.subject)}>
                            <div className="flex items-center gap-2 flex-wrap">
                              {row.subject}
                              {isReview && (
                                <span className="text-[9px] bg-quest-red/20 text-quest-red px-1.5 py-0.5 rounded-full border border-quest-red/30 font-serif tracking-tighter uppercase">Revisão</span>
                              )}
                              {isNew && (
                                <span className="text-[9px] bg-quest-gold/20 text-quest-gold px-1.5 py-0.5 rounded-full border border-quest-gold/30 font-serif tracking-tighter uppercase">Matéria Nova</span>
                              )}
                              {isCompleted && (
                                <span className="text-[9px] bg-quest-gold/20 text-quest-gold px-1.5 py-0.5 rounded-full border border-quest-gold/30 font-serif tracking-tighter uppercase">100%</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 border-r border-quest-gold-dark/20 text-center font-mono text-quest-text-muted" onClick={() => setSelectedSubject(row.subject)}>
                            {row.conquest}
                          </td>
                          <td className="p-4 flex items-center gap-3">
                            <ProgressBar progress={row.progress} className="flex-1" onClick={() => setSelectedSubject(row.subject)} />
                            <span className="font-mono text-quest-text-muted w-8 text-right" onClick={() => setSelectedSubject(row.subject)}>
                              {`${row.progress}%`}
                            </span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleReviewSubject(row.subject);
                              }}
                              className={`p-1.5 rounded-sm border transition-all ${isReview ? 'bg-quest-red/20 border-quest-red text-quest-red' : 'bg-quest-panel-light border-quest-gold-dark/30 text-quest-text-muted hover:border-quest-gold hover:text-quest-gold'}`}
                              title={isReview ? "Remover da Revisão" : "Marcar para Revisão"}
                            >
                              <RefreshCw size={14} className={isReview ? "animate-spin-slow" : ""} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {completedSubjectsData.length > 0 && dynamicBattleTable.length > 0 && (
              <div className="p-2 text-center border-t border-quest-gold-dark/10">
                <p className="text-[10px] text-quest-gold-dark italic uppercase tracking-widest">
                  Matérias 100% concluídas são movidas para o Salão dos Heróis, a menos que marcadas para revisão.
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
                  {editingRedacao ? <CheckSquare size={16} /> : <Plus size={16} />} {editingRedacao ? 'Atualizar' : 'Salvar'}
                </button>
                {editingRedacao && (
                  <button 
                    onClick={() => {
                      setEditingRedacao(null);
                      setNewRedacao({ theme: '', score: 0 });
                    }} 
                    className="p-2 text-quest-text-muted hover:text-quest-red transition-colors"
                    title="Cancelar Edição"
                  >
                    <X size={20} />
                  </button>
                )}
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
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => {
                                  setEditingRedacao(r);
                                  setNewRedacao({ theme: r.theme, score: r.score });
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="text-quest-gold-dark hover:text-quest-gold transition-colors p-2"
                                title="Editar Redação"
                              >
                                <PenTool size={18} />
                              </button>
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
              <div className="flex-1 p-4 min-h-[300px] h-[300px] relative">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="name" stroke="#8c7335" tick={{ fill: '#a39b8f', fontSize: 12, fontFamily: 'MedievalSharp' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#8c7335" tick={{ fill: '#a39b8f', fontSize: 12, fontFamily: 'MedievalSharp' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1814', borderColor: '#8c7335', color: '#d4af37', fontFamily: 'MedievalSharp' }}
                        itemStyle={{ color: '#d4af37' }}
                      />
                      <Legend wrapperStyle={{ fontFamily: 'MedievalSharp', fontSize: '12px', paddingTop: '10px' }} />
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

        {/* HISTÓRICO DE JORNADA */}
        <div className="pt-4">
          <h2 className="font-serif text-quest-text text-lg tracking-widest uppercase mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-quest-gold-dark" /> HISTÓRICO DE JORNADA
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
                    
                    // Calculate totals on the fly
                    let totalQuestions = 0;
                    let correctQuestions = 0;
                    activeContest.subjects.forEach((sub: any) => {
                      const score = simulado.subjectScores[sub.name] || 0;
                      totalQuestions += sub.questions;
                      correctQuestions += score;
                    });

                    return (
                      <div key={simulado.id}>
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
                              <p className={`text-[10px] tracking-widest uppercase mb-1 ${isApproved ? 'text-quest-gold' : isWarning ? 'text-yellow-500' : 'text-red-400'}`}>
                                {isApproved ? 'APROVADO' : 'REPROVADO'}
                              </p>
                              {totalQuestions > 0 && (
                                <p className="text-[10px] text-quest-text-muted font-mono">
                                  {correctQuestions}/{totalQuestions} ACERTOS ({((correctQuestions / totalQuestions) * 100).toFixed(1)}%)
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => {
                                  setEditingSimulado(simulado);
                                  setNewDetailedSimulado({
                                    title: simulado.title,
                                    contestId: simulado.contestId,
                                    subjectScores: simulado.subjectScores
                                  });
                                  setSimuladoModalTab('registrar');
                                  setIsSimuladoModalOpen(true);
                                }}
                                className="text-quest-gold-dark hover:text-quest-gold transition-colors p-2"
                                title="Editar Simulado"
                              >
                                <PenTool size={20} />
                              </button>
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
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'ciclo' && renderCicloContent()}

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
              <button onClick={() => {
                setIsSimuladoModalOpen(false);
                setEditingSimulado(null);
                setNewDetailedSimulado({ title: '', contestId: 'bb', subjectScores: {} });
              }} className="text-quest-text-muted hover:text-quest-red transition-colors">
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

                  {/* Resumo em tempo real */}
                  {(() => {
                    const contest = allContests.find(c => c.id === newDetailedSimulado.contestId);
                    if (!contest) return null;
                    let totalScore = 0;
                    let totalQuestions = 0;
                    let correctQuestions = 0;
                    contest.subjects.forEach((sub: any) => {
                      const score = newDetailedSimulado.subjectScores[sub.name] || 0;
                      totalScore += score * sub.weight;
                      totalQuestions += sub.questions;
                      correctQuestions += score;
                    });
                    return (
                      <div className="bg-black/40 p-4 rounded-sm border border-quest-gold-dark/30 flex justify-between items-center shadow-inner">
                        <div className="text-xs text-quest-text-muted uppercase tracking-widest font-serif">Resumo do Desempenho</div>
                        <div className="text-right">
                          <p className="text-2xl font-serif text-quest-gold">{totalScore.toFixed(1)} <span className="text-xs opacity-50">/ 100.0</span></p>
                          <p className="text-[10px] text-quest-text-muted uppercase tracking-tighter">{correctQuestions} / {totalQuestions} acertos ({((correctQuestions / totalQuestions) * 100 || 0).toFixed(1)}%)</p>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="flex justify-end pt-4 border-t border-quest-gold-dark/20">
                    <button onClick={addDetailedSimulado} className="medieval-button flex items-center justify-center gap-2">
                      {editingSimulado ? <CheckSquare size={16} /> : <Plus size={16} />} {editingSimulado ? 'Atualizar Simulado' : 'Registrar Simulado'}
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
              <h2 className="font-serif text-quest-gold text-xl tracking-widest uppercase">{selectedSubject}</h2>
              <button onClick={() => setSelectedSubject(null)} className="text-quest-gold hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* TAB BAR */}
            <div className="flex border-b border-quest-gold-dark/30 bg-quest-panel">
              <button 
                onClick={() => setSubjectModalTab('tasks')}
                className={`flex-1 py-3 text-xs font-serif uppercase tracking-widest transition-all ${subjectModalTab === 'tasks' ? 'text-quest-gold border-b-2 border-quest-gold bg-quest-panel-light' : 'text-quest-text-muted hover:text-quest-gold'}`}
              >
                Tarefas
              </button>
              <button 
                onClick={() => setSubjectModalTab('notes')}
                className={`flex-1 py-3 text-xs font-serif uppercase tracking-widest transition-all ${subjectModalTab === 'notes' ? 'text-quest-gold border-b-2 border-quest-gold bg-quest-panel-light' : 'text-quest-text-muted hover:text-quest-gold'}`}
              >
                Anotações de Revisão
              </button>
            </div>

            {subjectModalTab === 'tasks' ? (
              <>
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
              </>
            ) : (
              <div className="p-6 flex-1 flex flex-col gap-4 overflow-y-auto">
                {!isAddingNote ? (
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2 text-quest-gold font-serif text-sm uppercase tracking-widest">
                        <Scroll size={18} />
                        <span>Histórico de Revisões</span>
                      </div>
                      <button 
                        onClick={() => setIsAddingNote(true)}
                        className="text-xs font-serif text-quest-gold hover:text-white transition-colors flex items-center gap-1 border border-quest-gold/30 px-3 py-1 rounded-sm bg-quest-gold/5"
                      >
                        <Plus size={14} /> Nova Anotação
                      </button>
                    </div>

                    <div className="space-y-4 flex-1">
                      {subjectNotes[selectedSubject] && Array.isArray(subjectNotes[selectedSubject]) && subjectNotes[selectedSubject].length > 0 ? (
                        subjectNotes[selectedSubject].map(note => (
                          <div key={note.id} className="border-l-2 border-quest-gold/30 pl-4 py-1 group relative">
                            <div className="flex justify-between items-start mb-1">
                              <div className="text-[10px] text-quest-gold font-mono uppercase opacity-60">{note.date}</div>
                              <button 
                                onClick={() => deleteSubjectNote(selectedSubject, note.id)}
                                className="opacity-0 group-hover:opacity-100 text-quest-red hover:text-red-400 transition-all p-1"
                                title="Excluir anotação"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <div className="text-sm text-quest-text leading-relaxed whitespace-pre-wrap">{note.text}</div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 opacity-40">
                          <PenTool size={40} className="mb-4" />
                          <p className="text-sm italic font-serif">Nenhuma revisão registrada ainda.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full gap-4">
                    <div className="flex items-center gap-2 text-quest-gold font-serif text-sm uppercase tracking-widest mb-2">
                      <PenTool size={18} />
                      <span>O que você revisou hoje?</span>
                    </div>
                    <textarea 
                      autoFocus
                      value={currentNoteText}
                      onChange={(e) => setCurrentNoteText(e.target.value)}
                      placeholder="Descreva brevemente os tópicos revisados..."
                      className="flex-1 w-full bg-black/20 border border-quest-gold-dark/30 rounded p-4 text-quest-text focus:border-quest-gold outline-none resize-none font-sans text-sm min-h-[200px]"
                    />
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setIsAddingNote(false)}
                        className="flex-1 border border-quest-gold-dark/30 text-quest-text-muted py-3 rounded-sm hover:bg-white/5 transition-colors text-sm font-serif uppercase tracking-widest"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={() => saveSubjectNote(selectedSubject)}
                        className="flex-[2] medieval-button flex items-center justify-center gap-2 py-3"
                      >
                        <Scroll size={18} />
                        <span>Salvar Revisão</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
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
                      onLoadError={(error) => console.error("Erro no Document (CB):", error)}
                      onSourceError={(error) => console.error("Erro na Fonte (CB):", error)}
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
                      onLoadError={(error) => console.error("Erro no Document (VN):", error)}
                      onSourceError={(error) => console.error("Erro na Fonte (VN):", error)}
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
