"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginSuperadmin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .eq("role", "superadmin")
        .single();

      if (error || !data) {
        setErrorMsg("Email atau password salah, atau Anda bukan Superadmin.");
        setLoading(false);
        return;
      }

      alert("Login Berhasil!");
      router.push("/admin/dashboard");
    } catch (err) {
      setErrorMsg("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/adminlte.min.css" rel="stylesheet" />
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/lib.min.css" rel="stylesheet" />
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/app.min.css" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{__html: `
        .login-box-body, .register-box-body { background: #00afef; padding: 20px; border-top: 0; color: #fff; }
        .btn-primary { background-color: #117dc3; border-color: #367fa9; }
        body { font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; font-size: 14px; color: #333; background-color: #00afef0f; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
      `}} />

      <div className="login-box">
        <div className="login-logo">
          {/* Logo sudah diubah mengarah ke folder public lokal */}
          <img src="/logo.png" alt="Logo LSP XYZ" width="300px" />
        </div>
        <div className="login-box-body">
          <p className="login-box-msg">Sign in to start your session</p>
          
          {errorMsg && <p style={{ color: "#ffcccc", textAlign: "center", fontWeight: "bold" }}>{errorMsg}</p>}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email / Username</label>
              <input 
                type="text" 
                id="email" 
                className="form-control" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                suppressHydrationWarning
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                suppressHydrationWarning
              />
            </div>
            
            <div className="row">
              <div className="col-xs-8">
                <div className="checkbox">
                  <label><input type="checkbox" name="remember" /> Remember Me</label>
                </div>
              </div>
              <div className="col-xs-4">
                <button type="submit" className="btn btn-primary btn-block btn-flat" disabled={loading} suppressHydrationWarning>
                  {loading ? "Proses..." : "Sign In"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}