// app/beetle-edit/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Camera, Bug, Plus, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

export default function BeetleEditPage() {
  const [beetle, setBeetle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    // URLのクエリパラメータやパスからIDを取得してデータを取得
    const params = new URLSearchParams(window.location.search);
    const id = window.location.pathname.split('/').pop();

    async function fetchBeetle() {
      if (!id) return;
      const { data, error } = await supabase
        .from('beetles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        setBeetle(data);
        setImageUrl(data.image_url || '');
      }
      setLoading(false);
    }
    fetchBeetle();
  }, []);

  const handleImageSave = async () => {
    if (!beetle) return;
    await supabase.from('beetles').update({ image_url: imageUrl }).eq('id', beetle.id);
    alert('写真を保存しました！');
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0d160b] text-[#e2e8df] p-6 flex items-center justify-center">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0d160b] text-[#e2e8df] p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[#8fa888] hover:text-[#d4ebd0] mb-6 transition-colors">
          <ArrowLeft size={18} /> ダッシュボードに戻る
        </Link>
        
        <header className="bg-[#142011] border border-[#2d4424] rounded-3xl p-8 mb-8 shadow-xl">
          <h1 className="text-3xl font-extrabold text-[#f0f7ef]">{beetle?.name || beetle?.beetle_name || "名称未設定個体"}</h1>
          <p className="text-xs text-[#82b366] mt-2">ID: {beetle?.id}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-[#142011] border border-[#2d4424] rounded-3xl p-6 shadow-xl">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d4ebd0]">
                <Camera size={20} className="text-[#82b366]" /> 個体フォト
              </h2>
              
              <div className="h-52 bg-[#0a1108] rounded-2xl mb-4 border border-[#1e3318] flex flex-col items-center justify-center overflow-hidden">
                {imageUrl ? (
                  <img src={imageUrl} alt="Beetle" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4 text-[#5f7d56]">
                    <Bug size={48} className="mx-auto mb-2 opacity-40" />
                    <span className="text-xs">写真が未登録です</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-xs text-[#8fa888]">写真画像URL</label>
                <input 
                  type="text" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..." 
                  className="w-full bg-[#0a1108] border border-[#2d4424] rounded-xl px-4 py-2.5 text-sm text-[#e2e8df] focus:border-[#82b366] outline-none"
                />
                <button 
                  onClick={handleImageSave}
                  className="w-full bg-[#436e32] hover:bg-[#5b8c43] text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg"
                >
                  写真を保存する
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#142011] border border-[#2d4424] rounded-3xl p-6 shadow-xl">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#d4ebd0]">
                <Calendar size={20} className="text-[#82b366]" /> 成長タイムライン・履歴
              </h2>
              
              <div className="bg-[#0a1108] p-4 rounded-2xl mb-6 border border-[#1e3318] space-y-3">
                <p className="text-xs font-bold text-[#8fa888]">新規レコード追加</p>
                <div className="flex gap-2">
                  <input type="text" placeholder="例: 35g / 菌糸ビン交換" className="bg-[#142011] border border-[#2d4424] rounded-xl px-4 py-2.5 w-full text-sm text-[#e2e8df] outline-none focus:border-[#82b366]" />
                  <button className="bg-gradient-to-r from-[#436e32] to-[#5b8c43] px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-1 shrink-0 shadow-lg">
                    <Plus size={16}/> 記録
                  </button>
                </div>
              </div>

              <div className="space-y-4 border-l-2 border-[#2d4424] ml-3 pl-4">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-[#82b366] border-2 border-[#142011]"></div>
                  <p className="text-xs text-[#8fa888]">初期登録</p>
                  <p className="text-sm font-semibold text-[#f0f7ef] mt-0.5">育成スタート</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}