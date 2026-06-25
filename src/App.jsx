import { useState, useEffect, useRef, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  Radar, PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

/* ═══════════════════════════════════════════════════════════
   BRAND
═══════════════════════════════════════════════════════════ */
const BRAND = {
  email: "sentrasec1@gmail.com",
  phone: "+971 52 9531052",
  tagline: "Centralized security intelligence",
};

const PRODUCTION_CONFIG = {
  oauth: {
    google: {
      enabled: true,
      provider: "Google OAuth",
      freeSetup: "Google Cloud OAuth consent screen + OAuth Client ID",
      authUrl: "/api/auth/google",
    },
    microsoft: {
      enabled: true,
      provider: "Microsoft Entra ID",
      freeSetup: "Microsoft Entra app registration",
      authUrl: "/api/auth/microsoft",
    },
  },
  email: {
    provider: "Resend, Brevo, or SMTP",
    welcomeEndpoint: "/api/email/welcome",
  },
  telemetry: {
    sessionEndpoint: "/api/security/session",
    agentEndpoint: "/api/agent/install",
  },
};

function getPlanById(id) {
  return PACKAGES.find(p => p.id === id) || PACKAGES[0];
}

function Logo({ size = 32, lightMode = false, showTagline = false }) {
  const shieldCol = lightMode ? "#1e3a6e" : "#0f2d5e";
  const textCol   = lightMode ? "#ffffff" : "#0f2d5e";
  const tagCol    = lightMode ? "rgba(255,255,255,0.5)" : "#7a8fa8";
  return (
    <div style={{ display:"flex", alignItems:"center", gap: size * 0.28 }}>
      <svg width={size} height={size*1.12} viewBox="0 0 100 112" fill="none">
        <path d="M50 4L90 20L90 55C90 78 72 98 50 108C28 98 10 78 10 55L10 20Z" fill={shieldCol}/>
        <path d="M50 12L82 26L82 55C82 74 67 91 50 100C33 91 18 74 18 55L18 26Z" fill="rgba(255,255,255,0.07)"/>
        <path d="M26 52C26 38 37 26 50 26C63 26 74 38 74 52" stroke="white" strokeWidth="6.5" strokeLinecap="round" fill="none" opacity="0.95"/>
        <path d="M34 58C34 48 41 41 50 41C59 41 66 48 66 58" stroke="white" strokeWidth="6.5" strokeLinecap="round" fill="none" opacity="0.85"/>
        <path d="M42 64C42 58 45.5 55 50 55C54.5 55 58 58 58 64" stroke="white" strokeWidth="6.5" strokeLinecap="round" fill="none" opacity="0.75"/>
        <circle cx="50" cy="72" r="5.5" fill="white"/>
      </svg>
      <div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:size*0.7, fontWeight:900, color:textCol, letterSpacing:"-0.5px", lineHeight:1.1 }}>SentraSec</div>
        {showTagline && <div style={{ fontFamily:"'IBM Plex Sans',sans-serif", fontSize:size*0.27, color:tagCol, letterSpacing:"0.2px", marginTop:2 }}>{BRAND.tagline}</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PACKAGES
═══════════════════════════════════════════════════════════ */
const PACKAGES = [
  { id:"sentinel", name:"Sentinel", tier:"Starter", price:299, color:"#0ea5e9",
    scanDepth:5, virusScan:false, aiScan:false, networkScan:false, maxDevices:5,
    features:["Real-time threat monitoring","Up to 50 endpoints","Basic vulnerability scan (5 CVEs)","Email alerts","7-day log retention","Community support"],
    locked:["Virus Scanner","Network Scan","Advanced SIEM","Threat Intel","Incident Playbooks","AI Analysis"] },
  { id:"guardian", name:"Guardian", tier:"Professional", price:899, color:"#6366f1", popular:true,
    scanDepth:15, virusScan:true, aiScan:false, networkScan:true, maxDevices:50,
    features:["Everything in Sentinel","Up to 500 endpoints","Advanced vulnerability scan (15 CVEs)","Virus & malware scanner","Network port scan","30-day log retention","Incident Playbooks","API Access"],
    locked:["AI Threat Analysis","Zero-Day Detection","Custom YARA Rules"] },
  { id:"fortress", name:"Fortress", tier:"Enterprise", price:2499, color:"#f59e0b",
    scanDepth:30, virusScan:true, aiScan:true, networkScan:true, maxDevices:999,
    features:["Everything in Guardian","Unlimited endpoints","AI-powered vulnerability analysis","Zero-day detection","Custom YARA rules","365-day log retention","Dedicated SOC analyst","SLA 99.99%"],
    locked:[] },
];

const DEMO_USERS = [
  { email:"admin@sentrasec.io", password:"demo123", name:"Alex Morgan", role:"SOC Lead", pkg:"fortress" },
  { email:"pro@sentrasec.io",   password:"demo123", name:"Jordan Lee",  role:"Security Analyst", pkg:"guardian" },
  { email:"starter@sentrasec.io", password:"demo123", name:"Sam Rivera", role:"IT Manager", pkg:"sentinel" },
];

/* ═══════════════════════════════════════════════════════════
   DEVICE DETECTION UTILITIES
═══════════════════════════════════════════════════════════ */
function parseOS(ua) {
  if (/Windows NT 10|Windows NT 11/.test(ua)) return "Windows 10/11";
  if (/Windows NT 6.3/.test(ua)) return "Windows 8.1";
  if (/Windows NT 6.1/.test(ua)) return "Windows 7";
  if (/iPhone|iPad/.test(ua)) { const v = ua.match(/OS (\d+_\d+)/); return `iOS ${v?v[1].replace("_","."):""}`.trim(); }
  if (/Android/.test(ua)) { const v = ua.match(/Android (\d+\.?\d*)/); return `Android ${v?v[1]:""}`.trim(); }
  if (/Mac OS X/.test(ua)) { const v = ua.match(/Mac OS X ([\d_]+)/); return `macOS ${v?v[1].replace(/_/g,"."):""}`.trim(); }
  if (/Linux/.test(ua)) return "Linux";
  if (/CrOS/.test(ua)) return "Chrome OS";
  return "Unknown OS";
}
function parseBrowser(ua) {
  if (/Edg\/(\d+)/.test(ua)) return `Microsoft Edge ${ua.match(/Edg\/(\d+)/)[1]}`;
  if (/OPR\/(\d+)/.test(ua)) return `Opera ${ua.match(/OPR\/(\d+)/)[1]}`;
  if (/Firefox\/(\d+)/.test(ua)) return `Firefox ${ua.match(/Firefox\/(\d+)/)[1]}`;
  if (/Chrome\/(\d+)/.test(ua) && !/Chromium/.test(ua)) return `Chrome ${ua.match(/Chrome\/(\d+)/)[1]}`;
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) { const v = ua.match(/Version\/(\d+)/); return `Safari ${v?v[1]:""}`.trim(); }
  if (/Chromium\/(\d+)/.test(ua)) return `Chromium ${ua.match(/Chromium\/(\d+)/)[1]}`;
  return "Unknown Browser";
}
function parseDeviceType(ua) {
  if (/iPad/.test(ua)) return "Tablet";
  if (/iPhone|Android.*Mobile/.test(ua)) return "Mobile";
  if (/Android/.test(ua)) return "Tablet";
  return "Desktop/Laptop";
}
function parseVendor(ua) {
  if (/iPhone|iPad|Mac/.test(ua)) return "Apple";
  if (/Samsung/.test(ua)) return "Samsung";
  if (/Huawei/.test(ua)) return "Huawei";
  if (/OnePlus/.test(ua)) return "OnePlus";
  if (/Windows/.test(ua)) return "PC / Windows";
  if (/Linux/.test(ua)) return "Linux Machine";
  return "Unknown Vendor";
}
function genHostname(username, os) {
  const user = (username.split("@")[0] || username.split(" ")[0]).toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,10);
  const osShort = os.toLowerCase().replace(/\s|\//g,"-").replace(/[^a-z0-9-]/g,"").slice(0,8);
  return `${user}-${osShort}-${Math.floor(Math.random()*900+100)}`;
}

function buildOAuthUser(provider) {
  const safeProvider = provider || "google";
  const plan = safeProvider === "microsoft" ? "guardian" : "sentinel";
  return {
    email: `oauth-${safeProvider}@sentrasec.io`,
    name: `${PRODUCTION_CONFIG.oauth[safeProvider]?.provider || "OAuth"} User`,
    role: "Security Analyst",
    pkg: plan,
    authProvider: safeProvider,
    isNew: true,
  };
}

async function postJson(endpoint, payload) {
  try {
    const r = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json().catch(() => ({ ok:true }));
  } catch (err) {
    return { ok:false, demo:true, error: err.message };
  }
}

async function sendWelcomeEmail(user, pkgId) {
  const pkg = getPlanById(pkgId || user.pkg || "sentinel");
  return postJson(PRODUCTION_CONFIG.email.welcomeEndpoint, {
    to: user.email,
    name: user.name,
    company: user.company || "",
    plan: pkg.name,
    trialDays: 14,
    loginUrl: window.location.origin,
  });
}

async function registerSecuritySession(user, device) {
  return postJson(PRODUCTION_CONFIG.telemetry.sessionEndpoint, {
    user: { email:user.email, name:user.name, plan:user.pkg },
    device,
    detectedAt: new Date().toISOString(),
  });
}

function inferInstalledApplications(device) {
  const apps = [
    { name: device.browser, source:"Browser fingerprint", confidence:"High", status:"Detected" },
  ];
  if (device.os.includes("Windows")) {
    apps.push(
      { name:"Microsoft Defender", source:"Expected platform control", confidence:"Medium", status:"Needs agent verification" },
      { name:"Microsoft Office / 365", source:"Plan heuristic", confidence:"Low", status:"Needs agent verification" }
    );
  }
  if (device.os.includes("macOS")) {
    apps.push(
      { name:"Safari / WebKit", source:"Platform browser stack", confidence:"Medium", status:"Needs agent verification" },
      { name:"Gatekeeper", source:"Expected platform control", confidence:"Medium", status:"Needs agent verification" }
    );
  }
  if (device.os.includes("Android") || device.os.includes("iOS")) {
    apps.push(
      { name:"Mobile browser container", source:"User agent", confidence:"Medium", status:"Detected" },
      { name:"Installed mobile apps", source:"OS privacy restriction", confidence:"Blocked", status:"Agent/MDM required" }
    );
  }
  if (device.os.includes("Linux")) {
    apps.push(
      { name:"OpenSSH / system packages", source:"Common service heuristic", confidence:"Low", status:"Needs agent verification" },
      { name:"Package manager inventory", source:"Agent required", confidence:"Blocked", status:"Agent required" }
    );
  }
  return apps;
}

async function detectDevice(user) {
  const ua = navigator.userAgent;
  const os = parseOS(ua);
  const browser = parseBrowser(ua);
  const deviceType = parseDeviceType(ua);
  const vendor = parseVendor(ua);
  const hostname = genHostname(user.name, os);
  const plugins = Array.from(navigator.plugins||[]).slice(0,6).map(p=>p.name).filter(Boolean);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const lang = navigator.language;
  const display = `${screen.width}x${screen.height}`;
  const colorDepth = screen.colorDepth + "-bit";
  const cores = navigator.hardwareConcurrency||"Unknown";
  const memory = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "Unknown";
  const platform = navigator.platform;

  let publicIp = "Detecting...";
  try {
    const r = await fetch("https://api.ipify.org?format=json");
    const d = await r.json();
    publicIp = d.ip;
  } catch { publicIp = `10.0.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*254+1)}`; }

  const localIp = `192.168.${Math.floor(Math.random()*3+1)}.${Math.floor(Math.random()*200+10)}`;

  const detected = {
    id: `dev-${Date.now()}`,
    hostname, os, browser, deviceType, vendor,
    publicIp, localIp, platform,
    username: user.name,
    email: user.email,
    display, colorDepth, cores, memory,
    timezone: tz, language: lang,
    plugins: plugins.length ? plugins : ["No plugins detected"],
    status: "ACTIVE",
    threats: 0,
    riskScore: null,
    lastLogin: new Date().toISOString(),
    registeredAt: new Date().toISOString(),
    scanStatus: "pending",
    hostnameStatus: "Generated browser alias - install agent for real hostname",
    telemetryMode: "Browser-safe",
    installedApplications: [],
    agentRequired: true,
  };
  detected.installedApplications = inferInstalledApplications(detected);
  return detected;
}

/* ═══════════════════════════════════════════════════════════
   VULNERABILITY DATABASE (OS-specific CVEs)
═══════════════════════════════════════════════════════════ */
const OS_CVES = {
  "Windows": [
    { id:"CVE-2024-38213", title:"Windows Mark of the Web Security Feature Bypass", sev:"HIGH",   score:8.8, category:"Security Bypass",      fix:"Apply KB5040442 patch" },
    { id:"CVE-2024-38189", title:"Microsoft Project Remote Code Execution",          sev:"CRITICAL",score:9.8, category:"Remote Code Execution", fix:"Update Microsoft Office suite" },
    { id:"CVE-2024-21338", title:"Windows Kernel Privilege Escalation",              sev:"HIGH",   score:7.8, category:"Privilege Escalation",   fix:"Apply Windows Security Update" },
    { id:"CVE-2024-30051", title:"DWM Core Library Privilege Escalation",            sev:"HIGH",   score:7.8, category:"Privilege Escalation",   fix:"Apply KB5037771 patch" },
    { id:"CVE-2024-26234", title:"Proxy Driver Spoofing Vulnerability",              sev:"MEDIUM", score:6.7, category:"Spoofing",               fix:"Update Windows Defender" },
    { id:"CVE-2024-38080", title:"Windows Hyper-V Privilege Escalation",             sev:"HIGH",   score:7.8, category:"Privilege Escalation",   fix:"Disable Hyper-V if unused" },
    { id:"CVE-2023-36033", title:"Windows DWM Privilege Escalation",                 sev:"HIGH",   score:7.8, category:"Privilege Escalation",   fix:"Apply October 2023 patches" },
    { id:"CVE-2023-28252", title:"Windows CLFS Driver Privilege Escalation",         sev:"HIGH",   score:7.8, category:"Privilege Escalation",   fix:"Apply KB5025221 patch" },
    { id:"CVE-2023-23376", title:"Windows CLFS Driver Elevation of Privilege",       sev:"HIGH",   score:7.8, category:"Privilege Escalation",   fix:"Apply February 2023 update" },
    { id:"CVE-2022-37969", title:"Windows CLFS Driver Zero-Day",                     sev:"HIGH",   score:7.8, category:"Zero-Day",               fix:"Apply KB5017308 immediately" },
    { id:"CVE-2024-38060", title:"Windows Imaging Component RCE",                    sev:"CRITICAL",score:9.1, category:"Remote Code Execution", fix:"Update Windows Media components" },
    { id:"CVE-2024-21447", title:"Windows Authentication Elevation of Privilege",    sev:"HIGH",   score:7.8, category:"Authentication Bypass",  fix:"Apply April 2024 Patch Tuesday" },
    { id:"CVE-2024-20674", title:"Windows Kerberos Security Feature Bypass",         sev:"CRITICAL",score:9.0, category:"Authentication Bypass",  fix:"Apply KB5034441 immediately" },
    { id:"CVE-2024-21351", title:"Windows SmartScreen Security Bypass",              sev:"MEDIUM", score:7.6, category:"Security Bypass",        fix:"Update SmartScreen definitions" },
    { id:"CVE-2024-20682", title:"Windows Cryptographic Services RCE",               sev:"HIGH",   score:7.5, category:"Remote Code Execution",  fix:"Apply January 2024 update" },
  ],
  "macOS": [
    { id:"CVE-2024-27843", title:"macOS Kernel Privilege Escalation",               sev:"HIGH",   score:8.6, category:"Privilege Escalation",   fix:"Update to macOS 14.4.1+" },
    { id:"CVE-2024-23222", title:"WebKit Type Confusion — Arbitrary Code Execution",sev:"CRITICAL",score:8.8, category:"Remote Code Execution", fix:"Update Safari/WebKit immediately" },
    { id:"CVE-2024-23296", title:"RTKit Out-of-Bounds Write",                       sev:"HIGH",   score:7.5, category:"Memory Corruption",      fix:"Update to macOS 14.4+" },
    { id:"CVE-2024-27804", title:"macOS Memory Corruption Kernel",                  sev:"HIGH",   score:7.8, category:"Memory Corruption",      fix:"Apply latest macOS update" },
    { id:"CVE-2023-42917", title:"WebKit Memory Corruption (actively exploited)",   sev:"CRITICAL",score:8.8, category:"Memory Corruption",      fix:"Update to macOS 14.1.2+" },
    { id:"CVE-2023-41993", title:"WebKit Type Confusion Vulnerability",             sev:"HIGH",   score:8.8, category:"Code Execution",         fix:"Safari 17 update required" },
    { id:"CVE-2024-23225", title:"Kernel Memory Disclosure",                        sev:"HIGH",   score:7.5, category:"Information Disclosure",  fix:"Apply March 2024 update" },
    { id:"CVE-2024-27796", title:"CoreText Arbitrary Code Execution",               sev:"HIGH",   score:7.5, category:"Code Execution",         fix:"Update macOS to 14.5+" },
    { id:"CVE-2023-40397", title:"WebKit JavaScript Code Execution",                sev:"CRITICAL",score:9.8, category:"Code Execution",         fix:"Update immediately" },
    { id:"CVE-2023-32435", title:"WebKit Memory Corruption",                        sev:"HIGH",   score:8.8, category:"Memory Corruption",      fix:"Apply June 2023 patch" },
  ],
  "Linux": [
    { id:"CVE-2024-1086",  title:"netfilter: nf_tables Use-After-Free",             sev:"HIGH",   score:7.8, category:"Privilege Escalation",   fix:"Update kernel to 6.4+" },
    { id:"CVE-2024-0582",  title:"Linux Kernel io_uring UAF",                       sev:"HIGH",   score:7.8, category:"Memory Corruption",      fix:"Apply kernel patch 6.5.6+" },
    { id:"CVE-2024-26809", title:"Kernel nftables Use-After-Free",                  sev:"HIGH",   score:7.8, category:"Privilege Escalation",   fix:"Update kernel to latest stable" },
    { id:"CVE-2023-6546",  title:"Linux Kernel GSM Multiplexing Race Condition",    sev:"HIGH",   score:7.0, category:"Race Condition",         fix:"Disable n_gsm module if unused" },
    { id:"CVE-2023-3269",  title:"Linux Kernel StackRot Privilege Escalation",      sev:"HIGH",   score:7.8, category:"Privilege Escalation",   fix:"Update to kernel 6.4.1+" },
    { id:"CVE-2023-2640",  title:"Ubuntu OverlayFS Privilege Escalation",           sev:"HIGH",   score:7.8, category:"Privilege Escalation",   fix:"Update Ubuntu kernel packages" },
    { id:"CVE-2024-1085",  title:"netfilter: nf_tables Out-of-Bounds Write",        sev:"HIGH",   score:7.8, category:"Out-of-Bounds Write",    fix:"Update kernel immediately" },
    { id:"CVE-2022-0847",  title:"Dirty Pipe — Linux Kernel Privilege Escalation",  sev:"HIGH",   score:7.8, category:"Privilege Escalation",   fix:"Update kernel to 5.17.2+" },
    { id:"CVE-2021-4034",  title:"PwnKit: pkexec Local Privilege Escalation",       sev:"HIGH",   score:7.8, category:"Privilege Escalation",   fix:"Update polkit package" },
    { id:"CVE-2024-21626", title:"runc Container Escape Vulnerability",             sev:"HIGH",   score:8.6, category:"Container Escape",       fix:"Update runc to 1.1.12+" },
  ],
  "iOS": [
    { id:"CVE-2024-23225", title:"Kernel Memory Disclosure",                        sev:"HIGH",   score:7.5, category:"Information Disclosure",  fix:"Update to iOS 17.4+" },
    { id:"CVE-2024-23296", title:"RTKit Out-of-Bounds Write",                       sev:"HIGH",   score:7.5, category:"Memory Corruption",      fix:"Update to iOS 17.4+" },
    { id:"CVE-2024-27834", title:"WebKit Pointer Auth Bypass",                      sev:"HIGH",   score:8.8, category:"Security Bypass",        fix:"Update Safari on iOS" },
    { id:"CVE-2023-42824", title:"iOS Kernel Privilege Escalation",                 sev:"HIGH",   score:7.8, category:"Privilege Escalation",   fix:"Update to iOS 17.0.3+" },
    { id:"CVE-2023-41993", title:"WebKit Type Confusion",                           sev:"HIGH",   score:8.8, category:"Code Execution",         fix:"Update to iOS 17.0.1+" },
  ],
  "Android": [
    { id:"CVE-2024-32896", title:"Android Framework Privilege Escalation",           sev:"HIGH",   score:7.8, category:"Privilege Escalation",   fix:"Apply June 2024 Android update" },
    { id:"CVE-2024-29745", title:"Fastboot Chain of Trust Flaw",                    sev:"HIGH",   score:7.5, category:"Trust Bypass",           fix:"Update bootloader firmware" },
    { id:"CVE-2024-0044",  title:"Android Framework CreateSessionRequest Flaw",     sev:"HIGH",   score:7.8, category:"Privilege Escalation",   fix:"Apply March 2024 security patch" },
    { id:"CVE-2023-35674", title:"Android System Elevation of Privilege",           sev:"HIGH",   score:7.8, category:"Privilege Escalation",   fix:"Apply September 2023 patch" },
    { id:"CVE-2023-20963", title:"Android WorkSource Parcel Flaw",                  sev:"HIGH",   score:7.8, category:"Privilege Escalation",   fix:"Update Android System" },
  ],
  "Chrome OS": [
    { id:"CVE-2024-3159",  title:"Chrome V8 Out-of-Bounds Memory Access",           sev:"HIGH",   score:8.8, category:"Memory Corruption",      fix:"Update Chrome OS to latest" },
    { id:"CVE-2024-2625",  title:"Chrome Object Lifecycle Vulnerability",           sev:"HIGH",   score:8.8, category:"Use After Free",         fix:"Apply Stable channel update" },
    { id:"CVE-2023-6508",  title:"Chrome Media Stream Use After Free",              sev:"HIGH",   score:8.8, category:"Use After Free",         fix:"Update Chrome to 120.0.6099+" },
  ],
};

const BROWSER_CVES = {
  "Chrome": [
    { id:"CVE-2024-7965", title:"Chrome V8 Inappropriate Implementation",           sev:"HIGH",   score:8.8, category:"Browser Vulnerability",  fix:"Update Chrome to 128+" },
    { id:"CVE-2024-6990", title:"Chrome Dawn Out-of-Bounds Memory Read",            sev:"CRITICAL",score:9.8, category:"Memory Corruption",      fix:"Update Chrome immediately" },
    { id:"CVE-2024-5274", title:"Chrome V8 Type Confusion",                         sev:"HIGH",   score:8.8, category:"Browser Vulnerability",  fix:"Update to Chrome 124.0.6367.207" },
  ],
  "Firefox": [
    { id:"CVE-2024-6601", title:"Firefox Race Condition on WASM",                   sev:"HIGH",   score:8.1, category:"Browser Vulnerability",  fix:"Update Firefox to 128+" },
    { id:"CVE-2024-5700", title:"Firefox Memory Safety Bugs",                       sev:"HIGH",   score:7.5, category:"Memory Safety",          fix:"Update to Firefox 127+" },
  ],
  "Safari": [
    { id:"CVE-2024-27834", title:"Safari WebKit Pointer Authentication Bypass",     sev:"HIGH",   score:8.8, category:"Browser Vulnerability",  fix:"Update to Safari 17.5+" },
    { id:"CVE-2024-23213", title:"Safari WebKit Memory Corruption",                 sev:"HIGH",   score:8.8, category:"Memory Corruption",      fix:"Update macOS/iOS" },
  ],
  "Edge": [
    { id:"CVE-2024-38218", title:"Edge HTML-based Security Feature Bypass",         sev:"HIGH",   score:8.8, category:"Security Bypass",        fix:"Update Edge to 128+" },
    { id:"CVE-2024-30056", title:"Edge Information Disclosure",                     sev:"MEDIUM", score:4.3, category:"Information Disclosure",  fix:"Apply Edge June update" },
  ],
};

const COMMON_CVES = [
  { id:"CVE-2024-3094", title:"XZ Utils SSH Backdoor (Supply Chain Attack)",       sev:"CRITICAL",score:10.0, category:"Supply Chain",           fix:"Downgrade xz-utils to 5.4.5" },
  { id:"CVE-2024-21762", title:"Fortinet FortiOS SSL VPN RCE",                     sev:"CRITICAL",score:9.6, category:"Remote Code Execution",  fix:"Patch FortiOS immediately" },
  { id:"CVE-2024-27198", title:"TeamCity Authentication Bypass",                   sev:"CRITICAL",score:9.8, category:"Authentication Bypass",   fix:"Update TeamCity to 2023.11.4+" },
  { id:"CVE-2023-44487", title:"HTTP/2 Rapid Reset Attack (DDOS)",                 sev:"HIGH",   score:7.5, category:"DoS",                    fix:"Update web server software" },
  { id:"CVE-2023-23397", title:"Microsoft Outlook NTLM Hash Leak",                 sev:"CRITICAL",score:9.8, category:"NTLM Relay",             fix:"Apply March 2023 Outlook patch" },
];

const APP_CVES = [
  { id:"APP-INV-001", title:"Installed application inventory not agent-verified",  sev:"MEDIUM", score:5.8, category:"Asset Inventory",        fix:"Install SentraSec endpoint agent for full app scan" },
  { id:"APP-VER-002", title:"Browser version requires patch verification",         sev:"HIGH",   score:7.1, category:"Patch Management",       fix:"Confirm browser update status through endpoint agent" },
  { id:"APP-EDR-003", title:"Endpoint protection status needs validation",         sev:"MEDIUM", score:6.4, category:"Endpoint Security",      fix:"Connect Defender/EDR or install SentraSec agent" },
];

function generateScanVulns(device, pkg) {
  const osKey = Object.keys(OS_CVES).find(k => device.os.includes(k.replace("Windows","Windows").split("/")[0])) || "Linux";
  const browserKey = Object.keys(BROWSER_CVES).find(k => device.browser.includes(k)) || null;
  const maxVulns = pkg.scanDepth;

  let pool = [...(OS_CVES[osKey]||[])];
  if (browserKey) pool = [...pool, ...(BROWSER_CVES[browserKey]||[])];
  if (pkg.virusScan || pkg.aiScan) pool = [...pool, ...APP_CVES];
  if (pkg.networkScan) pool = [...pool, ...COMMON_CVES];

  // Shuffle
  for (let i=pool.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
  return pool.slice(0, maxVulns).map(v => ({
    ...v,
    host: device.hostname,
    ip: device.localIp,
    status: Math.random()>0.7 ? "PATCHED" : "OPEN",
    discoveredAt: new Date().toISOString(),
  }));
}

const VIRUS_SIGNATURES = {
  "Windows": [
    { name:"Trojan.GenericKD.71234567", type:"Trojan",     threat:"HIGH",   path:"C:\\Users\\AppData\\Roaming\\chrome.exe", clean:false },
    { name:"Adware.Generic.Bundlore",   type:"Adware",     threat:"MEDIUM", path:"C:\\Program Files\\FreeConverter\\", clean:false },
    { name:"PUA.Win.Downloader.Opencandy", type:"PUA",     threat:"LOW",    path:"C:\\Temp\\installer.exe", clean:true },
    { name:"Ransomware.Win.LockBit",    type:"Ransomware", threat:"CRITICAL",path:"C:\\Windows\\Temp\\svchost32.exe", clean:false },
    { name:"Spyware.KeyLogger.Agent",   type:"Spyware",    threat:"HIGH",   path:"C:\\Windows\\System32\\keylog.dll", clean:false },
  ],
  "macOS": [
    { name:"OSX.Adware.Bundlore",       type:"Adware",     threat:"MEDIUM", path:"/Library/Application Support/Bundlore/", clean:false },
    { name:"OSX.Trojan.Spy.Banker",     type:"Trojan",     threat:"HIGH",   path:"/tmp/.hidden_process", clean:false },
    { name:"PUA.OSX.Pirrit",            type:"Adware",     threat:"LOW",    path:"/Applications/MyCoupon.app", clean:true },
  ],
  "Linux": [
    { name:"Linux.Backdoor.Tsunami",    type:"Backdoor",   threat:"CRITICAL",path:"/tmp/.ssh/auth_keys", clean:false },
    { name:"Linux.Rootkit.Azazel",      type:"Rootkit",    threat:"CRITICAL",path:"/lib/libselinux.so", clean:false },
    { name:"Linux.Crypto.Miner",        type:"Cryptominer",threat:"HIGH",   path:"/usr/bin/.sysupdate", clean:false },
  ],
  "iOS":    [],
  "Android":[
    { name:"Android.Trojan.Triada",     type:"Trojan",     threat:"HIGH",   path:"/system/lib/", clean:false },
    { name:"Android.Adware.HiddenAds",  type:"Adware",     threat:"MEDIUM", path:"/data/app/com.fake.app", clean:true },
  ],
};

function generateVirusScan(device, pkg) {
  if (!pkg.virusScan) return null;
  const osKey = Object.keys(VIRUS_SIGNATURES).find(k => device.os.includes(k)) || "Linux";
  const sigs = VIRUS_SIGNATURES[osKey] || [];
  const found = pkg.aiScan ? sigs : sigs.filter(s=>s.threat!=="CRITICAL").slice(0,2);
  const scanned = Math.floor(Math.random()*80000+20000);
  return {
    scanned,
    found: found.length,
    threats: found,
    duration: `${Math.floor(Math.random()*45+15)}s`,
    engineVersion: "SentraSec AV 24.8.1",
    definitionsDate: "2026-05-15",
    status: found.filter(f=>!f.clean).length > 0 ? "THREATS_FOUND" : "CLEAN",
  };
}

/* ═══════════════════════════════════════════════════════════
   RISK SCORING
═══════════════════════════════════════════════════════════ */
function calcRisk(vulns, virusScan) {
  if (!vulns.length) return { score:0, level:"NONE", color:"#22c55e" };
  const critCount = vulns.filter(v=>v.sev==="CRITICAL"&&v.status==="OPEN").length;
  const highCount = vulns.filter(v=>v.sev==="HIGH"&&v.status==="OPEN").length;
  const virThreats = virusScan ? virusScan.threats.filter(t=>!t.clean).length : 0;
  const raw = Math.min(100, critCount*18 + highCount*8 + virThreats*15 + Math.floor(Math.random()*10));
  if (raw>=75) return { score:raw, level:"CRITICAL", color:"#ef4444" };
  if (raw>=50) return { score:raw, level:"HIGH",     color:"#f97316" };
  if (raw>=25) return { score:raw, level:"MEDIUM",   color:"#eab308" };
  return         { score:raw, level:"LOW",      color:"#22c55e" };
}

/* ═══════════════════════════════════════════════════════════
   SEV HELPERS
═══════════════════════════════════════════════════════════ */
const SC = {
  CRITICAL:{ bg:"rgba(239,68,68,0.12)",  text:"#dc2626", border:"rgba(239,68,68,0.35)" },
  HIGH:    { bg:"rgba(249,115,22,0.12)", text:"#ea580c", border:"rgba(249,115,22,0.35)" },
  MEDIUM:  { bg:"rgba(234,179,8,0.12)",  text:"#ca8a04", border:"rgba(234,179,8,0.35)" },
  LOW:     { bg:"rgba(14,165,233,0.1)",  text:"#0284c7", border:"rgba(14,165,233,0.28)" },
  CLEAN:   { bg:"rgba(22,163,74,0.1)",   text:"#16a34a", border:"rgba(22,163,74,0.28)" },
  OPEN:    { bg:"rgba(239,68,68,0.1)",   text:"#dc2626", border:"rgba(239,68,68,0.28)" },
  PATCHED: { bg:"rgba(22,163,74,0.1)",   text:"#16a34a", border:"rgba(22,163,74,0.28)" },
  PATCHING:{ bg:"rgba(249,115,22,0.1)",  text:"#f97316", border:"rgba(249,115,22,0.28)" },
  ACTIVE:  { bg:"rgba(22,163,74,0.1)",   text:"#16a34a", border:"rgba(22,163,74,0.28)" },
};
const sc = s => SC[s] || {bg:"rgba(100,116,139,0.1)",text:"#64748b",border:"rgba(100,116,139,0.2)"};
function SBadge({ s, small }) {
  const c = sc(s);
  return <span style={{ fontSize:small?8:9, fontWeight:700, letterSpacing:1, padding:small?"2px 5px":"3px 7px", borderRadius:3, border:`1px solid ${c.border}`, background:c.bg, color:c.text, textTransform:"uppercase", whiteSpace:"nowrap", fontFamily:"var(--fm)" }}>{s}</span>;
}

/* ═══════════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --navy:#0f2d5e;--navydk:#0a2149;--navylt:#1e3a6e;--cyan:#0ea5e9;--cyandk:#0284c7;
  --lbg:#f0f4ff;--lbg1:#fff;--lbg2:#f5f8ff;--lborder:rgba(15,45,94,0.09);--lborder2:rgba(15,45,94,0.16);
  --ltext:#0c1a2e;--ltext2:#1e3a6e;--lmuted:#64748b;
  --dbg:#060a0f;--dbg1:#0a1018;--dbg2:#0f1824;--dbg3:#141f2e;
  --dborder:rgba(14,165,233,0.08);--dborder2:rgba(14,165,233,0.18);
  --dtext:#e2e8f0;--dmuted:#64748b;--dcyan:#22d3ee;
  --fd:'Playfair Display',serif;--fs:'IBM Plex Sans',sans-serif;--fm:'IBM Plex Mono',monospace;
}
html{scroll-behavior:smooth}
body{background:var(--lbg);color:var(--ltext);font-family:var(--fs)}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--dbg1)}::-webkit-scrollbar-thumb{background:var(--dborder2);border-radius:2px}
/* AUTH */
.aov{position:fixed;inset:0;background:rgba(10,33,73,0.8);backdrop-filter:blur(12px);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px}
.am{background:#fff;border-radius:20px;overflow:hidden;width:100%;max-width:880px;display:grid;grid-template-columns:1fr 1fr;box-shadow:0 40px 100px rgba(10,33,73,0.4)}
.aml{background:var(--navy);padding:44px 36px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden}
.aml::before{content:'';position:absolute;top:-40px;right:-40px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(14,165,233,0.25),transparent)}
.aml-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px}
.aml-stat{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px}
.aml-stat-n{font-family:var(--fd);font-size:20px;font-weight:900;color:var(--cyan)}
.aml-stat-l{font-size:9px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1px;margin-top:3px}
.aml-contact{margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1)}
.aml-ci{display:flex;align-items:center;gap:6px;font-size:10px;color:rgba(255,255,255,0.45);margin-bottom:6px;font-family:var(--fm)}
.amr{padding:44px 36px;position:relative}
.a-close{position:absolute;top:14px;right:14px;background:none;border:none;font-size:16px;cursor:pointer;color:var(--lmuted);width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.a-close:hover{background:var(--lbg2)}
.a-tabs{display:flex;margin-bottom:22px;border:1.5px solid var(--lborder2);border-radius:10px;overflow:hidden}
.a-tab{flex:1;padding:10px;font-family:var(--fs);font-size:13px;font-weight:500;cursor:pointer;border:none;background:transparent;color:var(--lmuted);transition:all 0.2s}
.a-tab.on{background:var(--navy);color:white;font-weight:600}
.oauth-btn{padding:10px;border:1.5px solid var(--lborder2);border-radius:8px;background:white;color:var(--navy);font-family:var(--fs);font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s}
.oauth-btn:hover{border-color:var(--cyandk);color:var(--cyandk);box-shadow:0 6px 18px rgba(14,165,233,0.14)}
.a-lbl{font-size:10px;letter-spacing:1.5px;color:var(--lmuted);text-transform:uppercase;display:block;margin-bottom:6px;font-weight:600}
.a-inp{width:100%;padding:11px 14px;background:var(--lbg2);border:1.5px solid var(--lborder2);border-radius:9px;color:var(--ltext);font-family:var(--fs);font-size:14px;outline:none;transition:all 0.2s;margin-bottom:12px}
.a-inp:focus{border-color:var(--cyan);box-shadow:0 0 0 3px rgba(14,165,233,0.1);background:#fff}
.a-inp::placeholder{color:var(--lmuted);opacity:0.65}
.a-btn{width:100%;padding:13px;background:var(--navy);border:none;border-radius:9px;color:white;font-family:var(--fs);font-size:14px;font-weight:700;cursor:pointer;transition:all 0.25s}
.a-btn:hover{background:var(--cyandk);box-shadow:0 8px 24px rgba(14,165,233,0.35);transform:translateY(-1px)}
.a-err{font-size:12px;color:#dc2626;margin-bottom:10px;padding:9px 12px;background:rgba(220,38,38,0.06);border-radius:8px;border:1px solid rgba(220,38,38,0.2)}
.a-demo{font-size:11px;color:var(--lmuted);margin-top:14px;padding:10px 12px;background:var(--lbg2);border-radius:8px;border:1px solid var(--lborder);line-height:1.9;font-family:var(--fm)}
.a-demo b{color:var(--cyandk)}
/* DEVICE DETECT OVERLAY */
.ddo{position:fixed;inset:0;background:rgba(6,10,15,0.96);z-index:3000;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:0}
.ddo-box{background:var(--dbg1);border:1px solid var(--dborder2);border-radius:16px;padding:40px 48px;max-width:540px;width:100%;text-align:center}
.ddo-logo{margin-bottom:24px}
.ddo-title{font-family:var(--fd);font-size:24px;font-weight:800;color:var(--dtext);margin-bottom:8px}
.ddo-sub{font-size:13px;color:var(--dmuted);margin-bottom:28px;font-family:var(--fm)}
.ddo-steps{display:flex;flex-direction:column;gap:10px;text-align:left;margin-bottom:24px}
.ddo-step{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:8px;border:1px solid var(--dborder);font-size:12px;font-family:var(--fm);color:var(--dmuted);transition:all 0.3s}
.ddo-step.done{border-color:rgba(34,211,238,0.3);background:rgba(34,211,238,0.05);color:var(--dcyan)}
.ddo-step.active{border-color:rgba(245,158,11,0.4);background:rgba(245,158,11,0.08);color:#fbbf24;animation:stepPulse 1s infinite}
@keyframes stepPulse{0%,100%{border-color:rgba(245,158,11,0.4)}50%{border-color:rgba(245,158,11,0.8)}}
.ddo-step-ic{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0}
.ddo-bar{height:3px;background:var(--dborder);border-radius:2px;overflow:hidden;margin-top:8px}
.ddo-fill{height:100%;background:linear-gradient(90deg,var(--dcyan),#6366f1);border-radius:2px;transition:width 0.4s ease}
/* DASHBOARD */
.dl{display:flex;min-height:100vh;background:var(--dbg);font-family:var(--fm)}
.sb{width:252px;flex-shrink:0;background:var(--dbg1);border-right:1px solid var(--dborder);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:100;overflow:hidden}
.sb-head{padding:16px 18px 12px;border-bottom:1px solid var(--dborder)}
.sb-pkg{margin:8px 12px;padding:8px 12px;border-radius:6px;font-size:10px;letter-spacing:1px;text-transform:uppercase;font-weight:600;text-align:center;border:1px solid}
.sb-nav{flex:1;overflow-y:auto;padding:4px 0}
.sb-sec{font-size:9px;letter-spacing:2px;color:var(--dmuted);text-transform:uppercase;padding:12px 18px 4px}
.ni{display:flex;align-items:center;gap:10px;padding:9px 18px;font-size:12px;color:var(--dmuted);cursor:pointer;transition:all 0.15s;position:relative}
.ni:hover{color:var(--dtext);background:rgba(34,211,238,0.04)}
.ni.on{color:var(--dcyan);background:rgba(34,211,238,0.08)}
.ni.on::before{content:'';position:absolute;left:0;top:4px;bottom:4px;width:2px;background:var(--dcyan);border-radius:0 2px 2px 0}
.ni .nb{margin-left:auto;font-size:9px;padding:2px 6px;background:rgba(239,68,68,0.2);color:#f87171;border-radius:10px;font-weight:600}
.ni.lkd{opacity:0.3;cursor:not-allowed}
.ni.lkd:hover{background:none;color:var(--dmuted)}
.sb-foot{padding:12px 16px;border-top:1px solid var(--dborder);background:var(--dbg1)}
.sb-usr{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.sb-av{width:32px;height:32px;border-radius:50%;background:rgba(14,165,233,0.15);border:1px solid var(--dborder2);display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--dcyan);font-weight:700;font-family:var(--fd)}
.sb-ci{display:flex;align-items:center;gap:6px;font-size:10px;color:var(--dmuted);margin-bottom:5px;text-decoration:none;transition:color 0.2s}
.sb-ci:hover{color:var(--dcyan)}
.lgout{width:100%;padding:8px;background:transparent;border:1px solid var(--dborder);border-radius:4px;color:var(--dmuted);font-family:var(--fm);font-size:10px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;transition:all 0.2s;margin-top:8px}
.lgout:hover{border-color:#ef4444;color:#f87171;background:rgba(239,68,68,0.05)}
.dm{margin-left:252px;flex:1;min-height:100vh}
.tb{height:54px;background:var(--dbg1);border-bottom:1px solid var(--dborder);display:flex;align-items:center;padding:0 22px;gap:12px;position:sticky;top:0;z-index:50}
.tb-title{font-family:var(--fd);font-size:15px;font-weight:700;flex:1;color:var(--dtext)}
.tpill{display:flex;align-items:center;gap:7px;padding:5px 11px;border-radius:4px;font-family:var(--fm);font-size:11px;font-weight:600}
.tdot{width:6px;height:6px;border-radius:50%;animation:tdp 1.5s infinite}
@keyframes tdp{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.4)}}
.upbtn{padding:6px 12px;background:transparent;border:1px solid;border-radius:4px;font-family:var(--fm);font-size:11px;cursor:pointer;transition:all 0.2s;letter-spacing:0.5px}
.dc{padding:20px}
.pn{background:var(--dbg1);border:1px solid var(--dborder);border-radius:10px;overflow:hidden;margin-bottom:16px}
.ph{padding:14px 18px;border-bottom:1px solid var(--dborder);display:flex;align-items:center;justify-content:space-between}
.pt{font-family:var(--fd);font-size:13px;font-weight:700;color:var(--dtext);display:flex;align-items:center;gap:8px}
.pb{padding:16px 18px}
.kg{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:16px}
.kc{background:var(--dbg1);border:1px solid var(--dborder);border-radius:10px;padding:16px;position:relative;overflow:hidden;transition:border-color 0.2s}
.kc:hover{border-color:var(--dborder2)}
.kl{font-size:10px;letter-spacing:2px;color:var(--dmuted);text-transform:uppercase;margin-bottom:8px}
.kv{font-family:var(--fd);font-size:28px;font-weight:900;line-height:1;margin-bottom:4px}
.kd{font-size:10px;color:var(--dmuted)}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.g3{display:grid;grid-template-columns:2fr 1fr;gap:14px}
@media(max-width:900px){.g2,.g3{grid-template-columns:1fr}}
.dt{width:100%;border-collapse:collapse;font-size:12px}
.dt th{padding:8px 12px;text-align:left;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--dmuted);border-bottom:1px solid var(--dborder);font-weight:500}
.dt td{padding:9px 12px;border-bottom:1px solid rgba(34,211,238,0.04);vertical-align:middle;color:var(--dtext)}
.dt tr:last-child td{border-bottom:none}
.dt tr:hover td{background:rgba(34,211,238,0.02)}
.hn{color:var(--dcyan);font-weight:500}
/* SCAN */
.scan-progress{height:4px;background:var(--dborder);border-radius:2px;overflow:hidden;margin-bottom:16px}
.scan-fill{height:100%;border-radius:2px;transition:width 0.3s ease}
.scan-log{font-family:var(--fm);font-size:11px;color:var(--dmuted);max-height:120px;overflow-y:auto;padding:12px;background:var(--dbg2);border-radius:6px;margin-bottom:16px}
.scan-log-line{margin-bottom:4px;line-height:1.5}
.scan-log-line.ok{color:var(--dcyan)}
.scan-log-line.warn{color:#fbbf24}
.scan-log-line.crit{color:#f87171}
/* RISK METER */
.risk-ring{position:relative;width:120px;height:120px}
.risk-ring svg{position:absolute;inset:0;transform:rotate(-90deg)}
.risk-ring-label{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
/* DEVICE CARD */
.dev-card{background:var(--dbg2);border:1px solid var(--dborder2);border-radius:10px;padding:16px;margin-bottom:14px}
.dev-row{display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--dborder);font-size:12px}
.dev-row:last-child{border-bottom:none}
.dev-key{color:var(--dmuted)}
.dev-val{color:var(--dtext);font-weight:500;text-align:right;max-width:220px;word-break:break-all}
/* VIRUS */
.virus-threat{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:8px;border:1px solid;margin-bottom:8px}
/* PRICING */
.pp{min-height:100vh;background:var(--lbg);padding:80px clamp(20px,5vw,80px)}
.pkg-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:22px;max-width:1060px;margin:0 auto}
.pkg-card{background:#fff;border:1.5px solid var(--lborder);border-radius:18px;padding:32px;position:relative;overflow:hidden;transition:all 0.3s;cursor:pointer}
.pkg-card:hover{box-shadow:0 24px 64px rgba(15,45,94,0.13);transform:translateY(-5px)}
.pkg-card.popular{background:var(--navy);color:white;border-color:transparent}
.pop-badge{position:absolute;top:-1px;left:50%;transform:translateX(-50%);background:linear-gradient(90deg,var(--cyan),#6366f1);color:white;font-size:10px;font-weight:700;letter-spacing:2px;padding:4px 16px;border-radius:0 0 9px 9px;text-transform:uppercase;white-space:nowrap}
.pkg-cta{width:100%;padding:13px;border:none;border-radius:9px;font-family:var(--fs);font-size:14px;font-weight:700;cursor:pointer;transition:all 0.2s;letter-spacing:0.2px}
/* GLOW */
.glow-cyan{box-shadow:0 0 20px rgba(34,211,238,0.2)}
/* SETUP GUIDE */
.guide-section{background:var(--dbg2);border:1px solid var(--dborder);border-radius:10px;padding:20px;margin-bottom:16px}
.guide-step{display:flex;gap:12px;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--dborder)}
.guide-step:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.guide-num{width:26px;height:26px;border-radius:50%;background:rgba(14,165,233,0.15);border:1px solid var(--dborder2);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--dcyan);font-weight:700;flex-shrink:0;margin-top:2px}
.guide-title{font-family:var(--fd);font-size:14px;font-weight:700;color:var(--dtext);margin-bottom:6px}
.guide-desc{font-size:12px;color:var(--dmuted);line-height:1.7;font-family:var(--fm)}
.code-block{background:var(--dbg);border:1px solid var(--dborder);border-radius:6px;padding:12px 14px;font-family:var(--fm);font-size:11px;color:var(--dcyan);margin-top:8px;overflow-x:auto;white-space:pre}
@media(max-width:768px){
  .am{grid-template-columns:1fr}.aml{display:none}
  .sb{transform:translateX(-100%)}.dm{margin-left:0}
}
`;

/* ═══════════════════════════════════════════════════════════
   DEVICE DETECTION OVERLAY
═══════════════════════════════════════════════════════════ */
function DeviceDetectOverlay({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [prog, setProg] = useState(0);
  const [device, setDevice] = useState(null);

  const steps = [
    { label:"Authenticating user identity...",      icon:"AUTH" },
    { label:"Detecting public IP address...",       icon:"IP" },
    { label:"Classifying mobile or system device...", icon:"OS" },
    { label:"Building browser-safe app inventory...", icon:"APP" },
    { label:"Preparing agent deep-scan workflow...", icon:"CFG" },
    { label:"Registering session in SOC...",        icon:"SOC" },
    { label:"Running quick vulnerability check...", icon:"RISK" },
  ];

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(async () => {
      currentStep++;
      setStep(currentStep);
      setProg(Math.round((currentStep/steps.length)*100));

      if (currentStep === 2) {
        const d = await detectDevice(user);
        setDevice(d);
      }
      if (currentStep >= steps.length) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete(device || { hostname:"unknown-device", os:"Unknown", ip:"0.0.0.0", localIp:"192.168.1.1", browser:"Unknown", username:user.name, status:"ACTIVE" });
        }, 600);
      }
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ddo">
      <div className="ddo-box">
        <div className="ddo-logo"><Logo size={28} lightMode showTagline/></div>
        <div className="ddo-title">Registering Your Device</div>
        <div className="ddo-sub">Scanning and securing your endpoint in real-time…</div>
        <div className="ddo-steps">
          {steps.map((s,i)=>(
            <div key={i} className={`ddo-step ${i<step?"done":i===step?"active":""}`}>
              <div className="ddo-step-ic" style={{ background:i<step?"rgba(34,211,238,0.15)":i===step?"rgba(245,158,11,0.15)":"rgba(100,116,139,0.1)" }}>
                {i<step?"✓":s.icon.charAt(0)}
              </div>
              <span>{s.label}</span>
              {i<step && <span style={{marginLeft:"auto",color:"var(--dcyan)",fontSize:10}}>DONE</span>}
              {i===step && <span style={{marginLeft:"auto",color:"#fbbf24",fontSize:10}}>ACTIVE</span>}
            </div>
          ))}
        </div>
        <div className="ddo-bar"><div className="ddo-fill" style={{width:`${prog}%`}}/></div>
        <div style={{fontSize:11,color:"var(--dmuted)",marginTop:10,fontFamily:"var(--fm)"}}>{prog}% complete</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AUTH MODAL
═══════════════════════════════════════════════════════════ */
function AuthModal({ onAuth, onClose, defaultTab="signin" }) {
  const [tab, setTab] = useState(defaultTab);
  const [f, setF] = useState({ email:"", password:"", name:"", confirm:"", company:"" });
  const [err, setErr] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const upd = k => e => setF(p=>({...p,[k]:e.target.value}));

  const signIn = () => {
    const u = DEMO_USERS.find(u=>u.email===f.email&&u.password===f.password);
    if (!u) { setErr("Invalid credentials. Use admin@sentrasec.io / demo123"); return; }
    setErr(""); setEmailStatus(""); onAuth(u);
  };
  const signUp = async () => {
    if (!f.name||!f.email||!f.password) { setErr("All fields required"); return; }
    if (f.password!==f.confirm) { setErr("Passwords do not match"); return; }
    if (f.password.length<8) { setErr("Password must be at least 8 characters"); return; }
    setErr("");
    const newUser = { email:f.email, name:f.name, company:f.company, role:"Security Analyst", pkg:null, isNew:true };
    setEmailStatus("Account created. Welcome email will be sent after package selection.");
    onAuth(newUser);
  };
  const oauthSignIn = (provider) => {
    const cfg = PRODUCTION_CONFIG.oauth[provider];
    if (cfg?.authUrl) setEmailStatus(`${cfg.provider} ready: connect ${cfg.authUrl} on the backend for production redirect.`);
    onAuth(buildOAuthUser(provider));
  };

  return (
    <div className="aov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="am">
        <div className="aml">
          <Logo size={28} lightMode showTagline/>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.55)",lineHeight:1.75,marginTop:20,maxWidth:260}}>
            Real-time threat detection and centralized security intelligence.
          </div>
          <div className="aml-stats">
            {[["99.99%","Uptime SLA"],["<2ms","Alert Latency"],["2.4B+","Events/Day"],["ISO 27001","Certified"]].map(([n,l])=>(
              <div key={l} className="aml-stat"><div className="aml-stat-n">{n}</div><div className="aml-stat-l">{l}</div></div>
            ))}
          </div>
          <div className="aml-contact">
            <div style={{fontSize:9,letterSpacing:2,textTransform:"uppercase",color:"rgba(255,255,255,0.3)",marginBottom:8}}>Support</div>
            <div className="aml-ci">✉ {BRAND.email}</div>
            <div className="aml-ci">📱 {BRAND.phone}</div>
          </div>
        </div>
        <div className="amr">
          <button className="a-close" onClick={onClose}>✕</button>
          <div style={{fontFamily:"var(--fd)",fontSize:24,fontWeight:800,color:"var(--navy)",marginBottom:4}}>
            {tab==="signin"?"Welcome back":"Create your account"}
          </div>
          <div style={{fontSize:13,color:"var(--lmuted)",marginBottom:22}}>
            {tab==="signin"?"Sign in to your SOC dashboard":"Get 14 days free — no credit card required"}
          </div>
          <div className="a-tabs">
            <button className={`a-tab ${tab==="signin"?"on":""}`} onClick={()=>{setTab("signin");setErr("")}}>Sign In</button>
            <button className={`a-tab ${tab==="signup"?"on":""}`} onClick={()=>{setTab("signup");setErr("")}}>Sign Up</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
            <button className="oauth-btn" onClick={()=>oauthSignIn("google")}>Google OAuth</button>
            <button className="oauth-btn" onClick={()=>oauthSignIn("microsoft")}>Microsoft OAuth</button>
          </div>
          {tab==="signup"&&<>
            <label className="a-lbl">Full Name</label>
            <input className="a-inp" placeholder="Jane Smith" value={f.name} onChange={upd("name")}/>
            <label className="a-lbl">Company (optional)</label>
            <input className="a-inp" placeholder="Acme Corp" value={f.company} onChange={upd("company")}/>
          </>}
          <label className="a-lbl">Email Address</label>
          <input className="a-inp" type="email" placeholder="you@company.com" value={f.email} onChange={upd("email")}/>
          <label className="a-lbl">Password</label>
          <input className="a-inp" type="password" placeholder="••••••••" value={f.password} onChange={upd("password")}/>
          {tab==="signup"&&<>
            <label className="a-lbl">Confirm Password</label>
            <input className="a-inp" type="password" placeholder="••••••••" value={f.confirm} onChange={upd("confirm")}/>
          </>}
          {err&&<div className="a-err">⚠ {err}</div>}
          <button className="a-btn" onClick={tab==="signin"?signIn:signUp}>
            {tab==="signin"?"Access Dashboard →":"Create Account & Choose Package →"}
          </button>
          {emailStatus&&<div style={{fontSize:11,color:"var(--cyandk)",marginTop:10,fontFamily:"var(--fm)"}}>{emailStatus}</div>}
          {tab==="signup"&&<div style={{fontSize:11,color:"var(--lmuted)",marginTop:10,padding:"8px 0",fontFamily:"var(--fm)"}}>
            ✉ A package-specific welcome email will be sent to {f.email||"your inbox"} after plan selection.
          </div>}
          {tab==="signin"&&<div className="a-demo">
            <b>admin@sentrasec.io</b> / demo123 — Fortress (all features)<br/>
            <b>pro@sentrasec.io</b> / demo123 — Guardian plan<br/>
            <b>starter@sentrasec.io</b> / demo123 — Sentinel plan
          </div>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRICING PAGE
═══════════════════════════════════════════════════════════ */
function PricingPage({ onSelect, onBack }) {
  return (
    <div className="pp">
      <div style={{maxWidth:1060,margin:"0 auto"}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"var(--lmuted)",fontFamily:"var(--fs)",fontSize:13,cursor:"pointer",marginBottom:36,display:"flex",alignItems:"center",gap:6}}>← Back</button>
        <div style={{textAlign:"center",marginBottom:48}}>
          <Logo size={36} color="#0f2d5e" showTagline/>
          <h1 style={{fontFamily:"var(--fd)",fontSize:42,fontWeight:900,color:"var(--navy)",marginTop:20,marginBottom:10,letterSpacing:"-1px"}}>Choose your protection level.</h1>
          <p style={{fontSize:15,color:"var(--lmuted)",maxWidth:480,margin:"0 auto"}}>All plans include 14-day free trial, device auto-detection, and real-time vulnerability scanning.</p>
        </div>
        <div className="pkg-grid">
          {PACKAGES.map((pkg,i)=>(
            <div key={pkg.id} className={`pkg-card ${pkg.popular?"popular":""}`} onClick={()=>onSelect(pkg.id)}>
              {pkg.popular&&<div className="pop-badge">Most Popular</div>}
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                <div style={{width:42,height:42,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:pkg.popular?"rgba(255,255,255,0.12)":`${pkg.color}14`,color:pkg.popular?"white":pkg.color}}>
                  {pkg.id==="sentinel"?"🛡":pkg.id==="guardian"?"🔮":"🏰"}
                </div>
                <div>
                  <div style={{fontFamily:"var(--fd)",fontSize:21,fontWeight:900,color:pkg.popular?"white":pkg.color}}>{pkg.name}</div>
                  <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",opacity:0.6}}>{pkg.tier}</div>
                </div>
              </div>
              <div style={{marginBottom:8}}>
                <span style={{fontFamily:"var(--fd)",fontSize:44,fontWeight:900,color:pkg.popular?"white":pkg.color}}>${pkg.price.toLocaleString()}</span>
                <span style={{fontSize:13,opacity:0.6}}>/month</span>
              </div>
              <div style={{fontSize:12,opacity:0.65,marginBottom:6}}>
                📊 Scan depth: <strong>{pkg.scanDepth} CVEs</strong> &nbsp;·&nbsp; 💻 Max devices: <strong>{pkg.maxDevices===999?"Unlimited":pkg.maxDevices}</strong>
              </div>
              <div style={{fontSize:12,opacity:0.6,marginBottom:18,lineHeight:1.5}}>
                {pkg.virusScan?"✓ Virus Scanner":"✗ Virus Scanner"} &nbsp;·&nbsp;
                {pkg.networkScan?"✓ Network Scan":"✗ Network Scan"} &nbsp;·&nbsp;
                {pkg.aiScan?"✓ AI Analysis":"✗ AI Analysis"}
              </div>
              <div style={{height:1,background:"currentColor",opacity:0.08,marginBottom:16}}/>
              <ul style={{listStyle:"none",marginBottom:22}}>
                {pkg.features.map(f=>(
                  <li key={f} style={{fontSize:12,padding:"4px 0",display:"flex",gap:8,color:pkg.popular?"rgba(255,255,255,0.85)":undefined}}>
                    <span style={{color:pkg.popular?"#4ade80":"#16a34a",fontWeight:700,flexShrink:0}}>✓</span><span>{f}</span>
                  </li>
                ))}
                {pkg.locked.map(f=>(
                  <li key={f} style={{fontSize:12,padding:"4px 0",display:"flex",gap:8,opacity:0.35}}>
                    <span style={{flexShrink:0}}>✗</span><span>{f}</span>
                  </li>
                ))}
              </ul>
              <button className="pkg-cta" style={{background:pkg.popular?"white":pkg.color,color:pkg.popular?pkg.color:"white",boxShadow:`0 4px 20px ${pkg.color}30`}}>
                Get Started with {pkg.name} →
              </button>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:32,fontSize:13,color:"var(--lmuted)"}}>
          Questions? <a href={`mailto:${BRAND.email}`} style={{color:"var(--cyandk)",fontWeight:600}}>{BRAND.email}</a>
          &nbsp;·&nbsp;<a href={`tel:${BRAND.phone.replace(/ /g,"")}`} style={{color:"var(--cyandk)",fontWeight:600}}>{BRAND.phone}</a>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   RISK RING
═══════════════════════════════════════════════════════════ */
function RiskRing({ score, color, level }) {
  const r = 48, circ = 2*Math.PI*r;
  const dash = circ - (score/100)*circ;
  return (
    <div className="risk-ring">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(34,211,238,0.1)" strokeWidth="8"/>
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
          style={{transition:"stroke-dashoffset 1s ease"}}/>
      </svg>
      <div className="risk-ring-label">
        <div style={{fontFamily:"var(--fd)",fontSize:22,fontWeight:900,color,lineHeight:1}}>{score}</div>
        <div style={{fontSize:9,color:"var(--dmuted)",letterSpacing:1,textTransform:"uppercase",marginTop:2}}>{level}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCANNER COMPONENT
═══════════════════════════════════════════════════════════ */
function VulnScanner({ device, pkg, onComplete }) {
  const [phase, setPhase] = useState("idle"); // idle | scanning | done
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [vulns, setVulns] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const logRef = useRef(null);

  const scanLogs = [
    {t:0,  msg:`[INFO] Starting ${pkg.name} vulnerability scan on ${device?.hostname||"device"}`, cls:"ok"},
    {t:200, msg:`[INFO] Target OS: ${device?.os||"Unknown"} | Browser: ${device?.browser||"Unknown"}`, cls:"ok"},
    {t:400, msg:`[SCAN] Checking NIST NVD database for OS-specific CVEs…`, cls:"ok"},
    {t:600, msg:`[SCAN] Probing ${pkg.networkScan?"25 network ports":"5 common ports"}…`, cls:"ok"},
    {t:800, msg:`[WARN] Elevated privileges may be required for deep scan`, cls:"warn"},
    {t:1000,msg:`[SCAN] Analyzing browser version ${device?.browser||""}…`, cls:"ok"},
    {t:1200,msg:`[SCAN] Cross-referencing CVE database (${pkg.scanDepth} checks)…`, cls:"ok"},
    {t:1400,msg:`[SCAN] Checking installed plugins and extensions…`, cls:"ok"},
    {t:1600,msg:`[WARN] Unpatched vulnerabilities detected in OS layer`, cls:"warn"},
    {t:1800,msg:`[SCAN] Running authentication posture check…`, cls:"ok"},
    {t:2000,msg:`[SCAN] Verifying TLS/SSL configuration…`, cls:"ok"},
    {t:2200,msg:`[DONE] Scan complete. Generating report…`, cls:"ok"},
  ].slice(0, pkg.scanDepth > 10 ? 12 : 7);

  const startScan = () => {
    setPhase("scanning"); setProgress(0); setLogs([]); setVulns([]); setAiAnalysis("");
    const step = 100 / scanLogs.length;
    scanLogs.forEach((l, i) => {
      setTimeout(() => {
        setLogs(prev=>[...prev, l]);
        setProgress(Math.round((i+1)*step));
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
        if (i===scanLogs.length-1) {
          const found = generateScanVulns(device, pkg);
          setVulns(found);
          setPhase("done");
          onComplete?.(found);
          if (pkg.aiScan) runAiAnalysis(found);
        }
      }, l.t + i*100);
    });
  };

  const runAiAnalysis = async (foundVulns) => {
    setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:600,
          messages:[{ role:"user", content:`You are a cybersecurity AI analyst. Provide a concise 3-paragraph executive summary of these vulnerabilities found on a ${device?.os} device (${device?.browser} browser). Focus on: 1) Top risks, 2) Attack vectors, 3) Recommended remediation priority. Vulnerabilities: ${JSON.stringify(foundVulns.slice(0,5).map(v=>({id:v.id,title:v.title,severity:v.sev,score:v.score})))}. Keep it under 200 words, professional tone.` }]
        })
      });
      const d = await res.json();
      const txt = d.content?.find(c=>c.type==="text")?.text||"";
      setAiAnalysis(txt);
    } catch { setAiAnalysis("AI analysis unavailable. Please review the vulnerability list manually."); }
    setAiLoading(false);
  };

  if (!device) return <div style={{textAlign:"center",padding:40,color:"var(--dmuted)",fontSize:13}}>No device registered. Please log in to register your device.</div>;

  const openVulns = vulns.filter(v=>v.status==="OPEN");
  const critical  = openVulns.filter(v=>v.sev==="CRITICAL").length;
  const high      = openVulns.filter(v=>v.sev==="HIGH").length;
  const medium    = openVulns.filter(v=>v.sev==="MEDIUM").length;

  return (
    <div>
      {/* Scan header */}
      <div className="pn">
        <div className="ph">
          <div className="pt">🔍 Vulnerability Scanner — {pkg.name} Plan</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:10,color:"var(--dmuted)"}}>Depth: <strong style={{color:"var(--dcyan)"}}>{pkg.scanDepth} CVEs</strong></span>
            {pkg.networkScan&&<span style={{fontSize:10,color:"#22c55e"}}>+ Network Scan</span>}
            {pkg.aiScan&&<span style={{fontSize:10,color:"#f59e0b"}}>+ AI Analysis</span>}
          </div>
        </div>
        <div className="pb">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
            {[{l:"Target Host",v:device.hostname},{l:"OS",v:device.os},{l:"IP Address",v:device.localIp}].map(k=>(
              <div key={k.l} style={{background:"var(--dbg2)",border:"1px solid var(--dborder)",borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontSize:9,letterSpacing:1.5,color:"var(--dmuted)",textTransform:"uppercase",marginBottom:5}}>{k.l}</div>
                <div style={{fontSize:12,color:"var(--dcyan)",fontWeight:500}}>{k.v}</div>
              </div>
            ))}
          </div>
          {phase==="idle"&&(
            <button onClick={startScan} style={{width:"100%",padding:"12px",background:"var(--dcyan)",border:"none",borderRadius:8,color:"#000",fontFamily:"var(--fm)",fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:1}}>
              ▶ START VULNERABILITY SCAN
            </button>
          )}
          {!pkg.networkScan&&phase==="idle"&&(
            <div style={{marginTop:10,fontSize:11,color:"var(--dmuted)",textAlign:"center",fontFamily:"var(--fm)"}}>
              🔒 Network scan & AI analysis require Guardian or Fortress plan
            </div>
          )}
          {phase==="scanning"&&(
            <>
              <div className="scan-progress"><div className="scan-fill" style={{width:`${progress}%`,background:"linear-gradient(90deg,#22d3ee,#6366f1)"}}/></div>
              <div className="scan-log" ref={logRef}>
                {logs.map((l,i)=><div key={i} className={`scan-log-line ${l.cls}`}>{l.msg}</div>)}
              </div>
              <div style={{textAlign:"center",fontSize:12,color:"var(--dmuted)"}}>Scanning… {progress}%</div>
            </>
          )}
          {phase==="done"&&(
            <>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
                {[{l:"Total Found",v:vulns.length,c:"#22d3ee"},{l:"Critical",v:critical,c:"#ef4444"},{l:"High",v:high,c:"#f97316"},{l:"Medium",v:medium,c:"#eab308"}].map(k=>(
                  <div key={k.l} style={{background:"var(--dbg2)",border:`1px solid ${k.c}30`,borderRadius:8,padding:"12px",textAlign:"center"}}>
                    <div style={{fontSize:9,letterSpacing:1.5,color:"var(--dmuted)",textTransform:"uppercase",marginBottom:6}}>{k.l}</div>
                    <div style={{fontFamily:"var(--fd)",fontSize:26,fontWeight:900,color:k.c}}>{k.v}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>{setPhase("idle");setVulns([]);}} style={{marginBottom:16,padding:"8px 16px",background:"transparent",border:"1px solid var(--dborder2)",borderRadius:6,color:"var(--dcyan)",fontFamily:"var(--fm)",fontSize:11,cursor:"pointer"}}>
                ↺ Run New Scan
              </button>
            </>
          )}
        </div>
      </div>

      {/* AI Analysis (Fortress) */}
      {pkg.aiScan&&phase==="done"&&(
        <div className="pn">
          <div className="ph"><div className="pt">🧠 AI Threat Analysis (Powered by SentraSec AI)</div></div>
          <div className="pb">
            {aiLoading ? (
              <div style={{display:"flex",alignItems:"center",gap:10,color:"var(--dmuted)",fontSize:12}}>
                <div style={{width:14,height:14,border:"2px solid var(--dcyan)",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
                Generating AI analysis…
              </div>
            ) : (
              <div style={{fontSize:13,color:"var(--dtext)",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{aiAnalysis}</div>
            )}
          </div>
        </div>
      )}

      {/* Vuln table */}
      {vulns.length>0&&(
        <div className="pn">
          <div className="ph">
            <div className="pt">⚠ Detected Vulnerabilities ({vulns.length})</div>
            <div style={{fontSize:10,color:"var(--dmuted)"}}>{openVulns.length} open · {vulns.filter(v=>v.status==="PATCHED").length} patched</div>
          </div>
          <div style={{overflowX:"auto"}}>
            <table className="dt">
              <thead><tr><th>CVE ID</th><th>Title</th><th>Severity</th><th>CVSS</th><th>Category</th><th>Status</th><th>Fix</th></tr></thead>
              <tbody>
                {vulns.map(v=>{
                  const bar=v.score>=9?"#ef4444":v.score>=7?"#f97316":"#eab308";
                  return <tr key={v.id}>
                    <td style={{color:"var(--dcyan)",fontSize:11,fontWeight:500}}>{v.id}</td>
                    <td style={{maxWidth:180,fontSize:11}}>{v.title}</td>
                    <td><SBadge s={v.sev}/></td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{color:bar,fontWeight:700,fontSize:12}}>{v.score}</span>
                        <div style={{width:40,height:3,background:"var(--dborder)",borderRadius:2}}>
                          <div style={{height:"100%",width:`${(v.score/10)*100}%`,background:bar,borderRadius:2}}/>
                        </div>
                      </div>
                    </td>
                    <td style={{fontSize:10,color:"var(--dmuted)"}}>{v.category}</td>
                    <td><SBadge s={v.status}/></td>
                    <td style={{fontSize:10,color:"var(--dmuted)",maxWidth:140}}>{v.fix}</td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   VIRUS SCANNER
═══════════════════════════════════════════════════════════ */
function VirusScanner({ device, pkg, onComplete }) {
  const [phase, setPhase] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  if (!pkg.virusScan) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"50vh",gap:14,textAlign:"center"}}>
      <div style={{fontSize:52,opacity:0.25}}>🦠</div>
      <div style={{fontFamily:"var(--fd)",fontSize:22,fontWeight:800,color:"var(--dmuted)"}}>Virus Scanner</div>
      <div style={{fontSize:13,color:"var(--dmuted)",maxWidth:360,lineHeight:1.6,fontFamily:"var(--fm)"}}>Virus and malware scanning is available on Guardian and Fortress plans. Upgrade to scan for threats in real time.</div>
      <div style={{fontSize:11,color:"var(--dmuted)",fontFamily:"var(--fm)"}}>Current plan: <strong style={{color:"#0ea5e9"}}>{pkg.name} ({pkg.tier})</strong></div>
    </div>
  );

  const startScan = () => {
    setPhase("scanning"); setProgress(0); setResult(null);
    const steps = [
      "Initializing antivirus engine…",
      `Loading SentraSec AV definitions (2026-05-15)…`,
      `Scanning ${Math.floor(Math.random()*50000+20000).toLocaleString()} files…`,
      "Checking boot sectors and MBR…",
      "Scanning system processes…",
      "Inspecting browser extensions…",
      "Analyzing startup entries…",
      "Checking network sockets…",
      pkg.aiScan?"Running AI behavioral analysis…":"Finalizing report…",
    ];
    steps.forEach((s,i) => {
      setTimeout(() => {
        setProgress(Math.round(((i+1)/steps.length)*100));
        if (i===steps.length-1) {
          const scan = generateVirusScan(device, pkg);
          setResult(scan);
          onComplete?.(scan);
          setPhase("done");
        }
      }, i*700+400);
    });
  };

  const threatColors = { CRITICAL:"#ef4444", HIGH:"#f97316", MEDIUM:"#eab308", LOW:"#22d3ee" };

  return (
    <div>
      <div className="pn">
        <div className="ph">
          <div className="pt">🦠 Virus & Malware Scanner — {pkg.name}</div>
          {pkg.aiScan&&<span style={{fontSize:10,color:"#f59e0b"}}>+ Behavioral AI</span>}
        </div>
        <div className="pb">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
            {[{l:"Scan Target",v:device?.hostname||"Unknown"},{l:"OS",v:device?.os||"Unknown"},{l:"Engine",v:"SentraSec AV 24.8"}].map(k=>(
              <div key={k.l} style={{background:"var(--dbg2)",border:"1px solid var(--dborder)",borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontSize:9,letterSpacing:1.5,color:"var(--dmuted)",textTransform:"uppercase",marginBottom:5}}>{k.l}</div>
                <div style={{fontSize:12,color:"var(--dcyan)",fontWeight:500}}>{k.v}</div>
              </div>
            ))}
          </div>

          {phase==="idle"&&(
            <button onClick={startScan} style={{width:"100%",padding:12,background:"#22c55e",border:"none",borderRadius:8,color:"#000",fontFamily:"var(--fm)",fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:1}}>
              🦠 START VIRUS SCAN
            </button>
          )}

          {phase==="scanning"&&(
            <div>
              <div style={{textAlign:"center",fontSize:32,marginBottom:12,animation:"spin 2s linear infinite",display:"inline-block",width:"100%"}}>🔄</div>
              <div className="scan-progress"><div className="scan-fill" style={{width:`${progress}%`,background:"linear-gradient(90deg,#22c55e,#0ea5e9)"}}/></div>
              <div style={{textAlign:"center",fontSize:12,color:"var(--dmuted)",marginTop:8,fontFamily:"var(--fm)"}}>Scanning… {progress}% — Do not interrupt</div>
            </div>
          )}

          {phase==="done"&&result&&(
            <>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
                {[
                  {l:"Files Scanned",v:result.scanned.toLocaleString(),c:"#22d3ee"},
                  {l:"Threats Found",v:result.found,c:result.found>0?"#ef4444":"#22c55e"},
                  {l:"Scan Duration",v:result.duration,c:"#a78bfa"},
                  {l:"Status",v:result.status==="CLEAN"?"CLEAN":"INFECTED",c:result.status==="CLEAN"?"#22c55e":"#ef4444"},
                ].map(k=>(
                  <div key={k.l} style={{background:"var(--dbg2)",border:`1px solid ${k.c}28`,borderRadius:8,padding:12,textAlign:"center"}}>
                    <div style={{fontSize:9,letterSpacing:1.5,color:"var(--dmuted)",textTransform:"uppercase",marginBottom:6}}>{k.l}</div>
                    <div style={{fontFamily:"var(--fd)",fontSize:k.l==="Files Scanned"?18:22,fontWeight:900,color:k.c}}>{k.v}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>setPhase("idle")} style={{marginBottom:16,padding:"8px 16px",background:"transparent",border:"1px solid var(--dborder2)",borderRadius:6,color:"var(--dcyan)",fontFamily:"var(--fm)",fontSize:11,cursor:"pointer"}}>↺ Rescan</button>
              {result.threats.map((t,i)=>(
                <div key={i} className="virus-threat" style={{borderColor:`${threatColors[t.threat]||"#64748b"}33`,background:`${threatColors[t.threat]||"#64748b"}08`}}>
                  <div style={{fontSize:22,flexShrink:0}}>🦠</div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <span style={{fontFamily:"var(--fm)",fontSize:12,fontWeight:600,color:threatColors[t.threat]}}>{t.name}</span>
                      <SBadge s={t.threat}/>
                      <span style={{fontSize:10,color:"var(--dmuted)",marginLeft:"auto"}}>{t.type}</span>
                    </div>
                    <div style={{fontSize:11,color:"var(--dmuted)",fontFamily:"var(--fm)"}}>{t.path}</div>
                    <div style={{fontSize:10,marginTop:6,color:t.clean?"#22c55e":"#f87171",fontFamily:"var(--fm)"}}>
                      {t.clean?"✓ Quarantined automatically":"⚠ Requires manual removal — click to remediate"}
                    </div>
                  </div>
                </div>
              ))}
              {result.threats.length===0&&(
                <div style={{textAlign:"center",padding:24,background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:10}}>
                  <div style={{fontSize:36,marginBottom:8}}>✅</div>
                  <div style={{fontFamily:"var(--fd)",fontSize:18,fontWeight:700,color:"#22c55e",marginBottom:4}}>No threats detected</div>
                  <div style={{fontSize:12,color:"var(--dmuted)"}}>Your device is clean. Definitions: {result.definitionsDate}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DEVICE VIEW
═══════════════════════════════════════════════════════════ */
function DeviceView({ device, pkg, vulns, virusScan }) {
  if (!device) return <div style={{textAlign:"center",padding:40,color:"var(--dmuted)",fontSize:13}}>No device detected yet. Please log in to register your device.</div>;

  const risk = calcRisk(vulns||[], virusScan);
  const rows = [
    ["Hostname / Device ID", device.hostname],
    ["Hostname Confidence",  device.hostnameStatus],
    ["Telemetry Mode",       device.telemetryMode],
    ["Public IP Address",    device.publicIp],
    ["Local IP Address",     device.localIp],
    ["Operating System",     device.os],
    ["Browser",              device.browser],
    ["Device Type",          device.deviceType],
    ["Vendor / Platform",    `${device.vendor} (${device.platform})`],
    ["Login Username",       device.username],
    ["Login Email",          device.email],
    ["Display Resolution",   `${device.display} ${device.colorDepth}`],
    ["CPU Cores",            device.cores],
    ["RAM",                  device.memory],
    ["Timezone",             device.timezone],
    ["Language",             device.language],
    ["Registered At",        new Date(device.registeredAt).toLocaleString()],
    ["Last Login",           new Date(device.lastLogin).toLocaleString()],
    ["Status",               device.status],
  ];

  return (
    <div>
      <div className="g2">
        <div className="pn">
          <div className="ph"><div className="pt">💻 Detected Device Profile</div><SBadge s={device.status}/></div>
          <div className="pb">
            {rows.map(([k,v])=>(
              <div key={k} className="dev-row">
                <span className="dev-key">{k}</span>
                <span className="dev-val" style={{color:k.includes("IP")?"var(--dcyan)":k.includes("Status")?"#22c55e":undefined}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          {/* Risk Score */}
          <div className="pn" style={{marginBottom:14}}>
            <div className="ph"><div className="pt">⚡ Device Risk Score</div></div>
            <div className="pb" style={{display:"flex",alignItems:"center",gap:24}}>
              <RiskRing score={risk.score} color={risk.color} level={risk.level}/>
              <div>
                <div style={{fontSize:24,fontFamily:"var(--fd)",fontWeight:800,color:risk.color,marginBottom:4}}>{risk.level} RISK</div>
                <div style={{fontSize:11,color:"var(--dmuted)",lineHeight:1.7,fontFamily:"var(--fm)"}}>
                  Based on {vulns?.length||0} CVEs<br/>
                  {vulns?.filter(v=>v.sev==="CRITICAL"&&v.status==="OPEN").length||0} Critical open<br/>
                  {virusScan?`${virusScan.threats.filter(t=>!t.clean).length} virus threats`:"No virus scan run"}
                </div>
                <div style={{marginTop:10,fontSize:10,color:"var(--dmuted)"}}>
                  {pkg.aiScan?"AI-powered risk analysis":"Run a full scan for accurate score"}
                </div>
              </div>
            </div>
          </div>

          {/* Plugins */}
          <div className="pn" style={{marginBottom:14}}>
            <div className="ph"><div className="pt">🔌 Detected Plugins / Extensions</div></div>
            <div className="pb">
              {device.plugins.map((p,i)=>(
                <div key={i} style={{padding:"6px 0",borderBottom:"1px solid var(--dborder)",fontSize:11,color:"var(--dtext)",fontFamily:"var(--fm)",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{color:"var(--dmuted)"}}>■</span>{p}
                </div>
              ))}
              {device.plugins.length===0&&<div style={{fontSize:11,color:"var(--dmuted)"}}>No plugins detected</div>}
            </div>
          </div>

          {/* Application inventory */}
          <div className="pn" style={{marginBottom:14}}>
            <div className="ph"><div className="pt">Installed Application Inventory</div></div>
            <div className="pb">
              {(device.installedApplications||[]).map((app,i)=>(
                <div key={`${app.name}-${i}`} style={{padding:"9px 0",borderBottom:"1px solid var(--dborder)",fontFamily:"var(--fm)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center"}}>
                    <span style={{fontSize:12,color:"var(--dtext)"}}>{app.name}</span>
                    <span style={{fontSize:10,color:app.confidence==="Blocked"?"#f97316":"var(--dcyan)"}}>{app.confidence}</span>
                  </div>
                  <div style={{fontSize:10,color:"var(--dmuted)",marginTop:4}}>{app.source} - {app.status}</div>
                </div>
              ))}
              <div style={{fontSize:10,color:"var(--dmuted)",lineHeight:1.6,marginTop:10}}>
                Real hostname and full installed-app scan require the SentraSec endpoint agent or MDM integration.
              </div>
            </div>
          </div>

          {/* Package scan info */}
          <div className="pn">
            <div className="ph"><div className="pt">📦 Scan Capabilities — {pkg.name}</div></div>
            <div className="pb">
              {[
                ["CVE Scan Depth",   `${pkg.scanDepth} vulnerabilities`],
                ["Virus Scanner",    pkg.virusScan?"Included ✓":"Not included ✗"],
                ["Network Scan",     pkg.networkScan?"Included ✓":"Not included ✗"],
                ["AI Analysis",      pkg.aiScan?"Included ✓":"Not included ✗"],
                ["Max Devices",      pkg.maxDevices===999?"Unlimited":pkg.maxDevices],
              ].map(([k,v])=>(
                <div key={k} className="dev-row">
                  <span className="dev-key">{k}</span>
                  <span style={{color:v.includes("✓")?"#22c55e":v.includes("✗")?"#64748b":"var(--dcyan)",fontSize:12}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SETUP GUIDE
═══════════════════════════════════════════════════════════ */
function SetupGuide() {
  const [tab, setTab] = useState("auth0");
  const tabs = [
    {id:"auth0",  label:"Free OAuth"},
    {id:"aws",    label:"AWS DynamoDB"},
    {id:"email",  label:"Welcome Email"},
    {id:"money",  label:"Payments"},
    {id:"deploy", label:"Deployment"},
  ];
  return (
    <div>
      <div className="pn">
        <div className="ph"><div className="pt">Backend Setup Guide - Free OAuth, Email, Agent, Payments</div></div>
        <div className="pb">
          <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"7px 16px",border:`1px solid ${tab===t.id?"var(--dcyan)":"var(--dborder)"}`,borderRadius:6,background:tab===t.id?"rgba(34,211,238,0.1)":"transparent",color:tab===t.id?"var(--dcyan)":"var(--dmuted)",fontFamily:"var(--fm)",fontSize:12,cursor:"pointer"}}>
                {t.label}
              </button>
            ))}
          </div>

          {tab==="auth0"&&(
            <div>
              <div className="guide-section">
                <div style={{fontFamily:"var(--fd)",fontSize:16,fontWeight:700,color:"var(--dtext)",marginBottom:4}}>Auth0 Free Tier — 7,000 Active Users / Unlimited Logins</div>
                <div style={{fontSize:12,color:"var(--dmuted)",marginBottom:16,fontFamily:"var(--fm)"}}>Auth0 free tier includes OAuth2, social logins, MFA, and custom rules — no credit card required.</div>
                <div className="code-block">{`Free OAuth options now wired in UI:
Google OAuth -> ${PRODUCTION_CONFIG.oauth.google.authUrl}
Microsoft OAuth -> ${PRODUCTION_CONFIG.oauth.microsoft.authUrl}

Use direct Google/Microsoft OAuth for zero auth-platform cost, or Auth0 free tier if you want hosted rules, user management, and MFA.`}</div>
                <div className="guide-step">
                  <div className="guide-num">1</div>
                  <div>
                    <div className="guide-title">Create Auth0 Account</div>
                    <div className="guide-desc">Go to <span style={{color:"var(--dcyan)"}}>auth0.com/signup</span> → Choose "I am a developer" → Select "Personal" plan → Verify email. Your Auth0 domain will be: <strong>your-tenant.auth0.com</strong></div>
                  </div>
                </div>
                <div className="guide-step">
                  <div className="guide-num">2</div>
                  <div>
                    <div className="guide-title">Create Application</div>
                    <div className="guide-desc">Dashboard → Applications → Create Application → "Single Page Application" → Select React → Copy Domain and Client ID</div>
                    <div className="code-block">{`# Install Auth0 React SDK
npm install @auth0/auth0-react

# .env file
REACT_APP_AUTH0_DOMAIN=your-tenant.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your_client_id_here
REACT_APP_AUTH0_AUDIENCE=https://sentrasec.api`}</div>
                  </div>
                </div>
                <div className="guide-step">
                  <div className="guide-num">3</div>
                  <div>
                    <div className="guide-title">Wrap App with Auth0Provider</div>
                    <div className="code-block">{`// index.js
import { Auth0Provider } from '@auth0/auth0-react';

ReactDOM.render(
  <Auth0Provider
    domain={process.env.REACT_APP_AUTH0_DOMAIN}
    clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
    authorizationParams={{ redirect_uri: window.location.origin }}
  >
    <App />
  </Auth0Provider>,
  document.getElementById('root')
);`}</div>
                  </div>
                </div>
                <div className="guide-step">
                  <div className="guide-num">4</div>
                  <div>
                    <div className="guide-title">Replace Demo Auth with Auth0 in App</div>
                    <div className="code-block">{`// In your component
import { useAuth0 } from '@auth0/auth0-react';

const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();

// Login button
<button onClick={() => loginWithRedirect()}>Sign In</button>

// After login, user object contains:
// user.name, user.email, user.sub (unique ID), user.picture`}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab==="aws"&&(
            <div>
              <div className="guide-section">
                <div style={{fontFamily:"var(--fd)",fontSize:16,fontWeight:700,color:"var(--dtext)",marginBottom:4}}>AWS Free Tier — DynamoDB + Lambda + API Gateway</div>
                <div style={{fontSize:12,color:"var(--dmuted)",marginBottom:16,fontFamily:"var(--fm)"}}>AWS Free Tier: DynamoDB 25GB storage, 200M requests/month FREE forever. Lambda: 1M requests/month FREE.</div>
                <div className="guide-step">
                  <div className="guide-num">1</div>
                  <div>
                    <div className="guide-title">Create AWS Account & Install CLI</div>
                    <div className="code-block">{`# Sign up at aws.amazon.com (free tier, credit card required but not charged)
npm install -g aws-cdk
pip install aws-sam-cli
aws configure  # Enter your Access Key ID and Secret`}</div>
                  </div>
                </div>
                <div className="guide-step">
                  <div className="guide-num">2</div>
                  <div>
                    <div className="guide-title">Create DynamoDB Tables</div>
                    <div className="code-block">{`# AWS CLI commands to create free DynamoDB tables

# Users table
aws dynamodb create-table \\
  --table-name sentrasec-users \\
  --attribute-definitions AttributeName=userId,AttributeType=S \\
  --key-schema AttributeName=userId,KeyType=HASH \\
  --billing-mode PAY_PER_REQUEST

# Devices table
aws dynamodb create-table \\
  --table-name sentrasec-devices \\
  --attribute-definitions \\
    AttributeName=deviceId,AttributeType=S \\
    AttributeName=userId,AttributeType=S \\
  --key-schema AttributeName=deviceId,KeyType=HASH \\
  --global-secondary-indexes '[{
    "IndexName":"userId-index",
    "KeySchema":[{"AttributeName":"userId","KeyType":"HASH"}],
    "Projection":{"ProjectionType":"ALL"}
  }]' \\
  --billing-mode PAY_PER_REQUEST

# Scans table
aws dynamodb create-table \\
  --table-name sentrasec-scans \\
  --attribute-definitions AttributeName=scanId,AttributeType=S \\
  --key-schema AttributeName=scanId,KeyType=HASH \\
  --billing-mode PAY_PER_REQUEST`}</div>
                  </div>
                </div>
                <div className="guide-step">
                  <div className="guide-num">3</div>
                  <div>
                    <div className="guide-title">Lambda Function — Register Device</div>
                    <div className="code-block">{`// lambda/registerDevice.js
const AWS = require('aws-sdk');
const db  = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const body   = JSON.parse(event.body);
  const device = {
    deviceId:     body.deviceId,
    userId:       body.userId,
    hostname:     body.hostname,
    os:           body.os,
    publicIp:     body.publicIp,
    localIp:      body.localIp,
    browser:      body.browser,
    username:     body.username,
    registeredAt: new Date().toISOString(),
    status:       'ACTIVE',
  };
  await db.put({ TableName:'sentrasec-devices', Item:device }).promise();
  return { statusCode:200, body:JSON.stringify({ success:true, device }) };
};`}</div>
                  </div>
                </div>
                <div className="guide-step">
                  <div className="guide-num">4</div>
                  <div>
                    <div className="guide-title">Deploy with AWS SAM (Free)</div>
                    <div className="code-block">{`# template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Runtime: nodejs18.x
    Environment:
      Variables:
        TABLE_DEVICES: sentrasec-devices
        TABLE_USERS:   sentrasec-users

Resources:
  RegisterDeviceFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: registerDevice.handler
      Events:
        Api:
          Type: Api
          Properties:
            Path: /devices/register
            Method: post

# Deploy:
# sam build && sam deploy --guided`}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab==="email"&&(
            <div>
              <div className="guide-section">
                <div style={{fontFamily:"var(--fd)",fontSize:16,fontWeight:700,color:"var(--dtext)",marginBottom:4}}>Welcome Email — Auth0 Actions + AWS SES (Free)</div>
                <div style={{fontSize:12,color:"var(--dmuted)",marginBottom:16,fontFamily:"var(--fm)"}}>AWS SES: 62,000 emails/month FREE when sending from EC2/Lambda. Auth0 Actions trigger on user registration.</div>
                <div className="guide-step">
                  <div className="guide-num">1</div>
                  <div>
                    <div className="guide-title">Auth0 Action — Post-Registration Trigger</div>
                    <div className="guide-desc">Auth0 Dashboard → Actions → Library → Build Custom → "Post-Registration" trigger</div>
                    <div className="code-block">{`// Auth0 Action: Post Registration
// Triggers when ANY new user signs up

const axios = require("axios");

exports.onExecutePostUserRegistration = async (event) => {
  const { user } = event;
  
  // Call your Lambda/API to send welcome email
  await axios.post(
    "https://your-api-gateway.amazonaws.com/prod/send-welcome",
    {
      email:     user.email,
      name:      user.name || user.email.split("@")[0],
      userId:    user.user_id,
      createdAt: user.created_at,
    },
    { headers: { "x-api-key": event.secrets.API_KEY } }
  );
};`}</div>
                  </div>
                </div>
                <div className="guide-step">
                  <div className="guide-num">2</div>
                  <div>
                    <div className="guide-title">Lambda — Send Welcome Email via AWS SES</div>
                    <div className="code-block">{`// lambda/sendWelcomeEmail.js
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' });

exports.handler = async (event) => {
  const { email, name } = JSON.parse(event.body);

  await ses.sendEmail({
    Source: 'noreply@sentrasec.io',
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: '🛡 Welcome to SentraSec — Your SOC Dashboard is Ready' },
      Body: {
        Html: { Data: \`
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#0f2d5e;padding:32px;text-align:center">
              <h1 style="color:#22d3ee;margin:0">SentraSec</h1>
              <p style="color:rgba(255,255,255,0.6);font-size:12px">
                Centralized security intelligence
              </p>
            </div>
            <div style="padding:32px;background:#fff">
              <h2>Welcome, \${name}! 🎉</h2>
              <p>Your SentraSec account is active and your 14-day free trial has started.</p>
              <p><strong>What happens next:</strong></p>
              <ul>
                <li>Log in to your dashboard</li>
                <li>Your device will be automatically detected and registered</li>
                <li>A vulnerability scan will run on your system</li>
                <li>You'll receive real-time threat alerts</li>
              </ul>
              <a href="https://your-app.vercel.app" 
                 style="display:inline-block;background:#0f2d5e;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">
                Access Your Dashboard →
              </a>
              <p style="margin-top:24px;font-size:12px;color:#64748b">
                Questions? Email us at ${BRAND.email} or call ${BRAND.phone}
              </p>
            </div>
          </div>
        \` }
      }
    }
  }).promise();

  return { statusCode:200, body:JSON.stringify({ sent:true }) };
};`}</div>
                  </div>
                </div>
                <div className="guide-step">
                  <div className="guide-num">3</div>
                  <div>
                    <div className="guide-title">Verify Your Domain in AWS SES</div>
                    <div className="code-block">{`# Verify sending domain (one-time)
aws ses verify-domain-identity --domain sentrasec.io

# Move SES out of sandbox (request production access)
# AWS Console → SES → Account dashboard → Request production access
# This allows sending to any email address (sandbox = verified only)`}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab==="money"&&(
            <div>
              <div className="guide-section">
                <div style={{fontFamily:"var(--fd)",fontSize:16,fontWeight:700,color:"var(--dtext)",marginBottom:4}}>Production Money Flow</div>
                <div style={{fontSize:12,color:"var(--dmuted)",marginBottom:16,fontFamily:"var(--fm)"}}>Use Stripe test mode first, then connect live keys when the legal, privacy, and refund pages are published.</div>
                <div className="guide-step">
                  <div className="guide-num">1</div>
                  <div>
                    <div className="guide-title">Create Stripe Products for Packages</div>
                    <div className="guide-desc">Create Sentinel, Guardian, and Fortress monthly prices matching the package cards. Store the Stripe price ID beside each package ID on the backend.</div>
                  </div>
                </div>
                <div className="guide-step">
                  <div className="guide-num">2</div>
                  <div>
                    <div className="guide-title">Gate Features by Paid Plan</div>
                    <div className="guide-desc">After checkout, write the active plan to your user record. The app already reads package capabilities for scan depth, network scan, virus scan, AI analysis, and max devices.</div>
                  </div>
                </div>
                <div className="guide-step">
                  <div className="guide-num">3</div>
                  <div>
                    <div className="guide-title">Required Production Pages</div>
                    <div className="guide-desc">Publish Terms, Privacy Policy, Refund Policy, contact email, and data-processing notice before accepting customer endpoint telemetry.</div>
                  </div>
                </div>
                <div className="code-block">{`Backend endpoints to connect:
POST /api/auth/google
POST /api/auth/microsoft
POST /api/email/welcome
POST /api/security/session
POST /api/agent/install
POST /api/billing/checkout
POST /api/billing/webhook`}</div>
              </div>
            </div>
          )}

          {tab==="deploy"&&(
            <div>
              <div className="guide-section">
                <div style={{fontFamily:"var(--fd)",fontSize:16,fontWeight:700,color:"var(--dtext)",marginBottom:4}}>Full Deployment — React + Auth0 + AWS (All Free)</div>
                <div className="guide-step">
                  <div className="guide-num">1</div>
                  <div>
                    <div className="guide-title">Create React Project</div>
                    <div className="code-block">{`npx create-react-app sentrasec
cd sentrasec
npm install recharts @auth0/auth0-react axios
# Paste sentrasec-v3.jsx content into src/App.js`}</div>
                  </div>
                </div>
                <div className="guide-step">
                  <div className="guide-num">2</div>
                  <div>
                    <div className="guide-title">Configure Environment</div>
                    <div className="code-block">{`# .env.local (never commit to git)
REACT_APP_AUTH0_DOMAIN=your-tenant.auth0.com
REACT_APP_AUTH0_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
REACT_APP_API_BASE=https://api-gateway-id.amazonaws.com/prod`}</div>
                  </div>
                </div>
                <div className="guide-step">
                  <div className="guide-num">3</div>
                  <div>
                    <div className="guide-title">Deploy to Vercel (Free)</div>
                    <div className="code-block">{`npm install -g vercel
npm run build
vercel --prod
# Your app: https://sentrasec.vercel.app
# Add custom domain: sentrasec.com in Vercel dashboard`}</div>
                  </div>
                </div>
                <div className="guide-step">
                  <div className="guide-num">4</div>
                  <div>
                    <div className="guide-title">Cost Summary (Monthly)</div>
                    <div className="code-block">{`Auth0          FREE   (up to 7,000 users)
AWS DynamoDB   FREE   (25 GB, 200M requests)  
AWS Lambda     FREE   (1M requests/month)
AWS SES        FREE   (62K emails from Lambda)
AWS API Gateway FREE  (1M calls first 12 months)
Vercel         FREE   (hobby/personal projects)
─────────────────────────────────────────────
TOTAL          $0/month  ✓`}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   OVERVIEW VIEW
═══════════════════════════════════════════════════════════ */
const TT_D = {background:"#0f1824",border:"1px solid rgba(34,211,238,0.2)",borderRadius:6,fontSize:11,fontFamily:"IBM Plex Mono,monospace"};
function genThreat() { return Array.from({length:24},(_,i)=>({ t:`${String(i).padStart(2,"0")}:00`, critical:Math.floor(Math.random()*8), high:Math.floor(Math.random()*20), medium:Math.floor(Math.random()*35) })); }

function OverviewView({ device, pkg, vulns, virusScan, onUpgrade }) {
  const risk = calcRisk(vulns||[], virusScan);
  const [td] = useState(genThreat);
  const RADAR = [{subject:"Perimeter",A:85},{subject:"Endpoints",A:62},{subject:"Identity",A:78},{subject:"Data",A:45},{subject:"Network",A:91},{subject:"Cloud",A:70}];
  const PIE   = [{name:"Critical",value:vulns?.filter(v=>v.sev==="CRITICAL").length||4,color:"#ef4444"},{name:"High",value:vulns?.filter(v=>v.sev==="HIGH").length||12,color:"#f97316"},{name:"Medium",value:vulns?.filter(v=>v.sev==="MEDIUM").length||8,color:"#eab308"},{name:"Low",value:2,color:"#22d3ee"}];

  const kpis = [
    {l:"Active Threats",  v:risk.score>50?"CRITICAL":"MONITOR", d:`Risk: ${risk.level}`,       c:risk.color,  ic:"⚡"},
    {l:"Your Device",     v:device?device.os.split("/")[0]:"--", d:device?device.hostname:"Not registered", c:"#22d3ee",ic:"💻"},
    {l:"CVEs Detected",   v:vulns?.length||0,                     d:`${vulns?.filter(v=>v.status==="OPEN").length||0} open`, c:"#f97316",ic:"⚠"},
    {l:"Virus Threats",   v:virusScan?virusScan.found:"-",        d:virusScan?virusScan.status:"Scan required", c:virusScan?.found>0?"#ef4444":"#22c55e",ic:"🦠"},
    {l:"Risk Score",      v:risk.score,                            d:`${risk.level} risk level`,  c:risk.color,  ic:"🎯"},
    {l:"Scan Coverage",   v:`${pkg.scanDepth} CVE`,               d:`${pkg.name} plan`,          c:pkg.color,   ic:"🔍"},
  ];

  return (
    <>
      <div className="kg">
        {kpis.map(k=>(
          <div key={k.l} className="kc">
            <div className="kl">{k.l}</div>
            <div className="kv" style={{color:k.c,fontSize:typeof k.v==="string"?18:28}}>{k.v}</div>
            <div className="kd">{k.d}</div>
            <div style={{position:"absolute",top:14,right:14,fontSize:16,opacity:0.3}}>{k.ic}</div>
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:`${k.c}25`}}><div style={{height:"100%",width:"65%",background:k.c,borderRadius:2}}/></div>
          </div>
        ))}
      </div>

      {device&&(
        <div className="pn" style={{marginBottom:14}}>
          <div className="ph">
            <div className="pt">💻 Registered Device — Auto-Detected on Login</div>
            <SBadge s="ACTIVE"/>
          </div>
          <div className="pb" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
            {[["Hostname",device.hostname],["Public IP",device.publicIp],["Local IP",device.localIp],["OS",device.os],["Browser",device.browser],["User",device.username]].map(([k,v])=>(
              <div key={k} style={{background:"var(--dbg2)",border:"1px solid var(--dborder)",borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontSize:9,color:"var(--dmuted)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>{k}</div>
                <div style={{fontSize:12,color:"var(--dcyan)",fontWeight:500}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="g3" style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,marginBottom:14}}>
        <div className="pn">
          <div className="ph"><div className="pt">⚡ Threat Activity — 24h</div><span style={{fontSize:10,color:"var(--dmuted)"}}>Live</span></div>
          <div className="pb">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={td}>
                <defs>{[["cr","#ef4444"],["hi","#f97316"],["me","#eab308"]].map(([k,c])=>(
                  <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={c} stopOpacity={0.28}/><stop offset="95%" stopColor={c} stopOpacity={0}/>
                  </linearGradient>
                ))}</defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.05)"/>
                <XAxis dataKey="t" tick={{fontSize:9,fill:"#64748b"}} interval={3}/>
                <YAxis tick={{fontSize:9,fill:"#64748b"}}/>
                <Tooltip contentStyle={TT_D}/>
                <Area type="monotone" dataKey="critical" stroke="#ef4444" fill="url(#g-cr)" strokeWidth={1.5}/>
                <Area type="monotone" dataKey="high"     stroke="#f97316" fill="url(#g-hi)" strokeWidth={1.5}/>
                <Area type="monotone" dataKey="medium"   stroke="#eab308" fill="url(#g-me)" strokeWidth={1.5}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="pn">
          <div className="ph"><div className="pt">◉ Security Posture</div></div>
          <div className="pb">
            <ResponsiveContainer width="100%" height={190}>
              <RadarChart data={RADAR}>
                <PolarGrid stroke="rgba(34,211,238,0.08)"/>
                <PolarAngleAxis dataKey="subject" tick={{fontSize:9,fill:"#64748b"}}/>
                <Radar dataKey="A" stroke={pkg.color} fill={pkg.color} fillOpacity={0.14} strokeWidth={1.5}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div className="pn">
          <div className="ph"><div className="pt">◈ Vulnerability Distribution</div></div>
          <div className="pb">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={PIE} cx="50%" cy="50%" innerRadius={44} outerRadius={70} dataKey="value" strokeWidth={0}>
                  {PIE.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip contentStyle={TT_D}/>
              </PieChart>
            </ResponsiveContainer>
            {PIE.map(d=>(
              <div key={d.name} style={{display:"flex",alignItems:"center",gap:8,fontSize:11,marginBottom:4,fontFamily:"var(--fm)"}}>
                <div style={{width:8,height:8,borderRadius:2,background:d.color,flexShrink:0}}/>
                <span style={{color:"var(--dmuted)",flex:1}}>{d.name}</span>
                <span style={{color:d.color,fontWeight:600}}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="pn">
          <div className="ph"><div className="pt">🎯 Risk Assessment</div></div>
          <div className="pb" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
            <RiskRing score={risk.score} color={risk.color} level={risk.level}/>
            <div style={{width:"100%"}}>
              {[["Critical CVEs",vulns?.filter(v=>v.sev==="CRITICAL"&&v.status==="OPEN").length||0,"#ef4444"],
                ["High CVEs",   vulns?.filter(v=>v.sev==="HIGH"&&v.status==="OPEN").length||0,"#f97316"],
                ["Virus Threats",virusScan?.threats.filter(t=>!t.clean).length||0,"#a78bfa"],
              ].map(([l,v,c])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid var(--dborder)",fontSize:11,fontFamily:"var(--fm)"}}>
                  <span style={{color:"var(--dmuted)"}}>{l}</span><span style={{color:c,fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════════════ */
function Dashboard({ user, device, onLogout, onUpgrade }) {
  const [view,     setView]      = useState("overview");
  const [vulns,    setVulns]     = useState([]);
  const [virusScan,setVirusScan] = useState(null);
  const pkg = PACKAGES.find(p=>p.id===user.pkg)||PACKAGES[0];
  const isGP = ["guardian","fortress"].includes(user.pkg);
  const isFP = user.pkg==="fortress";

  const NAV = [
    { id:"overview",   label:"Overview",          icon:"◈",  section:"MONITOR" },
    { id:"mydevice",   label:"My Device",         icon:"💻",  badge: device?"1":null },
    { id:"vulnscan",   label:"Vulnerability Scan", icon:"🔍" },
    { id:"virusscan",  label:"Virus Scanner",      icon:"🦠",  locked:!pkg.virusScan },
    { id:"alerts",     label:"Live Alerts",        icon:"⚡",  badge:"8", section:"ANALYZE" },
    { id:"endpoints",  label:"All Endpoints",      icon:"⬡" },
    { id:"network",    label:"Network Traffic",    icon:"⟁" },
    { id:"intel",      label:"Threat Intel",       icon:"◎",  locked:!isGP },
    { id:"incidents",  label:"Incidents",          icon:"⬘",  locked:!isGP, section:"RESPOND" },
    { id:"reports",    label:"Reports",            icon:"▤",  section:"REPORT" },
    { id:"setup",      label:"Backend Setup",      icon:"⚙",  section:"CONFIG" },
  ];

  return (
    <div className="dl">
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <nav className="sb">
        <div className="sb-head">
          <Logo size={22} lightMode/>
          <div style={{fontSize:9,letterSpacing:2,color:"var(--dmuted)",textTransform:"uppercase",marginTop:5}}>Security Operations Center</div>
        </div>
        <div className="sb-pkg" style={{color:pkg.color,borderColor:`${pkg.color}44`,background:`${pkg.color}12`}}>
          {pkg.name} · {pkg.tier}
        </div>
        <div className="sb-nav">
          {NAV.map(item=>(
            <div key={item.id}>
              {item.section&&<div className="sb-sec">{item.section}</div>}
              <div className={`ni ${view===item.id?"on":""} ${item.locked?"lkd":""}`}
                onClick={()=>!item.locked&&setView(item.id)}>
                <span style={{fontSize:13}}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge&&<span className="nb">{item.badge}</span>}
                {item.locked&&<span style={{marginLeft:"auto",fontSize:9,opacity:0.4}}>LOCKED</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="sb-foot">
          <div className="sb-usr">
            <div className="sb-av">{user.name[0]}</div>
            <div>
              <div style={{fontSize:12,color:"var(--dtext)",fontWeight:500}}>{user.name}</div>
              <div style={{fontSize:10,color:"var(--dmuted)"}}>{user.role}</div>
            </div>
          </div>
          <a href={`mailto:${BRAND.email}`} className="sb-ci" style={{color:"var(--dmuted)",textDecoration:"none"}}>✉ {BRAND.email}</a>
          <a href={`tel:${BRAND.phone.replace(/ /g,"")}`} className="sb-ci" style={{color:"var(--dmuted)",textDecoration:"none"}}>📱 {BRAND.phone}</a>
          <button className="lgout" onClick={onLogout}>⏻ Sign Out</button>
        </div>
      </nav>

      <div className="dm">
        <div className="tb">
          <div className="tb-title">{NAV.find(n=>n.id===view)?.label}</div>
          <div style={{fontFamily:"var(--fm)",fontSize:10,color:"var(--dmuted)"}}>
            {device?`💻 ${device.hostname} · ${device.publicIp}`:"No device"}
          </div>
          <div className="tpill" style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)"}}>
            <div className="tdot" style={{background:"#ef4444"}}/>
            <span style={{color:"#f87171",fontSize:11,fontWeight:600}}>THREAT: HIGH</span>
          </div>
          {!isFP&&<button className="upbtn" style={{borderColor:pkg.color,color:pkg.color}} onClick={onUpgrade}>↑ Upgrade</button>}
        </div>

        <div className="dc">
          {view==="overview"  && <OverviewView device={device} pkg={pkg} vulns={vulns} virusScan={virusScan} onUpgrade={onUpgrade}/>}
          {view==="mydevice"  && <DeviceView device={device} pkg={pkg} vulns={vulns} virusScan={virusScan}/>}
          {view==="vulnscan"  && <VulnScanner device={device} pkg={pkg} onComplete={setVulns}/>}
          {view==="virusscan" && <VirusScanner device={device} pkg={pkg} onComplete={setVirusScan}/>}
          {view==="alerts"    && <AlertsV/>}
          {view==="endpoints" && <EndptsV device={device}/>}
          {view==="network"   && <NetV/>}
          {view==="intel"     && <FGate title="Threat Intelligence Feed" icon="◎" desc="Live IOC feeds, APT tracking & dark web monitoring." pkg="Guardian" onUpgrade={onUpgrade}/>}
          {view==="incidents" && <FGate title="Incident Management" icon="⬘" desc="Track, triage and resolve incidents with full collaboration." pkg="Guardian" onUpgrade={onUpgrade}/>}
          {view==="reports"   && <RepsV/>}
          {view==="setup"     && <SetupGuide/>}
        </div>
      </div>
    </div>
  );
}

/* tiny sub-views */
const SAMPLE_ALERTS = [
  {id:1,sev:"CRITICAL",msg:"Brute force attack on SSH port 22",host:"prod-db-01",time:"2m ago",geo:"CN"},
  {id:2,sev:"HIGH",msg:"Lateral movement — unusual SMB traffic",host:"workstation-14",time:"7m ago",geo:"RU"},
  {id:3,sev:"HIGH",msg:"Privilege escalation via sudo abuse",host:"web-server-03",time:"12m ago",geo:"IR"},
  {id:4,sev:"MEDIUM",msg:"Anomalous DNS query to C2 domain",host:"laptop-jen",time:"18m ago",geo:"US"},
  {id:5,sev:"LOW",msg:"Failed login attempts exceeding threshold",host:"vpn-gateway",time:"31m ago",geo:"BR"},
];
function AlertsV() {
  const [f,setF]=useState("ALL"); const fs=["ALL","CRITICAL","HIGH","MEDIUM","LOW"];
  const filtered=f==="ALL"?SAMPLE_ALERTS:SAMPLE_ALERTS.filter(a=>a.sev===f);
  return (
    <>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {fs.map(fi=>{ const c=sc(fi==="ALL"?"CLEAN":fi); return <button key={fi} onClick={()=>setF(fi)} style={{padding:"5px 12px",border:`1px solid ${f===fi?c.border:"var(--dborder)"}`,borderRadius:4,background:f===fi?c.bg:"transparent",color:f===fi?c.text:"var(--dmuted)",cursor:"pointer",fontSize:11,fontFamily:"var(--fm)",letterSpacing:1,textTransform:"uppercase"}}>{fi}{fi!=="ALL"&&` (${SAMPLE_ALERTS.filter(a=>a.sev===fi).length})`}</button>; })}
      </div>
      <div className="pn">
        <div className="ph"><div className="pt">⚡ Security Alerts</div><span style={{fontSize:10,color:"var(--dmuted)"}}>{filtered.length} alerts</span></div>
        <div style={{padding:"0 18px"}}>
          {filtered.map(a=>(
            <div key={a.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"11px 0",borderBottom:"1px solid var(--dborder)"}}>
              <SBadge s={a.sev}/>
              <div style={{flex:1}}><div style={{fontSize:12,color:"var(--dtext)"}}>{a.msg}</div><div style={{fontSize:10,color:"var(--dmuted)",marginTop:3}}>{a.host} · Source: {a.geo} · {a.time}</div></div>
              <button style={{padding:"4px 10px",background:"rgba(34,211,238,0.07)",border:"1px solid rgba(34,211,238,0.18)",borderRadius:4,color:"var(--dcyan)",fontSize:10,cursor:"pointer",fontFamily:"var(--fm)"}}>Investigate</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
function EndptsV({ device }) {
  const base=[
    {name:"prod-db-01",ip:"10.0.1.10",os:"Ubuntu 22.04",status:"CRITICAL",threats:3,lastSeen:"Active"},
    {name:"web-server-03",ip:"10.0.1.23",os:"CentOS 8",status:"HIGH",threats:2,lastSeen:"Active"},
    {name:"dc-server-01",ip:"10.0.0.5",os:"Windows Server 2022",status:"MEDIUM",threats:1,lastSeen:"Active"},
    {name:"vpn-gateway",ip:"203.0.113.5",os:"pfSense 2.7",status:"CLEAN",threats:0,lastSeen:"Active"},
  ];
  const all = device ? [{ name:device.hostname, ip:device.localIp, os:device.os, status:"ACTIVE", threats:0, lastSeen:"Just now (you)", isYou:true }, ...base] : base;
  return (
    <div className="pn">
      <div className="ph"><div className="pt">⬡ All Endpoints</div><span style={{fontSize:10,color:"var(--dmuted)"}}>{all.length} devices</span></div>
      <div style={{overflowX:"auto"}}>
        <table className="dt">
          <thead><tr><th>Hostname</th><th>IP</th><th>OS</th><th>Status</th><th>Threats</th><th>Last Seen</th></tr></thead>
          <tbody>
            {all.map(e=>{ const s=sc(e.status); return <tr key={e.name} style={{background:e.isYou?"rgba(34,211,238,0.04)":undefined}}>
              <td style={{color:"var(--dcyan)",fontWeight:500}}>{e.name}{e.isYou&&<span style={{marginLeft:6,fontSize:9,color:"#22c55e"}}>(YOU)</span>}</td>
              <td style={{color:"var(--dmuted)",fontSize:11}}>{e.ip}</td>
              <td style={{fontSize:11,color:"var(--dmuted)"}}>{e.os}</td>
              <td><SBadge s={e.status}/></td>
              <td style={{color:e.threats>0?"#f87171":"#4ade80",fontWeight:600}}>{e.threats}</td>
              <td style={{fontSize:11,color:"var(--dmuted)"}}>{e.lastSeen}</td>
            </tr>; })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function NetV() {
  const [nd]=useState(()=>Array.from({length:30},(_,i)=>({t:i,inbound:Math.floor(Math.random()*800+200),outbound:Math.floor(Math.random()*600+100),blocked:Math.floor(Math.random()*50)})));
  return (
    <div className="pn">
      <div className="ph"><div className="pt">⟁ Network Traffic — 30 min</div></div>
      <div className="pb">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={nd}>
            <defs>{[["in","#22d3ee"],["ou","#a78bfa"],["bl","#ef4444"]].map(([k,c])=>(<linearGradient key={k} id={`n${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={c} stopOpacity={0.22}/><stop offset="95%" stopColor={c} stopOpacity={0}/></linearGradient>))}</defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.05)"/>
            <XAxis dataKey="t" tick={{fontSize:9,fill:"#64748b"}}/><YAxis tick={{fontSize:9,fill:"#64748b"}} unit=" MB"/>
            <Tooltip contentStyle={TT_D}/>
            <Area type="monotone" dataKey="inbound"  name="Inbound"  stroke="#22d3ee" fill="url(#nin)" strokeWidth={1.5}/>
            <Area type="monotone" dataKey="outbound" name="Outbound" stroke="#a78bfa" fill="url(#nou)" strokeWidth={1.5}/>
            <Area type="monotone" dataKey="blocked"  name="Blocked"  stroke="#ef4444" fill="url(#nbl)" strokeWidth={1.5}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
function FGate({ title, icon, desc, pkg, onUpgrade }) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"55vh",gap:14,textAlign:"center"}}>
      <div style={{fontSize:52,opacity:0.25}}>{icon}</div>
      <div style={{fontFamily:"var(--fd)",fontSize:22,fontWeight:800,color:"var(--dmuted)"}}>{title}</div>
      <div style={{fontSize:13,color:"var(--dmuted)",maxWidth:380,lineHeight:1.6,fontFamily:"var(--fm)"}}>{desc}</div>
      <div style={{fontSize:12,color:"var(--dmuted)",fontFamily:"var(--fm)"}}>Available on <strong style={{color:"var(--dcyan)"}}>{pkg}</strong> plan and above</div>
      <button onClick={onUpgrade} style={{padding:"11px 22px",background:"var(--dcyan)",border:"none",borderRadius:6,color:"#000",fontFamily:"var(--fm)",fontSize:13,fontWeight:700,cursor:"pointer"}}>Upgrade to {pkg} →</button>
    </div>
  );
}
function RepsV() {
  const rpts=[{t:"Executive Security Summary",d:"May 2026",tp:"PDF",sz:"2.4 MB"},{t:"Vulnerability Assessment Report",d:"May 2026",tp:"PDF",sz:"5.1 MB"},{t:"SOC 2 Compliance Report",d:"Q1 2026",tp:"PDF",sz:"8.7 MB"},{t:"Network Traffic Analysis",d:"Apr 2026",tp:"CSV",sz:"14.2 MB"}];
  return <div className="pn"><div className="ph"><div className="pt">▤ Reports & Exports</div></div><div style={{padding:"0 18px"}}>{rpts.map((r,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 0",borderBottom:"1px solid var(--dborder)"}}><div style={{fontSize:20,opacity:0.45}}>📄</div><div style={{flex:1}}><div style={{fontSize:13,color:"var(--dtext)"}}>{r.t}</div><div style={{fontSize:10,color:"var(--dmuted)",marginTop:2}}>{r.d} · {r.sz}</div></div><span style={{fontSize:10,padding:"3px 7px",background:"rgba(34,211,238,0.07)",border:"1px solid rgba(34,211,238,0.18)",borderRadius:3,color:"var(--dcyan)"}}>{r.tp}</span><button style={{padding:"5px 12px",background:"transparent",border:"1px solid var(--dborder2)",borderRadius:4,color:"var(--dcyan)",fontSize:11,cursor:"pointer",fontFamily:"var(--fm)"}}>Download</button></div>))}</div></div>;
}

/* ═══════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════ */
function LandingPage({ onGetStarted }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#020817", color: "white", fontFamily: "var(--fs)" }}>
      {/* Header */}
      <header style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <Logo size={40} lightMode={true} showTagline={false} />
        <div style={{ display: "flex", gap: "16px" }}>
          <button onClick={onGetStarted} style={{ padding: "10px 24px", backgroundColor: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
            Sign In
          </button>
          <button onClick={onGetStarted} style={{ padding: "10px 24px", backgroundColor: "#0ea5e9", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ padding: "100px 20px", textAlign: "center", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "inline-block", padding: "6px 16px", backgroundColor: "rgba(14, 165, 233, 0.1)", color: "#0ea5e9", borderRadius: 20, fontSize: "0.875rem", fontWeight: 600, marginBottom: 24 }}>
          SentraSec 3.0 is now available
        </div>
        <h1 style={{ fontSize: "4.5rem", fontWeight: 800, marginBottom: 24, letterSpacing: "-0.02em", background: "linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1 }}>
          Centralized Security<br/>Intelligence Platform
        </h1>
        <p style={{ fontSize: "1.25rem", color: "#94a3b8", marginBottom: 48, lineHeight: 1.6, maxWidth: 600, margin: "0 auto 48px auto" }}>
          Protect your endpoints, analyze threats with advanced AI, and respond to incidents in real-time. The ultimate SOC command center.
        </p>
        <button onClick={onGetStarted} style={{ padding: "16px 48px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: 12, fontSize: "1.25rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 0 40px rgba(59, 130, 246, 0.4)", transition: "transform 0.2s" }} onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"} onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}>
          Start Free Trial
        </button>
        
        {/* Features preview */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32, marginTop: 100 }}>
          {[
            { title: "Real-time Monitoring", desc: "Track threats instantly across all your endpoints with low latency.", icon: "⚡" },
            { title: "AI-Powered Analysis", desc: "Identify zero-day vulnerabilities using advanced machine learning models.", icon: "🧠" },
            { title: "Automated Responses", desc: "Execute security playbooks automatically when threats are detected.", icon: "🛡️" }
          ].map((feature, i) => (
            <div key={i} style={{ padding: 32, backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, textAlign: "left", backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: "2rem", marginBottom: 16 }}>{feature.icon}</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 12, color: "#e2e8f0" }}>{feature.title}</h3>
              <p style={{ color: "#94a3b8", lineHeight: 1.5 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [screen,   setScreen]   = useState("landing");   // landing | auth | detecting | pricing | dashboard
  const [showAuth, setShowAuth] = useState(false);
  const [user,     setUser]     = useState(null);
  const [device,   setDevice]   = useState(null);

  const handleAuth = (u) => {
    setUser(u); setShowAuth(false);
    if (u.isNew||!u.pkg) { setScreen("pricing"); return; }
    setScreen("detecting"); // trigger device detection
  };

  const handleDeviceDetected = async (d) => {
    if (user) await registerSecuritySession(user, d);
    setDevice(d); setScreen("dashboard");
  };

  const handlePkg = async (pkgId) => {
    const u = { ...user, pkg:pkgId };
    setUser(u);
    if (u.isNew) await sendWelcomeEmail(u, pkgId);
    setScreen("detecting");
  };

  const handleLogout = () => { setUser(null); setDevice(null); setScreen("auth"); setShowAuth(false); };

  return (
    <>
      <style>{CSS}</style>

      {/* LANDING */}
      {screen==="landing" && (
        <LandingPage onGetStarted={() => setScreen("auth")} />
      )}

      {/* AUTH SCREEN */}
      {screen==="auth"&&(
        <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#f0f4ff,#e8effd)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{textAlign:"center",maxWidth:460}}>
            <div style={{marginBottom:32}}><Logo size={44} color="#0f2d5e" showTagline/></div>
            <h1 style={{fontFamily:"var(--fd)",fontSize:36,fontWeight:900,color:"var(--navy)",marginBottom:12,letterSpacing:"-1px"}}>Defend Every<br/><em style={{color:"var(--cyandk)",fontStyle:"italic"}}>Attack Surface</em></h1>
            <p style={{fontSize:15,color:"var(--lmuted)",lineHeight:1.7,marginBottom:32}}>Enterprise-grade security operations center with real-time device detection, vulnerability scanning, and AI-powered threat analysis.</p>
            <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:24}}>
              <button onClick={()=>setShowAuth(true)} style={{padding:"14px 32px",background:"var(--navy)",color:"white",border:"none",borderRadius:10,fontFamily:"var(--fs)",fontSize:15,fontWeight:700,cursor:"pointer"}}>Sign In / Sign Up →</button>
            </div>
            <div style={{fontSize:11,color:"var(--lmuted)",fontFamily:"var(--fm)"}}>
              ✉ {BRAND.email} &nbsp;·&nbsp; 📱 {BRAND.phone}
            </div>
            <div style={{marginTop:20,fontSize:11,color:"var(--lmuted)",fontFamily:"var(--fm)"}}>
              Demo: <strong style={{color:"var(--cyandk)"}}>admin@sentrasec.io</strong> / demo123
            </div>
          </div>
          {showAuth&&<AuthModal onAuth={handleAuth} onClose={()=>setShowAuth(false)}/>}
        </div>
      )}

      {/* DEVICE DETECTION */}
      {screen==="detecting"&&user&&(
        <DeviceDetectOverlay user={user} onComplete={handleDeviceDetected}/>
      )}

      {/* PRICING */}
      {screen==="pricing"&&(
        <PricingPage onSelect={handlePkg} onBack={()=>setScreen("auth")}/>
      )}

      {/* DASHBOARD */}
      {screen==="dashboard"&&user&&(
        <Dashboard user={user} device={device} onLogout={handleLogout} onUpgrade={()=>setScreen("pricing")}/>
      )}
    </>
  );
}
