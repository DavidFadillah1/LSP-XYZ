"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  // State untuk form login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State untuk CAPTCHA
  const [captchaText, setCaptchaText] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");

  // State untuk Modals
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  // Fungsi membuat CAPTCHA gambar menggunakan HTML5 Canvas
  const generateCaptcha = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let text = "";
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);

    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 80;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = "#ccc";
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
      }

      ctx.font = "40px Arial";
      ctx.fillStyle = "#333";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text.split("").join(" "), canvas.width / 2, canvas.height / 2);

      setCaptchaImage(canvas.toDataURL("image/jpeg"));
    }
  };

  useEffect(() => {
    generateCaptcha();
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const Swal = (window as any).Swal;

    // 1. Validasi CAPTCHA
    if (captchaInput !== captchaText) {
      Swal.fire({
        icon: "error",
        title: "Captcha Salah",
        text: "Silakan masukkan Captcha dengan benar.",
      });
      generateCaptcha();
      setCaptchaInput("");
      return;
    }

    setIsLoading(true);

    try {
      // 2. CEK EMAIL KE DATABASE SUPABASE
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single(); // Mengambil 1 baris data yang cocok dengan email

      // Jika error pencarian atau email tidak ada di database
      if (error || !user) {
        Swal.fire({
          icon: "error",
          title: "Login Gagal",
          text: "Email tidak terdaftar di database sistem.",
        });
        return;
      }

      // 3. CEK PASSWORD
      // Catatan: Jika password di database Anda di-hash (misal MD5 dari sistem lama),
      // logika ini harus disesuaikan. Saat ini membandingkan plain-text langsung.
      if (user.password !== password) {
        Swal.fire({
          icon: "error",
          title: "Login Gagal",
          text: "Password yang Anda masukkan salah.",
        });
        return;
      }

      // 4. BERHASIL LOGIN
      // Simpan sesi login ke LocalStorage agar dashboard bisa mendeteksi siapa yang login
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userName", user.nama || user.email);

      Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: "Selamat datang, " + (user.nama || user.email),
        timer: 1500,
        showConfirmButton: false,
      });

      // 5. ROUTING BERDASARKAN ROLE
      // superadmin -> /admin, admin/staff -> /staff, asesor -> /asesor, sisanya -> /assesi
      setTimeout(() => {
        if (user.role === "superadmin") {
          router.push("/admin/dashboard");
        } else if (user.role === "admin" || user.role === "staff") {
          router.push("/staff/dashboard");
        } else if (user.role === "asesor" || user.role === "assesor") {
          router.push("/asesor/dashboard");
        } else {
          router.push("/assesi/dashboard");
        }
      }, 1500);
    } catch (err: any) {
      Swal.fire("Error Koneksi", "Terjadi masalah saat menghubungi database: " + err.message, "error");
    } finally {
      setIsLoading(false);
      generateCaptcha();
      setCaptchaInput("");
    }
  };

  const handleForgotPassword = async () => {
    const Swal = (window as any).Swal;

    if (forgotEmail.length < 5) {
      Swal.fire({
        icon: "error",
        title: "Oops...Error",
        text: "Email wajib diisi",
      });
      return;
    }

    try {
      const { data, error } = await supabase.from("users").select("id").eq("email", forgotEmail).single();

      if (data) {
        // Asumsi menggunakan Supabase Auth untuk Reset Password
        await supabase.auth.resetPasswordForEmail(forgotEmail);
        Swal.fire({
          icon: "success",
          title: "Berhasil Proses",
          text: "Silakan cek email Anda untuk proses reset password",
        });
        setShowForgotModal(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...Error",
          text: "Email Anda tidak terdaftar di dalam sistem",
        });
      }
    } catch (err) {
      Swal.fire("Error", "Terjadi kesalahan sistem", "error");
    }
  };

  return (
    <>
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/adminlte.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        html, body { 
          margin: 0; 
          padding: 0; 
          height: 100%; 
          background-color: #d2d6de !important; 
        }
        .swal2-popup { font-size: 1.6rem !important; }
        .modal { background: rgba(0,0,0,0.5); }
        .modal.show { display: block; opacity: 1; }
        
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: #d2d6de;
          padding: 40px 20px;
          box-sizing: border-box;
        }
        
        .login-box {
          width: 100%;
          max-width: 420px;
          margin: auto;
        }
        
        .login-logo {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          margin-bottom: 25px !important;
          width: 100% !important;
        }
        
        .login-logo img {
          max-width: 280px !important;
          height: auto !important;
          display: block !important;
          margin: 0 auto !important;
        }
        
        .login-box-body {
          background: #fff;
          padding: 35px 30px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
      `,
        }}
      />

      {/* --- MODAL TERM AND CONDITION --- */}
      {showTermsModal && (
        <div className="modal fade show" tabIndex={-1} role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                <h3 className="modal-title" style={{ color: "red", display: "inline-block", margin: 0 }}>
                  <strong>Term and Condition</strong>
                </h3>
                <button
                  type="button"
                  className="close pull-right"
                  onClick={() => setShowTermsModal(false)}
                  style={{ fontSize: "24px", marginTop: "-5px" }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div style={{ overflowY: "scroll", height: "400px", width: "100%", padding: "10px" }}>
                  <p style={{ textAlign: "center" }}>
                    <strong>PERJANJIAN LAYANAN E-SERKOM</strong>
                  </p>
                  <p>
                    Syarat dan Ketentuan yang berlaku untuk penggunaan e-serkom dari LSP INFORMATIKA, kepada pengguna,
                    adalah sebagai berikut :
                  </p>
                  <p>
                    <strong>I. Definisi</strong>
                  </p>
                  <ol>
                    <li>
                      <strong>e-serkom </strong>adalah layanan yang disediakan oleh LSP INFORMATIKA kepada Pengguna,
                      dimana pengguna dapat melakukan sendiri akses secara langsung...
                    </li>
                    <li>
                      <strong>Pengguna </strong>adalah semua user dengan hak akses yang diberikan...
                    </li>
                  </ol>
                  <p>
                    <strong>II. Ketentuan Penggunaan e-serkom</strong>
                  </p>
                  <ol>
                    <li>Pengguna dapat menggunakan e-serkom sesuai Fitur e-serkom yang telah ditentukan.</li>
                    <li>Pada saat pertama kali menggunakan e-serkom, Pengguna diharuskan melakukan perubahan Password.</li>
                    <li>Tata cara penggunaan e-serkom adalah sebagaimana dijelaskan pada Panduan Penggunaan e-serkom.</li>
                  </ol>
                  <p>
                    <strong>III. Hukum yang berlaku</strong>
                  </p>
                  <p>Perjanjian ini akan diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia...</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-danger" onClick={() => setShowTermsModal(false)}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL LUPA PASSWORD --- */}
      {showForgotModal && (
        <div className="modal fade show" tabIndex={-1} role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                <h4 className="modal-title" style={{ display: "inline-block", margin: 0 }}>
                  Lupa Password
                </h4>
                <button
                  type="button"
                  className="close pull-right"
                  onClick={() => setShowForgotModal(false)}
                  style={{ fontSize: "24px", marginTop: "-5px" }}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-12">
                    <label>Masukkan email terdaftar untuk reset password:</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="E-mail"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-default" onClick={() => setShowForgotModal(false)}>
                  Tutup
                </button>
                <button type="button" className="btn btn-primary" onClick={handleForgotPassword}>
                  Kirim password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MAIN LOGIN WRAPPER --- */}
      <div className="login-wrapper">
        <div className="login-box">
          <div className="login-logo">
            <img src="/logo.png" alt="Logo LSP" />
          </div>

          <div className="login-box-body">
            <p className="login-box-msg text-center" style={{ marginBottom: "20px", color: "#666" }}>
              Silahkan Login menggunakan Email
            </p>

            <form onSubmit={handleLogin}>
              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: "15px" }}>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ textAlign: "center", marginBottom: "20px" }}>
                {captchaImage ? (
                  <>
                    <img
                      id="Imageid"
                      src={captchaImage}
                      alt="CAPTCHA"
                      style={{ maxWidth: "100%", height: "auto", border: "1px solid #ccc", borderRadius: "4px" }}
                    />
                    <div style={{ marginTop: "8px" }}>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          generateCaptcha();
                        }}
                        style={{ fontSize: "13px", color: "#3c8dbc" }}
                      >
                        Can't read? Refresh page
                      </a>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      padding: "20px",
                      background: "#f9f9f9",
                      border: "1px dashed #ccc",
                      color: "#666",
                      borderRadius: "4px",
                    }}
                  >
                    Loading CAPTCHA...
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-sm btn-default"
                  onClick={generateCaptcha}
                  style={{ marginTop: "10px", width: "100%" }}
                >
                  <i className="fa fa-refresh"></i> Refresh CAPTCHA
                </button>
              </div>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label>Captcha</label>
                <input
                  type="text"
                  className="form-control text-center"
                  name="captcha"
                  placeholder="isi captcha sesuai di atas"
                  maxLength={6}
                  style={{ fontSize: "18px", letterSpacing: "2px", height: "45px", textTransform: "none" }}
                  required
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                />
                <small className="text-muted text-center" style={{ display: "block", marginTop: "5px" }}>
                  Masukkan Captcha sesuai yg tertera di atas
                </small>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: "normal",
                    margin: 0,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    name="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ margin: 0 }}
                  />
                  Remember Me
                </label>

                <button type="submit" className="btn btn-primary" style={{ padding: "8px 25px" }} disabled={isLoading}>
                  {isLoading ? "Loading..." : "Login"}
                </button>
              </div>

              <div className="text-center" style={{ borderTop: "1px solid #eee", paddingTop: "20px" }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowForgotModal(true)}>
                  Lupa Password
                </button>

                <p style={{ fontSize: "13px", color: "#666", marginTop: "15px", lineHeight: "1.5" }}>
                  Dengan menekan tombol <strong>Login</strong>, user menyetujui Syarat dan Ketentuan (
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    style={{
                      padding: 0,
                      border: "none",
                      background: "none",
                      color: "red",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    Term &amp; Condition
                  </button>
                  ) yang berlaku
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}