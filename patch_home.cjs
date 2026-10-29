const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const newHome = `const Home = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  
  useEffect(() => {
    getSystemSettings().then(setSettings);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] overflow-x-hidden w-full text-zinc-100">
      
      {/* 1. Hero Section */}
      <section className="relative w-full min-h-[700px] md:min-h-[900px] bg-zinc-950 overflow-hidden">
        {/* Use the uploaded illustration as the background */}
        <img src="/背景-1.jpg" alt="Hero Background" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        
        {/* Dark Vignette/Gradient overlay so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 h-full flex flex-col">
          
          <div className="max-w-2xl mt-10 md:mt-20">
            <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.2] tracking-tight mb-8 drop-shadow-2xl">
              <span className="block mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">つくる、つながる、</span>
              <span className="block text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]">未来がひらく。</span>
            </h1>
            
            <p className="text-base md:text-lg text-zinc-300 font-bold leading-loose mb-12 drop-shadow-md max-w-md">
              学生たちの「今」をのせた、<br/>
              創造と挑戦の作品たちを<br/>
              ぜひ会場でご覧ください。
            </p>
            
            <div className="mb-8">
              <div className="text-xl md:text-2xl font-bold text-zinc-400 mb-1">2025</div>
              <div className="flex items-baseline gap-2 md:gap-4 text-white">
                <div className="text-5xl md:text-7xl font-black tracking-tighter drop-shadow-md">
                  10.18 <span className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-pink-600 text-white text-sm md:text-base font-bold align-middle ml-1 md:ml-2 shadow-lg shadow-pink-600/30">SAT</span>
                </div>
                <span className="text-3xl font-bold text-zinc-600">-</span>
                <div className="text-5xl md:text-7xl font-black tracking-tighter drop-shadow-md">
                  10.19 <span className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-cyan-600 text-white text-sm md:text-base font-bold align-middle ml-1 md:ml-2 shadow-lg shadow-cyan-600/30">SUN</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-zinc-200 font-bold bg-zinc-900/60 border border-zinc-800 backdrop-blur px-4 md:px-5 py-3 rounded-full inline-flex text-sm md:text-base">
              <MapPin className="w-5 h-5 text-pink-500" />
              会場：本校 各教室・展示スペース
            </div>
          </div>
          
          {/* Circular CTA Button */}
          <div className="absolute right-4 bottom-24 md:right-32 md:bottom-40 z-20">
            <Link to="/booths" className="group relative flex items-center justify-center w-36 h-36 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-pink-600 via-rose-500 to-cyan-500 text-white shadow-[0_0_30px_rgba(236,72,153,0.3)] hover:scale-105 transition-transform duration-300 border-4 border-zinc-900">
              <div className="absolute inset-0 rounded-full bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <div className="text-center">
                <span className="block text-base md:text-xl font-bold mb-3 tracking-wide drop-shadow-md">作品を見て<br/>応援しよう！</span>
                <span className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-zinc-900 text-pink-400 rounded-full shadow-inner">
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </span>
              </div>
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute left-6 md:left-10 bottom-10 flex flex-col items-center gap-2 z-20 hidden md:flex">
            <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 rotate-90 origin-left mb-6">SCROLL</span>
            <div className="w-px h-16 bg-zinc-700 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-pink-500 animate-bounce"></div>
            </div>
          </div>
        </div>

        {/* Bottom curve mask */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10">
          <svg className="relative block w-full h-[60px] md:h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C7.75,3.67,15.65,8.12,23.86,13.25,93.42,56.76,206.2,85.28,321.39,56.44Z" className="fill-[#09090b]"></path>
          </svg>
        </div>
      </section>

      {/* Decorative Blobs */}
      <div className="absolute top-[800px] left-0 w-64 h-64 bg-cyan-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 -z-10 hidden md:block"></div>
      <div className="absolute top-[1000px] right-0 w-72 h-72 bg-pink-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 -z-10 hidden md:block"></div>

      {/* 2. Event Section */}
      <section className="py-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="flex flex-col xl:flex-row gap-12 items-start xl:items-end mb-12">
          <div className="xl:w-1/3">
            <p className="text-pink-500 font-cursive text-xl font-bold tracking-widest mb-2">EVENT</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tight">イベント情報</h2>
            <p className="text-sm md:text-base text-zinc-400 font-medium leading-loose mb-8">
              期間中は、さまざまなイベントを開催！<br/>
              学生たちの作品と一緒に、特別な時間をお楽しみください。
            </p>
            <Link to="/schedule" className="inline-flex items-center justify-center px-6 py-3 border border-pink-500/50 text-pink-400 hover:text-pink-300 rounded-full text-sm font-bold hover:bg-pink-500/10 transition-colors gap-2">
              イベント一覧を見る <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="xl:w-2/3 flex flex-col md:flex-row gap-6 w-full overflow-x-auto pb-4 snap-x hide-scrollbar">
            {/* Event Card 1 */}
            <div className="snap-center shrink-0 w-full md:w-80 bg-zinc-900/80 backdrop-blur rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300 border border-zinc-800">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-bl-full -z-10"></div>
              <div className="text-pink-500 font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">10.18</span> <span className="bg-pink-600 text-white text-[10px] px-2 py-0.5 rounded-full">SAT</span>
              </div>
              <div className="text-sm text-pink-400/80 font-medium mb-4">11:00 - 12:00</div>
              <h3 className="text-xl font-bold text-zinc-100 mb-4">オープニングセレモニー</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium mb-10">制作展の開幕を記念して、<br/>オープニングセレモニーを行います。</p>
              <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-pink-400 shadow-sm group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
            
            {/* Event Card 2 */}
            <div className="snap-center shrink-0 w-full md:w-80 bg-zinc-900/80 backdrop-blur rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300 border border-zinc-800">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-bl-full -z-10"></div>
              <div className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">10.18</span> <span className="bg-cyan-600 text-white text-[10px] px-2 py-0.5 rounded-full">SAT</span>
              </div>
              <div className="text-sm text-cyan-400/80 font-medium mb-4">14:00 - 15:30</div>
              <h3 className="text-xl font-bold text-zinc-100 mb-4">クリエイティブトーク</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium mb-10">在校生・卒業生による<br/>トークセッションを開催します。</p>
              <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-cyan-400 shadow-sm group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Event Card 3 */}
            <div className="snap-center shrink-0 w-full md:w-80 bg-zinc-900/80 backdrop-blur rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300 border border-zinc-800">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-bl-full -z-10"></div>
              <div className="text-yellow-500 font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">10.19</span> <span className="bg-yellow-600 text-white text-[10px] px-2 py-0.5 rounded-full">SUN</span>
              </div>
              <div className="text-sm text-yellow-500/80 font-medium mb-4">13:00 - 16:00</div>
              <h3 className="text-xl font-bold text-zinc-100 mb-4">ワークショップ</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium mb-10">体験型のワークショップで<br/>一緒にものづくりを楽しめます。</p>
              <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-yellow-500 shadow-sm group-hover:scale-110 group-hover:bg-yellow-500 group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full relative py-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800 max-w-[1400px] mx-auto px-4 opacity-50"></div>
        </div>
      </div>

      {/* 3. Pick Up Section */}
      <section className="py-16 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-20 left-0 w-72 h-72 bg-pink-600 rounded-full mix-blend-screen filter blur-[100px] opacity-10 -z-10 hidden md:block"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <p className="text-cyan-400 font-cursive text-xl font-bold tracking-widest mb-2">PICK UP</p>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">注目の作品</h2>
            <p className="text-sm md:text-base text-zinc-400 font-medium leading-loose">
              今年の制作展から、特におすすめの作品をピックアップしました。<br className="hidden md:block" />
              学生たちの個性と情熱が詰まった作品をぜひご覧ください。
            </p>
          </div>
          <Link to="/booths" className="text-sm font-bold text-zinc-300 hover:text-pink-400 transition-colors flex items-center gap-2">
            全ての作品を見る <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <Link to="/booths" className="bg-zinc-900/50 backdrop-blur rounded-[1.5rem] p-3 shadow-sm hover:shadow-2xl hover:shadow-pink-500/10 hover:-translate-y-1 transition-all duration-300 border border-zinc-800 group">
            <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-4 bg-zinc-800">
              <div className="absolute top-3 left-3 z-10 bg-pink-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">Webデザインコース</div>
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600 text-xs">作品画像 (仮)</div>
            </div>
            <div className="px-2 pb-2 relative">
              <h3 className="font-bold text-zinc-100 text-lg mb-2 group-hover:text-pink-400 transition-colors">Neo City - 未来都市のデザイン</h3>
              <p className="text-sm text-zinc-400 mb-4 line-clamp-2">サイバーパンクな世界観をベースにした、次世代の都市インフラデザイン提案。</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300">A</div>
                <span className="text-xs text-zinc-500 font-bold">Team Alpha</span>
              </div>
            </div>
          </Link>
          
          {/* Card 2 */}
          <Link to="/booths" className="bg-zinc-900/50 backdrop-blur rounded-[1.5rem] p-3 shadow-sm hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all duration-300 border border-zinc-800 group">
            <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-4 bg-zinc-800">
              <div className="absolute top-3 left-3 z-10 bg-cyan-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">3DCGコース</div>
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600 text-xs">作品画像 (仮)</div>
            </div>
            <div className="px-2 pb-2 relative">
              <h3 className="font-bold text-zinc-100 text-lg mb-2 group-hover:text-cyan-400 transition-colors">Dragon's Lair</h3>
              <p className="text-sm text-zinc-400 mb-4 line-clamp-2">緻密なテクスチャとライティングで表現された、壮大なファンタジー世界。</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300">S</div>
                <span className="text-xs text-zinc-500 font-bold">Studio B</span>
              </div>
            </div>
          </Link>

          {/* Card 3 */}
          <Link to="/booths" className="bg-zinc-900/50 backdrop-blur rounded-[1.5rem] p-3 shadow-sm hover:shadow-2xl hover:shadow-yellow-500/10 hover:-translate-y-1 transition-all duration-300 border border-zinc-800 group">
            <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-4 bg-zinc-800">
              <div className="absolute top-3 left-3 z-10 bg-yellow-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">グラフィックデザインコース</div>
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600 text-xs">作品画像 (仮)</div>
            </div>
            <div className="px-2 pb-2 relative">
              <h3 className="font-bold text-zinc-100 text-lg mb-2 group-hover:text-yellow-400 transition-colors">Typography 2025</h3>
              <p className="text-sm text-zinc-400 mb-4 line-clamp-2">文字の可能性を追求した、実験的なタイポグラフィポスターシリーズ。</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300">Y</div>
                <span className="text-xs text-zinc-500 font-bold">Y. Tanaka</span>
              </div>
            </div>
          </Link>

          {/* Card 4 */}
          <Link to="/booths" className="bg-zinc-900/50 backdrop-blur rounded-[1.5rem] p-3 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 border border-zinc-800 group">
            <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-4 bg-zinc-800">
              <div className="absolute top-3 left-3 z-10 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">イラストレーションコース</div>
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600 text-xs">作品画像 (仮)</div>
            </div>
            <div className="px-2 pb-2 relative">
              <h3 className="font-bold text-zinc-100 text-lg mb-2 group-hover:text-purple-400 transition-colors">星の降る夜に</h3>
              <p className="text-sm text-zinc-400 mb-4 line-clamp-2">デジタルペインティングで描かれた、心温まる絵本風イラストレーション。</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-300">M</div>
                <span className="text-xs text-zinc-500 font-bold">M. Suzuki</span>
              </div>
            </div>
          </Link>
        </div>
      </section>
      
      <div className="pb-32"></div>
    </div>
  );
};`;

const startIndex = code.indexOf('const Home = () => {');
const endIndex = code.indexOf('export default function App() {');
if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + newHome + "\n\n" + code.substring(endIndex);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched successfully");
} else {
  console.log("Could not find start or end index");
}
