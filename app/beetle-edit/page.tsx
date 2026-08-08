// app/beetle-edit/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Camera, Bug, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function BeetleEditPage() {
  const [beetle, setBeetle] = useState<any>(null);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('幼虫');
  const [weight, setWeight] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    async function fetchBeetle() {
      if (!id) return;
      const { data } = await supabase.from('beetles').select('*').eq('id', id).single();
      if (data) {
        setBeetle(data);
        setName(data.name || '');
        setStatus(data.status || '幼虫');
        setWeight(data.weight !== null ? String(data.weight) : '');
        setImagePreview(data.image_url || '');
      }
    }
    fetchBeetle();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('beetles').update({
      name, status, weight: weight ? Number(weight) : null, image_url: imagePreview
    }).eq('id', beetle.id);
    if (error) alert('保存失敗: ' + error.message);
    else { alert('保存完了しました！'); window.location.href = '/'; }
  };

  if (!beetle) return <div className="p-6 text-center text-[#8fa888]">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-[#0d160b] text-[#e2e8df] p-4 pb-20 font-sans">
      <Link href="/" className="inline-flex items-center gap-1 text-[#8fa888] mb-4 text-sm">
        <ArrowLeft size={16} /> 戻る
      </Link>
      
      <form onSubmit={handleSave} className="max-w-lg mx-auto space-y-6">
        {/* 名前入力エリア */}
        <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424]">
          <label className="text-xs text-[#8fa888]">個体名</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 bg-transparent text-xl font-bold outline-none" />
        </div>

        {/* 写真エリア */}
        <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] text-center">
          <div className="w-full aspect-square bg-[#0a1108] rounded-xl mb-4 overflow-hidden flex items-center justify-center border border-[#1e3318]">
            {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <Bug size={64} className="opacity-20" />}
          </div>
          <label className="block w-full bg-[#436e32] text-white py-4 rounded-xl font-bold active:scale-95 transition-transform cursor-pointer">
            <Camera className="inline mr-2" /> 写真を撮影 / 選択
            <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
          </label>
        </div>

        {/* ステータスエリア */}
        <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] space-y-4">
          <div>
            <label className="text-xs text-[#8fa888]">ステータス</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="w-full mt-1 bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-base">
              {['幼虫','前蛹','蛹','羽化','成虫','その他'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#8fa888]">体重 (g)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
              className="w-full mt-1 bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-base" />
          </div>
        </div>

        <button type="submit" className="w-full bg-[#82b366] text-[#0d160b] py-4 rounded-xl font-extrabold text-lg shadow-lg">
          保存する
        </button>
      </form>
    </div>
  );
}