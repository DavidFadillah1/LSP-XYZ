"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function IA09Page() {
  const router = useRouter();
  const params = useParams();
  const pesertaId = params.id as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pesertaInfo, setPesertaInfo] = useState<any>(null);
  
  const [wawancaraQuestions, setWawancaraQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, { text: string, rekomendasi: string }>>({});
  const [rekomendasiAkhir, setRekomendasiAkhir] = useState("y");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
    script.async = true;
    document.body.appendChild(script);

    fetchData();

    // Baca data dari IA.08 menggunakan ID Peserta
    const savedQuestions = localStorage.getItem(`ia08_selected_${pesertaId}`);
    if (savedQuestions) {
      const parsed = JSON.parse(savedQuestions);
      setWawancaraQuestions(parsed);
      
      const initialAnswers: Record<number, any> = {};
      parsed.forEach((q: any) => {
        initialAnswers[q.id] = { text: "", rekomendasi: "b" }; 
      });
      setAnswers(initialAnswers);
    }
  }, [pesertaId]);

  const fetchData = async () => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return router.push("/login");
    const { data: userData } = await supabase.from("users").select("*").eq("email", userEmail).single();
    setCurrentUser(userData || { email: userEmail, nama: "Assesor" });
    
    // Dinamis Asesi
    const { data: asesiData } = await supabase.from("assesi").select("*").eq("id", pesertaId).single();
    if(asesiData) {
      let namaSkema = "Skema Tidak Ditemukan";
      const { data: jadwal } = await supabase.from("event_skema_jadwal").select("skema_id").eq("event_id", asesiData.sertifikasi_event_id).limit(1).single();
      if (jadwal && jadwal.skema_id) {
         const { data: skm } = await supabase.from("skema").select("*").eq("id", jadwal.skema_id).single();
         if(skm) namaSkema = `[${skm.kode_skema}] ${skm.judul_skema}`;
      }
      setPesertaInfo({ nama: asesiData.nama_peserta, skema: namaSkema });
    }
  };

  const handleAnswerChange = (id: number, field: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    const Swal = (window as any).Swal;
    
    // Set status selesai untuk UI Dashboard
    localStorage.setItem(`ia09_filled_${pesertaId}`, "true");

    if (typeof Swal !== "undefined") {
      Swal.fire("Berhasil", "Data Pertanyaan Wawancara FR.IA.09 telah disimpan.", "success").then(() => {
        router.push("/asesor/dashboard");
      });
    } else {
      alert("Berhasil! Data Pertanyaan Wawancara FR.IA.09 telah disimpan.");
      router.push("/asesor/dashboard");
    }
  };

  const handleKembali = () => router.push("/asesor/dashboard");

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="skin-blue layout-top-nav" style={{ minHeight: "100vh", backgroundColor: "#ecf0f5" }}>
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/adminlte.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{__html: ` .btn-app { border-radius: 3px; padding: 15px 5px; margin: 0 10px 10px 0; min-width: 80px; height: 60px; } .btn-app > .fa { font-size: 20px; display: block; } `}} />

      <header className="main-header">
        <nav className="navbar navbar-static-top">
          <div className="container-fluid">
            <div className="navbar-header"><Link href="/asesor/dashboard" className="navbar-brand"><b>lspxyz.com</b></Link></div>
            <div className="navbar-custom-menu">
              <ul className="nav navbar-nav">
                <li><a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="btn btn-danger" style={{ color: "white", margin: "5px" }}>Log Out {currentUser?.email}</a></li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <div className="content-wrapper" style={{ minHeight: "614px" }}>
        <div className="container-fluid" style={{ padding: "20px 30px" }}>
          
          <div className="box box-primary mt-4">
            <div className="box-header with-border"><h3 className="box-title">Tombol fungsi</h3></div>
            <div className="box-body">
              <button onClick={handleKembali} className="btn btn-app"><i className="fa fa-chevron-left fa-2x"></i>Kembali</button>
              <button onClick={handleSimpan} className="btn btn-app"><i className="fa fa-floppy-o fa-2x"></i>Simpan</button>
            </div>
          </div>

          <div className="box box-primary">
            <div className="box-header"><h2 className="box-title"><b>FR.IA.09 CEKLIS PERTANYAAN WAWANCARA</b></h2></div>
            <div className="box-body">
              
              <table className="table table-bordered">
                <thead>
                  <tr className="bg-gray text-center">
                    <th width="40%">Daftar Pertanyaan Wawancara (Dari IA.08)</th>
                    <th width="40%">Kesimpulan Jawaban Assesi</th>
                    <th width="10%">K</th>
                    <th width="10%">BK</th>
                  </tr>
                </thead>
                <tbody>
                  {wawancaraQuestions.length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-danger" style={{ padding: "20px" }}><b>Belum ada pertanyaan yang dipilih. Silakan kembali ke form FR.IA.08 dan centang pertanyaannya.</b></td></tr>
                  ) : (
                    wawancaraQuestions.map(q => (
                      <tr key={q.id}>
                        <td style={{ whiteSpace: "pre-wrap" }}>{q.text}</td>
                        <td>
                          <textarea 
                            className="form-control" 
                            rows={3} 
                            value={answers[q.id]?.text || ""}
                            onChange={(e) => handleAnswerChange(q.id, 'text', e.target.value)}
                            placeholder="Ketik jawaban peserta di sini..."
                          />
                        </td>
                        <td align="center" style={{ verticalAlign: "middle" }}>
                          <input type="radio" style={{ transform: "scale(1.5)" }} name={`rek_${q.id}`} checked={answers[q.id]?.rekomendasi === 'b'} onChange={() => handleAnswerChange(q.id, 'rekomendasi', 'b')} />
                        </td>
                        <td align="center" style={{ verticalAlign: "middle" }}>
                          <input type="radio" style={{ transform: "scale(1.5)" }} name={`rek_${q.id}`} checked={answers[q.id]?.rekomendasi === 'k'} onChange={() => handleAnswerChange(q.id, 'rekomendasi', 'k')} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <br/>
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <td width="30%"><strong>Rekomendasi Assesor</strong></td>
                    <td>
                      <div>
                        <label style={{ fontWeight: "normal", cursor: "pointer", display: "block" }}>
                          <input type="radio" name="rek_akhir" value="y" checked={rekomendasiAkhir === "y"} onChange={(e) => setRekomendasiAkhir(e.target.value)} style={{ marginRight: "10px" }}/>
                          Asesi telah memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan KOMPETEN
                        </label>
                        <label style={{ fontWeight: "normal", cursor: "pointer", display: "block", marginTop: "10px" }}>
                          <input type="radio" name="rek_akhir" value="t" checked={rekomendasiAkhir === "t"} onChange={(e) => setRekomendasiAkhir(e.target.value)} style={{ marginRight: "10px" }}/>
                          Asesi belum memenuhi pencapaian seluruh kriteria unjuk kerja.
                        </label>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}