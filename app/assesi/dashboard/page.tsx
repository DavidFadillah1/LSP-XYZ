"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AssesiDashboard() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeEvents, setActiveEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showTukModal, setShowTukModal] = useState(false);
  const [showPersetujuanModal, setShowPersetujuanModal] = useState(false);
  const [selectedAssesiId, setSelectedAssesiId] = useState<string | null>(null);

  const [ttdFile, setTtdFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FIX HYDRATION: Simpan waktu di State agar Server dan Client sinkron
  const [clientTime, setClientTime] = useState("");
  const [clientDate, setClientDate] = useState("");

  useEffect(() => {
    // Set waktu hanya saat komponen sudah di-mount di Client
    setClientTime(new Date().toLocaleString('id-ID'));
    setClientDate(new Date().toLocaleDateString('id-ID'));

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
      
      if (!userEmail) {
        router.push("/login");
        return;
      }

      const { data: userData } = await supabase.from("users").select("*").eq("email", userEmail).single();

      if (userData) {
        setCurrentUser(userData);
      } else {
        const { data: currentAssesi } = await supabase.from("assesi").select("nama_peserta").eq("email", userEmail).limit(1).single();
        setCurrentUser({ email: userEmail, nama: currentAssesi?.nama_peserta || "Peserta Assesi" });
      }

      const { data: assesiData, error: assesiError } = await supabase.from("assesi").select("*").eq("email", userEmail);

      if (assesiError) throw assesiError;

      if (assesiData && assesiData.length > 0) {
        const eventIds = assesiData.map(a => a.sertifikasi_event_id).filter(Boolean);
        
        let eventsData: any[] = [];
        if (eventIds.length > 0) {
          const { data } = await supabase.from("event").select("*").in("id", eventIds);
          eventsData = data || [];
        }

        const { data: tuksData } = await supabase.from("tuk").select("*");
        const { data: skemasData } = await supabase.from("skema").select("*");
        const { data: asesorsData } = await supabase.from("users").select("id, nama").eq("role", "asesor");

        const mappedEvents = assesiData.map(assesi => {
          const evt = eventsData?.find(e => e.id === assesi.sertifikasi_event_id);
          const tuk = tuksData?.find(t => t.id === evt?.tuk_id);
          const skema = skemasData?.find(s => s.id === assesi.skema_sertifikasi_id);
          const asesor = asesorsData?.find(a => a.id === assesi.assesor_id);

          // FIX HYDRATION: Cek LocalStorage dilakukan di dalam fungsi Fetch (Client Side)
          const apl1Filled = localStorage.getItem(`apl1_filled_${assesi.id}`) === "true";

          return {
            assesi_id: assesi.id,
            event_id: evt?.id || null,
            tanggal: evt?.tanggal_mulai || "",
            nama_event: evt?.nama_event || "Event Dihapus / Tidak Ditemukan",
            tipe_event: evt?.tipe_event || "1",
            tuk_nama: tuk?.nama_tuk || "Belum dipilih",
            no_peserta: assesi.no_peserta,
            skema_nama: skema ? `[${skema.kode_skema}] ${skema.judul_skema}` : "Belum dipilih",
            asesor_nama: asesor?.nama || "Belum dipilih",
            status_persetujuan: assesi.status_persetujuan || false,
            hasil_asesmen: assesi.hasil_asesmen || null,
            rekomendasi_apl1: assesi.rekomendasi_apl1 || null,
            isApl1Filled: apl1Filled,
            expired: evt?.tanggal_selesai || ""
          };
        });

        const active = mappedEvents.filter(e => !e.hasil_asesmen);
        const past = mappedEvents.filter(e => e.hasil_asesmen);

        setActiveEvents(active);
        setPastEvents(past);
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

  const handleSetuju = async (e: React.FormEvent) => {
    e.preventDefault();
    const Swal = (window as any).Swal;

    const allEvents = [...activeEvents, ...pastEvents];
    const selectedEvent = allEvents.find(evt => evt.assesi_id === selectedAssesiId);
    const isAlreadyApproved = selectedEvent?.status_persetujuan;

    if (!isAlreadyApproved && !ttdFile) {
      if(Swal) Swal.fire("Peringatan", "Harap unggah Tanda Tangan Anda terlebih dahulu.", "warning");
      else alert("Harap unggah Tanda Tangan Anda terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    
    const saveToDb = async () => {
      try {
        const { error: updateError } = await supabase.from("assesi").update({ status_persetujuan: true }).eq("id", selectedAssesiId); 
        if (updateError) throw updateError;

        if(Swal) Swal.fire("Berhasil", "Proses persetujuan berhasil disimpan.", "success");
        else alert("Proses persetujuan berhasil disimpan.");
        
        setShowPersetujuanModal(false);
        fetchDashboardData(); 
      } catch (err: any) {
        if(Swal) Swal.fire("Gagal", err.message, "error");
        else alert("Gagal: " + err.message);
      } finally {
        setIsSubmitting(false);
      }
    };

    if (ttdFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        localStorage.setItem(`ttd_${selectedAssesiId}`, reader.result as string);
        saveToDb();
      };
      reader.readAsDataURL(ttdFile);
    } else {
      saveToDb();
    }
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.clear();
    router.push("/login");
  };

  const currentModalEvent = [...activeEvents, ...pastEvents].find(evt => evt.assesi_id === selectedAssesiId);
  const isCurrentEventApproved = currentModalEvent?.status_persetujuan || false;

  return (
    <div suppressHydrationWarning className={`skin-blue ${!isSidebarOpen ? 'sidebar-collapse' : ''} layout-top-nav`} style={{ height: "auto", minHeight: "100vh", backgroundColor: "#ecf0f5" }}>
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/adminlte.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
      
      <style dangerouslySetInnerHTML={{__html: `
        .swal2-popup { font-size: 1.6rem !important; }
        .modal { background: rgba(0,0,0,0.5); }
        .modal.show { display: block; opacity: 1; overflow-y: auto; }
        .btn-app { border-radius: 3px; position: relative; padding: 15px 5px; margin: 0 10px 10px 0; min-width: 80px; height: 60px; text-align: center; color: #666; border: 1px solid #ddd; background-color: #f4f4f4; font-size: 12px; }
        .btn-app > .fa { font-size: 20px; display: block; }
        hr { border-top: 1px solid #00afef; }
        .table-responsive { overflow-x: auto; }
        .action-buttons-group .btn { margin-right: 5px; margin-bottom: 5px; }
      `}} />

      <header className="main-header">
        <nav className="navbar navbar-static-top">
          <div className="container-fluid">
            <div className="navbar-header">
              <Link href="/assesi/dashboard" className="navbar-brand"><b>lspxyz.com</b></Link>
            </div>
            <div className="collapse navbar-collapse pull-left">
              <ul className="nav navbar-nav">
                <li className="active"><Link href="/assesi/dashboard">Beranda</Link></li>
                <li><Link href="#">Assesi</Link></li>
              </ul>
            </div>
            <div className="navbar-custom-menu">
              <ul className="nav navbar-nav">
                <li>
                  <a href="#" onClick={handleLogout} className="btn btn-danger" style={{ color: "white", padding: "10px 15px", margin: "5px" }}>
                    Log Out {currentUser?.email || ""}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      {/* --- MODAL CEKLIST TUK ONLINE --- */}
      {showTukModal && (
        <div className="modal fade show" tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title" style={{ display: "inline-block", margin: 0 }}>Ceklist Verifikasi TUK Online</h3>
                <button type="button" className="close pull-right" onClick={() => setShowTukModal(false)} style={{ fontSize: "24px", marginTop: "-5px" }}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="box box-primary">
                  <div className="box-body">
                    <table className="table table-bordered">
                      <thead>
                        <tr className="bg-gray">
                          <th width="5%">No.</th>
                          <th>Daftar Cek</th>
                          <th width="10%" className="text-center">Memenuhi</th>
                          <th width="20%">Bukti (Screenshot)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>
                            <strong>PC/Laptop dengan spesifikasi minimal:</strong>
                            <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
                              <li>Processor: Core i3/Setara</li>
                              <li>Layar: 10 inch</li>
                              <li>RAM: 4 GB</li>
                              <li>Koneksi Internet Stabil</li>
                            </ul>
                          </td>
                          <td className="text-center" style={{ verticalAlign: "middle" }}>
                            <input type="checkbox" style={{ transform: "scale(1.5)" }} />
                          </td>
                          <td style={{ verticalAlign: "middle" }}>
                            <input type="file" className="form-control" accept="image/*" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-default" onClick={() => setShowTukModal(false)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={() => setShowTukModal(false)}>Simpan Verifikasi</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL PERSETUJUAN ASESMEN --- */}
      {showPersetujuanModal && (
        <div className="modal fade show" tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <form onSubmit={handleSetuju}>
                <div className="modal-header">
                  <h3 className="modal-title" style={{ display: "inline-block", margin: 0 }}>Persetujuan Peraturan Proses Assesment</h3>
                  <button type="button" className="close pull-right" onClick={() => setShowPersetujuanModal(false)} style={{ fontSize: "24px", marginTop: "-5px" }}>&times;</button>
                </div>
                <div className="modal-body">
                  <div className="box box-primary">
                    <div className="box-body" style={{ padding: "20px" }}>
                      <h4 className="text-center" style={{ marginBottom: "20px" }}><strong>SURAT PERNYATAAN ASESI DALAM MENGIKUTI PROSES ASESMEN</strong></h4>
                      <ol style={{ lineHeight: "1.8" }}>
                        <li>Bahwa selama mengikuti proses asesmen ini, saya akan mengikuti semua tahapan...</li>
                        <li>Bahwa <strong style={{ color: "red" }}>tanda tangan image digital</strong> yang saya upload menjadi bukti persetujuan.</li>
                        <li>Bahwa jika saya meninggalkan proses asesmen tanpa alasan yang patut, saya bersedia diberikan keputusan BK.</li>
                      </ol>
                      
                      <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#f9f9f9", border: "1px solid #ddd" }}>
                        <p style={{ marginBottom: "10px" }}><strong>Upload Tanda Tangan Anda (Format: .jpg, .png):</strong></p>
                        <input 
                          type="file" 
                          accept=".jpg,.jpeg,.png" 
                          className="form-control" 
                          style={{ width: "300px", marginBottom: "10px" }}
                          onChange={(e) => setTtdFile(e.target.files ? e.target.files[0] : null)}
                          required={!isCurrentEventApproved} 
                        />
                        {isCurrentEventApproved && (
                          <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                            <img src={localStorage.getItem(`ttd_${selectedAssesiId}`) || "https://via.placeholder.com/150x50?text=Tanda+Tangan"} alt="Tanda Tangan Digital" width="100" style={{ border: "1px solid #ccc" }} />
                          </div>
                        )}
                        <p style={{ marginTop: "15px" }}>Nama : <strong>{currentUser?.nama || currentUser?.email || "Peserta"}</strong></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "bold" }}>Saya telah membaca dan memahami pernyataan di atas</span>
                  <div>
                    <button type="button" className="btn btn-default" onClick={() => setShowPersetujuanModal(false)} style={{ marginRight: "10px" }}>Tutup</button>
                    <button type="submit" className="btn btn-success" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Setuju"}</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* BODY KONTEN */}
      <div className="content-wrapper" style={{ minHeight: "614px", backgroundColor: "transparent" }}>
        <div className="container-fluid" style={{ padding: "20px 30px" }}>
          
          <div className="row">
            <div className="col-md-12">
              <br />
              <h1>Selamat datang</h1>
              {/* FIX HYDRATION MENGGUNAKAN STATE */}
              <p>Anda login jam : <b>{clientTime}</b></p>
              <hr />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6"> 
              <div className="box box-primary">
                <div className="box-header with-border"><h3 className="box-title">Shortcuts</h3></div>
                <div className="box-body">
                  <Link href="#" className="btn btn-app"><i className="fa fa-user"></i> Ganti Password</Link>
                  <a href="#" onClick={handleLogout} className="btn btn-app"><i className="fa fa-sign-out"></i> Log Out</a>
                  <Link href="#" className="btn btn-app"><i className="fa fa-book fa-2x"></i>Petunjuk</Link>
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

          {/* TABEL EVENT LALU */}
          <div className="row mt-4">
            <div className="col-md-12">
              <div className="box box-primary">
                <div className="box-header with-border">
                  <h3 className="box-title">Event Sertifikasi yg Sudah diikuti</h3>
                </div>
                <div className="box-body">
                  <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                      <thead>
                        <tr className="bg-gray">
                          <th>Tgl Event</th><th>Nama Event</th><th>TUK</th><th>Type Event</th>
                          <th>No Peserta</th><th>Skema</th><th>Assesor</th><th>Hasil</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr><td colSpan={8} className="text-center">Memuat data...</td></tr>
                        ) : pastEvents.length === 0 ? (
                          <tr><td colSpan={8} className="text-center text-muted">Belum ada riwayat event.</td></tr>
                        ) : (
                          pastEvents.map((evt, idx) => (
                            <tr key={idx}>
                              <td>{evt.tanggal}</td><td>{evt.nama_event}</td><td>{evt.tuk_nama}</td>
                              <td>{evt.tipe_event === "1" ? "Off-line" : "On-line"}</td>
                              <td>{evt.no_peserta}</td><td>{evt.skema_nama}</td><td>{evt.asesor_nama}</td>
                              <td>
                                {evt.hasil_asesmen === 'K' || evt.hasil_asesmen === 'k' ? (<span className="label label-success">Kompeten</span>) : 
                                 evt.hasil_asesmen === 'BK' || evt.hasil_asesmen === 'bk' ? (<span className="label label-danger">Belum Kompeten</span>) : 
                                 (<span className="label label-info">Selesai</span>)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TABEL EVENT AKTIF */}
          <div className="row mt-4">
            <div className="col-md-12">
              <div className="box box-primary">
                <div className="box-header with-border"><h3 className="box-title">Event Sertifikasi yg diikuti</h3></div>
                <div className="box-body">
                  <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                      <thead>
                        <tr className="bg-gray">
                          <th>Tgl Event</th><th>Nama Event</th><th>TUK</th><th>Type Event</th>
                          <th>No Peserta</th><th>Skema</th><th>Assesor</th>
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
                              <td>{evt.tanggal}</td><td><strong>{evt.nama_event}</strong></td>
                              <td>{evt.tuk_nama}</td><td>{evt.tipe_event === "1" ? "Off-line" : "On-line"}</td>
                              <td>{evt.no_peserta}</td><td>{evt.skema_nama}</td><td>{evt.asesor_nama}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AKSI PESERTA */}
          {[...activeEvents, ...pastEvents].map((evt, idx) => {
            
            // Logika Status Tombol
            const isApl1Acc = evt.rekomendasi_apl1 === 'D';
            
            let apl1Class = "btn-primary";
            if (isApl1Acc) apl1Class = "btn-success"; 
            else if (evt.isApl1Filled) apl1Class = "btn-warning"; 

            return (
              <div className="row mt-4" key={`action-${idx}`}>
                <div className="col-md-12">
                  <div className="box box-success">
                    <div className="box-header with-border">
                      <h3 className="box-title">Panel Aksi Sertifikasi: <strong>{evt.nama_event}</strong></h3>
                    </div>
                    <div className="box-body">
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead>
                            <tr className="bg-gray">
                              <th width="15%" className="text-center">Status</th>
                              <th>Langkah Wajib Peserta</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="text-center" style={{ verticalAlign: "middle" }}>
                                {evt.hasil_asesmen === 'K' || evt.hasil_asesmen === 'k' ? (<h4><span className="label label-success">K</span></h4>) : 
                                evt.hasil_asesmen === 'BK' || evt.hasil_asesmen === 'bk' ? (<h4><span className="label label-danger">BK</span></h4>) : 
                                (<h4><span className="label label-default">N/A</span></h4>)}
                              </td>
                              <td style={{ verticalAlign: "middle" }}>
                                {!evt.event_id ? (
                                  <div className="alert alert-warning" style={{ margin: 0 }}>
                                    <i className="fa fa-exclamation-triangle"></i> Akun ini belum terhubung ke event sertifikasi manapun. Hubungi Admin LSP.
                                  </div>
                                ) : (
                                  <div className="action-buttons-group">
                                    {evt.tipe_event === "2" && (
                                      <button className="btn btn-warning" onClick={() => setShowTukModal(true)}>
                                        <i className="fa fa-laptop"></i> Verifikasi TUK Online
                                      </button>
                                    )}

                                    <button className={`btn ${evt.status_persetujuan ? 'btn-success' : 'btn-primary'}`} 
                                      onClick={() => { setSelectedAssesiId(evt.assesi_id); setShowPersetujuanModal(true); }}>
                                      <i className="fa fa-check-square-o"></i> Persetujuan Assesment
                                    </button>

                                    {evt.status_persetujuan && (
                                      <div style={{ display: "inline-block", marginLeft: "5px" }}>
                                        {/* APL 01 */}
                                        <Link href={`/assesi/apl1/${evt.event_id}/${evt.assesi_id}`} className={`btn ${apl1Class}`} style={{ marginRight: "5px" }}>
                                          FR.APL.01
                                        </Link>

                                        {/* APL 02 BARU TERBUKA JIKA APL 01 SUDAH DI ACC */}
                                        {isApl1Acc ? (
                                          <Link href={`/assesi/apl2/${evt.event_id}/${evt.assesi_id}`} className="btn btn-primary" style={{ marginRight: "5px" }}>
                                            FR.APL.02
                                          </Link>
                                        ) : (
                                          <button className="btn btn-default disabled-link" disabled style={{ marginRight: "5px" }}>
                                            FR.APL.02
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

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