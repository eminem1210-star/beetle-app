'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

type Beetle = {
  id: string;
  name: string;
  type: string;
  gender: string;
  status: string;
  bloodline: string;
  container: string;
  memo: string;
  image_url: string;
};

export default function Home() {
  const router = useRouter();
  const [beetles, setBeetles] = useState<Beetle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserAndFetchData();
  }, []);

  const checkUserAndFetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    fetchBeetles();
  };

  const fetchBeetles = async () => {
    try {
      const { data, error } = await supabase
        .from('beetles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBeetles(data || []);
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <div className="text-white text-center py-20 bg-slate-950 min-h-screen">読み込み中...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-slate-950 text-white min-h-screen">
      {/* ヘッダー部分 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">BEETLE MASTER'S GROVE</h1>
          <p className="text-xs text-slate-400">カブトムシ・クワガタ育成管理ダッシュボード</p>
        </div>
        <div className="flex gap-3 items-center">
          <Link
            href="/new"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm transition"
          >
            + 新規個体を登録
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-sm transition shadow"
          >
            ログアウト
          </button>
        </div>
      </div>

      {/* 個体カード一覧 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {beetles.map((beetle) => (
          <div
            key={beetle.id}
            className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg flex flex-col"
          >
            <div className="h-48 bg-slate-800 relative">
              {beetle.image_url ? (
                <img src={beetle.image_url} alt={beetle.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-600 text-sm">画像なし</div>
              )}
              <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-950/80 text-amber-400 text-xs rounded border border-slate-700">
                {beetle.status}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-lg text-white">{beetle.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">{beetle.gender}</span>
                </div>
                <p className="text-xs text-amber-500/90 mb-2">{beetle.type}</p>
                {beetle.bloodline && <p className="text-xs text-slate-400">血統: {beetle.bloodline}</p>}
                {beetle.container && <p className="text-xs text-slate-400">容器: {beetle.container}</p>}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <Link
                  href={`/edit?id=${beetle.id}`}
                  className="w-full text-center py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded transition"
                >
                  詳細・編集
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}