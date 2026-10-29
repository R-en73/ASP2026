const fs = require('fs');
let code = fs.readFileSync('src/pages/Booths.tsx', 'utf-8');

// 1. Update the default selected floor from '1F' to 'ALL' (or keep '1F 体育館'?) Let's use 'ALL' so it shows everything by default.
code = code.replace("useState<string>('1F');", "useState<string>('ALL');");

// 2. Update floor check in filteredBooths
code = code.replace(
  "if (selectedFloor !== 'ALL' && b.floor !== selectedFloor) return false;",
  "if (selectedFloor !== 'ALL' && b.floor !== selectedFloor && b.roomName !== selectedFloor) return false;"
);

// 3. Update floor buttons
const oldFloorButtons = `['ALL', '1F', '2F', '3F', '4F'].map(floor => (`;
const newFloorButtons = `['ALL', '1F 体育館', '2F 1121', '2F 1222', '3F 1131', '3F 1132', '3F 1133', '3F 1134', '3F 1135'].map(floor => (`;
code = code.replace(oldFloorButtons, newFloorButtons);

// 4. Update Course Checkboxes in sidebar
const oldSidebarCourses = `                    {[
                      { label: 'Webデザインコース', color: 'bg-blue-500' },
                      { label: 'グラフィックデザインコース', color: 'bg-pink-500' },
                      { label: '映像・アニメーションコース', color: 'bg-orange-500' },
                      { label: 'ゲームコース', color: 'bg-cyan-500' },
                      { label: 'プロダクトデザインコース', color: 'bg-yellow-700' },
                      { label: 'その他', color: 'bg-slate-400' }
                    ]`;

const newSidebarCourses = `                    {[
                      { label: '情報システムコース', color: 'bg-blue-500' },
                      { label: 'CGコース', color: 'bg-pink-500' },
                      { label: 'イラストコース', color: 'bg-orange-500' },
                      { label: 'ゲームクリエイターコース', color: 'bg-cyan-500' },
                      { label: 'Webデザインコース', color: 'bg-purple-500' },
                      { label: 'グラフィックデザインコース', color: 'bg-red-500' },
                      { label: '映像・アニメーションコース', color: 'bg-yellow-500' },
                      { label: 'ゲームコース', color: 'bg-green-500' },
                      { label: 'プロダクトデザインコース', color: 'bg-teal-500' },
                      { label: 'その他', color: 'bg-slate-400' }
                    ]`;

code = code.replace(oldSidebarCourses, newSidebarCourses);

// Also we should make the sidebar checkboxes work with `selectedCourse` state!
// Find the input checkbox:
const oldCheckbox = `<input type="checkbox" className="sr-only peer" />`;
const newCheckbox = `<input type="checkbox" className="sr-only peer" checked={selectedCourse === c.label} onChange={() => setSelectedCourse(selectedCourse === c.label ? 'すべてのコース' : c.label)} />`;
code = code.replace(oldCheckbox, newCheckbox);

// Find the "すべてクリア" button
const oldClear = `<button className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">`;
const newClear = `<button onClick={() => setSelectedCourse('すべてのコース')} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">`;
code = code.replace(oldClear, newClear);

fs.writeFileSync('src/pages/Booths.tsx', code);
console.log('Booths patched successfully.');
