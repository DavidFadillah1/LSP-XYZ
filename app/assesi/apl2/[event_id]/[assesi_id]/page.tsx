"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// MEMBUAT SOAL MENJADI DINAMIS AGAR TIDAK ADA ERROR MISMATCH
const SOAL_ELEMENTS = [
  {
    id: "1982520",
    title: "Element: Merencanakan penagihan angsuran dan penyelesaian tunggakan",
    kuks: [
      "1.1 Mengidentifikasi tagihan yang telah jatuh tempo",
      "1.2 Mengidentifikasi dokumen tunggakan untuk penagihan sesuai prosedur.",
      "1.3 Menyusun jadwal penagihan tunggakan angsuran"
    ]
  },
  {
    id: "1982521",
    title: "Element: Melaksanakan penagihan angsuran dan penyelesaian tunggakan",
    kuks: [
      "2.1 Melaksanakan penagihan angsuran dan penyelesaian tunggakan kepada peminjam sesuai prosedur.",
      "2.2 Menghitung penagihan angsuran dan tunggakan",
      "2.3 Mengkonfirmasi komitmen peminjam untuk menyelesaikan angsuran",
      "2.4 Membukukan pembayaran tunggakan angsuran pokok, bunga dan denda sesuai prosedur.",
      "2.5 Mendokumentasikan bukti pembayaran angsuran dan penyelesaian tunggakan sesuai prosedur."
    ]
  },
  {
    id: "1982522",
    title: "Element: Melaporkan hasil penagihan angsuran dan penyelesaian tunggakan",
    kuks: [
      "3.1 Melaksanakan monitoring dan evaluasi hasil penagihan.",
      "3.2 Melaporkan hasil penagihan angsuran sesuai prosedur."
    ]
  }
];

export default function APL02AsesiPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.event_id as string;
  const assesiId = params.assesi_id as string;

  const [assesiDetail, setAssesiDetail] = useState<any>(null);
  const [skemaDetail, setSkemaDetail] = useState<any>(null);
  const [asesorName, setAsesorName] = useState("-");
  const [tukName, setTukName] = useState("-");
  const [isLoading, setIsLoading] = useState(true);

  const [buktiList, setBuktiList] = useState<any[]>([]);
  
  // STATE PENILAIAN OTOMATIS MENGIKUTI JUMLAH SOAL DI ATAS
  const [penilaian, setPenilaian] = useState<Record<string, 'k' | 'bk' | null>>(() => {
    const initialState: any = {};
    SOAL_ELEMENTS.forEach(el => initialState[el.id] = null);
    return initialState;
  });
  
  const [buktiTerkait, setBuktiTerkait] = useState<Record<string, Record<string, boolean>>>({});
  
  const [ttdAsesiChecked, setTtdAsesiChecked] = useState(false);
  const [ttdAsesiImg, setTtdAsesiImg] = useState<string | null>(null);

  const [clientTime, setClientTime] = useState("");
  const [clientDate, setClientDate] = useState("");

  useEffect(() => {
    setClientTime(new Date().toLocaleString('id-ID'));
    setClientDate(new Date().toLocaleDateString('id-ID'));
    fetchData();

    if (assesiId) {
      const savedTtd = localStorage.getItem(`ttd_${assesiId}`);
      if (savedTtd) setTtdAsesiImg(savedTtd);
    }
  }, [assesiId]);

  const fetchData = async () => {
    if (!assesiId) return;
    setIsLoading(true);
    try {
      const { data: asesi } = await supabase.from("assesi").select("*").eq("id", assesiId).maybeSingle();
      setAssesiDetail(asesi);

      if (asesi) {
        if (asesi.skema_sertifikasi_id) {
          const { data: skm } = await supabase.from("skema").select("*").eq("id", asesi.skema_sertifikasi_id).maybeSingle();
          if (skm) setSkemaDetail(skm);
        }
        if (asesi.assesor_id) {
          const { data: usr } = await supabase.from("users").select("nama").eq("id", asesi.assesor_id).maybeSingle();
          if (usr) setAsesorName(usr.nama);
        }
        if (eventId) {
          const { data: ev } = await supabase.from("event").select("tuk_id").eq("id", eventId).maybeSingle();
          if (ev?.tuk_id) {
            const { data: tk } = await supabase.from("tuk").select("nama_tuk").eq("id", ev.tuk_id).maybeSingle();
            if (tk) setTukName(tk.nama_tuk);
          }
        }

        const savedBukti = localStorage.getItem(`apl2_bukti_${assesiId}`);
        if (savedBukti) setBuktiList(JSON.parse(savedBukti));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTambahBukti = () => {
    const newId = Date.now().toString();
    setBuktiList([...buktiList, { id: newId, fileBase64: "", fileName: "", keterangan: "", isSaved: false }]);
  };

  const handleInputBukti = (id: string, field: string, value: any) => {
    const updated = buktiList.map(b => b.id === id ? { ...b, [field]: value } : b);
    setBuktiList(updated);
  };

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = buktiList.map(b => b.id === id ? { ...b, fileBase64: reader.result, fileName: file.name } : b);
        setBuktiList(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBukti = (id: string) => {
    const target = buktiList.find(b => b.id === id);
    if (!target?.fileBase64) return alert("Pilih file terlebih dahulu!");
    if (!target?.keterangan) return alert("Keterangan wajib diisi!");

    const updated = buktiList.map(b => b.id === id ? { ...b, isSaved: true } : b);
    setBuktiList(updated);
    localStorage.setItem(`apl2_bukti_${assesiId}`, JSON.stringify(updated));
  };

  const handleHapusBukti = (id: string) => {
    if (!confirm("Yakin ingin menghapus bukti ini?")) return;
    const updated = buktiList.filter(b => b.id !== id);
    setBuktiList(updated);
    localStorage.setItem(`apl2_bukti_${assesiId}`, JSON.stringify(updated));
  };

  const handleRadioChange = (elementId: string, status: 'k' | 'bk') => {
    setPenilaian(prev => ({ ...prev, [elementId]: status }));
  };

  const handleCekBukti = (elementId: string, buktiId: string, checked: boolean) => {
    setBuktiTerkait(prev => ({ ...prev, [elementId]: { ...(prev[elementId] || {}), [buktiId]: checked } }));
  };

  const handleSimpanAPL02 = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // VALIDASI 1: Cek apakah ada soal yang belum dijawab
    const unfilled = SOAL_ELEMENTS.filter(el => penilaian[el.id] === null);
    if (unfilled.length > 0) {
      return alert(`Ada ${unfilled.length} Elemen Kompetensi yang belum Anda nilai (Pilih K atau BK)!`);
    }

    // VALIDASI 2: Jika K, pastikan mencentang minimal 1 bukti
    for (const el of SOAL_ELEMENTS) {
      if (penilaian[el.id] === 'k') {
        const hasBukti = Object.values(buktiTerkait[el.id] || {}).some(c => c === true);
        if (!hasBukti) {
          return alert(`Pada "${el.title}", Anda memilih Kompeten (K). Wajib mencentang minimal 1 Bukti Portofolio!`);
        }
      }
    }

    if (!ttdAsesiChecked) return alert("Harap centang kotak persetujuan tanda tangan Anda di bagian bawah!");

    localStorage.setItem(`apl1_filled_${assesiId}`, "true");
    localStorage.setItem(`apl2_filled_${assesiId}`, "true");
    
    alert("Data berhasil tersimpan. Perintah sukses dijalankan, Terima Kasih!!");
    router.push("/assesi/dashboard");
  };

  if (isLoading) return <div className="text-center" style={{padding:"50px"}}><h4>Memuat Soal Mandiri...</h4></div>;

  return (
    <div className="skin-blue layout-top-nav" style={{ minHeight: "100vh", backgroundColor: "#ecf0f5" }}>
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/adminlte.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{__html: `.btn-app { border-radius: 3px; padding: 15px 5px; margin: 0 10px 10px 0; min-width: 80px; height: 60px; text-align: center; color: #666; border: 1px solid #ddd; background-color: #f4f4f4; font-size: 12px; }`}} />

      <div className="content-wrapper">
        <section className="content" style={{ padding: "20px 30px" }}>
          <form onSubmit={handleSimpanAPL02}>
            
            <div className="box box-primary">
              <div className="box-body">
                <button type="button" onClick={() => router.push('/assesi/dashboard')} className="btn btn-app"><i className="fa fa-chevron-left fa-2x"></i> Kembali</button>
                <button type="submit" className="btn btn-app"><i className="fa fa-floppy-o fa-2x"></i> Simpan</button>
                <a className="btn btn-app" href="#" target="_blank"><i className="fa fa-info fa-2x"></i> Petunjuk</a>
              </div>
            </div>

            <div className="box box-primary">
              <div className="box-header">
                <h2 className="box-title"><b>FR-APL-02 ASSESMEN MANDIRI</b></h2>
                <p>Panduan Assesmen Mandiri</p>
              </div>
              <div className="box-body">
                
                <table className="table table-bordered">
                  <tbody>
                    <tr><td width="30%" rowSpan={2} style={{verticalAlign:"middle"}}>Skema Sertifikasi/ Klaster Asesmen</td><td width="5%">Judul</td><td width="2%">:</td><th>{skemaDetail?.judul_skema || "-"}</th></tr>
                    <tr><td>Nomor</td><td>:</td><th>{skemaDetail?.kode_skema || "-"}</th></tr>
                    <tr><td colSpan={2}>TUK</td><td>:</td><th>{tukName}</th></tr>
                    <tr><td colSpan={2}>Nama Assesor</td><td>:</td><th>{asesorName}</th></tr>
                    <tr><td colSpan={2}>Nama Peserta</td><td>:</td><th>{assesiDetail?.nama_peserta || "-"}</th></tr>
                    <tr><td colSpan={2}>Tanggal</td><td>:</td><th>{clientTime}</th></tr>
                  </tbody>
                </table>

                <br/>
                <div className="row">
                  <div className="col-md-12">
                    <b>Bukti Kompetensi yg relevan</b>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead>
                          <tr className="bg-gray">
                            <th>Bukti Portfolio yg relevan <button type="button" onClick={handleTambahBukti} className="btn btn-primary btn-sm ml-2">Tambah</button></th>
                            <th style={{ width: '35%' }}>Keterangan</th>
                            <th style={{ width: '10%' }}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {buktiList.length === 0 ? (
                            <tr><td colSpan={3} className="text-center text-muted">Belum ada bukti terupload. Silakan klik Tambah.</td></tr>
                          ) : (
                            buktiList.map(bukti => (
                              <tr key={bukti.id}>
                                <td style={{verticalAlign:"middle"}}>
                                  {bukti.isSaved ? (
                                    <a href={bukti.fileBase64} target="_blank" style={{color:"#337ab7", textDecoration:"underline"}}>{bukti.fileName}</a>
                                  ) : (
                                    <input type="file" accept=".jpg,.jpeg,.png,.pdf,.zip,.rar" className="form-control" onChange={(e) => handleFileUpload(bukti.id, e)} />
                                  )}
                                </td>
                                <td>
                                  {bukti.isSaved ? (
                                    bukti.keterangan
                                  ) : (
                                    <input type="text" className="form-control" placeholder="Keterangan..." value={bukti.keterangan} onChange={(e) => handleInputBukti(bukti.id, "keterangan", e.target.value)} />
                                  )}
                                </td>
                                <td align="center">
                                  <div style={{display:"flex", gap:"5px", justifyContent:"center"}}>
                                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleHapusBukti(bukti.id)}><i className="fa fa-trash"></i></button>
                                    {!bukti.isSaved && (
                                      <button type="button" className="btn btn-success btn-sm" onClick={() => handleSaveBukti(bukti.id)}><i className="fa fa-save"></i></button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                <br/>
                <table className="table table-bordered" style={{ border: "3px solid #ddd" }}>
                  <thead>
                    <tr className="bg-gray">
                      <th rowSpan={2} style={{verticalAlign:"middle"}}>Dapatkah saya ...?</th>
                      <th colSpan={2} className="text-center">Penilaian</th>
                      <th rowSpan={2} style={{ width: '25%', verticalAlign:"middle" }}>Bukti-Bukti Kompetensi</th>
                    </tr>
                    <tr className="bg-gray">
                      <th style={{ width: '80px' }} className="text-center">K</th>
                      <th style={{ width: '80px' }} className="text-center">BK</th>
                    </tr>
                  </thead>
                  <tbody>
                    
                    {/* LOOPING SOAL DINAMIS */}
                    {SOAL_ELEMENTS.map((element) => (
                      <tr key={element.id}>
                        <td>
                          <b>{element.title}</b><br/><br/>
                          <b>Kriteria unjuk kerja:</b>
                          <table style={{width:"100%"}}>
                            <tbody>
                              {element.kuks.map((kuk, i) => (
                                <tr key={i}>
                                  <td width="30px" valign="top">{kuk.split(" ")[0]}</td>
                                  <td valign="top">{kuk.substring(kuk.indexOf(" ") + 1)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                        <td align="center" style={{verticalAlign:"middle"}}>
                          <input type="radio" name={`penilaian_${element.id}`} style={{transform:"scale(1.5)"}} checked={penilaian[element.id] === 'k'} onChange={() => handleRadioChange(element.id, 'k')} />
                        </td>
                        <td align="center" style={{verticalAlign:"middle"}}>
                          <input type="radio" name={`penilaian_${element.id}`} style={{transform:"scale(1.5)"}} checked={penilaian[element.id] === 'bk'} onChange={() => handleRadioChange(element.id, 'bk')} />
                        </td>
                        <td style={{verticalAlign:"middle"}}>
                          {buktiList.filter(b => b.isSaved).length === 0 ? <span className="text-muted text-sm">Belum ada bukti tersimpan.</span> : 
                            buktiList.filter(b => b.isSaved).map((bukti, idx) => (
                              <div key={bukti.id} style={{marginBottom:"5px"}}>
                                {idx + 1}. <input type="checkbox" checked={buktiTerkait[element.id]?.[bukti.id] || false} onChange={(e) => handleCekBukti(element.id, bukti.id, e.target.checked)} /> &nbsp;
                                <a href={bukti.fileBase64} target="_blank" style={{color:"#337ab7"}}>{bukti.keterangan} [{bukti.fileName}]</a>
                              </div>
                            ))
                          }
                        </td>
                      </tr>
                    ))}

                  </tbody>
                </table>
                <br/>
                
                <div className="row">
                  <div className="col-md-12">
                    <b>Note ***) diisi oleh Assesor</b>
                    <table className="table table-bordered" style={{ border: "3px solid #ddd" }}>
                      <tbody>
                        <tr className="bg-gray">
                          <td width="50%"><b>Rekomendasi</b></td>
                          <td colSpan={2}><b>Pemohon **)</b></td>
                        </tr>
                        <tr>
                          <td>
                            <div style={{ left: "5px", bottom: "5px" }}>
                              1. Assesment <br/><br/>
                              <label className="radio-inline"><input type="radio" disabled /> Dilanjutkan</label>
                              <label className="radio-inline"><input type="radio" disabled /> Tidak Dilanjutkan</label>
                            </div>
                            <br />
                            <div style={{ left: "5px", bottom: "5px" }}>
                              2. Proses Assesmen dilanjutkan melalui jalur <br/><br/>
                              <label className="radio-inline"><input type="radio" disabled /> Uji Kompetensi</label>
                              <label className="radio-inline"><input type="radio" disabled /> Assesmen Portfolio</label>
                            </div>
                          </td>
                          <td valign="top">Nama</td>
                          <td>
                            <b>{assesiDetail?.nama_peserta || "-"}</b>
                            <br /><br />
                            TTD :
                            <br />
                            {ttdAsesiImg ? (
                              <img src={ttdAsesiImg} alt="TTD Peserta" width="100" style={{ border: "1px solid #ccc", padding: "4px", backgroundColor: "#fff" }} />
                            ) : (
                              <span className="text-danger">Belum Tanda Tangan</span>
                            )}
                            <p style={{ marginTop: "8px" }}>Tgl : {clientDate}</p>
                            
                            <label style={{ fontWeight: "normal" }}>
                              <input type="checkbox" checked={ttdAsesiChecked} onChange={(e) => setTtdAsesiChecked(e.target.checked)} /> Menyetujui permohonan
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td rowSpan={4}>
                            Catatan<br />
                            <textarea className="form-control" rows={4} disabled></textarea>
                          </td>
                        </tr>
                        <tr className="bg-gray">
                          <td colSpan={2}><b>Admin LSP/Assesor ***)</b></td>
                        </tr>
                        <tr>
                          <td valign="top">Nama:</td>
                          <td>
                            <b>{asesorName}</b>
                            <br /><br />
                            TTD:<br />
                            <p className="text-muted">Akan diisi oleh asesor</p>
                          </td>
                        </tr>
                        <tr>
                          <td>No. Registrasi</td>
                          <td><b>MET.000.002124 2021</b></td>
                        </tr>
                        <tr>
                          <td colSpan={3} align="center">
                            <br />
                            Untuk Simpan Scroll ke <button type="button" onClick={() => window.scrollTo(0,0)} className="btn btn-app"><i className="fa fa-arrow-up fa-2x"></i> Atas</button> klik tombol Simpan
                            <br /><br />
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