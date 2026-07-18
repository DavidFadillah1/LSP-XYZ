"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DetailEventStaff() {
  const router = useRouter();
  const params = useParams();
  
  const eventId = (params.event_id || params.id) as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [eventDetail, setEventDetail] = useState<any>(null);
  const [tukName, setTukName] = useState("-");
  
  const [jadwalList, setJadwalList] = useState<any[]>([]);
  const [pesertaList, setPesertaList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDetailEvent();
  }, [eventId]);

  const fetchDetailEvent = async () => {
    if (!eventId) return;
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { data: userData } = await supabase.from("users").select("*").eq("email", user.email).maybeSingle();
        setCurrentUser(userData || { email: user.email, nama: "Staff LSP" });
      }

      const { data: ev, error: evError } = await supabase.from("event").select("*").eq("id", eventId).maybeSingle();
      if (evError) throw evError;
      setEventDetail(ev);

      const { data: tuks } = await supabase.from("tuk").select("*");
      const { data: skemas } = await supabase.from("skema").select("*");
      const { data: users } = await supabase.from("users").select("*");

      if (ev && tuks) {
        const foundTuk = tuks.find(t => t.id === ev.tuk_id);
        if (foundTuk) setTukName(foundTuk.nama_tuk);
      }

      const { data: jdwl } = await supabase.from("event_skema_jadwal").select("*").eq("event_id", eventId);
      if (jdwl) {
        const mappedJadwal = jdwl.map(j => ({
          ...j,
          skema_nama: skemas?.find(s => s.id === j.skema_id)?.judul_skema || "Skema Tidak Ditemukan",
          kode_skema: skemas?.find(s => s.id === j.skema_id)?.kode_skema || "-",
          asesor_nama: users?.find(u => u.id === j.assesor_id)?.nama || "Asesor Tidak Ditemukan"
        }));
        setJadwalList(mappedJadwal);
      }

      const { data: pst } = await supabase.from("assesi").select("*").eq("sertifikasi_event_id", eventId).order("id", { ascending: true });
      if (pst) {
        const mappedPeserta = pst.map(p => ({
          ...p,
          skema_nama: skemas?.find(s => s.id === p.skema_sertifikasi_id)?.judul_skema || "Skema Belum Dipilih",
          asesor_nama: users?.find(u => u.id === p.assesor_id)?.nama || "Asesor Belum Dipilih"
        }));
        setPesertaList(mappedPeserta);
      }

    } catch (err: any) {
      console.error("Gagal memuat detail event:", err.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.clear();
    router.push("/login");
  };

  const formatTanggal = (start: string, end: string) => {
    if (!start) return "-";
    const startDate = new Date(start).toLocaleDateString('id-ID');
    const endDate = end ? new Date(end).toLocaleDateString('id-ID') : "";
    return endDate ? `${startDate} s/d ${endDate}` : startDate;
  };

  return (
    <div suppressHydrationWarning className="skin-blue layout-top-nav" style={{ minHeight: "100vh", backgroundColor: "#ecf0f5" }}>
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/adminlte.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{__html: `
        .btn-group a { margin-right: 5px; margin-bottom: 5px; }
        .disabled-link { pointer-events: none; opacity: 0.6; }
      `}} />

      <header className="main-header">
        <nav className="navbar navbar-static-top">
          <div className="container-fluid">
            <div className="navbar-header">
              <span className="navbar-brand"><b>lspxyz.com</b> — Admin/Staff</span>
            </div>
            <div className="navbar-custom-menu">
              <ul className="nav navbar-nav">
                <li><a href="#" onClick={handleLogout} className="btn btn-danger" style={{ color: "white", padding: "10px 15px", margin: "5px" }}>Log Out {currentUser?.email || ""}</a></li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <div className="content-wrapper" style={{ minHeight: "614px" }}>
        <div className="container-fluid" style={{ padding: "20px 30px" }}>
          
          <div className="row" style={{ marginBottom: "20px" }}>
            <div className="col-md-12">
              <button onClick={() => router.push('/staff/dashboard')} className="btn btn-default">
                <i className="fa fa-arrow-left"></i> Kembali ke Dashboard
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center" style={{ padding: "50px" }}><h4>Memuat Detail Event...</h4></div>
          ) : !eventDetail ? (
            <div className="alert alert-danger">Event tidak ditemukan atau telah dihapus.</div>
          ) : (
            <>
              <div className="row">
                <div className="col-md-12">
                  <div className="box box-primary">
                    <div className="box-body" style={{ padding: 0 }}>
                      <table className="table table-bordered" style={{ marginBottom: 0 }}>
                        <tbody>
                          <tr>
                            <th style={{ width: '20%' }}>Tanggal</th>
                            <td>{formatTanggal(eventDetail.tanggal_mulai, eventDetail.tanggal_selesai)}</td>
                          </tr>
                          <tr>
                            <th>TUK</th>
                            <td>{tukName}</td>
                          </tr>
                          <tr>
                            <th>Tipe Event</th>
                            <td>{eventDetail.tipe_event === 1 || eventDetail.tipe_event === '1' ? 'Off-line' : 'On-line'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12">
                  <div className="box box-primary">
                    <div className="box-header with-border">
                      <h3 className="box-title">Skema Sertifikasi</h3>
                    </div>
                    <div className="box-body">
                      <div className="table-responsive">
                        <table className="table table-striped table-bordered">
                          <thead>
                            <tr className="bg-gray">
                              <th>SKEMA</th>
                              <th>ASSESOR</th>
                              <th>Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {jadwalList.length === 0 ? (
                              <tr><td colSpan={3} className="text-center text-muted">Belum ada Skema/Asesor yang ditugaskan.</td></tr>
                            ) : (
                              jadwalList.map((jdwl, idx) => (
                                <tr key={idx}>
                                  <td>{jdwl.kode_skema}-{jdwl.skema_nama}</td>
                                  <td>{jdwl.asesor_nama}</td>
                                  <td>
                                    <div className="btn-group">
                                      <button className="btn btn-primary disabled-link" disabled>Detail</button>
                                      <button className="btn btn-primary disabled-link" disabled>Absensi</button>
                                      <button className="btn btn-primary disabled-link" disabled>Dok TUK</button>
                                      <button className="btn btn-primary disabled-link" disabled>SPT</button>
                                      <button className="btn btn-primary disabled-link" disabled>BA</button>
                                      <button className="btn btn-primary disabled-link" disabled>FR.AK.05</button>
                                      <button className="btn btn-primary disabled-link" disabled>FR.AK.06</button>
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
                </div>
              </div>

              <div className="row">
                <div className="col-md-12">
                  <div className="box box-primary">
                    <div className="box-header with-border">
                      <h3 className="box-title">Peserta Sertifikasi : {eventDetail.nama_event}</h3>
                    </div>
                    <div className="box-body">
                      <div className="table-responsive">
                        <table className="table table-striped table-bordered">
                          <thead>
                            <tr className="bg-gray">
                              <th style={{ width: '3%' }}>No.</th>
                              <th style={{ width: '20%' }}>No-Nama Peserta</th>
                              <th style={{ width: '20%' }}>Email-HP Peserta</th>
                              <th style={{ width: '5%' }}>Status</th>
                              <th style={{ width: '52%' }}>Form</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pesertaList.length === 0 ? (
                              <tr><td colSpan={5} className="text-center text-muted" style={{ padding: "20px" }}>Belum ada peserta terdaftar di event ini.</td></tr>
                            ) : (
                              pesertaList.map((pst, idx) => (
                                <tr key={pst.id}>
                                  <td style={{ verticalAlign: "top" }}>{idx + 1}</td>
                                  <td style={{ verticalAlign: "top" }}>
                                    {pst.no_peserta || "TUK-NEW-000"}<br/>
                                    {pst.nama_peserta || "Nama Belum Diisi"}
                                  </td>
                                  <td style={{ verticalAlign: "top" }}>
                                    {pst.email || "Email Belum Diisi"}<br/>
                                    {pst.no_hp || "-"}
                                  </td>
                                  <td align="center" style={{ verticalAlign: "top" }}>
                                    {pst.hasil_asesmen === 'K' || pst.hasil_asesmen === 'k' ? (
                                      <h4><span className="label label-success">K</span></h4>
                                    ) : pst.hasil_asesmen === 'BK' || pst.hasil_asesmen === 'bk' ? (
                                      <h4><span className="label label-danger">BK</span></h4>
                                    ) : (
                                      <h4><span className="label label-default">N/A</span></h4>
                                    )}
                                  </td>
                                  <td style={{ verticalAlign: "top" }}>
                                    <div className="btn-group">
                                      <button className={`btn ${pst.status_persetujuan ? 'btn-success' : 'btn-default disabled-link'}`} disabled>
                                        Persetujuan
                                      </button>
                                      
                                      {/* PERBAIKAN: Menambahkan ${pst.id} ke dalam link APL.01 */}
                                      <Link href={`/staff/apl1/${pst.id}`} className="btn btn-success" title="Formulir permohonan sertifikasi kompetensi">
                                        FR.APL.01
                                      </Link>

                                      <button className="btn btn-success disabled-link" disabled>FR.APL.02</button>
                                      <button className="btn btn-success disabled-link" disabled>FR.AK.01</button>
                                      <button className="btn btn-primary disabled-link" disabled>FR.IA.08</button>
                                      <button className="btn btn-primary disabled-link" disabled>FR.IA.09</button>
                                      <button className="btn btn-success disabled-link" disabled>FR.AK.02</button>
                                      <button className="btn btn-success disabled-link" disabled>FR.AK.03</button>
                                      <button className="btn btn-success disabled-link" disabled>Upload Bukti</button>
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
                </div>
              </div>

            </>
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