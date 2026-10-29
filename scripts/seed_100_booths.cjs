const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, writeBatch } = require('firebase/firestore');

const config = require('../firebase-applet-config.json');

// 1. Generate the attached 20-slide PDF document
async function generateAttachedPdf() {
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const fontBytes = fs.readFileSync('/usr/share/fonts/opentype/ipafont-gothic/ipagp.ttf');
  const font = await pdfDoc.embedFont(fontBytes, { subset: true });

  const width = 842;  // A4 landscape
  const height = 595;

  const slides = [
    {
      title: '卒業進級制作展',
      subtitle: '説明資料',
      bullets: [
        '・ 2025年度 卒業進級制作展 成果発表プレゼンテーション資料',
        '・ Web制作・フロントエンド開発の取り組みと作品成果'
      ]
    },
    {
      title: '目次・コンテンツ',
      subtitle: 'INDEX',
      bullets: [
        '01 ・ 自己紹介',
        '02 ・ 展示作品の紹介',
        '03 ・ 作品詳細紹介・概要',
        '04 ・ 制作手順とプロセス',
        '05 ・ 展示作品の見どころ',
        '06 ・ まとめ'
      ]
    },
    {
      title: '01 ・ 自己紹介',
      subtitle: 'PROFILE',
      boxes: [
        { label: '氏名', val: '一ノ瀬 蓮 (Ren Ichinose)' },
        { label: '学年 / コース', val: '1年 / 情報システムコース' },
        { label: '自己紹介', val: '「Web制作」を中心に幅広いジャンルのWebサイトを制作しています。特にフロントエンドに興味があります。' }
      ]
    },
    {
      title: '02 展示作品の紹介',
      subtitle: 'WORKS OVERVIEW',
      bullets: [
        '・ 多様なニーズに応えるWebサイトの企画・設計・実装を行いました。',
        '・ 各作品のテーマと表現技術にこだわったラインナップです。'
      ]
    },
    {
      title: 'Web作品一覧',
      subtitle: 'PORTFOLIO LINEUP',
      bullets: [
        '・ 高級スポーツカーサイト 「ZEROEDGE」',
        '・ 架空の企業サイト 「ZELEM」',
        '・ ホラー映画サイト 「MIRAGE」',
        '・ 学年企画サイト 「クロスフォール」',
        '・ 完全AIサイト 「POP」',
        '・ 完全AIサイト 「キャンペーンサイト」'
      ]
    },
    {
      title: '展示作品一覧 01',
      subtitle: 'ZEROEDGE / ZELEM',
      boxes: [
        { label: '高級スポーツカーサイト・ZEROEDGE', val: '高級ブランドサイトをイメージし、重厚感のあるスポーツカーサイトを制作しました。' },
        { label: '架空の企業サイト・ZELEM', val: '企業サイトをテーマに、現実にありそうなIT企業のコーポレートサイトを制作しました。' }
      ]
    },
    {
      title: '展示作品一覧 02',
      subtitle: 'MIRAGE / クロスフォール',
      boxes: [
        { label: 'ホラー映画サイト・MIRAGE', val: '実際にありそうなホラー映画サイトを制作し、雰囲気を壊さないように注意して制作しました。' },
        { label: '学年企画サイト・クロスフォール', val: '学年企画・資料集企画でゲーム公式サイトを制作。イラストコースの人と協力してWebサイトを制作しました。' }
      ]
    },
    {
      title: '展示作品一覧 03',
      subtitle: '完全AIサイト',
      boxes: [
        { label: '完全AIサイト・POP', val: 'Google Antigravityを使いすべてAIが制作したサイトです。コーディングは一切していません。すべてプロンプトのみ制作しました。' },
        { label: '完全AIサイト・キャンペーンサイト', val: 'Claude Opus 4.6を使いすべてAIが制作しました。コーディングは一切してません。すべてプロンプトのみで制作しました。' }
      ]
    },
    {
      title: 'Webサイトの全体 (Part 1)',
      subtitle: 'LAYOUT & STRUCTURE',
      bullets: [
        '・ ZEROEDGE / ZELEM / MIRAGE の全体ビューと情報アーキテクチャ',
        '・ ターゲットユーザーに合わせたカラーパレットとタイポグラフィ設計'
      ]
    },
    {
      title: 'Webサイトの全体 (Part 2)',
      subtitle: 'INTERACTION & FLOW',
      bullets: [
        '・ クロスフォール / POP / キャンペーンサイト のレスポンシブ対応',
        '・ スクロール演出とインタラクティブなアニメーション設計'
      ]
    },
    {
      title: '03 作品詳細紹介',
      subtitle: 'DEEP DIVE',
      bullets: [
        '・ 各作品の制作背景と狙いについて詳しくご紹介します。'
      ]
    },
    {
      title: 'Web制作の作品背景 (企業・スポーツカー)',
      subtitle: 'BACKGROUND 01',
      boxes: [
        { label: '企業サイト作品背景', val: '実際にありそうな企業を想定してコーポレートサイトを制作しました。オレンジ色をメインに使いエネルギーのあふれそうな感じを表現してます。' },
        { label: 'スポーツカーブランドサイト作品背景', val: '高級感に意識しながらスポーツカーサイトを制作しました。哲学のような感じの文章にしサイト全体の雰囲気に注目しながら制作しました。' }
      ]
    },
    {
      title: 'Web制作の作品背景 (ホラー・ゲーム)',
      subtitle: 'BACKGROUND 02',
      boxes: [
        { label: 'ホラー映画サイト作品背景', val: '現実にありそうなホラー映画サイトを制作しました。Canvaの生成AIを使い自分の使いたいホラー素材を作成しました。' },
        { label: 'ゲーム公式サイト作品背景', val: '学年企画でのチーム制作でファンタジーゲーム公式サイトを制作しました。いろいろな技術を盛り込んだWebサイトになっています。' }
      ]
    },
    {
      title: 'Web制作の作品背景 (完全AI作品)',
      subtitle: 'BACKGROUND 03',
      boxes: [
        { label: '完全AIサイト POP', val: 'Google Antigravityを使いすべてAIが制作したサイトです。テーマはPOPです。可愛いサイトになるようにAIと相談しながら制作しました。' },
        { label: '完全AIサイト キャンペーンサイト', val: 'Claude Opus 4.6を使いすべてAIが制作しました。テーマは春を連想させるようなキャンペーンサイトです。桜がメインのデザインになってます。' }
      ]
    },
    {
      title: '04 制作手順とプロセス',
      subtitle: 'PROCESS OVERVIEW',
      bullets: [
        '・ 企画立案から公開・展示までのワークフローをご紹介します。'
      ]
    },
    {
      title: '制作手順・素材・プロセス',
      subtitle: '4つの制作ステップ',
      bullets: [
        '1. コンセプト立案: テーマの明確化とターゲット層の決定',
        '2. 素材・参考資料集め: イラスト素材や参考資料を集めweb制作の土台にしていきます',
        '3. プログラミング: vscodeにてhtml/cssを使いプログラミングをする',
        '4. 完成・展示準備: 最終調整後ブース展示'
      ]
    },
    {
      title: '05 作品展示の見どころ',
      subtitle: 'HIGHLIGHTS',
      bullets: [
        '・ 今回の制作展におけるこだわりポイントと技術的挑戦です。'
      ]
    },
    {
      title: '作品展示の見どころ (詳細)',
      subtitle: '4つのポイント',
      bullets: [
        '・ 見どころ1・世界観・コンセプト: サイト全体の色使いやフォント・文章表現を統一し、世界観を意識して制作しました。',
        '・ 見どころ2・UI・構成の工夫: トップページから作品内容が伝わるよう、画面構成や情報の順番を意識して設計しました。',
        '・ 見どころ3・技術的なチャレンジ: HTML / CSS を中心に、レイアウトやアニメーション表現に挑戦しました。特にイラストとサイトが馴染むように実装することに一番時間をかけました。',
        '・ 見どころ4・チーム制作: 学年企画のサイトではイラストコースのメンバーと協力し、役割分担をしながらWebサイトを完成させました。'
      ]
    },
    {
      title: '06 まとめ',
      subtitle: 'SUMMARY',
      bullets: [
        '・ 制作を通じた成長と、今後の展望について。'
      ]
    },
    {
      title: 'まとめ・今回の制作展を通じて',
      subtitle: 'ご来場ありがとうございました',
      bullets: [
        '・ 4月からプログラミングを始めて、1年の集大成として制作をしました。',
        '・ 来年度はもっとクオリティを上げれるように制作をしていきたいです。',
        '・ ご来場いただき、ありがとうございました。',
        '・ ぜひ投票をお願いします！'
      ]
    }
  ];

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    const page = pdfDoc.addPage([width, height]);
    const pageNum = i + 1;

    // Header background
    page.drawRectangle({
      x: 0,
      y: height - 100,
      width: width,
      height: 100,
      color: rgb(0.96, 0.95, 0.98),
    });

    // Decorative accent bar
    page.drawRectangle({
      x: 50,
      y: height - 85,
      width: 6,
      height: 60,
      color: rgb(0.45, 0.2, 0.8),
    });

    // Title
    page.drawText(s.title, {
      x: 70,
      y: height - 55,
      size: 26,
      font: font,
      color: rgb(0.12, 0.1, 0.25),
    });

    // Subtitle
    if (s.subtitle) {
      page.drawText(s.subtitle, {
        x: 72,
        y: height - 78,
        size: 13,
        font: font,
        color: rgb(0.5, 0.4, 0.7),
      });
    }

    // Page number
    page.drawText(pageNum + ' / 20', {
      x: width - 85,
      y: 35,
      size: 11,
      font: font,
      color: rgb(0.6, 0.6, 0.65),
    });

    // Footer note
    page.drawText('ASO 卒業進級制作展 2025 説明資料', {
      x: 50,
      y: 35,
      size: 10,
      font: font,
      color: rgb(0.65, 0.6, 0.7),
    });

    let currentY = height - 150;

    if (s.bullets) {
      for (const b of s.bullets) {
        page.drawRectangle({
          x: 65,
          y: currentY - 8,
          width: width - 130,
          height: 42,
          color: rgb(0.97, 0.97, 0.99),
          borderColor: rgb(0.88, 0.86, 0.94),
          borderWidth: 1,
        });

        page.drawText(b, {
          x: 85,
          y: currentY + 6,
          size: 13,
          font: font,
          color: rgb(0.2, 0.2, 0.3),
        });
        currentY -= 54;
      }
    }

    if (s.boxes) {
      for (const box of s.boxes) {
        page.drawRectangle({
          x: 65,
          y: currentY - 50,
          width: width - 130,
          height: 70,
          color: rgb(0.96, 0.97, 1.0),
          borderColor: rgb(0.75, 0.82, 0.95),
          borderWidth: 1,
        });

        page.drawText(box.label, {
          x: 85,
          y: currentY - 3,
          size: 13,
          font: font,
          color: rgb(0.15, 0.35, 0.75),
        });

        page.drawText(box.val, {
          x: 85,
          y: currentY - 30,
          size: 11.5,
          font: font,
          color: rgb(0.25, 0.25, 0.35),
        });

        currentY -= 88;
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  const pdfPath = path.join(uploadsDir, 'graduation_exhibition_presentation.pdf');
  fs.writeFileSync(pdfPath, pdfBytes);
  console.log('PDF generated at:', pdfPath, 'Size:', pdfBytes.length);
  return '/uploads/graduation_exhibition_presentation.pdf';
}

// 2. Preset SVG Thumbnail Generator
function getPresetSvgThumbnail(numStr, course) {
  const configs = {
    cg: {
      subtitle: 'CG・ゲームコース',
      icon: '🎮',
      grad1: '#4338ca',
      grad2: '#7c3aed',
      grad3: '#ec4899'
    },
    it: {
      subtitle: '情報システムコース',
      icon: '💻',
      grad1: '#0284c7',
      grad2: '#2563eb',
      grad3: '#4f46e5'
    },
    design: {
      subtitle: 'Web・デザインコース',
      icon: '✨',
      grad1: '#059669',
      grad2: '#0d9488',
      grad3: '#0284c7'
    },
    illust: {
      subtitle: 'イラストレーションコース',
      icon: '🎨',
      grad1: '#db2777',
      grad2: '#e11d48',
      grad3: '#f59e0b'
    }
  };

  let cfg = configs.it;
  if ((course || '').includes('CG') || (course || '').includes('ゲーム')) {
    cfg = configs.cg;
  } else if ((course || '').includes('イラスト') || (course || '').includes('グラフィック')) {
    cfg = configs.illust;
  } else if ((course || '').includes('Web') || (course || '').includes('デザイン')) {
    cfg = configs.design;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${cfg.grad1}" />
        <stop offset="50%" stop-color="${cfg.grad2}" />
        <stop offset="100%" stop-color="${cfg.grad3}" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.2" />
      </filter>
    </defs>
    <rect width="1200" height="675" fill="url(#bg)" />
    <circle cx="1050" cy="150" r="320" fill="white" fill-opacity="0.08" />
    <circle cx="150" cy="550" r="260" fill="white" fill-opacity="0.06" />
    <rect x="80" y="60" width="1040" height="555" rx="32" fill="white" fill-opacity="0.12" stroke="white" stroke-width="2" stroke-opacity="0.25" filter="url(#shadow)" />
    <g transform="translate(600, 230)">
      <circle cx="0" cy="0" r="58" fill="white" fill-opacity="0.25" />
      <text x="0" y="16" font-family="sans-serif" font-size="42" text-anchor="middle">${cfg.icon}</text>
    </g>
    <rect x="440" y="315" width="320" height="38" rx="19" fill="white" fill-opacity="0.25" />
    <text x="600" y="340" font-family="sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">${cfg.subtitle}</text>
    <text x="600" y="420" font-family="sans-serif" font-size="52" font-weight="900" fill="white" text-anchor="middle" letter-spacing="2">${numStr}</text>
    <text x="600" y="475" font-family="sans-serif" font-size="20" font-weight="600" fill="white" fill-opacity="0.9" text-anchor="middle">ASO 卒業・進級制作展 2025 出展作品</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// 3. Main Seeding Logic
async function seedBooths() {
  console.log('--- Starting Booth Seeding for 100 Accounts ---');
  
  // Generate PDF
  const pdfUrl = await generateAttachedPdf();

  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);

  // Fetch all users
  const usersSnap = await getDocs(collection(db, 'users'));
  const allUsers = usersSnap.docs.map(d => ({ docId: d.id, ...d.data() }));
  
  // Filter 100 non-admin accounts
  const studentUsers = allUsers
    .filter(u => u.authority !== 'admin' && u.id !== 'admin')
    .sort((a, b) => {
      const getNum = (str) => {
        const m = (str || '').match(/\d+/);
        return m ? parseInt(m[0], 10) : 0;
      };
      return getNum(a.loginId || a.id) - getNum(b.loginId || b.id);
    });

  console.log(`Found ${studentUsers.length} non-admin user accounts.`);

  const roomsList = [
    { floor: '1F', room: '1F 体育館' },
    { floor: '2F', room: '2F 1121' },
    { floor: '2F', room: '2F 1222' },
    { floor: '3F', room: '3F 1131' },
    { floor: '3F', room: '3F 1132' },
    { floor: '3F', room: '3F 1133' },
    { floor: '3F', room: '3F 1134' },
    { floor: '3F', room: '3F 1135' },
  ];

  // Process in batches of 20 (Firestore batch limit is 500 operations)
  // Each user has 1 booth write and 1 user update (2 ops * 20 = 40 ops per batch)
  const batchSize = 20;
  for (let bIdx = 0; bIdx < studentUsers.length; bIdx += batchSize) {
    const chunk = studentUsers.slice(bIdx, bIdx + batchSize);
    const batch = writeBatch(db);

    for (let i = 0; i < chunk.length; i++) {
      const user = chunk[i];
      const indexNum = bIdx + i + 1; // 1 to 100
      const numStr = String(indexNum).padStart(3, '0'); // '001' to '100'

      const boothId = `booth_${numStr}`;
      const roomInfo = roomsList[(indexNum - 1) % roomsList.length];
      const presetThumb = getPresetSvgThumbnail(numStr, user.courseId);

      const boothPayload = {
        id: boothId,
        userId: user.id,
        userLoginId: user.loginId || user.id,
        title: numStr,
        catchphrase: `${numStr}テスト`,
        description: `${numStr}テストテスト`,
        thumbnailUrl: presetThumb,
        pdfs: [
          {
            name: '卒業進級制作展 説明資料.pdf',
            url: pdfUrl
          }
        ],
        youtubes: ['https://www.youtube.com/watch?v=76jpb12ldAQ'],
        externalLinks: ['https://asojuku.ac.jp/aps/'],
        tags: ['展示'],
        authorName: user.name || `学生${numStr}`,
        courseName: user.courseId || '情報システムコース',
        grade: user.grade || '1年',
        floor: roomInfo.floor,
        roomName: roomInfo.room,
        roomId: roomInfo.room,
        courseId: user.courseId || '情報システムコース',
        createdAt: new Date().toISOString()
      };

      // Set booth doc
      const boothDocRef = doc(db, 'boothDetails', boothId);
      batch.set(boothDocRef, boothPayload, { merge: true });

      // Update user doc with their assigned boothId
      const userDocRef = doc(db, 'users', user.docId);
      batch.update(userDocRef, {
        boothId: boothId,
        roomId: roomInfo.room
      });
    }

    await batch.commit();
    console.log(`Committed batch ${Math.floor(bIdx / batchSize) + 1} (${chunk.length} booths and users)`);
  }

  // Also clean up any orphan old room-named booths if they existed
  const oldOrphanIds = ['1F 体育館', '2F 1121', '2F 1222', '3F 1134'];
  const deleteBatch = writeBatch(db);
  for (const oId of oldOrphanIds) {
    deleteBatch.delete(doc(db, 'boothDetails', oId));
  }
  await deleteBatch.commit();
  console.log('Cleaned up legacy room-named booth documents.');

  console.log('=== SUCCESS: 100 Booths Created and Mapped to Users! ===');
}

seedBooths()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
