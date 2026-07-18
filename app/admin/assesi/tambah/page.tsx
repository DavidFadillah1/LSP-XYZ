"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function TambahAssesi() {
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState("assesi"); 
  const [loading, setLoading] = useState(false);

  // State untuk menyimpan opsi dropdown dari database
  const [eventOptions, setEventOptions] = useState<any[]>([]);
  const [skemaOptions, setSkemaOptions] = useState<any[]>([]);
  const [assesorOptions, setAssesorOptions] = useState<any[]>([]);
  const [userOptions, setUserOptions] = useState<any[]>([]);

  // State untuk form data
  const [formData, setFormData] = useState({
    sertifikasi_event_id: "",
    no_peserta: "",
    nama_peserta: "",
    email: "",
    skema_sertifikasi_id: "",
    assesor_id: "",
    user_id: "",
    no_blanko: "",
    no_sertifikat: "",
    no_registrasi: "",
    tanggal_berlaku: "",
    tanggal_expired: ""
  });

  // Mengambil data untuk dropdown saat halaman dimuat
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Ambil Data Event
        const { data: eventData } = await supabase.from("event").select("id, nama_event").order("nama_event");
        if (eventData) setEventOptions(eventData);

        // Ambil Data Skema
        const { data: skemaData } = await supabase.from("skema").select("id, judul_skema").order("judul_skema");
        if (skemaData) setSkemaOptions(skemaData);

        // Ambil Data Assesor (Users dengan role asesor)
        const { data: assesorData } = await supabase.from("users").select("id, nama, email").eq("role", "asesor").order("nama");
        if (assesorData) setAssesorOptions(assesorData);

        // Ambil Semua Data User untuk Dropdown User ID
        const { data: userData } = await supabase.from("users").select("id, email").order("email");
        if (userData) setUserOptions(userData);
      } catch (error) {
        console.error("Gagal mengambil data dropdown:", error);
      }
    };

    fetchDropdownData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSimpan = async (e: React.FormEvent, goBack: boolean) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("assesi").insert([{
        sertifikasi_event_id: formData.sertifikasi_event_id,
        no_peserta: formData.no_peserta,
        nama_peserta: formData.nama_peserta,
        email: formData.email,
        skema_sertifikasi_id: formData.skema_sertifikasi_id,
        assesor_id: formData.assesor_id,
        user_id: formData.user_id,
        no_blanko: formData.no_blanko,
        no_sertifikat: formData.no_sertifikat,
        no_registrasi: formData.no_registrasi,
        tanggal_berlaku: formData.tanggal_berlaku || null,
        tanggal_expired: formData.tanggal_expired || null
      }]);

      if (error) throw error;

      alert("Data Assesi berhasil ditambahkan!");
      
      if (goBack) {
        router.push("/admin/assesi");
      } else {
        // Jika hanya "Simpan", kosongkan form agar bisa nambah lagi
        setFormData({
          sertifikasi_event_id: "", no_peserta: "", nama_peserta: "", email: "", skema_sertifikasi_id: "",
          assesor_id: "", user_id: "", no_blanko: "", no_sertifikat: "", no_registrasi: "", tanggal_berlaku: "", tanggal_expired: ""
        });
      }
    } catch (err: any) {
      alert("Terdapat kesalahan saat memasukkan data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/grocery_crud/themes/bootstrap/css/common.css" rel="stylesheet" />
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/grocery_crud/themes/bootstrap/css/add-edit-form.css" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{__html: `
        .b10 { margin-right: 5px; }
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

              <li className={`treeview active`}>
                <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('assesi'); }}>
                  <i className="fa fa-users"></i> <span>Assesi</span> 
                  <span className="pull-right-container"><i className="fa fa-angle-left pull-right"></i></span>
                </a>
                <ul className="treeview-menu" style={{ display: 'block' }}>
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
              <li><Link href="/admin/dashboard">Home</Link></li>
              <li className="active">Assesi</li>
            </ol>
          </section>

          <section className="content">
            <div className="crud-form">
              <div className="gc-container">
                <div className="row">
                  <div className="col-md-12">
                    <div className="table-label">
                      <div className="floatL l5">Tambah Assesi</div>
                      <div className="clear"></div>
                    </div>
                    <div className="form-container table-container">
                      <form className="form-horizontal" onSubmit={(e) => handleSimpan(e, true)}>
                        
                        <div className="form-group">
                          <label className="col-sm-3 control-label">Sertifikasi event id</label>
                          <div className="col-sm-9">
                            <select className="form-control" name="sertifikasi_event_id" value={formData.sertifikasi_event_id} onChange={handleChange}>
                              <option value=""></option>
                              {eventOptions.map((evt) => (
                                <option key={evt.id} value={evt.nama_event}>{evt.nama_event}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="col-sm-3 control-label">No peserta</label>
                          <div className="col-sm-9">
                            <input className="form-control" name="no_peserta" type="text" value={formData.no_peserta} onChange={handleChange} maxLength={50} />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="col-sm-3 control-label">Nama peserta</label>
                          <div className="col-sm-9">
                            <input className="form-control" name="nama_peserta" type="text" value={formData.nama_peserta} onChange={handleChange} maxLength={255} />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="col-sm-3 control-label">Email</label>
                          <div className="col-sm-9">
                            <input className="form-control" name="email" type="text" value={formData.email} onChange={handleChange} maxLength={255} />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="col-sm-3 control-label">Skema sertifikasi id</label>
                          <div className="col-sm-9">
                            <select className="form-control" name="skema_sertifikasi_id" value={formData.skema_sertifikasi_id} onChange={handleChange}>
                              <option value=""></option>
                              {skemaOptions.map((skm) => (
                                <option key={skm.id} value={skm.judul_skema}>{skm.judul_skema}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="col-sm-3 control-label">Assesor id</label>
                          <div className="col-sm-9">
                            <select className="form-control" name="assesor_id" value={formData.assesor_id} onChange={handleChange}>
                              <option value=""></option>
                              {assesorOptions.map((asr) => (
                                <option key={asr.id} value={asr.nama || asr.email}>{asr.nama || asr.email}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="col-sm-3 control-label">User id</label>
                          <div className="col-sm-9">
                            <select className="form-control" name="user_id" value={formData.user_id} onChange={handleChange}>
                              <option value=""></option>
                              {userOptions.map((usr) => (
                                <option key={usr.id} value={usr.email}>{usr.email}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="col-sm-3 control-label">No blanko</label>
                          <div className="col-sm-9">
                            <input className="form-control" name="no_blanko" type="text" value={formData.no_blanko} onChange={handleChange} maxLength={50} />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="col-sm-3 control-label">No sertifikat</label>
                          <div className="col-sm-9">
                            <input className="form-control" name="no_sertifikat" type="text" value={formData.no_sertifikat} onChange={handleChange} maxLength={50} />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="col-sm-3 control-label">No registrasi</label>
                          <div className="col-sm-9">
                            <input className="form-control" name="no_registrasi" type="text" value={formData.no_registrasi} onChange={handleChange} maxLength={50} />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="col-sm-3 control-label">Tanggal berlaku</label>
                          <div className="col-sm-9">
                            <input className="form-control" name="tanggal_berlaku" type="date" value={formData.tanggal_berlaku} onChange={handleChange} style={{ display: 'inline-block', width: 'auto', marginRight: '10px' }} />
                            <small className="text-muted">(yyyy-mm-dd)</small>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="col-sm-3 control-label">Tanggal expired</label>
                          <div className="col-sm-9">
                            <input className="form-control" name="tanggal_expired" type="date" value={formData.tanggal_expired} onChange={handleChange} style={{ display: 'inline-block', width: 'auto', marginRight: '10px' }} />
                            <small className="text-muted">(yyyy-mm-dd)</small>
                          </div>
                        </div>

                        <div className="form-group">
                          <div className="col-sm-offset-3 col-sm-9">
                            <button className="btn btn-default btn-success b10" type="button" onClick={(e) => handleSimpan(e, false)} disabled={loading}>
                              <i className="fa fa-check"></i> {loading ? "Menyimpan..." : "Simpan"}
                            </button>
                            <button className="btn btn-info b10" type="submit" disabled={loading}>
                              <i className="fa fa-rotate-left"></i> {loading ? "Menyimpan..." : "Simpan dan Kembali"}
                            </button>
                            <Link href="/admin/assesi" className="btn btn-default cancel-button b10">
                              <i className="fa fa-warning"></i> Batal
                            </Link>
                          </div>
                        </div>

                      </form>
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