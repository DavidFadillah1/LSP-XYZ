"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function IA08Page() {
  const router = useRouter();
  const params = useParams();
  const pesertaId = params.id as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pesertaInfo, setPesertaInfo] = useState<any>(null);
  
  const [questions, setQuestions] = useState([
    { id: 891, elemen: "1 - Mengidentifikasi kebijakan internal", text: "1. Sesuai dengan bukti: Jelaskan bagaimana Anda mengidentifikasi potensi dan jenis-jenis penyimpangan serta penyebaran informasi tentang kebijakan internal! (TMS) test\n\n1.1 Sesuai dengan bukti: Sesuai dengan ketentuan yang berlaku, bagaimana Anda mengidentifikasi penyimpangan yang mungkin terjadi dalam pelaksanaan survey atas permohonan pinjaman?", checked: true },
    { id: 892, elemen: "2 - Memastikan pelaksanaan kebijakan internal", text: "1. Sesuai dengan bukti: Bagaimana Anda memastikan pelaksanaan kebijakan internal (kemungkinan terjadi penyimpangan, tindakan preventif dan pencatatan penyimpangan)? (JRES1)\n1.1 Salah satu kebijakan internal dalam proses pemberian kredit adalah penerapan prinsip kehati-hatian (prudential principle). Untuk memperkuat pengendalian dalam pengambilan keputusan kredit, diperlukan penerapan kebijakan Four Eyes Principle. Jelaskan pemahaman Saudara mengenai konsep Four Eyes Principle tersebut.", checked: false },
    { id: 893, elemen: "3 - Melaporkan pelaksanaan kebijakan internal", text: "Sesuai dengan bukti: Jelaskan bagaimana Anda melaporkan bila terjadi penyimpangan dalam pelaksanaan kebijakan internal! (CMS)", checked: false },
    { id: 894, elemen: "1 - Mempersiapkan pengelolaan aset dan infrastruktur", text: "1. Sesuai dengan bukti : Jelaskan bagaimana Anda melakukan persiapan dalam pengelolaan aset dan infrastruktur? (TS)\n\n1.1. Sesuai dengan bukti : Untuk mendukung kegiatan sehari-hari, apa saja infrastruktur atau peralatan yang Anda gunakan dan agar tetap dapat berfungsi dengan baik, bagaimana Anda melakukan pemeliharaan terhadap infrastruktur tersebut?", checked: true },
    { id: 895, elemen: "2 - Melaksanakan pengelolaan aset dan infrastruktur", text: "1. Sesuai dengan bukti: Jelaskan bagaimana Anda melaksanakan pengelolaan aset dan infrastruktur? (TS)\n1.1 Sesuai dengan bukti: Jelaskan bagaimana Anda menjaga/ mengantisipasi agar tidak terjadi penyimpangan dalam penggunaan infrastruktur/inventaris?", checked: true },
  ]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
    script.async = true;
    document.body.appendChild(script);

    fetchData();
  }, [pesertaId]);

  const fetchData = async () => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return router.push("/login");

    const { data: userData } = await supabase.from("users").select("*").eq("email", userEmail).single();
    setCurrentUser(userData || { email: userEmail, nama: "Assesor" });

    // Dinamis membaca data Asesi -> Event -> Skema berdasarkan URL Param
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

  const handleCheck = (id: number) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, checked: !q.checked } : q));
  };

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    const Swal = (window as any).Swal;

    const selectedQuestions = questions.filter(q => q.checked);
    localStorage.setItem(`ia08_selected_${pesertaId}`, JSON.stringify(selectedQuestions));

    if (typeof Swal !== "undefined") {
      Swal.fire("Berhasil", "Data IA.08 tersimpan. Pertanyaan yang dicentang akan muncul di IA.09", "success").then(() => {
        router.push("/asesor/dashboard");
      });
    } else {
      alert("Berhasil! Data IA.08 tersimpan.");
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
              <button onClick={() => window.print()} className="btn btn-app"><i className="fa fa-print fa-2x"></i>Cetak</button>
            </div>
          </div>

          <div className="box box-primary">
            <div className="box-header"><h2 className="box-title"><b>FR.IA.08 CEKLIS VERIFIKASI PORTOFOLIO</b></h2></div>
            <div className="box-body">
              <table className="table table-bordered">
                <tbody>
                  <tr><td width="30%">Skema Sertifikasi</td><td width="2%">:</td><th>{pesertaInfo?.skema || "Loading..."}</th></tr>
                  <tr><td>Nama Assesor</td><td>:</td><th>{currentUser?.nama}</th></tr>
                  <tr><td>Nama Peserta</td><td>:</td><th>{pesertaInfo?.nama || "Loading..."}</th></tr>
                </tbody>
              </table>

              <br />
              <table className="table table-bordered">
                <thead>
                  <tr className="bg-gray">
                    <td colSpan={3}>Sebagai tindak lanjut dari hasil verifikasi bukti, substansi materi di bawah ini (no elemen yg di cek list) harus diklarifikasi selama wawancara:</td>
                  </tr>
                  <tr>
                    <th className="text-center" style={{ width: '10%' }}>Checked</th>
                    <th style={{ width: '30%' }}>No.Elemen</th>
                    <th>Materi/substansi Wawancara (KUK)</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q.id}>
                      <td align="center">
                        <input type="checkbox" style={{ transform: "scale(1.5)" }} checked={q.checked} onChange={() => handleCheck(q.id)} />
                      </td>
                      <td>{q.elemen}</td>
                      <td><textarea className="form-control" rows={4} value={q.text} readOnly /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <br/>
              <button onClick={handleSimpan} className="btn btn-primary btn-block">Simpan & Kembali ke Dashboard</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}