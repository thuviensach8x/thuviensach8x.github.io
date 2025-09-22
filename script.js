let currentPage = 1;
const mangaPerPage = 6;
let allManga = [];
let originalManga = []; // Giữ danh sách gốc

// Danh sách các file JSON
const mangaFiles = [
  "data/manga_1.json",
  "data/manga_2.json",
  "data/manga_3.json",
  // Thêm các file JSON khác vào đây khi có dữ liệu mới
];

// Hàm tải tất cả dữ liệu từ các file JSON
async function loadAllMangaData() {
  try {
    const fetchPromises = mangaFiles.map(file =>
      fetch(file).then(res => res.json())
    );
    const allData = await Promise.all(fetchPromises);
    // Kết hợp tất cả các mảng dữ liệu lại thành một mảng duy nhất
    return [].concat(...allData);
  } catch (err) {
    console.error("Lỗi khi tải dữ liệu từ các file JSON:", err);
    throw new Error("Lỗi tải dữ liệu!");
  }
}

// Load danh sách truyện vào index.html
async function loadMangaList() {
  try {
    const data = await loadAllMangaData();
    originalManga = data;
    allManga = [...originalManga];
    renderPage(1);

    // Gắn tìm kiếm realtime cho ô input
    const searchBox = document.getElementById("searchInput");
    if (searchBox) {
      searchBox.addEventListener("input", searchManga);
    }
  } catch (err) {
    document.getElementById("manga-list").innerHTML = err.message;
  }
}

// Load chi tiết 1 truyện trong detail.html
async function loadMangaDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  try {
    const data = await loadAllMangaData();
    let manga = data.find(m => m.id == id);
    if (!manga) {
      document.getElementById("manga-detail").innerHTML = "Không tìm thấy truyện!";
      return;
    }

    let html = `
      <img src="${manga.cover}" alt="${manga.title}">
      <h2>${manga.title}</h2>
      <ul class="chapter-list">
        ${manga.chapters.map(ch => `<li><a href="${ch.link}">${ch.name}</a></li>`).join("")}
      </ul>
    `;
    document.getElementById("manga-detail").innerHTML = html;
  } catch (err) {
    document.getElementById("manga-detail").innerHTML = err.message;
  }
}

// ... giữ nguyên các hàm còn lại của bạn ...
function renderPage(page) {
  currentPage = page;
  const start = (page - 1) * mangaPerPage;
  const end = start + mangaPerPage;
  const list = allManga.slice(start, end);

  let container = document.getElementById("manga-list");
  container.innerHTML = "";

  list.forEach(manga => {
    let card = document.createElement("div");
    card.className = "manga-card";
    card.innerHTML = `
      <a href="detail.html?id=${manga.id}">
        <img src="${manga.cover}" alt="${manga.title}">
        <h3>${manga.title}</h3>
      </a>
    `;
    container.appendChild(card);
  });

  renderPagination();
}

function searchManga() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  if (query === "") {
    allManga = [...originalManga];
  } else {
    allManga = originalManga.filter(manga =>
      manga.title.toLowerCase().includes(query)
    );
  }
  renderPage(1);
}

function renderPagination() {
  const totalPages = Math.ceil(allManga.length / mangaPerPage);
  let pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  if (totalPages <= 1) return;

  // Previous button
  let prevBtn = document.createElement("button");
  prevBtn.textContent = "Trước";
  if (currentPage === 1) prevBtn.disabled = true;
  prevBtn.onclick = () => renderPage(currentPage - 1);
  pagination.appendChild(prevBtn);

  if (currentPage > 3) {
    addPageButton(1);
    pagination.appendChild(makeDot());
  }

  // Page buttons
  for (
    let i = Math.max(1, currentPage - 2);
    i <= Math.min(totalPages, currentPage + 2);
    i++
  ) {
    addPageButton(i);
  }

  if (currentPage < totalPages - 2) {
    pagination.appendChild(makeDot());
    addPageButton(totalPages);
  }

  // Next button
  let nextBtn = document.createElement("button");
  nextBtn.textContent = "Sau";
  if (currentPage === totalPages) nextBtn.disabled = true;
  nextBtn.onclick = () => renderPage(currentPage + 1);
  pagination.appendChild(nextBtn);

  // Info
  let info = document.createElement("span");
  info.style.marginLeft = "10px";
  info.textContent = `Trang ${currentPage} / ${totalPages}`;
  pagination.appendChild(info);
}

function addPageButton(num) {
  let btn = document.createElement("button");
  btn.textContent = num;
  if (num === currentPage) btn.classList.add("active");
  btn.onclick = () => renderPage(num);
  document.getElementById("pagination").appendChild(btn);
}

function makeDot() {
  let dot = document.createElement("span");
  dot.textContent = "...";
  return dot;
}