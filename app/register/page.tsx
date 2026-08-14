'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Camera, Bug, ArrowLeft, Save, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('幼虫');
  const [gender, setGender] = useState('不明');
  const [weight, setWeight] = useState('');
  const [pedigree, setPedigree] = useState('');
  const [generation, setGeneration] = useState('');
  const [source, setSource] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUserId(session.user.id);
      }
    }
    checkUser();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);

    const initialHistory = [{
      date: new Date().toLocaleDateString('ja-JP'),
      text: `初期登録 - ステータス: ${status}${weight ? ` / 体重: ${weight}g` : ''}`
    }];

    const { error } = await supabase.from('beetles').insert([{
      user_id: userId,
      name,
      status,
      gender,
      weight: weight ? Number(weight) : null,
      pedigree,
      generation,
      source,
      image_url: imageUrl,
      history: initialHistory
    }]);

    setLoading(false);

    if (error) {
      alert('登録失敗: ' + error.message);
    } else {
      alert('個体を登録しました！');
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d160b] text-[#e2e8df] p-4 pb-20 font-sans">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="inline-flex items-center gap-1 text-[#8fa888] mb-4 text-sm hover:text-[#82b366]">
          <ArrowLeft size={16} /> ダッシュボードに戻る
        </Link>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424]">
            <label className="text-xs text-[#8fa888]">個体名 / 管理名 *</label>
            <input 
              type="text" 
              required
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 久留米産オオクワガタ 1号" 
              className="w-full mt-1 bg-transparent text-xl font-bold outline-none text-[#f0f7ef] placeholder-[#3a5233]" 
            />
          </div>

          <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] text-center">
            <div className="w-full aspect-square bg-[#0a1108] rounded-xl mb-4 overflow-hidden flex items-center justify-center border border-[#1e3318]">
              {imageUrl ? <img src={imageUrl} className="w-full h-full object-cover" /> : <Bug size={64} className="opacity-20 text-[#5f7d56]" />}
            </div>
            <label className="block w-full bg-[#436e32] hover:bg-[#5b8c43] text-white py-3 rounded-xl font-bold cursor-pointer transition-all">
              <Camera className="inline mr-2" /> 写真を選択 / 撮影
              <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#8fa888]">ステータス</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full mt-1 bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-base text-[#e2e8df]">
                  {['幼虫','前蛹','蛹','羽化','成虫','その他'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#8fa888]">性別</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)}
                  className="w-full mt-1 bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-base text-[#e2e8df]">
                  {['不明','オス','メス'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-[#8fa888]">体重 (g)</label>
              <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="例: 25.5"
                className="w-full mt-1 bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-base text-[#e2e8df] outline-none" />
            </div>
          </div>

          <div className="bg-[#142011] p-5 rounded-2xl border border-[#2d4424] space-y-4">
            <h2 className="text-sm font-bold text-[#d4ebd0]">血統・管理情報</h2>
            <div>
              <label className="text-xs text-[#8fa888] block mb-1">血統名</label>
              <input type="text" value={pedigree} onChange={(e) => setPedigree(e.target.value)} placeholder="例: 〇〇血統" className="w-full bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-sm text-[#e2e8df] outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#8fa888] block mb-1">累代</label>
                <input type="text" value={generation} onChange={(e) => setGeneration(e.target.value)} placeholder="例: CBF1" className="w-full bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-sm text-[#e2e8df] outline-none" />
              </div>
              <div>
                <label className="text-xs text-[#8fa888] block mb-1">入手先</label>
                <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="例: 〇〇ショップ" className="w-full bg-[#0a1108] border border-[#2d4424] p-3 rounded-lg text-sm text-[#e2e8df] outline-none" />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#436e32] hover:bg-[#5b8c43] text-white py-4 rounded-xl font-extrabold shadow-lg transition-all text-base flex items-center justify-center gap-2"
          >
            <Save size={18} /> {loading ? '登録中...' : '個体を登録する'}
          </button>
        </form>
      </div>
    </div>
  );
}