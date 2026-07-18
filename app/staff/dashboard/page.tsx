"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (user?.email) {
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email)
          .maybeSingle();
        setCurrentUser(userData);
      }

      const { data: eventData, error: eventError } = await supabase
        .from("event")
        .select("*")
        .order("tanggal_mulai", { ascending: false });

      if (eventError) throw eventError;

      const { data: tukData, error: tukError } = await supabase.from("tuk").select("*");
      if (tukError) throw tukError;

      const tukMap: Record<string, any> = {};
      (tukData || []).forEach((t: any) => {
        tukMap[t.id] = t;
      });

      const mergedEvents = (eventData || []).map((ev: any) => ({
        ...ev,
        tuk: tukMap[ev.tuk_id] || null,
      }));

      setEvents(mergedEvents);
    } catch (err: any) {
      console.error(
        "Gagal memuat dashboard admin:",
        err?.message || err?.error_description || JSON.stringify(err)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.clear();
    router.push("/login");
  };

  const filteredEvents = events.filter((ev) => {
    const q = search.toLowerCase();
    return (
      (ev.nama_event || "").toLowerCase().includes(q) ||
      (ev.tuk?.nama_tuk || "").toLowerCase().includes(q) ||
      (ev.tipe_event || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="skin-blue layout-top-nav" style={{ minHeight: "100vh", backgroundColor: "#ecf0f5" }}>
      <link href="https://asesmen.lspmicrofinanceindonesia.com/assets/dist/admin/adminlte.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />

      <header className="main-header">
        <nav className="navbar navbar-static-top">
          <div className="container-fluid">
            <div className="navbar-header">
              <span className="navbar-brand">
                <b>lspxyz.com</b> — Admin/Staff
              </span>
            </div>
            <div className="navbar-custom-menu">
              <ul className="nav navbar-nav">
                <li>
                  <a href="#" onClick={handleLogout} className="btn btn-danger" style={{ color: "white", padding: "10px 15px", margin: "5px" }}>
                    Log Out {currentUser?.email || ""}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <div className="content-wrapper">
        <div className="container-fluid" style={{ padding: "20px 30px" }}>
          <div className="row">
            <div className="col-md-12">
              <h1>Selamat datang{currentUser?.nama ? `, ${currentUser.nama}` : ""}</h1>
              <hr />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <div className="box box-primary">
                <div className="box-header with-border">
                  <h3 className="box-title">Shortcuts</h3>
                </div>
                <div className="box-body" style={{ display: "flex", gap: "10px" }}>
                  <Link href="/admin/all_assesi" className="btn btn-app" style={{ borderRadius: "3px", padding: "15px 5px", margin: "0", minWidth: "80px", height: "60px", textAlign: "center", color: "#666", border: "1px solid #ddd", backgroundColor: "#f4f4f4", fontSize: "12px" }}>
                    <i className="fa fa-users" style={{ fontSize: "20px", display: "block" }}></i> Cari Assesi
                  </Link>

                  {/* PERBAIKAN: Menambahkan Shortcut ke APL1 Staff */}
                  <Link href="/staff/apl1" className="btn btn-app" style={{ borderRadius: "3px", padding: "15px 5px", margin: "0", minWidth: "80px", height: "60px", textAlign: "center", color: "#666", border: "1px solid #ddd", backgroundColor: "#f4f4f4", fontSize: "12px" }}>
                    <i className="fa fa-file-text" style={{ fontSize: "20px", display: "block" }}></i> ACC APL.01
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <div className="box box-primary">
                <div className="box-header with-border">
                  <h3 className="box-title">Event Sertifikasi</h3>
                </div>
                <div className="box-body">
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Cari nama event / TUK / tipe event..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ maxWidth: "350px", marginBottom: "15px" }}
                    />
                  </div>

                  {isLoading ? (
                    <p>Memuat data event...</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped table-bordered">
                        <thead>
                          <tr className="bg-gray">
                            <th>ID</th>
                            <th>Tanggal Event</th>
                            <th>Nama Event</th>
                            <th>TUK</th>
                            <th>Tipe Event</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEvents.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center text-muted">
                                Belum ada event.
                              </td>
                            </tr>
                          ) : (
                            filteredEvents.map((ev, idx) => (
                              <tr key={ev.id}>
                                <td>{idx + 1}</td>
                                <td>
                                  {ev.tanggal_mulai
                                    ? new Date(ev.tanggal_mulai).toLocaleDateString("id-ID")
                                    : "-"}
                                  {ev.tanggal_selesai
                                    ? ` s/d ${new Date(ev.tanggal_selesai).toLocaleDateString("id-ID")}`
                                    : ""}
                                </td>
                                <td>{ev.nama_event}</td>
                                <td>{ev.tuk?.nama_tuk || "-"}</td>
                                <td>{ev.tipe_event || "-"}</td>
                                <td>
                                  {/* PERBAIKAN: Mengaktifkan routing ke halaman detail staff */}
                                  <Link href={`/staff/event/${ev.id}`} className="btn btn-primary btn-sm">
                                    Detail
                                  </Link>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="main-footer" style={{ marginLeft: 0 }}>
        <div className="container-fluid text-center">
          <strong>LSP XYZ © {new Date().getFullYear()} All rights reserved.</strong>
        </div>
      </footer>
    </div>
  );
}