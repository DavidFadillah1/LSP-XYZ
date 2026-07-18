"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function KelolaTUK() {
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState("tuk");
  
  const [kodeTuk, setKodeTuk] = useState("");
  const [namaTuk, setNamaTuk] = useState("");
  const [alamat, setAlamat] = useState("");
  const [jenisTuk, setJenisTuk] = useState("Sewaktu");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [tukList, setTukList] = useState<any[]>([]);
  const [fetchingTuk, setFetchingTuk] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); 

  const fetchTuk = async () => {
    setFetchingTuk(true);
    try {
      const { data, error } = await supabase
        .from("tuk")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setTukList(data);
    } catch (err) {
      console.error("Gagal mengambil data TUK:", err);
    } finally {
      setFetchingTuk(false);
    }
  };

  useEffect(() => {
    fetchTuk();
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

  const handleSimpanTuk = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const { error } = await supabase
        .from("tuk")
        .insert([{ kode_tuk: kodeTuk, nama_tuk: namaTuk, alamat: alamat, jenis_tuk: jenisTuk }]);

      if (error) {
        setIsError(true);
        if (error.code === '23505') {
          setMessage("Gagal: Kode TUK tersebut sudah terdaftar!");
        } else {
          setMessage("Gagal menyimpan data: " + error.message);
        }
      } else {
        setMessage("Data TUK berhasil ditambahkan!");
        setKodeTuk("");
        setNamaTuk("");
        setAlamat("");
        setJenisTuk("Sewaktu");
        fetchTuk(); 
      }
    } catch (err) {
      setIsError(true);
      setMessage("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTuk = async (id: string, kode: string) => {
    if (window.confirm(`Hapus TUK ${kode}? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        const { error } = await supabase.from("tuk").delete().eq("id", id);
        if (error) throw error;
        fetchTuk();
      } catch (err: any) {
        alert("Gagal menghapus TUK: " + err.message);
      }
    }
  };

  const filteredTukList = tukList.filter((tuk) => {
    const term = searchTerm.toLowerCase();
    return (
      tuk.kode_tuk.toLowerCase().includes(term) ||
      tuk.nama_tuk.toLowerCase().includes(term) ||
      (tuk.alamat && tuk.alamat.toLowerCase().includes(term)) ||
      tuk.jenis_tuk.toLowerCase().includes(term)
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
              <li>
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
                  <li className="active"><Link href="/admin/tuk"><i className="fa fa-circle-o"></i> Admin TUK</Link></li>
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
            <h1>Kelola Tempat Uji Kompetensi (TUK)</h1>
            <ol className="breadcrumb">
              <li><Link href="/admin/dashboard">Home</Link></li>
              <li className="active">Kelola TUK</li>
            </ol>
          </section>

          <section className="content">
            <div className="row">
              <div className="col-md-4">
                <div className="box box-primary">
                  <div className="box-header with-border">
                    <h3 className="box-title">Tambah Tuk</h3>
                  </div>
                  <form role="form" onSubmit={handleSimpanTuk}>
                    <div className="box-body">
                      {message && (
                        <div className={`alert ${isError ? "alert-danger" : "alert-success"}`} style={{ padding: "10px", marginBottom: "15px" }}>
                          {message}
                        </div>
                      )}
                      <div className="form-group">
                        <label>Kode TUK</label>
                        <input type="text" className="form-control" placeholder="Contoh: TUK-S.001" value={kodeTuk} onChange={(e) => setKodeTuk(e.target.value.toUpperCase())} required />
                      </div>
                      <div className="form-group">
                        <label>Nama TUK</label>
                        <input type="text" className="form-control" placeholder="Contoh: Sewaktu LSP XYZ" value={namaTuk} onChange={(e) => setNamaTuk(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Alamat</label>
                        <textarea className="form-control" rows={3} placeholder="Masukkan alamat lengkap" value={alamat} onChange={(e) => setAlamat(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Jenis TUK</label>
                        <select className="form-control" value={jenisTuk} onChange={(e) => setJenisTuk(e.target.value)}>
                          <option value="Sewaktu">Sewaktu</option>
                          <option value="Mandiri">Mandiri</option>
                          <option value="Tempat Kerja">Tempat Kerja</option>
                        </select>
                      </div>
                    </div>
                    <div className="box-footer">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        <i className="fa fa-save"></i> {loading ? "Menyimpan..." : "Simpan"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="col-md-8">
                <div className="container-fluid gc-container" style={{ padding: 0 }}>
                  <div className="table-section">
                    <div className="table-label">
                      <div className="floatL l5">Data TUK</div>
                      <div className="clear"></div>
                    </div>
                    <div className="table-container">
                      
                      <div className="header-tools" style={{ padding: '10px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="floatL">
                          <button className="btn btn-default" type="button" onClick={fetchTuk}>
                            <i className="fa fa-refresh"></i> &nbsp; Segarkan
                          </button>
                        </div>
                        <div className="floatR">
                          <div className="input-group" style={{ width: '250px' }}>
                            <input 
                              type="text" 
                              className="form-control" 
                              placeholder="Cari TUK..." 
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
                              <th style={{ width: '15%' }}>Pilihan</th>
                              <th style={{ width: '15%' }}>Kode TUK</th>
                              <th style={{ width: '25%' }}>Nama TUK</th>
                              <th style={{ width: '30%' }}>Alamat</th>
                              <th style={{ width: '15%' }}>Jenis TUK</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fetchingTuk ? (
                              <tr><td colSpan={5} className="text-center">Memuat data...</td></tr>
                            ) : filteredTukList.length === 0 ? (
                              <tr><td colSpan={5} className="text-center text-muted">
                                {searchTerm ? `Tidak ditemukan hasil untuk "${searchTerm}"` : "Tidak ada data TUK."}
                              </td></tr>
                            ) : (
                              filteredTukList.map((tuk) => (
                                <tr key={tuk.id}>
                                  <td>
                                    <div className="only-desktops" style={{ whiteSpace: "nowrap" }}>
                                      <button className="btn btn-default btn-sm" style={{ marginRight: '5px' }}>
                                        <i className="fa fa-pencil"></i> Ubah
                                      </button>
                                      <button 
                                        className="btn btn-danger btn-sm" 
                                        onClick={() => handleDeleteTuk(tuk.id, tuk.kode_tuk)}
                                      >
                                        <i className="fa fa-trash-o"></i> Hapus
                                      </button>
                                    </div>
                                  </td>
                                  <td>{tuk.kode_tuk}</td>
                                  <td>{tuk.nama_tuk}</td>
                                  <td>{tuk.alamat || '-'}</td>
                                  <td>{tuk.jenis_tuk}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="footer-tools">
                        <div className="floatR r10 t30">
                          Total Data Ditampilkan: <span className="current-total-results">{filteredTukList.length}</span>
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