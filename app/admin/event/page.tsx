"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DaftarEvent() {
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState("sertifikasi");
  
  const [events, setEvents] = useState<any[]>([]);
  const [tuks, setTuks] = useState<any[]>([]);
  const [skemas, setSkemas] = useState<any[]>([]);
  const [jadwals, setJadwals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
    script.async = true;
    document.body.appendChild(script);

    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: tukData } = await supabase.from("tuk").select("*");
      if (tukData) setTuks(tukData);

      const { data: skemaData } = await supabase.from("skema").select("*");
      if (skemaData) setSkemas(skemaData);

      const { data: jadwalData } = await supabase.from("event_skema_jadwal").select("*");
      if (jadwalData) setJadwals(jadwalData);

      const { data: eventData, error } = await supabase
        .from("event")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      if (eventData) setEvents(eventData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const Swal = (window as any).Swal;
    if (Swal) {
      const result = await Swal.fire({
        title: 'Yakin ingin menghapus?',
        text: "Event dan semua data peserta di dalamnya akan dihapus permanen!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!'
      });
      if (!result.isConfirmed) return;
    } else {
      if (!window.confirm("Yakin ingin menghapus event ini?")) return;
    }

    try {
      await supabase.from("assesi").delete().eq("sertifikasi_event_id", id);
      await supabase.from("event_skema_jadwal").delete().eq("event_id", id);
      
      const { error } = await supabase.from("event").delete().eq("id", id);
      if (error) throw error;

      if (Swal) Swal.fire('Dihapus!', 'Event berhasil dihapus.', 'success');
      else alert("Event berhasil dihapus.");

      fetchData(); 
    } catch (err: any) {
      if (Swal) Swal.fire('Error', err.message, 'error');
      else alert("Gagal: " + err.message);
    }
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.clear();
    router.push("/admin/login");
  };

  return (
    <div suppressHydrationWarning className={`skin-blue ${!isSidebarOpen ? 'sidebar-collapse' : ''}`} style={{ height: "auto", minHeight: "100vh" }}>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/adminlte.min.css" rel="stylesheet" />
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/lib.min.css" rel="stylesheet" />
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/app.min.css" rel="stylesheet" />

      <div className="wrapper" style={{ height: "auto" }}>
        <header className="main-header">
          <Link href="/admin/dashboard" className="logo"><b>lspxyz.com</b></Link>
          <nav className="navbar navbar-static-top" role="navigation">
            <a href="#" className="sidebar-toggle" onClick={(e) => { e.preventDefault(); setIsSidebarOpen(!isSidebarOpen); }} role="button">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span><span className="icon-bar"></span><span className="icon-bar"></span>
            </a>
            <div className="navbar-custom-menu">
              <ul className="nav navbar-nav navbar-right">
                <li><a className="btn btn-danger" href="#" onClick={handleLogout} style={{ marginRight: '20px', marginTop: '8px', padding: '6px 12px' }}>Log Out superadmin</a></li>
              </ul>
            </div>
          </nav>
        </header>

        <aside className="main-sidebar">
          <section className="sidebar" style={{ height: "auto" }}>
            <div className="user-panel" style={{ height: "70px" }}>
              <div className="pull-left info" style={{ left: "0px" }}>
                <img src="/logo.png" alt="Logo" width="200" height="35" />
                <div style={{ height: "30px" }}></div>
              </div>
            </div>
            
            <ul className="sidebar-menu">
              <li><Link href="/admin/dashboard"><i className="fa fa-home"></i> <span>Home</span></Link></li>
              
              <li className={`treeview ${openMenu === 'sertifikasi' ? 'active' : ''}`}>
                <a href="#" onClick={(e) => { e.preventDefault(); setOpenMenu(openMenu === 'sertifikasi' ? '' : 'sertifikasi'); }}>
                  <i className="fa fa-cogs"></i> <span>Sertifikasi</span> <span className="pull-right-container"><i className="fa fa-angle-left pull-right"></i></span>
                </a>
                <ul className="treeview-menu" style={{ display: openMenu === 'sertifikasi' ? 'block' : 'none' }}>
                  <li><Link href="/admin/event/tambah"><i className="fa fa-circle-o"></i> Tambah Event</Link></li>
                  <li className="active"><Link href="/admin/event"><i className="fa fa-circle-o"></i> Lihat/Edit Event</Link></li>
                </ul>
              </li>

              <li className={`treeview ${openMenu === 'skema' ? 'active' : ''}`}>
                <a href="#" onClick={(e) => { e.preventDefault(); setOpenMenu(openMenu === 'skema' ? '' : 'skema'); }}>
                  <i className="fa fa-book"></i> <span>Skema</span> <span className="pull-right-container"><i className="fa fa-angle-left pull-right"></i></span>
                </a>
                <ul className="treeview-menu" style={{ display: openMenu === 'skema' ? 'block' : 'none' }}>
                  <li><Link href="/admin/skema"><i className="fa fa-circle-o"></i> Skema Sertifikasi</Link></li>
                </ul>
              </li>

              <li className="treeview"><Link href="/admin/assesor"><i className="fa fa-users"></i> <span>Assesor</span></Link></li>
              <li className="treeview"><Link href="/admin/assesi"><i className="fa fa-users"></i> <span>Assesi</span></Link></li>
              <li className="treeview"><Link href="/admin/tuk"><i className="fa fa-building"></i> <span>Tuk</span></Link></li>
              <li className="treeview"><Link href="/admin/users"><i className="fa fa-user-plus"></i> <span>Kelola Users</span></Link></li>
            </ul>
          </section>
        </aside>

        <div className="content-wrapper" style={{ minHeight: "614px" }}>
          <section className="content-header">
            <h1>Daftar Event Sertifikasi</h1>
            <ol className="breadcrumb">
              <li><Link href="/admin/dashboard">Home</Link></li>
              <li className="active">Daftar Event Sertifikasi</li>
            </ol>
          </section>

          <section className="content">
            <div className="box box-primary">
              <div className="box-header with-border">
                <h3 className="box-title">Sertifikasi Event</h3>
              </div>
              <div className="box-body">
                <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
                  <Link href="/admin/event/tambah" className="btn btn-primary"><i className="fa fa-plus"></i> Tambah Event</Link>
                  <button onClick={fetchData} className="btn btn-default"><i className="fa fa-refresh"></i> Segarkan</button>
                </div>
                
                <div className="table-responsive">
                  <table className="table table-bordered table-striped">
                    <thead>
                      <tr className="bg-gray">
                        <th>Pilihan</th>
                        <th>Id</th>
                        <th>Nama event</th>
                        <th>Skema</th>
                        <th>Start event</th>
                        <th>End event</th>
                        <th>TUK</th>
                        <th>Type event</th>
                        <th>Publish</th>
                        <th>Sumber Anggaran</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr><td colSpan={11} className="text-center">Memuat data...</td></tr>
                      ) : events.length === 0 ? (
                        <tr><td colSpan={11} className="text-center">Tidak ada event ditemukan.</td></tr>
                      ) : (
                        events.map(evt => {
                          // PERBAIKAN: Menggunakan LOOSE EQUALITY (==) agar tidak sensitif string/int
                          const matchedTuk = tuks.find(t => t.id == evt.tuk_id);
                          const tukName = matchedTuk ? matchedTuk.nama_tuk : <span className="text-danger">TUK Belum Dipilih</span>;
                          
                          // PERBAIKAN: Menggunakan LOOSE EQUALITY (==) pada skema jadwal
                          const eventJadwals = jadwals.filter(j => j.event_id == evt.id);
                          const skemaNames = eventJadwals.map(j => {
                            const found = skemas.find(s => s.id == j.skema_id);
                            return found ? found.judul_skema : null;
                          }).filter(Boolean);
                          
                          let displaySkema: any = <span className="text-danger">Skema Belum Dipilih</span>;
                          if (skemaNames.length === 1) displaySkema = <span className="text-muted" style={{ fontSize: "12px" }}>{skemaNames[0]}<br/>(Lihat Detail)</span>;
                          else if (skemaNames.length > 1) displaySkema = <span className="text-muted" style={{ fontSize: "12px" }}>Multi Skema<br/>(Lihat Detail)</span>;

                          const typeEvent = evt.tipe_event == 1 ? 'Off-line' : 'On-line';
                          const publishStatus = evt.is_publish ? 'Publish' : 'Non-Publish';
                          const sumberAnggaranMap: any = { 5: 'APBN', 6: 'APBD', 7: 'Perusahaan', 8: 'Mandiri' };
                          const sumberAnggaran = sumberAnggaranMap[evt.sumber_anggaran] || '-';
                          const shortId = evt.id ? evt.id.toString().substring(0, 4) + "..." : "";

                          return (
                            <tr key={evt.id}>
                              <td align="center"><button className="btn btn-default btn-sm"><i className="fa fa-eye"></i> View</button></td>
                              <td>{shortId}</td>
                              <td><b>{evt.nama_event}</b></td>
                              <td>{displaySkema}</td>
                              <td>{evt.tanggal_mulai || "-"}</td>
                              <td>{evt.tanggal_selesai || "-"}</td>
                              <td>{tukName}</td>
                              <td>{typeEvent}</td>
                              <td>{publishStatus}</td>
                              <td>{sumberAnggaran}</td>
                              <td style={{ whiteSpace: "nowrap" }}>
                                <Link href={`/admin/event/edit/${evt.id}`} className="btn btn-primary btn-sm" style={{ marginRight: '4px' }}>Edit</Link>
                                <button className="btn btn-success btn-sm" style={{ marginRight: '4px' }}>Buka</button>
                                <button onClick={() => handleDelete(evt.id)} className="btn btn-danger btn-sm">Hapus</button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="main-footer">
          <div className="pull-right hidden-xs">Next.js Version: <strong>16.2.9</strong></div>
          <strong>© LSP XYZ {new Date().getFullYear()}</strong> All rights reserved.
        </footer>
      </div>
    </div>
  );
}