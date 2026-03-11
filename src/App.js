import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ─── FIREBASE ────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyA7HNVj7_bpbAxyNSeZIlkhxpM7AKIJUEk",
  authDomain: "instituto-marilda-brandao.firebaseapp.com",
  projectId: "instituto-marilda-brandao",
  storageBucket: "instituto-marilda-brandao.firebasestorage.app",
  messagingSenderId: "764911882866",
  appId: "1:764911882866:web:9fd93e29c5ea4d10c4a8eb"
};
const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(fbApp);
const storage = getStorage(fbApp);

// ─── DB HELPERS ──────────────────────────────────────────────────────────────
const DB = {
  async getUsers() { const s = await getDocs(collection(db,"users")); return s.docs.map(d=>({...d.data(),id:d.id})); },
  async saveUser(u) { const {id,...data}=u; await setDoc(doc(db,"users",id),data); },
  async updateUser(id,data) { await updateDoc(doc(db,"users",id),data); },
  async getEvents() { const s = await getDocs(collection(db,"events")); return s.docs.map(d=>({...d.data(),id:d.id})); },
  async saveEvent(e) { const {id,...data}=e; await setDoc(doc(db,"events",id),data); },
  async deleteEvent(id) { await deleteDoc(doc(db,"events",id)); },
  async getVolunteers() { const s = await getDocs(collection(db,"volunteers")); return s.docs.map(d=>({...d.data(),id:d.id})); },
  async saveVolunteer(v) { await addDoc(collection(db,"volunteers"),v); },
  async getQrHistory() { const s = await getDocs(collection(db,"qr_history")); return s.docs.map(d=>({...d.data(),id:d.id})); },
  async saveQrHistory(h) { await addDoc(collection(db,"qr_history"),h); },
  async getDonGoal() { const d = await getDoc(doc(db,"settings","donation_goal")); return d.exists()?d.data():{ current:3200,target:5000,label:"Meta de Natal 2025",currency:"R$" }; },
  async saveDonGoal(g) { await setDoc(doc(db,"settings","donation_goal"),g); },
  async getCollaborators() { const s = await getDocs(collection(db,"collaborators")); return s.docs.map(d=>({...d.data(),id:d.id})); },
  async saveCollaborator(c) { const {id,...data}=c; await setDoc(doc(db,"collaborators",id),data); },
  async updateCollaborator(id,data) { await updateDoc(doc(db,"collaborators",id),data); },
  async getDonations() { const s = await getDocs(collection(db,"donations")); return s.docs.map(d=>({...d.data(),id:d.id})); },
  async saveDonation(d) { await addDoc(collection(db,"donations"),d); },
  async deleteDonation(id) { await deleteDoc(doc(db,"donations",id)); },
  async getAnnouncements() { const s = await getDocs(collection(db,"announcements")); return s.docs.map(d=>({...d.data(),id:d.id})); },
  async saveAnnouncement(a) { const {id,...data}=a; await setDoc(doc(db,"announcements",id),data); },
  async deleteAnnouncement(id) { await deleteDoc(doc(db,"announcements",id)); },
  async uploadEventPhoto(eventId, file) {
    const r = ref(storage, `events/${eventId}/${Date.now()}_${file.name}`);
    const snap = await uploadBytes(r, file);
    return await getDownloadURL(snap.ref);
  },
  async getEventPhotos(eventId) { const s = await getDocs(collection(db,`event_photos_${eventId}`)); return s.docs.map(d=>({...d.data(),id:d.id})); },
  async saveEventPhoto(eventId, p) { await addDoc(collection(db,`event_photos_${eventId}`),p); },
  // EmailJS (configure at emailjs.com)
  async sendEmail(to, subject, body) {
    try {
      if (!window.emailjs) return; // silently skip if not configured
      await window.emailjs.send("SERVICE_ID","TEMPLATE_ID",{ to_email:to, subject, message:body });
    } catch(e) { console.warn("Email não enviado:",e); }
  },
  // Realtime listeners
  onUsers(cb) { return onSnapshot(collection(db,"users"), s => cb(s.docs.map(d=>({...d.data(),id:d.id})))); },
  onEvents(cb) { return onSnapshot(collection(db,"events"), s => cb(s.docs.map(d=>({...d.data(),id:d.id})))); },
  onCollaborators(cb) { return onSnapshot(collection(db,"collaborators"), s => cb(s.docs.map(d=>({...d.data(),id:d.id})))); },
};


// ─── ESTILOS ────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Montserrat:wght@400;600;700;800;900&family=Barlow+Condensed:wght@600;700;800;900&display=swap');
:root{
  --navy:#0a2d6e;--blue:#1155cc;--blue2:#1a6fe8;--sky:#dbeafe;
  --gold:#e8a020;--gold2:#f5c842;--gold3:#fff3cd;
  --white:#ffffff;--bg:#f4f7fe;--gray:#64748b;--light:#e2e8f0;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Nunito',sans-serif;background:var(--bg);color:#1e293b}
button{cursor:pointer;border:none;font-family:'Nunito',sans-serif}
input,select,textarea{font-family:'Nunito',sans-serif}
a{color:var(--blue);text-decoration:none}

/* NAV */
.nav{position:fixed;top:0;left:0;right:0;z-index:100;background:var(--navy);
  display:flex;align-items:center;justify-content:space-between;
  padding:0 24px;height:64px;box-shadow:0 2px 20px rgba(0,0,0,.3)}
.nl{background:none;color:rgba(255,255,255,.8);font-size:13px;font-weight:700;
  padding:6px 10px;border-radius:6px;transition:.2s;white-space:nowrap}
.nl:hover{color:#fff;background:rgba(255,255,255,.12)}
.nav-hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:8px;background:none;border:none}
.nav-hamburger span{display:block;width:22px;height:2px;background:#fff;border-radius:2px;transition:.3s}
.nav-mobile-menu{display:none}

/* BUTTONS */
.btn{padding:10px 20px;border-radius:8px;font-weight:800;font-size:14px;transition:.2s;display:inline-flex;align-items:center;gap:6px}
.btn-gold{background:linear-gradient(135deg,var(--gold),var(--gold2));color:var(--navy)}
.btn-gold:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(232,160,32,.4)}
.btn-blue{background:linear-gradient(135deg,var(--blue),var(--blue2));color:#fff}
.btn-blue:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(17,85,204,.4)}
.btn-out{background:transparent;border:2px solid rgba(255,255,255,.4);color:#fff}
.btn-out:hover{border-color:#fff;background:rgba(255,255,255,.1)}
.btn-sm{padding:7px 14px;font-size:13px}
.btn-red{background:#ef4444;color:#fff}
.btn-green{background:#22c55e;color:#fff}

/* HERO */
.hero{min-height:100vh;background:linear-gradient(135deg,var(--navy) 0%,#0e3a8a 60%,#1a5bb8 100%);
  display:flex;align-items:center;justify-content:center;padding:80px 32px 40px;position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;inset:0;
  background:radial-gradient(ellipse 80% 60% at 70% 50%,rgba(232,160,32,.08),transparent),
             radial-gradient(ellipse 40% 40% at 20% 80%,rgba(26,111,232,.15),transparent)}

/* SECTIONS */
.section{padding:80px 32px}
.section-title{font-family:'Barlow Condensed',sans-serif;font-size:36px;font-weight:900;
  color:var(--navy);margin-bottom:8px;letter-spacing:.5px}
.section-sub{color:var(--gray);font-size:16px;margin-bottom:48px}
.container{max-width:1100px;margin:0 auto}

/* CARDS */
.card{background:#fff;border-radius:16px;box-shadow:0 2px 16px rgba(0,0,0,.08);overflow:hidden}
.program-card{background:rgba(255,255,255,.12);backdrop-filter:blur(10px);border-radius:16px;
  padding:20px;color:#fff;border:1px solid rgba(255,255,255,.2)}

/* GRID */
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
@media(max-width:900px){.grid-3{grid-template-columns:repeat(2,1fr)}.grid-4{grid-template-columns:repeat(2,1fr)}}
@media(max-width:600px){.grid-2,.grid-3,.grid-4{grid-template-columns:1fr}}

/* ── MOBILE ── */
@media(max-width:900px){
  .nav{padding:0 16px;height:56px}
  .nav-desktop-links{display:none!important}
  .nav-actions{display:none!important}
  .nav-hamburger{display:flex!important}
  .nav-mobile-menu{position:fixed;top:56px;left:0;right:0;bottom:0;background:var(--navy);
    flex-direction:column;align-items:flex-start;padding:20px;gap:4px;z-index:99;overflow-y:auto}
  .nav-mobile-menu.open{display:flex!important}
  .hero{padding:72px 16px 32px;min-height:auto}
  .hero .container{text-align:center}
  .hero-cards{grid-template-columns:repeat(2,1fr)!important}
  .hero-btns{justify-content:center!important}
  .section{padding:48px 16px}
  .section-title{font-size:28px}
  .impact-bar{padding:28px 16px}
  .impact-num{font-size:36px}
  .donate-box{padding:28px 16px;border-radius:16px}
  .footer{padding:32px 16px 20px}
  .modal{padding:20px;border-radius:16px}
  .dash-header{padding:20px 16px}
  .sidebar{transform:translateX(-100%);transition:.3s;z-index:200}
  .sidebar.open{transform:translateX(0)}
  .admin-content{margin-left:0!important;padding:16px}
  .admin-topbar{display:flex!important}
  .tbl{display:block;overflow-x:auto;white-space:nowrap}
  .grid-2{grid-template-columns:1fr}
  .pix-key{font-size:13px;letter-spacing:0}
}

/* IMPACT BAR */
.impact-bar{background:linear-gradient(135deg,var(--gold),var(--gold2));padding:40px 32px}
.impact-num{font-family:'Barlow Condensed',sans-serif;font-size:48px;font-weight:900;color:var(--navy);line-height:1}

/* GALLERY */
.gallery-img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:12px;
  transition:.3s;cursor:pointer}
.gallery-img:hover{transform:scale(1.03);box-shadow:0 8px 32px rgba(0,0,0,.2)}

/* TESTIMONIALS */
.testi-card{background:#fff;border-radius:16px;padding:28px;box-shadow:0 2px 16px rgba(0,0,0,.08);
  border-left:4px solid var(--gold)}

/* DONATE */
.donate-box{background:linear-gradient(135deg,var(--navy),#0e3a8a);
  border-radius:24px;padding:48px;color:#fff;text-align:center}

/* PARTNERS */
.partner-logo{background:#fff;border-radius:12px;padding:20px;
  display:flex;align-items:center;justify-content:center;
  font-weight:800;font-size:15px;color:var(--navy);
  box-shadow:0 2px 12px rgba(0,0,0,.06);min-height:80px;
  transition:.2s;border:2px solid transparent}
.partner-logo:hover{border-color:var(--gold);transform:translateY(-2px)}

/* TRANSPARENCY */
.seal{display:flex;align-items:center;gap:12px;background:#fff;
  border-radius:12px;padding:16px 20px;box-shadow:0 2px 12px rgba(0,0,0,.06);
  border:2px solid var(--gold3)}

/* VOLUNTEER FORM */
.form-group{margin-bottom:16px}
.form-label{display:block;font-weight:700;font-size:13px;color:var(--navy);margin-bottom:6px}
.form-input{width:100%;padding:10px 14px;border:2px solid var(--light);border-radius:8px;
  font-size:14px;transition:.2s;outline:none}
.form-input:focus{border-color:var(--blue)}
.form-select{width:100%;padding:10px 14px;border:2px solid var(--light);border-radius:8px;
  font-size:14px;background:#fff;outline:none}

/* FOOTER */
.footer{background:var(--navy);color:rgba(255,255,255,.7);padding:48px 32px 24px}

/* WHATSAPP FLOAT */
.wa-btn{position:fixed;bottom:24px;right:24px;z-index:200;
  width:56px;height:56px;border-radius:50%;background:#25d366;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 20px rgba(37,211,102,.5);transition:.3s}
.wa-btn:hover{transform:scale(1.1)}

/* MODAL */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);
  z-index:300;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:#fff;border-radius:20px;padding:32px;max-width:500px;width:100%;
  max-height:90vh;overflow-y:auto;position:relative}

/* ADMIN */
.sidebar{position:fixed;left:0;top:0;bottom:0;width:220px;background:var(--navy);
  z-index:90;padding:20px 0;overflow-y:auto}
.sidebar-link{display:flex;align-items:center;gap:10px;padding:12px 20px;
  color:rgba(255,255,255,.7);font-size:14px;font-weight:700;cursor:pointer;transition:.2s}
.sidebar-link:hover,.sidebar-link.active{background:rgba(255,255,255,.12);color:#fff}
.admin-content{margin-left:220px;padding:24px;min-height:100vh}

/* DASHBOARD */
.dash-header{background:linear-gradient(135deg,var(--navy),#1a5bb8);padding:32px;color:#fff}
.qr-card{background:#fff;border-radius:16px;padding:20px;text-align:center;
  box-shadow:0 2px 12px rgba(0,0,0,.08);border:2px solid var(--gold3)}
.qr-card.used{border-color:var(--light);opacity:.7}

/* TABLE */
.tbl{width:100%;border-collapse:collapse;font-size:14px}
.tbl th{background:var(--sky);color:var(--navy);font-weight:800;padding:10px 14px;text-align:left;font-size:13px}
.tbl td{padding:10px 14px;border-bottom:1px solid var(--light)}
.tbl tr:hover td{background:#f8faff}

/* BADGES */
.badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:800}
.badge-green{background:#dcfce7;color:#166534}
.badge-yellow{background:#fef9c3;color:#854d0e}
.badge-red{background:#fee2e2;color:#991b1b}
.badge-blue{background:#dbeafe;color:#1e40af}
.badge-gray{background:#f1f5f9;color:#475569}

/* TOAST */
.toast{position:fixed;top:80px;right:20px;z-index:500;
  padding:14px 20px;border-radius:12px;font-weight:700;font-size:14px;
  box-shadow:0 4px 20px rgba(0,0,0,.2);animation:slideIn .3s ease}
.toast-info{background:var(--navy);color:#fff}
.toast-success{background:#22c55e;color:#fff}
.toast-error{background:#ef4444;color:#fff}

/* CALENDAR */
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.cal-day{aspect-ratio:1;display:flex;align-items:center;justify-content:center;
  border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;transition:.15s}
.cal-day:hover{background:var(--sky)}
.cal-day.today{background:var(--blue);color:#fff}
.cal-day.has-event{background:var(--gold3);color:var(--navy)}
.cal-day.other-month{opacity:.35}

/* ANIMATIONS */
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes countUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.fade-in{animation:fadeIn .4s ease}

/* PIX Modal */
.pix-key{background:var(--gold3);border:2px dashed var(--gold);border-radius:10px;
  padding:14px;font-weight:900;font-size:16px;text-align:center;letter-spacing:1px;color:var(--navy)}

/* QR Scanner */
.qr-scanner-area{border:3px dashed var(--light);border-radius:16px;padding:32px;
  text-align:center;background:#f8faff;transition:.2s}
.qr-scanner-area.active{border-color:var(--blue);background:var(--sky)}

/* VIDEO */
.video-wrapper{position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:16px}
.video-wrapper iframe{position:absolute;top:0;left:0;width:100%;height:100%}

/* PRINT */
@media print{
  .wa-btn,.nav,.sidebar,.btn,.no-print{display:none!important}
  .admin-content{margin:0!important}
}
`;

// ─── LOGO ────────────────────────────────────────────────────────────────────
function IMBLogo({ variant = "nav", onClick }) {
  const gold2 = "#f5c842";
  if (variant === "nav") return (
    <div onClick={onClick} style={{cursor:onClick?"pointer":"default",lineHeight:1.18,userSelect:"none"}}>
      <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:10,fontWeight:800,color:"#fff",letterSpacing:"4px",textTransform:"uppercase"}}>INSTITUTO</div>
      <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:19,fontWeight:900,color:gold2,letterSpacing:"1.5px",lineHeight:1}}>MARILDA BRANDÃO</div>
      <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:9,fontWeight:800,color:"#fff",letterSpacing:"3px",textTransform:"uppercase",marginTop:2}}>Sempre com você</div>
    </div>
  );
  return (
    <div style={{textAlign:"center",userSelect:"none"}}>
      <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:15,fontWeight:900,color:"#fff",letterSpacing:"8px",textTransform:"uppercase",marginBottom:8}}>INSTITUTO</div>
      <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:42,fontWeight:900,color:gold2,letterSpacing:"3px",lineHeight:1.05,marginBottom:10}}>MARILDA<br/>BRANDÃO</div>
      <div style={{width:60,height:2,background:`linear-gradient(90deg,transparent,${gold2},transparent)`,margin:"0 auto 12px"}}/>
      <div style={{fontFamily:"'Montserrat',sans-serif",fontSize:12,fontWeight:900,color:"#fff",letterSpacing:"6px",textTransform:"uppercase"}}>Sempre com você</div>
    </div>
  );
}

// ─── QR CODE (inline SVG) ────────────────────────────────────────────────────
function QRCode({ value, size = 130 }) {
  const n = 21, cell = Math.floor(size / n);
  const seed = [...value].reduce((a, c) => a + c.charCodeAt(0), 0);
  const rnd = (i, j) => { let s = (seed * (i * 23 + j * 37 + 1)) % 97; return s < 50; };
  const finder = (r, c) => {
    if ((r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7)) {
      const dr = r < 7 ? r : r - (n - 7), dc = c < 7 ? c : c >= n - 7 ? c - (n - 7) : c;
      if (dr < 0 || dr > 6 || dc < 0 || dc > 6) return false;
      if (dr === 0 || dr === 6 || dc === 0 || dc === 6) return true;
      if (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4) return true;
      return false;
    }
    return rnd(r, c);
  };
  const cells = [];
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (finder(r, c))
        cells.push(<rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} fill="#000" />);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${n * cell} ${n * cell}`} style={{background:"#fff",borderRadius:8,padding:6}}>
      {cells}
    </svg>
  );
}

// ─── WHATSAPP BUTTON ─────────────────────────────────────────────────────────
function WhatsAppBtn({ phone = "5500000000000" }) {
  return (
    <a href={`https://wa.me/${phone}?text=Olá! Gostaria de saber mais sobre o Instituto Marilda Brandão.`}
       target="_blank" rel="noopener noreferrer" className="wa-btn" title="Fale conosco no WhatsApp">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  );
}

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────
function Counter({ target, suffix = "", prefix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = Math.ceil(target / 60);
        const t = setInterval(() => {
          start += step;
          if (start >= target) { setVal(target); clearInterval(t); } else setVal(start);
        }, 25);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{val.toLocaleString("pt-BR")}{suffix}</span>;
}

// ─── GALLERY LIGHTBOX ─────────────────────────────────────────────────────────
const GALLERY = [
  { src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80", cap: "Distribuição de Natal 2024" },
  { src: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80", cap: "Aula de reforço escolar" },
  { src: "https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=600&q=80", cap: "Evento Dia das Crianças" },
  { src: "https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=600&q=80", cap: "Workshop de artes" },
  { src: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600&q=80", cap: "Atividades esportivas" },
  { src: "https://images.unsplash.com/photo-1522661067900-ab829854a57f?w=600&q=80", cap: "Voluntários em ação" },
];

function Gallery() {
  const [light, setLight] = useState(null);
  return (
    <>
      <div className="grid-3">
        {GALLERY.map((g, i) => (
          <div key={i} style={{position:"relative",cursor:"pointer"}} onClick={() => setLight(i)}>
            <img src={g.src} alt={g.cap} className="gallery-img" />
            <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,.6))",color:"#fff",padding:"20px 12px 10px",borderRadius:"0 0 12px 12px",fontSize:13,fontWeight:700}}>
              {g.cap}
            </div>
          </div>
        ))}
      </div>
      {light !== null && (
        <div className="modal-overlay" onClick={() => setLight(null)}>
          <div style={{maxWidth:800,width:"100%"}} onClick={e => e.stopPropagation()}>
            <img src={GALLERY[light].src} alt={GALLERY[light].cap} style={{width:"100%",borderRadius:16,display:"block"}} />
            <div style={{color:"#fff",textAlign:"center",marginTop:12,fontWeight:700,fontSize:16}}>{GALLERY[light].cap}</div>
            <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:12}}>
              <button className="btn btn-out btn-sm" onClick={() => setLight((light - 1 + GALLERY.length) % GALLERY.length)}>← Anterior</button>
              <button className="btn btn-out btn-sm" onClick={() => setLight((light + 1) % GALLERY.length)}>Próxima →</button>
              <button className="btn btn-red btn-sm" onClick={() => setLight(null)}>✕ Fechar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── PIX MODAL ───────────────────────────────────────────────────────────────
function PixModal({ onClose }) {
  const pixKey = "pix@institutomarildabrandao.org.br";
  const [copied, setCopied] = useState(false);
  const [donGoal, setDonGoal] = useState({ current:3200, target:5000, label:"Meta de Natal 2025", currency:"R$" });
  useEffect(() => { DB.getDonGoal().then(g => setDonGoal(g)); }, []);
  const pct = Math.min(100, Math.round(donGoal.current / donGoal.target * 100));
  const copy = () => { navigator.clipboard.writeText(pixKey); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,color:"#0a2d6e",marginBottom:8}}>💛 Faça sua Doação</h2>
        <p style={{color:"#64748b",marginBottom:16,fontSize:14}}>Sua doação ajuda diretamente crianças e famílias em situação de vulnerabilidade.</p>
        {/* Meta progress */}
        <div style={{background:"var(--gold3)",borderRadius:12,padding:"14px 16px",marginBottom:20,border:"1px solid var(--gold)"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:13}}>
            <span style={{fontWeight:800,color:"#0a2d6e"}}>🎯 {donGoal.label}</span>
            <span style={{color:"#64748b"}}>{pct}%</span>
          </div>
          <div style={{background:"rgba(0,0,0,.1)",borderRadius:999,height:10,overflow:"hidden",marginBottom:6}}>
            <div style={{background:"linear-gradient(90deg,var(--gold),var(--gold2))",height:10,borderRadius:999,width:`${pct}%`,transition:".5s"}} />
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#64748b"}}>
            <span>Arrecadado: <strong style={{color:"#0a2d6e"}}>{donGoal.currency} {donGoal.current.toLocaleString("pt-BR")}</strong></span>
            <span>Meta: <strong>{donGoal.currency} {donGoal.target.toLocaleString("pt-BR")}</strong></span>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
          <QRCode value={`pix:${pixKey}`} size={160} />
        </div>
        <p style={{textAlign:"center",fontSize:13,color:"#64748b",marginBottom:8}}>Chave PIX:</p>
        <div className="pix-key">{pixKey}</div>
        <button className="btn btn-gold" style={{width:"100%",marginTop:12,justifyContent:"center"}} onClick={copy}>
          {copied ? "✓ Copiado!" : "📋 Copiar Chave PIX"}
        </button>
        <div style={{textAlign:"center",marginTop:16,fontSize:13,color:"#64748b"}}>
          <strong>Banco:</strong> Banco do Brasil &nbsp;|&nbsp; <strong>Titular:</strong> Instituto Marilda Brandão<br/>
          <strong>CNPJ:</strong> 00.000.000/0001-00
        </div>
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"none",fontSize:20,color:"#64748b"}}>✕</button>
      </div>
    </div>
  );
}

// ─── VOLUNTEER MODAL ─────────────────────────────────────────────────────────
function VolunteerModal({ onClose, toast }) {
  const [form, setForm] = useState({ name:"", email:"", phone:"", area:"", availability:"", message:"" });
  const areas = ["Reforço Escolar","Informática","Esportes","Artes/Cultura","Assistência Social","Administrativo","Outro"];
  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.area) { toast("Preencha nome, e-mail e área","error"); return; }
    await DB.saveVolunteer({ ...form, id: `V${Date.now()}`, createdAt: new Date().toLocaleString("pt-BR") });
    toast("✓ Inscrição enviada! Entraremos em contato em breve.","success");
    onClose();
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:560}} onClick={e => e.stopPropagation()}>
        <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,color:"#0a2d6e",marginBottom:6}}>🤝 Quero ser Voluntário</h2>
        <p style={{color:"#64748b",fontSize:14,marginBottom:20}}>Preencha o formulário e entraremos em contato!</p>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Nome completo *</label>
            <input className="form-input" value={form.name} onChange={e => setForm({...form,name:e.target.value})} placeholder="Seu nome" />
          </div>
          <div className="form-group">
            <label className="form-label">E-mail *</label>
            <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form,email:e.target.value})} placeholder="seu@email.com" />
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Telefone / WhatsApp</label>
            <input className="form-input" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})} placeholder="(00) 00000-0000" />
          </div>
          <div className="form-group">
            <label className="form-label">Disponibilidade</label>
            <select className="form-select" value={form.availability} onChange={e => setForm({...form,availability:e.target.value})}>
              <option value="">Selecione...</option>
              <option>Manhãs</option><option>Tardes</option><option>Noites</option><option>Fins de semana</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Área de interesse *</label>
          <select className="form-select" value={form.area} onChange={e => setForm({...form,area:e.target.value})}>
            <option value="">Selecione uma área...</option>
            {areas.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Mensagem (opcional)</label>
          <textarea className="form-input" rows={3} value={form.message} onChange={e => setForm({...form,message:e.target.value})} placeholder="Conte um pouco sobre você e sua experiência..." />
        </div>
        <div style={{display:"flex",gap:12}}>
          <button className="btn btn-gold" style={{flex:1,justifyContent:"center"}} onClick={handleSubmit}>Enviar Inscrição</button>
          <button className="btn btn-out" style={{background:"#f1f5f9",color:"#64748b"}} onClick={onClose}>Cancelar</button>
        </div>
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"none",fontSize:20,color:"#64748b"}}>✕</button>
      </div>
    </div>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────────
function Home({ go }) {
  const [showPix, setShowPix] = useState(false);
  const [showVol, setShowVol] = useState(false);
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const showToast = (msg, type = "info") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); };
  const [donGoal, setDonGoal] = useState({ current:3200, target:5000, label:"Meta de Natal 2025", currency:"R$" });
  useEffect(() => { DB.getDonGoal().then(g => setDonGoal(g)); }, []);
  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({behavior:"smooth"}); setMenuOpen(false); };
  const programs = [
    { icon: "📚", title: "Reforço Escolar", desc: "Apoio pedagógico para crianças com dificuldades de aprendizado" },
    { icon: "💻", title: "Inclusão Digital", desc: "Cursos de informática e acesso à tecnologia" },
    { icon: "⚽", title: "Esporte e Lazer", desc: "Atividades físicas e recreativas para desenvolvimento integral" },
    { icon: "🎨", title: "Arte e Cultura", desc: "Expressão artística, música e teatro como ferramenta educativa" },
  ];
  const partners = [
    "Prefeitura Municipal","Rotary Club","Lions Club","Sebrae","Senai","Empresa Parceira A","Empresa Parceira B","Empresa Parceira C"
  ];
  const testimonials = [
    { name: "Maria S.", role: "Mãe de beneficiário", text: "Meu filho melhorou muito na escola depois que começou o reforço. O Instituto mudou nossa vida!", avatar: "👩" },
    { name: "João P.", role: "Voluntário há 3 anos", text: "Ver o sorriso das crianças ao receber os kits é uma recompensa que nenhum dinheiro paga.", avatar: "👨" },
    { name: "Carla M.", role: "Doadora", text: "Empresa transparente e séria. Meu investimento realmente chega às crianças.", avatar: "👩‍💼" },
  ];
  return (
    <>
      <style>{CSS}</style>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
      {showPix && <PixModal onClose={() => setShowPix(false)} />}
      {showVol && <VolunteerModal onClose={() => setShowVol(false)} toast={showToast} />}

      {/* NAVBAR */}
      <nav className="nav">
        <IMBLogo variant="nav" />
        {/* Desktop links */}
        <div className="nav-desktop-links" style={{display:"flex",gap:4}}>
          {[["Sobre","sobre"],["Programas","programas"],["Galeria","galeria"],["Transparência","transparencia"],["Contato","contato"]].map(([l,id]) => (
            <button key={id} className="nl" onClick={() => scrollTo(id)}>{l}</button>
          ))}
        </div>
        <div className="nav-actions" style={{display:"flex",gap:8}}>
          <button className="btn btn-out btn-sm" onClick={() => go("login")}>Entrar</button>
          <button className="btn btn-gold btn-sm" onClick={() => go("register")}>Cadastrar-se</button>
        </div>
        {/* Hamburger button */}
        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span style={{transform:menuOpen?"rotate(45deg) translate(5px,5px)":"none"}}/>
          <span style={{opacity:menuOpen?0:1}}/>
          <span style={{transform:menuOpen?"rotate(-45deg) translate(5px,-5px)":"none"}}/>
        </button>
        {/* Mobile dropdown menu */}
        <div className={`nav-mobile-menu${menuOpen?" open":""}`}>
          {[["Sobre","sobre"],["Programas","programas"],["Galeria","galeria"],["Transparência","transparencia"],["Contato","contato"]].map(([l,id]) => (
            <button key={id} className="nl" style={{fontSize:16,padding:"12px 8px",width:"100%",textAlign:"left"}} onClick={() => scrollTo(id)}>{l}</button>
          ))}
          <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:16,width:"100%"}}>
            <button className="btn btn-out" style={{justifyContent:"center"}} onClick={() => { go("login"); setMenuOpen(false); }}>Entrar</button>
            <button className="btn btn-gold" style={{justifyContent:"center"}} onClick={() => { go("register"); setMenuOpen(false); }}>Cadastrar-se</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" style={{paddingBottom:48}}>
        <div className="container" style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:0}}>
          {/* Centered logo block */}
          <IMBLogo variant="hero" />
          <p style={{marginTop:24,fontSize:18,lineHeight:1.7,color:"rgba(255,255,255,.85)",maxWidth:620}}>
            Transformando vidas através da educação, inclusão e solidariedade. Cada criança merece uma oportunidade de crescer com dignidade.
          </p>
          <div className="hero-btns" style={{display:"flex",gap:12,marginTop:28,flexWrap:"wrap",justifyContent:"center"}}>
            <button className="btn btn-gold" onClick={() => setShowPix(true)}>💛 Fazer Doação</button>
            <button className="btn btn-out" onClick={() => scrollTo("sobre")}>Saiba Mais</button>
            <button className="btn btn-out" onClick={() => go("register")}>Cadastrar Família</button>
          </div>
          {/* Cards in a horizontal row */}
          <div className="hero-cards" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginTop:52,width:"100%"}}>
            {programs.map((p, i) => (
              <div key={i} className="program-card" style={{animation:`float ${5+i*0.7}s ease-in-out infinite`,textAlign:"left"}}>
                <div style={{fontSize:34,marginBottom:10}}>{p.icon}</div>
                <div style={{fontWeight:800,marginBottom:6,fontSize:15}}>{p.title}</div>
                <div style={{fontSize:12,opacity:.8,lineHeight:1.5}}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT COUNTERS */}
      <div className="impact-bar">
        <div className="container">
          <div className="grid-4" style={{textAlign:"center"}}>
            {[
              { label:"Crianças Atendidas", target:523, suffix:"+" },
              { label:"Famílias Beneficiadas", target:187, suffix:"+" },
              { label:"Eventos Realizados", target:64, suffix:"" },
              { label:"Voluntários Ativos", target:42, suffix:"" },
            ].map((c, i) => (
              <div key={i}>
                <div className="impact-num"><Counter target={c.target} suffix={c.suffix} /></div>
                <div style={{fontWeight:700,fontSize:14,color:"#0a2d6e",marginTop:4}}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SOBRE */}
      <section id="sobre" className="section" style={{background:"#fff"}}>
        <div className="container">
          <div className="grid-2" style={{alignItems:"center",gap:64}}>
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,color:"var(--gold)",letterSpacing:"3px",textTransform:"uppercase",marginBottom:8}}>Nossa História</div>
              <h2 className="section-title">Quem Somos</h2>
              <p style={{color:"#475569",lineHeight:1.8,marginBottom:16}}>
                O Instituto Marilda Brandão nasceu do sonho de garantir que toda criança tivesse acesso a educação de qualidade, independente de sua condição social. Fundado com amor e dedicação, atendemos famílias em situação de vulnerabilidade há mais de uma década.
              </p>
              <p style={{color:"#475569",lineHeight:1.8,marginBottom:24}}>
                Nossa missão é clara: promover o desenvolvimento integral de crianças e adolescentes através de programas educativos, culturais e de inclusão social, sempre respeitando a dignidade de cada família.
              </p>
              <div style={{display:"flex",gap:12}}>
                <button className="btn btn-blue btn-sm" onClick={() => setShowVol(true)}>🤝 Seja Voluntário</button>
                <button className="btn btn-gold btn-sm" onClick={() => setShowPix(true)}>💛 Doe Agora</button>
              </div>
            </div>
            <div>
              <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&q=80" alt="Instituto" style={{width:"100%",borderRadius:20,boxShadow:"0 8px 40px rgba(0,0,0,.15)"}} />
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMAS */}
      <section id="programas" className="section">
        <div className="container">
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,color:"var(--gold)",letterSpacing:"3px",textTransform:"uppercase",marginBottom:8}}>O que fazemos</div>
          <h2 className="section-title">Nossos Programas</h2>
          <p className="section-sub">Atividades pensadas para o desenvolvimento completo das crianças</p>
          <div className="grid-4">
            {[
              { icon:"📚", title:"Reforço Escolar", desc:"Apoio em Matemática, Português e outras disciplinas com professores voluntários.", color:"#dbeafe" },
              { icon:"💻", title:"Inclusão Digital", desc:"Cursos de informática básica e internet para crianças e adolescentes.", color:"#dcfce7" },
              { icon:"⚽", title:"Esporte e Lazer", desc:"Futebol, vôlei e atividades recreativas promovendo saúde e convivência.", color:"#fce7f3" },
              { icon:"🎨", title:"Arte e Cultura", desc:"Música, teatro, dança e artes visuais como expressão e desenvolvimento.", color:"#fef9c3" },
              { icon:"🍎", title:"Alimentação", desc:"Refeições nutritivas distribuídas durante as atividades no instituto.", color:"#ffedd5" },
              { icon:"🩺", title:"Saúde", desc:"Parceria com profissionais de saúde para atendimento básico e preventivo.", color:"#ede9fe" },
              { icon:"👨‍👩‍👧", title:"Apoio Familiar", desc:"Orientação e assistência social para toda a família beneficiária.", color:"#fce7f3" },
              { icon:"🎁", title:"Eventos Especiais", desc:"Distribuição de kits em datas comemorativas como Natal e Páscoa.", color:"#dbeafe" },
            ].map((p, i) => (
              <div key={i} className="card" style={{padding:24}}>
                <div style={{width:52,height:52,background:p.color,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,marginBottom:14}}>{p.icon}</div>
                <div style={{fontWeight:800,fontSize:15,marginBottom:6,color:"#0a2d6e"}}>{p.title}</div>
                <div style={{fontSize:13,color:"#64748b",lineHeight:1.6}}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALERIA */}
      <section id="galeria" className="section" style={{background:"#fff"}}>
        <div className="container">
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,color:"var(--gold)",letterSpacing:"3px",textTransform:"uppercase",marginBottom:8}}>Momentos</div>
          <h2 className="section-title">Galeria de Fotos</h2>
          <p className="section-sub">Registros das nossas atividades e eventos</p>
          <Gallery />
        </div>
      </section>

      {/* VÍDEO */}
      <section className="section" style={{background:"var(--navy)"}}>
        <div className="container">
          <div className="grid-2" style={{alignItems:"center",gap:48}}>
            <div style={{color:"#fff"}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,color:"var(--gold2)",letterSpacing:"3px",textTransform:"uppercase",marginBottom:8}}>Nossa Missão</div>
              <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:36,fontWeight:900,color:"#fff",marginBottom:16}}>Conheça Nossa História</h2>
              <p style={{color:"rgba(255,255,255,.75)",lineHeight:1.8,marginBottom:24}}>
                Assista ao vídeo institucional do Instituto Marilda Brandão e veja de perto o impacto que geramos na vida de centenas de crianças e famílias.
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {["Mais de 10 anos de história","Atuação em comunidades vulneráveis","Projetos reconhecidos pelo poder público"].map((t, i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,color:"rgba(255,255,255,.85)",fontSize:14}}>
                    <span style={{color:"var(--gold2)",fontSize:18}}>✓</span>{t}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="video-wrapper" style={{boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}>
                {/* Substitua pelo ID do seu vídeo do YouTube */}
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Instituto Marilda Brandão - Vídeo Institucional"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p style={{color:"rgba(255,255,255,.4)",fontSize:11,textAlign:"center",marginTop:8}}>* Substitua o ID do vídeo pelo seu vídeo no YouTube</p>
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="section">
        <div className="container">
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,color:"var(--gold)",letterSpacing:"3px",textTransform:"uppercase",marginBottom:8}}>Histórias Reais</div>
          <h2 className="section-title">Depoimentos</h2>
          <p className="section-sub">O que dizem quem faz parte desta história</p>
          <div className="grid-3">
            {testimonials.map((t, i) => (
              <div key={i} className="testi-card">
                <div style={{fontSize:32,marginBottom:12}}>"</div>
                <p style={{color:"#475569",lineHeight:1.7,marginBottom:20,fontStyle:"italic"}}>{t.text}</p>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:"var(--sky)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{t.avatar}</div>
                  <div>
                    <div style={{fontWeight:800,fontSize:14,color:"#0a2d6e"}}>{t.name}</div>
                    <div style={{fontSize:12,color:"#64748b"}}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRANSPARÊNCIA + SELOS */}
      <section id="transparencia" className="section" style={{background:"#fff"}}>
        <div className="container">
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,color:"var(--gold)",letterSpacing:"3px",textTransform:"uppercase",marginBottom:8}}>Credibilidade</div>
          <h2 className="section-title">Transparência</h2>
          <p className="section-sub">Comprometidos com a ética, transparência e prestação de contas</p>
          <div className="grid-4">
            <div className="seal">
              <span style={{fontSize:32}}>🏛️</span>
              <div>
                <div style={{fontWeight:800,fontSize:14,color:"#0a2d6e"}}>CNPJ Ativo</div>
                <a href="https://www.receita.fazenda.gov.br/pessoajuridica/cnpj/cnpjreva/cnpjrevainfo.asp" target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:"var(--blue)"}}>00.000.000/0001-00 ↗</a>
              </div>
            </div>
            <div className="seal">
              <span style={{fontSize:32}}>📋</span>
              <div>
                <div style={{fontWeight:800,fontSize:14,color:"#0a2d6e"}}>ONG Cadastrada</div>
                <div style={{fontSize:12,color:"#64748b"}}>Conselho Municipal</div>
              </div>
            </div>
            <div className="seal">
              <span style={{fontSize:32}}>✅</span>
              <div>
                <div style={{fontWeight:800,fontSize:14,color:"#0a2d6e"}}>Utilidade Pública</div>
                <div style={{fontSize:12,color:"#64748b"}}>Decreto Municipal</div>
              </div>
            </div>
            <div className="seal">
              <span style={{fontSize:32}}>📊</span>
              <div>
                <div style={{fontWeight:800,fontSize:14,color:"#0a2d6e"}}>Prestação de Contas</div>
                <div style={{fontSize:12,color:"var(--blue)",cursor:"pointer"}}>Ver Relatório Anual</div>
              </div>
            </div>
          </div>
          <div style={{marginTop:32,padding:24,background:"var(--sky)",borderRadius:16,borderLeft:"4px solid var(--blue)"}}>
            <p style={{color:"#1e40af",fontWeight:700,fontSize:14}}>
              🔒 <strong>Compromisso de Transparência:</strong> O Instituto Marilda Brandão publica relatórios anuais de atividades e prestação de contas. Toda doação recebida é destinada integralmente aos programas sociais. Nossa sede está aberta para visitas mediante agendamento.
            </p>
          </div>
        </div>
      </section>

      {/* DOAÇÕES */}
      <section id="doacoes" className="section">
        <div className="container">
          <div className="donate-box">
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,color:"var(--gold2)",letterSpacing:"3px",textTransform:"uppercase",marginBottom:8}}>Faça a Diferença</div>
            <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:40,fontWeight:900,color:"#fff",marginBottom:16}}>Apoie Nossa Causa</h2>
            <p style={{color:"rgba(255,255,255,.8)",fontSize:16,marginBottom:32,maxWidth:600,margin:"0 auto 32px"}}>
              Sua doação, por menor que seja, transforma a vida de uma criança. Cada real contribui para educação, alimentação e um futuro melhor.
            </p>
            {/* META DE DOAÇÃO */}
            <div style={{maxWidth:520,margin:"0 auto 36px",background:"rgba(255,255,255,.08)",borderRadius:16,padding:"20px 24px",border:"1px solid rgba(255,255,255,.15)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontWeight:800,color:"var(--gold2)",fontSize:15}}>🎯 {donGoal.label}</span>
                <span style={{fontSize:13,color:"rgba(255,255,255,.7)"}}>{Math.round(donGoal.current/donGoal.target*100)}%</span>
              </div>
              <div style={{background:"rgba(255,255,255,.15)",borderRadius:999,height:14,overflow:"hidden",marginBottom:8}}>
                <div style={{background:"linear-gradient(90deg,var(--gold),var(--gold2))",height:14,borderRadius:999,width:`${Math.min(100,Math.round(donGoal.current/donGoal.target*100))}%`,transition:"width 1s ease",boxShadow:"0 0 10px rgba(245,200,66,.5)"}} />
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"rgba(255,255,255,.6)"}}>
                <span>Arrecadado: <strong style={{color:"var(--gold2)"}}>{donGoal.currency} {donGoal.current.toLocaleString("pt-BR")}</strong></span>
                <span>Meta: <strong style={{color:"#fff"}}>{donGoal.currency} {donGoal.target.toLocaleString("pt-BR")}</strong></span>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:16,flexWrap:"wrap",marginBottom:32}}>
              {[["R$ 20","Caderno e canetas"],["R$ 50","Kit escolar completo"],["R$ 100","Cesta básica"],["Outro valor","Escolha o valor"]].map(([v, d]) => (
                <button key={v} className="btn" style={{background:"rgba(255,255,255,.15)",color:"#fff",border:"2px solid rgba(255,255,255,.3)",flexDirection:"column",gap:2,padding:"12px 20px"}}
                  onClick={() => setShowPix(true)}>
                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:900}}>{v}</span>
                  <span style={{fontSize:11,opacity:.75}}>{d}</span>
                </button>
              ))}
            </div>
            <button className="btn btn-gold" style={{fontSize:18,padding:"14px 40px"}} onClick={() => setShowPix(true)}>
              💛 Fazer Doação via PIX
            </button>
          </div>
        </div>
      </section>

      {/* PARCEIROS */}
      <section className="section" style={{background:"#fff"}}>
        <div className="container">
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,color:"var(--gold)",letterSpacing:"3px",textTransform:"uppercase",marginBottom:8}}>Quem nos apoia</div>
          <h2 className="section-title">Parceiros e Apoiadores</h2>
          <p className="section-sub">Empresas e organizações que acreditam no nosso trabalho</p>
          <div className="grid-4">
            {partners.map((p, i) => (
              <div key={i} className="partner-logo">
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:24,marginBottom:6}}>🤝</div>
                  <div>{p}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:40}}>
            <p style={{color:"#64748b",marginBottom:16}}>Sua empresa pode fazer parte desta história</p>
            <button className="btn btn-blue" onClick={() => document.getElementById("contato")?.scrollIntoView({behavior:"smooth"})}>
              Seja um Parceiro →
            </button>
          </div>
        </div>
      </section>

      {/* VOLUNTÁRIOS */}
      <section className="section" style={{background:"linear-gradient(135deg,#f0f9ff,#e0f2fe)"}}>
        <div className="container">
          <div className="grid-2" style={{alignItems:"center",gap:48}}>
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,color:"var(--gold)",letterSpacing:"3px",textTransform:"uppercase",marginBottom:8}}>Faça parte</div>
              <h2 className="section-title">Seja Voluntário</h2>
              <p style={{color:"#475569",lineHeight:1.8,marginBottom:16}}>
                Sua habilidade pode transformar a vida de uma criança. Buscamos voluntários para reforço escolar, informática, esportes, artes e muito mais.
              </p>
              <div className="grid-2" style={{gap:12,marginBottom:24}}>
                {["Professores","Profissionais de TI","Artistas","Monitores","Assistentes Sociais","Qualquer pessoa de boa vontade!"].map((a, i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:14,color:"#475569"}}>
                    <span style={{color:"var(--gold)",fontSize:16}}>★</span>{a}
                  </div>
                ))}
              </div>
              <button className="btn btn-blue" onClick={() => setShowVol(true)}>🤝 Quero ser Voluntário</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {[
                { icon:"⏰", title:"Horários Flexíveis", desc:"Atue nos horários que você tem disponível" },
                { icon:"📍", title:"Presencial ou Online", desc:"Atividades no Instituto ou via videochamada" },
                { icon:"🏆", title:"Certificado de Voluntariado", desc:"Emitimos certificado de horas voluntárias" },
                { icon:"❤️", title:"Impacto Real", desc:"Veja diretamente o resultado do seu trabalho" },
              ].map((b, i) => (
                <div key={i} style={{display:"flex",gap:16,alignItems:"flex-start",background:"#fff",padding:"16px 20px",borderRadius:12,boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
                  <span style={{fontSize:28}}>{b.icon}</span>
                  <div>
                    <div style={{fontWeight:800,fontSize:15,color:"#0a2d6e"}}>{b.title}</div>
                    <div style={{fontSize:13,color:"#64748b"}}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTATO + MAPA */}
      <section id="contato" className="section" style={{background:"#fff"}}>
        <div className="container">
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:13,fontWeight:800,color:"var(--gold)",letterSpacing:"3px",textTransform:"uppercase",marginBottom:8}}>Fale Conosco</div>
          <h2 className="section-title">Contato</h2>
          <p className="section-sub">Estamos aqui para atendê-lo. Entre em contato conosco!</p>
          <div className="grid-2" style={{gap:48}}>
            <div>
              <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:32}}>
                {[
                  { icon:"📍", label:"Endereço", value:"Rua das Flores, 123 – Bairro Centro – Cidade/UF – CEP 00000-000" },
                  { icon:"📞", label:"Telefone", value:"(00) 0000-0000 | (00) 00000-0000" },
                  { icon:"📧", label:"E-mail", value:"contato@marildabrandao.org.br" },
                  { icon:"🕐", label:"Horário", value:"Segunda a Sexta: 8h às 17h | Sábado: 8h às 12h" },
                ].map((c, i) => (
                  <div key={i} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                    <span style={{fontSize:22,width:30,textAlign:"center"}}>{c.icon}</span>
                    <div>
                      <div style={{fontWeight:800,fontSize:13,color:"#0a2d6e",marginBottom:2}}>{c.label}</div>
                      <div style={{fontSize:14,color:"#475569"}}>{c.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:12}}>
                <button className="btn btn-gold" onClick={() => setShowPix(true)}>💛 Fazer Doação</button>
                <button className="btn btn-blue" onClick={() => setShowVol(true)}>🤝 Ser Voluntário</button>
              </div>
            </div>
            <div>
              {/* Substitua pela URL do seu endereço real no Google Maps */}
              <div style={{borderRadius:16,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,.1)",height:300}}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1975577506963!2d-46.65428888502167!3d-23.562631367662396!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt!2sbr!4v1620000000000!5m2!1spt!2sbr"
                  width="100%" height="300" style={{border:0,display:"block"}}
                  allowFullScreen loading="lazy"
                  title="Localização do Instituto"
                />
              </div>
              <p style={{fontSize:11,color:"#94a3b8",marginTop:6,textAlign:"center"}}>* Atualize o link com o endereço real do Instituto</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="grid-3" style={{marginBottom:32}}>
            <div>
              <IMBLogo variant="nav" />
              <p style={{marginTop:16,fontSize:13,lineHeight:1.7,color:"rgba(255,255,255,.55)"}}>
                Transformando vidas através da educação e inclusão social. Junte-se a nós nessa missão.
              </p>
            </div>
            <div>
              <div style={{fontWeight:800,color:"#fff",marginBottom:12}}>Links Rápidos</div>
              {[["Sobre nós","sobre"],["Programas","programas"],["Transparência","transparencia"],["Contato","contato"]].map(([l,id]) => (
                <div key={id}><button className="nl" style={{padding:"4px 0",display:"block"}} onClick={() => document.getElementById(id)?.scrollIntoView({behavior:"smooth"})}>{l}</button></div>
              ))}
            </div>
            <div>
              <div style={{fontWeight:800,color:"#fff",marginBottom:12}}>Acesso</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <button className="btn btn-gold btn-sm" style={{justifyContent:"center"}} onClick={() => go("register")}>Cadastrar Família</button>
                <button className="btn btn-out btn-sm" style={{justifyContent:"center"}} onClick={() => go("login")}>Área do Beneficiário</button>
                <button className="btn btn-out btn-sm" style={{justifyContent:"center"}} onClick={() => setShowPix(true)}>💛 Fazer Doação</button>
              </div>
            </div>
          </div>
          <div style={{borderTop:"1px solid rgba(255,255,255,.1)",paddingTop:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
            <div style={{fontSize:12}}>© 2025 Instituto Marilda Brandão • CNPJ: 00.000.000/0001-00</div>
            <div style={{fontSize:12}}>Feito com 💛 por quem acredita na transformação social</div>
          </div>
        </div>
      </footer>
      <WhatsAppBtn phone="5500000000000" />
    </>
  );
}

// ─── REGISTER ────────────────────────────────────────────────────────────────
function Register({ go, toast }) {
  const [f, setF] = useState({ name:"",email:"",cpf:"",phone:"",birthdate:"",address:"",neighborhood:"",city:"",state:"",children:"0",childrenNames:"",reason:"",howKnew:"",photoUrl:"",password:"",confirm:"" });
  const set = k => e => setF({...f,[k]:e.target.value});
  const handleSubmit = async () => {
    if (!f.name||!f.email||!f.password) { toast("Preencha todos os campos obrigatórios","error"); return; }
    if (f.password !== f.confirm) { toast("Senhas não conferem","error"); return; }
    const users = await DB.getUsers();
    if (users.find(u => u.email === f.email)) { toast("E-mail já cadastrado","error"); return; }
    const newUser = { ...f, id:`U${Date.now()}`, status:"pending", createdAt:new Date().toLocaleString("pt-BR"), qrCodes:{}, usedQrCodes:{} };
    delete newUser.confirm;
    await DB.saveUser(newUser);
    toast("✓ Cadastro enviado! Aguarde aprovação.","success");
    setTimeout(() => go("login"), 1500);
  };
  return (
    <>
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",background:"var(--bg)",padding:"32px 20px"}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{background:"var(--navy)",borderRadius:"20px 20px 0 0",padding:32,textAlign:"center"}}>
            <IMBLogo variant="hero" />
          </div>
          <div className="card" style={{borderRadius:"0 0 20px 20px",padding:32}}>
            <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,color:"#0a2d6e",marginBottom:4}}>Cadastro de Família</h2>
            <p style={{color:"#64748b",fontSize:14,marginBottom:24}}>Preencha seus dados para solicitar atendimento pelo Instituto</p>
            <div className="grid-2">
              {[["name","Nome Completo *","text"],["email","E-mail *","email"],["cpf","CPF","text"],["phone","Telefone / WhatsApp","text"],["birthdate","Data de Nascimento","date"],["address","Endereço Completo","text"]].map(([k,l,t]) => (
                <div key={k} className="form-group" style={k==="address"?{gridColumn:"1/-1"}:{}}>
                  <label className="form-label">{l}</label>
                  <input className="form-input" type={t} value={f[k]} onChange={set(k)} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Cidade</label>
                <input className="form-input" value={f.city} onChange={set("city")} />
              </div>
              <div className="form-group">
                <label className="form-label">Bairro</label>
                <input className="form-input" value={f.neighborhood} onChange={set("neighborhood")} placeholder="Ex: Centro, Vila Nova..." />
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select className="form-select" value={f.state} onChange={set("state")}>
                  <option value="">Selecione...</option>
                  {"AC,AL,AP,AM,BA,CE,DF,ES,GO,MA,MT,MS,MG,PA,PB,PR,PE,PI,RJ,RN,RS,RO,RR,SC,SP,SE,TO".split(",").map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nº de crianças dependentes</label>
                <input className="form-input" type="number" min="0" max="20" value={f.children} onChange={set("children")} />
              </div>
              <div className="form-group">
                <label className="form-label">Nome das crianças (idades)</label>
                <input className="form-input" value={f.childrenNames} onChange={set("childrenNames")} placeholder="Ex: Ana (8), Pedro (12)" />
              </div>
              <div className="form-group" style={{gridColumn:"1/-1"}}>
                <label className="form-label">Como conheceu o Instituto?</label>
                <select className="form-select" value={f.howKnew} onChange={set("howKnew")}>
                  <option value="">Selecione...</option>
                  {["Indicação de amigo/familiar","Redes sociais","Igreja/Templo","Escola","Posto de saúde","Prefeitura","Outro"].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="form-group" style={{gridColumn:"1/-1"}}>
                <label className="form-label">Por que busca atendimento?</label>
                <textarea className="form-input" rows={3} value={f.reason} onChange={set("reason")} placeholder="Descreva brevemente sua situação..." />
              </div>
              <div className="form-group" style={{gridColumn:"1/-1"}}>
                <label className="form-label">📷 Foto da Família (link, opcional)</label>
                <input className="form-input" value={f.photoUrl} onChange={set("photoUrl")} placeholder="Cole um link de foto do Google Drive, iCloud etc." />
                {f.photoUrl && <img src={f.photoUrl} alt="preview" style={{marginTop:8,width:"100%",maxHeight:140,objectFit:"cover",borderRadius:8,border:"2px solid var(--light)"}} onError={e => e.target.style.display="none"} />}
                <div style={{fontSize:11,color:"#94a3b8",marginTop:4}}>Opcional — ajuda o admin a identificar a família nos eventos</div>
              </div>
              <div className="form-group">
                <label className="form-label">Senha *</label>
                <input className="form-input" type="password" value={f.password} onChange={set("password")} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirmar Senha *</label>
                <input className="form-input" type="password" value={f.confirm} onChange={set("confirm")} />
              </div>
            </div>
            <div style={{display:"flex",gap:12,marginTop:8}}>
              <button className="btn btn-gold" style={{flex:1,justifyContent:"center"}} onClick={handleSubmit}>Enviar Cadastro</button>
              <button className="btn" style={{background:"#f1f5f9",color:"#64748b"}} onClick={() => go("home")}>Voltar</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
function Login({ go, onLogin, toast }) {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [tab, setTab] = useState("familia"); // "familia" | "colaborador"
  const handleLogin = async () => {
    if (email === "admin@marildabrandao.org.br" && pw === "admin123") {
      onLogin({ name:"Administrador", email, role:"admin" }); go("admin"); return;
    }
    if (tab === "colaborador") {
      const cols = await DB.getCollaborators();
      const c = cols.find(c => c.email===email && c.password===pw);
      if (!c) { toast("E-mail ou senha incorretos","error"); return; }
      if (c.status==="pending") { toast("Cadastro aguardando aprovação do admin","error"); return; }
      if (c.status==="rejected") { toast("Cadastro não aprovado. Entre em contato.","error"); return; }
      onLogin({...c, role:"collaborator"}); go("collaborator"); return;
    }
    const users = await DB.getUsers();
    const u = users.find(u => u.email===email && u.password===pw);
    if (!u) { toast("E-mail ou senha incorretos","error"); return; }
    if (u.status==="pending") { toast("Cadastro aguardando aprovação","error"); return; }
    if (u.status==="rejected") { toast("Cadastro não aprovado. Entre em contato.","error"); return; }
    onLogin(u); go("dashboard");
  };
  const inp = {background:"rgba(255,255,255,.1)",border:"2px solid rgba(255,255,255,.2)",color:"#fff"};
  return (
    <>
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0a2d6e,#1a5bb8)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{background:"rgba(255,255,255,.06)",backdropFilter:"blur(20px)",borderRadius:24,padding:40,width:"100%",maxWidth:420,border:"1px solid rgba(255,255,255,.15)"}}>
          <div style={{marginBottom:28,textAlign:"center"}}>
            <IMBLogo variant="hero" />
          </div>
          {/* Tab selector */}
          <div style={{display:"flex",background:"rgba(0,0,0,.2)",borderRadius:12,padding:4,marginBottom:24,gap:4}}>
            {[["familia","👨‍👩‍👧 Família"],["colaborador","🤝 Colaborador"]].map(([v,l]) => (
              <button key={v} onClick={() => setTab(v)} style={{flex:1,padding:"8px 0",borderRadius:8,fontWeight:800,fontSize:13,
                background:tab===v?"rgba(255,255,255,.15)":"transparent",
                color:tab===v?"#fff":"rgba(255,255,255,.5)",transition:".2s"}}>
                {l}
              </button>
            ))}
          </div>
          <div className="form-group">
            <label className="form-label" style={{color:"rgba(255,255,255,.7)"}}>E-mail</label>
            <input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={inp} placeholder="seu@email.com" />
          </div>
          <div className="form-group">
            <label className="form-label" style={{color:"rgba(255,255,255,.7)"}}>Senha</label>
            <input className="form-input" type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} style={inp} placeholder="••••••••" />
          </div>
          <button className="btn btn-gold" style={{width:"100%",justifyContent:"center",marginTop:8,padding:"13px"}} onClick={handleLogin}>Entrar</button>
          <div style={{textAlign:"center",marginTop:16}}>
            {tab==="familia" ? (
              <button className="nl" onClick={() => go("register")} style={{color:"rgba(255,255,255,.6)",fontSize:13}}>Não tem cadastro? <span style={{color:"var(--gold2)",fontWeight:800}}>Cadastre-se</span></button>
            ) : (
              <button className="nl" onClick={() => go("collabregister")} style={{color:"rgba(255,255,255,.6)",fontSize:13}}>Quer ser colaborador? <span style={{color:"var(--gold2)",fontWeight:800}}>Solicite acesso</span></button>
            )}
          </div>
          <div style={{textAlign:"center",marginTop:8}}>
            <button className="nl" onClick={() => go("home")} style={{color:"rgba(255,255,255,.4)",fontSize:12}}>← Voltar ao site</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── CALENDAR COMPONENT ──────────────────────────────────────────────────────
function EventCalendar({ events }) {
  const [cur, setCur] = useState(new Date());
  const year = cur.getFullYear(), month = cur.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const eventDates = events.reduce((acc, ev) => {
    const d = new Date(ev.date);
    if (d.getFullYear()===year && d.getMonth()===month) acc[d.getDate()] = ev;
    return acc;
  }, {});
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  return (
    <div className="card" style={{padding:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <button className="btn btn-sm" style={{background:"#f1f5f9",color:"#64748b"}} onClick={() => setCur(new Date(year, month-1))}>◀</button>
        <span style={{fontWeight:800,color:"#0a2d6e"}}>{monthNames[month]} {year}</span>
        <button className="btn btn-sm" style={{background:"#f1f5f9",color:"#64748b"}} onClick={() => setCur(new Date(year, month+1))}>▶</button>
      </div>
      <div className="cal-grid">
        {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d => (
          <div key={d} style={{textAlign:"center",fontSize:11,fontWeight:800,color:"#94a3b8",padding:"4px 0"}}>{d}</div>
        ))}
        {cells.map((d, i) => {
          const ev = d ? eventDates[d] : null;
          const isToday = d && today.getDate()===d && today.getMonth()===month && today.getFullYear()===year;
          return (
            <div key={i} className={`cal-day${isToday?" today":""}${ev?" has-event":""}`}
              title={ev ? `${ev.icon} ${ev.label}` : ""}>
              {d || ""}
              {ev && <span style={{position:"absolute",bottom:2,left:"50%",transform:"translateX(-50%)",fontSize:8}}>{ev.icon}</span>}
            </div>
          );
        })}
      </div>
      {Object.values(eventDates).length > 0 && (
        <div style={{marginTop:12,borderTop:"1px solid #e2e8f0",paddingTop:12}}>
          {Object.values(eventDates).map((ev, i) => (
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#475569",padding:"4px 0"}}>
              <span>{ev.icon}</span><span style={{fontWeight:700}}>{ev.label}</span>
              <span style={{marginLeft:"auto",fontSize:12,color:"#94a3b8"}}>{new Date(ev.date).toLocaleDateString("pt-BR")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ user, go, logout }) {
  const [userData, setUserData] = useState(user);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  useEffect(() => {
    DB.getEvents().then(evs => setEvents(evs));
    DB.getAnnouncements().then(anns => setAnnouncements(anns.filter(a => !a.expiresAt || new Date(a.expiresAt) >= new Date())));
    DB.getUsers().then(users => {
      const fresh = users.find(u => u.email === user.email);
      if (fresh) setUserData(fresh);
    });
  }, [user.email]);
  const usedCount = Object.keys(userData.usedQrCodes||{}).length;
  const qrCount = Object.keys(userData.qrCodes||{}).length;
  return (
    <>
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",background:"var(--bg)"}}>
        <div className="dash-header">
          <div style={{maxWidth:1000,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <IMBLogo variant="nav" />
              <div style={{marginTop:12,fontSize:22,fontWeight:800}}>Olá, {userData.name?.split(" ")[0]}! 👋</div>
              <div style={{fontSize:14,color:"rgba(255,255,255,.7)"}}>Bem-vindo à sua área</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="btn btn-out btn-sm" onClick={() => go("home")}>🏠 Site</button>
              <button className="btn btn-red btn-sm" onClick={logout}>Sair</button>
            </div>
          </div>
        </div>
        <div style={{maxWidth:1000,margin:"0 auto",padding:24}}>
          {/* Stats */}
          <div className="grid-4" style={{marginBottom:24}}>
            {[
              { label:"QR Codes Ativos", value:qrCount - usedCount, icon:"🔲", color:"#dbeafe" },
              { label:"Já Utilizados", value:usedCount, icon:"✅", color:"#dcfce7" },
              { label:"Total Recebidos", value:qrCount, icon:"🎁", color:"#fce7f3" },
              { label:"Eventos Disponíveis", value:events.length, icon:"🗓️", color:"#fff3cd" },
            ].map((s, i) => (
              <div key={i} className="card" style={{padding:20,borderLeft:`4px solid`,borderLeftColor:["#3b82f6","#22c55e","#ec4899","#f59e0b"][i]}}>
                <div style={{fontSize:28,marginBottom:8}}>{s.icon}</div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,fontWeight:900,color:"#0a2d6e"}}>{s.value}</div>
                <div style={{fontSize:12,color:"#64748b",fontWeight:700}}>{s.label}</div>
              </div>
            ))}
          </div>
          <div className="grid-2" style={{marginBottom:24,alignItems:"start"}}>
            {/* Profile */}
            <div className="card" style={{padding:24}}>
              <h3 style={{fontWeight:800,color:"#0a2d6e",marginBottom:16}}>👤 Meus Dados</h3>
              {[
                ["Nome",userData.name],["E-mail",userData.email],["Telefone",userData.phone||"-"],
                ["Cidade",userData.city||"-"],["Estado",userData.state||"-"],
                ["Crianças",userData.children||"0"],["Nomes",userData.childrenNames||"-"],
              ].map(([l,v]) => (
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f1f5f9",fontSize:14}}>
                  <span style={{fontWeight:700,color:"#64748b"}}>{l}</span>
                  <span style={{color:"#1e293b",textAlign:"right",maxWidth:"60%"}}>{v}</span>
                </div>
              ))}
              <div style={{marginTop:12,padding:"8px 12px",background:"#dcfce7",borderRadius:8,fontSize:13,fontWeight:700,color:"#166534"}}>
                ✅ Cadastro Aprovado
              </div>
            </div>
            {/* Calendar */}
            <div>
              <h3 style={{fontWeight:800,color:"#0a2d6e",marginBottom:12}}>🗓️ Próximos Eventos</h3>
              <EventCalendar events={events} />
            </div>
          </div>
          {/* Announcements */}
          {announcements.length > 0 && (
            <div style={{marginBottom:24}}>
              <h3 style={{fontWeight:800,color:"#0a2d6e",marginBottom:12}}>📢 Avisos do Instituto</h3>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {announcements.map(a => (
                  <div key={a.id} style={{padding:"14px 18px",borderRadius:12,borderLeft:`4px solid ${a.priority==="urgente"?"#ef4444":a.priority==="importante"?"#f59e0b":"#3b82f6"}`,
                    background:a.priority==="urgente"?"#fee2e2":a.priority==="importante"?"#fef9c3":"var(--sky)"}}>
                    <div style={{fontWeight:800,fontSize:15,marginBottom:4,color:"#0a2d6e"}}>{a.title}</div>
                    <div style={{fontSize:14,color:"#475569",lineHeight:1.6}}>{a.body}</div>
                    <div style={{fontSize:11,color:"#94a3b8",marginTop:6}}>{a.createdAt}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* QR Codes */}
          {events.length > 0 && (
            <div className="card" style={{padding:24}}>
              <h3 style={{fontWeight:800,color:"#0a2d6e",marginBottom:16}}>🎫 Meus QR Codes</h3>
              {events.length === 0 ? (
                <p style={{color:"#94a3b8",textAlign:"center",padding:24}}>Nenhum evento disponível no momento</p>
              ) : (
                <div className="grid-4">
                  {events.map(ev => {
                    const qr = userData.qrCodes?.[ev.id];
                    const used = userData.usedQrCodes?.[ev.id];
                    return (
                      <div key={ev.id} className={`qr-card${used?" used":""}`}>
                        <div style={{fontSize:28,marginBottom:4}}>{ev.icon}</div>
                        <div style={{fontWeight:800,fontSize:14,color:"#0a2d6e",marginBottom:4}}>{ev.label}</div>
                        <div style={{fontSize:12,color:"#64748b",marginBottom:12}}>{new Date(ev.date).toLocaleDateString("pt-BR")}</div>
                        {qr ? (
                          <>
                            <QRCode value={qr} size={110} />
                            <div style={{marginTop:8,fontSize:10,color:"#94a3b8",wordBreak:"break-all"}}>{qr}</div>
                            {used ? (
                              <div style={{marginTop:8,padding:"4px 10px",background:"#f1f5f9",borderRadius:20,fontSize:11,fontWeight:700,color:"#64748b"}}>✅ Utilizado em {used}</div>
                            ) : (
                              <div style={{marginTop:8,padding:"4px 10px",background:"#dcfce7",borderRadius:20,fontSize:11,fontWeight:700,color:"#166534"}}>🟢 Disponível</div>
                            )}
                          </>
                        ) : (
                          <div style={{padding:"20px 0",color:"#94a3b8",fontSize:13}}>Aguardando atribuição</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <WhatsAppBtn phone="5500000000000" />
    </>
  );
}

// ─── COLLABORATOR REGISTER ───────────────────────────────────────────────────
function CollaboratorRegister({ go, toast }) {
  const [f, setF] = useState({ name:"", email:"", phone:"", role:"Validador de QR", password:"", confirm:"" });
  const set = k => e => setF({...f,[k]:e.target.value});
  const handleSubmit = async () => {
    if (!f.name||!f.email||!f.password) { toast("Preencha todos os campos obrigatórios","error"); return; }
    if (f.password !== f.confirm) { toast("Senhas não conferem","error"); return; }
    const cols = await DB.getCollaborators();
    if (cols.find(c => c.email===f.email)) { toast("E-mail já cadastrado","error"); return; }
    const newCol = { ...f, id:`C${Date.now()}`, status:"pending", createdAt:new Date().toLocaleString("pt-BR") };
    delete newCol.confirm;
    await DB.saveCollaborator(newCol);
    toast("✓ Solicitação enviada! Aguarde aprovação do administrador.","success");
    setTimeout(() => go("login"), 1800);
  };
  return (
    <>
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",background:"var(--bg)",padding:"32px 20px"}}>
        <div style={{maxWidth:560,margin:"0 auto"}}>
          <div style={{background:"var(--navy)",borderRadius:"20px 20px 0 0",padding:32,textAlign:"center"}}>
            <IMBLogo variant="hero" />
          </div>
          <div className="card" style={{borderRadius:"0 0 20px 20px",padding:32}}>
            <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,color:"var(--navy)",marginBottom:4}}>🤝 Cadastro de Colaborador</h2>
            <p style={{color:"var(--gray)",fontSize:14,marginBottom:24}}>Preencha seus dados para solicitar acesso como colaborador do Instituto</p>
            <div className="form-group">
              <label className="form-label">Nome Completo *</label>
              <input className="form-input" value={f.name} onChange={set("name")} placeholder="Seu nome completo" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">E-mail *</label>
                <input className="form-input" type="email" value={f.email} onChange={set("email")} placeholder="seu@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone / WhatsApp</label>
                <input className="form-input" value={f.phone} onChange={set("phone")} placeholder="(00) 00000-0000" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Função desejada</label>
              <select className="form-select" value={f.role} onChange={set("role")}>
                <option>Validador de QR</option>
                <option>Cadastrador de Famílias</option>
                <option>Apoio Geral</option>
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Senha *</label>
                <input className="form-input" type="password" value={f.password} onChange={set("password")} placeholder="Crie uma senha" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirmar Senha *</label>
                <input className="form-input" type="password" value={f.confirm} onChange={set("confirm")} placeholder="Repita a senha" />
              </div>
            </div>
            <div style={{background:"var(--sky)",borderRadius:10,padding:14,marginBottom:20,fontSize:13,color:"var(--navy)"}}>
              ℹ️ Após o envio, o administrador irá analisar sua solicitação. Você será notificado por e-mail quando aprovado.
            </div>
            <button className="btn btn-gold" style={{width:"100%",justifyContent:"center",padding:13}} onClick={handleSubmit}>Enviar Solicitação</button>
            <div style={{textAlign:"center",marginTop:16}}>
              <button className="nl" onClick={() => go("login")} style={{color:"var(--gray)",fontSize:13}}>← Voltar ao login</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── COLLABORATOR DASHBOARD ───────────────────────────────────────────────────
function CollaboratorDashboard({ user, go, logout, toast }) {
  const [events, setEvents] = useState([]);
  const [qrInput, setQrInput] = useState("");
  const [qrResult, setQrResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    DB.getEvents().then(evs => setEvents(evs));
    DB.getQrHistory().then(h => setHistory(h));
  }, []);

  const validateQR = async (code) => {
    setQrResult(null);
    if (!code.startsWith("IMB-")) { setQrResult({ ok:false, msg:"QR Code inválido" }); return; }
    const parts = code.split("-");
    if (parts.length < 4) { setQrResult({ ok:false, msg:"Formato inválido" }); return; }
    const eventId = parts[1].toLowerCase();
    const userId = parts[2];
    const allUsers = await DB.getUsers();
    const u = allUsers.find(u => u.id===userId);
    if (!u) { setQrResult({ ok:false, msg:"Usuário não encontrado" }); return; }
    if (u.qrCodes?.[eventId] !== code) { setQrResult({ ok:false, msg:"QR Code não corresponde" }); return; }
    if (u.usedQrCodes?.[eventId]) { setQrResult({ ok:false, msg:`Já utilizado em ${u.usedQrCodes[eventId]}`, user:u }); return; }
    const ev = events.find(e => e.id===eventId);
    setQrResult({ ok:true, user:u, event:ev, code, eventId });
  };

  const confirmDelivery = async () => {
    if (!qrResult?.ok) return;
    const ts = new Date().toLocaleString("pt-BR");
    const newUsedQr = { ...(qrResult.user.usedQrCodes||{}), [qrResult.eventId]: ts };
    await DB.updateUser(qrResult.user.id, { usedQrCodes: newUsedQr });
    const histEntry = { code:qrResult.code, userName:qrResult.user.name, eventLabel:qrResult.event?.label||qrResult.eventId, ts, validatedBy:user.name };
    await DB.saveQrHistory(histEntry);
    setHistory(prev => [...prev, histEntry]);
    toast(`✅ Entrega confirmada para ${qrResult.user.name}!`, "success");
    setQrResult(null); setQrInput("");
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:"environment" } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setScanning(true);
      if (!window.jsQR) {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js";
        s.onload = () => scanLoop();
        document.head.appendChild(s);
      } else { scanLoop(); }
    } catch { toast("Câmera não disponível","error"); }
  };

  const scanLoop = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const tick = () => {
      if (!videoRef.current || !streamRef.current) return;
      if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = window.jsQR?.(img.data, img.width, img.height);
        if (code) { stopCamera(); validateQR(code.data); return; }
      }
      requestAnimationFrame(tick);
    };
    tick();
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setScanning(false);
  };

  const myHistory = history.filter(h => h.validatedBy === user.name);

  return (
    <>
      <style>{CSS}</style>
      <div style={{minHeight:"100vh",background:"var(--bg)"}}>
        {/* Header */}
        <div style={{background:"linear-gradient(135deg,var(--navy),#1a5bb8)",padding:"24px 32px",color:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div>
            <IMBLogo variant="nav" />
            <div style={{marginTop:10,fontSize:18,fontWeight:800}}>Olá, {user.name?.split(" ")[0]}! 🤝</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.7)"}}>Colaborador · {user.role}</div>
          </div>
          <button className="btn btn-out btn-sm" onClick={logout}>Sair</button>
        </div>

        <div style={{maxWidth:900,margin:"0 auto",padding:"32px 20px"}}>
          {/* QR Scanner */}
          <div className="card" style={{padding:32,marginBottom:24}}>
            <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,color:"var(--navy)",marginBottom:4}}>🔲 Validar QR Code</h3>
            <p style={{color:"var(--gray)",fontSize:14,marginBottom:24}}>Escaneie ou digite o QR Code para confirmar a entrega</p>

            {/* Camera area */}
            <div className={`qr-scanner-area${scanning?" active":""}`} style={{marginBottom:20,position:"relative"}}>
              {scanning ? (
                <>
                  <video ref={videoRef} style={{width:"100%",maxHeight:300,borderRadius:10,objectFit:"cover"}} />
                  <button className="btn btn-red btn-sm" style={{marginTop:12}} onClick={stopCamera}>✕ Fechar câmera</button>
                </>
              ) : (
                <>
                  <div style={{fontSize:48,marginBottom:12}}>📷</div>
                  <p style={{color:"var(--gray)",marginBottom:16}}>Use a câmera para escanear automaticamente</p>
                  <button className="btn btn-blue" onClick={startCamera}>📷 Abrir Câmera</button>
                </>
              )}
            </div>

            {/* Manual input */}
            <div style={{display:"flex",gap:10}}>
              <input className="form-input" value={qrInput} onChange={e=>setQrInput(e.target.value)}
                placeholder="Digite o código IMB-..." style={{flex:1}}
                onKeyDown={e => e.key==="Enter" && validateQR(qrInput)} />
              <button className="btn btn-blue" onClick={() => validateQR(qrInput)}>Validar</button>
            </div>

            {/* Result */}
            {qrResult && (
              <div style={{marginTop:20,padding:20,borderRadius:12,background:qrResult.ok?"#dcfce7":"#fee2e2",border:`2px solid ${qrResult.ok?"#22c55e":"#ef4444"}`}}>
                {qrResult.ok ? (
                  <>
                    <div style={{fontSize:18,fontWeight:900,color:"#166534",marginBottom:8}}>✅ QR Code válido!</div>
                    <div style={{color:"#166534",fontSize:14,marginBottom:4}}><strong>Beneficiário:</strong> {qrResult.user?.name}</div>
                    <div style={{color:"#166534",fontSize:14,marginBottom:4}}><strong>Evento:</strong> {qrResult.event?.icon} {qrResult.event?.label}</div>
                    <div style={{color:"#166534",fontSize:14,marginBottom:16}}><strong>Crianças:</strong> {qrResult.user?.children||0}</div>
                    <button className="btn btn-green" style={{width:"100%",justifyContent:"center"}} onClick={confirmDelivery}>✅ Confirmar Entrega</button>
                  </>
                ) : (
                  <div style={{color:"#991b1b",fontWeight:800}}>❌ {qrResult.msg}</div>
                )}
              </div>
            )}
          </div>

          {/* My history */}
          <div className="card" style={{padding:32}}>
            <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,color:"var(--navy)",marginBottom:16}}>📋 Minhas Validações ({myHistory.length})</h3>
            {myHistory.length === 0 ? (
              <p style={{color:"var(--gray)",textAlign:"center",padding:32}}>Nenhuma validação registrada ainda</p>
            ) : (
              <table className="tbl">
                <thead><tr><th>Beneficiário</th><th>Evento</th><th>Data/Hora</th></tr></thead>
                <tbody>
                  {[...myHistory].reverse().map((h,i) => (
                    <tr key={i}>
                      <td style={{fontWeight:700}}>{h.userName}</td>
                      <td>{h.eventLabel}</td>
                      <td style={{color:"var(--gray)",fontSize:13}}>{h.ts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── ADMIN ───────────────────────────────────────────────────────────────────
function Admin({ go, logout, toast }) {
  const [tab, setTab] = useState("cadastros");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [donations, setDonations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [newDonation, setNewDonation] = useState({ donor:"", amount:"", method:"PIX", date:"", note:"" });
  const [newAnnouncement, setNewAnnouncement] = useState({ title:"", body:"", priority:"normal", expiresAt:"" });
  const [eventPhotos, setEventPhotos] = useState({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selUser, setSelUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [qrInput, setQrInput] = useState("");
  const [qrResult, setQrResult] = useState(null);
  const [qrHistory, setQrHistory] = useState([]);
  const [newEvent, setNewEvent] = useState({ label:"", icon:"🎁", date:"", color:"#e8a020" });
  const [editingEvent, setEditingEvent] = useState(null);
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const streamRef = useRef(null);
  const [donGoal, setDonGoal] = useState({ current: 3200, target: 5000, label: "Meta de Natal 2025", currency: "R$" });
  const saveDonGoal = async g => { setDonGoal(g); await DB.saveDonGoal(g); };

  const defaultEvents = [
    {id:"natal",label:"Natal 2025",icon:"🎄",date:"2025-12-25",color:"#e8a020"},
    {id:"pascoa",label:"Páscoa 2026",icon:"🐣",date:"2026-04-05",color:"#e8a020"},
    {id:"crianca",label:"Dia das Crianças",icon:"🎁",date:"2025-10-12",color:"#e8a020"},
    {id:"maes",label:"Dia das Mães",icon:"💐",date:"2025-05-11",color:"#e8a020"},
  ];

  useEffect(() => {
    const loadData = async () => {
      const [us, evs, vols, hist, goal] = await Promise.all([
        DB.getUsers(), DB.getEvents(), DB.getVolunteers(), DB.getQrHistory(), DB.getDonGoal()
      ]);
      setUsers(us);
      if (evs.length > 0) setEvents(evs);
      else { setEvents(defaultEvents); for(const e of defaultEvents) await DB.saveEvent(e); }
      setVolunteers(vols);
      setQrHistory(hist);
      setDonGoal(goal);
      const cols = await DB.getCollaborators();
      setCollaborators(cols);
      const dons = await DB.getDonations();
      setDonations(dons);
      const anns = await DB.getAnnouncements();
      setAnnouncements(anns);
      // Load photos for all events
      if (evs.length > 0) {
        const photos = {};
        for (const ev of evs) {
          photos[ev.id] = await DB.getEventPhotos(ev.id);
        }
        setEventPhotos(photos);
      }
    };
    loadData();
    // Real-time listener for users
    const unsub = DB.onUsers(us => setUsers(us));
    return () => unsub();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // saveEvents kept for event CRUD operations
  const saveEvents = async e => { setEvents(e); for(const ev of e) await DB.saveEvent(ev); };

  const approveUser = async (id) => {
    await DB.updateUser(id, { status:"approved" });
    setUsers(prev => prev.map(u => u.id===id ? {...u, status:"approved"} : u));
    const u = users.find(u => u.id===id);
    toast(`✅ ${u?.name} aprovado!`, "success");
    const siteUrl = "https://instituto-marilda-brandao-zfm5.vercel.app";
    // Email notification
    if (u?.email) {
      await DB.sendEmail(u.email, "Cadastro Aprovado - Instituto Marilda Brandão",
        `Olá ${u.name?.split(" ")[0]}! Seu cadastro foi aprovado. Acesse ${siteUrl} para entrar na sua área.`);
    }
    // WhatsApp notification
    if (u?.phone) {
      const phone = u.phone.replace(/\D/g,"");
      const msg = encodeURIComponent(`Olá ${u.name?.split(" ")[0]}! 🎉 Seu cadastro no Instituto Marilda Brandão foi *aprovado*! Acesse: ${siteUrl}`);
      window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
    }
  };
  const exportCSV = (data, filename) => {
    if (!data.length) { toast("Nenhum dado para exportar","error"); return; }
    const keys = Object.keys(data[0]).filter(k => !["password","id"].includes(k));
    const csv = [keys.join(";"), ...data.map(row => keys.map(k => `"${String(row[k]||"").replace(/"/g,'""')}"`).join(";"))].join("\n");
    const blob = new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=filename; a.click();
    URL.revokeObjectURL(url);
    toast("✅ CSV exportado!","success");
  };

  const rejectUser = async (id) => {
    await DB.updateUser(id, { status:"rejected" });
    setUsers(prev => prev.map(u => u.id===id ? {...u, status:"rejected"} : u));
    toast("Cadastro rejeitado","error");
  };

  const assignQR = async (userId, eventId) => {
    const u = users.find(u => u.id===userId);
    if (!u) return;
    const token = Date.now().toString(36).toUpperCase();
    const qrVal = `IMB-${eventId.toUpperCase()}-${userId}-${token}`;
    const newQrCodes = { ...(u.qrCodes||{}), [eventId]: qrVal };
    await DB.updateUser(userId, { qrCodes: newQrCodes });
    setUsers(prev => prev.map(user => user.id===userId ? { ...user, qrCodes: newQrCodes } : user));
    toast(`QR Code gerado para ${u.name}`, "success");
  };

  const validateQR = async (code) => {
    if (!code.startsWith("IMB-")) { setQrResult({ ok:false, msg:"QR Code inválido" }); return; }
    const parts = code.split("-");
    if (parts.length < 4) { setQrResult({ ok:false, msg:"Formato inválido" }); return; }
    const eventId = parts[1].toLowerCase();
    const userId = parts[2];
    const allUsers = await DB.getUsers();
    const u = allUsers.find(u => u.id===userId);
    if (!u) { setQrResult({ ok:false, msg:"Usuário não encontrado" }); return; }
    if (u.qrCodes?.[eventId] !== code) { setQrResult({ ok:false, msg:"QR Code não corresponde" }); return; }
    if (u.usedQrCodes?.[eventId]) { setQrResult({ ok:false, msg:`Já utilizado em ${u.usedQrCodes[eventId]}`, user:u }); return; }
    const ev = events.find(e => e.id===eventId);
    setQrResult({ ok:true, user:u, event:ev, code, eventId });
  };

  const confirmDelivery = async () => {
    if (!qrResult?.ok) return;
    const ts = new Date().toLocaleString("pt-BR");
    const newUsedQr = { ...(qrResult.user.usedQrCodes||{}), [qrResult.eventId]: ts };
    await DB.updateUser(qrResult.user.id, { usedQrCodes: newUsedQr });
    setUsers(prev => prev.map(u => u.id===qrResult.user.id ? { ...u, usedQrCodes: newUsedQr } : u));
    const histEntry = { code:qrResult.code, userName:qrResult.user.name, eventLabel:qrResult.event?.label||qrResult.eventId, ts };
    await DB.saveQrHistory(histEntry);
    setQrHistory(prev => [...prev, histEntry]);
    toast(`✅ Entrega confirmada para ${qrResult.user.name}!`, "success");
    setQrResult(null); setQrInput("");
  };

  // Camera QR scanning
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode:"environment" } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setScanning(true);
      // Load jsQR dynamically
      if (!window.jsQR) {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js";
        script.onload = () => startScanLoop();
        document.head.appendChild(script);
      } else { startScanLoop(); }
    } catch { toast("Câmera não disponível. Use o campo de texto.", "error"); }
  };
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setScanning(false);
  };
  const startScanLoop = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const loop = () => {
      if (!videoRef.current || !scanning) return;
      if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = window.jsQR && window.jsQR(d.data, d.width, d.height);
        if (code?.data) { validateQR(code.data); stopCamera(); return; }
      }
      requestAnimationFrame(loop);
    };
    loop();
  };

  // PDF Report
  const printReport = (eventId) => {
    const ev = events.find(e => e.id===eventId);
    const recipients = users.filter(u => u.usedQrCodes?.[eventId]);
    const pending = users.filter(u => u.qrCodes?.[eventId] && !u.usedQrCodes?.[eventId]);
    const win = window.open("","_blank");
    win.document.write(`
      <html><head><title>Relatório - ${ev?.label}</title>
      <style>body{font-family:Arial,sans-serif;padding:24px;color:#1e293b}
        h1{color:#0a2d6e}table{width:100%;border-collapse:collapse;margin-top:16px}
        th{background:#0a2d6e;color:#fff;padding:8px 12px;text-align:left}
        td{padding:8px 12px;border-bottom:1px solid #e2e8f0}
        .badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:12px;font-weight:bold}
        .ok{background:#dcfce7;color:#166534}.pend{background:#fef9c3;color:#854d0e}
        @media print{button{display:none}}</style></head>
      <body>
        <h1>${ev?.icon} Relatório: ${ev?.label}</h1>
        <p>Data do evento: ${ev ? new Date(ev.date).toLocaleDateString("pt-BR") : "-"} | Gerado em: ${new Date().toLocaleString("pt-BR")}</p>
        <p><strong>Total com QR:</strong> ${recipients.length + pending.length} | <strong>Retirados:</strong> ${recipients.length} | <strong>Pendentes:</strong> ${pending.length}</p>
        <button onclick="window.print()" style="padding:8px 16px;background:#0a2d6e;color:#fff;border:none;border-radius:6px;cursor:pointer;margin:12px 0">🖨️ Imprimir / Salvar PDF</button>
        <h2>✅ Confirmados (${recipients.length})</h2>
        <table><thead><tr><th>Nome</th><th>Cidade</th><th>Crianças</th><th>Data/Hora</th></tr></thead><tbody>
          ${recipients.map(u=>`<tr><td>${u.name}</td><td>${u.city||"-"}</td><td>${u.children||0}</td><td class="badge ok">${u.usedQrCodes[eventId]}</td></tr>`).join("")}
        </tbody></table>
        <h2>⏳ Pendentes (${pending.length})</h2>
        <table><thead><tr><th>Nome</th><th>Telefone</th><th>Cidade</th></tr></thead><tbody>
          ${pending.map(u=>`<tr><td>${u.name}</td><td>${u.phone||"-"}</td><td>${u.city||"-"}</td></tr>`).join("")}
        </tbody></table>
      </body></html>
    `);
    win.document.close();
  };

  const filtered = users.filter(u => {
    const matchStatus = filterStatus==="all" || u.status===filterStatus;
    const matchSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = { total:users.length, pending:users.filter(u=>u.status==="pending").length, approved:users.filter(u=>u.status==="approved").length, rejected:users.filter(u=>u.status==="rejected").length };

  const tabs = [["cadastros","👥 Cadastros"],["validar","🔲 Validar QR"],["distribuir","📤 Distribuir QR"],["eventos","🎁 Eventos"],["colaboradores","🤝 Colaboradores"],["doacoes","💰 Doações"],["avisos","📢 Avisos"],["voluntarios","💚 Voluntários"],["stats","📊 Estatísticas"]];

  return (
    <>
      <style>{CSS}</style>
      {/* Mobile topbar */}
      <div className="admin-topbar" style={{display:"none",position:"fixed",top:0,left:0,right:0,height:56,background:"var(--navy)",zIndex:150,alignItems:"center",padding:"0 16px",gap:12,boxShadow:"0 2px 12px rgba(0,0,0,.3)"}}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{background:"none",display:"flex",flexDirection:"column",gap:5,padding:4}}>
          <span style={{display:"block",width:22,height:2,background:"#fff",borderRadius:2}}/>
          <span style={{display:"block",width:22,height:2,background:"#fff",borderRadius:2}}/>
          <span style={{display:"block",width:22,height:2,background:"#fff",borderRadius:2}}/>
        </button>
        <IMBLogo variant="nav" />
      </div>
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:190}} />}
      <div className={`sidebar${sidebarOpen?" open":""}`}>
        <div style={{padding:"20px 20px 12px"}}><IMBLogo variant="nav" /></div>
        <div style={{padding:"8px 0"}}>
          {tabs.map(([id, label]) => (
            <div key={id} className={`sidebar-link${tab===id?" active":""}`} onClick={() => { setTab(id); setSidebarOpen(false); }}>{label}</div>
          ))}
        </div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:16,borderTop:"1px solid rgba(255,255,255,.1)"}}>
          <button className="btn btn-out btn-sm" style={{width:"100%",justifyContent:"center",marginBottom:8}} onClick={() => go("home")}>🏠 Ver Site</button>
          <button className="btn btn-red btn-sm" style={{width:"100%",justifyContent:"center"}} onClick={logout}>Sair</button>
        </div>
      </div>

      <div className="admin-content" style={{paddingTop:"env(safe-area-inset-top)"}}>
        <style>{`@media(max-width:900px){.admin-content{padding-top:72px!important}}`}</style>
        {/* ── CADASTROS ── */}
        {tab==="cadastros" && (
          <div className="fade-in">
            <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,color:"#0a2d6e",marginBottom:4}}>👥 Cadastros</h1>
            <div className="grid-4" style={{marginBottom:20}}>
              {[["Total",stats.total,"#3b82f6"],["Pendentes",stats.pending,"#f59e0b"],["Aprovados",stats.approved,"#22c55e"],["Rejeitados",stats.rejected,"#ef4444"]].map(([l,v,c]) => (
                <div key={l} className="card" style={{padding:16,borderLeft:`4px solid ${c}`}}>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,color:"#0a2d6e"}}>{v}</div>
                  <div style={{fontSize:12,color:"#64748b",fontWeight:700}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
              <input className="form-input" style={{maxWidth:280}} placeholder="🔍 Buscar por nome ou email..." value={search} onChange={e=>setSearch(e.target.value)} />
              <select className="form-select" style={{width:"auto"}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
                <option value="all">Todos</option><option value="pending">Pendentes</option><option value="approved">Aprovados</option><option value="rejected">Rejeitados</option>
              </select>
              <button className="btn btn-blue btn-sm" onClick={() => exportCSV(filtered.map(({password,...u})=>u), "cadastros.csv")}>📤 Exportar CSV</button>
            </div>
            <div className="card" style={{overflow:"hidden"}}>
              <table className="tbl">
                <thead><tr><th>Nome</th><th>E-mail</th><th>Cidade</th><th>Crianças</th><th>Cadastro</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                  {filtered.length===0 ? (
                    <tr><td colSpan={7} style={{textAlign:"center",padding:32,color:"#94a3b8"}}>Nenhum cadastro encontrado</td></tr>
                  ) : filtered.map(u => (
                    <tr key={u.id}>
                      <td style={{fontWeight:700}}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.city||"-"}</td>
                      <td style={{textAlign:"center"}}>{u.children||0}</td>
                      <td style={{fontSize:12,color:"#94a3b8"}}>{u.createdAt}</td>
                      <td>
                        <span className={`badge badge-${u.status==="approved"?"green":u.status==="rejected"?"red":"yellow"}`}>
                          {u.status==="approved"?"Aprovado":u.status==="rejected"?"Rejeitado":"Pendente"}
                        </span>
                      </td>
                      <td>
                        <div style={{display:"flex",gap:6}}>
                          <button className="btn btn-blue btn-sm" style={{padding:"4px 10px",fontSize:12}} onClick={() => setSelUser(u)}>Ver</button>
                          {u.status==="pending" && <>
                            <button className="btn btn-green btn-sm" style={{padding:"4px 10px",fontSize:12}} onClick={() => approveUser(u.id)}>✓</button>
                            <button className="btn btn-red btn-sm" style={{padding:"4px 10px",fontSize:12}} onClick={() => rejectUser(u.id)}>✗</button>
                          </>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── VALIDAR QR ── */}
        {tab==="validar" && (
          <div className="fade-in">
            <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,color:"#0a2d6e",marginBottom:4}}>🔲 Validar QR Code</h1>
            <p style={{color:"#64748b",marginBottom:24}}>Leia o QR Code do beneficiário para confirmar a entrega</p>
            <div className="grid-2" style={{gap:24,alignItems:"start"}}>
              <div>
                {/* Camera */}
                <div className={`qr-scanner-area${scanning?" active":""}`} style={{marginBottom:16}}>
                  {scanning ? (
                    <>
                      <video ref={videoRef} style={{width:"100%",borderRadius:8}} autoPlay muted playsInline />
                      <button className="btn btn-red btn-sm" style={{marginTop:8,width:"100%",justifyContent:"center"}} onClick={stopCamera}>⏹ Parar Câmera</button>
                    </>
                  ) : (
                    <>
                      <div style={{fontSize:48,marginBottom:12}}>📷</div>
                      <p style={{color:"#64748b",marginBottom:12,fontSize:14}}>Leia o QR Code com a câmera do celular</p>
                      <button className="btn btn-blue" style={{justifyContent:"center"}} onClick={startCamera}>📷 Abrir Câmera</button>
                    </>
                  )}
                </div>
                <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
                  <div style={{flex:1,height:1,background:"#e2e8f0"}}/>
                  <span style={{fontSize:12,color:"#94a3b8"}}>OU DIGITAR</span>
                  <div style={{flex:1,height:1,background:"#e2e8f0"}}/>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <input className="form-input" style={{flex:1}} value={qrInput} onChange={e=>setQrInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&validateQR(qrInput)} placeholder="IMB-NATAL-U12345-TOKEN" />
                  <button className="btn btn-blue" onClick={() => validateQR(qrInput)}>Validar</button>
                </div>
                {qrResult && (
                  <div className="card" style={{padding:20,marginTop:16,border:`3px solid ${qrResult.ok?"#22c55e":"#ef4444"}`}}>
                    {qrResult.ok ? (
                      <>
                        <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
                          <span style={{fontSize:32}}>✅</span>
                          <div>
                            <div style={{fontWeight:800,fontSize:16,color:"#0a2d6e"}}>{qrResult.user.name}</div>
                            <div style={{fontSize:13,color:"#64748b"}}>{qrResult.event?.icon} {qrResult.event?.label}</div>
                          </div>
                        </div>
                        <div style={{marginBottom:12,fontSize:13,color:"#475569"}}>
                          <strong>Crianças:</strong> {qrResult.user.children} | <strong>Cidade:</strong> {qrResult.user.city||"-"}
                        </div>
                        <button className="btn btn-green" style={{width:"100%",justifyContent:"center"}} onClick={confirmDelivery}>✅ Confirmar Entrega</button>
                      </>
                    ) : (
                      <div style={{display:"flex",gap:12,alignItems:"center"}}>
                        <span style={{fontSize:32}}>❌</span>
                        <div>
                          <div style={{fontWeight:800,color:"#ef4444"}}>QR Inválido</div>
                          <div style={{fontSize:13,color:"#64748b"}}>{qrResult.msg}</div>
                          {qrResult.user && <div style={{fontSize:13,marginTop:4}}>Beneficiário: {qrResult.user.name}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <h3 style={{fontWeight:800,color:"#0a2d6e",marginBottom:12}}>📋 Histórico de Validações</h3>
                <div className="card" style={{overflow:"hidden"}}>
                  {qrHistory.length===0 ? (
                    <div style={{padding:24,textAlign:"center",color:"#94a3b8"}}>Nenhuma validação ainda</div>
                  ) : (
                    <table className="tbl">
                      <thead><tr><th>Beneficiário</th><th>Evento</th><th>Data/Hora</th></tr></thead>
                      <tbody>
                        {[...qrHistory].reverse().slice(0,20).map((h, i) => (
                          <tr key={i}>
                            <td style={{fontWeight:700}}>{h.userName}</td>
                            <td>{h.eventLabel}</td>
                            <td style={{fontSize:12,color:"#94a3b8"}}>{h.ts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DISTRIBUIR QR ── */}
        {tab==="distribuir" && (
          <div className="fade-in">
            <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,color:"#0a2d6e",marginBottom:4}}>📤 Distribuir QR Codes</h1>
            <p style={{color:"#64748b",marginBottom:24}}>Atribua QR Codes aos beneficiários aprovados</p>
            {events.map(ev => {
              const eligible = users.filter(u => u.status==="approved");
              const assigned = eligible.filter(u => u.qrCodes?.[ev.id]);
              return (
                <div key={ev.id} className="card" style={{padding:20,marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div>
                      <span style={{fontSize:24,marginRight:8}}>{ev.icon}</span>
                      <span style={{fontWeight:800,fontSize:18,color:"#0a2d6e"}}>{ev.label}</span>
                      <span style={{fontSize:13,color:"#64748b",marginLeft:8}}>{new Date(ev.date).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontSize:13,color:"#64748b"}}>{assigned.length}/{eligible.length} atribuídos</span>
                      <button className="btn btn-blue btn-sm" onClick={async () => {
                        for (const u of eligible) { if (!u.qrCodes?.[ev.id]) await assignQR(u.id, ev.id); }
                        toast(`QR Codes gerados para todos os aprovados de ${ev.label}!`, "success");
                      }}>⚡ Gerar para Todos</button>
                    </div>
                  </div>
                  <table className="tbl">
                    <thead><tr><th>Nome</th><th>Crianças</th><th>QR Code</th><th>Status</th><th>Ação</th></tr></thead>
                    <tbody>
                      {eligible.length===0 ? (
                        <tr><td colSpan={5} style={{textAlign:"center",padding:20,color:"#94a3b8"}}>Nenhum cadastro aprovado</td></tr>
                      ) : eligible.map(u => {
                        const hasQr = !!u.qrCodes?.[ev.id];
                        const used = !!u.usedQrCodes?.[ev.id];
                        return (
                          <tr key={u.id}>
                            <td style={{fontWeight:700}}>{u.name}</td>
                            <td style={{textAlign:"center"}}>{u.children||0}</td>
                            <td style={{fontSize:11,color:"#94a3b8",fontFamily:"monospace"}}>{u.qrCodes?.[ev.id]?.slice(0,24)+"..." || "-"}</td>
                            <td><span className={`badge badge-${used?"green":hasQr?"blue":"gray"}`}>{used?"Utilizado":hasQr?"Atribuído":"Sem QR"}</span></td>
                            <td>
                              {!hasQr && <button className="btn btn-gold btn-sm" style={{padding:"4px 10px",fontSize:12}} onClick={() => assignQR(u.id, ev.id)}>Gerar QR</button>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}

        {/* ── EVENTOS ── */}
        {tab==="eventos" && (
          <div className="fade-in">
            <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,color:"#0a2d6e",marginBottom:24}}>🎁 Gerenciar Eventos</h1>
            <div className="grid-2" style={{gap:24,alignItems:"start"}}>
              <div className="card" style={{padding:24}}>
                <h3 style={{fontWeight:800,color:"#0a2d6e",marginBottom:16}}>{editingEvent ? "✏️ Editar Evento" : "➕ Novo Evento"}</h3>
                {[["label","Nome do Evento"],["icon","Ícone (emoji)"],["date","Data","date"],["color","Cor","color"]].map(([k,l,t="text"]) => (
                  <div key={k} className="form-group">
                    <label className="form-label">{l}</label>
                    <input className="form-input" type={t} value={(editingEvent||newEvent)[k]} onChange={e => {
                      if (editingEvent) setEditingEvent({...editingEvent,[k]:e.target.value});
                      else setNewEvent({...newEvent,[k]:e.target.value});
                    }} />
                  </div>
                ))}
                <div style={{display:"flex",gap:8}}>
                  <button className="btn btn-gold" onClick={() => {
                    if (editingEvent) {
                      saveEvents(events.map(e => e.id===editingEvent.id ? editingEvent : e));
                      setEditingEvent(null); toast("Evento atualizado","success");
                    } else {
                      if (!newEvent.label || !newEvent.date) { toast("Preencha nome e data","error"); return; }
                      const id = newEvent.label.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,12)+Date.now();
                      saveEvents([...events, {...newEvent, id}]);
                      setNewEvent({label:"",icon:"🎁",date:"",color:"#e8a020"});
                      toast("Evento criado!","success");
                    }
                  }}>{editingEvent ? "Salvar" : "Criar Evento"}</button>
                  {editingEvent && <button className="btn" style={{background:"#f1f5f9",color:"#64748b"}} onClick={() => setEditingEvent(null)}>Cancelar</button>}
                </div>
              </div>
              <div>
                <h3 style={{fontWeight:800,color:"#0a2d6e",marginBottom:12}}>Eventos cadastrados</h3>
                {events.map(ev => {
                  const total = users.filter(u => u.qrCodes?.[ev.id]).length;
                  const used = users.filter(u => u.usedQrCodes?.[ev.id]).length;
                  return (
                    <div key={ev.id} className="card" style={{padding:16,marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div>
                          <span style={{fontSize:24,marginRight:8}}>{ev.icon}</span>
                          <span style={{fontWeight:800,color:"#0a2d6e"}}>{ev.label}</span>
                          <span style={{fontSize:12,color:"#64748b",marginLeft:8}}>{new Date(ev.date).toLocaleDateString("pt-BR")}</span>
                        </div>
                        <div style={{display:"flex",gap:6}}>
                          <button className="btn btn-blue btn-sm" style={{padding:"4px 10px",fontSize:12}} onClick={() => { printReport(ev.id); }}>📊 PDF</button>
                          <button className="btn btn-sm" style={{background:"#f1f5f9",color:"#64748b",padding:"4px 10px",fontSize:12}} onClick={() => setEditingEvent(ev)}>✏️</button>
                          <button className="btn btn-red btn-sm" style={{padding:"4px 10px",fontSize:12}} onClick={() => { saveEvents(events.filter(e=>e.id!==ev.id)); toast("Evento removido","error"); }}>🗑</button>
                        </div>
                      </div>
                      <div style={{fontSize:12,color:"#64748b",marginBottom:6}}>{used}/{total} retiradas realizadas</div>
                      <div style={{background:"#f1f5f9",borderRadius:8,height:8}}>
                        <div style={{background:"var(--gold)",height:8,borderRadius:8,width:`${total>0?Math.round(used/total*100):0}%`,transition:".3s"}} />
                      </div>
                      {/* Photo upload per event */}
                      <div style={{marginTop:12,borderTop:"1px solid #f1f5f9",paddingTop:10}}>
                        <div style={{fontSize:12,fontWeight:700,color:"#64748b",marginBottom:6}}>📸 Fotos do evento</div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                          {(eventPhotos[ev.id]||[]).map((p,i) => (
                            <img key={i} src={p.url} alt="evento" style={{width:60,height:60,objectFit:"cover",borderRadius:8,border:"2px solid var(--gold3)"}} />
                          ))}
                        </div>
                        <label style={{cursor:"pointer"}}>
                          <span className="btn btn-sm" style={{background:"#f1f5f9",color:"#64748b",fontSize:11,padding:"4px 10px"}}>
                            {uploadingPhoto?"Enviando...":"📸 Adicionar foto"}
                          </span>
                          <input type="file" accept="image/*" style={{display:"none"}} onChange={async e => {
                            const file = e.target.files[0];
                            if (!file) return;
                            setUploadingPhoto(true);
                            try {
                              const url = await DB.uploadEventPhoto(ev.id, file);
                              const photoEntry = { url, uploadedAt: new Date().toLocaleString("pt-BR") };
                              await DB.saveEventPhoto(ev.id, photoEntry);
                              setEventPhotos(prev => ({ ...prev, [ev.id]: [...(prev[ev.id]||[]), photoEntry] }));
                              toast("📸 Foto adicionada!", "success");
                            } catch { toast("Erro ao enviar foto","error"); }
                            setUploadingPhoto(false);
                          }} />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── COLABORADORES ── */}
        {tab==="colaboradores" && (
          <div className="fade-in">
            <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,color:"#0a2d6e",marginBottom:4}}>🤝 Colaboradores</h1>
            <p style={{color:"#64748b",marginBottom:20}}>{collaborators.length} colaborador(es) cadastrado(s)</p>
            <div className="card" style={{overflow:"hidden"}}>
              <table className="tbl">
                <thead><tr><th>Nome</th><th>E-mail</th><th>Função</th><th>Data</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                  {collaborators.length===0 ? (
                    <tr><td colSpan={6} style={{textAlign:"center",padding:32,color:"#94a3b8"}}>Nenhum colaborador cadastrado</td></tr>
                  ) : collaborators.map(c => (
                    <tr key={c.id}>
                      <td style={{fontWeight:700}}>{c.name}</td>
                      <td style={{fontSize:13,color:"#64748b"}}>{c.email}</td>
                      <td><span className="badge badge-blue">{c.role}</span></td>
                      <td style={{fontSize:12,color:"#94a3b8"}}>{c.createdAt}</td>
                      <td>
                        <span className={`badge badge-${c.status==="approved"?"green":c.status==="rejected"?"red":"yellow"}`}>
                          {c.status==="approved"?"Aprovado":c.status==="rejected"?"Rejeitado":"Pendente"}
                        </span>
                      </td>
                      <td>
                        <div style={{display:"flex",gap:6}}>
                          {c.status!=="approved" && (
                            <button className="btn btn-green btn-sm" style={{padding:"4px 10px",fontSize:12}} onClick={async () => {
                              await DB.updateCollaborator(c.id, { status:"approved" });
                              setCollaborators(prev => prev.map(x => x.id===c.id ? {...x,status:"approved"} : x));
                              toast(`✅ ${c.name} aprovado!`, "success");
                              const siteUrl = "https://instituto-marilda-brandao-zfm5.vercel.app";
                              if (c.email) await DB.sendEmail(c.email, "Acesso Aprovado - Instituto Marilda Brandão",
                                `Olá ${c.name?.split(" ")[0]}! Seu acesso como colaborador foi aprovado. Acesse ${siteUrl} e faça login na aba Colaborador.`);
                              if (c.phone) {
                                const phone = c.phone.replace(/\D/g,"");
                                const msg = encodeURIComponent(`Olá ${c.name?.split(" ")[0]}! 🎉 Seu cadastro como colaborador no Instituto Marilda Brandão foi *aprovado*! Acesse: ${siteUrl}`);
                                window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
                              }
                            }}>✓ Aprovar</button>
                          )}
                          {c.status!=="rejected" && (
                            <button className="btn btn-red btn-sm" style={{padding:"4px 10px",fontSize:12}} onClick={async () => {
                              await DB.updateCollaborator(c.id, { status:"rejected" });
                              setCollaborators(prev => prev.map(x => x.id===c.id ? {...x,status:"rejected"} : x));
                              toast("Colaborador rejeitado","error");
                            }}>✕ Rejeitar</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── DOAÇÕES ── */}
        {tab==="doacoes" && (
          <div className="fade-in">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,marginBottom:20}}>
              <div>
                <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,color:"#0a2d6e",marginBottom:4}}>💰 Controle de Doações</h1>
                <p style={{color:"#64748b"}}>{donations.length} doação(ões) registrada(s)</p>
              </div>
              <button className="btn btn-blue btn-sm" onClick={() => exportCSV(donations,"doacoes.csv")}>📤 Exportar CSV</button>
            </div>
            {/* Summary cards */}
            {(() => {
              const total = donations.reduce((s,d) => s+parseFloat(d.amount||0),0);
              const byMethod = donations.reduce((a,d) => { a[d.method]=(a[d.method]||0)+parseFloat(d.amount||0); return a; },{});
              return (
                <div className="grid-4" style={{marginBottom:24}}>
                  <div className="card" style={{padding:16,borderLeft:"4px solid #22c55e"}}>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:900,color:"#0a2d6e"}}>R$ {total.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
                    <div style={{fontSize:12,color:"#64748b",fontWeight:700}}>Total Arrecadado</div>
                  </div>
                  {Object.entries(byMethod).map(([m,v]) => (
                    <div key={m} className="card" style={{padding:16,borderLeft:"4px solid #3b82f6"}}>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:900,color:"#0a2d6e"}}>R$ {v.toLocaleString("pt-BR",{minimumFractionDigits:2})}</div>
                      <div style={{fontSize:12,color:"#64748b",fontWeight:700}}>{m}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
            {/* Add donation form */}
            <div className="card" style={{padding:24,marginBottom:20,borderLeft:"4px solid #f5c842"}}>
              <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,color:"#0a2d6e",marginBottom:16}}>+ Registrar Doação</h3>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Doador (ou "Anônimo")</label>
                  <input className="form-input" value={newDonation.donor} onChange={e=>setNewDonation({...newDonation,donor:e.target.value})} placeholder="Nome do doador" /></div>
                <div className="form-group"><label className="form-label">Valor (R$)</label>
                  <input className="form-input" type="number" value={newDonation.amount} onChange={e=>setNewDonation({...newDonation,amount:e.target.value})} placeholder="0,00" /></div>
                <div className="form-group"><label className="form-label">Método</label>
                  <select className="form-select" value={newDonation.method} onChange={e=>setNewDonation({...newDonation,method:e.target.value})}>
                    <option>PIX</option><option>Dinheiro</option><option>Transferência</option><option>Boleto</option><option>Cartão</option><option>Outro</option>
                  </select></div>
                <div className="form-group"><label className="form-label">Data</label>
                  <input className="form-input" type="date" value={newDonation.date} onChange={e=>setNewDonation({...newDonation,date:e.target.value})} /></div>
                <div className="form-group" style={{gridColumn:"1/-1"}}><label className="form-label">Observação</label>
                  <input className="form-input" value={newDonation.note} onChange={e=>setNewDonation({...newDonation,note:e.target.value})} placeholder="Opcional..." /></div>
              </div>
              <button className="btn btn-gold" onClick={async () => {
                if (!newDonation.donor||!newDonation.amount) { toast("Preencha doador e valor","error"); return; }
                const entry = { ...newDonation, id:`D${Date.now()}`, registeredAt:new Date().toLocaleString("pt-BR") };
                await DB.saveDonation(entry);
                setDonations(prev => [...prev, entry]);
                setNewDonation({ donor:"",amount:"",method:"PIX",date:"",note:"" });
                toast("✅ Doação registrada!","success");
              }}>💾 Salvar Doação</button>
            </div>
            {/* Donations table */}
            <div className="card" style={{overflow:"hidden"}}>
              <table className="tbl">
                <thead><tr><th>Doador</th><th>Valor</th><th>Método</th><th>Data</th><th>Observação</th><th>Ação</th></tr></thead>
                <tbody>
                  {donations.length===0 ? (
                    <tr><td colSpan={6} style={{textAlign:"center",padding:32,color:"#94a3b8"}}>Nenhuma doação registrada</td></tr>
                  ) : [...donations].reverse().map(d => (
                    <tr key={d.id}>
                      <td style={{fontWeight:700}}>{d.donor}</td>
                      <td style={{color:"#22c55e",fontWeight:800}}>R$ {parseFloat(d.amount).toLocaleString("pt-BR",{minimumFractionDigits:2})}</td>
                      <td><span className="badge badge-blue">{d.method}</span></td>
                      <td style={{fontSize:13,color:"#64748b"}}>{d.date ? new Date(d.date).toLocaleDateString("pt-BR") : "-"}</td>
                      <td style={{fontSize:13,color:"#64748b"}}>{d.note||"-"}</td>
                      <td><button className="btn btn-red btn-sm" style={{padding:"3px 8px",fontSize:11}} onClick={async () => {
                        await DB.deleteDonation(d.id);
                        setDonations(prev => prev.filter(x=>x.id!==d.id));
                        toast("Doação removida","error");
                      }}>🗑</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── AVISOS ── */}
        {tab==="avisos" && (
          <div className="fade-in">
            <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,color:"#0a2d6e",marginBottom:4}}>📢 Mural de Avisos</h1>
            <p style={{color:"#64748b",marginBottom:20}}>Os avisos aparecem para as famílias na área de acesso delas</p>
            {/* Add announcement form */}
            <div className="card" style={{padding:24,marginBottom:20,borderLeft:"4px solid #f5c842"}}>
              <h3 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,color:"#0a2d6e",marginBottom:16}}>+ Novo Aviso</h3>
              <div className="form-group"><label className="form-label">Título *</label>
                <input className="form-input" value={newAnnouncement.title} onChange={e=>setNewAnnouncement({...newAnnouncement,title:e.target.value})} placeholder="Ex: Distribuição de cestas em 15/01" /></div>
              <div className="form-group"><label className="form-label">Mensagem *</label>
                <textarea className="form-input" rows={3} value={newAnnouncement.body} onChange={e=>setNewAnnouncement({...newAnnouncement,body:e.target.value})} placeholder="Detalhes do aviso..." style={{resize:"vertical"}} /></div>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Prioridade</label>
                  <select className="form-select" value={newAnnouncement.priority} onChange={e=>setNewAnnouncement({...newAnnouncement,priority:e.target.value})}>
                    <option value="normal">Normal</option><option value="importante">⚠️ Importante</option><option value="urgente">🚨 Urgente</option>
                  </select></div>
                <div className="form-group"><label className="form-label">Expira em (opcional)</label>
                  <input className="form-input" type="date" value={newAnnouncement.expiresAt} onChange={e=>setNewAnnouncement({...newAnnouncement,expiresAt:e.target.value})} /></div>
              </div>
              <button className="btn btn-gold" onClick={async () => {
                if (!newAnnouncement.title||!newAnnouncement.body) { toast("Preencha título e mensagem","error"); return; }
                const entry = { ...newAnnouncement, id:`A${Date.now()}`, createdAt:new Date().toLocaleString("pt-BR") };
                await DB.saveAnnouncement(entry);
                setAnnouncements(prev => [...prev, entry]);
                setNewAnnouncement({ title:"",body:"",priority:"normal",expiresAt:"" });
                toast("✅ Aviso publicado!","success");
              }}>📢 Publicar Aviso</button>
            </div>
            {/* List */}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {announcements.length===0 ? (
                <div className="card" style={{padding:32,textAlign:"center",color:"#94a3b8"}}>Nenhum aviso publicado</div>
              ) : [...announcements].reverse().map(a => (
                <div key={a.id} className="card" style={{padding:20,borderLeft:`4px solid ${a.priority==="urgente"?"#ef4444":a.priority==="importante"?"#f59e0b":"#3b82f6"}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                    <div>
                      <div style={{fontWeight:800,fontSize:16,color:"#0a2d6e",marginBottom:4}}>{a.title}</div>
                      <div style={{fontSize:14,color:"#475569",lineHeight:1.6}}>{a.body}</div>
                      <div style={{marginTop:8,display:"flex",gap:8,alignItems:"center"}}>
                        <span className={`badge badge-${a.priority==="urgente"?"red":a.priority==="importante"?"yellow":"blue"}`}>{a.priority}</span>
                        <span style={{fontSize:12,color:"#94a3b8"}}>{a.createdAt}</span>
                        {a.expiresAt && <span style={{fontSize:12,color:"#94a3b8"}}>· Expira: {new Date(a.expiresAt).toLocaleDateString("pt-BR")}</span>}
                      </div>
                    </div>
                    <button className="btn btn-red btn-sm" style={{padding:"4px 10px",whiteSpace:"nowrap"}} onClick={async () => {
                      await DB.deleteAnnouncement(a.id);
                      setAnnouncements(prev => prev.filter(x=>x.id!==a.id));
                      toast("Aviso removido","error");
                    }}>🗑 Remover</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── VOLUNTÁRIOS ── */}
        {tab==="voluntarios" && (
          <div className="fade-in">
            <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,color:"#0a2d6e",marginBottom:4}}>🤝 Voluntários</h1>
            <p style={{color:"#64748b",marginBottom:20}}>{volunteers.length} inscrição(ões) recebida(s)</p>
            <div className="card" style={{overflow:"hidden"}}>
              {volunteers.length===0 ? (
                <div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>
                  <div style={{fontSize:48,marginBottom:12}}>🤝</div>
                  <p>Nenhuma inscrição de voluntário ainda.</p>
                  <p style={{fontSize:13}}>As inscrições aparecem aqui quando alguém preenche o formulário no site.</p>
                </div>
              ) : (
                <table className="tbl">
                  <thead><tr><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Área</th><th>Disponibilidade</th><th>Data</th></tr></thead>
                  <tbody>
                    {volunteers.map((v, i) => (
                      <tr key={i}>
                        <td style={{fontWeight:700}}>{v.name}</td>
                        <td>{v.email}</td>
                        <td>{v.phone||"-"}</td>
                        <td><span className="badge badge-blue">{v.area}</span></td>
                        <td>{v.availability||"-"}</td>
                        <td style={{fontSize:12,color:"#94a3b8"}}>{v.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── ESTATÍSTICAS ── */}
        {tab==="stats" && (
          <div className="fade-in">
            <h1 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,color:"#0a2d6e",marginBottom:24}}>📊 Estatísticas</h1>
            <div className="grid-4" style={{marginBottom:24}}>
              {[
                { label:"Total Cadastros", val:users.length, icon:"👥", color:"#3b82f6" },
                { label:"Famílias Ativas", val:users.filter(u=>u.status==="approved").length, icon:"✅", color:"#22c55e" },
                { label:"Crianças Atendidas", val:users.filter(u=>u.status==="approved").reduce((a,u)=>a+(parseInt(u.children)||0),0), icon:"👧", color:"#f59e0b" },
                { label:"Voluntários", val:volunteers.length, icon:"🤝", color:"#ec4899" },
              ].map((s, i) => (
                <div key={i} className="card" style={{padding:20,borderLeft:`4px solid ${s.color}`}}>
                  <div style={{fontSize:28,marginBottom:6}}>{s.icon}</div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:36,fontWeight:900,color:"#0a2d6e"}}>{s.val}</div>
                  <div style={{fontSize:12,color:"#64748b",fontWeight:700}}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{padding:24,marginBottom:24}}>
              <h3 style={{fontWeight:800,color:"#0a2d6e",marginBottom:20}}>📈 Progresso por Evento</h3>
              {events.map(ev => {
                const withQr = users.filter(u=>u.qrCodes?.[ev.id]).length;
                const used = users.filter(u=>u.usedQrCodes?.[ev.id]).length;
                const pct = withQr > 0 ? Math.round(used/withQr*100) : 0;
                return (
                  <div key={ev.id} style={{marginBottom:20}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <div style={{fontWeight:700,fontSize:15}}>{ev.icon} {ev.label}</div>
                      <div style={{display:"flex",gap:16,fontSize:13,color:"#64748b"}}>
                        <span>QRs: {withQr}</span>
                        <span>Retirados: {used}</span>
                        <span style={{fontWeight:800,color:pct===100?"#22c55e":"#0a2d6e"}}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{background:"#f1f5f9",borderRadius:8,height:12}}>
                      <div style={{background:`linear-gradient(90deg,#e8a020,#f5c842)`,height:12,borderRadius:8,width:`${pct}%`,transition:".5s"}} />
                    </div>
                    <div style={{textAlign:"right",marginTop:4}}>
                      <button className="btn btn-blue btn-sm" style={{padding:"4px 10px",fontSize:11}} onClick={() => printReport(ev.id)}>🖨️ Relatório PDF</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="card" style={{padding:24}}>
              <h3 style={{fontWeight:800,color:"#0a2d6e",marginBottom:16}}>📍 Distribuição por Cidade</h3>
              {(() => {
                const cidades = users.filter(u=>u.status==="approved" && u.city).reduce((acc,u) => {
                  acc[u.city] = (acc[u.city]||0)+1; return acc;
                }, {});
                const sorted = Object.entries(cidades).sort((a,b)=>b[1]-a[1]).slice(0,8);
                const max = sorted[0]?.[1]||1;
                return sorted.length===0 ? <p style={{color:"#94a3b8"}}>Nenhum dado disponível</p> : sorted.map(([city, count]) => (
                  <div key={city} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:13}}>
                      <span style={{fontWeight:700}}>📍 {city}</span>
                      <span style={{color:"#64748b",fontWeight:700}}>{count} família(s) · {Math.round(count/users.filter(u=>u.status==="approved").length*100)}%</span>
                    </div>
                    <div style={{background:"#f1f5f9",borderRadius:6,height:10}}>
                      <div style={{background:`linear-gradient(90deg,var(--blue),var(--blue2))`,height:10,borderRadius:6,width:`${Math.round(count/max*100)}%`,transition:".3s"}} />
                    </div>
                  </div>
                ));
              })()}
              <button className="btn btn-blue btn-sm" style={{marginTop:16}} onClick={() => {
                const data = users.filter(u=>u.status==="approved"&&u.city).map(u=>({nome:u.name,cidade:u.city,criancas:u.children||0}));
                exportCSV(data,"distribuicao-cidades.csv");
              }}>📤 Exportar por Cidade</button>
            </div>

            {/* HEAT MAP BY BAIRRO */}
            <div className="card" style={{padding:24,marginTop:24}}>
              <h3 style={{fontWeight:800,color:"#0a2d6e",marginBottom:4}}>🗺️ Mapa de Calor por Bairro</h3>
              <p style={{color:"#64748b",fontSize:13,marginBottom:16}}>Tamanho e cor representam concentração de famílias</p>
              {(() => {
                const bairros = users.filter(u=>u.status==="approved"&&u.neighborhood).reduce((acc,u)=>{
                  acc[u.neighborhood]=(acc[u.neighborhood]||0)+1; return acc;
                },{});
                const sorted = Object.entries(bairros).sort((a,b)=>b[1]-a[1]).slice(0,12);
                const max = sorted[0]?.[1]||1;
                const colors = ["#0a2d6e","#1155cc","#1a6fe8","#3b82f6","#60a5fa","#93c5fd","#bfdbfe","#dbeafe"];
                if (sorted.length===0) return (
                  <div style={{textAlign:"center",padding:32,color:"#94a3b8"}}>
                    <div style={{fontSize:32,marginBottom:8}}>🗺️</div>
                    <p>Cadastre o campo <strong>"Bairro"</strong> nas famílias para visualizar o mapa</p>
                  </div>
                );
                return (
                  <>
                    <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:16}}>
                      {sorted.map(([bairro,count],i) => {
                        const pct = count/max;
                        const size = Math.max(60, Math.round(60+pct*80));
                        const color = colors[Math.min(i, colors.length-1)];
                        return (
                          <div key={bairro} title={`${bairro}: ${count} família(s)`} style={{
                            width:size,height:size,borderRadius:"50%",background:color,
                            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                            color:"#fff",cursor:"default",transition:".2s",boxShadow:"0 4px 12px rgba(0,0,0,.2)",
                            fontSize:Math.max(9,Math.round(9+pct*5)),fontWeight:800,textAlign:"center",padding:4
                          }}>
                            <div>{count}</div>
                            <div style={{fontSize:Math.max(7,Math.round(7+pct*3)),opacity:.85,lineHeight:1.2}}>{bairro.split(" ")[0]}</div>
                          </div>
                        );
                      })}
                    </div>
                    <button className="btn btn-blue btn-sm" onClick={() => {
                      const data = users.filter(u=>u.status==="approved"&&u.neighborhood).map(u=>({nome:u.name,bairro:u.neighborhood,cidade:u.city||"",criancas:u.children||0}));
                      exportCSV(data,"mapa-bairros.csv");
                    }}>📤 Exportar por Bairro</button>
                  </>
                );
              })()}
            </div>

            {/* RANKING COLABORADORES */}
            <div className="card" style={{padding:24,marginTop:24}}>
              <h3 style={{fontWeight:800,color:"#0a2d6e",marginBottom:16}}>🏆 Ranking de Colaboradores</h3>
              {(() => {
                const ranking = qrHistory.reduce((acc,h) => {
                  if (h.validatedBy) acc[h.validatedBy]=(acc[h.validatedBy]||0)+1;
                  return acc;
                },{});
                const sorted = Object.entries(ranking).sort((a,b)=>b[1]-a[1]);
                const medals = ["🥇","🥈","🥉"];
                return sorted.length===0 ? <p style={{color:"#94a3b8"}}>Nenhuma validação registrada ainda</p> : (
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {sorted.map(([name,count],i) => (
                      <div key={name} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",background:i===0?"linear-gradient(135deg,#fef9c3,#fef3c7)":"var(--bg)",borderRadius:10,border:i===0?"2px solid var(--gold)":"1px solid var(--light)"}}>
                        <span style={{fontSize:22}}>{medals[i]||"🎖"}</span>
                        <span style={{fontWeight:800,flex:1}}>{name}</span>
                        <span style={{background:"var(--navy)",color:"#fff",borderRadius:20,padding:"3px 12px",fontWeight:800,fontSize:13}}>{count} validações</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* DONATION GOAL MANAGER */}
            <div className="card" style={{padding:24,marginTop:24}}>
              <h3 style={{fontWeight:800,color:"#0a2d6e",marginBottom:4}}>🎯 Meta de Doação</h3>
              <p style={{fontSize:13,color:"#64748b",marginBottom:16}}>Configure a meta visível no site e no modal de doação PIX</p>
              {/* Preview */}
              <div style={{background:"linear-gradient(135deg,#0a2d6e,#1a5bb8)",borderRadius:12,padding:"16px 20px",marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontWeight:800,color:"#f5c842",fontSize:14}}>🎯 {donGoal.label}</span>
                  <span style={{fontSize:13,color:"rgba(255,255,255,.6)"}}>{Math.min(100,Math.round(donGoal.current/donGoal.target*100))}%</span>
                </div>
                <div style={{background:"rgba(255,255,255,.15)",borderRadius:999,height:10,overflow:"hidden",marginBottom:8}}>
                  <div style={{background:"linear-gradient(90deg,#e8a020,#f5c842)",height:10,borderRadius:999,width:`${Math.min(100,Math.round(donGoal.current/donGoal.target*100))}%`,transition:".5s"}} />
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"rgba(255,255,255,.6)"}}>
                  <span>Arrecadado: <strong style={{color:"#f5c842"}}>{donGoal.currency} {donGoal.current.toLocaleString("pt-BR")}</strong></span>
                  <span>Meta: <strong style={{color:"#fff"}}>{donGoal.currency} {donGoal.target.toLocaleString("pt-BR")}</strong></span>
                </div>
              </div>
              <div className="grid-2" style={{gap:12}}>
                <div className="form-group">
                  <label className="form-label">Rótulo da Meta</label>
                  <input className="form-input" value={donGoal.label} onChange={e => setDonGoal({...donGoal,label:e.target.value})} placeholder="Ex: Meta de Natal 2025" />
                </div>
                <div className="form-group">
                  <label className="form-label">Moeda</label>
                  <input className="form-input" value={donGoal.currency} onChange={e => setDonGoal({...donGoal,currency:e.target.value})} placeholder="R$" />
                </div>
                <div className="form-group">
                  <label className="form-label">Valor Arrecadado</label>
                  <input className="form-input" type="number" value={donGoal.current} onChange={e => setDonGoal({...donGoal,current:Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Meta Total</label>
                  <input className="form-input" type="number" value={donGoal.target} onChange={e => setDonGoal({...donGoal,target:Number(e.target.value)})} />
                </div>
              </div>
              <button className="btn btn-gold" onClick={() => { saveDonGoal(donGoal); toast("🎯 Meta de doação atualizada!", "success"); }}>Salvar Meta</button>
            </div>
          </div>
        )}
      </div>

      {/* USER DETAIL MODAL */}
      {selUser && (
        <div className="modal-overlay" onClick={() => setSelUser(null)}>
          <div className="modal" style={{maxWidth:600}} onClick={e => e.stopPropagation()}>
            <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,color:"#0a2d6e",marginBottom:4}}>👨‍👩‍👧 Ficha Familiar</h2>
            <div style={{marginBottom:16}}>
              <span className={`badge badge-${selUser.status==="approved"?"green":selUser.status==="rejected"?"red":"yellow"}`} style={{fontSize:13}}>
                {selUser.status==="approved"?"✅ Aprovado":selUser.status==="rejected"?"❌ Rejeitado":"⏳ Pendente"}
              </span>
            </div>
            {/* Family photo */}
            {selUser.photoUrl && (
              <div style={{marginBottom:16,borderRadius:12,overflow:"hidden",border:"2px solid var(--light)",maxHeight:180,display:"flex",alignItems:"center",justifyContent:"center",background:"#f8faff"}}>
                <img src={selUser.photoUrl} alt="Foto família" style={{width:"100%",maxHeight:180,objectFit:"cover",display:"block"}} onError={e=>e.target.parentElement.style.display="none"} />
              </div>
            )}
            <div className="grid-2" style={{gap:12,marginBottom:16}}>
              {[["Nome",selUser.name],["E-mail",selUser.email],["CPF",selUser.cpf||"-"],["Telefone",selUser.phone||"-"],["Nascimento",selUser.birthdate||"-"],["Cidade/UF",`${selUser.city||"-"}/${selUser.state||"-"}`],["Endereço",selUser.address||"-"],["Crianças",selUser.children||"0"],["Nomes das crianças",selUser.childrenNames||"-"],["Como conheceu",selUser.howKnew||"-"],["Cadastro em",selUser.createdAt]].map(([l,v]) => (
                <div key={l} style={l==="Endereço"||l==="Nomes das crianças"||l==="Como conheceu"?{gridColumn:"1/-1"}:{}}>
                  <div style={{fontSize:11,fontWeight:800,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"1px",marginBottom:2}}>{l}</div>
                  <div style={{fontSize:14,color:"#1e293b"}}>{v}</div>
                </div>
              ))}
            </div>
            {selUser.reason && (
              <div style={{background:"#f8faff",padding:16,borderRadius:12,marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:800,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Motivo do atendimento</div>
                <p style={{fontSize:14,color:"#475569",lineHeight:1.6}}>{selUser.reason}</p>
              </div>
            )}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:800,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>QR Codes atribuídos</div>
              {events.map(ev => {
                const qr = selUser.qrCodes?.[ev.id];
                const used = selUser.usedQrCodes?.[ev.id];
                return (
                  <div key={ev.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",background:"#f8faff",borderRadius:8,marginBottom:6,fontSize:13}}>
                    <span>{ev.icon} {ev.label}</span>
                    {qr ? <span className={`badge badge-${used?"green":"blue"}`}>{used?`✅ ${used}`:"🔲 Ativo"}</span> : <span className="badge badge-gray">Sem QR</span>}
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:8}}>
              {selUser.status==="pending" && <>
                <button className="btn btn-green" onClick={() => { approveUser(selUser.id); setSelUser({...selUser,status:"approved"}); }}>✓ Aprovar</button>
                <button className="btn btn-red" onClick={() => { rejectUser(selUser.id); setSelUser({...selUser,status:"rejected"}); }}>✗ Rejeitar</button>
              </>}
              <button className="btn" style={{background:"#f1f5f9",color:"#64748b",marginLeft:"auto"}} onClick={() => setSelUser(null)}>Fechar</button>
            </div>
            <button onClick={() => setSelUser(null)} style={{position:"absolute",top:16,right:16,background:"none",fontSize:20,color:"#64748b"}}>✕</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [t, setT] = useState(null);
  const toast = (msg, type="info") => { setT({msg,type}); setTimeout(() => setT(null), 3200); };
  const logout = () => { setUser(null); setPage("home"); toast("Até logo! 👋","info"); };

  useEffect(() => {
    // Load EmailJS (configure SERVICE_ID and TEMPLATE_ID at emailjs.com for email notifications)
    if (!window.emailjs) {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
      s.onload = () => window.emailjs?.init("YOUR_PUBLIC_KEY"); // replace with your key
      document.head.appendChild(s);
    }
  }, []);

  return (
    <>
      {t && <div className={`toast toast-${t.type}`} style={{fontFamily:"'Nunito',sans-serif"}}>{t.msg}</div>}
      {page==="home" && <Home go={setPage} />}
      {page==="register" && <Register go={setPage} toast={toast} />}
      {page==="collabregister" && <CollaboratorRegister go={setPage} toast={toast} />}
      {page==="login" && <Login go={setPage} onLogin={setUser} toast={toast} />}
      {page==="dashboard" && user && <Dashboard user={user} go={setPage} logout={logout} />}
      {page==="collaborator" && user && <CollaboratorDashboard user={user} go={setPage} logout={logout} toast={toast} />}
      {page==="admin" && <Admin go={setPage} logout={logout} toast={toast} />}
    </>
  );
}