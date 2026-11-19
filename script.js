

const USERS_KEY = "parkova_customers";

// Ambil akun pelanggan
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

// Simpan akun pelanggan
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Navigasi halaman
function showLogin() {
  loginSection.classList.remove("hidden");
  registerSection.classList.add("hidden");
  dashboardSection.classList.add("hidden");
}

function showRegister() {
  loginSection.classList.add("hidden");
  registerSection.classList.remove("hidden");
  dashboardSection.classList.add("hidden");
}

function showAdmin() {
  sessionStorage.removeItem("parkovaCustomer");
  // Arahkan ke halaman login admin
  window.location.href = "admin.html";
}

// Tampilkan password
function togglePassword(id) {
  const field = document.getElementById(id);
  field.type = field.type === "password" ? "text" : "password";
}

// REGISTRASI
registerForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const nama = regName.value.trim();
  const phone = regPhone.value.trim();
  const email = regEmail.value.trim().toLowerCase();
  const password = regPassword.value;
  const confirm = regConfirm.value;

  if (password.length < 8) {
    registerMessage.textContent = "Password minimal 8 karakter.";
    return;
  }

  if (password !== confirm) {
    registerMessage.textContent = "Konfirmasi password tidak cocok.";
    return;
  }

  const users = getUsers();

  if (users.some(u => u.email === email)) {
    registerMessage.textContent = "Email sudah terdaftar.";
    return;
  }

  users.push({
    id: Date.now(),
    nama,
    phone,
    email,
    password
  });

  saveUsers(users);

  registerMessage.style.color = "#4ade80";
  registerMessage.textContent = "Registrasi berhasil! Silakan login.";

  registerForm.reset();
});

// LOGIN
loginForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const email = loginEmail.value.trim().toLowerCase();
  const password = loginPassword.value;

  const user = getUsers().find(u =>
    u.email === email && u.password === password
  );

  if (!user) {
    loginMessage.textContent = "Email atau password salah.";
    return;
  }

  sessionStorage.setItem("parkovaCustomer", String(user.id));

  loginMessage.textContent = "";
  loginForm.reset();
  renderDashboard(user);
});

// DASHBOARD
function renderDashboard(user) {
  showDashboard();

  welcomeName.textContent = "Halo, " + user.nama;
  profileName.textContent = "Nama: " + user.nama;
  profilePhone.textContent = "Nomor HP: " + user.phone;
  profileEmail.textContent = "Email: " + user.email;

  const kendaraan = JSON.parse(
    localStorage.getItem("dataParkir") || "[]"
  );

  const milikSaya = kendaraan.filter(k =>
    k.customerId === user.id
  );

  const aktif = milikSaya.filter(k => k.status === "Masuk");
  const selesai = milikSaya.filter(k => k.status === "Keluar");

  vehicleData.innerHTML = aktif.length
    ? aktif.map(k => `
      <p>Plat: ${escapeHTML(k.plat)}</p>
      <p>Jenis: ${escapeHTML(k.jenis)}</p>
      <p>Status: Sedang Parkir</p>
    `).join("")
    : "Tidak ada kendaraan yang sedang parkir.";

  historyData.innerHTML = selesai.length
    ? selesai.map(k => `
      <p>Plat: ${escapeHTML(k.plat)}</p>
      <p>Waktu keluar: ${formatWaktu(k.keluar)}</p>
      <p>Biaya: ${rupiah(k.biaya)}</p>
      <hr>
    `).join("")
    : "Belum ada riwayat parkir.";
}

function showDashboard() {
  loginSection.classList.add("hidden");
  registerSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
}

// LOGOUT
function logout() {
  sessionStorage.removeItem("parkovaCustomer");
  loginForm.reset();
  showLogin();
}

// CEK SESI
const savedId = sessionStorage.getItem("parkovaCustomer");

if (savedId) {
  const user = getUsers().find(u => String(u.id) === savedId);

  if (user) {
    renderDashboard(user);
  } else {
    logout();
  }
}
