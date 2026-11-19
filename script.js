
// LOGIN
const loginForm = document.getElementById("loginForm");
const loginPage = document.getElementById("loginPage");
const appPage = document.getElementById("appPage");

loginForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (user === "admin" && pass === "12345") {
    sessionStorage.setItem("parkirLogin", "true");
    loginPage.classList.add("hidden");
    appPage.classList.remove("hidden");
    renderData();
  } else {
    document.getElementById("loginError").textContent =
      "Username atau password salah!";
  }
});

// DATA PARKIR
let kendaraan = JSON.parse(
  localStorage.getItem("dataParkir") || "[]"
);

function simpanData() {
  localStorage.setItem("dataParkir", JSON.stringify(kendaraan));
}

function formatWaktu(waktu) {
  return new Date(waktu).toLocaleString("id-ID");
}

function rupiah(angka) {
  return "Rp" + angka.toLocaleString("id-ID");
}

function escapeHTML(teks) {
  return String(teks).replace(/[&<>"']/g, function(char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char];
  });
}

// INPUT KENDARAAN MASUK
document.getElementById("parkingForm")
.addEventListener("submit", function(e) {
  e.preventDefault();

  const plat = document.getElementById("plat")
    .value.trim().toUpperCase();

  const jenis = document.getElementById("jenis").value;

  const sudahAda = kendaraan.some(item =>
    item.plat === plat && item.status === "Masuk"
  );

  if (sudahAda) {
    alert("Kendaraan ini masih berada di area parkir!");
    return;
  }

  kendaraan.push({
    id: Date.now() + Math.random(),
    plat: plat,
    jenis: jenis,
    masuk: new Date().toISOString(),
    keluar: null,
    biaya: 0,
    status: "Masuk"
  });

  simpanData();
  this.reset();
  renderData();

  alert("Kendaraan berhasil masuk!");
});

// HITUNG BIAYA PARKIR
function hitungBiaya(item) {
  const masuk = new Date(item.masuk).getTime();
  const keluar = new Date().getTime();

  const jam = Math.max(
    1,
    Math.ceil((keluar - masuk) / 3600000)
  );

  let tarifAwal = item.jenis === "Motor" ? 3000 : 5000;
  let tarifLanjutan = item.jenis === "Motor" ? 2000 : 3000;

  return tarifAwal + (jam - 1) * tarifLanjutan;
}

// KENDARAAN KELUAR
function kendaraanKeluar(id) {
  const item = kendaraan.find(k => k.id === id);

  if (!item || item.status !== "Masuk") return;

  const biaya = hitungBiaya(item);

  const setuju = confirm(
    "Nomor: " + item.plat +
    "\nBiaya parkir: " + rupiah(biaya) +
    "\n\nProses kendaraan keluar?"
  );

  if (!setuju) return;

  item.status = "Keluar";
  item.keluar = new Date().toISOString();
  item.biaya = biaya;

  simpanData();
  renderData();
}

// TAMPILKAN DATA
function renderData() {
  const parkingList = document.getElementById("parkingList");
  const historyList = document.getElementById("historyList");

  const aktif = kendaraan.filter(k => k.status === "Masuk");
  const selesai = kendaraan.filter(k => k.status === "Keluar");

  document.getElementById("totalMasuk").textContent =
    kendaraan.length;

  document.getElementById("totalAktif").textContent =
    aktif.length;

  const pendapatan = selesai.reduce(
    (total, item) => total + item.biaya, 0
  );

  document.getElementById("totalPendapatan").textContent =
    rupiah(pendapatan);

  const keyword = document.getElementById("search").value
    .trim().toLowerCase();

  const hasil = aktif.filter(k =>
    k.plat.toLowerCase().includes(keyword)
  );

  parkingList.innerHTML = hasil.length
    ? hasil.map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHTML(item.plat)}</td>
        <td>${escapeHTML(item.jenis)}</td>
        <td>${formatWaktu(item.masuk)}</td>
        <td class="status">● Masuk</td>
        <td>
          <button class="exit-btn"
            onclick="kendaraanKeluar(${item.id})">
            Keluar
          </button>
        </td>
      </tr>
    `).join("")
    : `<tr><td colspan="6" class="empty">
       Tidak ada kendaraan parkir
       </td></tr>`;

  historyList.innerHTML = selesai.length
    ? [...selesai].reverse().map(item => `
      <tr>
        <td>${escapeHTML(item.plat)}</td>
        <td>${escapeHTML(item.jenis)}</td>
        <td>${formatWaktu(item.keluar)}</td>
        <td>${rupiah(item.biaya)}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="4" class="empty">
       Belum ada riwayat parkir
       </td></tr>`;
}

// PENCARIAN
document.getElementById("search")
.addEventListener("input", renderData);

// LOGOUT
document.getElementById("logoutBtn")
.addEventListener("click", function() {
  sessionStorage.removeItem("parkirLogin");
  appPage.classList.add("hidden");
  loginPage.classList.remove("hidden");
  loginForm.reset();
});

// TANGGAL
document.getElementById("today").textContent =
  new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

// CEK LOGIN
if (sessionStorage.getItem("parkirLogin") === "true") {
  loginPage.classList.add("hidden");
  appPage.classList.remove("hidden");
  renderData();
}

const customerAccounts = [
  {
    nama: "pelanggan",
    password: "12345"
  }
];

function showAdminLogin() {
  document.getElementById("customerLogin")
    .classList.add("hidden");

  document.getElementById("customerDashboard")
    .classList.add("hidden");

  document.getElementById("loginPage")
    .classList.remove("hidden");
}

document.getElementById("customerForm")
.addEventListener("submit", function(e) {
  e.preventDefault();

  const nama = document.getElementById("customerName")
    .value.trim();

  const password = document.getElementById("customerPassword")
    .value;

  const akun = customerAccounts.find(a =>
    a.nama === nama && a.password === password
  );

  if (!akun) {
    document.getElementById("customerError").textContent =
      "Nama atau password salah!";
    return;
  }

  sessionStorage.setItem("customerName", nama);

  document.getElementById("customerLogin")
    .classList.add("hidden");

  document.getElementById("customerDashboard")
    .classList.remove("hidden");

  renderCustomer();
});

function renderCustomer() {
  const nama = sessionStorage.getItem("customerName");

  document.getElementById("customerWelcome").textContent =
    "Selamat Datang, " + nama;

  const data = kendaraan.filter(k =>
    k.plat.toLowerCase().includes(nama.toLowerCase())
  );

  document.getElementById("customerVehicle").innerHTML =
    data.length
      ? data.map(k => `
        <div class="stat-card">
          <h3>${escapeHTML(k.plat)}</h3>
          <p>Jenis: ${escapeHTML(k.jenis)}</p>
          <p>Status: ${escapeHTML(k.status)}</p>
          <p>Biaya: ${rupiah(k.biaya)}</p>
        </div>
      `).join("")
      : "Belum ada data kendaraan.";
}

function customerLogout() {
  sessionStorage.removeItem("customerName");

  document.getElementById("customerDashboard")
    .classList.add("hidden");

  document.getElementById("customerLogin")
    .classList.remove("hidden");
}
