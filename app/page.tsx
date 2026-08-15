'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

type Beetle = {
  id: string;
  name: string;
  type: string;
  gender: string;
  status: string;
  memo: string;
  image_url: string;
  created_at: string;
};

export default function Home() {
  const router = useRouter();
  const [beetles, setBeetles] = useState<Beetle[]>([]);
  const [loading, setLoading] = useState(true);
  // チェックされた個体のIDを保存する配列
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchBeetles();
  }, []);

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

  // チェックボックスのオン/オフ切り替え
  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 全選択 / 全解除
  const handleSelectAll = () => {
    if (selectedIds.length === beetles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(beetles.map((b) => b.id));
    }
  };

  // 選択した個体の一括削除
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`選択した ${selectedIds.length} 件の個体を削除してもよろしいですか？`)) return;

    try {
      const { error } = await supabase
        .from('beetles')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;
      setSelectedIds([]);
      fetchBeetles();
    } catch (error) {
      console.error('一括削除エラー:', error);
      alert('削除に失敗しました。');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* ヘッダー部分 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-amber-400 tracking-wider">
              BEETLE MASTER'S GROVE
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              カブトムシ・クワガタ育成管理ダッシュボード
            </p>
          </div>
          <Link
            href="/new"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition transform hover:-translate-y-0.5"
          >
            + 新規個体を登録
          </Link>
        </div>

        {/* 一括操作バー（レ点選択用） */}
        {!loading && beetles.length > 0 && (
          <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl mb-6 border border-slate-800">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedIds.length === beetles.length && beetles.length > 0}
                onChange={handleSelectAll}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-300">
                すべて選択 ({selectedIds.length} / {beetles.length} 件選択中)
              </span>
            </div>
            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition"
              >
                選択した個体を削除
              </button>
            )}
          </div>
        )}

        {/* ローディング表示 */}
        {loading ? (
          <div className="text-center py-20 text-slate-500">読み込み中...</div>
        ) : beetles.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-800">
            <p className="text-slate-400 mb-4">登録されている個体がいません。</p>
            <Link
              href="/new"
              className="text-amber-400 hover:underline font-semibold"
            >
              最初の個体を登録してみましょう
            </Link>
          </div>
        ) : (
          /* メインのカード一覧画面（かっこいいダークUI） */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {beetles.map((beetle) => {
              const isSelected = selectedIds.includes(beetle.id);
              return (
                <div
                  key={beetle.id}
                  className={`relative bg-slate-900 rounded-2xl overflow-hidden border transition shadow-xl flex flex-col ${
                    isSelected ? 'border-amber-500 ring-2 ring-amber-500/50' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* チェックボックス（カードの左上） */}
                  <div className="absolute top-3 left-3 z-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(beetle.id)}
                      className="w-6 h-6 accent-amber-500 rounded shadow-md cursor-pointer"
                    />
                  </div>

                  {/* 画像表示エリア */}
                  <div className="h-48 bg-slate-800 relative">
                    {beetle.image_url ? (
                      <img
                        src={beetle.image_url}
                        alt={beetle.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm">
                        画像なし
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-950/80 backdrop-blur text-xs font-semibold rounded-full text-amber-400 border border-slate-700">
                      {beetle.status}
                    </span>
                  </div>

                  {/* 情報エリア */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white truncate">
                          {beetle.name}
                        </h3>
                        <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                          {beetle.gender}
                        </span>
                      </div>
                      <p className="text-xs text-amber-500/90 font-semibold mb-3">
                        {beetle.type}
                      </p>
                      {beetle.memo && (
                        <p className="text-sm text-slate-400 line-clamp-2 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 mb-4">
                          {beetle.memo}
                        </p>
                      )}
                    </div>

                    {/* 編集ボタン */}
                    <Link
                      href={`/edit?id=${beetle.id}`}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-center text-xs font-bold text-slate-200 rounded-xl transition border border-slate-700"
                    >
                      詳細・編集
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}