

// ELEMENT HALAMAN
const loginPage = document.getElementById("loginPage");
const appPage = document.getElementById("appPage");
const customerPage = document.getElementById("customerPage");

const loginForm = document.getElementById("loginForm");
const customerLoginForm = document.getElementById("customerLoginForm");
const registerForm = document.getElementById("registerForm");

// DATA PENYIMPANAN
let kendaraan = JSON.parse(localStorage.getItem("dataParkir") || "[]");
let pelanggan = JSON.parse(localStorage.getItem("dataPelanggan") || "[]");

function simpanData() {
  localStorage.setItem("dataParkir", JSON.stringify(kendaraan));
}

function simpanPelanggan() {
  localStorage.setItem("dataPelanggan", JSON.stringify(pelanggan));
}

// FORMAT DATA
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

// PINDAH HALAMAN LOGIN
function tampilkanLogin() {
  loginPage.classList.remove("hidden");
  appPage.classList.add("hidden");
  customerPage.classList.add("hidden");
}

function tampilkanAdmin() {
  loginPage.classList.add("hidden");
  appPage.classList.remove("hidden");
  customerPage.classList.add("hidden");
  renderData();
}

function tampilkanPelanggan() {
  loginPage.classList.add("hidden");
  appPage.classList.add("hidden");
  customerPage.classList.remove("hidden");
  renderCustomer();
}

// TAB ADMIN DAN PELANGGAN
const adminTab = document.getElementById("adminTab");
const customerTab = document.getElementById("customerTab");

adminTab.addEventListener("click", function() {
  adminTab.classList.add("active");
  customerTab.classList.remove("active");

  loginForm.classList.remove("hidden");
  customerLoginForm.classList.add("hidden");
  registerForm.classList.add("hidden");
});

customerTab.addEventListener("click", function() {
  customerTab.classList.add("active");
  adminTab.classList.remove("active");

  loginForm.classList.add("hidden");
  customerLoginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
});

// LOGIN ADMIN
loginForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value;

  if (user === "admin" && pass === "12345") {
    sessionStorage.setItem("parkirLogin", "true");
    sessionStorage.setItem("parkirRole", "admin");
    sessionStorage.removeItem("customerUsername");

    tampilkanAdmin();
  } else {
    document.getElementById("loginError").textContent =
      "Username atau password Admin salah!";
  }
});

// TAMPILKAN FORM DAFTAR
document.getElementById("showRegister").addEventListener("click", function(e) {
  e.preventDefault();
  customerLoginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
});

// KEMBALI KE LOGIN PELANGGAN
document.getElementById("showCustomerLogin").addEventListener("click", function(e) {
  e.preventDefault();
  registerForm.classList.add("hidden");
  customerLoginForm.classList.remove("hidden");
});

// DAFTAR PELANGGAN
registerForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const nama = document.getElementById("registerName").value.trim();
  const username = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value;
  const plat = document.getElementById("registerPlate").value
    .trim().toUpperCase();

  const pesan = document.getElementById("registerMessage");

  if (password.length < 6) {
    pesan.textContent = "Password minimal 6 karakter.";
    return;
  }

  const usernameAda = pelanggan.some(p =>
    p.username.toLowerCase() === username.toLowerCase()
  );

  if (usernameAda) {
    pesan.textContent = "Username sudah digunakan. Silakan pilih username lain.";
    return;
  }

  const platAda = pelanggan.some(p =>
    p.plat.toUpperCase() === plat
  );

  if (platAda) {
    pesan.textContent = "Nomor polisi sudah terdaftar pada akun lain.";
    return;
  }

  pelanggan.push({
    nama: nama,
    username: username,
    password: password,
    plat: plat
  });

  simpanPelanggan();

  registerForm.reset();
  pesan.style.color = "#4ade80";
  pesan.textContent = "Pendaftaran berhasil! Silakan login.";

  setTimeout(function() {
    registerForm.classList.add("hidden");
    customerLoginForm.classList.remove("hidden");
    pesan.textContent = "";
    pesan.style.color = "";
  }, 1200);
});

// LOGIN PELANGGAN
customerLoginForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const username = document.getElementById("customerUsername").value.trim();
  const password = document.getElementById("customerPassword").value;

  const akun = pelanggan.find(p =>
    p.username.toLowerCase() === username.toLowerCase() &&
    p.password === password
  );

  if (!akun) {
    document.getElementById("customerLoginError").textContent =
      "Username atau password salah!";
    return;
  }

  sessionStorage.setItem("parkirRole", "customer");
  sessionStorage.setItem("customerUsername", akun.username);
  sessionStorage.removeItem("parkirLogin");

  customerLoginForm.reset();
  document.getElementById("customerLoginError").textContent = "";

  tampilkanPelanggan();
});

// INPUT KENDARAAN MASUK ADMIN
document.getElementById("parkingForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const plat = document.getElementById("plat").value
    .trim().toUpperCase();

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

  const tarifAwal = item.jenis === "Motor" ? 3000 : 5000;
  const tarifLanjutan = item.jenis === "Motor" ? 2000 : 3000;

  return tarifAwal + (jam - 1) * tarifLanjutan;
}

// KENDARAAN KELUAR ADMIN
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

// TAMPILKAN DATA ADMIN
function renderData() {
  const parkingList = document.getElementById("parkingList");
  const historyList = document.getElementById("historyList");

  const aktif = kendaraan.filter(k => k.status === "Masuk");
  const selesai = kendaraan.filter(k => k.status === "Keluar");

  document.getElementById("totalMasuk").textContent = kendaraan.length;
  document.getElementById("totalAktif").textContent = aktif.length;

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
          <button class="exit-btn" onclick="kendaraanKeluar(${item.id})">
            Keluar
          </button>
        </td>
      </tr>
    `).join("")
    : `<tr><td colspan="6" class="empty">Tidak ada kendaraan parkir</td></tr>`;

  historyList.innerHTML = selesai.length
    ? [...selesai].reverse().map(item => `
      <tr>
        <td>${escapeHTML(item.plat)}</td>
        <td>${escapeHTML(item.jenis)}</td>
        <td>${formatWaktu(item.keluar)}</td>
        <td>${rupiah(item.biaya)}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="4" class="empty">Belum ada riwayat parkir</td></tr>`;
}

// DASHBOARD PELANGGAN
function renderCustomer() {
  const username = sessionStorage.getItem("customerUsername");

  const akun = pelanggan.find(p => p.username === username);

  if (!akun) {
    logoutPelanggan();
    return;
  }

  document.getElementById("customerName").textContent = akun.nama;
  document.getElementById("customerPlate").textContent = akun.plat;

  const dataSaya = kendaraan.filter(k =>
    k.plat.toUpperCase() === akun.plat.toUpperCase()
  );

  const kendaraanAktif = dataSaya.find(k => k.status === "Masuk");
  const kendaraanTerakhir = dataSaya[dataSaya.length - 1];

  document.getElementById("customerVehicleType").textContent =
    kendaraanTerakhir ? kendaraanTerakhir.jenis : "Belum ada data";

  document.getElementById("customerVehicleStatus").textContent =
    kendaraanAktif ? "Sedang parkir" : "Tidak sedang parkir";

  const riwayat = [...dataSaya].reverse();

  document.getElementById("customerHistoryList").innerHTML =
    riwayat.length
      ? riwayat.map(item => `
        <tr>
          <td>${escapeHTML(item.plat)}</td>
          <td>${escapeHTML(item.jenis)}</td>
          <td>${formatWaktu(item.masuk)}</td>
          <td>${item.keluar ? formatWaktu(item.keluar) : "Belum keluar"}</td>
          <td>${item.status === "Keluar" ? rupiah(item.biaya) : "-"}</td>
        </tr>
      `).join("")
      : `<tr><td colspan="5" class="empty">Belum ada riwayat parkir</td></tr>`;
}

// PENCARIAN ADMIN
document.getElementById("search").addEventListener("input", renderData);

// LOGOUT ADMIN
document.getElementById("logoutBtn").addEventListener("click", function() {
  sessionStorage.removeItem("parkirLogin");
  sessionStorage.removeItem("parkirRole");
  login