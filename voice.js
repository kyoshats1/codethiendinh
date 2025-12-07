let search = document.getElementById("searchInput");
let voiceBtn = document.getElementById("voiceBtn");

voiceBtn.addEventListener("click", () => {
    startSpeech();
});

function startSpeech() {
    if (!window.webkitSpeechRecognition && !window.SpeechRecognition) {
        alert("Thiết bị không hỗ trợ giọng nói.");
        return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SR();
    recog.lang = "vi-VN";
    recog.interimResults = false;

    recog.start();

    recog.onstart = () => {
        voiceBtn.innerText = "🎙";
    };

    recog.onend = () => {
        voiceBtn.innerText = "🎤";
    };

    recog.onresult = (e) => {
        let text = e.results[0][0].transcript;
        let digits = text.replace(/\D+/g, "");
        search.value = digits;
        performSearch();
    };
}

let rawData = [];

document.getElementById("fileInput").addEventListener("change", function (e) {
    let file = e.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function (ev) {
        let data = new Uint8Array(ev.target.result);
        let wb = XLSX.read(data, { type: "array" });
        let ws = wb.Sheets[wb.SheetNames[0]];

        rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

        alert("Đã tải file thành công!");
    };
    reader.readAsArrayBuffer(file);
});

document.getElementById("searchInput").addEventListener("input", performSearch);

function performSearch() {
    let q = search.value.trim();
    let tbody = document.querySelector("#resultTable tbody");
    tbody.innerHTML = "";

    if (!q || rawData.length === 0) return;

    if (!q.includes("*")) q = "*" + q + "*";
    let regex = new RegExp(q.replace(/\*/g, ".*"));

    for (let r = 0; r < rawData.length; r++) {
        for (let c = 0; c < rawData[r].length; c++) {
            let cell = String(rawData[r][c]).trim();
            if (!cell) continue;

            if (regex.test(cell)) {
                let gia = rawData[r][c + 1] || "";

                let tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>Cột ${c + 1}</td>
                    <td>${cell}</td>
                    <td>${gia}</td>
                `;
                tbody.appendChild(tr);
            }
        }
    }
}
