"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DashboardSuperadmin() {
  const router = useRouter();

  // State untuk data statistik (diperbaiki membaca tabel aslinya)
  const [jumlahAssesor, setJumlahAssesor] = useState(0);
  const [jumlahSkema, setJumlahSkema] = useState(0);
  const [jumlahAssesi, setJumlahAssesi] = useState(0);
  const [jumlahSertifikasi, setJumlahSertifikasi] = useState(0);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [{ count: countAssesor }, { count: countSkema }, { count: countSertifikasi }, { count: countAssesi }] = await Promise.all([
          supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "asesor"),
          supabase.from("skema").select("*", { count: "exact", head: true }), // Dikembalikan ke tabel 'skema'
          supabase.from("event").select("*", { count: "exact", head: true }), // Dikembalikan ke tabel 'event'
          supabase.from("assesi").select("*", { count: "exact", head: true })
        ]);

        setJumlahAssesor(countAssesor || 0);
        setJumlahSkema(countSkema || 0);
        setJumlahSertifikasi(countSertifikasi || 0);
        setJumlahAssesi(countAssesi || 0);
      } catch (error) {
        console.error("Gagal mengambil data statistik", error);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/admin/login");
  };

  const toggleSidebar = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMenu = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? "" : menuName);
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
            <a href="#" className="sidebar-toggle" onClick={toggleSidebar} role="button">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </a>
            <div className="navbar-custom-menu">
              <ul className="nav navbar-nav navbar-right">
                <li>
                  <a className="btn btn-danger" href="#" onClick={handleLogout} style={{ marginRight: '20px', marginTop: '8px', padding: '6px 12px' }}>
                    Log Out superadmin
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </header>

        <aside className="main-sidebar">
          <section className="sidebar" style={{ height: "auto" }}>
            <div className="user-panel" style={{ height: "70px" }}>
              <div className="pull-left info" style={{ left: "0px" }}>
                <img src="/logo.png" alt="Logo LSP XYZ" width="200" height="35" />
                <div style={{ height: "30px" }}></div>
              </div>
            </div>
            
            <ul className="sidebar-menu">
              <li className={openMenu === "" ? "active" : ""}>
                <Link href="/admin/dashboard"><i className="fa fa-home"></i> <span>Home</span></Link>
              </li>
              
              <li className={`treeview ${openMenu === 'sertifikasi' ? 'active' : ''}`}>
                <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('sertifikasi'); }}>
                  <i className="fa fa-cogs"></i> <span>Sertifikasi</span> 
                  <span className="pull-right-container"><i className="fa fa-angle-left pull-right"></i></span>
                </a>
                <ul className="treeview-menu" style={{ display: openMenu === 'sertifikasi' ? 'block' : 'none' }}>
                  <li><Link href="/admin/event/tambah"><i className="fa fa-circle-o"></i> Tambah Event</Link></li>
                  <li><Link href="/admin/event"><i className="fa fa-circle-o"></i> Lihat/Edit Event</Link></li>
                </ul>
              </li>

              <li className={`treeview ${openMenu === 'skema' ? 'active' : ''}`}>
                <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('skema'); }}>
                  <i className="fa fa-book"></i> <span>Skema</span> 
                  <span className="pull-right-container"><i className="fa fa-angle-left pull-right"></i></span>
                </a>
                <ul className="treeview-menu" style={{ display: openMenu === 'skema' ? 'block' : 'none' }}>
                  <li><Link href="/admin/skema"><i className="fa fa-circle-o"></i> Skema Sertifikasi</Link></li>
                </ul>
              </li>

              <li className={`treeview ${openMenu === 'assesor' ? 'active' : ''}`}>
                <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('assesor'); }}>
                  <i className="fa fa-users"></i> <span>Assesor</span> 
                  <span className="pull-right-container"><i className="fa fa-angle-left pull-right"></i></span>
                </a>
                <ul className="treeview-menu" style={{ display: openMenu === 'assesor' ? 'block' : 'none' }}>
                  <li><Link href="/admin/assesor"><i className="fa fa-circle-o"></i> Assesor</Link></li>
                </ul>
              </li>

              <li className={`treeview ${openMenu === 'assesi' ? 'active' : ''}`}>
                <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('assesi'); }}>
                  <i className="fa fa-users"></i> <span>Assesi</span> 
                  <span className="pull-right-container"><i className="fa fa-angle-left pull-right"></i></span>
                </a>
                <ul className="treeview-menu" style={{ display: openMenu === 'assesi' ? 'block' : 'none' }}>
                  <li><Link href="/admin/assesi"><i className="fa fa-circle-o"></i> Assesi</Link></li>
                </ul>
              </li>

              <li className={`treeview ${openMenu === 'tuk' ? 'active' : ''}`}>
                <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('tuk'); }}>
                  <i className="fa fa-building"></i> <span>Tuk</span> 
                  <span className="pull-right-container"><i className="fa fa-angle-left pull-right"></i></span>
                </a>
                <ul className="treeview-menu" style={{ display: openMenu === 'tuk' ? 'block' : 'none' }}>
                  <li><Link href="/admin/tuk"><i className="fa fa-circle-o"></i> Admin TUK</Link></li>
                </ul>
              </li>

              <li>
                <Link href="/admin/users"><i className="fa fa-user-plus"></i> <span>Kelola Users</span></Link>
              </li>
              <li>
                <a href="#" onClick={handleLogout}><i className="fa fa-sign-out"></i> <span>Sign Out</span></a>
              </li>
            </ul>
          </section>
        </aside>

        <div className="content-wrapper" style={{ minHeight: "614px" }}>
          <section className="content-header">
            <h1>lspxyz.com</h1>
            <ol className="breadcrumb">
              <li className="active">lspxyz.com</li>
            </ol>
          </section>

          <section className="content">
            <div className="row">
              <div className="col-md-12">
                <div className="box box-primary">
                  <div className="box-header with-border">
                    <h3 className="box-title">Shortcuts</h3>
                  </div>
                  <div className="box-body">
                    <a className="btn btn-app" href="#"><span className="badge bg-purple"></span><i className="fa fa-user"></i> Account</a>
                    <a href="#" className="btn btn-app"><span className="badge bg-purple"></span><i className="fa fa-download"></i> Simpan Dashboard</a>
                    <a className="btn btn-app" href="#" onClick={handleLogout}><span className="badge bg-purple"></span><i className="fa fa-sign-out"></i> Logout</a>
                  </div>
                </div>
              </div>

              <div className="col-md-12">
                <div id="reportPage">
                  <div className="box box-primary">
                    <div className="box-header with-border">
                      <h3 className="box-title">Dashboards</h3>
                    </div>
                    <div className="box-body">
                      <div className="row">
                        <div className="col-md-6">
                          <table className="table" style={{ width: "100%" }}>
                            <tbody>
                              <tr>
                                <td>Periode :</td>
                                <td>:</td>
                                <td>
                                  <input type="date" className="form-control" style={{ display: 'inline-block', width: '130px' }} /> s/d
                                  <input type="date" className="form-control" style={{ display: 'inline-block', width: '130px', marginLeft: "5px" }} />&nbsp;
                                  <button className="btn btn-primary" type="button" style={{ marginLeft: "5px" }}>Reset</button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="nav-tabs-custom">
                        <ul className="nav nav-tabs">
                          <li className="active"><a href="#tab_1" data-toggle="tab">Data</a></li>
                        </ul>
                        <div className="tab-content">
                          <div className="tab-pane active" id="tab_1">
                            <div className="row">
                              <div className="col-md-3">
                                <div className="info-box">
                                  <Link href="/admin/skema"><span className="info-box-icon bg-blue"><i className="fa fa-book"></i></span></Link>
                                  <div className="info-box-content">
                                    <span className="info-box-text">Skema<br />Aktif</span>
                                    <span className="info-box-number">{jumlahSkema}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="info-box">
                                  <Link href="/admin/event"><span className="info-box-icon bg-red"><i className="fa fa-book"></i></span></Link>
                                  <div className="info-box-content">
                                    <span className="info-box-text">Event</span>
                                    <span className="info-box-number">{jumlahSertifikasi}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="info-box">
                                  <Link href="/admin/assesor"><span className="info-box-icon bg-green"><i className="fa fa-user"></i></span></Link>
                                  <div className="info-box-content">
                                    <span className="info-box-text">Asesor</span>
                                    <span className="info-box-number">{jumlahAssesor}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="info-box">
                                  <Link href="/admin/assesi"><span className="info-box-icon bg-purple"><i className="fa fa-users"></i></span></Link>
                                  <div className="info-box-content">
                                    <span className="info-box-text">Peserta</span>
                                    <span className="info-box-number">{jumlahAssesi}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="main-footer">
          <div className="pull-right hidden-xs">
            Next.js Version: <strong>16.2.9</strong>
          </div>
          <strong>© LSP XYZ {new Date().getFullYear()}</strong> All rights reserved.
        </footer>
      </div>
    </div>
  );
}