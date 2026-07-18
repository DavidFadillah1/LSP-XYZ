"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function Mapa02Page() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [asesorOptions, setAsesorOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [mapaType, setMapaType] = useState("TL");

  // State Form Data (Hanya 1 Penyusun dan 1 Validator)
  const [formData, setFormData] = useState({
    penyusun: "", tgl_ttd_penyusun: new Date().toISOString().substring(0, 10),
    validator: "", tgl_ttd_validator: new Date().toISOString().substring(0, 10),
  });

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Mengambil data user menggunakan session atau fallback local storage
      const { data: { user: authUser } } = await supabase.auth.getUser();
      let userEmail = authUser?.email || localStorage.getItem("userEmail");

      if (userEmail) {
        const { data: userData } = await supabase.from("users").select("*").eq("email", userEmail).single();
        setCurrentUser(userData || { email: userEmail, nama: "Assesor" });
      } else {
        setCurrentUser({ email: "kosong@email.com", nama: "Assesor" });
      }

      const { data: listAsesor } = await supabase.from("users").select("id, nama").eq("role", "asesor");
      if (listAsesor) setAsesorOptions(listAsesor);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleMapaType = () => {
    setMapaType((prev) => (prev === "TL" ? "L" : "TL"));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    window.close();
    router.back();
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await supabase.auth.signOut();
    localStorage.clear();
    router.push("/login");
  };

  return (
    <div className="skin-blue layout-top-nav" style={{ minHeight: "100vh", backgroundColor: "#ecf0f5" }}>
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/adminlte.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
      
      <style dangerouslySetInnerHTML={{__html: `
        .btn-app { border-radius: 3px; position: relative; padding: 15px 5px; margin: 0 10px 10px 0; min-width: 80px; height: 60px; text-align: center; color: #666; border: 1px solid #ddd; background-color: #f4f4f4; font-size: 12px; }
        .btn-app > .fa { font-size: 20px; display: block; }
        @media print {
          .main-header, .btn-app, footer { display: none !important; }
          .box { border: none !important; box-shadow: none !important; }
          body { background-color: white !important; }
        }
      `}} />

      <header className="main-header">
        <nav className="navbar navbar-static-top">
          <div className="container-fluid">
            <div className="navbar-header">
              <Link href="/asesor/dashboard" className="navbar-brand"><b>lspxyz.com</b></Link>
            </div>
            <div className="collapse navbar-collapse pull-left">
              <ul className="nav navbar-nav">
                <li><Link href="/home">Beranda</Link></li>
                <li><Link href="/asesor/dashboard">Assesor</Link></li>
              </ul>
            </div>
            <div className="navbar-custom-menu">
              <ul className="nav navbar-nav">
                <li>
                  <a href="#" onClick={handleLogout} className="btn btn-danger" style={{ color: "white", padding: "10px 15px", margin: "5px" }}>
                    Log Out {currentUser?.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <div className="content-wrapper" style={{ minHeight: "614px", backgroundColor: "transparent" }}>
        <div className="container-fluid" style={{ padding: "20px 30px" }}>
          
          <div className="row" style={{ marginTop: "40px" }}>
            <div className="col-md-12">
              <div className="box box-primary">
                <div className="box-header with-border">
                  <h3 className="box-title">
                    MAPA-02 
                    <span id="state" className="text-primary" style={{ marginLeft: "10px" }}>
                      <i className={`fa ${mapaType === 'TL' ? 'fa-eye-slash' : 'fa-eye'}`}></i> ({mapaType})
                    </span>
                  </h3>
                </div>
                <div className="box-body">
                  <button type="button" className="btn btn-app" onClick={handlePrint}><i className="fa fa-print fa-2x"></i>Cetak</button>
                  <button type="button" className="btn btn-app" onClick={toggleMapaType}>
                    <i className={`fa ${mapaType === 'TL' ? 'fa-eye' : 'fa-eye-slash'}`}></i> 
                    ({mapaType === 'TL' ? 'L' : 'TL'})
                  </button>
                  <button type="button" className="btn btn-app" onClick={handleClose}><i className="fa fa-close fa-2x"></i>Tutup</button>
                </div>
              </div>
            </div>
          </div>

          <form id="myForm" style={{ marginBottom: "50px" }}>
            <div id="mapa02">
              <div className="box box-primary">
                <div className="box-header text-center" style={{ borderBottom: "1px solid #f4f4f4", paddingBottom:"15px" }}>
                  <h2 className="box-title" style={{ fontSize:"18px", lineHeight: "1.5" }}>
                    <b>FR.MAPA.02 - PETA INSTRUMEN ASESSMEN HASIL PENDEKATAN ASESMEN DAN PERENCANAAN ASESMEN*</b>
                  </h2>
                </div>
                <div className="box-body">
                  
                  {/* TABEL INSTRUMEN ASESMEN */}
                  <table border={1} style={{ width: "100%", marginBottom:"20px", borderCollapse:"collapse" }}>
                    <thead>
                      <tr className="bg-gray">
                        <th rowSpan={2} style={{ textAlign: "center", padding: "8px", verticalAlign: "middle" }}>No.</th>
                        <th rowSpan={2} style={{ textAlign: "center", padding: "8px", verticalAlign: "middle" }}>INSTRUKSI ASESMEN</th>
                        <th colSpan={5} style={{ textAlign: "center", padding: "8px" }}>Potensi Asesi **</th>
                      </tr>
                      <tr className="bg-gray">
                        <th style={{ textAlign: "center", padding: "8px" }}>1</th>
                        <th style={{ textAlign: "center", padding: "8px" }}>2</th>
                        <th style={{ textAlign: "center", padding: "8px" }}>3</th>
                        <th style={{ textAlign: "center", padding: "8px" }}>4</th>
                        <th style={{ textAlign: "center", padding: "8px" }}>5</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={7} className="text-center text-muted" style={{ padding: "20px" }}>
                          <em>(Data Peta Instrumen Kosong / Diambil dari Database)</em>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <p style={{ marginBottom: "30px" }}>*) diisi berdasarkan hasil penentuan pendekatan asesmen dan perencanaan asesmen</p>

                  {/* TABEL PENYUSUN DAN VALIDATOR */}
                  <p><b>PENYUSUN DAN VALIDATOR</b></p>
                  <table border={1} style={{ width: "100%", marginBottom:"20px", borderCollapse:"collapse" }}>
                    <thead>
                      <tr className="bg-gray">
                        <th style={{ textAlign: "center", padding: "8px" }}>STATUS</th>
                        <th style={{ textAlign: "center", padding: "8px" }}>Nama / MET (No registrasi)</th>
                        <th style={{ textAlign: "center", padding: "8px" }}>Tanggal</th>
                        <th style={{ textAlign: "center", padding: "8px" }}>Tanda Tangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: "8px" }}>PENYUSUN</td>
                        <td style={{ padding: "8px" }}>
                          <select className="form-control input-sm" name="penyusun" value={formData.penyusun} onChange={handleInputChange}>
                            <option value="">Pilih Assesor</option>
                            {asesorOptions.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "8px" }}>
                          <input type="date" className="form-control input-sm" name="tgl_ttd_penyusun" value={formData.tgl_ttd_penyusun} onChange={handleInputChange}/>
                        </td>
                        <td align="center" style={{ padding: "8px" }}><p className="text-muted">N/A</p></td>
                      </tr>
                      <tr>
                        <td style={{ padding: "8px" }}>VALIDATOR</td>
                        <td style={{ padding: "8px" }}>
                          <select className="form-control input-sm" name="validator" value={formData.validator} onChange={handleInputChange}>
                            <option value="">Pilih Assesor</option>
                            {asesorOptions.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: "8px" }}>
                          <input type="date" className="form-control input-sm" name="tgl_ttd_validator" value={formData.tgl_ttd_validator} onChange={handleInputChange}/>
                        </td>
                        <td align="center" style={{ padding: "8px" }}><p className="text-muted">N/A</p></td>
                      </tr>
                    </tbody>
                  </table>

                  <p>**) Keterangan</p>
                  <ol style={{ paddingLeft: "20px" }}>
                    <li>Hasil pelatihan dan/atau pendidikan, dimana kurikulum dan fasilitas praktek mampu telusur terhadap standar kompetensi.</li>
                    <li>Hasil pelatihan dan/atau pendidikan, dimana kurikulum belum berbasis kompetensi.</li>
                    <li>Pekerja berpengalaman, dimana berasal dari industri/tempat kerja yang dalam operasionalnya mampu telusur dengan standar kompetensi.</li>
                    <li>Pekerja berpengalaman, dimana berasal dari industri/tempat kerja yang dalam operasionalnya belum berbasis kompetensi.</li>
                    <li>Pelatihan/belajar mandiri atau otodidak.</li>
                  </ol>

                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}