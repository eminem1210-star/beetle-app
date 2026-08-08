// app/register/page.tsx
'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Camera, Bug, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('幼虫');
  const [weight, setWeight] = useState('');
  const [imagePreview, setImagePreview] = useState('');
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
    if (!name.trim()) {
      alert('個体名を入力してください');
      return;
    }

    const initialHistory = [
      { date: startDate || '初期登録', text: startLogText || '育成スタート' }
    ];

    const { error } = await supabase.from('beetles').insert([
      {
        name,
        status,
        weight: weight ? Number(weight) : null,
        image_url: imagePreview,
        history: initialHistory
      }
    ]);

    if (error) {
      alert('登録失敗: ' + error.message);
    } else {
      alert('新しい個体を登録しました！');
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-[#0d160b] text-[#e2e8df] p-4 pb-20 font-sans">
      <Link href="/" className="inline-flex items-center gap-1 text-[#8fa888] mb-4 text-sm">
        <ArrowLeft size={16} /> ダッシュボードに戻る
      </Link>
      
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
        <header className="mb-2">
          <h1 className="text-xl font-extrabold text-[#f0f7ef]">新規個体登録</h1>
          <p className="text-xs text-[#8fa888]">新しいカブト・クワガタの育成データを登録します</p>
        </header>

        <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424]">
          <label className="text-xs text-[#8fa888]">個体名 / 管理名</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="例: ヘラクレス 1号"
            className="w-full mt-1 bg-transparent text-xl font-bold outline-none text-[#f0f7ef]" 
          />
        </div>

        <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] text-center">
          <div className="w-full aspect-square bg-[#0a1108] rounded-xl mb-4 overflow-hidden flex items-center justify-center border border-[#1e3318]">
            {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <Bug size={64} className="opacity-20 text-[#5f7d56]" />}
          </div>
          <label className="block w-full bg-[#436e32] hover:bg-[#5b8c43] text-white py-4 rounded-xl font-bold active:scale-95 transition-transform cursor-pointer">
            <Camera className="inline mr-2" /> 写真を撮影 / 選択
            <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
          </label>
        </div>

        <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] space-y-4">
          <div>
            <label className="text-xs text-[#8fa888]">ステータス</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="w-full mt-1 bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-base text-[#e2e8df]">
              {['幼虫','前蛹','蛹','羽化','成虫','その他'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#8fa888]">体重 (g)</label>
            <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)}
              placeholder="例: 35.5"
              className="w-full mt-1 bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-base text-[#e2e8df]" />
          </div>
        </div>

        <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] space-y-4">
          <h2 className="text-sm font-bold flex items-center gap-2 text-[#d4ebd0]">
            <Calendar size={18} className="text-[#82b366]" /> 初回タイムライン設定
          </h2>
          <div>
            <label className="text-xs text-[#8fa888]">日付</label>
            <input 
              type="text" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full mt-1 bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-sm text-[#e2e8df] outline-none" 
            />
          </div>
          <div>
            <label className="text-xs text-[#8fa888]">最初のメモ（初期ログ）</label>
            <input 
              type="text" 
              value={startLogText} 
              onChange={(e) => setStartLogText(e.target.value)}
              placeholder="例: 1令投入、菌糸ビンへ移行など"
              className="w-full mt-1 bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-sm text-[#e2e8df] outline-none" 
            />
          </div>
        </div>

        <button type="submit" className="w-full bg-[#82b366] hover:bg-[#93c47d] text-[#0d160b] py-4 rounded-xl font-extrabold text-lg shadow-lg">
          個体を登録する
        </button>
      </form>
    </div>
  );
}