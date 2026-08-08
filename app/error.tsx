'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-4">
      <h2 className="text-xl font-bold text-red-400 mb-2">エラーが発生しました</h2>
      <p className="text-xs text-stone-400 mb-6">{error.message}</p>
      <button
        onClick={() => reset()}
        className="bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold px-4 py-2 rounded-xl border border-stone-700 transition-all"
      >
        もう一度試す
      </button>
    </div>
  );
}