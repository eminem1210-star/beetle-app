// app/beetle-edit/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Camera, Bug, ArrowLeft, Calendar, Save, Plus } from "lucide-react";
import Link from "next/link";

export default function BeetleEditPage() {
  const [beetle, setBeetle] = useState<any>(null);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('幼虫');
  const [weight, setWeight] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [newLogText, setNewLogText] = useState('');

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
        setHistory(data.history || [{ date: '初期登録', text: '育成スタート' }]);
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

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogText.trim()) return;
    const today = new Date().toLocaleDateString('ja-JP');
    const updatedHistory = [{ date: today, text: newLogText }, ...history];
    setHistory(updatedHistory);
    setNewLogText('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toLocaleDateString('ja-JP');
    const autoLogText = `ステータス: ${status} / 体重: ${weight ? weight + 'g' : '記録なし'}`;
    const finalHistory = [{ date: today, text: autoLogText }, ...history];

    const { error } = await supabase.from('beetles').update({
      name, 
      status, 
      weight: weight ? Number(weight) : null, 
      image_url: imagePreview,
      history: finalHistory
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
            className="w-full mt-1 bg-transparent text-xl font-bold outline-none text-[#f0f7ef]" />
        </div>

        {/* 写真エリア */}
        <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] text-center">
          <div className="w-full aspect-square bg-[#0a1108] rounded-xl mb-4 overflow-hidden flex items-center justify-center border border-[#1e3318]">
            {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <Bug size={64} className="opacity-20 text-[#5f7d56]" />}
          </div>
          <label className="block w-full bg-[#436e32] hover:bg-[#5b8c43] text-white py-4 rounded-xl font-bold active:scale-95 transition-transform cursor-pointer">
            <Camera className="inline mr-2" /> 写真を撮影 / 選択
            <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
          </label>
        </div>

        {/* ステータスエリア */}
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
              className="w-full mt-1 bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-base text-[#e2e8df]" />
          </div>
        </div>

        {/* タイムライン・履歴エリア */}
        <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] space-y-4">
          <h2 className="text-sm font-bold flex items-center gap-2 text-[#d4ebd0]">
            <Calendar size={18} className="text-[#82b366]" /> 成長タイムライン・履歴
          </h2>

          <div className="flex gap-2">
            <input 
              type="text" 
              value={newLogText} 
              onChange={(e) => setNewLogText(e.target.value)} 
              placeholder="例: マット交換、暴れ確認など" 
              className="flex-1 bg-[#0a1108] border border-[#2d4424] p-3 rounded-xl text-sm outline-none text-[#e2e8df]"
            />
            <button type="button" onClick={handleAddLog} className="bg-[#2d4424] hover:bg-[#3b5d2e] px-4 rounded-xl font-bold text-sm text-[#d4ebd0] flex items-center gap-1">
              <Plus size={16} /> 記録
            </button>
          </div>

          <div className="space-y-3 border-l-2 border-[#2d4424] ml-2 pl-4 pt-2">
            {history.map((log, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-[#82b366] border-2 border-[#142011]"></div>
                <p className="text-[10px] text-[#8fa888]">{log.date}</p>
                <p className="text-sm font-semibold text-[#f0f7ef]">{log.text}</p>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="w-full bg-[#82b366] hover:bg-[#93c47d] text-[#0d160b] py-4 rounded-xl font-extrabold text-lg shadow-lg">
          変更を保存する
        </button>
      </form>
    </div>
  );
}