import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default async function Home() {
  const { data: beetles, error } = await supabase
    .from('beetles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="p-4">データ取得エラー: {error.message}</div>;
  }

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🪲 カブトムシ・クワガタ管理</h1>

      <Link href="/register" className="bg-green-600 text-white px-4 py-2 rounded">
        新規個体登録
      </Link>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {beetles?.map((b) => (
          <div key={b.id} className="bg-stone-900 p-4 rounded">
            <h2 className="text-lg font-bold">{b.name}</h2>
            <Link href={`/edit/${b.id}`} className="text-blue-400 underline">
              編集する
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
