import { useState, useEffect, useRef, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  Radar, PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

/* ════════════════════════════════════════════════════════════════
   ⚙  CONFIG  — fill these in for live OAuth + Email
════════════════════════════════════════════════════════════════ */
const CFG = {
  GOOGLE_CLIENT_ID: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  EMAILJS_SERVICE: "YOUR_EMAILJS_SERVICE_ID",
  EMAILJS_TEMPLATE: "YOUR_EMAILJS_TEMPLATE_ID",
  EMAILJS_KEY: "YOUR_EMAILJS_PUBLIC_KEY",
};

/* ════════════════════════════════════════════════════════════════
   🎨  BRAND
════════════════════════════════════════════════════════════════ */
const B = {
  navy: "#0f2d5e", navyDk: "#0a2149", navyLt: "#1e3a6e",
  cyan: "#0ea5e9", cyanDk: "#0284c7",
  email: "sentrasec1@gmail.com", phone: "+971 52 9531052",
  tagline: "Centralized security intelligence",
};

function Logo({ size = 34, light = false, tag = false }) {
  const tc = light ? "#ffffff" : B.navy;
  const sl = light ? "rgba(255,255,255,0.45)" : "#7a8fa8";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.26, lineHeight: 1 }}>
      <svg width={size} height={size * 1.12} viewBox="0 0 100 112" fill="none">
        <path d="M50 4L90 20L90 55C90 78 72 98 50 108C28 98 10 78 10 55L10 20Z"
          fill={light ? B.navyLt : B.navy} />
        <path d="M26 52C26 38 37 26 50 26C63 26 74 38 74 52"
          stroke="white" strokeWidth="6.5" strokeLinecap="round" fill="none" opacity=".95" />
        <path d="M34 58C34 48 41 41 50 41C59 41 66 48 66 58"
          stroke="white" strokeWidth="6.5" strokeLinecap="round" fill="none" opacity=".82" />
        <path d="M42 64C42 58 45.5 55 50 55C54.5 55 58 58 58 64"
          stroke="white" strokeWidth="6.5" strokeLinecap="round" fill="none" opacity=".7" />
        <circle cx="50" cy="72" r="5.5" fill="white" />
      </svg>
      <div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: size * .72, fontWeight: 900, color: tc, letterSpacing: "-.5px" }}>SentraSec</div>
        {tag && <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: size * .27, color: sl, marginTop: 2 }}>{B.tagline}</div>}
      </div>
    </div>
  );
}
function ShieldMark({ size = 26 }) {
  return (
    <svg width={size} height={size * 1.12} viewBox="0 0 100 112" fill="none">
      <path d="M50 4L90 20L90 55C90 78 72 98 50 108C28 98 10 78 10 55L10 20Z" fill={B.navyLt} />
      <path d="M26 52C26 38 37 26 50 26C63 26 74 38 74 52" stroke="white" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M34 58C34 48 41 41 50 41C59 41 66 48 66 58" stroke="white" strokeWidth="7" strokeLinecap="round" fill="none" opacity=".82" />
      <path d="M42 64C42 58 45.5 55 50 55C54.5 55 58 58 58 64" stroke="white" strokeWidth="7" strokeLinecap="round" fill="none" opacity=".7" />
      <circle cx="50" cy="72" r="5.5" fill="white" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   📦  PACKAGES
════════════════════════════════════════════════════════════════ */
const PKGS = [
  {
    id: "sentinel", name: "Sentinel", tier: "Starter", price: 299, color: "#0ea5e9",
    desc: "Essential threat visibility for growing teams",
    scanDepth: "surface", maxEndpoints: 50, logDays: 7, appScanLimit: 15,
    scanPhases: ["Detecting device", "Port scanning", "Basic CVE check", "Malware signatures", "Generating report"],
    features: ["Real-time monitoring", "Up to 50 endpoints", "Basic CVE scanning", "Email alerts", "7-day logs", "Community support"],
    locked: ["Advanced SIEM", "Threat Intel Feed", "Incident Playbooks", "API Access", "AI Hunting", "YARA Rules"]
  },
  {
    id: "guardian", name: "Guardian", tier: "Professional", price: 899, color: "#6366f1", popular: true,
    desc: "Advanced detection & response for security teams",
    scanDepth: "deep", maxEndpoints: 500, logDays: 30, appScanLimit: 80,
    scanPhases: ["Detecting device", "Deep port scan", "CVE database check", "Threat intel correlation", "Behavioral analysis", "YARA scan", "Generating report"],
    features: ["Everything in Sentinel", "Up to 500 endpoints", "Advanced SIEM", "Threat Intel Feed", "30-day logs", "Incident Playbooks", "API Access", "Priority support"],
    locked: ["AI Threat Hunting", "Custom YARA", "Zero-Day Protection"]
  },
  {
    id: "fortress", name: "Fortress", tier: "Enterprise", price: 2499, color: "#f59e0b",
    desc: "Full-spectrum SOC for mission-critical infrastructure",
    scanDepth: "ai-powered", maxEndpoints: 99999, logDays: 365, appScanLimit: 500,
    scanPhases: ["Detecting device", "Full port scan", "CVE + 0-day check", "Threat intel correlation", "AI behavioral analysis", "Custom YARA rules", "Memory forensics", "Zero-day detection", "AI risk scoring", "Generating report"],
    features: ["Everything in Guardian", "Unlimited endpoints", "AI Threat Hunting", "Custom YARA Rules", "Zero-Day Protection", "365-day logs", "Dedicated SOC analyst", "SLA 99.99%", "On-premise option", "White-glove onboarding"],
    locked: []
  },
];

const DEMO_USERS = [
  { email: "admin@sentrasec.io", password: "demo123", name: "Alex Morgan", role: "SOC Lead", pkg: "fortress" },
  { email: "pro@sentrasec.io", password: "demo123", name: "Jordan Lee", role: "Security Analyst", pkg: "guardian" },
  { email: "starter@sentrasec.io", password: "demo123", name: "Sam Rivera", role: "IT Manager", pkg: "sentinel" },
];

/* ════════════════════════════════════════════════════════════════
   🔬  DEVICE DETECTION
════════════════════════════════════════════════════════════════ */
const detectOS = (ua) => {
  if (/Windows NT 10\.0/.test(ua)) return "Windows 11 / 10";
  if (/Windows NT 6\.3/.test(ua)) return "Windows 8.1";
  if (/Windows NT 6\.1/.test(ua)) return "Windows 7";
  if (/Mac OS X ([\d_]+)/.test(ua)) return `macOS ${ua.match(/Mac OS X ([\d_]+)/)[1].replace(/_/g, ".")}`;
  if (/Android ([\d.]+)/.test(ua)) return `Android ${ua.match(/Android ([\d.]+)/)[1]}`;
  if (/iPhone OS ([\d_]+)/.test(ua)) return `iOS ${ua.match(/iPhone OS ([\d_]+)/)[1].replace(/_/g, ".")}`;
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown OS";
};
const detectBrowser = (ua) => {
  if (/Edg\/([\d]+)/.test(ua)) return `Microsoft Edge ${ua.match(/Edg\/([\d]+)/)[1]}`;
  if (/OPR\/([\d]+)/.test(ua)) return `Opera ${ua.match(/OPR\/([\d]+)/)[1]}`;
  if (/Firefox\/([\d]+)/.test(ua)) return `Firefox ${ua.match(/Firefox\/([\d]+)/)[1]}`;
  if (/Chrome\/([\d]+)/.test(ua)) return `Chrome ${ua.match(/Chrome\/([\d]+)/)[1]}`;
  if (/Version\/([\d]+).*Safari/.test(ua)) return `Safari ${ua.match(/Version\/([\d]+)/)[1]}`;
  return "Unknown Browser";
};
const detectDevice = (ua) => {
  if (/Mobile|Android|iPhone/.test(ua)) return "Mobile";
  if (/iPad|Tablet/.test(ua)) return "Tablet";
  return "Desktop / Workstation";
};

async function fetchDeviceInfo(username) {
  const ua = navigator.userAgent;
  const os = detectOS(ua);
  const browser = detectBrowser(ua);
  const device = detectDevice(ua);
  const hostname = window.location.hostname || "localhost";
  let ip = "Fetching…"; let city = "—"; let country = "—"; let isp = "—"; let risk = "MEDIUM";
  try {
    const r = await fetch("https://api.ipify.org?format=json");
    const d = await r.json();
    ip = d.ip;
    try {
      const g = await fetch(`https://ip-api.com/json/${ip}?fields=country,city,org,status`);
      const gd = await g.json();
      if (gd.status === "success") { city = gd.city; country = gd.country; isp = gd.org; }
    } catch { }
    risk = ip.startsWith("192.168") || ip.startsWith("10.") ? "LOW" : "MEDIUM";
  } catch { ip = "Unavailable"; }

  const apps_win = ["Microsoft Edge", "Google Chrome", "Microsoft Defender", "Windows Firewall", "Visual Studio Code", "Node.js", "Python 3.11", "Git", "Docker Desktop", "Wireshark", "VirtualBox", "7-Zip", "Notepad++", "Process Explorer", "Autoruns"];
  const apps_mac = ["Safari", "Google Chrome", "Xcode", "Terminal", "Activity Monitor", "Homebrew", "Docker", "iTerm2", "Visual Studio Code", "Python 3.11", "Git", "Wireshark", "Little Snitch", "Malwarebytes", "CleanMyMac"];
  const apps_lin = ["Bash", "OpenSSH", "iptables", "Fail2Ban", "ClamAV", "Nmap", "Wireshark", "Python3", "Node.js", "Docker", "Git", "Vim", "htop", "Netstat", "UFW Firewall"];
  const appList = os.startsWith("macOS") ? apps_mac : os.startsWith("Linux") ? apps_lin : apps_win;

  return {
    ip, city, country, isp, os, browser, device, hostname, username, risk,
    arch: navigator.platform || "x86_64",
    lang: navigator.language || "en-US",
    cores: navigator.hardwareConcurrency || 4,
    memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "Unknown",
    onlineStatus: navigator.onLine ? "Online" : "Offline",
    cookiesEnabled: navigator.cookieEnabled,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenRes: `${window.screen.width}×${window.screen.height}`,
    detectedAt: new Date().toISOString(),
    installedApps: appList,
  };
}

/* ════════════════════════════════════════════════════════════════
   🦠  SCAN ENGINE
════════════════════════════════════════════════════════════════ */
const SCAN_VULNS = {
  sentinel: [
    { id: "CVE-2024-1234", app: "OpenSSL 1.1.1", sev: "CRITICAL", score: 9.8, desc: "Buffer overflow RCE", fix: "Update to 3.2.1" },
    { id: "CVE-2024-5678", app: "SSH daemon", sev: "HIGH", score: 7.8, desc: "Auth bypass vulnerability", fix: "Patch sshd_config" },
    { id: "CVE-2023-9012", app: "Chrome 118", sev: "MEDIUM", score: 6.1, desc: "V8 type confusion", fix: "Update browser" },
  ],
  guardian: [
    { id: "CVE-2024-1234", app: "OpenSSL 1.1.1", sev: "CRITICAL", score: 9.8, desc: "Buffer overflow RCE", fix: "Update to 3.2.1" },
    { id: "CVE-2024-3399", app: "Docker 24.0", sev: "CRITICAL", score: 9.1, desc: "Container escape via runc", fix: "Update to 25.0.3" },
    { id: "CVE-2024-5678", app: "SSH daemon", sev: "HIGH", score: 7.8, desc: "Auth bypass vulnerability", fix: "Patch sshd_config" },
    { id: "CVE-2024-7890", app: "curl 7.81", sev: "HIGH", score: 7.2, desc: "HSTS bypass via redirect", fix: "Update curl to 8.5.0" },
    { id: "CVE-2023-9012", app: "Chrome 118", sev: "MEDIUM", score: 6.1, desc: "V8 type confusion", fix: "Update browser" },
    { id: "CVE-2024-2111", app: "libxml2 2.9", sev: "MEDIUM", score: 5.8, desc: "XXE injection", fix: "Update libxml2" },
    { id: "CVE-2023-5555", app: "Python 3.9", sev: "LOW", score: 3.2, desc: "Regex denial-of-service", fix: "Upgrade to 3.11+" },
  ],
  fortress: [
    { id: "CVE-2024-1234", app: "OpenSSL 1.1.1", sev: "CRITICAL", score: 9.8, desc: "Buffer overflow RCE", fix: "Update to 3.2.1" },
    { id: "CVE-2024-3399", app: "Docker 24.0", sev: "CRITICAL", score: 9.1, desc: "Container escape via runc", fix: "Update to 25.0.3" },
    { id: "CVE-2024-9999", app: "Kernel 5.15", sev: "CRITICAL", score: 9.6, desc: "Privilege escalation via dirty pipe", fix: "Kernel patch 6.6.8" },
    { id: "CVE-2024-5678", app: "SSH daemon", sev: "HIGH", score: 7.8, desc: "Auth bypass vulnerability", fix: "Patch sshd_config" },
    { id: "CVE-2024-7890", app: "curl 7.81", sev: "HIGH", score: 7.2, desc: "HSTS bypass via redirect", fix: "Update curl to 8.5.0" },
    { id: "CVE-2024-8811", app: "nginx 1.22", sev: "HIGH", score: 7.5, desc: "HTTP/2 rapid reset attack", fix: "Update to 1.25.3" },
    { id: "CVE-2023-9012", app: "Chrome 118", sev: "MEDIUM", score: 6.1, desc: "V8 type confusion", fix: "Update browser" },
    { id: "CVE-2024-2111", app: "libxml2 2.9", sev: "MEDIUM", score: 5.8, desc: "XXE injection", fix: "Update libxml2" },
    { id: "CVE-2024-6677", app: "glibc 2.36", sev: "MEDIUM", score: 5.3, desc: "Buffer overread in getaddrinfo", fix: "glibc 2.38+" },
    { id: "CVE-2023-5555", app: "Python 3.9", sev: "LOW", score: 3.2, desc: "Regex denial-of-service", fix: "Upgrade to 3.11+" },
    { id: "CVE-2023-4444", app: "Git 2.39", sev: "LOW", score: 2.9, desc: "Symlink traversal in sparse clone", fix: "Update to 2.43" },
  ],
};
const THREATS = {
  sentinel: [{ name: "Generic.Malware.Spyware", file: "C:\\temp\\update.exe", sev: "HIGH", action: "Quarantined" }],
  guardian: [
    { name: "Trojan.GenericKD.64811234", file: "/tmp/.hidden/svc32", sev: "CRITICAL", action: "Removed" },
    { name: "Adware.Bundleware.B", file: "C:\\Users\\AppData\\bundler.dll", sev: "MEDIUM", action: "Quarantined" },
    { name: "PUA.Miner.XMRig", file: "/usr/share/.xmr", sev: "HIGH", action: "Removed" },
  ],
  fortress: [
    { name: "Trojan.GenericKD.64811234", file: "/tmp/.hidden/svc32", sev: "CRITICAL", action: "Removed" },
    { name: "Backdoor.Cobalt.Strike.Beacon", file: "C:\\Windows\\Temp\\csrss.exe", sev: "CRITICAL", action: "Removed" },
    { name: "PUA.Miner.XMRig", file: "/usr/share/.xmr", sev: "HIGH", action: "Removed" },
    { name: "Adware.Bundleware.B", file: "C:\\Users\\AppData\\bundler.dll", sev: "MEDIUM", action: "Quarantined" },
    { name: "Rootkit.Necurs.Dropper", file: "/lib/modules/hidden.ko", sev: "CRITICAL", action: "Removed" },
  ],
};

/* ════════════════════════════════════════════════════════════════
   📧  EMAILJS WELCOME EMAIL
════════════════════════════════════════════════════════════════ */
async function sendWelcomeEmail(user, pkg) {
  try {
    if (!window.emailjs) return;
    await window.emailjs.send(CFG.EMAILJS_SERVICE, CFG.EMAILJS_TEMPLATE, {
      to_email: user.email,
      to_name: user.name,
      package_name: pkg.name,
      package_tier: pkg.tier,
      package_price: `$${pkg.price}/month`,
      dashboard_url: window.location.href,
      support_email: B.email,
      support_phone: B.phone,
      max_endpoints: pkg.maxEndpoints >= 99999 ? "Unlimited" : pkg.maxEndpoints,
      log_retention: `${pkg.logDays} days`,
      scan_depth: pkg.scanDepth,
      reply_to: B.email,
    }, CFG.EMAILJS_KEY);
    return true;
  } catch (e) { return false; }
}

/* ════════════════════════════════════════════════════════════════
   🎨  GLOBAL CSS
════════════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --N:#0f2d5e;--NL:#1e3a6e;--C:#0ea5e9;--CK:#0284c7;--IN:#6366f1;--AM:#f59e0b;
  --lb:#f0f4ff;--lb1:#fff;--lb2:#f5f8ff;
  --lbo:rgba(15,45,94,.09);--lbo2:rgba(15,45,94,.16);
  --lt:#0c1a2e;--lt2:#1e3a6e;--lm:#64748b;
  --db:#060a0f;--db1:#0a1018;--db2:#0f1824;--db3:#141f2e;
  --dbo:rgba(14,165,233,.08);--dbo2:rgba(14,165,233,.18);
  --dt:#e2e8f0;--dm:#64748b;--dc:#22d3ee;
  --fd:'Playfair Display',serif;--fs:'IBM Plex Sans',sans-serif;--fm:'IBM Plex Mono',monospace;
}
html{scroll-behavior:smooth}
body{background:var(--lb);color:var(--lt);font-family:var(--fs)}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--lb2)}::-webkit-scrollbar-thumb{background:var(--lbo2);border-radius:3px}

/* NAV */
.nav{position:fixed;top:0;left:0;right:0;z-index:1000;height:68px;background:rgba(255,255,255,.9);backdrop-filter:blur(20px) saturate(180%);border-bottom:1px solid var(--lbo);display:flex;align-items:center;padding:0 clamp(16px,5vw,80px);gap:24px;transition:box-shadow .3s}
.nav.sol{box-shadow:0 2px 28px rgba(15,45,94,.1)}
.nav-links{display:flex;gap:24px;margin-left:auto}
.nl{font-size:13.5px;font-weight:500;color:var(--lt2);cursor:pointer;border:none;background:none;transition:color .2s;font-family:var(--fs)}
.nl:hover{color:var(--CK)}
.nbg{padding:8px 18px;border:1.5px solid var(--lbo2);border-radius:8px;background:transparent;color:var(--N);font-size:13px;font-weight:500;cursor:pointer;transition:all .2s;font-family:var(--fs)}
.nbg:hover{border-color:var(--C);color:var(--CK)}
.nbf{padding:8px 20px;border:none;border-radius:8px;background:var(--N);color:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all .25s;font-family:var(--fs)}
.nbf:hover{background:var(--CK);box-shadow:0 4px 20px rgba(14,165,233,.4);transform:translateY(-1px)}

/* HERO */
.hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;align-items:center;padding:108px clamp(16px,6vw,100px) 80px;gap:56px;position:relative;overflow:hidden;background:linear-gradient(135deg,#fff 0%,#f0f4ff 55%,#e8effd 100%)}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 55% 50% at 80% 20%,rgba(14,165,233,.09) 0%,transparent 60%),radial-gradient(ellipse 40% 40% at 15% 80%,rgba(15,45,94,.07) 0%,transparent 60%);pointer-events:none}
.hgrid{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(15,45,94,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(15,45,94,.04) 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse 100% 100% at 50% 50%,black 30%,transparent 75%)}
.eyeb{display:inline-flex;align-items:center;gap:8px;font-family:var(--fm);font-size:11px;font-weight:500;letter-spacing:3px;text-transform:uppercase;color:var(--CK);margin-bottom:22px;padding:6px 14px;background:rgba(14,165,233,.08);border:1px solid rgba(14,165,233,.22);border-radius:100px}
.edot{width:6px;height:6px;border-radius:50%;background:var(--C);animation:blink 2s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
.h1{font-family:var(--fd);font-size:clamp(36px,5vw,64px);font-weight:900;line-height:1.08;color:var(--N);margin-bottom:22px;letter-spacing:-1.5px}
.h1 em{font-style:italic;color:var(--CK)}
.hp{font-size:16px;color:var(--lm);line-height:1.75;max-width:480px;margin-bottom:34px}
.hacts{display:flex;gap:12px;flex-wrap:wrap}
.hbp{padding:14px 30px;background:var(--N);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;transition:all .25s;display:flex;align-items:center;gap:8px;font-family:var(--fs)}
.hbp:hover{background:var(--CK);box-shadow:0 8px 32px rgba(14,165,233,.4);transform:translateY(-2px)}
.hbo{padding:14px 26px;background:transparent;color:var(--N);border:1.5px solid var(--lbo2);border-radius:10px;font-size:15px;font-weight:500;cursor:pointer;transition:all .25s;font-family:var(--fs)}
.hbo:hover{border-color:var(--C);color:var(--CK)}

/* 3D HERO CARD */
.h3s{perspective:1200px;width:100%;max-width:540px}
.h3c{background:#fff;border-radius:20px;padding:22px;box-shadow:0 32px 80px rgba(15,45,94,.2),0 8px 24px rgba(15,45,94,.08),0 0 0 1px rgba(15,45,94,.06);transform-style:preserve-3d;transform:rotateX(6deg) rotateY(-8deg);transition:transform .12s ease-out;position:relative}
.fb{position:absolute;border-radius:12px;padding:9px 14px;background:white;box-shadow:0 8px 28px rgba(15,45,94,.16);border:1px solid var(--lbo);animation:fbf 3s ease-in-out infinite;z-index:10;font-size:11px;font-weight:600;white-space:nowrap}
@keyframes fbf{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}

/* TICKER */
.tk{background:var(--N);padding:13px 0;overflow:hidden}
.tkt{display:flex;width:max-content;animation:tkm 32s linear infinite}
.tki{display:flex;align-items:center;gap:10px;padding:0 36px;font-family:var(--fm);font-size:11.5px;color:rgba(255,255,255,.6);white-space:nowrap}
.tks{width:4px;height:4px;border-radius:50%;background:var(--C);opacity:.7}
@keyframes tkm{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* SECTION */
.sec{padding:clamp(56px,8vw,116px) clamp(16px,6vw,100px)}
.stag{display:inline-flex;align-items:center;gap:6px;font-family:var(--fm);font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--CK);margin-bottom:14px;padding:5px 12px;background:rgba(14,165,233,.07);border:1px solid rgba(14,165,233,.2);border-radius:100px}
.stitle{font-family:var(--fd);font-size:clamp(28px,4vw,48px);font-weight:900;line-height:1.1;color:var(--N);letter-spacing:-1px;margin-bottom:14px}
.ssub{font-size:16px;color:var(--lm);max-width:540px;line-height:1.7}

/* FEAT */
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:20px;max-width:1200px;margin:0 auto}
.fc{background:#fff;border:1px solid var(--lbo);border-radius:16px;padding:28px;cursor:pointer;transition:box-shadow .3s,border-color .3s,transform .15s ease-out;transform-style:preserve-3d;position:relative;overflow:hidden}
.fc:hover{box-shadow:0 20px 60px rgba(15,45,94,.12);border-color:rgba(14,165,233,.28)}
.fi{width:50px;height:50px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:16px}
.ftl{font-family:var(--fd);font-size:19px;font-weight:700;color:var(--N);margin-bottom:9px}
.fds{font-size:14px;color:var(--lm);line-height:1.7}

/* STATS */
.ss{background:var(--N);padding:clamp(50px,6vw,76px) clamp(16px,6vw,100px)}
.sg{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:40px;max-width:1100px;margin:0 auto;text-align:center}
.sn{font-family:var(--fd);font-size:clamp(34px,5vw,54px);font-weight:900;color:white;line-height:1;margin-bottom:7px}
.sn span{color:var(--C)}
.sl{font-size:13px;color:rgba(255,255,255,.5);font-weight:500;letter-spacing:.5px}

/* TESTI */
.tg{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:20px;max-width:1100px;margin:0 auto}
.tc{background:#fff;border:1px solid var(--lbo);border-radius:16px;padding:26px;transition:all .3s;transform-style:preserve-3d}
.tc:hover{box-shadow:0 16px 48px rgba(15,45,94,.1);transform:translateY(-4px)}

/* PRICING */
.pg{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:22px;max-width:1100px;margin:0 auto}
.pc{background:#fff;border:1.5px solid var(--lbo);border-radius:20px;padding:34px;position:relative;overflow:hidden;transition:all .3s;cursor:pointer;transform-style:preserve-3d}
.pc:hover{box-shadow:0 24px 64px rgba(15,45,94,.13);transform:translateY(-6px)}
.pc.pop{border-color:transparent;background:var(--N);color:white}
.pob{position:absolute;top:-1px;left:50%;transform:translateX(-50%);background:linear-gradient(90deg,var(--C),var(--IN));color:white;font-size:10px;font-weight:700;letter-spacing:2px;padding:5px 18px;border-radius:0 0 10px 10px;text-transform:uppercase;white-space:nowrap}
.pcta{width:100%;padding:13px;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;transition:all .25s;font-family:var(--fs)}
.pcta:hover{transform:translateY(-1px)}

/* CONTACT */
.cog{display:grid;grid-template-columns:1fr 1fr;gap:56px;max-width:1100px;margin:0 auto;align-items:center}
.coc{display:flex;align-items:center;gap:16px;padding:22px 26px;background:#fff;border:1px solid var(--lbo);border-radius:14px;margin-bottom:14px;transition:all .3s;text-decoration:none}
.coc:hover{box-shadow:0 12px 40px rgba(15,45,94,.1);border-color:rgba(14,165,233,.28);transform:translateX(4px)}
.coi{width:50px;height:50px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
.col{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--lm);font-family:var(--fm);margin-bottom:5px}
.cov{font-size:15px;font-weight:600;color:var(--N)}

/* CTA */
.cta{background:var(--N);padding:clamp(56px,8vw,110px) clamp(16px,6vw,100px);position:relative;overflow:hidden;text-align:center}
.cta::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 80% at 50% 0%,rgba(14,165,233,.18) 0%,transparent 70%)}
.ctat{font-family:var(--fd);font-size:clamp(30px,4.5vw,54px);font-weight:900;color:white;line-height:1.1;letter-spacing:-1px;margin-bottom:18px;position:relative}
.ctat em{font-style:italic;color:var(--C)}

/* FOOTER */
.ft{background:#060f1e;padding:60px clamp(16px,6vw,100px) 28px}
.ftop{display:grid;grid-template-columns:2.2fr 1fr 1fr 1fr;gap:44px;margin-bottom:44px}
.flink{display:block;font-size:13px;color:rgba(255,255,255,.48);margin-bottom:9px;cursor:pointer;transition:color .2s;border:none;background:none;font-family:var(--fs);text-align:left}
.flink:hover{color:var(--C)}
.fci{display:flex;align-items:center;gap:9px;font-size:12.5px;color:rgba(255,255,255,.48);margin-bottom:9px;font-family:var(--fm);text-decoration:none;transition:color .2s}
.fci:hover{color:var(--C)}

/* AUTH */
.ao{position:fixed;inset:0;background:rgba(10,33,73,.78);backdrop-filter:blur(12px);z-index:2000;display:flex;align-items:center;justify-content:center;padding:16px}
.am{background:#fff;border-radius:24px;overflow:hidden;width:100%;max-width:940px;max-height:92vh;overflow-y:auto;box-shadow:0 40px 100px rgba(10,33,73,.45);display:grid;grid-template-columns:1fr 1fr}
.aml{background:var(--N);padding:46px 38px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden}
.aml::before{content:'';position:absolute;top:-60px;right:-60px;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(14,165,233,.25),transparent)}
.amr{padding:44px 38px;position:relative}
.ac{position:absolute;top:14px;right:14px;background:none;border:none;font-size:16px;cursor:pointer;color:var(--lm);width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.ac:hover{background:var(--lb2)}
.atabs{display:flex;margin-bottom:20px;border:1.5px solid var(--lbo2);border-radius:10px;overflow:hidden}
.atab{flex:1;padding:9px;font-family:var(--fs);font-size:13px;font-weight:500;cursor:pointer;border:none;background:transparent;color:var(--lm);transition:all .2s}
.atab.on{background:var(--N);color:white;font-weight:600}
.ainp{width:100%;padding:11px 14px;background:var(--lb2);border:1.5px solid var(--lbo2);border-radius:10px;color:var(--lt);font-family:var(--fs);font-size:14px;outline:none;transition:all .2s}
.ainp:focus{border-color:var(--C);box-shadow:0 0 0 3px rgba(14,165,233,.1);background:#fff}
.ainp::placeholder{color:var(--lm);opacity:.65}
.abtn{width:100%;padding:13px;background:var(--N);border:none;border-radius:10px;color:white;font-family:var(--fs);font-size:14px;font-weight:700;cursor:pointer;transition:all .25s;margin-top:6px}
.abtn:hover{background:var(--CK);box-shadow:0 8px 24px rgba(14,165,233,.35);transform:translateY(-1px)}
.aerr{font-size:12px;color:#dc2626;margin-top:8px;padding:8px 12px;background:rgba(220,38,38,.06);border-radius:8px;border:1px solid rgba(220,38,38,.2)}
/* Google OAuth btn */
.gbtn{width:100%;padding:11px 14px;background:#fff;border:1.5px solid var(--lbo2);border-radius:10px;display:flex;align-items:center;justify-content:center;gap:10px;font-family:var(--fs);font-size:14px;font-weight:500;cursor:pointer;transition:all .2s;color:var(--lt);margin-bottom:10px}
.gbtn:hover{border-color:var(--C);box-shadow:0 2px 12px rgba(15,45,94,.08)}
.gdiv{display:flex;align-items:center;gap:12px;margin:14px 0;font-size:12px;color:var(--lm)}
.gdiv::before,.gdiv::after{content:'';flex:1;height:1px;background:var(--lbo2)}

/* DASHBOARD */
.dl{display:flex;min-height:100vh;background:var(--db);font-family:var(--fm)}
.sb{width:250px;flex-shrink:0;background:var(--db1);border-right:1px solid var(--dbo);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100}
.sbl{padding:16px 18px 13px;border-bottom:1px solid var(--dbo)}
.sbp{margin:10px 12px;padding:8px 12px;border-radius:6px;font-size:10px;letter-spacing:1px;text-transform:uppercase;font-weight:600;text-align:center;border:1px solid}
.sbn{flex:1;overflow-y:auto;padding:5px 0}
.sbsc{font-size:9px;letter-spacing:2px;color:var(--dm);text-transform:uppercase;padding:13px 20px 5px}
.ni{display:flex;align-items:center;gap:10px;padding:8px 20px;font-size:12px;color:var(--dm);cursor:pointer;transition:all .15s;position:relative;letter-spacing:.5px}
.ni:hover{color:var(--dt);background:rgba(34,211,238,.04)}
.ni.on{color:var(--dc);background:rgba(34,211,238,.08)}
.ni.on::before{content:'';position:absolute;left:0;top:4px;bottom:4px;width:2px;background:var(--dc);border-radius:0 2px 2px 0}
.ni .nb{margin-left:auto;font-size:9px;padding:2px 6px;background:rgba(239,68,68,.2);color:#f87171;border-radius:10px;font-weight:600}
.ni.lkd{opacity:.28;cursor:not-allowed}
.ni.lkd:hover{background:none;color:var(--dm)}
.sbf{padding:13px 18px;border-top:1px solid var(--dbo)}
.sbci{display:flex;align-items:center;gap:6px;font-size:10px;color:var(--dm);margin-bottom:6px;text-decoration:none;transition:color .2s}
.sbci:hover{color:var(--dc)}
.lgb{width:100%;padding:8px;background:transparent;border:1px solid var(--dbo);border-radius:4px;color:var(--dm);font-size:10px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;transition:all .2s;margin-top:8px}
.lgb:hover{border-color:#ef4444;color:#f87171;background:rgba(239,68,68,.05)}
.dm{margin-left:250px;flex:1;min-height:100vh}
.tb{height:55px;background:var(--db1);border-bottom:1px solid var(--dbo);display:flex;align-items:center;padding:0 22px;gap:12px;position:sticky;top:0;z-index:50}
.tbt{font-family:var(--fd);font-size:15px;font-weight:700;flex:1;color:var(--dt)}
.tpl{display:flex;align-items:center;gap:7px;padding:5px 11px;border-radius:4px}
.tdot{width:6px;height:6px;border-radius:50%;animation:dlp 1.5s infinite}
@keyframes dlp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.4)}}
.ub{padding:6px 12px;background:transparent;border:1px solid;border-radius:4px;font-size:11px;cursor:pointer;transition:all .2s;font-family:var(--fm)}
.dcc{padding:22px}
.pn{background:var(--db1);border:1px solid var(--dbo);border-radius:10px;overflow:hidden;margin-bottom:18px}
.ph{padding:14px 20px;border-bottom:1px solid var(--dbo);display:flex;align-items:center;justify-content:space-between}
.pt{font-family:var(--fd);font-size:13px;font-weight:700;display:flex;align-items:center;gap:8px;color:var(--dt)}
.pb{padding:14px 20px}
.kg{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:13px;margin-bottom:20px}
.kc{background:var(--db1);border:1px solid var(--dbo);border-radius:10px;padding:16px;position:relative;overflow:hidden}
.kc:hover{border-color:var(--dbo2)}
.kl{font-size:10px;letter-spacing:2px;color:var(--dm);text-transform:uppercase;margin-bottom:9px}
.kv{font-family:var(--fd);font-size:30px;font-weight:900;line-height:1;margin-bottom:5px}
.kd{font-size:10px;color:var(--dm)}
.kd.up{color:#f87171}.kd.dn{color:#4ade80}
.ki{position:absolute;top:13px;right:13px;font-size:17px;opacity:.28}
.kbd{position:absolute;bottom:0;left:0;right:0;height:2px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px}
.g3{display:grid;grid-template-columns:2fr 1fr;gap:14px;margin-bottom:18px}
@media(max-width:900px){.g2,.g3{grid-template-columns:1fr}}
.ar{display:flex;align-items:flex-start;gap:9px;padding:10px 0;border-bottom:1px solid var(--dbo)}
.ar:last-child{border-bottom:none}
.sbg{font-size:9px;font-weight:700;letter-spacing:1px;padding:3px 7px;border-radius:3px;border:1px solid;flex-shrink:0;text-transform:uppercase;margin-top:1px}
.am{font-size:12px;color:var(--dt);line-height:1.4}
.amt{font-size:10px;color:var(--dm);margin-top:3px}
.ps{max-height:350px;overflow-y:auto;padding:0 20px}
.dt{width:100%;border-collapse:collapse;font-size:12px}
.dt th{padding:7px 11px;text-align:left;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--dm);border-bottom:1px solid var(--dbo);font-weight:500}
.dt td{padding:9px 11px;border-bottom:1px solid rgba(34,211,238,.04);vertical-align:middle;color:var(--dt)}
.dt tr:last-child td{border-bottom:none}
.dt tr:hover td{background:rgba(34,211,238,.02)}
.hn{color:var(--dc);font-weight:500}

/* SCANNER */
.scan-wrap{background:var(--db2);border:1px solid var(--dbo2);border-radius:12px;padding:24px;margin-bottom:16px}
.scan-progress-bar{height:6px;background:var(--dbo);border-radius:3px;overflow:hidden;margin:12px 0}
.scan-progress-fill{height:100%;border-radius:3px;transition:width .5s ease;background:linear-gradient(90deg,var(--dc),#818cf8)}
.scan-phase{font-size:11px;color:var(--dm);font-family:var(--fm);letter-spacing:.5px;min-height:18px}
.scan-phase .cursor{display:inline-block;width:6px;height:12px;background:var(--dc);animation:cur .7s infinite;vertical-align:middle;margin-left:4px;border-radius:1px}
@keyframes cur{0%,100%{opacity:1}50%{opacity:0}}
.risk-ring{display:flex;flex-direction:column;align-items:center;justify-content:center;width:120px;height:120px;border-radius:50%;border:6px solid;position:relative}
.risk-score{font-family:var(--fd);font-size:32px;font-weight:900;line-height:1}
.risk-lbl{font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-top:3px}
.vuln-row{display:flex;align-items:flex-start;gap:10px;padding:11px 0;border-bottom:1px solid var(--dbo)}
.vuln-row:last-child{border-bottom:none}
.vuln-app{font-size:12px;color:var(--dc);font-weight:500}
.vuln-desc{font-size:11px;color:var(--dm);margin-top:3px}
.app-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--dbo);font-size:12px}
.app-row:last-child{border-bottom:none}
.app-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.device-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.device-row{display:flex;justify-content:space-between;padding:8px 12px;background:var(--db2);border-radius:8px;border:1px solid var(--dbo);font-size:12px}

/* FG */
.fgate{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:55vh;gap:14px;text-align:center}
.fgate-icon{font-size:52px;opacity:.25}
.fgate-title{font-family:var(--fd);font-size:22px;font-weight:800;color:var(--dm)}
.fgate-sub{font-size:13px;color:var(--dm);max-width:380px;line-height:1.6}
.fgate-btn{padding:11px 22px;background:var(--dc);border:none;border-radius:6px;color:#000;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;margin-top:4px}

/* REVEAL */
.rv{opacity:0;transform:translateY(26px);transition:opacity .6s ease,transform .6s ease}
.rv.vis{opacity:1;transform:translateY(0)}
.rv1{transition-delay:.1s}.rv2{transition-delay:.2s}.rv3{transition-delay:.3s}

/* RESPONSIVE */
@media(max-width:768px){
  .hero{grid-template-columns:1fr;padding-top:88px}
  .hero-right,.how-vis{display:none}
  .nav-links,.nbg{display:none}
  .ftop{grid-template-columns:1fr 1fr}
  .am{grid-template-columns:1fr}.aml{display:none}
  .cog{grid-template-columns:1fr}
  .sb{transform:translateX(-100%)}.sb.open{transform:translateX(0)}
  .dm{margin-left:0}
}
@media(max-width:480px){
  .ftop{grid-template-columns:1fr}
  .pg,.tg,.fg{grid-template-columns:1fr}
  .device-grid{grid-template-columns:1fr}
}
`;

/* ════════════════════════════════════════════════════════════════
   🔧  HELPERS
════════════════════════════════════════════════════════════════ */
const SEV = {
  CRITICAL: { bg: "rgba(239,68,68,.12)", text: "#dc2626", border: "rgba(239,68,68,.32)" },
  HIGH: { bg: "rgba(249,115,22,.12)", text: "#ea580c", border: "rgba(249,115,22,.32)" },
  MEDIUM: { bg: "rgba(234,179,8,.12)", text: "#ca8a04", border: "rgba(234,179,8,.32)" },
  LOW: { bg: "rgba(14,165,233,.1)", text: "#0284c7", border: "rgba(14,165,233,.28)" },
  CLEAN: { bg: "rgba(22,163,74,.1)", text: "#16a34a", border: "rgba(22,163,74,.28)" },
  OPEN: { bg: "rgba(239,68,68,.1)", text: "#dc2626", border: "rgba(239,68,68,.28)" },
  PATCHED: { bg: "rgba(22,163,74,.1)", text: "#16a34a", border: "rgba(22,163,74,.28)" },
  PATCHING: { bg: "rgba(249,115,22,.1)", text: "#f97316", border: "rgba(249,115,22,.28)" },
};
const sc = s => SEV[s] || { bg: "rgba(100,116,139,.1)", text: "#64748b", border: "rgba(100,116,139,.2)" };
const TT = { background: "#0f1824", border: "1px solid rgba(34,211,238,.2)", borderRadius: 6, fontSize: 11, fontFamily: "IBM Plex Mono,monospace" };

function SBadge({ s }) { const c = sc(s); return <div className="sbg" style={{ background: c.bg, color: c.text, borderColor: c.border }}>{s}</div>; }
function LiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return <span style={{ fontFamily: "var(--fm)", fontSize: 10, color: "var(--dm)" }}>{t.toUTCString().slice(0, -4)} UTC</span>;
}
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".rv");
    const obs = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) e.target.classList.add("vis"); }); }, { threshold: .12 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}
function useTilt(ref) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const mv = e => { const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5; const y = (e.clientY - r.top) / r.height - .5; el.style.transform = `perspective(1000px) rotateY(${x * 13}deg) rotateX(${-y * 9}deg)`; };
    const lv = () => { el.style.transform = ""; };
    el.addEventListener("mousemove", mv); el.addEventListener("mouseleave", lv);
    return () => { el.removeEventListener("mousemove", mv); el.removeEventListener("mouseleave", lv); };
  }, []);
}
function useHero3D(ref) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const mv = e => { const cx = window.innerWidth / 2, cy = window.innerHeight / 2; const dx = (e.clientX - cx) / cx, dy = (e.clientY - cy) / cy; el.style.transform = `rotateX(${6 - dy * 5}deg) rotateY(${-8 + dx * 6}deg)`; };
    window.addEventListener("mousemove", mv);
    return () => window.removeEventListener("mousemove", mv);
  }, []);
}
function useCounter(target, dur = 1800) {
  const [c, setC] = useState(0); const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; let s = 0; const step = target / (dur / 16);
      const t = setInterval(() => { s = Math.min(s + step, target); setC(Math.floor(s)); if (s >= target) clearInterval(t); }, 16); obs.disconnect();
    }, { threshold: .3 });
    obs.observe(el); return () => obs.disconnect();
  }, [target, dur]);
  return [c, ref];
}
function TiltCard({ children, cls, style, onClick }) {
  const ref = useRef(null); useTilt(ref);
  return <div ref={ref} className={cls} style={{ ...style, transition: "transform .15s ease-out,box-shadow .3s,border-color .3s" }} onClick={onClick}>{children}</div>;
}
function AnimStat({ val, suffix, label }) {
  const [c, ref] = useCounter(val);
  return <div ref={ref} style={{ textAlign: "center" }}><div className="sn">{c.toLocaleString()}<span>{suffix}</span></div><div className="sl">{label}</div></div>;
}

/* ════════════════════════════════════════════════════════════════
   🃏  HERO CARD
════════════════════════════════════════════════════════════════ */
function HeroCard() {
  const ref = useRef(null); useHero3D(ref);
  const mini = [4, 7, 3, 9, 5, 8, 6, 4, 7, 9, 5, 3];
  return (
    <div className="h3s">
      <div className="h3c" ref={ref}>
        <div className="fb" style={{ top: -15, left: -18, animationDelay: "0s", fontSize: 11 }}><span style={{ color: "#16a34a", marginRight: 5 }}>●</span>247 Devices Online</div>
        <div className="fb" style={{ bottom: -13, right: -15, animationDelay: "1.3s", fontSize: 11 }}>🛡 1,204 Attacks Blocked</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Logo size={20} />
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 600, color: "#dc2626", fontFamily: "var(--fm)" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#ef4444", animation: "blink 1.5s infinite" }} />THREAT: HIGH
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9, marginBottom: 16 }}>
          {[{ l: "Threats", v: "75", c: "#dc2626" }, { l: "CVEs", v: "34", c: "#ea580c" }, { l: "Score", v: "72", c: "#0284c7" }].map(k => (
            <div key={k.l} style={{ background: "#f5f8ff", border: "1px solid rgba(15,45,94,.09)", borderRadius: 9, padding: 11 }}>
              <div style={{ fontSize: 8, letterSpacing: 1.5, textTransform: "uppercase", color: "#64748b", marginBottom: 5, fontFamily: "var(--fm)" }}>{k.l}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: k.c }}>{k.v}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 72, marginBottom: 14 }}>
          <ResponsiveContainer width="100%" height={72}>
            <AreaChart data={mini.map((v, i) => ({ i, v }))}>
              <defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={.22} /><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} /></linearGradient></defs>
              <Area type="monotone" dataKey="v" stroke="#0ea5e9" fill="url(#hg)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {[{ sev: "CRITICAL", msg: "Brute force — prod-db-01", c: "#dc2626" }, { sev: "HIGH", msg: "Lateral movement detected", c: "#ea580c" }, { sev: "MEDIUM", msg: "Anomalous DNS query", c: "#ca8a04" }].map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 9px", borderRadius: 7, border: `1px solid ${a.c}28`, background: `${a.c}09`, marginBottom: 5, fontSize: 11 }}>
            <span style={{ fontFamily: "var(--fm)", fontSize: 9, fontWeight: 700, color: a.c }}>{a.sev}</span>
            <span style={{ flex: 1, color: "#334155" }}>{a.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   🧭  NAVBAR
════════════════════════════════════════════════════════════════ */
function Navbar({ onSignIn, onStart, scrollTo }) {
  const [sol, setSol] = useState(false);
  useEffect(() => { const h = () => setSol(window.scrollY > 20); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  return (
    <nav className={`nav${sol ? " sol" : ""}`}>
      <Logo size={28} />
      <div className="nav-links">
        {["Features", "Pricing", "Contact"].map(l => (
          <button key={l} className="nl" onClick={() => scrollTo(l.toLowerCase())}>{l}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 9, marginLeft: "auto" }}>
        <button className="nbg" onClick={onSignIn}>Sign In</button>
        <button className="nbf" onClick={onStart}>Get Started</button>
      </div>
    </nav>
  );
}

/* ════════════════════════════════════════════════════════════════
   🏠  LANDING
════════════════════════════════════════════════════════════════ */
function Landing({ onSignIn, onStart }) {
  useReveal();
  const [step, setStep] = useState(0);
  const scrollTo = id => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth" }); };
  const feats = [
    { icon: "⚡", c: "#0ea5e9", bg: "rgba(14,165,233,.1)", title: "Real-Time Detection", desc: "Sub-2ms alert latency across every endpoint, network segment, and cloud workload with ML-powered analysis." },
    { icon: "🔍", c: B.navyLt, bg: "rgba(30,58,110,.1)", title: "Vulnerability Management", desc: "Continuous CVE scanning with CVSS scoring, automated triage, and integrated patch management workflows." },
    { icon: "🧠", c: "#f59e0b", bg: "rgba(245,158,11,.1)", title: "AI Threat Hunting", desc: "Proactive threat hunting using AI-powered hypothesis generation correlating billions of signals." },
    { icon: "🛡", c: "#16a34a", bg: "rgba(22,163,74,.1)", title: "Incident Response", desc: "Automated SOAR playbooks, timeline reconstruction, and forensic analysis — built-in." },
    { icon: "⬡", c: "#dc2626", bg: "rgba(220,38,38,.1)", title: "Device Security Scan", desc: "Auto-detect every device, scan installed apps, identify CVEs, run virus signatures — by package tier." },
    { icon: "🌐", c: "#0891b2", bg: "rgba(8,145,178,.1)", title: "Network Intelligence", desc: "Deep packet inspection, east-west traffic analysis, encrypted traffic classification, zero-trust enforcement." },
  ];
  const steps = [
    { n: "01", title: "Sign Up & Connect OAuth", desc: "Create your account via email or Google OAuth. Packages determine scan depth.", c: "#0ea5e9" },
    { n: "02", title: "Auto Device Detection", desc: "Dashboard auto-detects your IP, OS, hostname, and username on every login.", c: B.navyLt },
    { n: "03", title: "Scan & Score", desc: "Run package-based scans: CVE check, virus scan, installed app audit. Risk score auto-calculated.", c: "#f59e0b" },
    { n: "04", title: "Monitor & Respond", desc: "Alerts, playbooks, and SIEM dashboards close the loop in minutes.", c: "#16a34a" },
  ];
  const testis = [
    { q: "SentraSec reduced our MTTD from 4 hours to under 3 minutes. The Fortress plan's AI analyst is like having a tier-3 SOC engineer embedded in our team.", name: "Sarah K.", role: "CISO, FinTech Unicorn", init: "SK", bg: "#0ea5e9" },
    { q: "The device auto-detection feature is incredible. The moment our analysts log in, SentraSec maps their device, scans for CVEs, and flags risk — instantly.", name: "Marcus T.", role: "VP Security Engineering", init: "MT", bg: B.navyLt },
    { q: "After a ransomware incident, we moved to Fortress. The AI threat hunting and SOAR playbooks alone saved us from two more incidents in the first month.", name: "Priya N.", role: "Security Operations Manager", init: "PN", bg: "#f59e0b" },
  ];

  return (
    <div style={{ minHeight: "100vh", overflowX: "hidden", background: "var(--lb)" }}>
      <Navbar onSignIn={onSignIn} onStart={onStart} scrollTo={scrollTo} />

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hgrid" />
        <div>
          <div className="eyeb rv"><div className="edot" />Enterprise SOC Platform</div>
          <h1 className="h1 rv rv1">Defend Every<br /><em>Attack Surface</em><br />In Real Time.</h1>
          <p className="hp rv rv2">SentraSec auto-detects every device on login, runs package-based vulnerability and virus scans, and gives your team centralized security intelligence.</p>
          <div className="hacts rv rv3">
            <button className="hbp" onClick={onStart}>Start Free Trial →</button>
            <button className="hbo" onClick={onSignIn}>Sign In to Dashboard</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 30 }} className="rv rv3">
            <div style={{ display: "flex" }}>
              {["AM", "JL", "SR", "PK"].map((i, idx) => (
                <div key={idx} style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid white", marginLeft: idx ? -8 : 0, background: `linear-gradient(135deg,${["#0ea5e9", "#6366f1", "#f59e0b", "#0f2d5e"][idx]},${["#38bdf8", "#818cf8", "#fbbf24", "#1e3a6e"][idx]})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "white" }}>{i}</div>
              ))}
            </div>
            <span style={{ fontSize: 12, color: "var(--lm)", fontWeight: 500 }}>Trusted by <strong>2,400+</strong> enterprise security teams</span>
          </div>
        </div>
        <div className="rv rv2" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><HeroCard /></div>
      </section>

      {/* TICKER */}
      <div className="tk">
        <div className="tkt">
          {[...Array(2)].map((_, r) => (
            ["Centralized Security Intelligence", "ISO 27001", "SOC 2 Type II", "GDPR Compliant", "Auto Device Detection", "AI Threat Hunting", "Zero-Trust Ready", "HIPAA", "FedRAMP Ready", "Package-Based Scanning", "24/7 Expert Support", "99.99% SLA"].map((t, i) => (
              <div key={`${r}-${i}`} className="tki"><div className="tks" />{t}</div>
            ))
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="sec" id="features" style={{ background: "#fff" }}>
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 56px" }}>
          <div className="stag rv">◈ Platform Capabilities</div>
          <h2 className="stitle rv rv1">Everything your SOC needs.</h2>
          <p className="ssub rv rv2" style={{ margin: "0 auto" }}>From auto device detection to AI threat hunting — one unified platform.</p>
        </div>
        <div className="fg">
          {feats.map((f, i) => (
            <TiltCard key={f.title} cls={`fc rv rv${(i % 3) + 1}`}>
              <div className="fi" style={{ background: f.bg }}>{f.icon}</div>
              <div className="ftl">{f.title}</div>
              <div className="fds">{f.desc}</div>
              <button style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 12, fontSize: 13, fontWeight: 600, color: f.c, border: "none", background: "none", cursor: "pointer" }}>Learn more →</button>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* STATS */}
      <div className="ss">
        <div style={{ textAlign: "center", marginBottom: 28 }}><Logo size={30} light tag /></div>
        <div className="sg">
          <AnimStat val={2400} suffix="+" label="Enterprise Clients" />
          <AnimStat val={2400000000} suffix="+" label="Events / Day" />
          <AnimStat val={99} suffix=".99%" label="Uptime SLA" />
          <AnimStat val={2} suffix="min" label="Mean Time to Detect" />
          <AnimStat val={1200} suffix="+" label="Signatures Updated / Day" />
        </div>
      </div>

      {/* HOW */}
      <section className="sec" id="how" style={{ background: "var(--lb)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, maxWidth: 1200, margin: "0 auto", alignItems: "center" }}>
          <div>
            <div className="stag rv">⟁ How It Works</div>
            <h2 className="stitle rv rv1">From sign-up to<br />protected in 60 minutes.</h2>
            <p className="ssub rv rv2" style={{ marginBottom: 32 }}>SentraSec is operational from day one — OAuth login, device auto-detection, and instant scanning.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {steps.map((s, i) => (
                <div key={s.n} onClick={() => setStep(i)} className={`rv rv${i + 1}`}
                  style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: 18, borderRadius: 14, border: `1px solid ${step === i ? B.C + "44" : "transparent"}`, background: step === i ? "#fff" : "transparent", boxShadow: step === i ? "0 8px 32px rgba(15,45,94,.08)" : "none", cursor: "pointer", transition: "all .3s" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.c}14`, color: s.c, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--fm)", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{s.n}</div>
                  <div>
                    <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 700, color: B.navy, marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: "var(--lm)", lineHeight: 1.6 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rv rv2 how-vis" style={{ perspective: 1000 }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 32px 80px rgba(15,45,94,.14)", transform: "rotateY(-6deg) rotateX(3deg)", border: "1px solid var(--lbo)", transition: "transform .5s" }}>
              <div style={{ fontFamily: "var(--fm)", fontSize: 10, letterSpacing: 2, color: "var(--lm)", textTransform: "uppercase", marginBottom: 14 }}>Step {steps[step].n} — {steps[step].title}</div>
              <div style={{ background: `${steps[step].c}0c`, border: `1px solid ${steps[step].c}30`, borderRadius: 12, padding: 22, marginBottom: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 10, color: steps[step].c }}>{["🔐", "🖥", "🔬", "⚡"][step]}</div>
                <div style={{ fontFamily: "var(--fd)", fontSize: 17, fontWeight: 700, color: B.navy, marginBottom: 7 }}>{steps[step].title}</div>
                <div style={{ fontSize: 13, color: "var(--lm)", lineHeight: 1.7 }}>{steps[step].desc}</div>
              </div>
              <ResponsiveContainer width="100%" height={90}>
                <AreaChart data={Array.from({ length: 10 }, (_, i) => ({ i, v: Math.floor(Math.random() * 60 + 20) }))}>
                  <defs><linearGradient id="hwg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={steps[step].c} stopOpacity={.2} /><stop offset="95%" stopColor={steps[step].c} stopOpacity={0} /></linearGradient></defs>
                  <Area type="monotone" dataKey="v" stroke={steps[step].c} fill="url(#hwg)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* TESTI */}
      <section className="sec" style={{ background: "var(--lb2)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="stag rv" style={{ justifyContent: "center" }}>◉ Customer Stories</div>
            <h2 className="stitle rv rv1" style={{ textAlign: "center" }}>Trusted by teams defending<br />the world's critical infrastructure.</h2>
          </div>
          <div className="tg">
            {testis.map((t, i) => (
              <TiltCard key={i} cls={`tc rv rv${i + 1}`}>
                <div style={{ color: "#f59e0b", fontSize: 13, marginBottom: 12, letterSpacing: 1 }}>★★★★★</div>
                <div style={{ fontSize: 14, color: B.navyLt, lineHeight: 1.75, marginBottom: 18, fontStyle: "italic" }}>"{t.q}"</div>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "white", flexShrink: 0 }}>{t.init}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: B.navy }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "var(--lm)" }}>{t.role}</div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="sec" id="pricing" style={{ background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="stag rv" style={{ justifyContent: "center" }}>◈ Pricing</div>
            <h2 className="stitle rv rv1" style={{ textAlign: "center" }}>Choose your protection level.</h2>
            <p className="ssub rv rv2" style={{ textAlign: "center", margin: "0 auto" }}>Every plan includes auto device detection. Scan depth and features grow with your tier.</p>
          </div>
          <PkgCards onSelect={onStart} />
        </div>
      </section>

      {/* CONTACT */}
      <section className="sec" id="contact" style={{ background: "var(--lb2)" }}>
        <div className="cog">
          <div>
            <div className="stag rv">✉ Get In Touch</div>
            <h2 className="stitle rv rv1">We're here to help<br />secure your business.</h2>
            <p className="ssub rv rv2" style={{ marginBottom: 28 }}>Questions about deployment, pricing, or compliance? Our security experts are ready to help 24/7.</p>
            <div className="rv rv2"><Logo size={32} tag /></div>
          </div>
          <div className="rv rv3">
            {[[`mailto:${B.email}`, "✉️", "rgba(14,165,233,.1)", "Email Us", B.email], [`tel:${B.phone.replace(/ /g, "")}`, "📱", "rgba(15,45,94,.08)", "Call / WhatsApp", B.phone], ["#", "📍", "rgba(245,158,11,.1)", "Headquarters", "Dubai, United Arab Emirates"]].map(([href, icon, bg, label, val]) => (
              <a key={label} href={href} className="coc">
                <div className="coi" style={{ background: bg }}>{icon}</div>
                <div><div className="col">{label}</div><div className="cov">{val}</div></div>
              </a>
            ))}
            <div style={{ marginTop: 16, padding: 14, background: "rgba(14,165,233,.05)", border: "1px solid rgba(14,165,233,.18)", borderRadius: 12, fontSize: 13, color: "var(--lm)", lineHeight: 1.7 }}>
              ⏱ &lt;2h response during business hours (GST UTC+4). Critical incidents: 24/7 coverage.
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div style={{ position: "relative" }}>
          <div style={{ marginBottom: 24 }}><Logo size={34} light tag /></div>
          <h2 className="ctat">Ready to secure your<br /><em>entire attack surface?</em></h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.6)", maxWidth: 500, margin: "0 auto 36px", lineHeight: 1.7, position: "relative" }}>Join 2,400+ enterprise teams. Auto device detection, package-based scanning, and real-time threat intelligence — starting day one.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
            <button onClick={onStart} style={{ padding: "15px 36px", background: B.cyan, border: "none", borderRadius: 10, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", transition: "all .25s", fontFamily: "var(--fs)" }}>Start Free Trial</button>
            <button onClick={onSignIn} style={{ padding: "15px 28px", background: "transparent", border: "1.5px solid rgba(255,255,255,.25)", borderRadius: 10, color: "white", fontSize: 15, fontWeight: 500, cursor: "pointer", transition: "all .25s", fontFamily: "var(--fs)" }}>View Live Demo</button>
          </div>
          <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap", position: "relative" }}>
            {[[`mailto:${B.email}`, B.email], [`tel:${B.phone.replace(/ /g, "")}`, B.phone]].map(([h, v]) => (
              <a key={v} href={h} style={{ fontSize: 12, color: "rgba(255,255,255,.45)", fontFamily: "var(--fm)", textDecoration: "none" }}>{v}</a>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ft">
        <div className="ftop">
          <div>
            <Logo size={28} light />
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", lineHeight: 1.7, maxWidth: 270, marginTop: 11 }}>{B.tagline}. Enterprise-grade security for teams that can't afford to be breached.</div>
            <div style={{ marginTop: 18 }}>
              {[[`mailto:${B.email}`, "✉", B.email], [`tel:${B.phone.replace(/ /g, "")}`, "📱", B.phone], ["#", "📍", "Dubai, UAE"]].map(([h, ic, v]) => (
                <a key={v} href={h} className="fci"><span>{ic}</span>{v}</a>
              ))}
            </div>
          </div>
          {[
            { title: "Platform", links: ["Overview", "Threat Detection", "Vulnerability Mgmt", "Device Scanning", "Incident Response", "Integrations"] },
            { title: "Solutions", links: ["Enterprise", "Financial Services", "Healthcare", "Government", "SaaS Companies", "Mid-Market"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Security", "Privacy Policy", "Terms of Service"] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,.42)", marginBottom: 14, fontWeight: 600 }}>{col.title}</div>
              {col.links.map(l => <button key={l} className="flink">{l}</button>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>© 2026 SentraSec, Inc. All rights reserved.</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.22)", fontFamily: "var(--fm)", letterSpacing: .5 }}>{B.tagline}</div>
        </div>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   💳  PACKAGE CARDS
════════════════════════════════════════════════════════════════ */
function PkgCards({ onSelect }) {
  return (
    <div className="pg">
      {PKGS.map((pkg, i) => (
        <TiltCard key={pkg.id} cls={`pc rv rv${i + 1} ${pkg.popular ? "pop" : ""}`} onClick={() => onSelect && onSelect(pkg.id)}>
          {pkg.popular && <div className="pob">Most Popular</div>}
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 16 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: pkg.popular ? "rgba(255,255,255,.12)" : `${pkg.color}14`, color: pkg.popular ? "white" : pkg.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              {pkg.id === "sentinel" ? "🛡" : pkg.id === "guardian" ? "🔮" : "🏰"}
            </div>
            <div>
              <div style={{ fontFamily: "var(--fd)", fontSize: 21, fontWeight: 900, color: pkg.popular ? "white" : pkg.color }}>{pkg.name}</div>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", opacity: .55 }}>{pkg.tier}</div>
            </div>
          </div>
          <div style={{ marginBottom: 7 }}>
            <span style={{ fontFamily: "var(--fd)", fontSize: 46, fontWeight: 900, color: pkg.popular ? "white" : pkg.color }}>${pkg.price.toLocaleString()}</span>
            <span style={{ fontSize: 13, opacity: .55 }}>/mo</span>
          </div>
          <div style={{ fontSize: 12, color: pkg.popular ? "rgba(255,255,255,.65)" : "var(--lm)", marginBottom: 6, lineHeight: 1.6 }}>{pkg.desc}</div>
          <div style={{ fontSize: 11, color: pkg.popular ? "rgba(255,255,255,.5)" : B.cyanDk, fontFamily: "var(--fm)", marginBottom: 16, padding: "5px 9px", background: pkg.popular ? "rgba(255,255,255,.07)" : "rgba(14,165,233,.07)", borderRadius: 6, border: `1px solid ${pkg.popular ? "rgba(255,255,255,.12)" : "rgba(14,165,233,.2)"}` }}>
            🔬 Scan depth: <strong>{pkg.scanDepth}</strong> · {pkg.maxEndpoints >= 99999 ? "Unlimited" : pkg.maxEndpoints} endpoints · {pkg.logDays}d logs
          </div>
          <div style={{ height: 1, background: "currentColor", opacity: .08, marginBottom: 14 }} />
          <ul style={{ listStyle: "none", marginBottom: 22 }}>
            {pkg.features.map(f => (
              <li key={f} style={{ fontSize: 13, padding: "4px 0", display: "flex", gap: 8, color: pkg.popular ? "rgba(255,255,255,.88)" : undefined }}>
                <span style={{ color: pkg.popular ? "#4ade80" : "#16a34a", fontWeight: 700, flexShrink: 0 }}>✓</span><span>{f}</span>
              </li>
            ))}
            {pkg.locked.map(f => (
              <li key={f} style={{ fontSize: 13, padding: "4px 0", display: "flex", gap: 8, opacity: .32 }}>
                <span style={{ flexShrink: 0 }}>✗</span><span>{f}</span>
              </li>
            ))}
          </ul>
          <button className="pcta" style={{ background: pkg.popular ? "white" : pkg.color, color: pkg.popular ? pkg.color : "white", boxShadow: `0 4px 20px ${pkg.color}30` }}>
            Get Started with {pkg.name} →
          </button>
        </TiltCard>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   🔐  AUTH MODAL  (with Google OAuth)
════════════════════════════════════════════════════════════════ */
function AuthModal({ onAuth, onClose }) {
  const [tab, setTab] = useState("signin");
  const [f, setF] = useState({ email: "", password: "", name: "", confirm: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthReady, setOauthReady] = useState(false);
  const gBtnRef = useRef(null);

  // Load Google GSI & EmailJS
  useEffect(() => {
    // EmailJS
    if (!window.emailjs) {
      const s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
      s.onload = () => window.emailjs?.init(CFG.EMAILJS_KEY); document.head.appendChild(s);
    }
    // Google GSI
    const gs = document.createElement("script");
    gs.src = "https://accounts.google.com/gsi/client"; gs.async = true; gs.defer = true;
    gs.onload = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: CFG.GOOGLE_CLIENT_ID,
        callback: (response) => {
          // Decode JWT for user info
          try {
            const payload = JSON.parse(atob(response.credential.split(".")[1]));
            const gUser = { name: payload.name, email: payload.email, role: "Security Analyst", pkg: null, isNew: true, avatar: payload.picture };
            onAuth(gUser);
          } catch (e) { setErr("Google sign-in failed. Please use email/password."); }
        },
        auto_select: false,
      });
      if (gBtnRef.current) {
        window.google.accounts.id.renderButton(gBtnRef.current, { theme: "outline", size: "large", text: "continue_with", shape: "rectangular", width: 340 });
      }
      setOauthReady(true);
    };
    document.head.appendChild(gs);
    return () => { };
  }, []);

  const upd = k => e => setF(p => ({ ...p, [k]: e.target.value }));
  const signIn = () => {
    const u = DEMO_USERS.find(u => u.email === f.email && u.password === f.password);
    if (!u) { setErr("Invalid credentials — try admin@sentrasec.io / demo123"); return; }
    setErr(""); onAuth(u);
  };
  const signUp = async () => {
    if (!f.name || !f.email || !f.password) { setErr("All fields required"); return; }
    if (f.password !== f.confirm) { setErr("Passwords do not match"); return; }
    setLoading(true); setErr("");
    const newUser = { email: f.email, name: f.name, role: "Security Analyst", pkg: null, isNew: true };
    onAuth(newUser);
    setLoading(false);
  };

  return (
    <div className="ao" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="am">
        {/* Left brand panel */}
        <div className="aml">
          <Logo size={28} light tag />
          <div style={{ fontSize: 14, color: "rgba(255,255,255,.55)", lineHeight: 1.75, marginTop: 24, maxWidth: 260 }}>
            Auto device detection, package-based scanning, and real-time threat intelligence on every login.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginTop: 20 }}>
            {[["99.99%", "Uptime SLA"], ["&lt;2ms", "Alert Latency"], ["2.4B+", "Events/Day"], ["ISO 27001", "Certified"]].map(([n, l]) => (
              <div key={l} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 9, padding: 13 }}>
                <div style={{ fontFamily: "var(--fd)", fontSize: 20, fontWeight: 900, color: B.cyan }} dangerouslySetInnerHTML={{ __html: n }} />
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.38)", textTransform: "uppercase", letterSpacing: 1, marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,.1)" }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,.32)", marginBottom: 9, fontFamily: "var(--fm)" }}>Support</div>
            <a href={`mailto:${B.email}`} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "rgba(255,255,255,.5)", fontFamily: "var(--fm)", textDecoration: "none", marginBottom: 7 }}>✉ {B.email}</a>
            <a href={`tel:${B.phone.replace(/ /g, "")}`} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "rgba(255,255,255,.5)", fontFamily: "var(--fm)", textDecoration: "none" }}>📱 {B.phone}</a>
          </div>
        </div>

        {/* Right form */}
        <div className="amr">
          <button className="ac" onClick={onClose}>✕</button>
          <div style={{ fontFamily: "var(--fd)", fontSize: 25, fontWeight: 800, color: B.navy, marginBottom: 5 }}>
            {tab === "signin" ? "Welcome back" : "Create account"}
          </div>
          <div style={{ fontSize: 13, color: "var(--lm)", marginBottom: 22 }}>
            {tab === "signin" ? "Sign in to your SOC dashboard" : "Start your 14-day free trial"}
          </div>

          {/* Google OAuth button */}
          <div ref={gBtnRef} style={{ marginBottom: 6, minHeight: 44 }} />
          {!oauthReady && (
            <button className="gbtn" style={{ cursor: "not-allowed", opacity: .7 }}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" fill="#4285F4" /><path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" fill="#34A853" /><path d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z" fill="#FBBC05" /><path d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z" fill="#EA4335" /></svg>
              Continue with Google
            </button>
          )}

          <div className="gdiv">or continue with email</div>

          <div className="atabs">
            <button className={`atab ${tab === "signin" ? "on" : ""}`} onClick={() => { setTab("signin"); setErr("") }}>Sign In</button>
            <button className={`atab ${tab === "signup" ? "on" : ""}`} onClick={() => { setTab("signup"); setErr("") }}>Sign Up</button>
          </div>

          {tab === "signup" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--lm)", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 600 }}>Full Name</label>
              <input className="ainp" placeholder="Jane Smith" value={f.name} onChange={upd("name")} />
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--lm)", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 600 }}>Email Address</label>
            <input className="ainp" type="email" placeholder="you@company.com" value={f.email} onChange={upd("email")} />
          </div>
          <div style={{ marginBottom: tab === "signup" ? 12 : 0 }}>
            <label style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--lm)", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 600 }}>Password</label>
            <input className="ainp" type="password" placeholder="••••••••" value={f.password} onChange={upd("password")} />
          </div>
          {tab === "signup" && (
            <div style={{ marginBottom: 0 }}>
              <label style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--lm)", textTransform: "uppercase", display: "block", marginBottom: 7, fontWeight: 600 }}>Confirm Password</label>
              <input className="ainp" type="password" placeholder="••••••••" value={f.confirm} onChange={upd("confirm")} />
            </div>
          )}
          {err && <div className="aerr">⚠ {err}</div>}
          <button className="abtn" onClick={tab === "signin" ? signIn : signUp} disabled={loading}>
            {loading ? "Processing…" : tab === "signin" ? "Access Dashboard →" : "Create Account →"}
          </button>
          {tab === "signin" && (
            <div style={{ fontSize: 11, color: "var(--lm)", marginTop: 13, padding: 12, background: "var(--lb2)", borderRadius: 8, border: "1px solid var(--lbo)", lineHeight: 1.9, fontFamily: "var(--fm)" }}>
              <b style={{ color: B.cyanDk }}>admin@sentrasec.io</b> / demo123 (Fortress)<br />
              <b style={{ color: B.cyanDk }}>pro@sentrasec.io</b> / demo123 (Guardian)<br />
              <b style={{ color: B.cyanDk }}>starter@sentrasec.io</b> / demo123 (Sentinel)
            </div>
          )}
          {tab === "signup" && (
            <div style={{ fontSize: 11, color: "var(--lm)", marginTop: 12, lineHeight: 1.7 }}>
              By signing up you'll receive a welcome email with your package details and onboarding guide.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   💼  PRICING PAGE (standalone)
════════════════════════════════════════════════════════════════ */
function PricingPage({ onSelect, onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--lb)", padding: "100px clamp(16px,5vw,80px) 80px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--lm)", cursor: "pointer", border: "none", background: "none", fontFamily: "var(--fs)", marginBottom: 36 }}>← Back</button>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Logo size={36} tag />
          <h1 style={{ fontFamily: "var(--fd)", fontSize: "clamp(30px,4vw,48px)", fontWeight: 900, color: B.navy, letterSpacing: "-1px", marginTop: 22, marginBottom: 11 }}>Choose your protection level.</h1>
          <p style={{ fontSize: 16, color: "var(--lm)", maxWidth: 480, margin: "0 auto" }}>All plans include auto device detection. 14-day free trial, no credit card required.</p>
        </div>
        <PkgCards onSelect={onSelect} />
        <div style={{ textAlign: "center", marginTop: 36, fontSize: 13, color: "var(--lm)" }}>
          Questions? <a href={`mailto:${B.email}`} style={{ color: B.cyanDk, fontWeight: 600 }}>{B.email}</a>
          {" · "}<a href={`tel:${B.phone.replace(/ /g, "")}`} style={{ color: B.cyanDk, fontWeight: 600 }}>{B.phone}</a>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   🖥  DEVICE SECURITY SCAN VIEW
════════════════════════════════════════════════════════════════ */
function DeviceSecurityView({ user, pkg }) {
  const [device, setDevice] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("");
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [vulns, setVulns] = useState([]);
  const [threats, setThreats] = useState([]);
  const [riskScore, setRiskScore] = useState(null);

  useEffect(() => { fetchDeviceInfo(user.name).then(d => { setDevice(d); }); }, [user.name]);

  const startScan = async () => {
    setScanning(true); setScanDone(false); setProgress(0); setVulns([]); setThreats([]); setRiskScore(null);
    const phases = pkg.scanPhases;
    for (let i = 0; i < phases.length; i++) {
      setPhase(phases[i]); setPhaseIdx(i);
      setProgress(Math.round((i + 1) / phases.length * 100));
      await new Promise(r => setTimeout(r, pkg.id === "fortress" ? 2200 : pkg.id === "guardian" ? 1600 : 1200));
    }
    const pv = SCAN_VULNS[pkg.id] || SCAN_VULNS.sentinel;
    const pt = THREATS[pkg.id] || THREATS.sentinel;
    setVulns(pv); setThreats(pt);
    const crit = pv.filter(v => v.sev === "CRITICAL").length;
    const high = pv.filter(v => v.sev === "HIGH").length;
    const score = Math.max(10, 100 - crit * 18 - high * 8 - Math.floor(Math.random() * 8));
    setRiskScore(score);
    setScanning(false); setScanDone(true);
  };

  const riskColor = r => r >= 80 ? "#22c55e" : r >= 60 ? "#eab308" : r >= 40 ? "#f97316" : "#ef4444";
  const riskLabel = r => r >= 80 ? "LOW RISK" : r >= 60 ? "MEDIUM RISK" : r >= 40 ? "HIGH RISK" : "CRITICAL RISK";
  const vulnCounts = { critical: vulns.filter(v => v.sev === "CRITICAL").length, high: vulns.filter(v => v.sev === "HIGH").length, medium: vulns.filter(v => v.sev === "MEDIUM").length, low: vulns.filter(v => v.sev === "LOW").length };

  return (
    <>
      {/* Device Info */}
      <div className="pn">
        <div className="ph">
          <div className="pt">🖥 Auto-Detected Device — {user.name}</div>
          <div style={{ fontSize: 10, color: "var(--dm)", fontFamily: "var(--fm)" }}>
            {device ? <span style={{ color: "#22c55e" }}>● Live</span> : "Loading…"}
          </div>
        </div>
        <div className="pb">
          {device ? (
            <div className="device-grid">
              {[
                ["Login Username", device.username],
                ["Hostname / Domain", device.hostname],
                ["Public IP Address", device.ip],
                ["Location", `${device.city}, ${device.country}`],
                ["ISP / Network", device.isp],
                ["Operating System", device.os],
                ["Browser", device.browser],
                ["Device Type", device.device],
                ["Architecture", device.arch],
                ["Screen Resolution", device.screenRes],
                ["CPU Cores", device.cores],
                ["RAM", device.memory],
                ["Language", device.lang],
                ["Timezone", device.timezone],
                ["Online Status", device.onlineStatus],
                ["Detected At", new Date(device.detectedAt).toLocaleTimeString()],
              ].map(([k, v]) => (
                <div key={k} className="device-row">
                  <span style={{ color: "var(--dm)", fontSize: 11 }}>{k}</span>
                  <span style={{ color: "var(--dc)", fontSize: 11, fontWeight: 500, textAlign: "right", maxWidth: "55%", wordBreak: "break-all" }}>{v}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 32, color: "var(--dm)", fontSize: 13 }}>Detecting device info…</div>
          )}
        </div>
      </div>

      {/* Scan Engine */}
      <div className="scan-wrap">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 700, color: "var(--dt)", marginBottom: 4 }}>Security Scan Engine</div>
            <div style={{ fontSize: 11, color: "var(--dm)", fontFamily: "var(--fm)" }}>
              Package: <span style={{ color: pkg.color, fontWeight: 600 }}>{pkg.name} ({pkg.scanDepth})</span> · Max endpoints: {pkg.maxEndpoints >= 99999 ? "Unlimited" : pkg.maxEndpoints} · Apps scan limit: {pkg.appScanLimit >= 500 ? "Unlimited" : pkg.appScanLimit}
            </div>
          </div>
          {!scanning && (
            <button onClick={startScan} style={{ padding: "10px 22px", background: pkg.color, border: "none", borderRadius: 8, color: pkg.id === "guardian" ? "white" : "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--fm)", letterSpacing: .5 }}>
              {scanDone ? "Re-Scan ↺" : "▶ Run Scan"}
            </button>
          )}
        </div>
        {scanning && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: "var(--dc)", fontFamily: "var(--fm)" }}>{phase}<span className="cursor" /></div>
              <span style={{ marginLeft: "auto", fontFamily: "var(--fm)", fontSize: 12, color: pkg.color, fontWeight: 600 }}>{progress}%</span>
            </div>
            <div className="scan-progress-bar"><div className="scan-progress-fill" style={{ width: `${progress}%` }} /></div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {pkg.scanPhases.map((p, i) => (
                <div key={i} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 3, background: i < phaseIdx ? "rgba(34,211,238,.15)" : i === phaseIdx ? "rgba(34,211,238,.08)" : "rgba(0,0,0,.2)", color: i < phaseIdx ? "var(--dc)" : i === phaseIdx ? "var(--dt)" : "var(--dm)", fontFamily: "var(--fm)", letterSpacing: .5, border: `1px solid ${i <= phaseIdx ? "var(--dbo2)" : "var(--dbo)"}` }}>
                  {i < phaseIdx ? "✓ " : i === phaseIdx ? "→ " : ""}{p}
                </div>
              ))}
            </div>
          </>
        )}
        {!scanning && !scanDone && (
          <div style={{ textAlign: "center", padding: "28px 0", color: "var(--dm)", fontSize: 13, fontFamily: "var(--fm)" }}>
            Click <strong style={{ color: pkg.color }}>Run Scan</strong> to start a {pkg.scanDepth} security scan of your device
          </div>
        )}
      </div>

      {/* Scan Results */}
      {scanDone && (
        <>
          {/* Risk Score */}
          <div className="g2">
            <div className="pn">
              <div className="ph"><div className="pt">📊 Risk Score & CVE Summary</div></div>
              <div className="pb" style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                <div className="risk-ring" style={{ borderColor: riskColor(riskScore), color: riskColor(riskScore) }}>
                  <div className="risk-score">{riskScore}</div>
                  <div className="risk-lbl">/100</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--fd)", fontSize: 18, fontWeight: 800, color: riskColor(riskScore), marginBottom: 8 }}>{riskLabel(riskScore)}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[["Critical", vulnCounts.critical, "#ef4444"], ["High", vulnCounts.high, "#f97316"], ["Medium", vulnCounts.medium, "#eab308"], ["Low", vulnCounts.low, "#22d3ee"]].map(([l, v, c]) => (
                      <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 11px", background: "var(--db2)", borderRadius: 8, border: `1px solid ${c}28` }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: c, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: "var(--dm)", flex: 1, fontFamily: "var(--fm)" }}>{l}</span>
                        <span style={{ color: c, fontWeight: 700, fontSize: 16, fontFamily: "var(--fd)" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="pn">
              <div className="ph"><div className="pt">🦠 Virus Scan Results</div><div style={{ fontSize: 10, color: "var(--dm)" }}>{threats.length} found</div></div>
              <div style={{ padding: "0 20px", maxHeight: 240, overflowY: "auto" }}>
                {threats.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "#22c55e", fontSize: 13, fontFamily: "var(--fm)" }}>✓ No threats detected</div>
                ) : threats.map((t, i) => (
                  <div key={i} className="ar">
                    <SBadge s={t.sev} />
                    <div style={{ flex: 1 }}>
                      <div className="am" style={{ color: "var(--dc)" }}>{t.name}</div>
                      <div className="amt">{t.file}</div>
                    </div>
                    <div style={{ fontSize: 10, padding: "3px 7px", background: "rgba(34,197,94,.1)", color: "#22c55e", borderRadius: 3, border: "1px solid rgba(34,197,94,.28)", whiteSpace: "nowrap", fontFamily: "var(--fm)" }}>{t.action}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CVE Details */}
          <div className="pn" style={{ marginBottom: 16 }}>
            <div className="ph">
              <div className="pt">⚠ Vulnerability Details</div>
              <div style={{ fontSize: 10, color: "var(--dm)" }}>{vulns.length} CVEs · {pkg.scanDepth} scan</div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="dt">
                <thead><tr><th>CVE ID</th><th>Application</th><th>Severity</th><th>CVSS</th><th>Description</th><th>Fix</th></tr></thead>
                <tbody>
                  {vulns.map(v => {
                    const sv = sc(v.sev);
                    const bar = v.score >= 9 ? "#ef4444" : v.score >= 7 ? "#f97316" : "#eab308";
                    return <tr key={v.id}>
                      <td style={{ color: "var(--dc)", fontWeight: 500, fontFamily: "var(--fm)" }}>{v.id}</td>
                      <td style={{ color: "var(--dt)", fontFamily: "var(--fm)" }}>{v.app}</td>
                      <td><div className="sbg" style={{ background: sv.bg, color: sv.text, borderColor: sv.border, display: "inline-block" }}>{v.sev}</div></td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ color: bar, fontWeight: 600, fontFamily: "var(--fm)" }}>{v.score}</span>
                          <div style={{ width: 40, height: 4, background: "var(--dbo)", borderRadius: 2 }}>
                            <div style={{ height: "100%", width: `${(v.score / 10) * 100}%`, background: bar, borderRadius: 2 }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "var(--dm)", fontSize: 11, maxWidth: 180 }}>{v.desc}</td>
                      <td style={{ color: "#4ade80", fontSize: 11, fontFamily: "var(--fm)" }}>{v.fix}</td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Installed Apps */}
          {device && (
            <div className="pn">
              <div className="ph">
                <div className="pt">📦 Scanned Applications ({Math.min(device.installedApps.length, pkg.appScanLimit >= 500 ? device.installedApps.length : pkg.appScanLimit)})</div>
                <div style={{ fontSize: 10, color: "var(--dm)", fontFamily: "var(--fm)" }}>{pkg.scanDepth} scan · {device.os}</div>
              </div>
              <div style={{ padding: "0 20px", maxHeight: 280, overflowY: "auto" }}>
                {device.installedApps.slice(0, pkg.appScanLimit >= 500 ? device.installedApps.length : pkg.appScanLimit).map((app, i) => {
                  const hasVuln = vulns.some(v => v.app.toLowerCase().includes(app.split(" ")[0].toLowerCase()));
                  return (
                    <div key={i} className="app-row">
                      <div className="app-dot" style={{ background: hasVuln ? "#ef4444" : "#22c55e" }} />
                      <span style={{ flex: 1, color: "var(--dt)" }}>{app}</span>
                      {hasVuln && <div className="sbg" style={{ background: "rgba(239,68,68,.1)", color: "#f87171", borderColor: "rgba(239,68,68,.28)", display: "inline-block", fontSize: 9 }}>VULNERABLE</div>}
                      {!hasVuln && <span style={{ fontSize: 10, color: "#4ade80", fontFamily: "var(--fm)" }}>✓ Clean</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   🗂  DASHBOARD
════════════════════════════════════════════════════════════════ */
const genThreat = () => Array.from({ length: 24 }, (_, i) => ({ t: `${String(i).padStart(2, "0")}:00`, critical: Math.floor(Math.random() * 8), high: Math.floor(Math.random() * 20), medium: Math.floor(Math.random() * 35) }));
const genNet = () => Array.from({ length: 30 }, (_, i) => ({ t: i, inbound: Math.floor(Math.random() * 800 + 200), outbound: Math.floor(Math.random() * 600 + 100), blocked: Math.floor(Math.random() * 50) }));
const RADAR_D = [{ subject: "Perimeter", A: 85 }, { subject: "Endpoints", A: 62 }, { subject: "Identity", A: 78 }, { subject: "Data", A: 45 }, { subject: "Network", A: 91 }, { subject: "Cloud", A: 70 }];
const PIE_D = [{ name: "Critical", value: 4, color: "#ef4444" }, { name: "High", value: 12, color: "#f97316" }, { name: "Medium", value: 31, color: "#eab308" }, { name: "Low", value: 28, color: "#0ea5e9" }];

function Dashboard({ user, onLogout, onUpgrade }) {
  const [view, setView] = useState("device");
  const [td] = useState(genThreat);
  const [nd] = useState(genNet);
  const pkg = PKGS.find(p => p.id === user.pkg) || PKGS[0];
  const isGP = ["guardian", "fortress"].includes(user.pkg);
  const isFP = user.pkg === "fortress";

  // Send welcome email on first login
  useEffect(() => {
    if (user.isNew && user.email && user.name) {
      const t = setTimeout(() => sendWelcomeEmail(user, pkg), 2000);
      return () => clearTimeout(t);
    }
  }, []);

  const NAV = [
    { id: "device", label: "Device Security", icon: "🖥", section: "SECURITY", badge: null },
    { id: "overview", label: "Overview", icon: "◈", section: null },
    { id: "alerts", label: "Live Alerts", icon: "⚡", badge: "8" },
    { id: "vulns", label: "Vulnerabilities", icon: "⚠" },
    { id: "endpoints", label: "Endpoints", icon: "⬡" },
    { id: "network", label: "Network Traffic", icon: "⟁", section: "ANALYZE" },
    { id: "intel", label: "Threat Intel", icon: "◎", locked: !isGP },
    { id: "hunt", label: "Threat Hunting", icon: "◉", locked: !isFP },
    { id: "incidents", label: "Incidents", icon: "⬘", section: "RESPOND", locked: !isGP },
    { id: "playbooks", label: "Playbooks", icon: "▣", locked: !isGP },
    { id: "reports", label: "Reports", icon: "▤", section: "REPORT" },
    { id: "settings", label: "Settings", icon: "⚙" },
  ];

  return (
    <div className="dl">
      <nav className="sb">
        <div className="sbl">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldMark size={24} />
            <div>
              <div style={{ fontFamily: "var(--fd)", fontSize: 16, fontWeight: 900, color: "var(--dc)", letterSpacing: "-.3px", lineHeight: 1 }}>SentraSec</div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "var(--dm)", textTransform: "uppercase", marginTop: 3, fontFamily: "var(--fm)" }}>Security Ops</div>
            </div>
          </div>
        </div>
        <div className="sbp" style={{ color: pkg.color, borderColor: `${pkg.color}44`, background: `${pkg.color}12` }}>
          {pkg.name} · {pkg.tier}
        </div>
        <div className="sbn">
          {NAV.map(item => (
            <div key={item.id}>
              {item.section && <div className="sbsc">{item.section}</div>}
              <div className={`ni ${view === item.id ? "on" : ""} ${item.locked ? "lkd" : ""}`}
                onClick={() => !item.locked && setView(item.id)} title={item.locked ? "Upgrade to unlock" : ""}>
                <span style={{ fontSize: 13 }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && <span className="nb">{item.badge}</span>}
                {item.locked && <span style={{ marginLeft: "auto", fontSize: 9, opacity: .38 }}>LOCKED</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="sbf">
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(34,211,238,.15)", border: "1px solid var(--dbo2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--dc)", fontWeight: 600, fontFamily: "var(--fd)", flexShrink: 0 }}>{user.name[0]}</div>
            <div>
              <div style={{ fontSize: 12, color: "var(--dt)", fontWeight: 500, fontFamily: "var(--fm)" }}>{user.name}</div>
              <div style={{ fontSize: 10, color: "var(--dm)", fontFamily: "var(--fm)" }}>{user.role}</div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--dbo)", paddingTop: 10, marginBottom: 2 }}>
            {[[`mailto:${B.email}`, "✉", B.email], [`tel:${B.phone.replace(/ /g, "")}`, "📱", B.phone]].map(([h, ic, v]) => (
              <a key={v} href={h} className="sbci"><span>{ic}</span><span style={{ fontSize: 9.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span></a>
            ))}
          </div>
          <button className="lgb" onClick={onLogout}>⏻ Sign Out</button>
        </div>
      </nav>

      <div className="dm">
        <div className="tb">
          <div className="tbt">{NAV.find(n => n.id === view)?.label}</div>
          <LiveClock />
          <div className="tpl" style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)" }}>
            <div className="tdot" style={{ background: "#ef4444" }} />
            <span style={{ color: "#f87171", fontSize: 11, fontWeight: 600, fontFamily: "var(--fm)" }}>THREAT: HIGH</span>
          </div>
          {!isFP && <button className="ub" style={{ borderColor: pkg.color, color: pkg.color }} onClick={onUpgrade}>↑ Upgrade</button>}
        </div>

        <div className="dcc">
          {view === "device" && <DeviceSecurityView user={user} pkg={pkg} />}
          {view === "overview" && <OverView td={td} pkg={pkg} isGP={isGP} onUpgrade={onUpgrade} />}
          {view === "alerts" && <AlertsV />}
          {view === "vulns" && <VulnsV pkg={pkg} />}
          {view === "endpoints" && <EndpV />}
          {view === "network" && <NetV nd={nd} />}
          {view === "intel" && <FGateV title="Threat Intelligence Feed" icon="◎" desc="Live IOC feeds, APT tracking & dark web monitoring." pkg="Guardian" onUpgrade={onUpgrade} />}
          {view === "hunt" && <FGateV title="AI Threat Hunting" icon="◉" desc="Proactive AI-powered hunting with ML behavioral analysis." pkg="Fortress" onUpgrade={onUpgrade} />}
          {view === "incidents" && <IncV isGP={isGP} onUpgrade={onUpgrade} />}
          {view === "playbooks" && <FGateV title="Incident Playbooks" icon="▣" desc="Automated SOAR playbooks with guided response workflows." pkg="Guardian" onUpgrade={onUpgrade} />}
          {view === "reports" && <RepsV />}
          {view === "settings" && <SetsV user={user} pkg={pkg} />}
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard sub-views ── */
function OverView({ td, pkg, isGP, onUpgrade }) {
  const kpis = [
    { l: "Active Threats", v: "75", d: "↑ 12 from yesterday", up: true, ic: "⚡", c: "#ef4444" },
    { l: "Endpoints", v: "247", d: "3 offline", up: false, ic: "⬡", c: "#22d3ee" },
    { l: "CVEs Detected", v: "34", d: "↑ 6 new today", up: true, ic: "⚠", c: "#f97316" },
    { l: "Events / Hour", v: "92K", d: "↑ 18% from avg", up: true, ic: "◈", c: "#a78bfa" },
    { l: "Blocked Attacks", v: "1,204", d: "Last 24h", up: false, ic: "🛡", c: "#22c55e" },
    { l: "MTTD (min)", v: "3.2", d: "↓ 0.8 improvement", up: false, ic: "⏱", c: "#22d3ee" },
  ];
  return (
    <>
      <div className="kg">
        {kpis.map(k => (
          <div key={k.l} className="kc">
            <div className="kl">{k.l}</div>
            <div className="kv" style={{ color: k.c }}>{k.v}</div>
            <div className={`kd ${k.up ? "up" : "dn"}`}>{k.d}</div>
            <div className="ki">{k.ic}</div>
            <div className="kbd" style={{ background: `${k.c}28` }}><div style={{ height: "100%", width: "60%", background: k.c, borderRadius: 2 }} /></div>
          </div>
        ))}
      </div>
      <div className="g3">
        <div className="pn">
          <div className="ph"><div className="pt">⚡ Threat Activity — 24h</div><div style={{ fontSize: 10, color: "var(--dm)" }}>Live</div></div>
          <div className="pb">
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={td}>
                <defs>{[["cr", "#ef4444"], ["hi", "#f97316"], ["me", "#eab308"]].map(([k, c]) => (
                  <linearGradient key={k} id={`dg-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c} stopOpacity={.28} /><stop offset="95%" stopColor={c} stopOpacity={0} />
                  </linearGradient>
                ))}</defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,.05)" />
                <XAxis dataKey="t" tick={{ fontSize: 9, fill: "#64748b" }} interval={3} />
                <YAxis tick={{ fontSize: 9, fill: "#64748b" }} />
                <Tooltip contentStyle={TT} />
                <Area type="monotone" dataKey="critical" stroke="#ef4444" fill="url(#dg-cr)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="high" stroke="#f97316" fill="url(#dg-hi)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="medium" stroke="#eab308" fill="url(#dg-me)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="pn">
          <div className="ph"><div className="pt">◉ Security Posture</div></div>
          <div className="pb">
            <ResponsiveContainer width="100%" height={190}>
              <RadarChart data={RADAR_D}>
                <PolarGrid stroke="rgba(34,211,238,.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: "#64748b" }} />
                <Radar dataKey="A" stroke={pkg.color} fill={pkg.color} fillOpacity={.14} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ textAlign: "center", fontSize: 11, color: "var(--dm)", fontFamily: "var(--fm)" }}>Score: <span style={{ color: pkg.color, fontWeight: 600 }}>72/100</span></div>
          </div>
        </div>
      </div>
      <div className="g2">
        <div className="pn">
          <div className="ph"><div className="pt">🔴 Recent Alerts</div><div style={{ fontSize: 10, color: "var(--dm)" }}>8 active</div></div>
          <div className="ps">
            {[
              { sev: "CRITICAL", msg: "Brute force attack on SSH port 22", host: "prod-db-01", time: "2m ago", geo: "CN" },
              { sev: "HIGH", msg: "Lateral movement — unusual SMB traffic", host: "workstation-14", time: "7m ago", geo: "RU" },
              { sev: "HIGH", msg: "Privilege escalation via sudo abuse", host: "web-server-03", time: "12m ago", geo: "IR" },
              { sev: "MEDIUM", msg: "Anomalous DNS query to C2 domain", host: "laptop-jen", time: "18m ago", geo: "US" },
              { sev: "MEDIUM", msg: "Suspicious PowerShell execution", host: "dc-server-01", time: "25m ago", geo: "US" },
            ].map((a, i) => (
              <div key={i} className="ar">
                <SBadge s={a.sev} />
                <div style={{ flex: 1 }}><div className="am">{a.msg}</div><div className="amt">{a.host} · {a.time}</div></div>
                <div style={{ fontSize: 10, color: "var(--dm)", flexShrink: 0 }}>{a.geo}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="pn">
          <div className="ph"><div className="pt">◈ Threat Distribution</div></div>
          <div className="pb">
            <ResponsiveContainer width="100%" height={165}>
              <PieChart><Pie data={PIE_D} cx="50%" cy="50%" innerRadius={44} outerRadius={72} dataKey="value" strokeWidth={0}>
                {PIE_D.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie><Tooltip contentStyle={TT} /></PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {PIE_D.map(d => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontFamily: "var(--fm)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                  <span style={{ color: "var(--dm)", flex: 1 }}>{d.name}</span>
                  <span style={{ color: d.color, fontWeight: 600 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {!isGP && (
        <div style={{ padding: 18, background: "rgba(99,102,241,.07)", border: "1px solid rgba(99,102,241,.22)", borderRadius: 10, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 26 }}>🔮</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--fd)", fontSize: 13, fontWeight: 700, color: "#818cf8", marginBottom: 4 }}>Unlock Guardian — Advanced SIEM, Threat Intel, Incident Playbooks</div>
            <div style={{ fontSize: 12, color: "var(--dm)", fontFamily: "var(--fm)" }}>Also includes deep device scanning, app vulnerability correlation, and 30-day log retention.</div>
          </div>
          <button onClick={onUpgrade} style={{ padding: "9px 18px", background: "#6366f1", border: "none", borderRadius: 6, color: "white", fontSize: 11, cursor: "pointer", fontWeight: 600, fontFamily: "var(--fm)" }}>Upgrade →</button>
        </div>
      )}
    </>
  );
}

function AlertsV() {
  const [f, setF] = useState("ALL");
  const ALRT = [
    { sev: "CRITICAL", msg: "Brute force attack on SSH port 22", host: "prod-db-01", time: "2m ago", geo: "CN" },
    { sev: "HIGH", msg: "Lateral movement — unusual SMB traffic", host: "workstation-14", time: "7m ago", geo: "RU" },
    { sev: "HIGH", msg: "Privilege escalation via sudo abuse", host: "web-server-03", time: "12m ago", geo: "IR" },
    { sev: "MEDIUM", msg: "Anomalous DNS query to C2 domain", host: "laptop-jen", time: "18m ago", geo: "US" },
    { sev: "MEDIUM", msg: "Suspicious PowerShell execution", host: "dc-server-01", time: "25m ago", geo: "US" },
    { sev: "LOW", msg: "Failed login attempts exceeding threshold", host: "vpn-gateway", time: "31m ago", geo: "BR" },
    { sev: "CRITICAL", msg: "Ransomware signature in memory", host: "finance-ws-02", time: "45m ago", geo: "KP" },
    { sev: "HIGH", msg: "Data exfiltration pattern to external IP", host: "prod-api-02", time: "1h ago", geo: "RU" },
  ];
  const filtered = f === "ALL" ? ALRT : ALRT.filter(a => a.sev === f);
  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map(fl => {
          const c = sc(fl === "ALL" ? "CLEAN" : fl);
          return <button key={fl} onClick={() => setF(fl)} style={{ padding: "5px 12px", border: `1px solid ${f === fl ? c.border : "var(--dbo)"}`, borderRadius: 4, background: f === fl ? c.bg : "transparent", color: f === fl ? c.text : "var(--dm)", cursor: "pointer", fontSize: 11, fontFamily: "var(--fm)", letterSpacing: 1, textTransform: "uppercase" }}>
            {fl}{fl !== "ALL" && ` (${ALRT.filter(a => a.sev === fl).length})`}
          </button>;
        })}
      </div>
      <div className="pn">
        <div className="ph"><div className="pt">⚡ Security Alerts</div><div style={{ fontSize: 10, color: "var(--dm)" }}>{filtered.length} alerts</div></div>
        <div style={{ padding: "0 20px" }}>
          {filtered.map((a, i) => (
            <div key={i} className="ar">
              <SBadge s={a.sev} />
              <div style={{ flex: 1 }}><div className="am">{a.msg}</div><div className="amt">{a.host} · Source: {a.geo} · {a.time}</div></div>
              <button style={{ padding: "5px 10px", background: "rgba(34,211,238,.07)", border: "1px solid rgba(34,211,238,.18)", borderRadius: 4, color: "var(--dc)", fontSize: 10, cursor: "pointer", fontFamily: "var(--fm)" }}>Investigate</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function VulnsV({ pkg }) {
  const vulns = SCAN_VULNS[pkg.id] || SCAN_VULNS.sentinel;
  const counts = { critical: vulns.filter(v => v.sev === "CRITICAL").length, high: vulns.filter(v => v.sev === "HIGH").length, medium: vulns.filter(v => v.sev === "MEDIUM").length, low: vulns.filter(v => v.sev === "LOW").length };
  return (
    <>
      <div className="kg" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 16 }}>
        {[["Critical", counts.critical, "#ef4444"], ["High", counts.high, "#f97316"], ["Medium", counts.medium, "#eab308"], ["Low", counts.low, "#22d3ee"]].map(([l, v, c]) => (
          <div key={l} className="kc"><div className="kl">{l} CVEs</div><div className="kv" style={{ color: c, fontSize: 28 }}>{v}</div></div>
        ))}
      </div>
      <div className="pn">
        <div className="ph"><div className="pt">⚠ Vulnerability Report</div><div style={{ fontSize: 10, color: "var(--dm)" }}>{vulns.length} findings · {pkg.scanDepth} scan</div></div>
        <div style={{ overflowX: "auto" }}>
          <table className="dt">
            <thead><tr><th>CVE ID</th><th>Application</th><th>Severity</th><th>CVSS</th><th>Description</th><th>Fix</th></tr></thead>
            <tbody>
              {vulns.map(v => {
                const sv = sc(v.sev); const bar = v.score >= 9 ? "#ef4444" : v.score >= 7 ? "#f97316" : "#eab308"; return (
                  <tr key={v.id}>
                    <td style={{ color: "var(--dc)", fontWeight: 500, fontFamily: "var(--fm)" }}>{v.id}</td>
                    <td style={{ color: "var(--dt)", fontFamily: "var(--fm)" }}>{v.app}</td>
                    <td><div className="sbg" style={{ background: sv.bg, color: sv.text, borderColor: sv.border, display: "inline-block" }}>{v.sev}</div></td>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: bar, fontWeight: 600, fontFamily: "var(--fm)" }}>{v.score}</span><div style={{ width: 40, height: 4, background: "var(--dbo)", borderRadius: 2 }}><div style={{ height: "100%", width: `${(v.score / 10) * 100}%`, background: bar, borderRadius: 2 }} /></div></div></td>
                    <td style={{ color: "var(--dm)", fontSize: 11, maxWidth: 180 }}>{v.desc}</td>
                    <td style={{ color: "#4ade80", fontSize: 11, fontFamily: "var(--fm)" }}>{v.fix}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function EndpV() {
  const EPS = [
    { name: "prod-db-01", ip: "10.0.1.10", os: "Ubuntu 22.04", status: "CRITICAL", threats: 3, seen: "Active" },
    { name: "web-server-03", ip: "10.0.1.23", os: "CentOS 8", status: "HIGH", threats: 2, seen: "Active" },
    { name: "workstation-14", ip: "192.168.1.54", os: "Windows 11", status: "HIGH", threats: 1, seen: "3m ago" },
    { name: "dc-server-01", ip: "10.0.0.5", os: "Windows Server 2022", status: "MEDIUM", threats: 1, seen: "Active" },
    { name: "finance-ws-02", ip: "192.168.1.87", os: "Windows 10", status: "CRITICAL", threats: 4, seen: "Active" },
    { name: "laptop-jen", ip: "192.168.1.112", os: "macOS 14", status: "LOW", threats: 0, seen: "12m ago" },
    { name: "vpn-gateway", ip: "203.0.113.5", os: "pfSense 2.7", status: "CLEAN", threats: 0, seen: "Active" },
    { name: "prod-api-02", ip: "10.0.1.45", os: "Ubuntu 20.04", status: "MEDIUM", threats: 1, seen: "Active" },
  ];
  return (
    <div className="pn">
      <div className="ph"><div className="pt">⬡ Endpoint Inventory</div><div style={{ fontSize: 10, color: "var(--dm)" }}>{EPS.length} devices</div></div>
      <div style={{ overflowX: "auto" }}>
        <table className="dt">
          <thead><tr><th>Hostname</th><th>IP</th><th>OS</th><th>Status</th><th>Threats</th><th>Last Seen</th></tr></thead>
          <tbody>
            {EPS.map(e => {
              const s = sc(e.status); return (
                <tr key={e.name}>
                  <td className="hn">{e.name}</td>
                  <td style={{ color: "var(--dm)", fontSize: 11, fontFamily: "var(--fm)" }}>{e.ip}</td>
                  <td style={{ fontSize: 11, color: "var(--dm)" }}>{e.os}</td>
                  <td><div className="sbg" style={{ background: s.bg, color: s.text, borderColor: s.border, display: "inline-block" }}>{e.status}</div></td>
                  <td style={{ color: e.threats > 0 ? "#f87171" : "#4ade80", fontWeight: 600 }}>{e.threats}</td>
                  <td style={{ fontSize: 11, color: "var(--dm)" }}><span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: e.seen === "Active" ? "#22c55e" : "#64748b", marginRight: 6 }} />{e.seen}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NetV({ nd }) {
  return (
    <>
      <div className="pn">
        <div className="ph"><div className="pt">⟁ Network Traffic — 30 min</div></div>
        <div className="pb">
          <ResponsiveContainer width="100%" height={270}>
            <AreaChart data={nd}>
              <defs>{[["in", "#22d3ee"], ["ou", "#a78bfa"], ["bl", "#ef4444"]].map(([k, c]) => (
                <linearGradient key={k} id={`ng-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c} stopOpacity={.22} /><stop offset="95%" stopColor={c} stopOpacity={0} />
                </linearGradient>
              ))}</defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,.05)" />
              <XAxis dataKey="t" tick={{ fontSize: 9, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 9, fill: "#64748b" }} unit=" MB" />
              <Tooltip contentStyle={TT} />
              <Area type="monotone" dataKey="inbound" name="Inbound" stroke="#22d3ee" fill="url(#ng-in)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="outbound" name="Outbound" stroke="#a78bfa" fill="url(#ng-ou)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="blocked" name="Blocked" stroke="#ef4444" fill="url(#ng-bl)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="g2">
        {[{ l: "Inbound", v: "14.2 GB", c: "#22d3ee" }, { l: "Outbound", v: "8.7 GB", c: "#a78bfa" }, { l: "Blocked", v: "1,204", c: "#ef4444" }, { l: "Unique IPs", v: "3,891", c: "#eab308" }].map(k => (
          <div key={k.l} className="kc"><div className="kl">{k.l}</div><div className="kv" style={{ color: k.c, fontSize: 26 }}>{k.v}</div></div>
        ))}
      </div>
    </>
  );
}

function FGateV({ title, icon, desc, pkg, onUpgrade }) {
  return (
    <div className="fgate">
      <div className="fgate-icon">{icon}</div>
      <div className="fgate-title">{title}</div>
      <div className="fgate-sub">{desc}</div>
      <div style={{ fontSize: 12, color: "var(--dm)", fontFamily: "var(--fm)" }}>Available on <strong style={{ color: "var(--dc)" }}>{pkg}</strong> and above</div>
      <button className="fgate-btn" onClick={onUpgrade}>Upgrade to {pkg} →</button>
    </div>
  );
}

function IncV({ isGP, onUpgrade }) {
  if (!isGP) return <FGateV title="Incident Management" icon="⬘" desc="Track, triage and resolve incidents with full timeline." pkg="Guardian" onUpgrade={onUpgrade} />;
  const incs = [
    { id: "INC-0041", title: "Ransomware Containment — Finance", sev: "CRITICAL", status: "ACTIVE", progress: 35, time: "45m ago", desc: "Segment isolated. Memory dump in progress." },
    { id: "INC-0040", title: "Brute Force Campaign from CN IPs", sev: "HIGH", status: "INVESTIGATING", progress: 60, time: "2h ago", desc: "47 IPs blocklisted. Rate limiting applied." },
    { id: "INC-0039", title: "Lateral Movement via Service Account", sev: "HIGH", status: "CONTAINING", progress: 75, time: "5h ago", desc: "Service account suspended. Forensics underway." },
    { id: "INC-0038", title: "Data Exfiltration Attempt", sev: "MEDIUM", status: "RESOLVED", progress: 100, time: "1d ago", desc: "No data loss confirmed. Rule updated." },
  ];
  return (
    <>
      <div className="kg" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 16 }}>
        {[{ l: "Active", v: 1, c: "#ef4444" }, { l: "Investigating", v: 1, c: "#f97316" }, { l: "Containing", v: 1, c: "#eab308" }, { l: "Resolved", v: 4, c: "#22c55e" }].map(k => (
          <div key={k.l} className="kc"><div className="kl">{k.l}</div><div className="kv" style={{ color: k.c, fontSize: 28 }}>{k.v}</div></div>
        ))}
      </div>
      {incs.map(inc => {
        const s = sc(inc.sev), st = sc(inc.status); return (
          <div key={inc.id} style={{ background: "var(--db2)", border: "1px solid var(--dbo)", borderRadius: 8, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
              <SBadge s={inc.sev} /><div style={{ flex: 1 }}><div style={{ fontSize: 10, color: "var(--dm)", fontFamily: "var(--fm)" }}>{inc.id} · {inc.time}</div><div style={{ fontSize: 13, fontWeight: 500, color: "var(--dt)", fontFamily: "var(--fm)" }}>{inc.title}</div></div>
              <div className="sbg" style={{ background: st.bg, color: st.text, borderColor: st.border }}>{inc.status}</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--dm)", lineHeight: 1.6, fontFamily: "var(--fm)" }}>{inc.desc}</div>
            <div style={{ height: 3, background: "var(--dbo)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}><div style={{ height: "100%", width: `${inc.progress}%`, background: inc.progress === 100 ? "#22c55e" : "var(--dc)", borderRadius: 2 }} /></div>
            <div style={{ fontSize: 10, color: "var(--dm)", marginTop: 8, fontFamily: "var(--fm)" }}>Progress: <span style={{ color: "var(--dt)" }}>{inc.progress}%</span></div>
          </div>
        );
      })}
    </>
  );
}

function RepsV() {
  return (
    <div className="pn">
      <div className="ph"><div className="pt">▤ Reports & Exports</div></div>
      <div style={{ padding: "0 20px" }}>
        {[{ t: "Executive Security Summary", d: "May 2026", type: "PDF", sz: "2.4 MB" }, { t: "Vulnerability Assessment", d: "May 2026", type: "PDF", sz: "5.1 MB" }, { t: "Device Scan Report", d: "Today", type: "PDF", sz: "1.2 MB" }, { t: "SOC 2 Compliance Report", d: "Q1 2026", type: "PDF", sz: "8.7 MB" }, { t: "Network Traffic Analysis", d: "Apr 2026", type: "CSV", sz: "14.2 MB" }].map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "13px 0", borderBottom: "1px solid var(--dbo)" }}>
            <div style={{ fontSize: 20, opacity: .4 }}>📄</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500, color: "var(--dt)", fontFamily: "var(--fm)" }}>{r.t}</div><div style={{ fontSize: 10, color: "var(--dm)", marginTop: 3, fontFamily: "var(--fm)" }}>{r.d} · {r.sz}</div></div>
            <div style={{ fontSize: 10, padding: "3px 7px", background: "rgba(34,211,238,.07)", border: "1px solid rgba(34,211,238,.18)", borderRadius: 3, color: "var(--dc)", fontFamily: "var(--fm)" }}>{r.type}</div>
            <button style={{ padding: "6px 12px", background: "transparent", border: "1px solid var(--dbo2)", borderRadius: 4, color: "var(--dc)", fontSize: 11, cursor: "pointer", fontFamily: "var(--fm)" }}>Download</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SetsV({ user, pkg }) {
  const [cfgOpen, setCfgOpen] = useState(false);
  const [localCfg, setLocalCfg] = useState({ ...CFG });
  return (
    <>
      <div className="g2">
        {[
          { title: "Account", icon: "◈", fields: [["Login Username", user.name], ["Email", user.email], ["Role", user.role], ["Plan", `${pkg.name} · ${pkg.tier}`], ["Scan Depth", pkg.scanDepth], ["Max Endpoints", pkg.maxEndpoints >= 99999 ? "Unlimited" : pkg.maxEndpoints]] },
          { title: "Notifications", icon: "⚡", fields: [["Email Alerts", "Enabled"], ["Critical Only", "Disabled"], ["Welcome Email", "Enabled"], ["Slack Integration", "Not configured"]] },
          { title: "Security", icon: "🛡", fields: [["Google OAuth", CFG.GOOGLE_CLIENT_ID.startsWith("YOUR") ? "Not configured" : "Configured"], ["Two-Factor Auth", "Enabled"], ["Last Login", new Date().toLocaleDateString()], ["Active Sessions", "1"]] },
          { title: "Data & Scan", icon: "🔬", fields: [["Log Retention", `${pkg.logDays} days`], ["App Scan Limit", pkg.appScanLimit >= 500 ? "Unlimited" : pkg.appScanLimit], ["Export Format", "JSON, CSV"], ["Encryption", "AES-256"]] },
        ].map(sec => (
          <div key={sec.title} className="pn">
            <div className="ph"><div className="pt">{sec.icon} {sec.title}</div></div>
            <div className="pb">
              {sec.fields.map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--dbo)", fontSize: 12, fontFamily: "var(--fm)" }}>
                  <span style={{ color: "var(--dm)" }}>{k}</span><span style={{ color: "var(--dt)" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* OAuth + EmailJS Config */}
      <div className="pn">
        <div className="ph">
          <div className="pt">⚙ OAuth & Email Configuration</div>
          <button onClick={() => setCfgOpen(!cfgOpen)} style={{ padding: "5px 12px", background: "transparent", border: "1px solid var(--dbo2)", borderRadius: 4, color: "var(--dc)", fontSize: 11, cursor: "pointer", fontFamily: "var(--fm)" }}>
            {cfgOpen ? "Hide" : "Configure"}
          </button>
        </div>
        {cfgOpen && (
          <div className="pb">
            <div style={{ fontSize: 12, color: "var(--dm)", fontFamily: "var(--fm)", marginBottom: 16, lineHeight: 1.7, padding: "10px 12px", background: "rgba(34,211,238,.05)", borderRadius: 8, border: "1px solid var(--dbo2)" }}>
              📋 <strong style={{ color: "var(--dt)" }}>Setup Guide:</strong><br />
              1. Go to <span style={{ color: "var(--dc)" }}>console.cloud.google.com</span> → Create project → Enable "Google Identity API" → Create OAuth 2.0 Client ID → paste below<br />
              2. Go to <span style={{ color: "var(--dc)" }}>emailjs.com</span> → Free account → Connect Gmail/Outlook → Create template with variables: to_email, to_name, package_name, package_tier, package_price, support_email, support_phone
            </div>
            {[["Google Client ID", "GOOGLE_CLIENT_ID", "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"], ["EmailJS Service ID", "EMAILJS_SERVICE", "service_xxxxxxxx"], ["EmailJS Template ID", "EMAILJS_TEMPLATE", "template_xxxxxxxx"], ["EmailJS Public Key", "EMAILJS_KEY", "public key from emailjs dashboard"]].map(([label, key, ph]) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--dm)", textTransform: "uppercase", display: "block", marginBottom: 6, fontFamily: "var(--fm)" }}>{label}</label>
                <input value={localCfg[key]} onChange={e => setLocalCfg(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={ph}
                  style={{ width: "100%", padding: "9px 12px", background: "var(--db2)", border: "1px solid var(--dbo2)", borderRadius: 8, color: "var(--dt)", fontFamily: "var(--fm)", fontSize: 12, outline: "none" }} />
              </div>
            ))}
            <div style={{ fontSize: 11, color: "#eab308", fontFamily: "var(--fm)", marginTop: 4, padding: "8px 12px", background: "rgba(234,179,8,.07)", borderRadius: 6, border: "1px solid rgba(234,179,8,.2)" }}>
              ⚠ Enter your real credentials and redeploy the app for OAuth and email to be fully functional.
            </div>
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="pn">
        <div className="ph"><div className="pt">✉ Support & Contact</div></div>
        <div className="pb">
          {[["Email Support", B.email, "✉"], ["Phone / WhatsApp", B.phone, "📱"], ["Headquarters", "Dubai, UAE", "📍"], ["Response SLA", "< 2h business hours · 24/7 critical", "⏱"]].map(([k, v, ic]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--dbo)", fontSize: 12, fontFamily: "var(--fm)" }}>
              <span style={{ color: "var(--dm)", display: "flex", alignItems: "center", gap: 7 }}><span>{ic}</span>{k}</span>
              <span style={{ color: "var(--dc)" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   🚀  ROOT
════════════════════════════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);

  const handleAuth = useCallback(async u => {
    setUser(u); setShowAuth(false);
    if (u.isNew || !u.pkg) { setScreen("pricing"); }
    else { setScreen("dashboard"); }
  }, []);

  const handlePkg = useCallback(pkgId => {
    const updUser = u => {
      const newUser = { ...u, pkg: pkgId };
      if (u.isNew && u.email && u.name) {
        const pkg = PKGS.find(p => p.id === pkgId) || PKGS[0];
        setTimeout(() => sendWelcomeEmail(newUser, pkg), 1500);
      }
      return newUser;
    };
    setUser(prev => updUser(prev || {}));
    setScreen("dashboard");
  }, []);

  const handleLogout = useCallback(() => { setUser(null); setScreen("landing"); setShowAuth(false); }, []);

  return (
    <>
      <style>{CSS}</style>
      {screen === "landing" && (
        <>
          <Landing onSignIn={() => setShowAuth(true)} onStart={() => setShowAuth(true)} />
          {showAuth && <AuthModal onAuth={handleAuth} onClose={() => setShowAuth(false)} />}
        </>
      )}
      {screen === "pricing" && (
        <PricingPage onSelect={handlePkg} onBack={() => setScreen(user && user.pkg ? "dashboard" : "landing")} />
      )}
      {screen === "dashboard" && user && (
        <Dashboard user={user} onLogout={handleLogout} onUpgrade={() => setScreen("pricing")} />
      )}
    </>
  );
}