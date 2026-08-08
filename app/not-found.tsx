import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-4">
      <h2 className="text-xl font-bold text-amber-400 mb-2">ページが見つかりません</h2>
      <p className="text-xs text-stone-400 mb-6">指定された URL のページは存在しないか移動しました。</p>
      <Link
        href="/"
        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
      >
        トップページに戻る
      </Link>
    </div>
  );
}