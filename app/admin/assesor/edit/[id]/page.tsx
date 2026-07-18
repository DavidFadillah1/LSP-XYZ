"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function EditAssesor() {
  const router = useRouter();
  const params = useParams();
  const assesorId = params.id as string;

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState("assesor");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    no_registrasi: "",
    no_sertifikat: "",
    telepon: "",
    provinsi: "",
    is_asesor_lsp: false,
    is_anggota_pleno: false
  });

  useEffect(() => {
    const fetchAssesor = async () => {
      setIsLoading(true);
      try {
        const { data: user, error } = await supabase.from("users").select("*").eq("id", assesorId).single();
        if (error) throw error;
        if (user) {
          setFormData({
            nama: user.nama || "",
            email: user.email || "",
            no_registrasi: user.no_registrasi || "",
            no_sertifikat: user.no_sertifikat || "",
            telepon: user.telepon || "",
            provinsi: user.provinsi || "",
            is_asesor_lsp: user.is_asesor_lsp || false,
            is_anggota_pleno: user.is_anggota_pleno || false
          });
        }
      } catch (err) {
        console.error("Gagal menarik data asesor:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (assesorId) fetchAssesor();
  }, [assesorId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("users").update(formData).eq("id", assesorId);
      if (error) throw error;
      alert("Data asesor berhasil diubah!");
      router.push("/admin/assesor");
    } catch (err: any) {
      alert("Gagal merubah data: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div suppressHydrationWarning className={`skin-blue ${!isSidebarOpen ? 'sidebar-collapse' : ''}`} style={{ height: "auto", minHeight: "100vh" }}>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/adminlte.min.css" rel="stylesheet" />
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/lib.min.css" rel="stylesheet" />
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/app.min.css" rel="stylesheet" />
      
      <div className="wrapper">
        <header className="main-header">
          <Link href="/admin/dashboard" className="logo"><b>lspxyz.com</b></Link>
          <nav className="navbar navbar-static-top" role="navigation">
            <a href="#" className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)} role="button">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span><span className="icon-bar"></span><span className="icon-bar"></span>
            </a>
            <div className="navbar-custom-menu">
              <ul className="nav navbar-nav navbar-right">
                <li><a className="btn btn-danger" href="#" onClick={() => { localStorage.clear(); router.push("/admin/login"); }} style={{ marginRight: '20px', marginTop: '8px', padding: '6px 12px' }}>Log Out superadmin</a></li>
              </ul>
            </div>
          </nav>
        </header>

        <aside className="main-sidebar">
          <section className="sidebar">
            <div className="user-panel" style={{ height: "70px" }}>
              <div className="pull-left info" style={{ left: "0px" }}>
                <img src="/logo.png" alt="Logo" width="200" height="35" />
              </div>
            </div>
            <ul className="sidebar-menu">
              <li><Link href="/admin/dashboard"><i className="fa fa-home"></i> <span>Home</span></Link></li>
              <li className="treeview"><Link href="/admin/event"><i className="fa fa-cogs"></i> <span>Sertifikasi</span></Link></li>
              <li className="treeview"><Link href="/admin/skema"><i className="fa fa-book"></i> <span>Skema</span></Link></li>
              <li className={`active treeview ${openMenu === 'assesor' ? 'active' : ''}`}>
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

        <div className="content-wrapper">
          <section className="content">
            <div className="row">
              <div className="col-md-8">
                
                {/* FORM UBAH ASSESOR PERSIS SEPERTI FOTO */}
                <div className="box box-primary" style={{ borderTopColor: "#fff" }}>
                  <div className="box-header with-border" style={{ backgroundColor: "#f9f9f9" }}>
                    <h3 className="box-title" style={{ fontSize: "20px", fontWeight: "normal" }}>Form Ubah Assesor</h3>
                  </div>
                  
                  {isLoading ? (
                    <div className="box-body text-center"><p>Memuat Data...</p></div>
                  ) : (
                    <form onSubmit={handleSimpan}>
                      <div className="box-body" style={{ padding: "20px" }}>
                        
                        <div className="form-group">
                          <label style={{ fontWeight: "bold" }}>Nama Assesor</label>
                          <input type="text" className="form-control" name="nama" value={formData.nama} onChange={handleChange} required />
                        </div>
                        
                        <div className="form-group">
                          <label style={{ fontWeight: "bold" }}>Email Assesor</label>
                          <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        
                        <div className="form-group">
                          <label style={{ fontWeight: "bold" }}>Nomor Registrasi (MET)</label>
                          <input type="text" className="form-control" name="no_registrasi" value={formData.no_registrasi} onChange={handleChange} />
                        </div>
                        
                        <div className="form-group">
                          <label style={{ fontWeight: "bold" }}>Nomor Sertifikat</label>
                          <input type="text" className="form-control" name="no_sertifikat" value={formData.no_sertifikat} onChange={handleChange} />
                        </div>
                        
                        <div className="form-group">
                          <label style={{ fontWeight: "bold" }}>Telepon</label>
                          <input type="text" className="form-control" name="telepon" value={formData.telepon} onChange={handleChange} />
                        </div>
                        
                        <div className="form-group">
                          <label style={{ fontWeight: "bold" }}>Provinsi</label>
                          <input type="text" className="form-control" name="provinsi" value={formData.provinsi} onChange={handleChange} />
                        </div>
                        
                        <div className="form-group" style={{ marginTop: "20px" }}>
                          <div className="checkbox">
                            <label style={{ color: "#666" }}>
                              <input type="checkbox" name="is_asesor_lsp" checked={formData.is_asesor_lsp} onChange={handleChange} /> Jadikan Sebagai Assesor LSP
                            </label>
                          </div>
                          <div className="checkbox">
                            <label style={{ color: "#666" }}>
                              <input type="checkbox" name="is_anggota_pleno" checked={formData.is_anggota_pleno} onChange={handleChange} /> Jadikan Sebagai Anggota Pleno
                            </label>
                          </div>
                        </div>

                      </div>
                      
                      <div className="box-footer" style={{ backgroundColor: "#f9f9f9", padding: "15px 20px" }}>
                        <button type="button" onClick={() => router.push('/admin/assesor')} className="btn btn-default" style={{ marginRight: "10px", padding: "8px 20px" }}>Batal</button>
                        <button type="submit" className="btn btn-primary" style={{ backgroundColor: "#3c8dbc", borderColor: "#367fa9", padding: "8px 20px" }} disabled={isSubmitting}>
                          {isSubmitting ? "Menyimpan..." : "Update Assesor"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}