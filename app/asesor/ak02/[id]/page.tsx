"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AK02Page() {
  const router = useRouter();
  const params = useParams();
  const pesertaId = params.id as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pesertaInfo, setPesertaInfo] = useState<any>(null);
  
  const [keputusan, setKeputusan] = useState("na");
  const [tindakLanjut, setTindakLanjut] = useState("");
  const [komentar, setKomentar] = useState("");
  
  const [units, setUnits] = useState([
    { id: 1, title: "K.64SPK14.002.2 - Melaksanakan Kebijakan Internal", checks: { op: false, pf: false, ppk: false, pl: false, pt: false, pw: false, la: true } },
    { id: 2, title: "K.64SPK14.056.2 - Mengelola dan Mengamankan Aset", checks: { op: false, pf: false, ppk: false, pl: false, pt: false, pw: false, la: true } },
    { id: 3, title: "K.64SPK14.059.1 - Mengelola Risiko Pinjaman", checks: { op: false, pf: false, ppk: false, pl: false, pt: false, pw: false, la: true } }
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

    // Dinamis Asesi dan Set State Keputusan dari Database
    const { data: asesiData } = await supabase.from("assesi").select("*").eq("id", pesertaId).single();
    if(asesiData) {
      let namaSkema = "Skema Tidak Ditemukan";
      const { data: jadwal } = await supabase.from("event_skema_jadwal").select("skema_id").eq("event_id", asesiData.sertifikasi_event_id).limit(1).single();
      if (jadwal && jadwal.skema_id) {
         const { data: skm } = await supabase.from("skema").select("*").eq("id", jadwal.skema_id).single();
         if(skm) namaSkema = `[${skm.kode_skema}] ${skm.judul_skema}`;
      }
      setPesertaInfo({ nama: asesiData.nama_peserta, skema: namaSkema, tanggal: new Date().toLocaleDateString('id-ID') });

      // Load status asesmen jika sebelumnya sudah pernah diisi
      if (asesiData.hasil_asesmen === 'k' || asesiData.hasil_asesmen === 'K') setKeputusan('k');
      else if (asesiData.hasil_asesmen === 'bk' || asesiData.hasil_asesmen === 'BK') setKeputusan('bk');
      else setKeputusan('na');
    }
  };

  const handleSelectAll = (column: string, checked: boolean) => {
    setUnits(prev => prev.map(unit => ({ ...unit, checks: { ...unit.checks, [column]: checked } })));
  };

  const handleCheckUnit = (unitId: number, column: string, checked: boolean) => {
    setUnits(prev => prev.map(unit => unit.id === unitId ? { ...unit, checks: { ...unit.checks, [column]: checked } } : unit));
  };

  const isAllChecked = (column: keyof typeof units[0]['checks']) => {
    return units.every(unit => unit.checks[column]);
  };

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    const Swal = (window as any).Swal;

    try {
      if (keputusan === 'bk' && tindakLanjut === '') {
        if (Swal) return Swal.fire("Kesalahan Input", "Tindak lanjut harus di isi jika keputusan Anda Belum Kompeten", "error");
        return alert("Error: Tindak lanjut harus di isi jika keputusan Anda Belum Kompeten");
      }
      if (keputusan === 'k' && komentar === '') {
        if (Swal) return Swal.fire("Kesalahan Input", "Komentar observasi harus di isi jika keputusan Anda Kompeten", "error");
        return alert("Error: Komentar observasi harus di isi jika keputusan Anda Kompeten");
      }

      // 1. UPDATE STATUS KE DATABASE SUPABASE 
      const { error } = await supabase
        .from("assesi")
        .update({ hasil_asesmen: keputusan })
        .eq("id", pesertaId);

      if (error) throw error;

      // 2. Set status di LocalStorage agar tombol di Dashboard jadi Hijau
      localStorage.setItem(`ak02_filled_${pesertaId}`, "true");

      if (typeof Swal !== "undefined") {
        Swal.fire("Berhasil", "Formulir FR.AK.02 Rekaman Asesmen berhasil disimpan.", "success").then(() => {
          router.push("/asesor/dashboard");
        });
      } else {
        alert("Berhasil! Formulir FR.AK.02 Rekaman Asesmen berhasil disimpan.");
        router.push("/asesor/dashboard");
      }

    } catch (err: any) {
      if (Swal) Swal.fire("Error", "Gagal menyimpan ke database: " + err.message, "error");
      else alert("Error: " + err.message);
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
      <style dangerouslySetInnerHTML={{__html: ` .btn-app { border-radius: 3px; padding: 15px 5px; margin: 0 10px 10px 0; min-width: 80px; height: 60px; } .btn-app > .fa { font-size: 20px; display: block; } .radio-inline { margin-right: 15px; font-weight: normal; }`}} />

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
            <div className="box-header"><h2 className="box-title"><b>FR-AK-02 FORMULIR REKAMAN ASSESMEN KOMPETENSI</b></h2></div>
            <div className="box-body">
              
              <table className="table table-bordered">
                <tbody>
                  <tr><th style={{ width: '30%' }}>Nama Peserta</th><td>: {pesertaInfo?.nama || "Loading..."}</td></tr>
                  <tr><th>Nama Assesor</th><td>: {currentUser?.nama}</td></tr>
                  <tr><th>Skema Sertifikasi</th><td>: {pesertaInfo?.skema || "Loading..."}</td></tr>
                  <tr><th>Tanggal Mulai/Selesai</th><td>: {pesertaInfo?.tanggal}</td></tr>
                  <tr><th>Rekomendasi Hasil Assesmen</th>
                    <td>: 
                      <label className="radio-inline"><input type="radio" name="kep" value="k" checked={keputusan==='k'} onChange={(e)=>setKeputusan(e.target.value)} /> Kompeten</label>
                      <label className="radio-inline"><input type="radio" name="kep" value="bk" checked={keputusan==='bk'} onChange={(e)=>setKeputusan(e.target.value)} /> Belum Kompeten</label>
                      <label className="radio-inline"><input type="radio" name="kep" value="na" checked={keputusan==='na'} onChange={(e)=>setKeputusan(e.target.value)} /> N/A</label>
                    </td>
                  </tr>
                  <tr><th>Tindak lanjut yang dibutuhkan</th><td>: <textarea className="form-control" rows={3} value={tindakLanjut} onChange={e=>setTindakLanjut(e.target.value)}></textarea></td></tr>
                  <tr><th>Komentar/ Observasi oleh asesor</th><td>: <textarea className="form-control" rows={3} value={komentar} onChange={e=>setKomentar(e.target.value)}></textarea></td></tr>
                </tbody>
              </table>

              <br />
              <p>Beri tanda centang (√) di kolom yang sesuai untuk mencerminkan bukti yang diperoleh.</p>
              
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr className="bg-gray">
                      <th rowSpan={2} style={{ verticalAlign: "middle" }}>Unit Kompetensi</th>
                      <th className="text-center">Observasi</th>
                      <th className="text-center">Portfolio</th>
                      <th className="text-center">Pihak Ketiga</th>
                      <th className="text-center">Lisan</th>
                      <th className="text-center">Tertulis</th>
                      <th className="text-center">Wawancara</th>
                      <th className="text-center">Lainnya</th>
                    </tr>
                    <tr className="bg-gray">
                      <td align="center"><input type="checkbox" style={{ transform: "scale(1.2)" }} checked={isAllChecked('op')} onChange={(e) => handleSelectAll('op', e.target.checked)} /></td>
                      <td align="center"><input type="checkbox" style={{ transform: "scale(1.2)" }} checked={isAllChecked('pf')} onChange={(e) => handleSelectAll('pf', e.target.checked)} /></td>
                      <td align="center"><input type="checkbox" style={{ transform: "scale(1.2)" }} checked={isAllChecked('ppk')} onChange={(e) => handleSelectAll('ppk', e.target.checked)} /></td>
                      <td align="center"><input type="checkbox" style={{ transform: "scale(1.2)" }} checked={isAllChecked('pl')} onChange={(e) => handleSelectAll('pl', e.target.checked)} /></td>
                      <td align="center"><input type="checkbox" style={{ transform: "scale(1.2)" }} checked={isAllChecked('pt')} onChange={(e) => handleSelectAll('pt', e.target.checked)} /></td>
                      <td align="center"><input type="checkbox" style={{ transform: "scale(1.2)" }} checked={isAllChecked('pw')} onChange={(e) => handleSelectAll('pw', e.target.checked)} /></td>
                      <td align="center"><input type="checkbox" style={{ transform: "scale(1.2)" }} checked={isAllChecked('la')} onChange={(e) => handleSelectAll('la', e.target.checked)} /></td>
                    </tr>
                  </thead>
                  <tbody>
                    {units.map((u) => (
                      <tr key={u.id}>
                        <td>{u.title}</td>
                        <td align="center"><input type="checkbox" style={{ transform: "scale(1.5)" }} checked={u.checks.op} onChange={(e) => handleCheckUnit(u.id, 'op', e.target.checked)} /></td>
                        <td align="center"><input type="checkbox" style={{ transform: "scale(1.5)" }} checked={u.checks.pf} onChange={(e) => handleCheckUnit(u.id, 'pf', e.target.checked)} /></td>
                        <td align="center"><input type="checkbox" style={{ transform: "scale(1.5)" }} checked={u.checks.ppk} onChange={(e) => handleCheckUnit(u.id, 'ppk', e.target.checked)} /></td>
                        <td align="center"><input type="checkbox" style={{ transform: "scale(1.5)" }} checked={u.checks.pl} onChange={(e) => handleCheckUnit(u.id, 'pl', e.target.checked)} /></td>
                        <td align="center"><input type="checkbox" style={{ transform: "scale(1.5)" }} checked={u.checks.pt} onChange={(e) => handleCheckUnit(u.id, 'pt', e.target.checked)} /></td>
                        <td align="center"><input type="checkbox" style={{ transform: "scale(1.5)" }} checked={u.checks.pw} onChange={(e) => handleCheckUnit(u.id, 'pw', e.target.checked)} /></td>
                        <td align="center"><input type="checkbox" style={{ transform: "scale(1.5)" }} checked={u.checks.la} onChange={(e) => handleCheckUnit(u.id, 'la', e.target.checked)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}