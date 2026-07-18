"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function TambahAssesor() {
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState("assesor"); 
  const [loading, setLoading] = useState(false);

  // State Formulir Tambah Assesor
  const [nama, setNama] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [agama, setAgama] = useState("");
  const [golonganDarah, setGolonganDarah] = useState("");
  const [alamat, setAlamat] = useState("");
  const [telepon, setTelepon] = useState("");
  const [email, setEmail] = useState("");
  const [noRegistrasi, setNoRegistrasi] = useState("");
  const [noSertifikat, setNoSertifikat] = useState("");
  const [noBlanko, setNoBlanko] = useState("");
  const [provinsiId, setProvinsiId] = useState("");
  const [tahunLaporan, setTahunLaporan] = useState("");
  const [masaBerlakuStart, setMasaBerlakuStart] = useState("");
  const [asesorLsp, setAsesorLsp] = useState("N");
  const [anggotaPleno, setAnggotaPleno] = useState("N");

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

  const handleSimpanAssesor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      alert("Email wajib diisi karena digunakan sebagai identitas akun.");
      return;
    }

    setLoading(true);

    try {
      // Masukkan sebagai user dengan role "asesor" (Password default kita set sama dengan email)
      const { error } = await supabase
        .from("users")
        .insert([{ 
          email: email,
          password: email, // Password default
          role: "asesor",
          nama: nama,
          tanggal_lahir: tanggalLahir || null,
          jenis_kelamin: jenisKelamin,
          agama: agama,
          golongan_darah: golonganDarah,
          alamat: alamat,
          telepon: telepon,
          no_registrasi: noRegistrasi,
          no_sertifikat: noSertifikat,
          no_blanko: noBlanko,
          provinsi_id: provinsiId,
          tahun_laporan: tahunLaporan,
          masa_berlaku_start: masaBerlakuStart || null,
          asesor_lsp: asesorLsp,
          anggota_pleno: anggotaPleno
        }]);

      if (error) {
        if (error.code === '23505') {
          throw new Error("Gagal: Email tersebut sudah terdaftar di sistem.");
        }
        throw error;
      }

      alert("Data Assesor berhasil ditambahkan! (Password default adalah email asesor tersebut)");
      router.push("/admin/assesor"); 
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan sistem saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div suppressHydrationWarning className={`skin-blue ${!isSidebarOpen ? 'sidebar-collapse' : ''}`} style={{ height: "auto", minHeight: "100vh" }}>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/adminlte.min.css" rel="stylesheet" />
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/lib.min.css" rel="stylesheet" />
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/app.min.css" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{__html: `
        .form-horizontal .control-label { text-align: left; padding-top: 7px; margin-bottom: 0; }
        .crud-form .form-group { padding: 15px 0; border-bottom: 1px solid #f4f4f4; margin: 0; }
        .crud-form .form-group:last-child { border-bottom: none; }
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
                  <li className="active"><Link href="/admin/assesor"><i className="fa fa-circle-o"></i> Assesor</Link></li>
                </ul>
              </li>

              <li className={`treeview ${openMenu === 'assesi' ? 'active' : ''}`}>
                <a href="#" onClick={(e) => { e.preventDefault(); toggleMenu('assesi'); }}>
                  <i className="fa fa-users"></i> <span>Assesi</span> 
                  <span className="pull-right-container"><i className="fa fa-angle-left pull-right"></i></span>
                </a>
                <ul className="treeview-menu" style={{ display: openMenu === 'assesi' ? 'block' : 'none' }}>
                  <li><Link href="#"><i className="fa fa-circle-o"></i> Assesi</Link></li>
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
            <h1>Assesor</h1>
            <ol className="breadcrumb">
              <li><Link href="/admin/dashboard">Home</Link></li>
              <li><Link href="/admin/assesor">Assesor</Link></li>
              <li className="active">Tambah Assesor</li>
            </ol>
          </section>

          <section className="content">
            <div className="crud-form">
              <div className="box box-primary">
                <div className="box-header with-border" style={{ padding: '15px' }}>
                  <h3 className="box-title" style={{ fontSize: '18px' }}>Tambah Assesor</h3>
                </div>
                
                <form className="form-horizontal" onSubmit={handleSimpanAssesor}>
                  <div className="box-body" style={{ padding: '0 15px' }}>
                    
                    <div className="form-group">
                      <label className="col-sm-3 control-label">Nama Assesor <span className="text-danger">*</span></label>
                      <div className="col-sm-9">
                        <input className="form-control" type="text" maxLength={100} value={nama} onChange={(e)=>setNama(e.target.value)} required />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="col-sm-3 control-label">Tanggal Lahir</label>
                      <div className="col-sm-9">
                        <input className="form-control" type="date" style={{ maxWidth: '250px' }} value={tanggalLahir} onChange={(e)=>setTanggalLahir(e.target.value)} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="col-sm-3 control-label">Jenis Kelamin</label>
                      <div className="col-sm-9">
                        <select className="form-control" style={{ maxWidth: '250px' }} value={jenisKelamin} onChange={(e)=>setJenisKelamin(e.target.value)}>
                          <option value="">Pilih Jenis Kelamin</option>
                          <option value="male">Pria</option>
                          <option value="female">Wanita</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="col-sm-3 control-label">Agama</label>
                      <div className="col-sm-9">
                        <select className="form-control" style={{ maxWidth: '250px' }} value={agama} onChange={(e)=>setAgama(e.target.value)}>
                          <option value="">Pilih Agama</option>
                          <option value="islam">Islam</option>
                          <option value="protestan">Protestan</option>
                          <option value="katolik">Katolik</option>
                          <option value="hindu">Hindu</option>
                          <option value="budha">Budha</option>
                          <option value="konghucu">Konghucu</option>
                          <option value="lain-lain">Lain-lain</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="col-sm-3 control-label">Golongan Darah</label>
                      <div className="col-sm-9">
                        <input className="form-control" type="text" maxLength={5} style={{ maxWidth: '100px' }} placeholder="O / A / B / AB" value={golonganDarah} onChange={(e)=>setGolonganDarah(e.target.value)} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="col-sm-3 control-label">Alamat</label>
                      <div className="col-sm-9">
                        <textarea className="form-control" rows={3} value={alamat} onChange={(e)=>setAlamat(e.target.value)}></textarea>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="col-sm-3 control-label">Telepon</label>
                      <div className="col-sm-9">
                        <input className="form-control" type="text" maxLength={30} style={{ maxWidth: '300px' }} value={telepon} onChange={(e)=>setTelepon(e.target.value)} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="col-sm-3 control-label">Email <span className="text-danger">*</span></label>
                      <div className="col-sm-9">
                        <input className="form-control" type="email" maxLength={100} style={{ maxWidth: '400px' }} value={email} onChange={(e)=>setEmail(e.target.value)} required />
                        <small className="help-block text-muted">Email ini akan digunakan untuk login sistem.</small>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="col-sm-3 control-label">No Registrasi</label>
                      <div className="col-sm-9">
                        <input className="form-control" type="text" maxLength={100} value={noRegistrasi} onChange={(e)=>setNoRegistrasi(e.target.value)} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="col-sm-3 control-label">No Sertifikat</label>
                      <div className="col-sm-9">
                        <input className="form-control" type="text" maxLength={100} value={noSertifikat} onChange={(e)=>setNoSertifikat(e.target.value)} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="col-sm-3 control-label">No Blanko</label>
                      <div className="col-sm-9">
                        <input className="form-control" type="text" maxLength={100} value={noBlanko} onChange={(e)=>setNoBlanko(e.target.value)} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="col-sm-3 control-label">Provinsi</label>
                      <div className="col-sm-9">
                        <select className="form-control" style={{ maxWidth: '350px' }} value={provinsiId} onChange={(e)=>setProvinsiId(e.target.value)}>
                          <option value="">Pilih Provinsi</option>
                          <option value="Aceh">Aceh</option>
                          <option value="Sumatera Utara">Sumatera Utara</option>
                          <option value="Sumatera Barat">Sumatera Barat</option>
                          <option value="Riau">Riau</option>
                          <option value="Jambi">Jambi</option>
                          <option value="Sumatera Selatan">Sumatera Selatan</option>
                          <option value="Bengkulu">Bengkulu</option>
                          <option value="Lampung">Lampung</option>
                          <option value="DKI Jakarta">DKI Jakarta</option>
                          <option value="Jawa Barat">Jawa Barat</option>
                          <option value="Jawa Tengah">Jawa Tengah</option>
                          <option value="DI Yogyakarta">DI Yogyakarta</option>
                          <option value="Jawa Timur">Jawa Timur</option>
                          <option value="Banten">Banten</option>
                          <option value="Bali">Bali</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="col-sm-3 control-label">Tahun Laporan</label>
                      <div className="col-sm-9">
                        <input className="form-control" type="text" maxLength={10} style={{ maxWidth: '150px' }} value={tahunLaporan} onChange={(e)=>setTahunLaporan(e.target.value)} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="col-sm-3 control-label">Masa Berlaku Start</label>
                      <div className="col-sm-9">
                        <input className="form-control" type="date" style={{ maxWidth: '250px' }} value={masaBerlakuStart} onChange={(e)=>setMasaBerlakuStart(e.target.value)} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="col-sm-3 control-label">Tanda Tangan</label>
                      <div className="col-sm-9">
                        <input className="form-control" type="file" style={{ maxWidth: '400px' }} />
                        <small className="help-block text-muted">Fitur Upload TTD akan dibangun di fase selanjutnya.</small>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="col-sm-3 control-label">Ijazah Assesor</label>
                      <div className="col-sm-9">
                        <input className="form-control" type="file" style={{ maxWidth: '400px' }} />
                        <small className="help-block text-muted">Fitur Upload Ijazah akan dibangun di fase selanjutnya.</small>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="col-sm-3 control-label">Assesor LSP</label>
                      <div className="col-sm-9">
                        <select className="form-control" style={{ maxWidth: '150px' }} value={asesorLsp} onChange={(e)=>setAsesorLsp(e.target.value)}>
                          <option value="Y">Y</option>
                          <option value="N">N</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="col-sm-3 control-label">Anggota Pleno</label>
                      <div className="col-sm-9">
                        <select className="form-control" style={{ maxWidth: '150px' }} value={anggotaPleno} onChange={(e)=>setAnggotaPleno(e.target.value)}>
                          <option value="Y">Y</option>
                          <option value="N">N</option>
                        </select>
                      </div>
                    </div>

                  </div>

                  <div className="box-footer" style={{ padding: '20px 15px', backgroundColor: '#f5f5f5', borderTop: '1px solid #ddd' }}>
                    <div className="col-sm-offset-3 col-sm-9">
                      <button type="submit" className="btn btn-success" disabled={loading} style={{ marginRight: '10px' }}>
                        <i className="fa fa-check"></i> {loading ? "Menyimpan..." : "Simpan"}
                      </button>
                      <button type="button" className="btn btn-info" disabled={loading} style={{ marginRight: '10px' }}>
                        <i className="fa fa-rotate-left"></i> Simpan dan Kembali
                      </button>
                      <Link href="/admin/assesor" className="btn btn-default">
                        <i className="fa fa-warning"></i> Batal
                      </Link>
                    </div>
                  </div>
                </form>

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