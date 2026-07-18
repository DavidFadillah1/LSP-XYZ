"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DaftarAssesor() {
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState("assesor");
  
  const [asesorList, setAsesorList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "asesor")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      if (data) setAsesorList(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus Asesor ${name}?`)) return;

    try {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) throw error;
      alert("Asesor berhasil dihapus.");
      fetchData(); 
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message);
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
            <a href="#" className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)} role="button">
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
                <a href="#" onClick={(e) => { e.preventDefault(); setOpenMenu('sertifikasi'); }}>
                  <i className="fa fa-cogs"></i> <span>Sertifikasi</span> <span className="pull-right-container"><i className="fa fa-angle-left pull-right"></i></span>
                </a>
                <ul className="treeview-menu" style={{ display: openMenu === 'sertifikasi' ? 'block' : 'none' }}>
                  <li><Link href="/admin/event/tambah"><i className="fa fa-circle-o"></i> Tambah Event</Link></li>
                  <li><Link href="/admin/event"><i className="fa fa-circle-o"></i> Lihat/Edit Event</Link></li>
                </ul>
              </li>

              <li className={`treeview ${openMenu === 'skema' ? 'active' : ''}`}>
                <a href="#" onClick={(e) => { e.preventDefault(); setOpenMenu('skema'); }}>
                  <i className="fa fa-book"></i> <span>Skema</span> <span className="pull-right-container"><i className="fa fa-angle-left pull-right"></i></span>
                </a>
                <ul className="treeview-menu" style={{ display: openMenu === 'skema' ? 'block' : 'none' }}>
                  <li><Link href="/admin/skema"><i className="fa fa-circle-o"></i> Skema Sertifikasi</Link></li>
                </ul>
              </li>

              <li className={`treeview ${openMenu === 'assesor' ? 'active' : ''}`}>
                <a href="#" onClick={(e) => { e.preventDefault(); setOpenMenu('assesor'); }}>
                  <i className="fa fa-users"></i> <span>Assesor</span> <span className="pull-right-container"><i className="fa fa-angle-left pull-right"></i></span>
                </a>
                <ul className="treeview-menu" style={{ display: openMenu === 'assesor' ? 'block' : 'none' }}>
                  <li className="active"><Link href="/admin/assesor"><i className="fa fa-circle-o"></i> Assesor</Link></li>
                </ul>
              </li>

              <li className="treeview"><Link href="/admin/assesi"><i className="fa fa-users"></i> <span>Assesi</span></Link></li>
              <li className="treeview"><Link href="/admin/tuk"><i className="fa fa-building"></i> <span>Tuk</span></Link></li>
              <li className="treeview"><Link href="/admin/users"><i className="fa fa-user-plus"></i> <span>Kelola Users</span></Link></li>
            </ul>
          </section>
        </aside>

        <div className="content-wrapper" style={{ minHeight: "614px" }}>
          <section className="content-header">
            <h1>Assesor</h1>
            <ol className="breadcrumb">
              <li><Link href="/admin/dashboard"><i className="fa fa-home"></i> Home</Link></li>
              <li className="active">Assesor</li>
            </ol>
          </section>

          <section className="content">
            <div className="box box-primary">
              <div className="box-header with-border">
                <h3 className="box-title">Assesor</h3>
              </div>
              <div className="box-body">
                <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
                  <Link href="/admin/assesor/tambah" className="btn btn-default"><i className="fa fa-plus"></i> Tambah Assesor</Link>
                  <button onClick={fetchData} className="btn btn-default"><i className="fa fa-refresh"></i> Segarkan</button>
                </div>
                
                <div className="table-responsive">
                  <table className="table table-bordered table-striped">
                    <thead>
                      <tr className="bg-gray">
                        <th width="10%">Pilihan</th>
                        <th>Nama Assesor</th>
                        <th>Berlaku</th>
                        <th>Email</th>
                        <th>Telepon</th>
                        <th>No Registrasi</th>
                        <th>No Sertifikat</th>
                        <th>Provinsi</th>
                        <th>Tanda Tangan</th>
                        <th>Assesor LSP</th>
                        <th>Anggota Pleno</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr><td colSpan={12} className="text-center">Memuat data...</td></tr>
                      ) : asesorList.length === 0 ? (
                        <tr><td colSpan={12} className="text-center">Tidak ada Asesor ditemukan.</td></tr>
                      ) : (
                        asesorList.map(asr => (
                          <tr key={asr.id}>
                            <td style={{ whiteSpace: "nowrap" }}>
                              {/* TOMBOL UBAH KINI MENGARAH KE EDIT ASSESOR */}
                              <Link href={`/admin/assesor/edit/${asr.id}`} className="btn btn-default btn-sm" style={{ marginRight: '4px' }}>
                                <i className="fa fa-pencil"></i> Ubah
                              </Link>
                              <button onClick={() => handleDelete(asr.id, asr.nama)} className="btn btn-danger btn-sm">
                                <i className="fa fa-trash"></i>
                              </button>
                            </td>
                            <td><b>{asr.nama}</b></td>
                            <td>-</td>
                            <td>{asr.email}</td>
                            <td>{asr.telepon || "-"}</td>
                            <td>{asr.no_registrasi || "-"}</td>
                            <td>{asr.no_sertifikat || "-"}</td>
                            <td>{asr.provinsi || "-"}</td>
                            <td>-</td>
                            <td className="text-center">{asr.is_asesor_lsp ? 'Y' : 'N'}</td>
                            <td className="text-center">{asr.is_anggota_pleno ? 'Y' : 'N'}</td>
                            <td align="center"><button className="btn btn-success btn-sm"><i className="fa fa-envelope"></i></button></td>
                          </tr>
                        ))
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