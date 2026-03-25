import React, { useState, useEffect } from 'react';
import { 
  Trophy, Swords, BookOpen, LogOut, FileText, PenTool, 
  CheckSquare, Square, TrendingUp, Calendar, Shield, Plus, X, Eye, Trash2, Settings
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, orderBy, setDoc, deleteDoc, where } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { cbTasksContent } from './data/cbTasksContent';
import { cbTasksPages } from './data/cbTasksPages';
import { vnTasksPages } from './data/vnTasksPages';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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
    {children}
  </div>
);

const PanelHeader = ({ title, icon: Icon }: { title: string, icon?: React.ElementType }) => (
  <div className="bg-quest-red-dark border-b-2 border-quest-gold-dark px-4 py-3 flex items-center justify-center relative shadow-md">
    <div className="absolute left-3 w-2 h-2 bg-quest-gold rotate-45 shadow-[0_0_5px_#d4af37]"></div>
    <div className="flex items-center gap-2 text-quest-gold font-serif tracking-widest text-sm uppercase text-shadow-sm">
      {Icon && <Icon size={18} />}
      <span>{title}</span>
    </div>
    <div className="absolute right-3 w-2 h-2 bg-quest-gold rotate-45 shadow-[0_0_5px_#d4af37]"></div>
  </div>
);

const ProgressBar = ({ progress, className = '' }: { progress: number, className?: string }) => (
  <div className={`h-2 bg-quest-panel-light border border-quest-gold-dark/50 rounded-full overflow-hidden shadow-inner ${className}`}>
    <div 
      className="h-full bg-gradient-to-r from-quest-red-dark via-quest-red to-orange-500 shadow-[0_0_10px_rgba(255,0,0,0.5)]"
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

// --- MAIN APP ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
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

  const allContests = [...CONTESTS, ...userContests];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Listen to Completions (Missions)
    const qCompletions = query(collection(db, 'completions'), where('userId', '==', user.uid));
    const unsubCompletions = onSnapshot(qCompletions, (snapshot) => {
      const newCompletions: Record<string, boolean> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        newCompletions[`${data.date}_${data.subject}`] = true;
      });
      setCompletions(newCompletions);
    });

    // Listen to Task Completions
    const qTaskCompletions = query(collection(db, 'taskCompletions'), where('userId', '==', user.uid));
    const unsubTaskCompletions = onSnapshot(qTaskCompletions, (snapshot) => {
      const newTaskCompletions: Record<string, boolean> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        newTaskCompletions[`${data.subject}_${data.taskId}`] = true;
      });
      setTaskCompletions(newTaskCompletions);
    });

    // Listen to Simulados
    const qSimulados = query(collection(db, 'simulados'), orderBy('createdAt', 'asc'));
    const unsubSimulados = onSnapshot(qSimulados, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter((s: any) => s.userId === user.uid);
      setSimulados(data);
    });

    // Listen to Detailed Simulados
    const qDetailedSimulados = query(collection(db, 'detailed_simulados'), orderBy('createdAt', 'asc'));
    const unsubDetailedSimulados = onSnapshot(qDetailedSimulados, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter((s: any) => s.userId === user.uid);
      setDetailedSimulados(data);
    });

    // Listen to User Contests
    const qUserContests = query(collection(db, 'user_contests'), where('userId', '==', user.uid));
    const unsubUserContests = onSnapshot(qUserContests, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserContests(data);
    });

    // Listen to Redacoes
    const qRedacoes = query(collection(db, 'redacoes'), orderBy('createdAt', 'desc'));
    const unsubRedacoes = onSnapshot(qRedacoes, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter((r: any) => r.userId === user.uid);
      setRedacoes(data);
    });

    return () => {
      unsubCompletions();
      unsubTaskCompletions();
      unsubSimulados();
      unsubDetailedSimulados();
      unsubUserContests();
      unsubRedacoes();
    };
  }, [user]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Falha no login com Google:', err);
    }
  };

  const handleLogout = () => signOut(auth);

  const toggleMission = async (subject: string, isCompleted: boolean) => {
    if (!user) return;
    const dateStr = new Date().toISOString().split('T')[0];
    const docId = `${user.uid}_${dateStr}_${encodeURIComponent(subject)}`;
    
    try {
      if (isCompleted) {
        await deleteDoc(doc(db, 'completions', docId));
      } else {
        await setDoc(doc(db, 'completions', docId), {
          userId: user.uid,
          date: dateStr,
          subject: subject,
          createdAt: serverTimestamp()
        });
      }
    } catch (err: any) {
      console.error(err);
      alert("Erro ao atualizar missão: " + err.message);
    }
  };

  const toggleTask = async (subject: string, taskId: string, isCompleted: boolean) => {
    if (!user) return;
    const docId = `${user.uid}_${encodeURIComponent(subject)}_${taskId}`;
    
    try {
      if (isCompleted) {
        await deleteDoc(doc(db, 'taskCompletions', docId));
      } else {
        await setDoc(doc(db, 'taskCompletions', docId), {
          userId: user.uid,
          subject: subject,
          taskId: taskId,
          createdAt: serverTimestamp()
        });
      }
    } catch (err: any) {
      console.error(err);
      alert("Erro ao atualizar tarefa: " + err.message);
    }
  };

  const addSimulado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSimulado.title.trim() || !user) return;
    try {
      await addDoc(collection(db, 'simulados'), {
        userId: user.uid,
        title: newSimulado.title,
        score: Number(newSimulado.score),
        targetScore: Number(newSimulado.targetScore),
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      });
      setNewSimulado({ title: '', score: 0, targetScore: 80 });
    } catch (err: any) {
      console.error(err);
      alert("Erro ao registrar simulado: " + err.message);
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
      await addDoc(collection(db, 'detailed_simulados'), {
        userId: user.uid,
        title: newDetailedSimulado.title,
        contestId: newDetailedSimulado.contestId,
        subjectScores: newDetailedSimulado.subjectScores,
        totalScore,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      });
      setNewDetailedSimulado({ title: '', contestId: 'bb', subjectScores: {} });
      setIsSimuladoModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert("Erro ao registrar simulado detalhado: " + err.message);
    }
  };

  const addContest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContest.name.trim() || !user) return;
    
    try {
      await addDoc(collection(db, 'user_contests'), {
        userId: user.uid,
        name: newContest.name,
        cutoffScore: Number(newContest.cutoffScore),
        warningScore: Number(newContest.warningScore),
        subjects: newContest.subjects.map(s => ({
          name: s.name,
          questions: Number(s.questions),
          weight: Number(s.weight)
        })),
        createdAt: new Date().toISOString()
      });
      setNewContest({ name: '', cutoffScore: 80, warningScore: 72, subjects: [{ name: '', questions: 10, weight: 1 }] });
      setSimuladoModalTab('registrar');
    } catch (err: any) {
      console.error(err);
      alert("Erro ao registrar concurso: " + err.message);
    }
  };

  const addRedacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRedacao.theme.trim() || !user) return;
    try {
      await addDoc(collection(db, 'redacoes'), {
        userId: user.uid,
        theme: newRedacao.theme,
        score: Number(newRedacao.score),
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      });
      setNewRedacao({ theme: '', score: 0 });
    } catch (err: any) {
      console.error(err);
      alert("Erro ao salvar redação: " + err.message);
    }
  };

  if (loadingAuth) {
    return <div className="min-h-screen flex items-center justify-center text-quest-gold font-serif text-2xl">Carregando o Reino...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Panel className="w-full max-w-md p-8 text-center">
          <Shield size={48} className="mx-auto text-quest-gold mb-4 drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
          <h1 className="font-serif text-3xl text-quest-gold mb-2">Quest Studies</h1>
          <p className="text-quest-text-muted mb-8 italic">Identifique-se, viajante.</p>
          
          <div className="space-y-4">
            <button onClick={handleLogin} className="w-full medieval-button mt-4 flex items-center justify-center gap-2">
              <Shield size={18} /> Entrar com Google
            </button>
          </div>
        </Panel>
      </div>
    );
  }

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

  const todaysMissions = weeklySchedule.map(row => ({
    subject: row.days[todayDayOfWeek],
    time: row.time,
    completed: !!completions[`${todayDateStr}_${row.days[todayDayOfWeek]}`]
  }));

  const completedMissions = todaysMissions.filter(m => m.completed).length;
  const totalMissions = todaysMissions.length;
  const questProgress = totalMissions === 0 ? 0 : Math.round((completedMissions / totalMissions) * 100);

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

  const dynamicBattleTable = Object.keys(battleStats).map(subject => {
    const stats = battleStats[subject];
    const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    return {
      subject,
      conquest: `${stats.completed}/${stats.total}`,
      progress
    };
  });

  return (
    <div className="min-h-screen p-4 md:p-8 selection:bg-quest-red selection:text-white">
      {/* HEADER */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 border-b-2 border-quest-gold-dark/50 pb-6 relative">
        <div className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-quest-gold to-transparent"></div>
        
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="w-14 h-14 rounded-full bg-quest-red-dark border-2 border-quest-gold flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <Shield className="text-quest-gold relative z-10" size={28} />
          </div>
          <div>
            <h1 className="font-serif text-3xl text-quest-gold tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">QUEST STUDIES</h1>
            <p className="text-sm text-quest-gold-dark italic">A Jornada do Guerreiro - Concursos</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-serif tracking-wider text-quest-gold-dark">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex items-center gap-2 transition-colors hover:drop-shadow-[0_0_5px_rgba(212,175,55,0.8)] ${activeTab === 'dashboard' ? 'text-quest-gold' : 'hover:text-quest-gold'}`}
          >
            <Shield size={18} />
            DASHBOARD
          </button>
          <button 
            onClick={() => setActiveTab('simulados')} 
            className={`flex items-center gap-2 transition-colors hover:drop-shadow-[0_0_5px_rgba(212,175,55,0.8)] ${activeTab === 'simulados' ? 'text-quest-gold' : 'hover:text-quest-gold'}`}
          >
            <Trophy size={18} />
            SIMULADOS
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 hover:text-quest-gold transition-colors hover:drop-shadow-[0_0_5px_rgba(212,175,55,0.8)]">
            <LogOut size={18} />
            SAIR DO REINO
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        
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
          <PanelHeader title="PERGAMINHO DE MISSÕES" />
          <div className="p-2">
            {todaysMissions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-quest-text-muted italic mb-4">Nenhuma missão para hoje.</p>
              </div>
            ) : (
              todaysMissions.map((mission, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-4 border-b border-quest-gold-dark/20 last:border-0 hover:bg-quest-panel-light transition-colors ${mission.completed ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <button 
                      className="text-quest-gold-dark hover:text-quest-gold transition-colors drop-shadow-md"
                      onClick={() => toggleMission(mission.subject, mission.completed)}
                    >
                      {mission.completed ? <CheckSquare className="text-quest-red" size={24} /> : <Square size={24} />}
                    </button>
                    <span 
                      className={`text-lg cursor-pointer flex-1 ${mission.completed ? 'line-through text-quest-text-muted' : 'text-quest-text hover:text-quest-gold'}`}
                      onClick={() => setSelectedSubject(mission.subject)}
                    >
                      {mission.subject}
                    </span>
                  </div>
                  <span className="text-sm text-quest-gold-dark">{mission.time}</span>
                </div>
              ))
            )}
          </div>
        </Panel>

        {/* FLASHCARDS */}
        <Panel>
          <div className="p-4 flex items-center gap-3 text-quest-gold-dark hover:text-quest-gold cursor-pointer transition-colors">
            <BookOpen size={18} />
            <span className="font-serif tracking-widest text-sm uppercase">FLASHCARDS DO DIA</span>
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
                {weeklySchedule.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-quest-gold-dark/20 last:border-0 hover:bg-quest-panel-light/50">
                    <td className="p-4 border-r border-quest-gold-dark/20 font-mono">{row.time}</td>
                    {row.days.map((subject, colIdx) => {
                      const dateStr = weekDates[colIdx];
                      const isChecked = !!completions[`${dateStr}_${subject}`];
                      return (
                        <td key={colIdx} className="p-4 border-r border-quest-gold-dark/20 last:border-0">
                          <div className={`flex flex-col items-center justify-center gap-2 transition-opacity ${isChecked ? 'opacity-40' : 'opacity-100'}`}>
                            <span className={isChecked ? 'text-quest-text-muted line-through' : 'text-quest-text'}>{subject}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
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
                  {dynamicBattleTable.map((row, idx) => (
                    <tr key={idx} className="border-b border-quest-gold-dark/20 last:border-0 hover:bg-quest-panel-light/50">
                      <td className="p-4 border-r border-quest-gold-dark/20 text-quest-text">{row.subject}</td>
                      <td className="p-4 border-r border-quest-gold-dark/20 text-center font-mono text-quest-text-muted">{row.conquest}</td>
                      <td className="p-4 flex items-center gap-3">
                        <ProgressBar progress={row.progress} className="flex-1" />
                        <span className="font-mono text-quest-text-muted w-8 text-right">{row.progress}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                <div className="space-y-3">
                  {redacoes.map(r => (
                    <div key={r.id} className="flex justify-between items-center p-3 bg-quest-panel-light border border-quest-gold-dark/20 rounded">
                      <div>
                        <p className="text-quest-text text-lg">{r.theme}</p>
                        <p className="text-xs text-quest-gold-dark">{r.date}</p>
                      </div>
                      <div className="text-2xl font-serif text-quest-gold drop-shadow-md">{r.score}</div>
                    </div>
                  ))}
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
                    <option key={c.id} value={c.id} className="bg-[#1a1814]">{c.name}</option>
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
            {weeklyHistory.map((week, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-quest-text">
                    <Calendar size={14} className="text-quest-gold-dark" />
                    <span>{week.date}</span>
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
                  className="medieval-button flex items-center gap-2 bg-[#1a1814] hover:bg-[#2a2824]"
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
                      <Panel key={simulado.id} className="p-0 overflow-hidden">
                        <div className="p-4 border-b border-quest-gold-dark/30 flex justify-between items-start bg-black/20">
                          <div>
                            <h3 className="font-serif text-quest-gold text-lg tracking-widest uppercase">{simulado.title}</h3>
                            <p className="text-xs text-quest-text-muted">{simulado.date.split('-').reverse().join('/')}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={`font-serif text-4xl ${isApproved ? 'text-green-500' : isWarning ? 'text-yellow-500' : 'text-red-500'}`}>
                                {simulado.totalScore.toFixed(1)}
                              </p>
                              <p className={`text-xs tracking-widest uppercase ${isApproved ? 'text-green-500' : isWarning ? 'text-yellow-500' : 'text-red-500'}`}>
                                {isApproved ? 'APROVADO' : 'REPROVADO'}
                              </p>
                            </div>
                            <button 
                              onClick={async () => {
                                if (window.confirm('Tem certeza que deseja excluir este simulado?')) {
                                  try {
                                    await deleteDoc(doc(db, 'detailed_simulados', simulado.id));
                                  } catch (err) {
                                    console.error(err);
                                    alert('Erro ao excluir.');
                                  }
                                }
                              }}
                              className="text-quest-red-dark hover:text-quest-red transition-colors p-2"
                              title="Excluir Simulado"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-quest-gold-dark/20">
                          {activeContest.subjects.map((sub: any, idx: number) => {
                            const score = simulado.subjectScores[sub.name] || 0;
                            return (
                              <div key={idx} className="bg-[#1a1814] p-4 flex flex-col items-center justify-center text-center">
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
            <Shield size={32} className="text-quest-gold-dark/40" />
          </div>
          <p className="font-serif italic text-quest-gold text-lg drop-shadow-md">
            "O dragão que guarda o tesouro não dorme — e nem o guerreiro que estuda"
          </p>
        </footer>

      </main>

      {/* SIMULADO MODAL */}
      {isSimuladoModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1814] border-2 border-quest-gold-dark rounded-sm max-w-4xl w-full max-h-[90vh] flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            <div className="p-4 border-b-2 border-quest-gold-dark/30 flex justify-between items-center bg-black/40">
              <h2 className="font-serif text-quest-gold text-xl tracking-widest uppercase flex items-center gap-2">
                <Trophy size={20} className="text-quest-red" /> 
                ÁREA DE SIMULADOS
              </h2>
              <button onClick={() => setIsSimuladoModalOpen(false)} className="text-quest-text-muted hover:text-quest-red transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex border-b border-quest-gold-dark/30">
              <button 
                className={`flex-1 py-3 font-serif tracking-widest uppercase text-sm transition-colors ${simuladoModalTab === 'registrar' ? 'bg-quest-red-dark/20 text-quest-gold border-b-2 border-quest-red' : 'text-quest-text-muted hover:bg-white/5'}`}
                onClick={() => setSimuladoModalTab('registrar')}
              >
                Registrar Nota
              </button>
              <button 
                className={`flex-1 py-3 font-serif tracking-widest uppercase text-sm transition-colors ${simuladoModalTab === 'novo_concurso' ? 'bg-quest-red-dark/20 text-quest-gold border-b-2 border-quest-red' : 'text-quest-text-muted hover:bg-white/5'}`}
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
          </div>
        </div>
      )}

      {/* TASK MODAL */}
      {selectedSubject && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1814] border-2 border-quest-gold-dark rounded-sm max-w-2xl w-full max-h-[80vh] flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            <div className="flex justify-between items-center p-4 border-b border-quest-gold-dark/50 bg-quest-red-dark">
              <h2 className="font-serif text-quest-gold text-xl tracking-widest uppercase">{selectedSubject} - Tarefas</h2>
              <button onClick={() => setSelectedSubject(null)} className="text-quest-gold hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {subjectTasks[selectedSubject] ? (
                subjectTasks[selectedSubject].map(task => {
                  const isTaskCompleted = !!taskCompletions[`${selectedSubject}_${task.id}`];
                  return (
                    <div 
                      key={task.id}
                      className={`flex items-start gap-3 p-3 border border-quest-gold-dark/20 rounded hover:bg-quest-panel-light transition-all ${isTaskCompleted ? 'opacity-50 bg-black/30' : 'bg-black/10'}`}
                    >
                      <button 
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
                      </button>
                      <div 
                        className="mt-0.5 text-quest-gold-dark cursor-pointer"
                        onClick={() => toggleTask(selectedSubject, task.id, isTaskCompleted)}
                      >
                        {isTaskCompleted ? <CheckSquare className="text-quest-red" size={20} /> : <Square size={20} />}
                      </div>
                      <span 
                        className={`text-sm cursor-pointer flex-1 ${isTaskCompleted ? 'line-through text-quest-text-muted' : 'text-quest-text'}`}
                        onClick={() => toggleTask(selectedSubject, task.id, isTaskCompleted)}
                      >
                        {task.title}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-quest-text-muted italic text-center py-8">Nenhuma tarefa detalhada para esta matéria ainda.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TASK CONTENT MODAL */}
      {selectedTaskContent && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
          <div className="bg-[#1a1814] border-2 border-quest-gold-dark rounded-sm max-w-4xl w-full h-[90vh] flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.8)]">
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
          </div>
        </div>
      )}
    </div>
  );
}
