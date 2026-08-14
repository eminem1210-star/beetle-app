'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Bug, Plus, Calendar, Activity, Weight, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [beetles, setBeetles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkUserAndFetch() {
      // 1. ログインしているかチェック
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login'); // ログインしていなければログイン画面へ
        return;
      }

      // 2. ログイン中のユーザーのデータだけを取得
      const { data, error } = await supabase
        .from('beetles')
        .select('*')
        .eq('user_id', session.user.id)
        .order('id', { ascending: false });

      if (error) console.error(error);
      else setBeetles(data || []);
      setLoading(false);
    }
    checkUserAndFetch();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen bg-[#0d160b] text-[#e2e8df] p-6 text-center">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-[#0d160b] text-[#e2e8df] p-4 sm:p-6 pb-20 font-sans">
      {/* ヘッダー */}
      <header className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pt-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-wider text-[#f0f7ef] text-center sm:text-left">BEETLE MASTER'S GROVE</h1>
          <p className="text-xs text-[#8fa888] tracking-widest text-center sm:text-left">SUPREME BREEDER MANAGEMENT SYSTEM</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
          <Link href="/register" className="bg-[#436e32] hover:bg-[#5b8c43] text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 text-sm">
            <Plus size={18} /> 新規個体登録
          </Link>
          <button onClick={handleLogout} className="bg-[#1f1212] hover:bg-[#331c1c] text-[#e88888] px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-1 border border-[#442222] transition-all text-sm">
            <LogOut size={16} /> ログアウト
          </button>
        </div>
      </header>

      {/* アプリの説明セクション */}
      <div className="max-w-5xl mx-auto bg-[#142011] p-5 rounded-2xl border border-[#2d4424] space-y-3 mb-6">
        <h2 className="text-sm font-bold text-[#d4ebd0] flex items-center gap-2">
          <span>💡</span> このアプリでできること
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#8fa888]">
          <div className="bg-[#0a1108] p-3 rounded-xl border border-[#1e3318]">
            <span className="text-[#82b366] font-bold block mb-1">📸 個体の一元管理</span>
            写真、血統、累代、入手先、性別を個体ごとにまとめて綺麗に保存できます。
          </div>
          <div className="bg-[#0a1108] p-3 rounded-xl border border-[#1e3318]">
            <span className="text-[#82b366] font-bold block mb-1">📈 成長のタイムライン</span>
            日々のステータス変化や体重の推移を記録として残せます。
          </div>
          <div className="bg-[#0a1108] p-3 rounded-xl border border-[#1e3318]">
            <span className="text-[#82b366] font-bold block mb-1">✏️ 簡単な更新・修正</span>
            いつでもデータの編集や、間違えた記録の削除、写真の差し替えが可能です。
          </div>
        </div>
      </div>

      {/* 一覧セクション */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-sm font-bold text-[#8fa888] mb-4">育成個体一覧 ({beetles.length})</h2>

        {beetles.length === 0 ? (
          <div className="bg-[#142011] p-10 rounded-2xl border border-[#2d4424] text-center space-y-3">
            <p className="text-sm text-[#8fa888]">登録されている個体がまだありません。</p>
            <Link href="/register" className="inline-block bg-[#436e32] text-white px-4 py-2 rounded-xl text-xs font-bold">
              最初の個体を登録する
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {beetles.map((beetle) => {
              const lastLog = beetle.history && beetle.history.length > 0 ? beetle.history[beetle.history.length - 1] : null;

              return (
                <div key={beetle.id} className="bg-[#142011] rounded-2xl border border-[#2d4424] overflow-hidden flex flex-col shadow-xl hover:border-[#436e32] transition-all">
                  
                  <div className="px-4 py-2.5 bg-[#0e170c] border-b border-[#2d4424] flex items-center justify-between text-xs text-[#8fa888]">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-[#82b366]" />
                      {lastLog ? lastLog.date : '初期登録'}
                    </span>
                    <Link href={`/edit?id=${beetle.id}`} className="text-[#82b366] hover:underline font-bold">
                      編集・詳細 →
                    </Link>
                  </div>

                  <div className="w-full aspect-square bg-[#0a1108] overflow-hidden flex items-center justify-center border-b border-[#2d4424]">
                    {beetle.image_url ? (
                      <img src={beetle.image_url} alt={beetle.name} className="w-full h-full object-cover" />
                    ) : (
                      <Bug size={48} className="opacity-20 text-[#5f7d56]" />
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-lg font-extrabold text-[#f0f7ef] truncate">{beetle.name}</h3>
                      {beetle.pedigree && <p className="text-xs text-[#8fa888] truncate mt-0.5">血統: {beetle.pedigree}</p>}
                    </div>

                    <div className="bg-[#0a1108] p-2.5 rounded-xl border border-[#1e3318] space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[#d4ebd0]">
                        <span className="flex items-center gap-1 text-[#8fa888]">
                          <Activity size={12} className="text-[#82b366]" /> ステータス
                        </span>
                        <span className="font-bold bg-[#142011] px-2 py-0.5 rounded border border-[#2d4424] text-[#82b366]">
                          {beetle.status || '幼虫'}
                        </span>
                      </div>
                      {beetle.weight && (
                        <div className="flex items-center justify-between text-[#d4ebd0] pt-1 border-t border-[#1e3318]">
                          <span className="flex items-center gap-1 text-[#8fa888]">
                            <Weight size={12} className="text-[#82b366]" /> 体重
                          </span>
                          <span className="font-bold text-[#f0f7ef]">{beetle.weight} g</span>
                        </div>
                      )}
                    </div>
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