import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Search,
  ChevronDown, Star, Trophy, Zap, Clock,
  Target, TrendingUp, CheckCircle, Medal, Crown, Flame
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

const achievements = [
  { id: 1, title: 'Primera Mentoría', description: 'Completa tu primera sesión de mentoría', icon: Star, progress: 100, points: 50, unlocked: true, date: '12 Jun 2026', rarity: 'Común' },
  { id: 2, title: 'Estrella del Aprendizaje', description: 'Completa 10 mentorías', icon: Trophy, progress: 70, points: 200, unlocked: false, current: 7, total: 10, rarity: 'Raro' },
  { id: 3, title: 'Maratón de Estudio', description: 'Acumula 50 horas de mentoría', icon: Clock, progress: 62, points: 300, unlocked: false, current: 31, total: 50, rarity: 'Épico' },
  { id: 4, title: 'Maestro del Conocimiento', description: 'Completa 5 cursos diferentes', icon: Crown, progress: 40, points: 500, unlocked: false, current: 2, total: 5, rarity: 'Legendario' },
  { id: 5, title: 'Racha de Estudio', description: 'Mantén una racha de 7 días de estudio', icon: Flame, progress: 100, points: 100, unlocked: true, date: '15 Jul 2026', rarity: 'Común' },
  { id: 6, title: 'Ayudante Destacado', description: 'Ayuda a 5 compañeros en la comunidad', icon: Medal, progress: 60, points: 250, unlocked: false, current: 3, total: 5, rarity: 'Raro' },
  { id: 7, title: 'Recolector de Recursos', description: 'Descarga 20 recursos educativos', icon: Trophy, progress: 45, points: 150, unlocked: false, current: 9, total: 20, rarity: 'Común' },
  { id: 8, title: 'Mentor del Mes', description: 'Obtén la calificación más alta del mes', icon: Crown, progress: 0, points: 1000, unlocked: false, current: 0, total: 1, rarity: 'Legendario' },
  { id: 9, title: 'Velocidad de Aprendizaje', description: 'Completa un curso en menos de 2 semanas', icon: Zap, progress: 100, points: 150, unlocked: true, date: '28 Jun 2026', rarity: 'Raro' },
  { id: 10, title: 'Persistente', description: 'Inicia sesión por 30 días consecutivos', icon: Target, progress: 33, points: 400, unlocked: false, current: 10, total: 30, rarity: 'Épico' },
];

const levelData = {
  level: 7,
  xp: 2450,
  xpToNext: 3000,
  totalXp: 5200,
  rank: 'Avanzado',
  nextRank: 'Experto',
};

const stats = {
  completed: 3,
  inProgress: 4,
  totalPoints: 850,
  totalAchievements: 10,
};

export default function LogrosPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('todos');

  const filteredAchievements = filter === 'todos' ? achievements : filter === 'desbloqueados' ? achievements.filter(a => a.unlocked) : achievements.filter(a => !a.unlocked);

  const rarityColors = {
    'Común': 'border-gray-300 bg-gray-50',
    'Raro': 'border-blue-300 bg-blue-50',
    'Épico': 'border-purple-300 bg-purple-50',
    'Legendario': 'border-yellow-300 bg-yellow-50',
  };

  const rarityIconColors = {
    'Común': 'text-gray-500',
    'Raro': 'text-blue-600',
    'Épico': 'text-purple-600',
    'Legendario': 'text-yellow-600',
  };

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] font-sans">
      <Sidebar />

      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Logros 🏆</h1>
            <p className="text-gray-500 text-sm">Sigue tu progreso y desbloquea todos los logros disponibles.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Buscar logros..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a5c]" />
            </div>
            <button className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"><Bell className="w-5 h-5" /></button>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full pl-1 pr-3 py-1 cursor-pointer">
              <div className="w-8 h-8 bg-[#0f2a5c] rounded-full flex items-center justify-center text-white text-xs font-bold">AM</div>
              <span className="text-sm font-medium text-gray-700">Alex Murga</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0f2a5c] to-[#1a3a7a] rounded-2xl p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-blue-200">Nivel {levelData.level} • {levelData.rank}</p>
                <p className="text-2xl font-bold">{levelData.totalXp.toLocaleString()} XP</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-blue-200 mb-1">
                    <span>{levelData.xp.toLocaleString()} / {levelData.xpToNext.toLocaleString()} XP para {levelData.nextRank}</span>
                  </div>
                  <div className="w-64 bg-white/20 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${(levelData.xp / levelData.xpToNext) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.completed}/{stats.totalAchievements}</p>
                <p className="text-xs text-blue-200">Desbloqueados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.totalPoints}</p>
                <p className="text-xs text-blue-200">Puntos totales</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'desbloqueados', label: 'Desbloqueados' },
            { id: 'bloqueados', label: 'Bloqueados' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === tab.id ? 'bg-[#0f2a5c] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => (
            <div key={achievement.id} className={`bg-white rounded-2xl shadow-sm border-2 p-5 transition-all hover:shadow-md ${
              achievement.unlocked ? rarityColors[achievement.rarity] : 'border-gray-100 opacity-75'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-xl ${achievement.unlocked ? rarityIconColors[achievement.rarity] : 'text-gray-300'} bg-white shadow-sm`}>
                  <achievement.icon className="w-6 h-6" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  achievement.rarity === 'Común' ? 'bg-gray-100 text-gray-700' :
                  achievement.rarity === 'Raro' ? 'bg-blue-100 text-blue-700' :
                  achievement.rarity === 'Épico' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {achievement.rarity}
                </span>
              </div>
              <h4 className="font-semibold text-gray-800 text-sm mb-1">{achievement.title}</h4>
              <p className="text-xs text-gray-500 mb-3">{achievement.description}</p>

              {achievement.unlocked ? (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="w-3.5 h-3.5" /> Desbloqueado</span>
                  <div className="flex items-center gap-1 text-xs text-yellow-600">
                    <Star className="w-3.5 h-3.5 fill-current" /> {achievement.points} pts
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{achievement.current}/{achievement.total}</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {achievement.points} pts</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-[#0f2a5c] h-1.5 rounded-full" style={{ width: `${achievement.progress}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
