(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const pages = ["home","schedule","outlets","visit","results"];
  let currentPage = "home", currentFilter = "Semua", outletFilter = "Semua", checkedIn = false, currentOutlet = "Grosir Sentosa";
  const toast = (msg) => { const el=$("#toast"); el.textContent=msg; el.classList.add("show"); clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>el.classList.remove("show"),2400); };
  const statusClass = s => s==="Selesai"?"pill-green":s==="Tindak lanjut"?"pill-red":"pill-orange";
  function navigate(page) {
    if(!pages.includes(page)) return;
    currentPage=page;
    $$(".page").forEach(p=>p.classList.toggle("active",p.id===`page-${page}`));
    $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
    $$(".drawer-nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
    closeDrawer();
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function openDrawer(){ $("#drawer").classList.add("open"); $("#scrim").classList.add("show"); }
  function closeDrawer(){ $("#drawer").classList.remove("open"); $("#scrim").classList.remove("show"); }
  function scheduleHTML(){
    const times=["08.00","09.00","10.00","11.00","12.00","13.30","15.00","16.00"];
    const sorted=[...window.mockOutlets].sort((a,b)=>times.indexOf(a.time)-times.indexOf(b.time));
    const visible=sorted.filter(o=>currentFilter==="Semua"||o.status===currentFilter);
    $("#scheduleList").innerHTML=visible.map(o=>`<div class="schedule-row"><div class="schedule-time">${o.time}</div><div class="timeline-dot ${o.status==="Selesai"?"done":o.status==="Menunggu"?"pending":""}"></div><article class="schedule-card"><div class="card-title-row"><strong>${o.name}</strong><span class="pill ${statusClass(o.status)}">${o.status}</span></div><p>${o.area} · ${o.code}</p><div class="schedule-meta"><span>⌖ ${o.distance}</span><button class="small-action" data-checkoutlet="${o.name}">${o.status==="Selesai"?"Lihat detail":"Mulai kunjungan →"}</button></div></article></div>`).join("") || '<p class="muted">Tidak ada jadwal pada filter ini.</p>';
    $$("[data-checkoutlet]").forEach(b=>b.addEventListener("click",()=>{setOutlet(b.dataset.checkoutlet);navigate("visit");}));
  }
  function outletHTML(){
    const q=$("#outletSearch").value.toLowerCase();
    const data=window.mockOutlets.filter(o=>(o.name+" "+o.area+" "+o.code).toLowerCase().includes(q))
      .filter(o=>outletFilter==="Semua"||(outletFilter==="Prioritas"&&o.priority)||(outletFilter==="Belum dikunjungi"&&o.status!=="Selesai"));
    $("#outletList").innerHTML=data.map(o=>`<article class="outlet-card"><div class="outlet-initial">${o.initials}</div><div class="outlet-info"><div class="card-title-row"><strong>${o.name}</strong><span class="pill ${statusClass(o.status)}">${o.status}</span></div><p>${o.area} · ${o.code}</p><small>⌖ ${o.address}</small><div class="schedule-meta"><span class="distance">${o.priority?"★ Prioritas":"Outlet reguler"} · ${o.distance}</span><button class="small-action" data-selectoutlet="${o.name}">Kunjungi →</button></div></div></article>`).join("") || '<p class="muted">Outlet tidak ditemukan.</p>';
    $$("[data-selectoutlet]").forEach(b=>b.addEventListener("click",()=>{setOutlet(b.dataset.selectoutlet);navigate("visit");}));
  }
  function setOutlet(name){
    currentOutlet=name; const o=window.mockOutlets.find(x=>x.name===name)||window.mockOutlets[0];
    $("#visitOutlet").value=o.name; $("#mapOutletName").textContent=o.name; $("#resultOutletName").textContent=o.name;
    $("#visitStatus").textContent=checkedIn?"Sudah check-in":"Belum check-in";
    $("#checkinBtn").innerHTML=checkedIn?"✓ &nbsp; Check-in tercatat":"⌖ &nbsp; Check-in sekarang";
    $("#checkinBtn").classList.toggle("secondary-btn",checkedIn); $("#checkinBtn").classList.toggle("primary-btn",!checkedIn);
  }
  $$(".nav-item,[data-goto],.drawer-nav button").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page||b.dataset.goto)));
  $("#menuBtn").addEventListener("click",openDrawer); $("#closeDrawer").addEventListener("click",closeDrawer); $("#scrim").addEventListener("click",closeDrawer);
  $("#profileBtn").addEventListener("click",()=>toast("Profil Eko Prasetyo · Sales Representative"));
  $$(".filter-chip[data-filter]").forEach(b=>b.addEventListener("click",()=>{currentFilter=b.dataset.filter;$$(".filter-chip[data-filter]").forEach(x=>x.classList.toggle("selected",x===b));scheduleHTML();}));
  $$(".filter-chip[data-outlet-filter]").forEach(b=>b.addEventListener("click",()=>{outletFilter=b.dataset.outletFilter;$$(".filter-chip[data-outlet-filter]").forEach(x=>x.classList.toggle("selected",x===b));outletHTML();}));
  $("#outletSearch").addEventListener("input",outletHTML);
  $("#visitOutlet").addEventListener("change",e=>{checkedIn=false;setOutlet(e.target.value);});
  $("#refreshGps").addEventListener("click",()=>toast("Lokasi simulasi berhasil diperbarui."));
  $("#checkinBtn").addEventListener("click",()=>{
    if(!checkedIn){checkedIn=true;setOutlet(currentOutlet);$("#visitStatus").textContent="Check-in 13.26 WIB";toast("Check-in berhasil dicatat (simulasi).");}
    else {navigate("results");toast("Silakan lengkapi hasil kunjungan.");}
  });
  $("#resultForm").addEventListener("submit",e=>{
    e.preventDefault();
    if(!checkedIn){toast("Lakukan check-in terlebih dahulu.");navigate("visit");return;}
    const outcome=$("#visitOutcome").value;
    if(!outcome){toast("Pilih hasil kunjungan terlebih dahulu.");return;}
    $("#resultState").textContent="Tersimpan";$("#resultState").className="pill pill-green";
    toast("Hasil kunjungan tersimpan (simulasi).");
  });
  $("#saveDraft").addEventListener("click",()=>{ $("#resultState").textContent="Draft tersimpan";toast("Draft laporan disimpan sementara."); });
  // Simulated role/date selectors and quick interactions
  $$(".date-item").forEach(b=>b.addEventListener("click",()=>{$$(".date-item").forEach(x=>x.classList.toggle("selected",x===b));toast("Jadwal "+b.querySelector("small").textContent+" "+b.querySelector("strong").textContent+" dipilih (demo).");}));
  // Keyboard shortcut Ctrl+K / Cmd+K for quick outlet search
  window.addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      navigate("outlets");
      setTimeout(() => {
        const inp = $("#outletSearch");
        if (inp) { inp.focus(); inp.select(); }
      }, 50);
    }
  });

  scheduleHTML();outletHTML();setOutlet(currentOutlet);
})();