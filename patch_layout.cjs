const fs = require('fs');
let code = fs.readFileSync('src/components/layout/AppLayout.tsx', 'utf-8');

// Replace header classes
code = code.replace('bg-white/80 backdrop-blur-md border-b border-slate-100', 'bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800');

// Replace logo text colors
code = code.replace('text-[#1a2b4c]', 'text-zinc-100');
code = code.replace('text-[#1a2b4c] opacity-60', 'text-zinc-400');

// Replace nav link active colors
code = code.replace('text-[#1a2b4c] after:content-[\'\']', 'text-white after:content-[\'\']');
code = code.replace('text-slate-500 hover:text-[#1a2b4c]', 'text-zinc-400 hover:text-white');

// Replace login/logout button
code = code.replace('border-[#1a2b4c] text-[#1a2b4c] hover:bg-slate-50', 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white');
code = code.replace('border-[#1a2b4c] text-[#1a2b4c] hover:bg-slate-50', 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white');

// Replace mobile menu button
code = code.replace('text-slate-500 hover:text-slate-700', 'text-zinc-400 hover:text-white');

// Replace mobile dropdown background
code = code.replace('bg-white border-b border-slate-100', 'bg-zinc-950 border-b border-zinc-800');
code = code.replace('border-b border-slate-50', 'border-b border-zinc-800');
code = code.replace('text-[#1a2b4c] py-2', 'text-zinc-200 py-2');

// Mobile login/logout buttons
code = code.replace('bg-white border border-[#1a2b4c] text-[#1a2b4c]', 'bg-zinc-900 border border-zinc-700 text-zinc-200');
code = code.replace('border border-[#1a2b4c] text-[#1a2b4c]', 'border border-zinc-700 text-zinc-200');
code = code.replace('border border-[#1a2b4c] text-[#1a2b4c]', 'border border-zinc-700 text-zinc-200');

fs.writeFileSync('src/components/layout/AppLayout.tsx', code);
console.log("Patched layout successfully");
