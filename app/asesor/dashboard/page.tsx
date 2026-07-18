"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AssesorDashboard() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("aktif");
  const [loginTime, setLoginTime] = useState("");

  const [selectedEventDetails, setSelectedEventDetails] = useState<any>(null);
  const [pesertaList, setPesertaList] = useState<any[] | null>(null);
  const [isLoadingAssesi, setIsLoadingAssesi] = useState(false);
  const [catatan, setCatatan] = useState<Record<string, string>>({});
  const [filledForms, setFilledForms] = useState<Record<string, boolean>>({});

  const [showPersetujuanModal, setShowPersetujuanModal] = useState(false);
  const [selectedAssesiForModal, setSelectedAssesiForModal] = useState<any>(null);

  useEffect(() => {
    setLoginTime(new Date().toLocaleString('id-ID'));
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
    script.async = true;
    document.body.appendChild(script);

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) return router.push("/login");

      const { data: userData, error: userError } = await supabase.from("users").select("*").eq("email", userEmail).single();
      if (userError || !userData) {
        localStorage.clear();
        return router.push("/login");
      }
      setCurrentUser(userData);

      const { data: jadwalData } = await supabase.from("event_skema_jadwal").select("*").eq("assesor_id", userData.id);
      
      if (jadwalData && jadwalData.length > 0) {
        const eventIds = [...new Set(jadwalData.map(j => j.event_id).filter(Boolean))];

        let eventsData: any[] = [];
        if (eventIds.length > 0) {
          const { data } = await supabase.from("event").select("*").in("id", eventIds);
          eventsData = data || [];
        }

        const { data: tuksData } = await supabase.from("tuk").select("*");
        const { data: skemasData } = await supabase.from("skema").select("*");

        const mappedEvents = eventsData.map(evt => {
          const jadwal = jadwalData.find(j => j.event_id === evt.id);
          const tuk = tuksData?.find(t => t.id === evt?.tuk_id);
          const skema = skemasData?.find(s => s.id === jadwal?.skema_id);

          return {
            event_id: evt?.id || null,
            tanggal: evt?.tanggal_mulai || "",
            nama_event: evt?.nama_event || "Event Tidak Ditemukan",
            tipe_event: evt?.tipe_event || "1",
            tuk_nama: tuk?.nama_tuk || "Belum dipilih",
            skema_nama: skema ? `[${skema.kode_skema}] ${skema.judul_skema}` : "Belum dipilih",
          };
        });

        const today = new Date().toISOString().split('T')[0];
        const active = mappedEvents.filter(e => e.tanggal >= today || !e.tanggal);
        const past = mappedEvents.filter(e => e.tanggal < today && e.tanggal);

        setActiveEvents(active);
        setPastEvents(past);

        if (active.length === 0 && past.length > 0) setActiveTab("tutup");

        const savedEventId = localStorage.getItem("openAssesiForEvent");
        if (savedEventId) {
          const targetEvt = mappedEvents.find(e => e.event_id === savedEventId);
          if (targetEvt) {
            setSelectedEventDetails(targetEvt);
            const { data: pesertaData } = await supabase.from("assesi").select("*").eq("sertifikasi_event_id", savedEventId).order('id', { ascending: true });
            
            if (pesertaData) {
              setPesertaList(pesertaData);
              const initialCatatan: Record<string, string> = {};
              const forms: Record<string, boolean> = {};
              pesertaData.forEach(p => {
                initialCatatan[p.id] = p.catatan_assesor || "";
                forms[`ia08_${p.id}`] = !!localStorage.getItem(`ia08_selected_${p.id}`);
                forms[`ia09_${p.id}`] = !!localStorage.getItem(`ia09_filled_${p.id}`);
                forms[`ak02_${p.id}`] = !!localStorage.getItem(`ak02_filled_${p.id}`);
              });
              setCatatan(initialCatatan);
              setFilledForms(forms);
              setTimeout(() => {
                document.getElementById("daftar-assesi-section")?.scrollIntoView({ behavior: "smooth" });
              }, 500);
            }
          }
        }
      } else {
        setActiveEvents([]);
        setPastEvents([]);
      }
    } catch (err) {
      console.error("Gagal memuat dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.clear();
    router.push("/login");
  };

  const handleViewAssesi = async (eventId: string) => {
    setIsLoadingAssesi(true);
    try {
      localStorage.setItem("openAssesiForEvent", eventId); 
      
      const evt = activeEvents.find(e => e.event_id === eventId) || pastEvents.find(e => e.event_id === eventId);
      setSelectedEventDetails(evt);

      const { data: pesertaData, error } = await supabase.from("assesi").select("*").eq("sertifikasi_event_id", eventId).order('id', { ascending: true });
      if (error) throw error;

      setPesertaList(pesertaData || []);

      const initialCatatan: Record<string, string> = {};
      const forms: Record<string, boolean> = {};
      (pesertaData || []).forEach(p => {
        initialCatatan[p.id] = p.catatan_assesor || "";
        forms[`ia08_${p.id}`] = !!localStorage.getItem(`ia08_selected_${p.id}`);
        forms[`ia09_${p.id}`] = !!localStorage.getItem(`ia09_filled_${p.id}`);
        forms[`ak02_${p.id}`] = !!localStorage.getItem(`ak02_filled_${p.id}`);
      });
      setCatatan(initialCatatan);
      setFilledForms(forms);

      setTimeout(() => {
        document.getElementById("daftar-assesi-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } catch (error: any) {
      const Swal = (window as any).Swal;
      if(Swal) Swal.fire("Error", "Gagal memuat data peserta", "error");
    } finally {
      setIsLoadingAssesi(false);
    }
  };

  const handleSimpanCatatan = async (id: string) => {
    const Swal = (window as any).Swal;
    try {
      await supabase.from("assesi").update({ catatan_assesor: catatan[id] }).eq("id", id);
      if(Swal) Swal.fire("Sukses Update Catatan", "Catatan telah disimpan", "success");
      else alert("Catatan telah disimpan");
    } catch (err: any) {
      if(Swal) Swal.fire("Gagal Menyimpan", err.message, "error");
    }
  };

  const handlePlaceholder = (e: React.MouseEvent, namaFitur: string) => {
    e.preventDefault();
    const Swal = (window as any).Swal;
    if (Swal) {
      Swal.fire("Info", `Fitur ${namaFitur} akan segera hadir.`, "info");
    } else {
      alert(`Fitur ${namaFitur} akan segera hadir.`);
    }
  };

  const renderActionButtons = (eventId: string) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      <button onClick={() => handleViewAssesi(eventId)} className="btn btn-primary btn-sm">Assesi</button>
      <Link href={`/asesor/mapa01/${eventId}`} className="btn btn-primary btn-sm">MAPA-01</Link>
      <Link href={`/asesor/mapa02/${eventId}`} className="btn btn-primary btn-sm">MAPA-02</Link>

      <button className="btn btn-default btn-sm disabled-link" disabled style={{ color: "#333", backgroundColor: "#f4f4f4" }}>Dok TUK</button>
      <button className="btn btn-default btn-sm disabled-link" disabled style={{ color: "#333", backgroundColor: "#f4f4f4" }}>SPT</button>

      <a href="#" onClick={(e) => handlePlaceholder(e, 'Surat Tugas')} className="btn btn-success btn-sm">Surat Tugas</a>
      <a href="#" onClick={(e) => handlePlaceholder(e, 'Absensi')} className="btn btn-primary btn-sm">Absensi</a>
      <a href="#" onClick={(e) => handlePlaceholder(e, 'BA')} className="btn btn-primary btn-sm">BA</a>
      <a href="#" onClick={(e) => handlePlaceholder(e, 'FR.AK.05')} className="btn btn-primary btn-sm">FR.AK.05</a>
      <a href="#" onClick={(e) => handlePlaceholder(e, 'FR.AK.06')} className="btn btn-primary btn-sm">FR.AK.06</a>
    </div>
  );

  return (
    <div suppressHydrationWarning className={`skin-blue ${!isSidebarOpen ? 'sidebar-collapse' : ''} layout-top-nav`} style={{ height: "auto", minHeight: "100vh", backgroundColor: "#ecf0f5" }}>
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/adminlte.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{__html: `
        .swal2-popup { font-size: 1.6rem !important; }
        .btn-app { border-radius: 3px; position: relative; padding: 15px 5px; margin: 0 10px 10px 0; min-width: 80px; height: 60px; text-align: center; color: #666; border: 1px solid #ddd; background-color: #f4f4f4; font-size: 12px; }
        .btn-app > .fa { font-size: 20px; display: block; }
        hr { border-top: 1px solid #00afef; }
        .table-responsive { overflow-x: auto; }
        .btn-group .btn { margin-right: 5px; margin-bottom: 5px; }
        .disabled-link { pointer-events: none; opacity: 0.6; }
        .input-group-btn .btn { height: 34px; }
        .modal-backdrop { background-color: rgba(0,0,0,0.5); position: fixed; top:0; left:0; width:100%; height:100%; z-index: 1040; }
        .modal { z-index: 1050; display: block; overflow-y: auto; }
      `}} />

      <header className="main-header">
        <nav className="navbar navbar-static-top">
          <div className="container-fluid">
            <div className="navbar-header">
              <Link href="/asesor/dashboard" className="navbar-brand"><b>lspxyz.com</b></Link>
            </div>
            <div className="collapse navbar-collapse pull-left">
              <ul className="nav navbar-nav">
                <li><Link href="#">Beranda</Link></li>
                <li className="active"><Link href="/asesor/dashboard">Assesor</Link></li>
              </ul>
            </div>
            <div className="navbar-custom-menu">
              <ul className="nav navbar-nav">
                <li>
                  <a href="#" onClick={handleLogout} className="btn btn-danger" style={{ color: "white", padding: "10px 15px", margin: "5px" }}>Log Out {currentUser?.email}</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {showPersetujuanModal && selectedAssesiForModal && (
        <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", overflowY: "auto", zIndex: 9999 }} tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-lg" role="document" style={{ marginTop: "5vh" }}>
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title" style={{ display: "inline-block", margin: 0 }}>Persetujuan Peraturan Proses Assesment</h3>
                <button type="button" className="close pull-right" onClick={() => setShowPersetujuanModal(false)} style={{ fontSize: "24px", marginTop: "-5px" }}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="box box-primary">
                  <div className="box-body" style={{ padding: "20px" }}>
                    <h4 className="text-center" style={{ marginBottom: "20px" }}><strong>SURAT PERNYATAAN ASESI DALAM MENGIKUTI PROSES ASESMEN</strong></h4>
                    <ol style={{ lineHeight: "1.8" }}>
                      <li>Bahwa selama mengikuti proses asesmen ini, saya akan mengikuti semua tahapan proses asesmen...</li>
                      <li>Bahwa <strong style={{ color: "red" }}>tanda tangan image digital</strong> yang saya upload dan saya gunakan pada setiap form yang berkaitan dengan proses asesmen, menjadi bukti persetujuan saya.</li>
                      <li>Bahwa jika dalam proses asesmen, saya meninggalkan proses asesmen tanpa alasan yang patut, saya bersedia diberikan keputusan BK (Belum Kompeten) oleh asesor.</li>
                    </ol>
                    <div style={{ marginTop: "30px" }}>
                      <p>Tanda Tangan Saya</p>
                      {selectedAssesiForModal.status_persetujuan ? (
                        <img src="https://via.placeholder.com/150x50?text=Tanda+Tangan" alt="Tanda Tangan Digital" width="150" style={{ border: "1px solid #ccc", marginBottom: "10px", padding: "5px" }} />
                      ) : (
                        <p style={{ color: "red" }}><strong>Tanda tangan digital belum di-upload oleh peserta.</strong></p>
                      )}
                      <p>Nama : <strong>{selectedAssesiForModal.nama_peserta}</strong></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "bold" }}>Saya telah membaca dan memahami pernyataan di atas</span>
                <button type="button" className="btn btn-primary" onClick={() => setShowPersetujuanModal(false)}>Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="content-wrapper" style={{ minHeight: "614px", backgroundColor: "transparent" }}>
        <div className="container-fluid" style={{ padding: "20px 30px" }}>

          <div className="row">
            <div className="col-md-12">
              <br />
              <h1>Selamat datang, {currentUser?.nama}</h1>
              <p>Anda login jam : <b>{loginTime}</b></p>
              <hr />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="box box-primary">
                <div className="box-header with-border"><h3 className="box-title">Shortcuts</h3></div>
                <div className="box-body">
                  <Link href="#" className="btn btn-app"><i className="fa fa-users"></i> Cari Assesi</Link>
                  <Link href="#" className="btn btn-app"><i className="fa fa-user"></i> Ganti Password</Link>
                  <Link href="#" className="btn btn-app"><i className="fa fa-book fa-2x"></i>Petunjuk</Link>
                  <a href="#" onClick={handleLogout} className="btn btn-app"><i className="fa fa-sign-out"></i> Log Out</a>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="box box-primary">
                <div className="box-header with-border"><h3 className="box-title">Unduh Aplikasi pendukung</h3></div>
                <div className="box-body">
                  <Link href="#" className="btn btn-app"><i className="fa fa-camera fa-2x"></i>Tangkap gambar</Link>
                  <Link href="#" className="btn btn-app"><i className="fa fa-desktop fa-2x"></i>Remote Assesment</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-md-12">
              <div className="box box-primary">
                <div className="box-header with-border">
                  <h3 className="box-title">Event Sertifikasi</h3>
                </div>
                <div className="box-body">

                  <ul className="nav nav-tabs" style={{ marginBottom: "20px" }}>
                    <li className={activeTab === "aktif" ? "active" : ""}>
                      <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("aktif"); }}>
                        Event Aktif &nbsp;<span className="label label-success">{activeEvents.length}</span>
                      </a>
                    </li>
                    <li className={activeTab === "tutup" ? "active" : ""}>
                      <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("tutup"); }}>
                        Event Tutup &nbsp;<span className="label label-danger">{pastEvents.length}</span>
                      </a>
                    </li>
                  </ul>

                  <div className="tab-content">
                    {activeTab === "aktif" && (
                      <div className="tab-pane active">
                        <div className="table-responsive">
                          <table className="table table-striped table-bordered">
                            <thead>
                              <tr className="bg-gray">
                                <th width="8%">ID</th>
                                <th width="10%">Tanggal event</th>
                                <th width="15%">Nama event</th>
                                <th width="15%">TUK</th>
                                <th width="10%">Type Event</th>
                                <th width="20%">SKEMA Assesor</th>
                                <th width="22%">Aksi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {isLoading ? (
                                <tr><td colSpan={7} className="text-center">Memuat data...</td></tr>
                              ) : activeEvents.length === 0 ? (
                                <tr><td colSpan={7} className="text-center text-muted">Tidak ada event aktif saat ini.</td></tr>
                              ) : (
                                activeEvents.map((evt, idx) => (
                                  <tr key={idx}>
                                    <td style={{ verticalAlign: 'middle' }}>{evt.event_id?.substring(0,6).toUpperCase()}</td>
                                    <td style={{ verticalAlign: 'middle' }}>{evt.tanggal}</td>
                                    <td style={{ verticalAlign: 'middle' }}><strong>{evt.nama_event}</strong></td>
                                    <td style={{ verticalAlign: 'middle' }}>{evt.tuk_nama}</td>
                                    <td style={{ verticalAlign: 'middle' }}>{evt.tipe_event === "1" ? "Off-line" : "On-line"}</td>
                                    <td style={{ verticalAlign: 'middle' }}>{evt.skema_nama}</td>
                                    <td style={{ verticalAlign: 'middle' }}>{renderActionButtons(evt.event_id)}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {activeTab === "tutup" && (
                      <div className="tab-pane active">
                        <div className="table-responsive">
                          <table className="table table-striped table-bordered">
                            <thead>
                              <tr className="bg-gray">
                                <th width="8%">ID</th>
                                <th width="10%">Tanggal event</th>
                                <th width="15%">Nama event</th>
                                <th width="15%">TUK</th>
                                <th width="10%">Type Event</th>
                                <th width="20%">SKEMA Assesor</th>
                                <th width="22%">Aksi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {isLoading ? (
                                <tr><td colSpan={7} className="text-center">Memuat data...</td></tr>
                              ) : pastEvents.length === 0 ? (
                                <tr><td colSpan={7} className="text-center text-muted">Belum ada riwayat event tutup.</td></tr>
                              ) : (
                                pastEvents.map((evt, idx) => (
                                  <tr key={idx}>
                                    <td style={{ verticalAlign: 'middle' }}>{evt.event_id?.substring(0,6).toUpperCase()}</td>
                                    <td style={{ verticalAlign: 'middle' }}>{evt.tanggal}</td>
                                    <td style={{ verticalAlign: 'middle' }}><strong>{evt.nama_event}</strong></td>
                                    <td style={{ verticalAlign: 'middle' }}>{evt.tuk_nama}</td>
                                    <td style={{ verticalAlign: 'middle' }}>
                                      {evt.tipe_event === "1" ? "Off-line " : "On-line "}
                                      <br/><span className="label label-danger" style={{ marginTop: '4px', display: 'inline-block' }}>Event Tutup</span>
                                    </td>
                                    <td style={{ verticalAlign: 'middle' }}>{evt.skema_nama}</td>
                                    <td style={{ verticalAlign: 'middle' }}>{renderActionButtons(evt.event_id)}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {pesertaList !== null && (
            <div className="row mt-4" id="daftar-assesi-section">
              <div className="col-md-12">
                <div className="box box-primary">
                  <div className="box-header with-border">
                    <h3 className="box-title">
                      Event &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;<span style={{ backgroundColor: "yellow" }}>{selectedEventDetails?.nama_event}</span><br />
                      Skema &nbsp;&nbsp;&nbsp;:&nbsp;<span style={{ backgroundColor: "yellow" }}>{selectedEventDetails?.skema_nama}</span>
                    </h3>
                  </div>
                  <div className="box-body">
                    <div className="table-responsive">
                      <table className="table table-striped table-bordered">
                        <thead>
                          <tr className="bg-gray">
                            <th width="3%">No.</th>
                            <th width="15%">No Peserta/Phone</th>
                            <th width="20%">Nama/Email Peserta</th>
                            <th width="5%" className="text-center">Status</th>
                            <th width="10%" className="text-center">Assesment</th>
                            <th width="15%">Catatan</th>
                            <th width="32%">Form (Aksi Assesi)</th> 
                          </tr>
                        </thead>
                        <tbody>
                          {isLoadingAssesi ? (
                            <tr><td colSpan={7} className="text-center">Memuat daftar peserta...</td></tr>
                          ) : pesertaList.length === 0 ? (
                            <tr><td colSpan={7} className="text-center text-muted">Belum ada peserta yang mendaftar di event ini.</td></tr>
                          ) : (
                            pesertaList.map((peserta, idx) => (
                              <tr key={peserta.id}>
                                <td style={{ verticalAlign: "middle" }}>{idx + 1}</td>
                                <td style={{ verticalAlign: "middle" }}>
                                  {peserta.no_peserta || "TUK-S.001.XXXX"}<br />
                                  <span className="text-muted">[{peserta.telp_peserta || "08xxxx"}]</span>
                                </td>
                                <td style={{ verticalAlign: "middle" }}>
                                  {peserta.nama_peserta || "Nama Peserta"}<br />
                                  <span className="text-muted">[{peserta.email}]</span>
                                </td>
                                <td align="center" style={{ verticalAlign: "middle" }}>
                                  {peserta.hasil_asesmen === 'k' || peserta.hasil_asesmen === 'K' ? (
                                    <h4><span className="label label-success">K</span></h4>
                                  ) : peserta.hasil_asesmen === 'bk' || peserta.hasil_asesmen === 'BK' ? (
                                    <h4><span className="label label-danger">BK</span></h4>
                                  ) : (
                                    <h4><span className="label label-default">N/A</span></h4>
                                  )}
                                </td>
                                <td align="center" style={{ verticalAlign: "middle" }}>
                                  <b>{peserta.metode_asesmen || "Portofolio"}</b>
                                </td>
                                <td style={{ verticalAlign: "middle" }}>
                                  <div className="input-group">
                                    <div className="input-group-btn">
                                      <button type="button" className="btn btn-primary" title="Simpan Catatan" onClick={() => handleSimpanCatatan(peserta.id)}>
                                        <i className="fa fa-save"></i>
                                      </button>
                                    </div>
                                    <input 
                                      type="text" 
                                      className="form-control" 
                                      value={catatan[peserta.id] || ""} 
                                      onChange={(e) => handleCatatanChange(peserta.id, e.target.value)}
                                    />
                                  </div>
                                </td>
                                <td style={{ verticalAlign: "middle" }}>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    <button 
                                      className="btn btn-success btn-sm" 
                                      onClick={() => {
                                        setSelectedAssesiForModal(peserta);
                                        setShowPersetujuanModal(true);
                                      }}>
                                      Persetujuan
                                    </button>
                                    
                                    <a href="#" onClick={(e) => handlePlaceholder(e, 'FR.APL.01')} className="btn btn-success btn-sm">FR.APL.01</a>
                                    <a href="#" onClick={(e) => handlePlaceholder(e, 'FR.APL.02')} className="btn btn-success btn-sm">FR.APL.02</a>
                                    <a href="#" onClick={(e) => handlePlaceholder(e, 'FR.AK.01')} className="btn btn-success btn-sm">FR.AK.01</a>
                                    
                                    <Link href={`/asesor/ia08/${peserta.id}`} className={`btn ${filledForms[`ia08_${peserta.id}`] ? 'btn-success' : 'btn-primary'} btn-sm`}>FR.IA.08</Link>
                                    <Link href={`/asesor/ia09/${peserta.id}`} className={`btn ${filledForms[`ia09_${peserta.id}`] ? 'btn-success' : 'btn-primary'} btn-sm`}>FR.IA.09</Link>
                                    <Link href={`/asesor/ak02/${peserta.id}`} className={`btn ${filledForms[`ak02_${peserta.id}`] ? 'btn-success' : 'btn-primary'} btn-sm`}>FR.AK.02</Link>
                                    
                                    <a href="#" onClick={(e) => handlePlaceholder(e, 'FR.AK.03')} className="btn btn-success btn-sm">FR.AK.03</a>
                                    <a href="#" onClick={(e) => handlePlaceholder(e, 'FR.AK.04 Banding')} className="btn btn-danger btn-sm">FR.AK.04 Banding</a>
                                    <a href="#" onClick={(e) => handlePlaceholder(e, 'Upload Bukti')} className="btn btn-success btn-sm">Upload Bukti</a>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ marginTop: "20px" }}>
                      <button className="btn btn-default" onClick={() => {
                        localStorage.removeItem("openAssesiForEvent");
                        setPesertaList(null);
                      }}>Tutup Daftar Peserta</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <footer className="main-footer" style={{ marginLeft: 0 }}>
        <div className="container-fluid text-center">
          <strong>LSP XYZ © {new Date().getFullYear()} All rights reserved.</strong>
        </div>
      </footer>
    </div>
  );
}