import { lazy, Suspense, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import * as Dialog from '@radix-ui/react-dialog';
import {
  ArrowRight,
  CalendarDays,
  ExternalLink,
  Instagram,
  MapPin,
  Menu,
  X,
} from 'lucide-react';
import { getBooths, getNews } from '../../lib/db';
import type { BoothDetail, NewsItem } from '../../types';
const Hero3D = lazy(() => import('./Hero3D'));

gsap.registerPlugin(ScrollTrigger);

const courses = [
  { code: 'GAME', name: 'ゲームコース', color: '#1458ff' },
  { code: 'ILLUST', name: 'イラストコース', color: '#9a2cff' },
  { code: 'IT', name: '情報系ITコース', color: '#00bde8' },
  { code: '3DCG', name: '3DCGコース', color: '#18b86b' },
];

export default function FigmaHome() {
  const [featuredBooths, setFeaturedBooths] = useState<BoothDetail[]>([]);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    getBooths().then((items) => setFeaturedBooths(items.slice(0, 4)));
    getNews().then((items) => setNewsList(items.slice(0, 4)));

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    const context = gsap.context(() => {
      const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });
      entrance
        .from('.figma-header', { y: -24, opacity: 0, duration: 0.55 })
        .from('.figma-hero-copy > *', { y: 28, opacity: 0, duration: 0.7, stagger: 0.08 }, '-=0.28')
        .from('.figma-hero-visual', { x: 70, opacity: 0, duration: 0.95 }, '-=0.72')
        .from('.figma-speed-lines', { scaleX: 1.35, opacity: 0, duration: 0.8 }, '-=0.82')
        .from('.figma-course-card', {
          y: 24,
          opacity: 0,
          duration: 0.55,
          stagger: 0.08,
          scrollTrigger: { trigger: '.figma-course-grid', start: 'top 88%', once: true },
        }, '-=0.2');

      gsap.utils.toArray<HTMLElement>('.figma-reveal').forEach((element) => {
        gsap.from(element, {
          y: 42,
          opacity: 0,
          duration: 0.75,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 88%',
            once: true,
          },
        });
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      context.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="figma-home min-h-screen overflow-hidden bg-[#edf9ff] text-[#10245a]">
      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <header className="figma-header">
          <Link to="/" className="figma-logo" aria-label="ASO高等部 卒業進級制作展 ホーム">
            <span className="figma-logo-mark">ASO</span>
            <span className="figma-logo-sub">卒業進級制作展 2026</span>
          </Link>

          <nav className="figma-desktop-nav" aria-label="メインナビゲーション">
            <a href="#about">ABOUT</a>
            <a href="#exhibition">EXHIBITION</a>
            <a href="#information">INFORMATION</a>
            <Link to="/access">ACCESS</Link>
            <a href="#sns">SNS</a>
          </nav>

          <Dialog.Trigger asChild>
            <button className="figma-menu-button" type="button" aria-label="メニューを開く">
              <Menu className="h-4 w-4" />
              <span>MENU</span>
            </button>
          </Dialog.Trigger>
        </header>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[70] bg-[#08245d]/55 backdrop-blur-sm" />
          <Dialog.Content className="fixed right-3 top-3 z-[71] w-[calc(100%-1.5rem)] max-w-sm rounded-[24px] bg-white p-5 shadow-2xl outline-none">
            <div className="mb-5 flex items-center justify-between">
              <Dialog.Title className="text-lg font-black text-[#10245a]">MENU</Dialog.Title>
              <Dialog.Close asChild>
                <button type="button" aria-label="メニューを閉じる" className="grid h-10 w-10 place-items-center rounded-full bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">サイト内の主要ページへ移動できます。</Dialog.Description>
            <nav className="grid gap-2">
              {[
                ['ABOUT', '/#about'],
                ['EXHIBITION', '/#exhibition'],
                ['INFORMATION', '/#information'],
                ['ACCESS', '/access'],
                ['SNS', '/#sns'],
              ].map(([label, href]) => (
                <Link key={label} to={href} onClick={() => setMenuOpen(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-[#10245a]">
                  {label}
                </Link>
              ))}
              <Link to="/booths" onClick={() => setMenuOpen(false)} className="mt-2 rounded-xl bg-[#1b4be8] px-4 py-3 text-center text-sm font-black text-white">
                作品を見る
              </Link>
            </nav>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <main>
        <section className="figma-hero">
          <div className="figma-speed-lines" aria-hidden="true" />
          <motion.div
            className="figma-hero-copy figma-hero-text"
            initial={false}
          >
            <p className="figma-eyebrow">ASO HIGH SCHOOL</p>
            <h1>
              ASO高等部
              <span>卒業進級</span>
              <span>制作展</span>
              <strong>2026</strong>
            </h1>
            <p className="figma-hero-tagline">つくることで、つながる未来へ。</p>
            <div className="figma-event-meta">
              <span><CalendarDays className="h-4 w-4" /> 2026.02.21 SAT — 02.22 SUN</span>
              <span><MapPin className="h-4 w-4" /> ASO高等部 各教室・体育館</span>
            </div>
          </motion.div>

          <div
            className="figma-hero-visual"
            role="img"
            aria-label="デザインカンプのイラスト。現時点では画像を配置せず代替テキストのみ表示"
          >
            <div className="figma-character-placeholder" aria-hidden="true">
              <span>人物イラスト</span>
            </div>
            <div className="figma-building-placeholder" aria-hidden="true">
              <span>校舎イラスト</span>
            </div>
            <Suspense fallback={<div className="absolute inset-0 grid place-items-center text-xs font-bold text-white/80">3D SPACE</div>}>
              <Hero3D />
            </Suspense>
          </div>
        </section>

        <section id="about" className="figma-about figma-reveal">
          <div className="figma-about-copy">
            <p className="figma-section-label">ABOUT</p>
            <h2>この展示会について</h2>
            <p>
              ASO高等部デジタルクリエイティブコースの、ひとりひとりの作品を展示します。
              自分の好きなことを形にした作品を、ぜひご覧ください。
            </p>
            <Link to="/schedule" className="figma-button figma-button-dark">
              詳しく見る <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div
            className="figma-about-visual"
            role="img"
            aria-label="制作展のイラスト。画像は未配置"
          >
            <span>ABOUT ILLUSTRATION</span>
          </div>
        </section>

        <section id="exhibition" className="figma-exhibition figma-reveal">
          <div className="figma-exhibition-copy">
            <p className="figma-section-label">EXHIBITION</p>
            <h2>展示作品</h2>
            <p>ゲーム・Web・デザイン・映像など、多彩なジャンルの作品をご覧いただけます。</p>
            <Link to="/booths" className="figma-button figma-button-blue">
              作品を見る <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="figma-course-grid">
            {courses.map((course) => (
              <Link
                key={course.code}
                to="/booths"
                className="figma-course-card"
                style={{ '--course-color': course.color } as React.CSSProperties}
              >
                <div
                  className="figma-course-visual"
                  role="img"
                  aria-label={`${course.name}の作品イメージ。画像は未配置`}
                >
                  <span>{course.code}</span>
                </div>
                <strong>{course.name}</strong>
                <ArrowRight className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </section>

        <section id="information" className="figma-information figma-reveal">
          <div className="figma-info-card">
            <CalendarDays className="h-10 w-10" />
            <div>
              <p className="figma-section-label">INFORMATION</p>
              <h2>お知らせ</h2>
            </div>
            <div className="figma-news-list">
              {(newsList.length > 0
                ? newsList
                : [
                    { id: '1', date: '2026.01.15', title: '展示会の開催情報を公開しました', category: 'important' },
                    { id: '2', date: '2026.01.10', title: '作品エントリーを受付中です', category: 'event' },
                  ] as NewsItem[]
              ).map((item) => (
                <Link key={item.id} to={`/news?id=${item.id}`} className="figma-news-row">
                  <time>{item.date}</time>
                  <span>{item.title}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          <div className="figma-access-card">
            <MapPin className="h-10 w-10" />
            <div>
              <p className="figma-section-label">ACCESS</p>
              <h2>アクセス</h2>
            </div>
            <p>ASOポプラカルチャー専門学校<br />ASO高等部</p>
            <Link to="/access" className="figma-button figma-button-white">
              Google Mapで見る <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          <div id="sns" className="figma-sns-card">
            <Instagram className="h-10 w-10" />
            <div>
              <p className="figma-section-label">SNS</p>
              <h2>最新情報をチェック</h2>
            </div>
            <div className="flex gap-2">
              <a href="https://x.com" target="_blank" rel="noreferrer" className="figma-social-link" aria-label="X">X</a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="figma-social-link" aria-label="YouTube">▶</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="figma-social-link" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>

        <footer className="figma-camp-footer">
          <div className="figma-camp-footer-brand">
            <span className="figma-logo-mark">ASO</span>
            <div>
              <strong>ASO高等部 卒業進級制作展2026</strong>
              <span>ASO Graduation &amp; Advancement Exhibition2026</span>
            </div>
          </div>
          <p>つくることで、つながる未来へ。</p>
          <small>© 2026 ASO High School. All Rights Reserved.</small>
        </footer>

        {featuredBooths.length > 0 && (
          <section className="figma-featured figma-reveal">
            <div className="flex items-end justify-between">
              <div>
                <p className="figma-section-label">PICK UP</p>
                <h2>注目の作品</h2>
              </div>
              <Link to="/booths" className="figma-button figma-button-white">
                作品一覧 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="figma-featured-grid">
              {featuredBooths.slice(0, 4).map((booth) => (
                <Link key={booth.id} to={`/booths/${booth.id}`} className="figma-featured-card">
                  <div
                    className="figma-featured-image"
                    role="img"
                    aria-label={`${booth.title}の作品イメージ。画像は未配置`}
                  >
                    <span>作品イメージ</span>
                  </div>
                  <strong>{booth.title}</strong>
                  <span>{booth.authorName || '出展者'}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
