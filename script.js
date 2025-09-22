let currentPage = 1;
const mangaPerPage = 6;
let allManga = [];
let originalManga = []; // Giữ danh sách gốc

// Danh sách file JSON cần load
const mangaFiles = [
  "data/manga_1.json",
  "data/manga_2.json",
  "data/manga_3.json"
  // thêm tiếp nếu có
];

// Hàm load tất cả file JSON
function loadAllMangaFiles() {
  return Promise.all(
    mangaFiles.map(file => fetch(file).then(res => res.json()))
  ).then(results => results.flat());
}

// Load danh sách truyện vào index.html
function loadMangaList() {
  loadAllMangaFiles()
    .then(data => {
      originalManga = data;
      allManga = [...originalManga];
      renderPage(1);

      const searchBox = document.getElementById("searchInput");
      if (searchBox) {
        searchBox.addEventListener("input", searchManga);
      }
    })
    .catch(err => {
      document.getElementById("manga-list").innerHTML = "Lỗi tải dữ liệu!";
      console.error(err);
    });
}

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
      <a href="detail.html?id=${manga.id}" target="_blank" rel="noopener noreferrer">
        <img src="${manga.cover}" alt="${manga.title}">
        <h3>${manga.title}</h3>
      </a>
    `;
    container.appendChild(card);
  });

  renderPagination();
}

// Tìm kiếm truyện (realtime)
function searchManga() {
  let keyword = document.getElementById("searchInput").value.toLowerCase();

  if (keyword.trim() === "") {
    allManga = [...originalManga];
  } else {
    allManga = originalManga.filter(m => m.title.toLowerCase().includes(keyword));
  }

  currentPage = 1;
  renderPage(currentPage);
}

// Phân trang
function renderPagination() {
  const totalPages = Math.ceil(allManga.length / mangaPerPage);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  let prevBtn = document.createElement("button");
  prevBtn.textContent = "« Trước";
  prevBtn.disabled = (currentPage === 1);
  prevBtn.onclick = () => renderPage(currentPage - 1);
  pagination.appendChild(prevBtn);

  addPageButton(1);
  if (currentPage > 3) pagination.appendChild(makeDot());

  for (let i = currentPage - 1; i <= currentPage + 1; i++) {
    if (i > 1 && i < totalPages) addPageButton(i);
  }

  if (currentPage < totalPages - 2) pagination.appendChild(makeDot());
  if (totalPages > 1) addPageButton(totalPages);

  let nextBtn = document.createElement("button");
  nextBtn.textContent = "Kế »";
  nextBtn.disabled = (currentPage === totalPages);
  nextBtn.onclick = () => renderPage(currentPage + 1);
  pagination.appendChild(nextBtn);

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

// Load chi tiết 1 truyện trong detail.html
function loadMangaDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  loadAllMangaFiles()
    .then(data => {
      let manga = data.find(m => m.id == id);
      if (!manga) {
        document.getElementById("manga-detail").innerHTML = "Không tìm thấy truyện!";
        return;
      }

      let html = `
        <img src="${manga.cover}" alt="${manga.title}">
        <h2>${manga.title}</h2>
        <ul class="chapter-list">
          ${manga.chapters.map(ch => `<li><a href="${ch.link}" target="_blank" rel="noopener noreferrer">${ch.name}</a></li>`).join("")}
        </ul>
      `;
      document.getElementById("manga-detail").innerHTML = html;
    })
    .catch(err => {
      document.getElementById("manga-detail").innerHTML = "Lỗi tải chi tiết!";
      console.error(err);
    });
}
