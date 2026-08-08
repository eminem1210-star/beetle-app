// app/page.tsx
import Link from "next/link";
import { Plus, TreeDeciduous, Bug, Award } from "lucide-react";
import { supabase } from '../lib/supabase';

export default async function Home() {
  const { data: beetles, error } = await supabase
    .from('beetles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="p-4 text-red-400 bg-[#1a2418]">データ取得エラーが発生しました: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-[#0d160b] text-[#e2e8df] p-6 font-sans">
      {/* 森のヘッダー */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-10 border-b border-[#2d4424] pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#1b2e15] rounded-2xl border border-[#3b5d2e] shadow-lg">
            <TreeDeciduous className="w-8 h-8 text-[#82b366]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-wider text-[#d4ebd0]">BEETLE MASTER'S GROVE</h1>
            <p className="text-xs text-[#8fa888] tracking-widest uppercase">Supreme Breeder Management System</p>
          </div>
        </div>
        <Link 
          href="/register" 
          className="bg-gradient-to-r from-[#436e32] to-[#5b8c43] hover:from-[#4f7f3b] hover:to-[#699e4f] text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-[#1b2e15]/50 border border-[#72a859]/30 transition-all transform hover:-translate-y-0.5 font-bold"
        >
          <Plus size={20} /> 新規個体登録
        </Link>
      </header>

      {/* 個体一覧グリッド */}
      <main className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6 text-[#9ab890]">
          <Bug size={20} />
          <h2 className="text-xl font-bold text-[#d4ebd0]">育成個体一覧 ({beetles?.length || 0})</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beetles?.map((beetle: any) => (
            <div 
              key={beetle.id} 
              className="bg-[#142011] border border-[#2d4424] rounded-3xl p-6 shadow-xl hover:border-[#63964b] transition-all relative overflow-hidden group"
            >
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#3b5d2e]/10 rounded-full blur-2xl group-hover:bg-[#5b8c43]/20 transition-all"></div>

              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className="text-xs font-bold bg-[#1e3318] text-[#90c279] px-3 py-1.5 rounded-xl border border-[#3b5d2e]">
                  ID: {beetle.id}
                </span>
                <Link 
                  href={`/edit/${beetle.id}`}
                  className="text-xs bg-[#24381e] hover:bg-[#324f2b] text-[#b4d6a8] px-3 py-1.5 rounded-xl border border-[#3b5d2e] transition-colors"
                >
                  編集する
                </Link>
              </div>

              <h3 className="text-2xl font-bold text-[#f0f7ef] mb-3 relative z-10">
                {beetle.name || beetle.beetle_name || "名称未設定個体"}
              </h3>

              <div className="h-40 bg-[#0a1108] rounded-2xl mb-4 border border-[#1e3318] flex flex-col items-center justify-center text-[#4a6b3c] relative overflow-hidden">
                {beetle.image_url ? (
                  <img src={beetle.image_url} alt="Beetle" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Bug size={40} className="mb-2 opacity-40" />
                    <span className="text-xs text-[#5f7d56]">No Image</span>
                  </>
                )}
              </div>

              <div className="space-y-2 text-sm text-[#a8bda0] relative z-10 border-t border-[#1e3318] pt-4">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-[#82b366]" />
                  <span>管理ステータス: 育成中</span>
                </div>
              </div>
            </div>
          ))}

          {(!beetles || beetles.length === 0) && (
            <div className="col-span-full text-center py-20 bg-[#142011] rounded-3xl border border-[#2d4424]">
              <TreeDeciduous className="w-16 h-16 text-[#3b5d2e] mx-auto mb-4" />
              <p className="text-[#a8bda0] text-lg">登録されている個体がいません。</p>
              <p className="text-xs text-[#6e8a65] mt-1">「新規個体登録」から最初の個体を迎え入れましょう。</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}