const fs = require('fs');
let code = fs.readFileSync('src/components/PdfViewer.tsx', 'utf-8');

code = code.replace(
  'class PdfErrorBoundary extends React.Component<Props, State> {',
  'class PdfErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {'
);
code = code.replace(
  'constructor(props: Props) {',
  'constructor(props: { children: React.ReactNode }) {'
);

fs.writeFileSync('src/components/PdfViewer.tsx', code);
console.log("Patched PdfViewer back");
