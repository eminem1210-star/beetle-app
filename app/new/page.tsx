'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// 画像を縮小・圧縮する関数
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas to Blob failed'));
            }
          },
          'image/jpeg',
          0.7
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function NewBeetlePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState('カブトムシ');
  const [gender, setGender] = useState('オス');
  const [status, setStatus] = useState('幼虫');
  const [bloodline, setBloodline] = useState(''); // 血統
  const [container, setContainer] = useState('800cc'); // ビン
  const [memo, setMemo] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      try {
        const compressedFile = await compressImage(originalFile);
        setFile(compressedFile);
      } catch (error) {
        console.error('画像の圧縮に失敗しました', error);
        setFile(originalFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = '';

      if (file) {
        const fileName = `${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('beetle-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('beetle-images')
          .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
      }

      const { error: insertError } = await supabase.from('beetles').insert([
        {
          name,
          type,
          gender,
          status,
          bloodline,
          container,
          memo,
          image_url: imageUrl,
        },
      ]);

      if (insertError) throw insertError;

      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('登録エラー:', error);
      alert('登録に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-slate-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-amber-400">個体の新規登録</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">名前・管理番号</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white"
            placeholder="例: 001号"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">種類</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white"
          >
            <option value="カブトムシ">カブトムシ</option>
            <option value="オオクワガタ">オオクワガタ</option>
            <option value="ヒラタクワガタ">ヒラタクワガタ</option>
            <option value="ノコギリクワガタ">ノコギリクワガタ</option>
            <option value="その他">その他</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">性別</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white"
          >
            <option value="オス">オス</option>
            <option value="メス">メス</option>
            <option value="不明">不明</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">状態</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white"
          >
            <option value="幼虫">幼虫</option>
            <option value="前蛹">前蛹</option>
            <option value="蛹">蛹</option>
            <option value="成虫">成虫</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">血統・系統</label>
          <input
            type="text"
            value={bloodline}
            onChange={(e) => setBloodline(e.target.value)}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white"
            placeholder="例: 〇〇血統 / 〇〇ライン"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">使用ビン（容器）</label>
          <select
            value={container}
            onChange={(e) => setContainer(e.target.value)}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white"
          >
            <option value="800cc">800cc</option>
            <option value="1100cc">1100cc</option>
            <option value="1400cc">1400cc</option>
            <option value="1500cc">1500cc</option>
            <option value="2300cc">2300cc</option>
            <option value="3000cc">3000cc以上</option>
            <option value="other">その他・ケース</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">画像（自動で軽量化されます）</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">メモ</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-white"
            rows={3}
            placeholder="体重やエサの種類など"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded transition"
        >
          {loading ? '登録中...' : '登録する'}
        </button>
      </form>
    </div>
  );
}