"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DaftarAssesi() {
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState("assesi"); 

  const [assesiList, setAssesiList] = useState<any[]>([]);
  const [fetchingAssesi, setFetchingAssesi] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAssesi = async () => {
    setFetchingAssesi(true);
    try {
      // Mengambil data dari tabel 'assesi'
      const { data, error } = await supabase
        .from("assesi")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;
      if (data) setAssesiList(data);
    } catch (err) {
      console.error("Gagal mengambil data Assesi:", err);
      setAssesiList([]); 
    } finally {
      setFetchingAssesi(false);
    }
  };

  useEffect(() => {
    fetchAssesi();
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

  const handleDeleteAssesi = async (id: string, nama: string) => {
    if (window.confirm(`Anda Yakin Akan Hapus Assesi: ${nama}?`)) {
      try {
        const { error } = await supabase.from("assesi").delete().eq("id", id);
        if (error) throw error;
        fetchAssesi();
      } catch (err: any) {
        alert("Gagal menghapus Assesi: " + err.message);
      }
    }
  };

  const filteredAssesiList = assesiList.filter((assesi) => {
    const term = searchTerm.toLowerCase();
    return (
      (assesi.nama_peserta && assesi.nama_peserta.toLowerCase().includes(term)) ||
      (assesi.email && assesi.email.toLowerCase().includes(term)) ||
      (assesi.no_peserta && assesi.no_peserta.toLowerCase().includes(term))
    );
  });

  return (
    <div suppressHydrationWarning className={`skin-blue ${!isSidebarOpen ? 'sidebar-collapse' : ''}`} style={{ height: "auto", minHeight: "100vh" }}>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/adminlte.min.css" rel="stylesheet" />
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/lib.min.css" rel="stylesheet" />
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/app.min.css" rel="stylesheet" />
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/grocery_crud/themes/bootstrap/css/common.css" rel="stylesheet" />
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/grocery_crud/themes/bootstrap/css/list.css" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{__html: `
        .swal2-popup { font-size: 1.6rem !important; }
        .btn-group-custom { display: flex; gap: 4px; }
        .table-responsive { overflow-x: auto; white-space: nowrap; }
        th { font-size: 13px; }
        td { font-size: 13px; vertical-align: middle !important; }
      `}} />

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
                  {/* LINK ASSESI DIPERBAIKI DI SINI */}
                  <li className="active"><Link href="/admin/assesi"><i className="fa fa-circle-o"></i> Assesi</Link></li>
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
            <h1>Assesi</h1>
            <ol className="breadcrumb">
              <li><Link href="/admin/dashboard"><i className="fa fa-home"></i> Home</Link></li>
              <li className="active">Assesi</li>
            </ol>
          </section>

          <section className="content">
            <div className="container-fluid gc-container" style={{ padding: 0 }}>
              <div className="row">
                <div className="col-md-12">
                  <div className="table-section">
                    <div className="table-label">
                      <div className="floatL l5">Assesi</div>
                      <div className="clear"></div>
                    </div>
                    
                    <div className="table-container">
                      <div className="header-tools" style={{ padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div className="floatL">
                          <Link href="/admin/assesi/tambah" className="btn btn-default" style={{ marginRight: '10px' }}>
                            <i className="fa fa-plus"></i> &nbsp; Tambah Assesi
                          </Link>
                          
                          <button className="btn btn-default" type="button" onClick={fetchAssesi}>
                            <i className="fa fa-refresh"></i> &nbsp; Segarkan
                          </button>
                        </div>
                        
                        <div className="floatR" style={{ display: 'flex', gap: '10px' }}>
                          <a className="btn btn-default t5 gc-export" href="#">
                            <i className="fa fa-cloud-download floatL t3"></i>
                            <span className="hidden-xs floatL l5">Ekspor</span>
                          </a>
                          <a className="btn btn-default t5 gc-print" href="#">
                            <i className="fa fa-print floatL t3"></i>
                            <span className="hidden-xs floatL l5">Cetak</span>
                          </a>
                          <div className="input-group" style={{ width: '250px' }}>
                            <input 
                              type="text" 
                              className="form-control" 
                              placeholder="Search Nama/Email..." 
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className="input-group-addon"><i className="fa fa-search"></i></span>
                          </div>
                        </div>
                        <div className="clear"></div>
                      </div>

                      <div className="table-responsive">
                        <table className="table table-bordered grocery-crud-table table-hover">
                          <thead>
                            <tr className="bg-gray">
                              <th style={{ width: '140px' }}>Pilihan</th>
                              <th>Sertifikasi Event ID</th>
                              <th>ID</th>
                              <th>No Peserta</th>
                              <th>Nama Peserta</th>
                              <th>Email</th>
                              <th>Skema Sertifikasi ID</th>
                              <th>Assesor ID</th>
                              <th>User ID</th>
                              <th>No Blanko</th>
                              <th>No Sertifikat</th>
                              <th>No Registrasi</th>
                              <th>Tanggal Berlaku</th>
                              <th>Tanggal Expired</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fetchingAssesi ? (
                              <tr><td colSpan={14} className="text-center">Memuat data...</td></tr>
                            ) : filteredAssesiList.length === 0 ? (
                              <tr><td colSpan={14} className="text-center text-muted">
                                {searchTerm ? `Tidak ditemukan hasil untuk "${searchTerm}"` : "Belum ada data Assesi (atau tabel 'assesi' belum dibuat)."}
                              </td></tr>
                            ) : (
                              filteredAssesiList.map((assesi) => (
                                <tr key={assesi.id}>
                                  <td>
                                    <div className="btn-group-custom">
                                      <Link href={`#`} className="btn btn-default btn-sm" title="Ubah">
                                        <i className="fa fa-pencil"></i>
                                      </Link>
                                      <Link href={`#`} className="btn btn-info btn-sm" title="Dokumen">
                                        <i className="fa fa-image"></i>
                                      </Link>
                                      <Link href={`#`} className="btn btn-success btn-sm" title="View">
                                        <i className="fa fa-eye"></i>
                                      </Link>
                                      <button 
                                        className="btn btn-danger btn-sm" 
                                        title="Hapus"
                                        onClick={() => handleDeleteAssesi(assesi.id, assesi.nama_peserta)}
                                      >
                                        <i className="fa fa-trash-o"></i>
                                      </button>
                                    </div>
                                  </td>
                                  
                                  <td>{assesi.sertifikasi_event_id || '-'}</td>
                                  <td>{assesi.id}</td>
                                  <td><strong>{assesi.no_peserta || '-'}</strong></td>
                                  <td>{assesi.nama_peserta || '-'}</td>
                                  <td>{assesi.email || '-'}</td>
                                  <td>{assesi.skema_sertifikasi_id || '-'}</td>
                                  <td>{assesi.assesor_id || '-'}</td>
                                  <td>{assesi.user_id || '-'}</td>
                                  <td>{assesi.no_blanko || '-'}</td>
                                  <td>{assesi.no_sertifikat || '-'}</td>
                                  <td>{assesi.no_registrasi || '-'}</td>
                                  <td>{assesi.tanggal_berlaku ? new Date(assesi.tanggal_berlaku).toLocaleDateString('id-ID') : '-'}</td>
                                  <td>{assesi.tanggal_expired ? new Date(assesi.tanggal_expired).toLocaleDateString('id-ID') : '-'}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="footer-tools">
                        <div className="floatR r10 t30">
                          Halaman <span className="paging-starts">1</span> - <span className="paging-ends">100</span> dari <span className="current-total-results">{filteredAssesiList.length}</span> total 
                        </div>
                        <div className="clear"></div>
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