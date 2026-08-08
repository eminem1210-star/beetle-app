// app/beetle-edit/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Camera, Bug, ArrowLeft, Save, Trash2, Info } from "lucide-react";
import Link from "next/link";

export default function EditPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [beetle, setBeetles] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchBeetle() {
      const { data } = await supabase.from('beetles').select('*').eq('id', id).single();
      if (data) {
        setBeetles(data);
        setLoading(false);
      }
    }
    fetchBeetle();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBeetles({ ...beetle, image_url: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('beetles').update({
      name: beetle.name,
      status: beetle.status,
      weight: beetle.weight ? Number(beetle.weight) : null,
      gender: beetle.gender,
      image_url: beetle.image_url,
      pedigree: beetle.pedigree,
      generation: beetle.generation,
      source: beetle.source,
    }).eq('id', id);

    if (error) alert('更新失敗: ' + error.message);
    else { alert('更新しました！'); window.location.href = '/'; }
  };

  const handleDelete = async () => {
    if (!confirm('本当に削除しますか？')) return;
    await supabase.from('beetles').delete().eq('id', id);
    window.location.href = '/';
  };

  if (loading) return <div className="p-10 text-center text-[#8fa888]">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0d160b] text-[#e2e8df] p-4 pb-20 font-sans">
      <Link href="/" className="inline-flex items-center gap-1 text-[#8fa888] mb-4 text-sm">
        <ArrowLeft size={16} /> ダッシュボードに戻る
      </Link>
      
      <form onSubmit={handleUpdate} className="max-w-lg mx-auto space-y-6">
        <header className="mb-2">
          <h1 className="text-xl font-extrabold text-[#f0f7ef]">個体編集</h1>
          <p className="text-xs text-[#8fa888]">育成データを編集・更新します</p>
        </header>

        <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424]">
          <label className="text-xs text-[#8fa888]">個体名 / 管理名</label>
          <input 
            type="text" 
            value={beetle.name || ''} 
            onChange={(e) => setBeetles({...beetle, name: e.target.value})}
            className="w-full mt-1 bg-transparent text-xl font-bold outline-none text-[#f0f7ef]" 
          />
        </div>

        <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] text-center">
          <div className="w-full aspect-square bg-[#0a1108] rounded-xl mb-4 overflow-hidden flex items-center justify-center border border-[#1e3318]">
            {beetle.image_url ? <img src={beetle.image_url} className="w-full h-full object-cover" /> : <Bug size={64} className="opacity-20 text-[#5f7d56]" />}
          </div>
          <label className="block w-full bg-[#436e32] hover:bg-[#5b8c43] text-white py-4 rounded-xl font-bold active:scale-95 transition-transform cursor-pointer">
            <Camera className="inline mr-2" /> 写真を変更
            <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
          </label>
        </div>

        <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#8fa888]">ステータス</label>
              <select value={beetle.status || '幼虫'} onChange={(e) => setBeetles({...beetle, status: e.target.value})}
                className="w-full mt-1 bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-base text-[#e2e8df]">
                {['幼虫','前蛹','蛹','羽化','成虫','その他'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#8fa888]">性別</label>
              <select value={beetle.gender || '不明'} onChange={(e) => setBeetles({...beetle, gender: e.target.value})}
                className="w-full mt-1 bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-base text-[#e2e8df]">
                {['不明','オス','メス'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-[#8fa888]">体重 (g)</label>
            <input type="number" step="0.1" value={beetle.weight || ''} onChange={(e) => setBeetles({...beetle, weight: e.target.value})}
              className="w-full mt-1 bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-base text-[#e2e8df]" />
          </div>
        </div>

        <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] space-y-3">
          <h2 className="text-sm font-bold text-[#d4ebd0] flex items-center gap-2"><Info size={16}/> 血統・管理情報</h2>
          <input type="text" value={beetle.pedigree || ''} onChange={(e) => setBeetles({...beetle, pedigree: e.target.value})} placeholder="血統名" className="w-full bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-sm text-[#e2e8df] outline-none" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" value={beetle.generation || ''} onChange={(e) => setBeetles({...beetle, generation: e.target.value})} placeholder="累代" className="bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-sm text-[#e2e8df] outline-none" />
            <input type="text" value={beetle.source || ''} onChange={(e) => setBeetles({...beetle, source: e.target.value})} placeholder="入手先" className="bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-sm text-[#e2e8df] outline-none" />
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" className="flex-1 bg-[#82b366] hover:bg-[#93c47d] text-[#0d160b] py-4 rounded-xl font-extrabold text-lg flex items-center justify-center gap-2 shadow-lg">
            <Save size={18} /> 保存する
          </button>
          <button type="button" onClick={handleDelete} className="bg-[#441414] hover:bg-[#5c1c1c] text-[#e88888] px-6 rounded-xl font-bold flex items-center justify-center shadow-lg">
            <Trash2 size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}