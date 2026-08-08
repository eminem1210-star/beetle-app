// app/edit/[id]/page.tsx
import { supabase } from '../../../lib/supabase';
import { Camera, Bug, Save, Plus, ArrowLeft, Trash2, Calendar, Weight } from "lucide-react";
import Link from "next/link";

export default async function EditPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  // 個体情報の取得
  const { data: beetle, error } = await supabase
    .from('beetles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !beetle) {
    return (
      <div className="min-h-screen bg-[#0d160b] text-[#e2e8df] p-6 flex flex-col items-center justify-center">
        <p className="text-red-400 mb-4">個体データが見つかりませんでした。</p>
        <Link href="/" className="bg-[#436e32] px-6 py-2 rounded-xl text-white">トップに戻る</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d160b] text-[#e2e8df] p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* ヘルパーナビ */}
        <Link href="/" className="inline-flex items-center gap-2 text-[#8fa888] hover:text-[#d4ebd0] mb-6 transition-colors">
          <ArrowLeft size={18} /> 管理ダッシュボードに戻る
        </Link>
        
        {/* ヘッダーカード */}
        <header className="bg-[#142011] border border-[#2d4424] rounded-3xl p-8 mb-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold bg-[#1e3318] text-[#90c279] px-3 py-1 rounded-xl border border-[#3b5d2e]">
                ID: {beetle.id}
              </span>
              <span className="text-xs bg-[#24381e] text-[#b4d6a8] px-3 py-1 rounded-xl border border-[#3b5d2e]">
                ステータス: {beetle.status || "育成中"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#f0f7ef]">{beetle.name || beetle.beetle_name || "名称未設定個体"}</h1>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 左カラム：基本情報・写真アップロード */}
          <div className="space-y-6">
            <div className="bg-[#142011] border border-[#2d4424] rounded-3xl p-6 shadow-xl">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d4ebd0]">
                <Camera size={20} className="text-[#82b366]" /> 個体フォト
              </h2>
              
              {/* 写真プレビューエリア */}
              <div className="h-52 bg-[#0a1108] rounded-2xl mb-4 border border-[#1e3318] flex flex-col items-center justify-center overflow-hidden relative group">
                {beetle.image_url ? (
                  <img src={beetle.image_url} alt="Beetle" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4 text-[#5f7d56]">
                    <Bug size={48} className="mx-auto mb-2 opacity-40" />
                    <span className="text-xs">写真が未登録です</span>
                  </div>
                )}
              </div>

              {/* 写真URL入力・更新用フォーム */}
              <form action={async (formData) => {
                'use server'
                const imageUrl = formData.get('image_url') as string;
                await supabase.from('beetles').update({ image_url: imageUrl }).eq('id', id);
              }} className="space-y-3">
                <label className="text-xs text-[#8fa888]">写真画像URL（またはパス）</label>
                <input 
                  type="text" 
                  name="image_url" 
                  defaultValue={beetle.image_url || ''} 
                  placeholder="https://..." 
                  className="w-full bg-[#0a1108] border border-[#2d4424] rounded-xl px-4 py-2.5 text-sm text-[#e2e8df] focus:border-[#82b366] outline-none"
                />
                <button type="submit" className="w-full bg-[#2d4424] hover:bg-[#3b5d2e] text-[#d4ebd0] py-2.5 rounded-xl text-sm font-bold transition-all">
                  写真を保存する
                </button>
              </form>
            </div>
          </div>

          {/* 右カラム：成長記録・タイムライン */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#142011] border border-[#2d4424] rounded-3xl p-6 shadow-xl">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#d4ebd0]">
                <Calendar size={20} className="text-[#82b366]" /> 成長タイムライン・履歴
              </h2>
              
              {/* ログ追加フォーム */}
              <div className="bg-[#0a1108] p-4 rounded-2xl mb-6 border border-[#1e3318] space-y-3">
                <p className="text-xs font-bold text-[#8fa888]">新規レコード（体重・マット交換など）を追加</p>
                <div className="flex gap-2">
                  <input type="text" placeholder="例: 35g / 菌糸ビン交換" className="bg-[#142011] border border-[#2d4424] rounded-xl px-4 py-2.5 w-full text-sm text-[#e2e8df] outline-none focus:border-[#82b366]" />
                  <button className="bg-gradient-to-r from-[#436e32] to-[#5b8c43] px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-1 shrink-0 shadow-lg">
                    <Plus size={16}/> 記録
                  </button>
                </div>
              </div>

              {/* タイムラインの履歴一覧 */}
              <div className="space-y-4 border-l-2 border-[#2d4424] ml-3 pl-4">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-[#82b366] border-2 border-[#142011]"></div>
                  <p className="text-xs text-[#8fa888]">初期登録データ</p>
                  <p className="text-sm font-semibold text-[#f0f7ef] mt-0.5">状態: {beetle.status || "育成中"} / 体重: {beetle.weight || "未記録"}g</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}