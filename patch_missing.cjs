const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const missingComponents = `
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-100">
    <h2 className="text-4xl font-bold mb-4">404</h2>
    <p className="text-zinc-400">ページが見つかりません</p>
    <Link to="/" className="mt-8 text-pink-400 hover:text-pink-300">トップページに戻る</Link>
  </div>
);
`;

const endIndex = code.indexOf('export default function App() {');
if (endIndex !== -1) {
  code = code.substring(0, endIndex) + missingComponents + "\n\n" + code.substring(endIndex);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched missing components successfully");
}
