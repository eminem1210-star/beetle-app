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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterType, setFilterType] = useState('すべて');

  useEffect(() => {
    checkUserAndFetchData();
  }, []);

  // 1. ログインチェックとデータ取得
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

  // ログアウト処理
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // 一括選択の切り替え
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(beetles.map((b) => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 一括削除処理
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`選択した ${selectedIds.length} 件の個体を削除してもよろしいですか？`)) return;

    try {
      const { error } = await supabase
        .from('beetles')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;

      setBeetles(beetles.filter((b) => !selectedIds.includes(b.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error('一括削除エラー:', error);
      alert('削除に失敗しました。');
    }
  };

  const filteredBeetles = beetles.filter((b) => {
    if (filterType === 'すべて') return true;
    return b.type === filterType;
  });

  if (loading) {
    return <div className="text-white text-center py-20 bg-slate-950 min-h-screen">認証確認中...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-slate-950 text-white min-h-screen">
      {/* ヘッダー部分 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-amber-400">BEETLE MASTER'S GROVE</h1>
          <p className="text-xs text-slate-400">カブトムシ・クワガタ育成管理ダッシュボード</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/new"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm transition"
          >
            + 新規個体を登録
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"
          >
            ログアウト
          </button>
        </div>
      </div>

      {/* 一括操作バー */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6 flex justify-between items-center">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={beetles.length > 0 && selectedIds.length === beetles.length}
            onChange={handleSelectAll}
            className="w-4 h-4 rounded accent-amber-500"
          />
          すべて選択 ({selectedIds.length} / {beetles.length}件選択中)
        </label>
        {selectedIds.length > 0 && (
          <button
            onClick={handleDeleteSelected}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded transition"
          >
            選択した項目を一括削除
          </button>
        )}
      </div>

      {/* 個体カード一覧 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredBeetles.map((beetle) => (
          <div
            key={beetle.id}
            className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg relative flex flex-col"
          >
            <div className="absolute top-3 left-3 z-10">
              <input
                type="checkbox"
                checked={selectedIds.includes(beetle.id)}
                onChange={() => handleSelectOne(beetle.id)}
                className="w-5 h-5 rounded accent-amber-500 cursor-pointer shadow"
              />
            </div>
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