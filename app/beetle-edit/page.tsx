// app/beetle-edit/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Camera, Bug, Plus, ArrowLeft, Calendar, Save } from "lucide-react";
import Link from "next/link";

export default function BeetleEditPage() {
  const [beetle, setBeetle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [weight, setWeight] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    async function fetchBeetle() {
      if (!id) return;
      const { data, error } = await supabase
        .from('beetles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        setBeetle(data);
        // 登録されているカラム名（name または beetle_name）に対応
        setName(data.name || data.beetle_name || '');
        setStatus(data.status || '');
        setWeight(data.weight || '');
        setImagePreview(data.image_url || '');
      }
      setLoading(false);
    }
    fetchBeetle();
  }, []);

  // 画像ファイルを圧縮・Base64化してプレビュー＆保存できるようにする
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beetle) return;

    const { error } = await supabase
      .from('beetles')
      .update({
        name: name,
        status: status,
        weight: weight ? Number(weight) : null,
        image_url: imagePreview
      })
      .eq('id', beetle.id);

    if (error) {
      alert('保存に失敗しました: ' + error.message);
    } else {
      alert('個体データを更新しました！');
      window.location.href = '/';
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0d160b] text-[#e2e8df] p-6 flex items-center justify-center">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0d160b] text-[#e2e8df] p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-[#8fa888] hover:text-[#d4ebd0] mb-6 transition-colors">
          <ArrowLeft size={18} /> 管理ダッシュボードに戻る
        </Link>
        
        <form onSubmit={handleSave}>
          <header className="bg-[#142011] border border-[#2d4424] rounded-3xl p-8 mb-8 shadow-xl flex justify-between items-center">
            <div>
              <label className="text-xs text-[#8fa888] block mb-1">個体名 / 管理名</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="text-2xl md:text-3xl font-extrabold text-[#f0f7ef] bg-[#0a1108] border border-[#2d4424] rounded-xl px-4 py-2 w-full outline-none focus:border-[#82b366]"
                placeholder="例: 8/8 ミッチェルヘラクレス"
              />
              <p className="text-xs text-[#82b366] mt-2">ID: {beetle?.id}</p>
            </div>
            <button type="submit" className="bg-[#436e32] hover:bg-[#5b8c43] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shrink-0">
              <Save size={18} /> 変更を保存
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 左カラム：写真撮影・選択 */}
            <div className="space-y-6">
              <div className="bg-[#142011] border border-[#2d4424] rounded-3xl p-6 shadow-xl">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#d4ebd0]">
                  <Camera size={20} className="text-[#82b366]" /> 個体フォト
                </h2>
                
                <div className="h-52 bg-[#0a1108] rounded-2xl mb-4 border border-[#1e3318] flex flex-col items-center justify-center overflow-hidden relative">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Beetle" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4 text-[#5f7d56]">
                      <Bug size={48} className="mx-auto mb-2 opacity-40" />
                      <span className="text-xs">写真が未登録です</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="block text-center bg-[#2d4424] hover:bg-[#3b5d2e] text-[#d4ebd0] py-3 rounded-xl text-sm font-bold transition-all cursor-pointer shadow-lg">
                    <span>スマホで撮影 / アルバムから選択</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment" 
                      onChange={handleImageChange} 
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-center text-[#8fa888]">※スマホならカメラが直接起動します</p>
                </div>
              </div>
            </div>

            {/* 右カラム：基本ステータス＆タイムライン */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-[#142011] border border-[#2d4424] rounded-3xl p-6 shadow-xl space-y-4">
                <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-[#d4ebd0]">
                  ステータス・体重管理
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#8fa888] block mb-1">ステータス</label>
                    <input 
                      type="text" 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      placeholder="例: 幼虫 / 前蛹 / 羽化" 
                      className="w-full bg-[#0a1108] border border-[#2d4424] rounded-xl px-4 py-2.5 text-sm text-[#e2e8df] outline-none focus:border-[#82b366]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#8fa888] block mb-1">体重 (g)</label>
                    <input 
                      type="number" 
                      value={weight} 
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="例: 35" 
                      className="w-full bg-[#0a1108] border border-[#2d4424] rounded-xl px-4 py-2.5 text-sm text-[#e2e8df] outline-none focus:border-[#82b366]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#142011] border border-[#2d4424] rounded-3xl p-6 shadow-xl">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#d4ebd0]">
                  <Calendar size={20} className="text-[#82b366]" /> 成長タイムライン・履歴
                </h2>
                
                <div className="space-y-4 border-l-2 border-[#2d4424] ml-3 pl-4">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-[#82b366] border-2 border-[#142011]"></div>
                    <p className="text-xs text-[#8fa888]">データ登録日</p>
                    <p className="text-sm font-semibold text-[#f0f7ef] mt-0.5">育成スタート</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}