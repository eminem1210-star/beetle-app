// app/login/page.tsx
'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Bug, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert('登録失敗: ' + error.message);
      else {
        alert('確認メールを送信しました。メール内のリンクをクリックしてログインしてください。');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert('ログイン失敗: ' + error.message);
      else {
        window.location.href = '/'; // ログイン成功したらトップへ
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0d160b] text-[#e2e8df] flex items-center justify-center p-4">
      <div className="bg-[#142011] p-6 sm:p-8 rounded-2xl border border-[#2d4424] max-w-md w-full space-y-6 shadow-xl">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-[#0a1108] rounded-2xl border border-[#1e3318] text-[#82b366] mb-2">
            <Bug size={32} />
          </div>
          <h1 className="text-xl font-black text-[#f0f7ef]">BEETLE MASTER'S GROVE</h1>
          <p className="text-xs text-[#8fa888]">
            {isSignUp ? 'アカウントを作成して管理を始める' : 'ログインしてあなたの個体を管理'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-xs text-[#8fa888] block mb-1">メールアドレス</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3.5 text-[#8fa888]" />
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sample@email.com"
                className="w-full bg-[#0a1108] border border-[#2d4424] p-3 pl-10 rounded-xl text-sm text-[#e2e8df] outline-none focus:border-[#82b366]" 
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#8fa888] block mb-1">パスワード</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3.5 text-[#8fa888]" />
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0a1108] border border-[#2d4424] p-3 pl-10 rounded-xl text-sm text-[#e2e8df] outline-none focus:border-[#82b366]" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#436e32] hover:bg-[#5b8c43] text-white py-3 rounded-xl font-bold shadow-lg transition-all"
          >
            {loading ? '処理中...' : isSignUp ? '新規登録する' : 'ログイン'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#2d4424]">
          <button 
            type="button" 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-[#8fa888] hover:text-[#82b366] underline"
          >
            {isSignUp ? 'すでにアカウントをお持ちの方はこちら（ログイン）' : 'アカウントをお持ちでない方はこちら（新規登録）'}
          </button>
        </div>
      </div>
    </div>
  );
}