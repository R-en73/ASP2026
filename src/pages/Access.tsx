import React from 'react';
import { MapPin, Phone, Train, Bus, Car, Utensils, Bed, ChevronRight, ExternalLink, Navigation } from 'lucide-react';

export default function Access() {
  return (
    <div 
      className="min-h-screen relative overflow-hidden pb-24 sm:pb-32 bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: "url('/背景-1.jpg')"
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14">
        
        {/* Header Section */}
        <div className="relative mb-8 sm:mb-12 flex justify-between items-end">
          <div>
            <div className="relative inline-block">
              <span className="text-cyan-400 font-cursive text-4xl sm:text-6xl absolute -top-6 sm:-top-8 -left-3 sm:-left-4 transform -rotate-6 opacity-80 select-none">
                Access
              </span>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#1a2b4c] tracking-tight relative z-10 mt-3 sm:mt-4">
                アクセス
              </h1>
            </div>
            <p className="mt-3 sm:mt-4 text-xs sm:text-base text-slate-700 font-bold tracking-wide">
              会場へのアクセス・交通情報をご案内します。
            </p>
          </div>
          
          <div className="hidden md:block pb-4 pr-12">
            <p className="text-[#1a2b4c] font-bold text-lg transform -rotate-6 tracking-widest whitespace-pre-line text-right">
              みなさまのご来場を{'\n'}心よりお待ちしております！
            </p>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 relative z-10 items-stretch">
          
          {/* Left Column: Venue Info */}
          <div className="lg:col-span-3 bg-white/90 backdrop-blur-xl rounded-3xl p-5 sm:p-8 shadow-xl shadow-indigo-100/20 border border-white/60 flex flex-col">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 sm:mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                会場情報
              </h2>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">ASO<br/>高等部</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">卒業進級制作展 会場</p>
            </div>
            
            <hr className="border-slate-100 mb-5 sm:mb-6" />
            
            <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
              <div className="flex gap-3.5">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  〒812-0016<br />福岡県福岡市博多区<br/>博多駅南1丁目14-17
                </div>
              </div>
              <div className="flex gap-3.5">
                <Phone className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-slate-600 font-medium">
                  <a href="tel:092-436-5088" className="hover:text-blue-600 font-bold">
                    TEL 092-436-5088
                  </a>
                  <span className="text-[11px] text-slate-400 ml-1">（代表）</span>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 mb-5 sm:mb-6" />

            <div className="flex-grow space-y-4 sm:space-y-6">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-3 text-xs sm:text-sm">
                <Train className="w-4 h-4 text-slate-400" />
                アクセス概要
              </h4>
              
              <div className="flex gap-3">
                <Train className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 mb-0.5">電車でお越しの方</p>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">JR・地下鉄「博多駅」より徒歩約8分</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Bus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 mb-0.5">バスでお越しの方</p>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">西鉄バス「駅東二丁目」乗車 徒歩約3分</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Car className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 mb-0.5">お車でお越しの方</p>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">※専用駐車場はございません。公共交通機関または近隣コインパーキングをご利用ください。</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-cyan-500 font-cursive text-2xl sm:text-3xl transform -rotate-12 select-none flex items-center gap-2">
              Let's Go! <span className="text-3xl text-cyan-400">☺</span>
            </div>
          </div>

          {/* Center Column: Map */}
          <div className="lg:col-span-5 bg-white/90 backdrop-blur-xl rounded-3xl p-3 sm:p-4 shadow-xl shadow-indigo-100/20 border border-white/60 flex flex-col justify-between">
            <div className="w-full h-[260px] sm:h-[400px] lg:h-full min-h-[260px] rounded-2xl overflow-hidden bg-slate-100 relative shadow-inner">
              <iframe 
                src="https://www.google.com/maps?q=ASOポップカルチャー専門学校&output=embed" 
                className="absolute inset-0 w-full h-full" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Map"
              ></iframe>
            </div>
            <div className="mt-3 text-center">
              <a 
                href="https://maps.google.com/?q=ASOポップカルチャー専門学校" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors min-h-[44px]"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span>Google マップ アプリで開く・経路案内</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: Transport Details */}
          <div className="lg:col-span-4 bg-white/90 backdrop-blur-xl rounded-3xl p-5 sm:p-8 shadow-xl shadow-indigo-100/20 border border-white/60 flex flex-col">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 mb-6 sm:mb-8">
              <Train className="w-5 h-5 text-blue-500" />
              交通手段で調べる
            </h2>

            <div className="space-y-4 sm:space-y-6 flex-grow">
              {/* Train */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <Train className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-1">電車でお越しの方</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">JR・地下鉄「博多駅」筑紫口より<br/>南へ徒歩約8分</p>
                </div>
              </div>

              {/* Bus */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-green-500/20">
                  <Bus className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-1">バスでお越しの方</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">博多駅バスターミナルより「駅東二丁目」乗車<br/>下車後、徒歩約3分</p>
                </div>
              </div>

              {/* Car */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-pink-500/20">
                  <Car className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-1">お車でお越しの方</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">※駐車場はございません。<br/>周辺のコインパーキングをご利用いただくか、公共交通機関をご利用ください。</p>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 my-6 sm:my-8" />

            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-500" />
                会場周辺のスポット検索
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=博多駅+飲食店" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-full border border-blue-200 text-blue-600 bg-white hover:bg-blue-50 text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[38px]"
                >
                  <Utensils className="w-3.5 h-3.5" /> 周辺の飲食店 <ExternalLink className="w-3 h-3" />
                </a>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=博多駅+ホテル" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-full border border-blue-200 text-blue-600 bg-white hover:bg-blue-50 text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[38px]"
                >
                  <Bed className="w-3.5 h-3.5" /> 宿泊施設 <ExternalLink className="w-3 h-3" />
                </a>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=博多駅南+コインパーキング" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-full border border-blue-200 text-blue-600 bg-white hover:bg-blue-50 text-xs font-bold flex items-center gap-1.5 transition-colors min-h-[38px]"
                >
                  <div className="w-3.5 h-3.5 border-2 border-current rounded-[3px] flex items-center justify-center text-[9px] font-black">P</div> 
                  駐車場 <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <a 
                href="https://maps.google.com/?q=ASOポップカルチャー専門学校" 
                target="_blank" 
                rel="noreferrer"
                className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl py-4 px-5 shadow-lg active:scale-98 transition-all group min-h-[48px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-sm sm:text-base">Google マップでルートを確認</span>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            </div>

          </div>

        </div>
      </div>
      
      {/* Bottom left decorative text */}
      <div className="absolute bottom-10 left-10 text-white/50 font-cursive text-5xl transform -rotate-12 z-0 hidden md:block select-none pointer-events-none mix-blend-overlay">
        Create<br/>Your Future
      </div>
    </div>
  );
}
