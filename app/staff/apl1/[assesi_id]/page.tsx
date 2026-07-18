"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function APL01StaffPage() {
  const router = useRouter();
  const params = useParams();
  const assesiId = params.assesi_id as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [assesiDetail, setAssesiDetail] = useState<any>(null);
  const [skemaDetail, setSkemaDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State Rekomendasi Admin
  const [rekomendasi, setRekomendasi] = useState(""); 
  const [catatan, setCatatan] = useState("Peserta memenuhi persyaratan, silahkan Lanjut Asesmen Mandiri.");
  const [ttdAdmin, setTtdAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Berkas 
  const [berkasList, setBerkasList] = useState([
    { id: "ijazah", label: "Ijasah SLTA/sederajat", filename: "Belum diupload", url: "", dibaca: false },
    { id: "foto", label: "Pas Photo Berwarna", filename: "Belum diupload", url: "", dibaca: false },
    { id: "ktp", label: "KTP/KK/Paspor", filename: "Belum diupload", url: "", dibaca: false },
  ]);

  const [ttdAsesi, setTtdAsesi] = useState<string | null>(null);
  const [clientDate, setClientDate] = useState("");

  useEffect(() => {
    setClientDate(new Date().toLocaleDateString('id-ID'));
    fetchData();
  }, [assesiId]);

  const fetchData = async () => {
    if (!assesiId) return;
    setIsLoading(true);

    try {
      // 1. Ambil Profil Staff Aktif
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { data: userData } = await supabase.from("users").select("*").eq("email", user.email).maybeSingle();
        setCurrentUser(userData || { email: user.email, nama: "Staff LSP" });
      }

      // 2. Tarik Data Utama dari tabel 'assesi'
      const { data: asesi } = await supabase.from("assesi").select("*").eq("id", assesiId).maybeSingle();
      
      // 3. Tarik Data MURNI FORM dari tabel 'apl_01' (Tempat asesi menyimpan datanya)
      const { data: apl01 } = await supabase.from("apl_01").select("*").eq("assesi_id", assesiId).maybeSingle();

      if (asesi) {
        // GABUNGKAN DATA: Prioritaskan tabel apl_01, fallback ke tabel assesi
        setAssesiDetail({
          nama_peserta: apl01?.nama_lengkap || asesi.nama_peserta || "-",
          nik: apl01?.nik || asesi.nik || "-",
          kota_domisili: apl01?.kota_domisili || asesi.kota_domisili || "-",
          tempat_lahir: apl01?.tempat_lahir || asesi.tempat_lahir || "-",
          tgl_lahir: apl01?.tgl_lahir || asesi.tgl_lahir || "-",
          jenis_kelamin: apl01?.jenis_kelamin || asesi.jenis_kelamin || "1",
          alamat_rumah: apl01?.alamat_rumah || asesi.alamat_rumah || "-",
          pendidikan_terakhir: apl01?.pendidikan_terakhir || asesi.pendidikan_terakhir || "-",
          nama_perusahaan: apl01?.nama_perusahaan || asesi.nama_perusahaan || "-",
          jabatan: apl01?.jabatan || asesi.jabatan || "-",
          alamat_kantor: apl01?.alamat_kantor || asesi.alamat_kantor || "-",
          telp_kantor: apl01?.telp_kantor || asesi.telp_kantor || "-",
          email_kantor: apl01?.email_kantor || asesi.email_kantor || "-",
          email: apl01?.email || asesi.email || "-",
          no_hp: apl01?.no_hp || asesi.no_hp || "-",
        });

        // Setup Rekomendasi & TTD
        if (asesi.rekomendasi_apl1) setRekomendasi(asesi.rekomendasi_apl1);
        if (asesi.catatan_apl1) setCatatan(asesi.catatan_apl1);
        if (asesi.admin_ttd_apl1) setTtdAdmin(asesi.admin_ttd_apl1);

        // Tarik TTD Base64 atau URL
        if (apl01?.is_signed_by_asesi) {
           const localTtd = localStorage.getItem(`ttd_${assesiId}`);
           setTtdAsesi(localTtd || "https://via.placeholder.com/150x50?text=Tanda+Tangan");
        }

        // 4. Ambil Data Skema
        if (asesi.skema_sertifikasi_id) {
          const { data: skm } = await supabase.from("skema").select("*").eq("id", asesi.skema_sertifikasi_id).maybeSingle();
          if (skm) setSkemaDetail(skm);
        }

        // 5. AMBIL FILE DARI DATABASE APL_01
        // Jika URL ada di DB, file sudah diupload. Jika tidak, masih kosong.
        setBerkasList([
          { id: "ijazah", label: "Ijasah SLTA/sederajat", filename: apl01?.url_ijazah ? "File Terlampir" : "Belum diupload", url: apl01?.url_ijazah || "", dibaca: false },
          { id: "foto", label: "Pas Photo Berwarna", filename: apl01?.url_pas_photo ? "File Terlampir" : "Belum diupload", url: apl01?.url_pas_photo || "", dibaca: false },
          { id: "ktp", label: "KTP/KK/Paspor", filename: apl01?.url_ktp_kk_paspor ? "File Terlampir" : "Belum diupload", url: apl01?.url_ktp_kk_paspor || "", dibaca: false },
        ]);
      }
    } catch (err) {
      console.error("Gagal memuat data APL.01 Staff:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBukaBerkas = (e: React.MouseEvent, index: number, url: string) => {
    e.preventDefault();
    if (!url) {
      alert("Asesi belum mengupload file ini!");
      return;
    }
    
    // Update status Sudah Dibaca
    const updated = [...berkasList];
    updated[index].dibaca = true;
    setBerkasList(updated);
    
    // Buka file asli di tab baru
    window.open(url, "_blank");
  };

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rekomendasi) return alert("Harap tentukan status Rekomendasi (DITERIMA / TIDAK DITERIMA)!");
    if (!ttdAdmin) return alert("Anda harus mencentang kotak persetujuan Tanda Tangan di bagian bawah!");

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("assesi").update({
        rekomendasi_apl1: rekomendasi,
        catatan_apl1: catatan,
        admin_ttd_apl1: ttdAdmin
      }).eq("id", assesiId);

      if (error) throw error;
      alert("Sukses! Form FR.APL.01 berhasil di-ACC.");
      router.push("/staff/dashboard");
    } catch (err: any) {
      alert("Gagal menyimpan permohonan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div style={{ padding: "50px", textAlign: "center" }}><h3>Memuat Data APL.01...</h3></div>;

  return (
    <div suppressHydrationWarning className="skin-blue layout-top-nav" style={{ minHeight: "100vh", backgroundColor: "#ecf0f5" }}>
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/adminlte.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{__html: `
        .btn-app { border-radius: 3px; padding: 15px 5px; margin: 0 10px 10px 0; min-width: 80px; height: 60px; text-align: center; color: #666; border: 1px solid #ddd; background-color: #f4f4f4; font-size: 12px; }
        .form-control[disabled] { background-color: #f9f9f9; opacity: 1; }
      `}} />

      <header className="main-header">
        <nav className="navbar navbar-static-top">
          <div className="container-fluid">
            <div className="navbar-header"><span className="navbar-brand"><b>lspxyz.com</b> — Admin/Staff</span></div>
          </div>
        </nav>
      </header>

      <div className="content-wrapper" style={{ minHeight: "614px" }}>
        <section className="content" style={{ padding: "20px 30px" }}>
          <form onSubmit={handleSimpan}>
            
            <div className="box box-primary">
              <div className="box-body">
                <button type="button" onClick={() => router.push('/staff/dashboard')} className="btn btn-app"><i className="fa fa-chevron-left"></i> Kembali</button>
                <button type="submit" className="btn btn-app" disabled={isSubmitting}><i className="fa fa-floppy-o fa-2x"></i> {isSubmitting ? "Loading..." : "Simpan"}</button>
              </div>
            </div>

            <div className="box box-primary">
              <div className="box-header">
                <h2 className="box-title"><b>FR-APL-01 FORMULIR PERMOHONAN SERTIFIKASI KOMPETENSI</b></h2>
              </div>
              <div className="box-body">
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="box box-primary">
                      <div className="box-header with-border"><h3 className="box-title">Data Pribadi</h3></div>
                      <div className="box-body">
                        <div className="form-group row"><label className="col-sm-4">Nama Lengkap*</label><div className="col-sm-8"><input type="text" className="form-control" value={assesiDetail?.nama_peserta || ""} disabled /></div></div>
                        <div className="form-group row"><label className="col-sm-4">NIK*</label><div className="col-sm-8"><input type="text" className="form-control" value={assesiDetail?.nik || ""} disabled /></div></div>
                        <div className="form-group row"><label className="col-sm-4">Kota Domisili*</label><div className="col-sm-8"><input type="text" className="form-control" value={assesiDetail?.kota_domisili || ""} disabled /></div></div>
                        <div className="form-group row"><label className="col-sm-4">Tempat /Tgl Lahir*</label>
                          <div className="col-sm-8">
                            <div className="row">
                              <div className="col-md-6"><input type="text" className="form-control" value={assesiDetail?.tempat_lahir || ""} disabled /></div>
                              <div className="col-md-6"><input type="text" className="form-control" value={assesiDetail?.tgl_lahir || ""} disabled /></div>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row"><label className="col-sm-4">Jenis Kelamin*</label><div className="col-sm-8"><input type="text" className="form-control" value={assesiDetail?.jenis_kelamin === "1" ? "Pria" : assesiDetail?.jenis_kelamin === "2" ? "Wanita" : "-"} disabled /></div></div>
                        <div className="form-group row"><label className="col-sm-4">Alamat Rumah*</label><div className="col-sm-8"><input type="text" className="form-control" value={assesiDetail?.alamat_rumah || ""} disabled /></div></div>
                        <div className="form-group row"><label className="col-sm-4">No. Telepon/Email</label>
                          <div className="col-sm-8">
                            <input type="text" className="form-control" style={{marginBottom:"5px"}} value={assesiDetail?.no_hp || ""} disabled />
                            <input type="text" className="form-control" value={assesiDetail?.email || ""} disabled />
                          </div>
                        </div>
                        <div className="form-group row"><label className="col-sm-4">Pendidikan Terakhir*</label><div className="col-sm-8"><input type="text" className="form-control" value={assesiDetail?.pendidikan_terakhir || ""} disabled /></div></div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="box box-primary">
                      <div className="box-header with-border"><h3 className="box-title">Data Pekerjaan Sekarang</h3></div>
                      <div className="box-body">
                        <div className="form-group row"><label className="col-sm-4">Nama Lembaga/Perusahaan</label><div className="col-sm-8"><input type="text" className="form-control" value={assesiDetail?.nama_perusahaan || ""} disabled /></div></div>
                        <div className="form-group row"><label className="col-sm-4">Jabatan</label><div className="col-sm-8"><input type="text" className="form-control" value={assesiDetail?.jabatan || ""} disabled /></div></div>
                        <div className="form-group row"><label className="col-sm-4">Alamat Kantor</label><div className="col-sm-8"><input type="text" className="form-control" value={assesiDetail?.alamat_kantor || ""} disabled /></div></div>
                        <div className="form-group row"><label className="col-sm-4">No Telp/Email Kantor</label>
                          <div className="col-sm-8">
                            <input type="text" className="form-control" style={{marginBottom:"5px"}} value={assesiDetail?.telp_kantor || ""} disabled />
                            <input type="text" className="form-control" value={assesiDetail?.email_kantor || ""} disabled />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row mt-4">
                  <div className="col-md-12">
                    <table className="table table-bordered">
                      <thead>
                        <tr><th style={{ width: '30%' }}>Skema Sertifikasi</th><th style={{ width: '10%' }}>Judul</th><th style={{ width: '2%' }}>:</th><th>{skemaDetail?.judul_skema || "-"}</th></tr>
                        <tr><th>Jenis: Klaster</th><th>Nomor</th><th>:</th><th>{skemaDetail?.kode_skema || "-"}</th></tr>
                      </thead>
                    </table>
                  </div>
                </div>

                <hr/>
                <h4><strong>Bagian 3 : Bukti Kelengkapan Data Pemohon</strong></h4>
                <div className="row">
                  <div className="col-md-12">
                    <div className="table-responsive">
                      <table className="table table-bordered table-striped">
                        <thead>
                          <tr className="bg-gray">
                            <th style={{ width: '5%' }}>No.</th>
                            <th style={{ width: '75%' }}>Bukti Persyaratan</th>
                            <th style={{ width: '20%' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {berkasList.map((berkas, idx) => (
                            <tr key={berkas.id}>
                              <td>{idx + 1}</td>
                              <td>
                                {berkas.url ? (
                                  <a href="#" onClick={(e) => handleBukaBerkas(e, idx, berkas.url)} style={{ color: "#337ab7", fontWeight: "bold" }}>
                                    {berkas.label} [{berkas.filename}]
                                  </a>
                                ) : (
                                  <span className="text-muted">{berkas.label} [Belum diupload]</span>
                                )}
                              </td>
                              <td>
                                {berkas.url === "" ? (
                                  <span className="badge badge-warning" style={{backgroundColor:"#f39c12"}}>Menunggu File</span>
                                ) : berkas.dibaca ? (
                                  <span className="badge badge-success" style={{backgroundColor:"#00a65a"}}>Sudah Dibaca</span>
                                ) : (
                                  <span className="badge badge-danger" style={{backgroundColor:"#dd4b39"}}>Belum Dibaca</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <hr/>
                <div className="row">
                  <div className="col-md-12">
                    <b>Note ***) diisi oleh Admin LSP</b>
                    <table className="table table-bordered">
                      <tbody>
                        <tr className="bg-gray"><td width="50%"><b>Rekomendasi Admin LSP</b></td><td colSpan={2}><b>Pemohon **)</b></td></tr>
                        <tr>
                          <td>
                            Berdasarkan Ketentuan Persyaratan dasar pemohon maka pemohon:<br/><br/>
                            <div className="btn-group">
                              <button type="button" className={`btn btn-sm ${rekomendasi === 'D' ? 'btn-success active' : 'btn-default'}`} onClick={() => setRekomendasi('D')}>DITERIMA</button>
                              <button type="button" className={`btn btn-sm ${rekomendasi === 'TD' ? 'btn-danger active' : 'btn-default'}`} onClick={() => setRekomendasi('TD')}>TIDAK DITERIMA</button>
                            </div>
                            <br/><br/>sebagai peserta sertifikasi
                          </td>
                          <td>Nama</td>
                          <td>
                            <b>{assesiDetail?.nama_peserta || "-"}</b><br/><br/>
                            TTD :<br/>
                            {ttdAsesi ? (
                              <img src={ttdAsesi} alt="TTD Peserta" width="120" style={{ border: "1px solid #ccc", padding: "4px" }} />
                            ) : (
                              <span className="text-danger">Belum Tanda Tangan</span>
                            )}
                            <p style={{marginTop:"8px"}}>Tgl : {clientDate}</p>
                            <label><input type="checkbox" checked disabled /> Menyetujui permohonan</label>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            Catatan<br/>
                            <textarea className="form-control" rows={4} value={catatan} onChange={(e) => setCatatan(e.target.value)}></textarea>
                          </td>
                          <td>Admin</td>
                          <td>
                            <b>{currentUser?.nama || "Admin Staff"}</b><br/><br/>
                            TTD :<br/>
                            {ttdAdmin ? <img src="https://via.placeholder.com/120x40?text=TTD+Admin" alt="TTD Admin" width="120" /> : <span className="text-muted">Centang bawah untuk TTD.</span>}
                            <br/><br/>
                            <label><input type="checkbox" checked={ttdAdmin} onChange={(e) => setTtdAdmin(e.target.checked)} /> Dengan ini saya menyetujui permohonan</label>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}