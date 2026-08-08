// app/register/page.tsx を上書き
'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Camera, Bug, ArrowLeft, Calendar, UserPlus, Info } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('幼虫');
  const [weight, setWeight] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  // 追加項目
  const [pedigree, setPedigree] = useState('');
  const [generation, setGeneration] = useState('CB');
  const [source, setSource] = useState('');
  const [startDate, setStartDate] = useState(new Date().toLocaleDateString('ja-JP'));
  const [startLogText, setStartLogText] = useState('育成スタート');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const initialHistory = [{ date: startDate, text: startLogText }];

    const { error } = await supabase.from('beetles').insert([{
      name, status, weight: weight ? Number(weight) : null, image_url: imagePreview,
      pedigree, generation, source, history: initialHistory
    }]);

    if (error) alert('登録失敗: ' + error.message);
    else { alert('登録完了！'); window.location.href = '/'; }
  };

  return (
    <div className="min-h-screen bg-[#0d160b] text-[#e2e8df] p-4 pb-20 font-sans">
      <Link href="/" className="inline-flex items-center gap-1 text-[#8fa888] mb-4 text-sm"><ArrowLeft size={16} /> ダッシュボードへ</Link>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
        <h1 className="text-xl font-extrabold text-[#f0f7ef]">新規個体登録</h1>

        {/* 基本情報 */}
        <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] space-y-4">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="個体名 / 管理名" className="w-full bg-transparent text-xl font-bold outline-none" />
          <div className="grid grid-cols-2 gap-4">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-[#0a1108] p-2 rounded-lg text-sm">{['幼虫','前蛹','蛹','羽化','成虫','その他'].map(s => <option key={s} value={s}>{s}</option>)}</select>
            <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="体重(g)" className="bg-[#0a1108] p-2 rounded-lg text-sm" />
          </div>
        </div>

        {/* 血統・詳細情報 */}
        <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] space-y-3">
          <h2 className="text-sm font-bold text-[#d4ebd0] flex items-center gap-2"><Info size={16}/> 血統・管理情報</h2>
          <input type="text" value={pedigree} onChange={(e) => setPedigree(e.target.value)} placeholder="血統名（例: 88mm直系）" className="w-full bg-[#0a1108] p-3 rounded-lg text-sm" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" value={generation} onChange={(e) => setGeneration(e.target.value)} placeholder="累代（例: CB, F1）" className="bg-[#0a1108] p-3 rounded-lg text-sm" />
            <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="入手先" className="bg-[#0a1108] p-3 rounded-lg text-sm" />
          </div>
        </div>

        {/* 写真・タイムラインは前回のまま省略しますが、適宜追加してください */}
        <button type="submit" className="w-full bg-[#82b366] text-[#0d160b] py-4 rounded-xl font-bold text-lg">登録する</button>
      </form>
    </div>
  );
}