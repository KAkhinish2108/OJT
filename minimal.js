// minimal.js
import { analyzeCode } from './analyzer.js';

// DOM refs
const analyzeBtn = document.getElementById('analyzeBtn');
const uploadInput = document.getElementById('fileInput');
const codeInput = document.getElementById('codeInput');
const output = document.getElementById('output');
const previewCode = document.getElementById('codePreview');
const issueCountEl = document.getElementById('issueCount');
const langSelect = document.getElementById('langSelect');
const healthNum = document.getElementById('healthNum');
const donutCanvas = document.getElementById('donut');
const themeBtn = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// -------------------- Theme toggle (safe, persists choice) --------------------
(function setupTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') document.body.classList.add('light');
  themeIcon.textContent = document.body.classList.contains('light') ? '☀️' : '🌙';

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('light');
      const isLight = document.body.classList.contains('light');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      themeIcon.textContent = isLight ? '☀️' : '🌙';
      // notify chart to update colors
      document.dispatchEvent(new CustomEvent('cosacode:themechange'));
    });
  }
})();

// -------------------- Preview & Prism --------------------
function updatePreview() {
  const code = codeInput.value || "";
  const lang = langSelect.value;
  const className = lang === "python" ? "language-python" : "language-javascript";
  previewCode.className = className;
  previewCode.textContent = code || "// code preview appears here";
  if (window.Prism && Prism.highlightElement) Prism.highlightElement(previewCode);
}

// -------------------- Output rendering --------------------
function renderResults(results) {
  output.innerHTML = "";

  if (!results || results.length === 0) {
    output.innerHTML = `<div class="issue">✅ No issues found!</div>`;
    issueCountEl.textContent = "0";
    updateHealthAndChart(100);
    return;
  }

  issueCountEl.textContent = String(results.length);

  results.forEach(r => {
    const el = document.createElement("div");
    el.className = "issue";

    const sevColor = r.severity === "high" ? "🔴" : r.severity === "medium" ? "🟠" : "🟢";
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <strong>${r.rule}</strong> <small style="opacity:.8">${r.suggestion ? "— " + r.suggestion : ""}</small>
          <div style="font-size:12px;color:var(--subtext);margin-top:6px">${r.details ? JSON.stringify(r.details) : ""}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:18px">${sevColor}</div>
          <div style="font-size:12px;color:var(--subtext)">${r.severity}</div>
        </div>
      </div>
    `;
    output.appendChild(el);
  });

  // compute health score from severities (simple weighted model)
  const score = computeHealthFromResults(results);
  updateHealthAndChart(score);
}

// -------------------- Health computation --------------------
function computeHealthFromResults(results) {
  // weights: high = 20, medium = 10, low = 5
  let deduction = 0;
  results.forEach(r => {
    if (r.severity === 'high') deduction += 20;
    else if (r.severity === 'medium') deduction += 10;
    else deduction += 5;
  });
  const raw = 100 - deduction;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

// -------------------- Chart.js donut --------------------
let donutChart = null;

function getCSSVar(name) {
  return getComputedStyle(document.body).getPropertyValue(name).trim() || null;
}

function createDonut(initial = 100) {
  const accent = getCSSVar('--accent-cyan') || '#00ffe1';
  const track = getCSSVar('--border') || 'rgba(255,255,255,0.08)';
  const ctx = donutCanvas.getContext('2d');

  donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['health', 'rest'],
      datasets: [{
        data: [initial, 100 - initial],
        backgroundColor: [accent, track],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '70%',
      responsive: false,
      animation: { duration: 400 },
      plugins: {
        tooltip: { enabled: false },
        legend: { display: false }
      }
    }
  });

  healthNum.textContent = String(initial);
}

function updateDonutColors() {
  if (!donutChart) return;
  const accent = getCSSVar('--accent-cyan') || '#00ffe1';
  const track = getCSSVar('--border') || 'rgba(255,255,255,0.08)';
  donutChart.data.datasets[0].backgroundColor = [accent, track];
  donutChart.update();
}

function updateHealthAndChart(score) {
  healthNum.textContent = String(score);
  if (!donutChart) createDonut(score);
  else {
    donutChart.data.datasets[0].data = [score, 100 - score];
    donutChart.update();
  }
}

// create donut on load with default 78 (or 100 if no issues yet)
window.addEventListener('load', () => {
  createDonut(78);
  updatePreview();
});

// reapply colors when theme changes (listen to our custom event and also mutation observer)
document.addEventListener('cosacode:themechange', updateDonutColors);

// in case theme change happens elsewhere, observe body class changes
const observer = new MutationObserver(muts => {
  for (const m of muts) {
    if (m.attributeName === 'class') updateDonutColors();
  }
});
observer.observe(document.body, { attributes: true });

// -------------------- Analyze button logic --------------------
analyzeBtn.addEventListener('click', () => {
  const code = codeInput.value;
  if (!code || code.trim() === '') {
    output.innerHTML = "<div class='issue'>⚠ Please enter some code to analyze.</div>";
    issueCountEl.textContent = "0";
    updateHealthAndChart(100);
    return;
  }
  try {
    const result = analyzeCode(code);
    renderResults(result);
  } catch (err) {
    output.innerHTML = `<div class='issue'>❌ Analyzer error: ${err.message}</div>`;
    console.error(err);
  }
});

// -------------------- File upload handler --------------------
uploadInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const code = reader.result;
    codeInput.value = code;
    updatePreview();
    const result = analyzeCode(code);
    renderResults(result);
  };
  reader.readAsText(file, 'utf-8');
});

// -------------------- Live preview & misc --------------------
let liveTimer = null;
codeInput.addEventListener('input', () => {
  clearTimeout(liveTimer);
  liveTimer = setTimeout(() => updatePreview(), 180);
});

langSelect.addEventListener('change', updatePreview);

const demoBtn = document.getElementById('demoBtn');
if (demoBtn) {
  demoBtn.addEventListener('click', () => {
    const sample = `function greet(name) {
  console.log("Hello, " + name)
  // TODO: add error handling
}

let unused = 5

if (true) {
  console.log("demo")
}

a == b
`;
    codeInput.value = sample;
    updatePreview();
    const res = analyzeCode(sample);
    renderResults(res);
  });
}

const clearBtn = document.getElementById('clearBtn');
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    codeInput.value = "";
    updatePreview();
    output.innerHTML = "";
    issueCountEl.textContent = "0";
    updateHealthAndChart(100);
  });
}
