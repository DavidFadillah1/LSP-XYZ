"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function KelolaUsers() {
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState(""); 
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("asesi");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [usersList, setUsersList] = useState<any[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setUsersList(data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setFetchingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.clear();
    router.push("/admin/login");
  };

  const toggleSidebar = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMenu = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? "" : menuName);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("users")
        .insert([{ email: email, password: password, role: role }]);

      if (error) {
        setMessage("Gagal mendaftarkan pengguna: " + error.message);
      } else {
        setMessage("Pengguna berhasil didaftarkan!");
        setEmail("");
        setPassword("");
        setRole("asesi");
        fetchUsers(); 
      }
    } catch (err) {
      setMessage("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  // FITUR BARU: Hapus User
  const handleDeleteUser = async (id: string, userEmail: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun ${userEmail}?`)) return;
    
    try {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) throw error;
      alert("Akun berhasil dihapus!");
      fetchUsers();
    } catch (err: any) {
      alert("Gagal menghapus akun: " + err.message);
    }
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
                  <li><Link href="/admin/tuk"><i className="fa fa-circle-o"></i> Admin TUK</Link></li>
                </ul>
              </li>

              <li className="active">
                <Link href="/admin/users"><i className="fa fa-user-plus"></i> <span>Kelola Users</span></Link>
              </li>
            </ul>
          </section>
        </aside>

        <div className="content-wrapper" style={{ minHeight: "614px" }}>
          <section className="content-header">
            <h1>Kelola Pengguna</h1>
            <ol className="breadcrumb">
              <li><Link href="/admin/dashboard"><i className="fa fa-home"></i> Home</Link></li>
              <li className="active">Kelola Users</li>
            </ol>
          </section>

          <section className="content">
            <div className="row">
              <div className="col-md-4">
                <div className="box box-primary">
                  <div className="box-header with-border">
                    <h3 className="box-title">Daftarkan Akun Baru</h3>
                  </div>
                  
                  <form role="form" onSubmit={handleRegister}>
                    <div className="box-body">
                      {message && (
                        <div className={`alert ${message.includes("berhasil") ? "alert-success" : "alert-danger"}`} style={{ padding: "10px", marginBottom: "15px" }}>
                          {message}
                        </div>
                      )}
                      
                      <div className="form-group">
                        <label htmlFor="email">Email / Username</label>
                        <input 
                          type="email" 
                          className="form-control" 
                          id="email" 
                          placeholder="Masukkan email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                          type="password" 
                          className="form-control" 
                          id="password" 
                          placeholder="Masukkan password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="role">Hak Akses (Role)</label>
                        <select 
                          className="form-control" 
                          id="role"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                        >
                          <option value="asesi">Asesi (Peserta Ujian)</option>
                          <option value="asesor">Asesor (Penguji)</option>
                          <option value="admin">Admin / Staff</option>
                        </select>
                      </div>
                    </div>

                    <div className="box-footer">
                      <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? "Menyimpan..." : "Simpan Akun"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="col-md-8">
                <div className="box box-success">
                  <div className="box-header with-border">
                    <h3 className="box-title">Daftar Pengguna Terdaftar</h3>
                  </div>
                  <div className="box-body table-responsive">
                    {fetchingUsers ? (
                      <p className="text-center" style={{ padding: "20px" }}>Memuat data pengguna...</p>
                    ) : usersList.length === 0 ? (
                      <p className="text-center text-muted">Belum ada pengguna yang terdaftar.</p>
                    ) : (
                      <table className="table table-bordered table-striped table-hover">
                        <thead>
                          <tr className="bg-gray">
                            <th style={{ width: '5%' }}>No</th>
                            <th>Email / Username</th>
                            <th style={{ width: '15%' }}>Role</th>
                            <th style={{ width: '20%' }}>Tgl Daftar</th>
                            <th style={{ width: '10%' }}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersList.map((user, index) => (
                            <tr key={user.id}>
                              <td>{index + 1}</td>
                              <td>{user.email}</td>
                              <td>
                                <span className={`label ${
                                  user.role === 'superadmin' ? 'label-danger' : 
                                  user.role === 'admin' ? 'label-warning' : 
                                  user.role === 'asesor' ? 'label-success' : 'label-primary'
                                }`} style={{ fontSize: '12px' }}>
                                  {user.role.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                {new Date(user.created_at).toLocaleDateString("id-ID", {
                                  day: "2-digit", month: "short", year: "numeric"
                                })}
                              </td>
                              <td align="center">
                                <button 
                                  className="btn btn-danger btn-sm" 
                                  onClick={() => handleDeleteUser(user.id, user.email)}
                                  title="Hapus Pengguna"
                                >
                                  <i className="fa fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
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