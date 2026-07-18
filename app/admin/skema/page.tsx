"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function KelolaSkema() {
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState("skema");
  
  const [kodeSkema, setKodeSkema] = useState("");
  const [judulSkema, setJudulSkema] = useState("");
  const [sektor, setSektor] = useState("Keuangan");
  const [jenisSkema, setJenisSkema] = useState("Klaster");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [skemaList, setSkemaList] = useState<any[]>([]);
  const [fetchingSkema, setFetchingSkema] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSkema = async () => {
    setFetchingSkema(true);
    try {
      // MEMPERBAIKI NAMA TABEL MENJADI 'skema' KEMBALI
      const { data, error } = await supabase
        .from("skema")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setSkemaList(data);
    } catch (err) {
      console.error("Gagal mengambil data Skema:", err);
    } finally {
      setFetchingSkema(false);
    }
  };

  useEffect(() => {
    fetchSkema();
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

  const handleSimpanSkema = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const { error } = await supabase
        .from("skema")
        .insert([{ 
          kode_skema: kodeSkema, 
          judul_skema: judulSkema, 
          sektor: sektor, 
          jenis_skema: jenisSkema 
        }]);

      if (error) {
        setIsError(true);
        if (error.code === '23505') {
          setMessage("Gagal: Nomor Skema tersebut sudah terdaftar!");
        } else {
          setMessage("Gagal menyimpan data: " + error.message);
        }
      } else {
        setMessage("Data Skema berhasil ditambahkan!");
        setKodeSkema("");
        setJudulSkema("");
        setSektor("Keuangan");
        setJenisSkema("Klaster");
        fetchSkema(); 
      }
    } catch (err) {
      setIsError(true);
      setMessage("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkema = async (id: string, kode: string) => {
    if (window.confirm(`Hapus Skema ${kode}? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        const { error } = await supabase.from("skema").delete().eq("id", id);
        if (error) throw error;
        fetchSkema();
      } catch (err: any) {
        alert("Gagal menghapus Skema: " + err.message);
      }
    }
  };

  const filteredSkemaList = skemaList.filter((skema) => {
    const term = searchTerm.toLowerCase();
    return (
      skema.kode_skema.toLowerCase().includes(term) ||
      skema.judul_skema.toLowerCase().includes(term) ||
      (skema.sektor && skema.sektor.toLowerCase().includes(term)) ||
      (skema.jenis_skema && skema.jenis_skema.toLowerCase().includes(term))
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
        .btn-group { display: flex; }
        .btn-group a { margin-right: 3px; }
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
                  <li className="active"><Link href="/admin/skema"><i className="fa fa-circle-o"></i> Skema Sertifikasi</Link></li>
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
            <h1>Master Skema Sertifikasi</h1>
            <ol className="breadcrumb">
              <li><Link href="/admin/dashboard">Home</Link></li>
              <li className="active">Skema Sertifikasi</li>
            </ol>
          </section>

          <section className="content">
            <div className="row">
              {/* FORM TAMBAH SKEMA DIKEMBALIKAN KE HALAMAN INI AGAR TIDAK 404 */}
              <div className="col-md-4">
                <div className="box box-primary">
                  <div className="box-header with-border">
                    <h3 className="box-title">Tambah Skema</h3>
                  </div>
                  <form role="form" onSubmit={handleSimpanSkema}>
                    <div className="box-body">
                      {message && (
                        <div className={`alert ${isError ? "alert-danger" : "alert-success"}`} style={{ padding: "10px", marginBottom: "15px" }}>
                          {message}
                        </div>
                      )}
                      <div className="form-group">
                        <label>Nomor Skema</label>
                        <input type="text" className="form-control" placeholder="Contoh: SKM/1995/00011/3/2021/1" value={kodeSkema} onChange={(e) => setKodeSkema(e.target.value.toUpperCase())} required />
                      </div>
                      <div className="form-group">
                        <label>Judul Skema</label>
                        <input type="text" className="form-control" placeholder="Contoh: Pelaksanaan Proses Pinjaman" value={judulSkema} onChange={(e) => setJudulSkema(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Jenis Skema</label>
                        <select className="form-control" value={jenisSkema} onChange={(e) => setJenisSkema(e.target.value)}>
                          <option value="Klaster">Klaster</option>
                          <option value="Okupasi">Okupasi</option>
                          <option value="KKNI">KKNI</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Sektor</label>
                        <select className="form-control" value={sektor} onChange={(e) => setSektor(e.target.value)}>
                          <option value="Keuangan">Keuangan</option>
                          <option value="Keuangan Mikro">Keuangan Mikro</option>
                          <option value="Perbankan">Perbankan</option>
                        </select>
                      </div>
                    </div>
                    <div className="box-footer">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        <i className="fa fa-save"></i> {loading ? "Menyimpan..." : "Simpan Skema"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="col-md-8">
                <div className="container-fluid gc-container" style={{ padding: 0 }}>
                  <div className="table-section">
                    <div className="table-label">
                      <div className="floatL l5">Data Skema Sertifikasi</div>
                      <div className="clear"></div>
                    </div>
                    <div className="table-container">
                      
                      <div className="header-tools" style={{ padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="floatL">
                          <button className="btn btn-default" type="button" onClick={fetchSkema}>
                            <i className="fa fa-refresh"></i> &nbsp; Segarkan
                          </button>
                        </div>
                        <div className="floatR">
                          <div className="input-group" style={{ width: '250px' }}>
                            <input 
                              type="text" 
                              className="form-control" 
                              placeholder="Cari Skema..." 
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className="input-group-addon"><i className="fa fa-search"></i></span>
                          </div>
                        </div>
                        <div className="clear"></div>
                      </div>

                      <div className="scroll-if-required">
                        <table className="table table-bordered grocery-crud-table table-hover">
                          <thead>
                            <tr>
                              <th width="15%">Pilihan</th>
                              <th width="25%">Nomor Skema</th>
                              <th width="30%">Judul Skema</th>
                              <th width="15%">Jenis Skema</th>
                              <th width="15%">Sektor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fetchingSkema ? (
                              <tr><td colSpan={5} className="text-center">Memuat data...</td></tr>
                            ) : filteredSkemaList.length === 0 ? (
                              <tr><td colSpan={5} className="text-center text-muted">
                                {searchTerm ? `Tidak ditemukan hasil untuk "${searchTerm}"` : "Tidak ada data Skema."}
                              </td></tr>
                            ) : (
                              filteredSkemaList.map((skema) => (
                                <tr key={skema.id}>
                                  <td>
                                    <div className="only-desktops" style={{ whiteSpace: "nowrap" }}>
                                      <button className="btn btn-default btn-sm" style={{ marginRight: '5px' }}>
                                        <i className="fa fa-pencil"></i> Ubah
                                      </button>
                                      <button 
                                        className="btn btn-danger btn-sm" 
                                        onClick={() => handleDeleteSkema(skema.id, skema.kode_skema)}
                                      >
                                        <i className="fa fa-trash-o"></i> Hapus
                                      </button>
                                    </div>
                                  </td>
                                  <td><strong>{skema.kode_skema}</strong></td>
                                  <td>{skema.judul_skema}</td>
                                  <td>{skema.jenis_skema || '-'}</td>
                                  <td>{skema.sektor || '-'}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="footer-tools">
                        <div className="floatR r10 t30">
                          Total Data: <span className="current-total-results">{filteredSkemaList.length}</span>
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