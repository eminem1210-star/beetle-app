'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

type BeetleOption = {
  id: string;
  name: string;
  gender: string;
};

export default function NewBeetlePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [status, setStatus] = useState('幼虫');
  const [gender, setGender] = useState('不明');
  const [weight, setWeight] = useState('');
  const [size, setSize] = useState('');
  const [generation, setGeneration] = useState('CBF1');
  const [fatherId, setFatherId] = useState('');
  const [motherId, setMotherId] = useState('');
  const [memo, setMemo] = useState('');

  const [maleOptions, setMaleOptions] = useState<BeetleOption[]>([]);
  const [femaleOptions, setFemaleOptions] = useState<BeetleOption[]>([]);
  const [loading, setLoading] = useState(false);

  // 親個体の選択肢を取得
  useEffect(() => {
    const fetchParents = async () => {
      const { data } = await supabase
        .from('beetles')
        .select('id, name, gender')
        .order('created_at', { ascending: false });

      if (data) {
        setMaleOptions(data.filter((b) => b.gender === 'オス' || b.gender === '不明'));
        setFemaleOptions(data.filter((b) => b.gender === 'メス' || b.gender === '不明'));
      }
    };
    fetchParents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: newBeetle, error } = await supabase
      .from('beetles')
      .insert([
        {
          name,
          status,
          gender,
          weight: weight ? parseFloat(weight) : null,
          size: size ? parseFloat(size) : null,
          generation: generation || null,
          father_id: fatherId || null,
          mother_id: motherId || null,
          memo: memo || null,
        },
      ])
      .select()
      .single();

    if (error) {
      alert('登録に失敗しました: ' + error.message);
      setLoading(false);
      return;
    }

    // 体重が入力されていたら最初の測定ログとしても記録
    if (weight && newBeetle) {
      await supabase.from('weight_logs').insert([
        {
          beetle_id: newBeetle.id,
          weight: parseFloat(weight),
          memo: '初期登録時',
        },
      ]);
    }

    setLoading(false);
    alert('新しい個体を登録しました！');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-stone-100 p-4 sm:p-6 md:p-10">
      <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
        
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <h1 className="text-lg font-bold text-stone-800">✨ 新規個体登録</h1>
          <Link href="/" className="text-xs text-stone-500 hover:underline">
            ← 戻る
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 識別名 */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">
              識別名・管理番号 *
            </label>
            <input
              type="text"
              required
              placeholder="例: ヘラクレス A-1 / OHA-01"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-800"
            />
          </div>

          {/* 状態・性別 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                状態（成長段階）
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-800 bg-white"
              >
                <option value="幼虫">幼虫</option>
                <option value="前蛹">前蛹</option>
                <option value="蛹">蛹</option>
                <option value="成虫">成虫</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                性別
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-800 bg-white"
              >
                <option value="不明">不明</option>
                <option value="オス">オス</option>
                <option value="メス">メス</option>
              </select>
            </div>
          </div>

          {/* 累代 */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">
              累代 (例: CBF1, F2, WF1, 野生株)
            </label>
            <input
              type="text"
              placeholder="例: CBF1"
              value={generation}
              onChange={(e) => setGeneration(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-800"
            />
          </div>

          {/* 親個体（血統）の選択 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ♂ 父親個体
              </label>
              <select
                value={fatherId}
                onChange={(e) => setFatherId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-stone-800"
              >
                <option value="">なし（不明・種親未登録）</option>
                {maleOptions.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ♀ 母親個体
              </label>
              <select
                value={motherId}
                onChange={(e) => setMotherId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-stone-800"
              >
                <option value="">なし（不明・種親未登録）</option>
                {femaleOptions.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 体重・サイズ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                初期体重 (g)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="例: 32.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">
                羽化サイズ (mm)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="例: 158.0"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-800"
              />
            </div>
          </div>

          {/* メモ */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">
              メモ（血統名・ブリーダー名など）
            </label>
            <textarea
              rows={2}
              placeholder="例: 〇〇血統 160mmライン"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-stone-800 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg transition active:scale-98 disabled:opacity-50 mt-2"
          >
            {loading ? '登録中...' : '登録する'}
          </button>
        </form>

      </div>
    </div>
  );
}