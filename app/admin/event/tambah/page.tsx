"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function TambahEvent() {
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState("sertifikasi");
  const [activeTab, setActiveTab] = useState("utama_");

  const [formData, setFormData] = useState({
    nama_event: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    tuk_id: "", 
    tipe_event: "1", 
    sumber_anggaran: "8",
    instansi_id: "",
    no_sk: "",
    no_sk_komite_teknis: "",
    no_sk_pantek: "",
    no_sk_hasil_uji: "",
    kode_uji: "",
    tgl_pleno: "",
    is_publish: "0",
    kode_jadwal: "",
    biaya: "0",
    diskon: "0",
    kapasitas: "10",
    tag: "",
    info: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data dinamis untuk Tab
  const [pesertaList, setPesertaList] = useState<any[]>([]);
  const [skemaJadwalList, setSkemaJadwalList] = useState<any[]>([]); 
  const [asesorOptions, setAsesorOptions] = useState<any[]>([]);
  const [skemaOptions, setSkemaOptions] = useState<any[]>([]);
  const [tukOptions, setTukOptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const { data: asesorData } = await supabase.from("users").select("id, nama, email").eq("role", "asesor");
        if (asesorData) setAsesorOptions(asesorData);

        const { data: skemaData } = await supabase.from("skema").select("id, kode_skema, judul_skema");
        if (skemaData) setSkemaOptions(skemaData);

        const { data: tukData } = await supabase.from("tuk").select("id, nama_tuk");
        if (tukData) setTukOptions(tukData);
      } catch (err) {
        console.error("Gagal memuat dropdown:", err);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkemaJadwal = (e: React.MouseEvent) => {
    e.preventDefault();
    setSkemaJadwalList([...skemaJadwalList, { id: Date.now(), skema_id: "", assesor_id: "", jadwal: "", no_spt: "" }]);
  };

  const handleRemoveSkemaJadwal = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    const newList = [...skemaJadwalList];
    newList.splice(index, 1);
    setSkemaJadwalList(newList);
  };

  const handleSkemaJadwalChange = (index: number, field: string, value: string) => {
    const newList = [...skemaJadwalList];
    newList[index][field] = value;
    setSkemaJadwalList(newList);
  };

  const handleAddPeserta = (e: React.MouseEvent) => {
    e.preventDefault();
    const newPeserta = {
      id: Date.now(),
      no_peserta: "TUK-NEW-" + Math.floor(Math.random() * 1000),
      nama_peserta: "",
      email: "",
      no_hp: "",
      skema_sertifikasi_id: "",
      assesor_id: ""
    };
    setPesertaList([...pesertaList, newPeserta]);
  };

  const handleRemovePeserta = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    const newList = [...pesertaList];
    newList.splice(index, 1);
    setPesertaList(newList);
  };

  const handlePesertaChange = (index: number, field: string, value: string) => {
    const newList = [...pesertaList];
    newList[index][field] = value;
    setPesertaList(newList);
  };

  const handleSimpanEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payloadEvent = {
        nama_event: formData.nama_event,
        tanggal_mulai: formData.tanggal_mulai || null,
        tanggal_selesai: formData.tanggal_selesai || null,
        tuk_id: formData.tuk_id ? parseInt(formData.tuk_id) : null, 
        tipe_event: formData.tipe_event ? parseInt(formData.tipe_event) : null,
        sumber_anggaran: formData.sumber_anggaran ? parseInt(formData.sumber_anggaran) : null,
        instansi_id: formData.instansi_id ? parseInt(formData.instansi_id) : null,
        no_sk: formData.no_sk || null,
        no_sk_komite_teknis: formData.no_sk_komite_teknis || null,
        no_sk_pantek: formData.no_sk_pantek || null,
        no_sk_hasil_uji: formData.no_sk_hasil_uji || null,
        kode_uji: formData.kode_uji || null,
        tgl_pleno: formData.tgl_pleno || null,
        is_publish: formData.is_publish === "1",
        kode_jadwal: formData.kode_jadwal || null,
        biaya: formData.biaya ? parseInt(formData.biaya) : 0,
        diskon: formData.diskon ? parseInt(formData.diskon) : 0,
        kapasitas: formData.kapasitas ? parseInt(formData.kapasitas.toString()) : 10,
        tag: formData.tag || null,
        info: formData.info || null
      };

      const { data: newEvent, error: eventError } = await supabase.from("event").insert(payloadEvent).select().single(); 

      if (eventError) throw new Error("Gagal menyimpan Event: " + eventError.message);
      if (!newEvent) throw new Error("Event was inserted but no data returned.");

      const newEventId = newEvent.id; 

      if (skemaJadwalList.length > 0) {
        const jadwalPayload = skemaJadwalList.map(j => ({
          event_id: newEventId, 
          skema_id: j.skema_id ? parseInt(j.skema_id) : null,
          assesor_id: j.assesor_id || null, // FIX UUID
          jadwal: j.jadwal || null,
          no_spt: j.no_spt || null
        }));
        const { error: jadwalError } = await supabase.from("event_skema_jadwal").insert(jadwalPayload);
        if (jadwalError) throw new Error("Gagal menyimpan Jadwal: " + jadwalError.message);
      }

      if (pesertaList.length > 0) {
        const pesertaPayload = pesertaList.map(p => ({
          sertifikasi_event_id: newEventId, 
          no_peserta: p.no_peserta || null,
          nama_peserta: p.nama_peserta || null,
          email: p.email || null,
          no_hp: p.no_hp || null,
          skema_sertifikasi_id: p.skema_sertifikasi_id ? parseInt(p.skema_sertifikasi_id) : null,
          assesor_id: p.assesor_id || null, // FIX UUID
          user_id: p.email || "kosong@email.com"
        }));
        const { error: pesertaError } = await supabase.from("assesi").insert(pesertaPayload);
        if (pesertaError) throw new Error("Gagal menyimpan Peserta: " + pesertaError.message);
      }

      alert("Sukses! Event, Jadwal, dan Peserta berhasil ditambahkan.");
      router.push("/admin/event"); 

    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/admin/login");
  };

  return (
    <div suppressHydrationWarning className={`skin-blue ${!isSidebarOpen ? 'sidebar-collapse' : ''}`} style={{ height: "auto", minHeight: "100vh" }}>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/adminlte.min.css" rel="stylesheet" />
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/lib.min.css" rel="stylesheet" />
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/app.min.css" rel="stylesheet" />
      
      <style dangerouslySetInnerHTML={{__html: `
        .btn-app { border-radius: 3px; position: relative; padding: 15px 5px; margin: 0 10px 10px 0; min-width: 80px; height: 60px; text-align: center; color: #666; border: 1px solid #ddd; background-color: #f4f4f4; font-size: 12px; }
        .btn-app > .fa { font-size: 20px; display: block; }
        .table > tbody > tr > td { vertical-align: middle; border-top: none; padding: 8px; }
        .nav-tabs-custom { margin-bottom: 20px; background: #fff; box-shadow: 0 1px 1px rgba(0,0,0,0.1); border-radius: 3px; }
      `}} />

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
                  <li className="active"><Link href="/admin/event/tambah"><i className="fa fa-circle-o"></i> Tambah Event</Link></li>
                  <li><Link href="/admin/event"><i className="fa fa-circle-o"></i> Lihat/Edit Event</Link></li>
                </ul>
              </li>

              <li className="treeview"><Link href="/admin/skema"><i className="fa fa-book"></i> <span>Skema</span></Link></li>
              <li className="treeview"><Link href="/admin/assesor"><i className="fa fa-users"></i> <span>Assesor</span></Link></li>
              <li className="treeview"><Link href="/admin/assesi"><i className="fa fa-users"></i> <span>Assesi</span></Link></li>
              <li className="treeview"><Link href="/admin/tuk"><i className="fa fa-building"></i> <span>Tuk</span></Link></li>
            </ul>
          </section>
        </aside>

        <div className="content-wrapper" style={{ minHeight: "614px" }}>
          <section className="content-header">
            <h1>Tambah Event Baru</h1>
            <ol className="breadcrumb">
              <li><Link href="/admin/dashboard">Home</Link></li>
              <li className="active">Tambah Event</li>
            </ol>
          </section>

          <section className="content">
            <form id="myForm" onSubmit={handleSimpanEvent}>
              <div className="row">
                <div className="col-md-12">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="box box-primary">
                        <div className="box-header with-border"><h3 className="box-title">Tombol fungsi</h3></div>
                        <div className="box-body">                  
                          <button type="submit" name="button_save" id="button_save" className="btn btn-app text-center" disabled={isSubmitting}>
                            <i className="fa fa-floppy-o fa-2x"></i> {isSubmitting ? 'Loading..' : 'Simpan'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12">
                      <div className="box box-primary">
                        <div className="box-header with-border"><h3 className="box-title">Sertifikasi</h3></div>
                        <div className="box-body">
                          <div className="row">
                            <div className="col-md-6">
                              <table className="table">
                                <tbody>
                                  <tr><td align="right">Nama Event*:</td><td><input type="text" className="form-control" name="nama_event" required value={formData.nama_event || ""} onChange={handleChange} placeholder="Contoh: 2026_CYBER_PPP" /></td></tr>
                                  <tr><td align="right">Even Start/end*:</td><td><table><tbody><tr><td><input type="date" className="form-control" name="tanggal_mulai" required value={formData.tanggal_mulai || ""} onChange={handleChange} /></td><td>&nbsp;S/D&nbsp;</td><td><input type="date" className="form-control" name="tanggal_selesai" required value={formData.tanggal_selesai || ""} onChange={handleChange} /></td></tr></tbody></table></td></tr>
                                  <tr><td align="right">TUK*:</td><td><select name="tuk_id" className="form-control" value={formData.tuk_id || ""} onChange={handleChange}><option value="">Pilih TUK</option>{tukOptions.map((t) => (<option key={t.id} value={t.id}>{t.nama_tuk}</option>))}</select></td></tr>
                                  <tr><td align="right">Type TUK*:</td><td><select name="tipe_event" className="form-control" value={formData.tipe_event || ""} onChange={handleChange}><option value="1">Off-line</option><option value="2">On-line</option></select></td></tr>
                                  <tr><td align="right" width="200px">Sumber Anggaran*:</td><td><select name="sumber_anggaran" className="form-control" value={formData.sumber_anggaran || ""} onChange={handleChange}><option value="5">sumber anggaran dari APBN</option><option value="6">sumber anggaran dari APBD</option><option value="7">sumber anggaran biaya dari perusahaan</option><option value="8">sumber anggaran biaya mandiri</option></select></td></tr>
                                </tbody>
                              </table>
                            </div>
                            <div className="col-md-6">
                              <table className="table">
                                <tbody>
                                  <tr><td align="right">Biaya:</td><td><input type="number" className="form-control" name="biaya" style={{ textAlign: 'right' }} value={formData.biaya || ""} onChange={handleChange} /></td></tr>
                                  <tr><td align="right">Diskon Rp:</td><td><input type="number" className="form-control" name="diskon" style={{ textAlign: 'right' }} value={formData.diskon || ""} onChange={handleChange} /></td></tr>
                                  <tr><td align="right">Kapasitas Jumlah(Peserta)*:</td><td><input type="number" className="form-control" name="kapasitas" style={{ textAlign: 'right' }} required value={formData.kapasitas || ""} onChange={handleChange} /></td></tr>
                                  <tr><td align="right">Tag</td><td><input type="text" className="form-control" name="tag" value={formData.tag || ""} onChange={handleChange} /></td></tr>
                                  <tr><td align="right">Info :</td><td><textarea name="info" rows={10} className="form-control" value={formData.info || ""} onChange={handleChange}></textarea></td></tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12">
                      <div className="box box-primary">
                        <div className="box-header with-border"><h3 className="box-title">Sertifikasi Detail</h3></div>
                        <div className="box-body">
                          <div className="col-md-12">
                            <div className="nav-tabs-custom">
                              <ul className="nav nav-tabs">
                                <li className={activeTab === 'utama_' ? 'active' : ''}><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('utama_'); }}>1.Skema dan Jadwal</a></li>
                                <li className={activeTab === 'peserta_' ? 'active' : ''}><a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('peserta_'); }}>2.Peserta/Assesi</a></li>
                              </ul>
                              <div className="tab-content" style={{ padding: '20px' }}>
                                <div className={`tab-pane ${activeTab === 'utama_' ? 'active' : ''}`} id="utama_">
                                  <button type="button" className="btn btn-primary" style={{ marginBottom: '15px' }} onClick={handleAddSkemaJadwal}><i className="fa fa-plus"></i> Tambah Jadwal</button>
                                  <div className="table-responsive">
                                    <table className="table table-bordered">
                                      <thead><tr className="bg-gray"><th>Aksi</th><th>Skema</th><th>Asesor</th><th>Jadwal</th><th>No. SPT</th></tr></thead>
                                      <tbody>
                                        {skemaJadwalList.length === 0 ? (
                                          <tr><td colSpan={5} className="text-center text-muted">Belum ada Jadwal. Klik "Tambah Jadwal" untuk menambahkan.</td></tr>
                                        ) : (
                                          skemaJadwalList.map((item, index) => (
                                            <tr key={item.id}>
                                              <td className="text-center"><button className="btn btn-danger" onClick={(e) => handleRemoveSkemaJadwal(e, index)}><i className="fa fa-trash"></i></button></td>
                                              <td><select className="form-control" value={item.skema_id || ""} onChange={(e) => handleSkemaJadwalChange(index, "skema_id", e.target.value)}><option value="">Pilih Skema</option>{skemaOptions.map((skm) => (<option key={skm.id} value={skm.id}>[{skm.kode_skema}] {skm.judul_skema}</option>))}</select></td>
                                              <td><select className="form-control" value={item.assesor_id || ""} onChange={(e) => handleSkemaJadwalChange(index, "assesor_id", e.target.value)}><option value="">Pilih Assesor</option>{asesorOptions.map((asr) => (<option key={asr.id} value={asr.id}>{asr.nama || asr.email}</option>))}</select></td>
                                              <td><input type="datetime-local" className="form-control" value={item.jadwal || ""} onChange={(e) => handleSkemaJadwalChange(index, "jadwal", e.target.value)} /></td>
                                              <td><input type="text" className="form-control" value={item.no_spt || ""} onChange={(e) => handleSkemaJadwalChange(index, "no_spt", e.target.value)} /></td>
                                            </tr>
                                          ))
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                <div className={`tab-pane ${activeTab === 'peserta_' ? 'active' : ''}`} id="peserta_">
                                  <div style={{ display: 'flex', gap: '5px', marginBottom: '15px', flexWrap: 'wrap' }}>
                                    <button type="button" className="btn btn-primary" onClick={handleAddPeserta}>Tambah peserta</button>
                                  </div>
                                  <div className="table-responsive">
                                    <table className="table table-bordered">
                                      <thead><tr className="bg-gray"><th>Aksi</th><th>No. Peserta</th><th>Nama</th><th>Email</th><th>NO.HP</th><th>Skema</th><th>Assesor</th></tr></thead>
                                      <tbody>
                                        {pesertaList.length === 0 ? (
                                          <tr><td colSpan={7} className="text-center text-muted">Belum ada peserta. Klik "Tambah Peserta" untuk menambahkan.</td></tr>
                                        ) : (
                                          pesertaList.map((peserta, index) => (
                                            <tr key={peserta.id}>
                                              <td><button className="btn btn-danger" onClick={(e) => handleRemovePeserta(e, index)}><i className="fa fa-trash"></i></button></td>
                                              <td><input type="text" className="form-control" value={peserta.no_peserta || ""} onChange={(e) => handlePesertaChange(index, "no_peserta", e.target.value)} /></td>
                                              <td><input type="text" className="form-control" value={peserta.nama_peserta || ""} onChange={(e) => handlePesertaChange(index, "nama_peserta", e.target.value)} /></td>
                                              <td><input type="text" className="form-control" value={peserta.email || ""} onChange={(e) => handlePesertaChange(index, "email", e.target.value)} /></td>
                                              <td><input type="text" className="form-control" value={peserta.no_hp || ""} onChange={(e) => handlePesertaChange(index, "no_hp", e.target.value)} /></td>
                                              <td><select className="form-control" value={peserta.skema_sertifikasi_id || ""} onChange={(e) => handlePesertaChange(index, "skema_sertifikasi_id", e.target.value)}><option value="">Pilih Skema</option>{skemaOptions.map((skm) => (<option key={skm.id} value={skm.id}>{skm.judul_skema}</option>))}</select></td>
                                              <td><select className="form-control" value={peserta.assesor_id || ""} onChange={(e) => handlePesertaChange(index, "assesor_id", e.target.value)}><option value="">Pilih Assesor</option>{asesorOptions.map((asr) => (<option key={asr.id} value={asr.id}>{asr.nama || asr.email}</option>))}</select></td>
                                            </tr>
                                          ))
                                        )}
                                      </tbody>
                                    </table>
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
            </form>
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