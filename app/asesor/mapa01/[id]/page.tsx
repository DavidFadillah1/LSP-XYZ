"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Mapa01Page() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [asesorOptions, setAsesorOptions] = useState<any[]>([]);
  const [eventData, setEventData] = useState<any>(null);
  const [skemaData, setSkemaData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Toggle L / TL (Langsung / Tidak Langsung)
  const [mapaType, setMapaType] = useState("TL");

  // State Form Data
  const [formData, setFormData] = useState({
    c1_1_1: false, c1_1_2: false, c1_1_3: false, c1_1_4: false, c1_1_5: false,
    c1_1_6: true, c1_1_7: false, c1_1_8: false, c1_1_9: false,
    c1_1_10: false, c1_1_11: false, c1_1_10x: false, c1_1_11x: false,
    c1_1_12: false, c1_1_12_emotion: "",
    c1_1_13: false, c1_1_13_emotion: "",
    c1_1_14: false, c1_1_14_emotion: "",
    c1_1_15: false, c1_1_15_text: "Lembaga Sertifikasi",
    c1_1_16: false, c1_1_16_text: "Organisasi Pelatihan",
    c1_1_17: false, c1_1_17_text: "Asesor Perusahaan",
    c1_1_18: false, c1_1_18_text: "Manajer sertifikasi LSP",
    c1_1_19: false, c1_1_19_text: "Master Asesor/Master Trainer/Lead Asesor Kompetensi",
    c1_1_20: false, c1_1_20_text: "Manajer Pelatihan Lembaga Training terakreditasi/Lembaga Training terdaftar",
    c1_1_21: false, c1_1_21_text: "Manajer atau supervisor ditempat kerja",
    c1_1_22: false, c1_1_22_text: "Standar Kompetensi:",
    c1_1_23: false, c1_1_23_text: "Kriteria asesmen dari kurikulum pelatihan",
    c1_1_24: false, c1_1_24_text: "Spesifikasi kinerja suatu Perusahaan atau industri",
    c1_1_25: false, c1_1_25_text: "Spesifikasi Produk",
    c1_1_26: false, c1_1_26_text: "Pedoman Khusus",
    c_3_1a: "", c_3_1a_text: "",
    c_3_1b: "", c_3_1b_text: "",
    c_3_2: "", c_3_2_text: "",
    c_3_3: "", c_3_3_text: "",
    c_3_4: "", c_3_4_text: "",
    man_sertifikasi: "", tgl_ttd_man_sertifikasi: new Date().toISOString().substring(0, 10),
    mas_assesor: "", tgl_ttd_mas_assesor: new Date().toISOString().substring(0, 10),
    man_pelatihan: "", tgl_ttd_man_pelatihan: new Date().toISOString().substring(0, 10),
    supervisor_kerja: "", tgl_ttd_supervisor_kerja: new Date().toISOString().substring(0, 10),
    penyusun1: "", tgl_ttd_penyusun1: new Date().toISOString().substring(0, 10),
    penyusun2: "", tgl_ttd_penyusun2: new Date().toISOString().substring(0, 10),
    validator1: "", tgl_ttd_validator1: new Date().toISOString().substring(0, 10),
    validator2: "", tgl_ttd_validator2: new Date().toISOString().substring(0, 10)
  });

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // PERBAIKAN: Ambil email dari sesi Supabase, jika telat ambil dari Local Storage
      const { data: { user: authUser } } = await supabase.auth.getUser();
      let userEmail = authUser?.email || localStorage.getItem("userEmail");
      
      if (userEmail) {
        const { data: userData } = await supabase.from("users").select("*").eq("email", userEmail).single();
        setCurrentUser(userData || { email: userEmail, nama: "Assesor" });
      }

      const { data: listAsesor } = await supabase.from("users").select("id, nama").eq("role", "asesor");
      if (listAsesor) setAsesorOptions(listAsesor);

      if (eventId) {
        const { data: evt } = await supabase.from("event").select("*").eq("id", eventId).single();
        if (evt) {
          setEventData(evt);
          const { data: jadwal } = await supabase.from("event_skema_jadwal").select("skema_id").eq("event_id", evt.id).limit(1).single();
          if (jadwal && jadwal.skema_id) {
            const { data: skm } = await supabase.from("skema").select("*").eq("id", jadwal.skema_id).single();
            setSkemaData(skm);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const toggleMapaType = () => {
    setMapaType((prev) => (prev === "TL" ? "L" : "TL"));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    window.close(); // Menutup tab browser jika dibuka di tab baru
    router.back(); // Fallback jika tidak dibuka di tab baru
  };

  // PERBAIKAN: Fungsi Logout membersihkan sesi dan kembali ke login
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await supabase.auth.signOut();
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="skin-blue layout-top-nav" style={{ minHeight: "100vh", backgroundColor: "#ecf0f5" }}>
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/adminlte.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
      
      <style dangerouslySetInnerHTML={{__html: `
        .mapa { width: 95%; border-width: 1px; border-color: blue; color: black; padding:2px 5px;}
        .btn-app { border-radius: 3px; position: relative; padding: 15px 5px; margin: 0 10px 10px 0; min-width: 80px; height: 60px; text-align: center; color: #666; border: 1px solid #ddd; background-color: #f4f4f4; font-size: 12px; }
        .btn-app > .fa { font-size: 20px; display: block; }
        .form-check-inline { display: inline-block; margin-left: 5px; }
        .form-check-inline input { margin-right: 3px; }
        .form-check-inline label { font-weight: normal; margin-right: 10px; }
        @media print {
          .main-header, .btn-app, footer { display: none !important; }
          .box { border: none !important; box-shadow: none !important; }
          body { background-color: white !important; }
        }
      `}} />

      <header className="main-header">
        <nav className="navbar navbar-static-top">
          <div className="container-fluid">
            <div className="navbar-header">
              <Link href="/asesor/dashboard" className="navbar-brand"><b>lspxyz.com</b></Link>
            </div>
            <div className="collapse navbar-collapse pull-left">
              <ul className="nav navbar-nav">
                <li><Link href="/home">Beranda</Link></li>
                <li><Link href="/asesor/dashboard">Assesor</Link></li>
              </ul>
            </div>
            <div className="navbar-custom-menu">
              <ul className="nav navbar-nav">
                <li>
                  <a href="#" onClick={handleLogout} className="btn btn-danger" style={{ color: "white", padding: "10px 15px", margin: "5px" }}>
                    Log Out {currentUser?.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <div className="content-wrapper" style={{ minHeight: "614px", backgroundColor: "transparent" }}>
        <div className="container-fluid" style={{ padding: "20px 30px" }}>
          
          <div className="row" style={{ marginTop: "40px" }}>
            <div className="col-md-12">
              <div className="box box-primary">
                <div className="box-header with-border">
                  <h3 className="box-title">
                    MAPA-01 
                    <span id="state" className="text-primary" style={{ marginLeft: "10px" }}>
                      <i className={`fa ${mapaType === 'TL' ? 'fa-eye-slash' : 'fa-eye'}`}></i> ({mapaType})
                    </span>
                  </h3>
                </div>
                <div className="box-body">
                  <button type="button" className="btn btn-app" onClick={handlePrint}><i className="fa fa-print fa-2x"></i>Cetak</button>
                  <button type="button" className="btn btn-app" onClick={toggleMapaType}>
                    <i className={`fa ${mapaType === 'TL' ? 'fa-eye' : 'fa-eye-slash'}`}></i> 
                    ({mapaType === 'TL' ? 'L' : 'TL'})
                  </button>
                  <button type="button" className="btn btn-app" onClick={handleClose}><i className="fa fa-close fa-2x"></i>Tutup</button>
                </div>
              </div>
            </div>
          </div>

          <form id="myForm" style={{ marginBottom: "50px" }}>
            <div id="mapa01">
              <div className="box box-primary">
                <div className="box-header text-center" style={{ borderBottom: "1px solid #f4f4f4", paddingBottom:"15px" }}>
                  <h2 className="box-title" style={{ fontSize:"18px" }}><b>FR.MAPA.01-MERENCANAKAN AKTIVITAS DAN PROSES ASESMEN</b></h2>
                </div>
                <div className="box-body">
                  
                  {/* TABEL SKEMA */}
                  <table border={1} style={{ width: "100%", marginBottom:"20px" }}>
                    <thead>
                      <tr>
                        <td valign="top" rowSpan={2} width="30%" style={{ padding: "8px" }}>Skema Sertifikasi/ Klaster Asesmen</td>
                        <td width="10%" style={{ padding: "8px" }}>Judul</td>
                        <td width="2%" className="text-center">:</td>
                        <th style={{ padding: "8px" }}>{skemaData?.judul_skema || "Pelaksanaan Proses Pinjaman"}</th>
                      </tr>
                      <tr>
                        <td style={{ padding: "8px" }}>Nomor</td>
                        <td className="text-center">:</td>
                        <th style={{ padding: "8px" }}>{skemaData?.kode_skema || "SKM/1995/00011/3/2021/1"}</th>
                      </tr>
                    </thead>
                  </table>

                  {/* BAB 1: Layout persis HTML asli tanpa label bungkus */}
                  <table border={1} style={{ width: "100%", marginBottom:"20px" }}>
                    <tbody>
                      <tr>
                        <td colSpan={3} style={{ padding: "8px" }}><b>&nbsp;1. Menentukan Pendekatan Asesmen</b></td>
                      </tr>
                      <tr>
                        <td rowSpan={19} valign="top" width="5%" className="text-center" style={{ padding: "8px" }}>1.1</td>
                        <td rowSpan={5} valign="top" width="20%" style={{ padding: "8px" }}>Asesi</td>
                        <td style={{ padding: "8px" }}>
                          <input type="checkbox" name="c1_1_1" checked={formData.c1_1_1} onChange={handleInputChange} style={{ marginRight: "8px" }} />
                          Hasil pelatihan dan/atau pendidikan, dimana Kurikulum dan fasilitas praktek mampu telusur terhadap standar kompetensi
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "8px" }}>
                          <input type="checkbox" name="c1_1_2" checked={formData.c1_1_2} onChange={handleInputChange} style={{ marginRight: "8px" }} />
                          Hasil pelatihan dan/atau pendidikan, dimana kurikulum belum berbasis kompetensi.
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "8px" }}>
                          <input type="checkbox" name="c1_1_3" checked={formData.c1_1_3} onChange={handleInputChange} style={{ marginRight: "8px" }} />
                          Pekerja berpengalaman, dimana berasal dari industri/tempat kerja yang dalam operasionalnya mampu telusur dengan standar kompetensi
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "8px" }}>
                          <input type="checkbox" name="c1_1_4" checked={formData.c1_1_4} onChange={handleInputChange} style={{ marginRight: "8px" }} />
                          Pekerja berpengalaman, dimana berasal dari industri/tempat kerja yang dalam operasionalnya belum berbasis kompetensi
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "8px" }}>
                          <input type="checkbox" name="c1_1_5" checked={formData.c1_1_5} onChange={handleInputChange} style={{ marginRight: "8px" }} />
                          Pelatihan / belajar mandiri atau otodidak.
                        </td>
                      </tr>

                      {/* Tujuan Asesmen */}
                      <tr>
                        <td rowSpan={4} valign="top" style={{ padding: "8px" }}>Tujuan Asesmen</td>
                        <td style={{ padding: "8px" }}><input type="checkbox" name="c1_1_6" checked={formData.c1_1_6} onChange={handleInputChange} style={{ marginRight: "8px" }} />Sertifikasi</td>
                      </tr>
                      <tr><td style={{ padding: "8px" }}><input type="checkbox" name="c1_1_7" checked={formData.c1_1_7} onChange={handleInputChange} style={{ marginRight: "8px" }} />Pengakuan Kompetensi Terkini (PKT)</td></tr>
                      <tr><td style={{ padding: "8px" }}><input type="checkbox" name="c1_1_8" checked={formData.c1_1_8} onChange={handleInputChange} style={{ marginRight: "8px" }} />Rekognisi Pembelajaran Lampau (RPL)</td></tr>
                      <tr><td style={{ padding: "8px" }}><input type="checkbox" name="c1_1_9" checked={formData.c1_1_9} onChange={handleInputChange} style={{ marginRight: "8px" }} />Lainnya</td></tr>

                      {/* Konteks Asesmen */}
                      <tr>
                        <td valign="top" style={{ padding: "8px" }}>Konteks Asesmen:</td>
                        <td style={{ padding: "0" }}>
                          <table border={1} style={{ width: "100%", borderStyle: "hidden" }}>
                            <tbody>
                              <tr>
                                <td width="30%" style={{ padding: "8px" }}>&nbsp;Lingkungan</td>
                                <td style={{ padding: "8px" }}>
                                  &nbsp;<input type="checkbox" name="c1_1_10" checked={formData.c1_1_10} onChange={handleInputChange} /> Tempat Kerja Nyata
                                  &nbsp;&nbsp;<input type="checkbox" name="c1_1_11" checked={formData.c1_1_11} onChange={handleInputChange} /> Tempat Kerja Simulasi
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "8px" }}>&nbsp;Peluang Mengumpulkan Bukti dalam sejumlah situasi</td>
                                <td style={{ padding: "8px" }}>
                                  &nbsp;<input type="checkbox" name="c1_1_10x" checked={formData.c1_1_10x} onChange={handleInputChange} /> Tersedia
                                  &nbsp;&nbsp;<input type="checkbox" name="c1_1_11x" checked={formData.c1_1_11x} onChange={handleInputChange} /> Terbatas
                                </td>
                              </tr>
                              <tr>
                                <td rowSpan={3} valign="top" style={{ padding: "8px" }}>&nbsp;Peluang untuk mengumpulkan bukti dalam sejumlah situasi</td>
                                <td style={{ padding: "8px" }}>
                                  &nbsp;<input type="checkbox" name="c1_1_12" checked={formData.c1_1_12} onChange={handleInputChange} /> Bukti Mendukung Asesmen :
                                  <div className="form-check form-check-inline">
                                    <input type="radio" name="c1_1_12_emotion" id="h1" value="happy" checked={formData.c1_1_12_emotion === 'happy'} onChange={handleInputChange} /> <label htmlFor="h1">😃 Happy</label>
                                    <input type="radio" name="c1_1_12_emotion" id="n1" value="normal" checked={formData.c1_1_12_emotion === 'normal'} onChange={handleInputChange} /> <label htmlFor="n1">😐 Normal</label>
                                    <input type="radio" name="c1_1_12_emotion" id="s1" value="sad" checked={formData.c1_1_12_emotion === 'sad'} onChange={handleInputChange} /> <label htmlFor="s1">😢 Sad</label>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "8px" }}>
                                  &nbsp;<input type="checkbox" name="c1_1_13" checked={formData.c1_1_13} onChange={handleInputChange} /> Aktivitas kerja di tempat kerja Asesi:
                                  <div className="form-check form-check-inline">
                                    <input type="radio" name="c1_1_13_emotion" id="h2" value="happy" checked={formData.c1_1_13_emotion === 'happy'} onChange={handleInputChange} /> <label htmlFor="h2">😃 Happy</label>
                                    <input type="radio" name="c1_1_13_emotion" id="n2" value="normal" checked={formData.c1_1_13_emotion === 'normal'} onChange={handleInputChange} /> <label htmlFor="n2">😐 Normal</label>
                                    <input type="radio" name="c1_1_13_emotion" id="s2" value="sad" checked={formData.c1_1_13_emotion === 'sad'} onChange={handleInputChange} /> <label htmlFor="s2">😢 Sad</label>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td style={{ padding: "8px" }}>
                                  &nbsp;<input type="checkbox" name="c1_1_14" checked={formData.c1_1_14} onChange={handleInputChange} /> Kegiatan Pembelajaran:
                                  <div className="form-check form-check-inline">
                                    <input type="radio" name="c1_1_14_emotion" id="h3" value="happy" checked={formData.c1_1_14_emotion === 'happy'} onChange={handleInputChange} /> <label htmlFor="h3">😃 Happy</label>
                                    <input type="radio" name="c1_1_14_emotion" id="n3" value="normal" checked={formData.c1_1_14_emotion === 'normal'} onChange={handleInputChange} /> <label htmlFor="n3">😐 Normal</label>
                                    <input type="radio" name="c1_1_14_emotion" id="s3" value="sad" checked={formData.c1_1_14_emotion === 'sad'} onChange={handleInputChange} /> <label htmlFor="s3">😢 Sad</label>
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td rowSpan={3} valign="top" style={{ padding: "8px" }}>&nbsp;Siapa yang melakukan asesmen</td>
                                <td style={{ padding: "8px" }}>&nbsp;<input type="checkbox" name="c1_1_15" checked={formData.c1_1_15} onChange={handleInputChange} /> <input type="text" className="mapa" name="c1_1_15_text" value={formData.c1_1_15_text} onChange={handleInputChange} /></td>
                              </tr>
                              <tr><td style={{ padding: "8px" }}>&nbsp;<input type="checkbox" name="c1_1_16" checked={formData.c1_1_16} onChange={handleInputChange} /> <input type="text" className="mapa" name="c1_1_16_text" value={formData.c1_1_16_text} onChange={handleInputChange} /></td></tr>
                              <tr><td style={{ padding: "8px" }}>&nbsp;<input type="checkbox" name="c1_1_17" checked={formData.c1_1_17} onChange={handleInputChange} /> <input type="text" className="mapa" name="c1_1_17_text" value={formData.c1_1_17_text} onChange={handleInputChange} /></td></tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>

                      {/* Konfirmasi dengan orang yang relevan */}
                      <tr>
                        <td rowSpan={4} valign="top" style={{ padding: "8px" }}>Konfirmasi dengan orang yang relevan</td>
                        <td style={{ padding: "8px" }}><input type="checkbox" name="c1_1_18" checked={formData.c1_1_18} onChange={handleInputChange} /> <input type="text" className="mapa" name="c1_1_18_text" value={formData.c1_1_18_text} onChange={handleInputChange} /></td>
                      </tr>
                      <tr><td style={{ padding: "8px" }}><input type="checkbox" name="c1_1_19" checked={formData.c1_1_19} onChange={handleInputChange} /> <input type="text" className="mapa" name="c1_1_19_text" value={formData.c1_1_19_text} onChange={handleInputChange} /></td></tr>
                      <tr><td style={{ padding: "8px" }}><input type="checkbox" name="c1_1_20" checked={formData.c1_1_20} onChange={handleInputChange} /> <input type="text" className="mapa" name="c1_1_20_text" value={formData.c1_1_20_text} onChange={handleInputChange} /></td></tr>
                      <tr><td style={{ padding: "8px" }}><input type="checkbox" name="c1_1_21" checked={formData.c1_1_21} onChange={handleInputChange} /> <input type="text" className="mapa" name="c1_1_21_text" value={formData.c1_1_21_text} onChange={handleInputChange} /></td></tr>

                      {/* Standar Industri */}
                      <tr>
                        <td rowSpan={5} valign="top" style={{ padding: "8px" }}>Standar Industri atau Tempat Kerja</td>
                        <td style={{ padding: "8px" }}><input type="checkbox" name="c1_1_22" checked={formData.c1_1_22} onChange={handleInputChange} /> <input type="text" className="mapa" name="c1_1_22_text" value={formData.c1_1_22_text} onChange={handleInputChange} /></td>
                      </tr>
                      <tr><td style={{ padding: "8px" }}><input type="checkbox" name="c1_1_23" checked={formData.c1_1_23} onChange={handleInputChange} /> <input type="text" className="mapa" name="c1_1_23_text" value={formData.c1_1_23_text} onChange={handleInputChange} /></td></tr>
                      <tr><td style={{ padding: "8px" }}><input type="checkbox" name="c1_1_24" checked={formData.c1_1_24} onChange={handleInputChange} /> <input type="text" className="mapa" name="c1_1_24_text" value={formData.c1_1_24_text} onChange={handleInputChange} /></td></tr>
                      <tr><td style={{ padding: "8px" }}><input type="checkbox" name="c1_1_25" checked={formData.c1_1_25} onChange={handleInputChange} /> <input type="text" className="mapa" name="c1_1_25_text" value={formData.c1_1_25_text} onChange={handleInputChange} /></td></tr>
                      <tr><td style={{ padding: "8px" }}><input type="checkbox" name="c1_1_26" checked={formData.c1_1_26} onChange={handleInputChange} /> <input type="text" className="mapa" name="c1_1_26_text" value={formData.c1_1_26_text} onChange={handleInputChange} /></td></tr>
                    </tbody>
                  </table>

                  <table border={1} style={{ width: "100%", marginBottom:"20px" }}>
                    <tbody>
                      <tr>
                        <td colSpan={3} style={{ padding: "8px" }}><b>&nbsp;2. Mempersiapkan Rencana Asesmen</b></td>
                      </tr>
                    </tbody>
                  </table>

                  <table border={1} style={{ width: "100%", marginBottom:"20px" }}>
                    <tbody>
                      <tr>
                        <td colSpan={3} style={{ padding: "8px" }}><b>&nbsp;3. Mengindentifikasi Persyaratan Modifikasi Kontekstualisasi:</b></td>
                      </tr>
                      <tr>
                        <td rowSpan={2} valign="top" className="text-center" style={{ padding: "8px", width: "5%" }}>3.1</td>
                        <td valign="top" style={{ padding: "8px", width: "35%" }}>a. Karakteristik Kandidat</td>
                        <td style={{ padding: "8px" }}>
                          <div className="form-check-inline" style={{ marginBottom:"10px" }}>
                            <label><input type="radio" name="c_3_1a" value="ada" checked={formData.c_3_1a === 'ada'} onChange={handleInputChange}/> Ada</label>
                            <label><input type="radio" name="c_3_1a" value="tidak_ada" checked={formData.c_3_1a === 'tidak_ada'} onChange={handleInputChange}/> Tidak Ada</label>
                          </div>
                          <br/>
                          <label>* Jika Ada, tuliskan</label>
                          <input type="text" className="form-control input-sm" name="c_3_1a_text" value={formData.c_3_1a_text} onChange={handleInputChange}/>
                        </td>
                      </tr>
                      <tr>
                        <td valign="top" style={{ padding: "8px" }}>b. Kebutuhan kontekstualisasi terkait tempat kerja</td>
                        <td style={{ padding: "8px" }}>
                          <div className="form-check-inline" style={{ marginBottom:"10px" }}>
                            <label><input type="radio" name="c_3_1b" value="ada" checked={formData.c_3_1b === 'ada'} onChange={handleInputChange}/> Ada</label>
                            <label><input type="radio" name="c_3_1b" value="tidak_ada" checked={formData.c_3_1b === 'tidak_ada'} onChange={handleInputChange}/> Tidak Ada</label>
                          </div>
                          <br/>
                          <label>* Jika Ada, tuliskan</label>
                          <input type="text" className="form-control input-sm" name="c_3_1b_text" value={formData.c_3_1b_text} onChange={handleInputChange}/>
                        </td>
                      </tr>
                      <tr>
                        <td valign="top" className="text-center" style={{ padding: "8px" }}>3.2</td>
                        <td valign="top" style={{ padding: "8px" }}>Saran yang diberikan oleh paket pelatihan atau pengembang pelatihan</td>
                        <td style={{ padding: "8px" }}>
                          <div className="form-check-inline" style={{ marginBottom:"10px" }}>
                            <label><input type="radio" name="c_3_2" value="ada" checked={formData.c_3_2 === 'ada'} onChange={handleInputChange}/> Ada</label>
                            <label><input type="radio" name="c_3_2" value="tidak_ada" checked={formData.c_3_2 === 'tidak_ada'} onChange={handleInputChange}/> Tidak Ada</label>
                          </div>
                          <br/>
                          <label>* Jika Ada, tuliskan</label>
                          <input type="text" className="form-control input-sm" name="c_3_2_text" value={formData.c_3_2_text} onChange={handleInputChange}/>
                        </td>
                      </tr>
                      <tr>
                        <td valign="top" className="text-center" style={{ padding: "8px" }}>3.3</td>
                        <td valign="top" style={{ padding: "8px" }}>Penyesuaian perangkat asesmen terkait kebutuhan kontekstualisasi</td>
                        <td style={{ padding: "8px" }}>
                          <div className="form-check-inline" style={{ marginBottom:"10px" }}>
                            <label><input type="radio" name="c_3_4" value="ada" checked={formData.c_3_4 === 'ada'} onChange={handleInputChange}/> Ada</label>
                            <label><input type="radio" name="c_3_4" value="tidak_ada" checked={formData.c_3_4 === 'tidak_ada'} onChange={handleInputChange}/> Tidak Ada</label>
                          </div>
                          <br/>
                          <label>* Jika Ada, tuliskan</label>
                          <input type="text" className="form-control input-sm" name="c_3_4_text" value={formData.c_3_4_text} onChange={handleInputChange}/>
                        </td>
                      </tr>
                      <tr>
                        <td valign="top" className="text-center" style={{ padding: "8px" }}>3.4</td>
                        <td valign="top" style={{ padding: "8px" }}>Peluang untuk kegiatan asesmen terintegrasi dan mencatat setiap perubahan yang diperlukan</td>
                        <td style={{ padding: "8px" }}>
                          <div className="form-check-inline" style={{ marginBottom:"10px" }}>
                            <label><input type="radio" name="c_3_3" value="ada" checked={formData.c_3_3 === 'ada'} onChange={handleInputChange}/> Ada</label>
                            <label><input type="radio" name="c_3_3" value="tidak_ada" checked={formData.c_3_3 === 'tidak_ada'} onChange={handleInputChange}/> Tidak Ada</label>
                          </div>
                          <br/>
                          <label>* Jika Ada, tuliskan</label>
                          <input type="text" className="form-control input-sm" name="c_3_3_text" value={formData.c_3_3_text} onChange={handleInputChange}/>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* BAB 4 KONFIRMASI */}
                  <div style={{ marginTop:"30px", marginBottom:"10px" }}><b>Konfirmasi dengan Orang yg Relevan</b></div>
                  <table border={1} style={{ width: "100%", marginBottom:"30px", borderCollapse:"collapse" }}>
                    <thead>
                      <tr className="bg-gray text-center">
                        <th style={{ padding: "8px" }}>Orang yang relevan</th>
                        <th style={{ padding: "8px" }}>Nama / MET (No registrasi)</th>
                        <th style={{ padding: "8px" }}>Tanggal</th>
                        <th style={{ padding: "8px" }}>Tanda Tangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: "8px" }}>Manajer sertifikasi LSP</td>
                        <td style={{ padding: "8px" }}>
                          <select className="form-control input-sm" name="man_sertifikasi" value={formData.man_sertifikasi} onChange={handleInputChange}>
                            <option value="">Pilih Assesor</option>
                            {asesorOptions.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "8px" }}><input type="date" className="form-control input-sm" name="tgl_ttd_man_sertifikasi" value={formData.tgl_ttd_man_sertifikasi} onChange={handleInputChange}/></td>
                        <td align="center" style={{ padding: "8px" }}><p className="text-muted">N/A</p></td>
                      </tr>
                      <tr>
                        <td style={{ padding: "8px" }}>Master Asesor / Lead Asesor</td>
                        <td style={{ padding: "8px" }}>
                          <select className="form-control input-sm" name="mas_assesor" value={formData.mas_assesor} onChange={handleInputChange}>
                            <option value="">Pilih Assesor</option>
                            {asesorOptions.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "8px" }}><input type="date" className="form-control input-sm" name="tgl_ttd_mas_assesor" value={formData.tgl_ttd_mas_assesor} onChange={handleInputChange}/></td>
                        <td align="center" style={{ padding: "8px" }}><p className="text-muted">N/A</p></td>
                      </tr>
                      <tr>
                        <td style={{ padding: "8px" }}>Manajer pelatihan Lembaga Training</td>
                        <td style={{ padding: "8px" }}>
                          <select className="form-control input-sm" name="man_pelatihan" value={formData.man_pelatihan} onChange={handleInputChange}>
                            <option value="">Pilih Assesor</option>
                            {asesorOptions.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "8px" }}><input type="date" className="form-control input-sm" name="tgl_ttd_man_pelatihan" value={formData.tgl_ttd_man_pelatihan} onChange={handleInputChange}/></td>
                        <td align="center" style={{ padding: "8px" }}><p className="text-muted">N/A</p></td>
                      </tr>
                      <tr>
                        <td style={{ padding: "8px" }}>Manajer atau supervisor ditempat kerja</td>
                        <td style={{ padding: "8px" }}>
                          <select className="form-control input-sm" name="supervisor_kerja" value={formData.supervisor_kerja} onChange={handleInputChange}>
                            <option value="">Pilih Assesor</option>
                            {asesorOptions.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "8px" }}><input type="date" className="form-control input-sm" name="tgl_ttd_supervisor_kerja" value={formData.tgl_ttd_supervisor_kerja} onChange={handleInputChange}/></td>
                        <td align="center" style={{ padding: "8px" }}><p className="text-muted">N/A</p></td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ marginTop:"10px", marginBottom:"10px" }}><b>PENYUSUN DAN VALIDATOR</b></div>
                  <table border={1} style={{ width: "100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr className="bg-gray text-center">
                        <th style={{ padding: "8px" }}>STATUS</th>
                        <th style={{ padding: "8px" }}>NO</th>
                        <th style={{ padding: "8px" }}>Nama / MET (No registrasi)</th>
                        <th style={{ padding: "8px" }}>Tanggal</th>
                        <th style={{ padding: "8px" }}>Tanda Tangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td rowSpan={2} align="center" style={{ padding: "8px" }}><b>PENYUSUN</b></td>
                        <td align="center" style={{ padding: "8px" }}>1</td>
                        <td style={{ padding: "8px" }}>
                          <select className="form-control input-sm" name="penyusun1" value={formData.penyusun1} onChange={handleInputChange}>
                            <option value="">Pilih Assesor</option>
                            {asesorOptions.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "8px" }}><input type="date" className="form-control input-sm" name="tgl_ttd_penyusun1" value={formData.tgl_ttd_penyusun1} onChange={handleInputChange}/></td>
                        <td align="center" style={{ padding: "8px" }}><p className="text-muted">N/A</p></td>
                      </tr>
                      <tr>
                        <td align="center" style={{ padding: "8px" }}>2</td>
                        <td style={{ padding: "8px" }}>
                          <select className="form-control input-sm" name="penyusun2" value={formData.penyusun2} onChange={handleInputChange}>
                            <option value="">Pilih Assesor</option>
                            {asesorOptions.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "8px" }}><input type="date" className="form-control input-sm" name="tgl_ttd_penyusun2" value={formData.tgl_ttd_penyusun2} onChange={handleInputChange}/></td>
                        <td align="center" style={{ padding: "8px" }}><p className="text-muted">N/A</p></td>
                      </tr>
                      <tr>
                        <td rowSpan={2} align="center" style={{ padding: "8px" }}><b>VALIDATOR</b></td>
                        <td align="center" style={{ padding: "8px" }}>1</td>
                        <td style={{ padding: "8px" }}>
                          <select className="form-control input-sm" name="validator1" value={formData.validator1} onChange={handleInputChange}>
                            <option value="">Pilih Assesor</option>
                            {asesorOptions.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "8px" }}><input type="date" className="form-control input-sm" name="tgl_ttd_validator1" value={formData.tgl_ttd_validator1} onChange={handleInputChange}/></td>
                        <td align="center" style={{ padding: "8px" }}><p className="text-muted">N/A</p></td>
                      </tr>
                      <tr>
                        <td align="center" style={{ padding: "8px" }}>2</td>
                        <td style={{ padding: "8px" }}>
                          <select className="form-control input-sm" name="validator2" value={formData.validator2} onChange={handleInputChange}>
                            <option value="">Pilih Assesor</option>
                            {asesorOptions.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "8px" }}><input type="date" className="form-control input-sm" name="tgl_ttd_validator2" value={formData.tgl_ttd_validator2} onChange={handleInputChange}/></td>
                        <td align="center" style={{ padding: "8px" }}><p className="text-muted">N/A</p></td>
                      </tr>
                    </tbody>
                  </table>

                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}