"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { KOTA_DOMISILI_OPTIONS, PENDIDIKAN_OPTIONS, PEKERJAAN_OPTIONS } from "@/lib/apl1FormOptions";

const DOKUMEN_SYARAT = [
  { key: "ijazah", label: "Ijasah SLTA/Sederajat", section: "3.1. Bukti Persyaratan Dasar & Administratif Pemohon" },
  { key: "pas_photo", label: "Pas Photo Berwarna", section: "3.1. Bukti Persyaratan Dasar & Administratif Pemohon" },
  { key: "ktp_kk_paspor", label: "KTP/KK/Paspor", section: "3.1. Bukti Persyaratan Dasar & Administratif Pemohon" },
  { key: "sertifikat_pelatihan", label: "Sertifikat Pelatihan Berbasis Kompetensi yang relevan", section: "3.2. Bukti Kompetensi yang Relevan" },
  { key: "pengalaman_kerja", label: "Surat Pengalaman Kerja yang relevan", section: "3.2. Bukti Kompetensi yang Relevan" },
];

const emptyFormData = {
  nama_lengkap: "", nik: "", kota_domisili: "", tempat_lahir: "", tgl_lahir: "",
  jenis_kelamin: "", kebangsaan: "", alamat_rumah: "", kodepos_rumah: "",
  telp_rumah: "", telp_kantor1: "", no_hp: "", email: "", pendidikan_terakhir: "",
  nama_perusahaan: "", jabatan: "", alamat_kantor: "", kodepos_kantor: "",
  telp_kantor: "", fax_kantor: "", email_kantor: "", kode_pekerjaan: "",
  skema: "", tujuan: "",
};

const showAlert = (title: string, message: string, icon: "success" | "warning" | "error") => {
  const Swal = (window as any).Swal;
  if (Swal && typeof Swal.fire === "function") {
    Swal.fire(title, message, icon);
  } else {
    alert(`${title}\n\n${message}`);
  }
};

export default function Apl01Page() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.event_id as string;
  const assesiId = params?.assesi_id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [assesiInfo, setAssesiInfo] = useState<any>(null);
  const [skemaInfo, setSkemaInfo] = useState<any>(null);
  const [unitKompetensi, setUnitKompetensi] = useState<any[]>([]);
  const [adminInfo, setAdminInfo] = useState<any>(null);

  const [apl01Id, setApl01Id] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>(emptyFormData);
  const [files, setFiles] = useState<any>({});
  const [existingUrls, setExistingUrls] = useState<any>({});
  const [ttdChecked, setTtdChecked] = useState(false);

  // LOGIKA LOCK & NOTIFIKASI
  const [isLocked, setIsLocked] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!(window as any).Swal && !document.getElementById("sweetalert2-cdn")) {
      const script = document.createElement("script");
      script.id = "sweetalert2-cdn";
      script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
      script.async = true;
      document.body.appendChild(script);
    }
    fetchData();
  }, [assesiId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      let userEmail = authUser?.email;

      const { data: assesiData, error: assesiError } = await supabase.from("assesi").select("*").eq("id", assesiId).single();
      if (assesiError) throw assesiError;
      
      setAssesiInfo(assesiData);
      if (!userEmail) userEmail = assesiData?.email;

      const { data: userData } = await supabase.from("users").select("*").eq("email", userEmail).maybeSingle();
      setCurrentUser(userData || { email: userEmail, nama: assesiData?.nama_peserta });

      if (assesiData?.skema_sertifikasi_id) {
        const { data: skemaData } = await supabase.from("skema").select("*").eq("id", assesiData.skema_sertifikasi_id).maybeSingle();
        setSkemaInfo(skemaData);

        const { data: unitData } = await supabase.from("skema_unit").select("*").eq("skema_id", assesiData.skema_sertifikasi_id).order("id", { ascending: true });
        setUnitKompetensi(unitData || []);
      }

      // PERBAIKAN LOGIKA STATUS APL.01
      const isAcc = assesiData.rekomendasi_apl1 === 'D';
      const hasSubmitted = localStorage.getItem(`apl1_filled_${assesiId}`) === "true";

      if (isAcc) {
        // Jika sudah di ACC, form JANGAN dikunci dan TIDAK ADA notif kuning
        setIsApproved(true);
        setIsLocked(false);
        setShowWarning(false);
      } else if (hasSubmitted) {
        // Jika sudah disubmit TAPI BELUM di-ACC, form DIKUNCI dan ADA notif kuning
        setIsApproved(false);
        setIsLocked(true);
        setShowWarning(true);
      } else {
        // Jika belum ngapa-ngapain
        setIsApproved(false);
        setIsLocked(false);
        setShowWarning(false);
      }

      setAdminInfo({
        rekomendasi: assesiData.rekomendasi_apl1,
        catatan: assesiData.catatan_apl1,
        nama_admin: "Admin",
      });

      const { data: apl01Data } = await supabase.from("apl_01").select("*").eq("assesi_id", assesiId).maybeSingle();

      if (apl01Data) {
        setApl01Id(apl01Data.id);
        setFormData({
          nama_lengkap: apl01Data.nama_lengkap || "",
          nik: apl01Data.nik || "",
          kota_domisili: apl01Data.kota_domisili || "",
          tempat_lahir: apl01Data.tempat_lahir || "",
          tgl_lahir: apl01Data.tgl_lahir || "",
          jenis_kelamin: apl01Data.jenis_kelamin || "",
          kebangsaan: apl01Data.kebangsaan || "",
          alamat_rumah: apl01Data.alamat_rumah || "",
          kodepos_rumah: apl01Data.kodepos_rumah || "",
          telp_rumah: apl01Data.telp_rumah || "",
          telp_kantor1: apl01Data.telp_kantor1 || "",
          no_hp: apl01Data.no_hp || "",
          email: apl01Data.email || userEmail || "",
          pendidikan_terakhir: apl01Data.pendidikan_terakhir || "",
          nama_perusahaan: apl01Data.nama_perusahaan || "",
          jabatan: apl01Data.jabatan || "",
          alamat_kantor: apl01Data.alamat_kantor || "",
          kodepos_kantor: apl01Data.kodepos_kantor || "",
          telp_kantor: apl01Data.telp_kantor || "",
          fax_kantor: apl01Data.fax_kantor || "",
          email_kantor: apl01Data.email_kantor || "",
          kode_pekerjaan: apl01Data.kode_pekerjaan || "",
          skema: apl01Data.skema || "",
          tujuan: apl01Data.tujuan || "",
        });
        setExistingUrls({
          ijazah: apl01Data.url_ijazah,
          pas_photo: apl01Data.url_pas_photo,
          ktp_kk_paspor: apl01Data.url_ktp_kk_paspor,
          sertifikat_pelatihan: apl01Data.url_sertifikat_pelatihan,
          pengalaman_kerja: apl01Data.url_pengalaman_kerja,
        });
        setTtdChecked(!!apl01Data.is_signed_by_asesi);
      } else {
        setFormData((prev: any) => ({ ...prev, nama_lengkap: assesiData?.nama_peserta || "", email: userEmail || "" }));
      }
    } catch (err) {
      console.error("Gagal memuat data APL.01:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (key: string, file: File | null) => {
    setFiles((prev: any) => ({ ...prev, [key]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const uploadedUrls: any = { ...existingUrls };
      for (const doc of DOKUMEN_SYARAT) {
        const file = files[doc.key];
        if (file) {
          const ext = file.name.split(".").pop();
          const path = `apl1/${assesiId}/${doc.key}-${Date.now()}.${ext}`;
          const { error: uploadError } = await supabase.storage.from("apl-dokumen").upload(path, file, { upsert: true });
          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage.from("apl-dokumen").getPublicUrl(path);
          uploadedUrls[doc.key] = publicUrlData.publicUrl;
        }
      }

      const payload = {
        assesi_id: Number(assesiId), event_id: eventId, ...formData,
        url_ijazah: uploadedUrls.ijazah || null, url_pas_photo: uploadedUrls.pas_photo || null,
        url_ktp_kk_paspor: uploadedUrls.ktp_kk_paspor || null, url_sertifikat_pelatihan: uploadedUrls.sertifikat_pelatihan || null,
        url_pengalaman_kerja: uploadedUrls.pengalaman_kerja || null,
        is_signed_by_asesi: ttdChecked, updated_at: new Date().toISOString(),
      };

      if (apl01Id) {
        await supabase.from("apl_01").update(payload).eq("id", apl01Id);
      } else {
        const { data } = await supabase.from("apl_01").insert(payload).select().single();
        if (data) setApl01Id(data.id);
      }

      // SET LOCAL STORAGE KARENA SUDAH DISIMPAN
      if (!isApproved) {
        localStorage.setItem(`apl1_filled_${assesiId}`, "true");
        setIsLocked(true);
        setShowWarning(true);
      }

      showAlert("Berhasil", "APL.01 berhasil dikirim dan disimpan.", "success");
    } catch (err: any) {
      showAlert("Gagal Menyimpan", err?.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/login");
  };

  if (isLoading) return <div className="text-center" style={{ paddingTop: "100px" }}><h4>Memuat formulir APL.01...</h4></div>;

  return (
    <div suppressHydrationWarning className="skin-blue layout-top-nav" style={{ height: "auto", minHeight: "100vh", backgroundColor: "#ecf0f5" }}>
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/adminlte.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{__html: `.swal2-popup { font-size: 1.6rem !important; } .form-group.row { margin-bottom: 15px; } .col-form-label { font-weight: bold; } .radio-inline { margin-right: 15px; font-weight: normal; }`}} />

      <header className="main-header no-print">
        <nav className="navbar navbar-static-top">
          <div className="container-fluid">
            <div className="navbar-header"><Link href="/assesi/dashboard" className="navbar-brand"><b>lspxyz.com</b></Link></div>
            <div className="navbar-custom-menu">
              <ul className="nav navbar-nav">
                <li><a href="#" onClick={handleLogout} className="btn btn-danger" style={{ color: "white", padding: "10px 15px", margin: "5px" }}>Log Out {currentUser?.email}</a></li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <div className="content-wrapper" style={{ minHeight: "614px", backgroundColor: "transparent" }}>
        <div className="container-fluid" style={{ padding: "20px 30px" }}>
          
          <div className="row no-print">
            <div className="col-md-12">
              <Link href="/assesi/dashboard" className="btn btn-default" style={{ marginBottom: "15px" }}><i className="fa fa-arrow-left"></i> Kembali ke Dashboard</Link>
            </div>
          </div>

          {showWarning && (
            <div className="alert alert-info" style={{ backgroundColor: "#00c0ef", color: "white", marginBottom: "20px" }}>
              APL.01 Anda sudah terkirim dan sedang menunggu verifikasi Admin/Staff LSP. Formulir dikunci sementara.
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="box box-primary">
              <div className="box-header"><h2 className="box-title"><b>FR-APL-01 FORMULIR PERMOHONAN SERTIFIKASI KOMPETENSI</b></h2></div>

              <div className="box-body">
                <div className="row">
                  {/* Data Pribadi */}
                  <div className="col-md-6">
                    <div className="box box-primary">
                      <div className="box-header with-border"><h3 className="box-title">Data Pribadi</h3></div>
                      <div className="box-body">
                        <div className="form-group row"><label className="col-sm-4 col-form-label">Nama Lengkap*</label><div className="col-sm-8"><input type="text" className="form-control" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} disabled={isLocked} /></div></div>
                        <div className="form-group row"><label className="col-sm-4 col-form-label">NIK*</label><div className="col-sm-8"><input type="text" maxLength={16} className="form-control" name="nik" value={formData.nik} onChange={handleChange} disabled={isLocked} /></div></div>
                        <div className="form-group row"><label className="col-sm-4 col-form-label">Kota Domisili*</label>
                          <div className="col-sm-8">
                            <select className="form-control" name="kota_domisili" value={formData.kota_domisili} onChange={handleChange} disabled={isLocked}>
                              <option value="">-- Pilih Kota/Kabupaten --</option>
                              {KOTA_DOMISILI_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                            </select>
                          </div>
                        </div>
                        <div className="form-group row"><label className="col-sm-4 col-form-label">Tempat /Tgl Lahir*</label>
                          <div className="col-sm-8">
                            <div className="row">
                              <div className="col-md-6"><input type="text" className="form-control" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleChange} disabled={isLocked} /></div>
                              <div className="col-md-6"><input type="date" className="form-control" name="tgl_lahir" value={formData.tgl_lahir} onChange={handleChange} disabled={isLocked} /></div>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row"><label className="col-sm-4 col-form-label">Jenis Kelamin*</label>
                          <div className="col-sm-8">
                            <label className="radio-inline"><input type="radio" name="jenis_kelamin" value="1" checked={formData.jenis_kelamin === "1"} onChange={handleChange} disabled={isLocked} /> Pria</label>
                            <label className="radio-inline"><input type="radio" name="jenis_kelamin" value="2" checked={formData.jenis_kelamin === "2"} onChange={handleChange} disabled={isLocked} /> Wanita</label>
                          </div>
                        </div>
                        <div className="form-group row"><label className="col-sm-4 col-form-label">Kebangsaan *</label>
                          <div className="col-sm-8">
                            <select className="form-control" name="kebangsaan" value={formData.kebangsaan} onChange={handleChange} disabled={isLocked}>
                              <option value="">-- Pilih --</option><option value="1">Indonesia</option><option value="2">Luar Negeri</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group row"><label className="col-sm-4 col-form-label">Alamat Rumah*</label>
                          <div className="col-sm-8">
                            <textarea className="form-control" name="alamat_rumah" rows={4} style={{ width: "100%", marginBottom: "8px" }} value={formData.alamat_rumah} onChange={handleChange} disabled={isLocked}></textarea>
                            <input type="text" className="form-control" name="kodepos_rumah" placeholder="Kode Pos" value={formData.kodepos_rumah} onChange={handleChange} disabled={isLocked} />
                          </div>
                        </div>
                        <div className="form-group row"><label className="col-sm-4 col-form-label">No. Telepon/Email</label>
                          <div className="col-sm-8">
                            <div className="row">
                              <div className="col-md-6"><input type="text" className="form-control" name="telp_rumah" placeholder="Telp Rumah" value={formData.telp_rumah} onChange={handleChange} disabled={isLocked} /></div>
                              <div className="col-md-6"><input type="text" className="form-control" name="telp_kantor1" placeholder="Telp Kantor" value={formData.telp_kantor1} onChange={handleChange} disabled={isLocked} /></div>
                            </div><br />
                            <div className="row">
                              <div className="col-md-6"><input type="text" className="form-control" name="no_hp" placeholder="HP *)" value={formData.no_hp} onChange={handleChange} disabled={isLocked} /></div>
                              <div className="col-md-6"><input type="text" className="form-control" name="email" placeholder="E-mail" value={formData.email} readOnly /></div>
                            </div>
                          </div>
                        </div>
                        <div className="form-group row"><label className="col-sm-4 col-form-label">Pendidikan Terakhir*</label>
                          <div className="col-sm-8">
                            <select className="form-control" name="pendidikan_terakhir" value={formData.pendidikan_terakhir} onChange={handleChange} disabled={isLocked}>
                              <option value="">-- Pilih --</option>
                              {PENDIDIKAN_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Data Pekerjaan Sekarang */}
                  <div className="col-md-6">
                    <div className="box box-primary">
                      <div className="box-header with-border"><h3 className="box-title">Data Pekerjaan Sekarang</h3></div>
                      <div className="box-body">
                        <div className="form-group row"><label className="col-sm-4 col-form-label">Nama Perusahaan/Unit Kerja</label>
                          <div className="col-sm-8"><input type="text" className="form-control" name="nama_perusahaan" value={formData.nama_perusahaan} onChange={handleChange} disabled={isLocked} /></div>
                        </div>
                        <div className="form-group row"><label className="col-sm-4 col-form-label">Jabatan</label>
                          <div className="col-sm-8"><input type="text" className="form-control" name="jabatan" value={formData.jabatan} onChange={handleChange} disabled={isLocked} /></div>
                        </div>
                        <div className="form-group row"><label className="col-sm-4 col-form-label">Alamat Kantor</label>
                          <div className="col-sm-8">
                            <textarea className="form-control" name="alamat_kantor" rows={4} style={{ width: "100%", marginBottom: "8px" }} value={formData.alamat_kantor} onChange={handleChange} disabled={isLocked}></textarea>
                            <input type="text" className="form-control" name="kodepos_kantor" placeholder="Kode Pos" value={formData.kodepos_kantor} onChange={handleChange} disabled={isLocked} />
                          </div>
                        </div>
                        <div className="form-group row"><label className="col-sm-4 col-form-label">No Telp/Fax/Email</label>
                          <div className="col-sm-8">
                            <div className="row">
                              <div className="col-md-6"><input type="text" className="form-control" name="telp_kantor" placeholder="Telp Kantor" value={formData.telp_kantor} onChange={handleChange} disabled={isLocked} /></div>
                              <div className="col-md-6"><input type="text" className="form-control" name="fax_kantor" placeholder="Fax Kantor" value={formData.fax_kantor} onChange={handleChange} disabled={isLocked} /></div>
                            </div><br />
                            <div className="row"><div className="col-md-12"><input type="text" className="form-control" name="email_kantor" placeholder="Email Kantor" value={formData.email_kantor} onChange={handleChange} disabled={isLocked} /></div></div>
                          </div>
                        </div>
                        <div className="form-group row"><label className="col-sm-4 col-form-label">Pekerjaan *</label>
                          <div className="col-sm-8">
                            <select className="form-control" name="kode_pekerjaan" value={formData.kode_pekerjaan} onChange={handleChange} disabled={isLocked}>
                              <option value="">-- Pilih --</option>
                              {PEKERJAAN_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <h4><strong>Bagian 2 : Data Sertifikasi</strong></h4>
                    <table className="table table-bordered">
                      <tbody>
                        <tr><td width="30%"><b>Judul Skema Sertifikasi</b></td><td>{skemaInfo?.judul_skema || "Belum ditentukan"}</td></tr>
                        <tr><td><b>Nomor/Kode Skema</b></td><td>{skemaInfo?.kode_skema || "-"}</td></tr>
                        <tr><td><b>Jenis Skema*</b></td>
                          <td>
                            <label className="radio-inline"><input type="radio" name="skema" value="1" checked={formData.skema === "1"} onChange={handleChange} disabled={isLocked} /> KKNI</label>
                            <label className="radio-inline"><input type="radio" name="skema" value="2" checked={formData.skema === "2"} onChange={handleChange} disabled={isLocked} /> Okupasi</label>
                            <label className="radio-inline"><input type="radio" name="skema" value="3" checked={formData.skema === "3"} onChange={handleChange} disabled={isLocked} /> Klaster</label>
                          </td>
                        </tr>
                        <tr><td><b>Tujuan Assesment*</b></td>
                          <td>
                            <label className="radio-inline"><input type="radio" name="tujuan" value="1" checked={formData.tujuan === "1"} onChange={handleChange} disabled={isLocked} /> Sertifikasi</label>
                            <label className="radio-inline"><input type="radio" name="tujuan" value="2" checked={formData.tujuan === "2"} onChange={handleChange} disabled={isLocked} /> Pengakuan Kompetensi Terkini (PKT)</label>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <b>Daftar Unit Kompetensi</b>
                    <table className="table table-bordered">
                      <thead><tr className="bg-gray"><th>No.</th><th>Kode Unit</th><th>Judul Unit</th><th>Jenis Standar</th></tr></thead>
                      <tbody>
                        {unitKompetensi.length === 0 ? (
                          <tr><td colSpan={4} className="text-center text-muted">Belum ada data unit kompetensi untuk skema ini.</td></tr>
                        ) : (
                          unitKompetensi.map((u, idx) => (
                            <tr key={u.id}><td>{idx + 1}</td><td>{u.kode_unit}</td><td>{u.judul_unit}</td><td>{u.jenis_standar}</td></tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <h4><strong>Bagian 3 : Bukti Kelengkapan Data Pemohon</strong></h4>
                {["3.1. Bukti Persyaratan Dasar & Administratif Pemohon", "3.2. Bukti Kompetensi yang Relevan"].map((sectionTitle) => (
                  <div className="row" key={sectionTitle}>
                    <div className="col-md-12">
                      <b>{sectionTitle}</b>
                      <table className="table table-bordered">
                        <thead><tr className="bg-gray"><th style={{ width: "40px" }}>No.</th><th>Bukti Persyaratan</th></tr></thead>
                        <tbody>
                          {DOKUMEN_SYARAT.filter((d) => d.section === sectionTitle).map((doc, idx) => (
                            <tr key={doc.key}>
                              <td>{idx + 1}</td>
                              <td>{doc.label}<br />
                                <input type="file" accept=".jpg,.jpeg,.png,.pdf" disabled={isLocked} onChange={(e) => handleFileSelect(doc.key, e.target.files ? e.target.files[0] : null)} style={{ marginTop: "6px" }} />
                                {existingUrls[doc.key] && (
                                  <div style={{ marginTop: "6px" }}><a href={existingUrls[doc.key]} target="_blank" rel="noreferrer"><i className="fa fa-file"></i> Lihat file yang sudah terupload</a></div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                <div className="row">
                  <div className="col-md-12"><br />
                    <b>Note ***) diisi oleh Admin LSP</b>
                    <table className="table table-bordered">
                      <tbody>
                        <tr className="bg-gray"><td width="50%"><b>Rekomendasi</b></td><td colSpan={2}><b>Pemohon **)</b></td></tr>
                        <tr>
                          <td>
                            Berdasarkan Ketentuan Persyaratan dasar pemohon maka pemohon:<br /><br />
                            {adminInfo?.rekomendasi === "D" ? <span className="label label-success">DITERIMA</span> : adminInfo?.rekomendasi === "TD" ? <span className="label label-danger">TIDAK DITERIMA</span> : <span className="label label-default">N/A - Belum diproses Admin</span>}<br /><br />
                            sebagai peserta sertifikasi
                          </td>
                          <td>Nama</td>
                          <td>
                            <b>{formData.nama_lengkap || "-"}</b><br /><br />
                            TTD:<p>{currentUser?.signature_url ? <img src={currentUser.signature_url} alt="Tanda Tangan" width={100} style={{ border: "1px solid #ccc" }} /> : <span className="text-muted">Belum ada tanda tangan tersimpan</span>}</p>
                            <p>Tgl : {ttdChecked ? new Date().toLocaleDateString("id-ID") : "-"}</p>
                            <label style={{ fontWeight: "normal" }}><input type="checkbox" checked={ttdChecked} onChange={(e) => setTtdChecked(e.target.checked)} disabled={isLocked} /> Dengan ini maka saya menyetujui permohonan</label>
                          </td>
                        </tr>
                        <tr><td rowSpan={4}>Catatan<br /><p>{adminInfo?.catatan || "-"}</p></td></tr>
                        <tr className="bg-gray"><td colSpan={2}><b>Admin LSP ***)</b></td></tr>
                        <tr><td>Nama</td><td>{adminInfo?.nama_admin || "-"}</td></tr>
                        <tr><td>No. Reg MET/NIK</td><td>{adminInfo?.no_reg || "-"}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="row no-print">
                  <div className="col-md-12 text-center">
                    {!isLocked && (
                      <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ marginRight: "10px" }}>{isSaving ? "Menyimpan..." : "Simpan"}</button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}