'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function Page() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login'); // ログインしていなければログイン画面へ移動
    } else {
      setChecking(false);
    }
  };

  if (checking) {
    return <div className="text-white text-center py-20">認証確認中...</div>;
  }

  return (
    <div className="p-6 text-white bg-slate-900 min-h-screen">
      <h1 className="text-2xl font-bold text-amber-400 mb-4">カブトムシ・クワガタ管理</h1>
      {/* ここに従来の個体一覧や管理画面のコードが入ります */}
    </div>
  );
}