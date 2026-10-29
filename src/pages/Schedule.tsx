import React, { useState } from 'react';
import { CalendarDays, Clock, MapPin, Star, Mic, Image as ImageIcon, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface ScheduleEvent {
  time: string;
  type: string;
  label: string;
  color: string;
  badgeBg: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SCHEDULE: { day1: ScheduleEvent[]; day2: ScheduleEvent[] } = {
  day1: [
    { time: '10:00 - 11:00', type: '展示', label: '作品展示・ポートフォリオ展示', color: 'bg-cyan-50 border-cyan-200 text-cyan-950', badgeBg: 'bg-cyan-500 text-white', icon: ImageIcon },
    { time: '11:00 - 12:00', type: 'イベント', label: 'トークセッション・ゲスト講演', color: 'bg-pink-50 border-pink-200 text-pink-950', badgeBg: 'bg-pink-500 text-white', icon: Mic },
    { time: '12:00 - 13:00', type: '体験', label: 'ワークショップ・体験イベント', color: 'bg-amber-50 border-amber-200 text-amber-950', badgeBg: 'bg-amber-500 text-white', icon: Star },
    { time: '13:00 - 14:00', type: '展示', label: '作品展示・ポートフォリオ展示', color: 'bg-cyan-50 border-cyan-200 text-cyan-950', badgeBg: 'bg-cyan-500 text-white', icon: ImageIcon },
    { time: '14:00 - 15:00', type: 'イベント', label: 'トークセッション・ゲスト講演', color: 'bg-pink-50 border-pink-200 text-pink-950', badgeBg: 'bg-pink-500 text-white', icon: Mic },
    { time: '15:00 - 16:00', type: '体験', label: 'ワークショップ・体験イベント', color: 'bg-amber-50 border-amber-200 text-amber-950', badgeBg: 'bg-amber-500 text-white', icon: Star },
    { time: '16:00 - 17:00', type: '展示', label: '作品展示・ポートフォリオ展示', color: 'bg-cyan-50 border-cyan-200 text-cyan-950', badgeBg: 'bg-cyan-500 text-white', icon: ImageIcon },
    { time: '17:00 - 18:00', type: 'イベント', label: 'トークセッション・総括講評会', color: 'bg-pink-50 border-pink-200 text-pink-950', badgeBg: 'bg-pink-500 text-white', icon: Mic },
  ],
  day2: [
    { time: '10:00 - 11:00', type: '展示', label: '作品展示・ポートフォリオ展示', color: 'bg-cyan-50 border-cyan-200 text-cyan-950', badgeBg: 'bg-cyan-500 text-white', icon: ImageIcon },
    { time: '11:00 - 12:00', type: '体験', label: 'ワークショップ・体験イベント', color: 'bg-amber-50 border-amber-200 text-amber-950', badgeBg: 'bg-amber-500 text-white', icon: Star },
    { time: '12:00 - 13:00', type: 'イベント', label: 'トークセッション・ゲスト講演', color: 'bg-pink-50 border-pink-200 text-pink-950', badgeBg: 'bg-pink-500 text-white', icon: Mic },
    { time: '13:00 - 14:00', type: '展示', label: '作品展示・ポートフォリオ展示', color: 'bg-cyan-50 border-cyan-200 text-cyan-950', badgeBg: 'bg-cyan-500 text-white', icon: ImageIcon },
    { time: '14:00 - 15:00', type: '体験', label: 'ワークショップ・体験イベント', color: 'bg-amber-50 border-amber-200 text-amber-950', badgeBg: 'bg-amber-500 text-white', icon: Star },
    { time: '15:00 - 16:00', type: 'イベント', label: 'トークセッション・ゲスト講演', color: 'bg-pink-50 border-pink-200 text-pink-950', badgeBg: 'bg-pink-500 text-white', icon: Mic },
    { time: '16:00 - 17:00', type: '展示', label: '作品展示・ポートフォリオ展示', color: 'bg-cyan-50 border-cyan-200 text-cyan-950', badgeBg: 'bg-cyan-500 text-white', icon: ImageIcon },
    { time: '17:00 - 18:00', type: '体験', label: 'フィナーレ・授賞発表会', color: 'bg-purple-50 border-purple-200 text-purple-950', badgeBg: 'bg-purple-600 text-white', icon: Sparkles },
  ]
};

export default function Schedule() {
  const [activeTab, setActiveTab] = useState<'day1' | 'day2'>('day1');

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden pb-20">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-yellow-200 to-transparent rounded-bl-full -z-10 opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-cyan-200 to-transparent rounded-tl-full -z-10 opacity-40 pointer-events-none"></div>
      
      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-8 sm:pb-12 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="relative inline-block">
              <span className="text-cyan-500 font-cursive text-3xl sm:text-4xl absolute -top-6 sm:-top-7 -left-2 sm:-left-3 transform -rotate-12 select-none">
                EVENT
              </span>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                スケジュール
              </h1>
            </div>
            <div className="flex items-center gap-3 mt-2 sm:mt-3">
              <p className="text-xs sm:text-sm font-bold text-slate-500 tracking-[0.2em] uppercase">Event Schedule 2026</p>
              <div className="h-px w-16 bg-slate-300"></div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 max-w-sm w-full md:w-auto">
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              2日間にわたって展示・トーク・体験を開催！<br />
              開場時間: <strong className="text-slate-900 font-bold">10:00 〜 18:00</strong>
            </p>
          </div>
        </div>

        {/* Clean Inline Category Legend */}
        <div className="mt-6 flex flex-wrap items-center justify-start gap-4 sm:gap-6 py-2.5 px-4 bg-white/70 backdrop-blur-xs rounded-xl border border-slate-200/70 text-xs font-bold text-slate-600 w-fit shadow-2xs">
          <span className="text-slate-400 font-black text-[10px] uppercase">区分:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>展示</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-400"></span>
            <span>トーク・講演</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>体験・ワークショップ</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile & Desktop Day Switcher Tabs */}
        <div className="flex bg-slate-200/80 p-1.5 rounded-2xl max-w-md mx-auto mb-8 shadow-inner">
          <button
            onClick={() => setActiveTab('day1')}
            className={clsx(
              "flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]",
              activeTab === 'day1'
                ? "bg-cyan-500 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <CalendarDays className="w-4 h-4 shrink-0" />
            <span>DAY 1</span>
            <span className="text-[11px] font-bold opacity-90 font-mono">2.21 (土)</span>
          </button>
          <button
            onClick={() => setActiveTab('day2')}
            className={clsx(
              "flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]",
              activeTab === 'day2'
                ? "bg-purple-600 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <CalendarDays className="w-4 h-4 shrink-0" />
            <span>DAY 2</span>
            <span className="text-[11px] font-bold opacity-90 font-mono">2.22 (日)</span>
          </button>
        </div>

        {/* Single active day view on mobile, or side-by-side view on desktop if user prefers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Day 1 Column */}
          <div className={clsx(activeTab === 'day1' ? 'block' : 'hidden md:block')}>
            <div className="rounded-2xl pt-4 pb-3 px-5 mb-4 bg-cyan-100/90 border border-cyan-200 text-cyan-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-black tracking-tight">DAY 1</h2>
                <span className="text-xs font-bold font-mono opacity-80">2026.2.21 (土)</span>
              </div>
              <span className="text-[11px] font-bold bg-white/70 px-2.5 py-0.5 rounded-full">10:00 - 18:00</span>
            </div>

            <div className="space-y-3">
              {SCHEDULE.day1.map((item, idx) => (
                <div 
                  key={idx} 
                  className={clsx(
                    "rounded-2xl p-3.5 sm:p-4.5 border transition-all flex items-center justify-between gap-3 shadow-xs bg-white hover:shadow-md",
                    item.color
                  )}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-2xs border border-black/5">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={clsx("text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs", item.badgeBg)}>
                          {item.type}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {item.time}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {item.label}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Day 2 Column */}
          <div className={clsx(activeTab === 'day2' ? 'block' : 'hidden md:block')}>
            <div className="rounded-2xl pt-4 pb-3 px-5 mb-4 bg-purple-100/90 border border-purple-200 text-purple-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-black tracking-tight">DAY 2</h2>
                <span className="text-xs font-bold font-mono opacity-80">2026.2.22 (日)</span>
              </div>
              <span className="text-[11px] font-bold bg-white/70 px-2.5 py-0.5 rounded-full">10:00 - 18:00</span>
            </div>

            <div className="space-y-3">
              {SCHEDULE.day2.map((item, idx) => (
                <div 
                  key={idx} 
                  className={clsx(
                    "rounded-2xl p-3.5 sm:p-4.5 border transition-all flex items-center justify-between gap-3 shadow-xs bg-white hover:shadow-md",
                    item.color
                  )}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-2xs border border-black/5">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={clsx("text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs", item.badgeBg)}>
                          {item.type}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {item.time}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {item.label}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
