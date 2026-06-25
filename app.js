import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getDatabase,
  onValue,
  ref,
  serverTimestamp,
  set,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const STORAGE_KEY = "taskflow-local-state-v1";
const TASKFLOW_CONFIG = window.TASKFLOW_CONFIG || {};
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let syncingFromRemote = false;

const I18N = {
  ar: {
    brandEyebrow: "منصة متابعة المهام",
    brandTitle: "متابع المهام",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    heroEyebrow: "تنظيم شخصي ووظيفي في مكان واحد",
    heroTitle: "أضف المهمة كتابة أو بالصوت أو من صورة، ثم حولها إلى صيغة ذكية جاهزة للحفظ.",
    heroText: "يدعم التطبيق المهام الشخصية واليومية والأسبوعية والشهرية، والمهام الوظيفية الدورية والمستعجلة والمجدولة، مع سجل منجزات منفصل.",
    activeTasks: "مهام نشطة",
    doneTasks: "مهام منجزة",
    aiReady: "جاهزية الصياغة",
    composerEyebrow: "إضافة مهمة",
    composerTitle: "أنشئ المهمة بذكاء",
    personal: "شخصية",
    work: "وظيفية",
    write: "كتابة",
    voice: "صوت",
    image: "صورة",
    taskTextLabel: "نص المهمة",
    voiceHint: "سجل صوتك وسيحوّل التطبيق الكلام إلى نص.",
    uploadImage: "ارفع صورة لاستخلاص المهمة",
    extractTask: "استخلاص المهمة من الصورة",
    detailsLabel: "تفصيل المهمة",
    categoryLabel: "التصنيف",
    daily: "يومية",
    weekly: "أسبوعية",
    monthly: "شهرية",
    recurring: "دورية",
    urgent: "مستعجلة",
    scheduled: "محددة بزمن",
    dueLabel: "الموعد",
    priorityLabel: "الأولوية",
    low: "منخفضة",
    medium: "متوسطة",
    high: "عالية",
    aiPreview: "صياغة ذكية",
    addTask: "إضافة المهمة",
    aiDraftEyebrow: "الصياغة الذكية",
    aiDraftTitle: "المهمة قبل الحفظ",
    splitIdea: "الفكرة",
    splitIdeaValue: "شخصي / وظيفي",
    splitSource: "المصدر",
    splitSourceValue: "نص / صوت / صورة",
    archiveRule: "الأرشفة",
    archiveRuleValue: "تُنقل بعد الإنجاز",
    personalTasks: "المهام الشخصية",
    personalBoard: "اليومية والأسبوعية والشهرية",
    workTasks: "المهام الوظيفية",
    workBoard: "الدورية والمستعجلة والمجدولة",
    archiveEyebrow: "سجل المهام",
    archiveTitle: "المهام المنجزة منفصلة حسب النوع",
    donePersonal: "المنجزة الشخصية",
    doneWork: "المنجزة الوظيفية",
    authEyebrow: "الدخول إلى الحساب",
    authTitle: "سجّل دخولك أو أنشئ حسابًا جديدًا",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    login: "دخول",
    register: "تسجيل جديد",
    localMode: "وضع محلي",
    connected: "متصل",
    extracted: "تم الاستخلاص",
    recordStart: "إيقاف التسجيل",
    recordReady: "بدء التسجيل الصوتي",
    wait: "انتظر قليلاً",
    noTasks: "لا توجد مهام بعد",
    saveHint: "ستُنقل المهمة إلى السجل عند الإنجاز",
    aiBadge: "AI",
    kindPersonal: "شخصية",
    kindWork: "وظيفية",
  },
  en: {
    brandEyebrow: "Task tracking platform",
    brandTitle: "TaskFlow",
    signIn: "Sign in",
    signOut: "Sign out",
    heroEyebrow: "Personal and work planning in one place",
    heroTitle: "Add tasks by typing, voice, or image, then turn them into a smart structured draft.",
    heroText: "The app supports personal daily, weekly, and monthly tasks, plus work recurring, urgent, and scheduled tasks with a separate completion archive.",
    activeTasks: "Active tasks",
    doneTasks: "Completed",
    aiReady: "Draft readiness",
    composerEyebrow: "Add task",
    composerTitle: "Create tasks intelligently",
    personal: "Personal",
    work: "Work",
    write: "Text",
    voice: "Voice",
    image: "Image",
    taskTextLabel: "Task text",
    voiceHint: "Speak and the app will convert speech to text.",
    uploadImage: "Upload an image to extract the task",
    extractTask: "Extract task from image",
    detailsLabel: "Task details",
    categoryLabel: "Category",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    recurring: "Recurring",
    urgent: "Urgent",
    scheduled: "Scheduled",
    dueLabel: "Due date",
    priorityLabel: "Priority",
    low: "Low",
    medium: "Medium",
    high: "High",
    aiPreview: "Smart draft",
    addTask: "Add task",
    aiDraftEyebrow: "Smart draft",
    aiDraftTitle: "Before saving",
    splitIdea: "Idea",
    splitIdeaValue: "Personal / Work",
    splitSource: "Source",
    splitSourceValue: "Text / Voice / Image",
    archiveRule: "Archive",
    archiveRuleValue: "Moves after completion",
    personalTasks: "Personal tasks",
    personalBoard: "Daily, weekly, monthly",
    workTasks: "Work tasks",
    workBoard: "Recurring, urgent, scheduled",
    archiveEyebrow: "Task archive",
    archiveTitle: "Completed tasks split by type",
    donePersonal: "Completed personal",
    doneWork: "Completed work",
    authEyebrow: "Account access",
    authTitle: "Sign in or create a new account",
    emailLabel: "Email",
    passwordLabel: "Password",
    login: "Login",
    register: "Register",
    localMode: "Local mode",
    connected: "Connected",
    extracted: "Extracted",
    recordStart: "Stop recording",
    recordReady: "Start voice recording",
    wait: "Please wait",
    noTasks: "No tasks yet",
    saveHint: "The task will move to archive when completed",
    aiBadge: "AI",
    kindPersonal: "Personal",
    kindWork: "Work",
  },
};

const state = {
  lang: "ar",
  kind: "personal",
  source: "text",
  user: null,
  tasks: [],
  archive: [],
  draft: null,
  imageDataUrl: null,
  filtered: { personal: "", work: "" },
  mode: "local",
};

const els = {};

function $(id) {
  return document.getElementById(id);
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    Object.assign(state, parsed);
    state.lang = state.lang || "ar";
    state.kind = state.kind || "personal";
    state.source = state.source || "text";
    state.tasks = Array.isArray(state.tasks) ? state.tasks : [];
    state.archive = Array.isArray(state.archive) ? state.archive : [];
    state.filtered = state.filtered || { personal: "", work: "" };
  } catch {
    // Ignore and start fresh.
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    lang: state.lang,
    kind: state.kind,
    source: state.source,
    tasks: state.tasks,
    archive: state.archive,
    filtered: state.filtered,
  }));
  saveRemoteState();
}

async function saveRemoteState() {
  if (syncingFromRemote || state.mode !== "firebase" || !firebaseDb || !state.user?.uid) return;
  try {
    await set(ref(firebaseDb, `users/${state.user.uid}/taskflow`), {
      lang: state.lang,
      kind: state.kind,
      source: state.source,
      tasks: state.tasks,
      archive: state.archive,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn("Firebase save failed:", error);
  }
}

function initFirebase() {
  const config = TASKFLOW_CONFIG.firebase;
  if (!config?.apiKey || !config?.authDomain || !config?.databaseURL) {
    state.mode = "local";
    return;
  }

  try {
    firebaseApp = initializeApp(config);
    firebaseAuth = getAuth(firebaseApp);
    firebaseDb = getDatabase(firebaseApp);
    state.mode = "firebase";

    onAuthStateChanged(firebaseAuth, (user) => {
      state.user = user ? { uid: user.uid, email: user.email || "" } : null;
      applyI18n();
      renderTasks();

      if (!user) return;
      const userRef = ref(firebaseDb, `users/${user.uid}/taskflow`);
      onValue(userRef, (snapshot) => {
        const remoteState = snapshot.val();
        if (!remoteState) {
          saveRemoteState();
          return;
        }
        syncingFromRemote = true;
        state.lang = remoteState.lang || state.lang;
        state.kind = remoteState.kind || state.kind;
        state.source = remoteState.source || state.source;
        state.tasks = Array.isArray(remoteState.tasks) ? remoteState.tasks : [];
        state.archive = Array.isArray(remoteState.archive) ? remoteState.archive : [];
        applyI18n();
        renderDraft();
        renderTasks();
        syncingFromRemote = false;
      });
    });
  } catch (error) {
    console.warn("Firebase init failed:", error);
    state.mode = "local";
  }
}

function t(key) {
  return I18N[state.lang][key] ?? I18N.ar[key] ?? key;
}

function applyI18n() {
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
  document.body.dir = document.documentElement.dir;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (key && I18N[state.lang][key]) node.textContent = I18N[state.lang][key];
  });
  $("langToggle").textContent = state.lang === "ar" ? "EN" : "AR";
  $("authToggle").textContent = state.user ? t("signOut") : t("signIn");
  $("connectionStatus").textContent = state.mode === "firebase" ? t("connected") : t("localMode");
  $("voiceBtn").textContent = state.recording ? t("recordStart") : t("recordReady");
  $("draftMode").textContent = state.mode === "firebase" ? "Firebase" : t("aiBadge");
  if ($("authMessage")) {
    $("authMessage").textContent = state.mode === "firebase"
      ? (state.lang === "ar"
          ? "سجّل الدخول ليتم حفظ مهامك في Firebase Realtime Database."
          : "Sign in to save your tasks in Firebase Realtime Database.")
      : (state.lang === "ar"
          ? "التطبيق يعمل محليًا الآن. عند تفعيل Firebase سيحفظ بياناتك سحابيًا."
          : "The app is running locally. When Firebase is active, your data is stored online.");
  }
}

function normalizeText(text = "") {
  return text.trim().replace(/\s+/g, " ");
}

function createDraft(base = "") {
  const text = normalizeText(base || els.taskInput.value || "");
  const details = normalizeText(els.taskDetails.value || "");
  const frequency = els.taskFrequency.value;
  const priority = els.taskPriority.value;

  let title = text;
  if (!title) title = state.lang === "ar" ? "مهمة جديدة" : "New task";

  const urgentWords = /(عاجل|فوراً|حالاً|urgent|asap)/i.test(text);
  if (urgentWords) els.taskPriority.value = "high";

  const inferredKind = state.kind;
  const inferredTags = [
    inferredKind === "personal" ? t("kindPersonal") : t("kindWork"),
    t(frequency),
    t(els.taskPriority.value),
    base ? t("extracted") : t("aiReady"),
  ];

  const summary = details || (text ? `${text}${frequency === "scheduled" ? " - " + (els.taskDue.value || "") : ""}` : t("saveHint"));

  state.draft = {
    title,
    summary,
    kind: inferredKind,
    frequency,
    priority: els.taskPriority.value,
    details,
    source: state.source,
    dueAt: els.taskDue.value,
    tags: inferredTags,
  };

  renderDraft();
}

function renderDraft() {
  const draft = state.draft || createFallbackDraft();
  $("draftTitle").textContent = draft.title;
  $("draftSummary").textContent = draft.summary;
  $("draftTags").innerHTML = draft.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  $("draftMode").textContent = state.mode === "firebase" ? "Firebase" : t("aiBadge");
  $("draftConfidence").textContent = draft.source === "image" || draft.source === "voice" ? "98%" : "96%";
}

function createFallbackDraft() {
  return {
    title: state.lang === "ar" ? "لا توجد صياغة بعد" : "No draft yet",
    summary: state.lang === "ar"
      ? "اكتب مهمة أو استخدم الصوت أو الصورة وسيظهر الملخص هنا."
      : "Type, speak, or upload an image and the summary will appear here.",
    tags: [t("kindPersonal"), t("medium"), t("aiReady")],
    source: "text",
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function smartParse(text) {
  const raw = normalizeText(text);
  const lower = raw.toLowerCase();
  let kind = state.kind;
  if (/(دوام|عمل|وظيفة|شركة|اجتماع|تقارير|مشروع)/i.test(raw)) kind = "work";
  if (/(بيت|منزل|شخصي|عائلة|شراء|تنظيف|غسل|ترتيب)/i.test(raw)) kind = "personal";

  let frequency = els.taskFrequency.value || (kind === "work" ? "recurring" : "daily");
  if (/(اليوم|اليومية|daily)/i.test(raw)) frequency = "daily";
  if (/(اسبوع|weekly|أسبوع)/i.test(raw)) frequency = "weekly";
  if (/(شهر|monthly|شهرية)/i.test(raw)) frequency = "monthly";
  if (/(عاجل|urgent|فوراً|حالاً)/i.test(raw)) frequency = "urgent";
  if (/(موعد|تاريخ|ساعة|بوقت|scheduled)/i.test(raw)) frequency = "scheduled";
  if (kind === "work" && frequency === "daily") frequency = "recurring";

  let priority = "medium";
  if (frequency === "urgent") priority = "high";
  if (/(مهم|high|عالية)/i.test(raw)) priority = "high";
  if (/(خفيف|سهل|low)/i.test(raw)) priority = "low";

  const title = raw.split(/[.!؟\n]/)[0].trim() || raw;
  const summary = raw || t("saveHint");
  const dueAt = els.taskDue.value;

  return { title, summary, kind, frequency, priority, dueAt };
}

function syncDraftFields() {
  createDraft(els.taskInput.value);
}

function switchSource(source) {
  state.source = source;
  document.querySelectorAll(".source-tab").forEach((btn) => btn.classList.toggle("active", btn.dataset.source === source));
  $("voicePanel").hidden = source !== "voice";
  $("imagePanel").hidden = source !== "image";
  syncDraftFields();
  saveState();
}

function switchKind(kind) {
  state.kind = kind;
  document.querySelectorAll(".segment").forEach((btn) => btn.classList.toggle("active", btn.dataset.kind === kind));
  syncDraftFields();
  saveState();
}

function taskHTML(task) {
  const categoryLabel = task.kind === "personal" ? t("kindPersonal") : t("kindWork");
  const frequencyLabel = t(task.frequency) || task.frequency;
  const dueText = task.dueAt ? new Date(task.dueAt).toLocaleString(state.lang === "ar" ? "ar-EG" : "en-US") : "";
  return `
    <div class="task-row" data-id="${task.id}">
      <div class="task-row-head">
        <div>
          <h4>${escapeHtml(task.title)}</h4>
          <p class="hint">${escapeHtml(task.details || task.summary || "")}</p>
        </div>
        <span class="pill ${task.kind}">${escapeHtml(categoryLabel)}</span>
      </div>
      <div class="task-meta">
        <span class="pill">${escapeHtml(frequencyLabel)}</span>
        <span class="pill ${task.priority}">${escapeHtml(t(task.priority))}</span>
        <span class="pill">${escapeHtml(task.source)}</span>
        ${dueText ? `<span class="pill">${escapeHtml(dueText)}</span>` : ""}
      </div>
      <div class="task-actions">
        <button type="button" data-action="done">${state.lang === "ar" ? "إنجاز" : "Done"}</button>
        <button type="button" data-action="edit">${state.lang === "ar" ? "تعديل" : "Edit"}</button>
        <button type="button" data-action="delete">${state.lang === "ar" ? "حذف" : "Delete"}</button>
      </div>
    </div>
  `;
}

function archiveHTML(task) {
  const dueText = task.completedAt ? new Date(task.completedAt).toLocaleString(state.lang === "ar" ? "ar-EG" : "en-US") : "";
  return `
    <div class="archive-row">
      <div class="task-row-head">
        <div>
          <h4>${escapeHtml(task.title)}</h4>
          <p class="hint">${escapeHtml(task.details || task.summary || "")}</p>
        </div>
        <span class="pill done">${state.lang === "ar" ? "منجز" : "Done"}</span>
      </div>
      <div class="archive-meta">
        <span class="pill ${task.kind}">${escapeHtml(task.kind === "personal" ? t("kindPersonal") : t("kindWork"))}</span>
        <span class="pill">${escapeHtml(t(task.frequency))}</span>
        <span class="pill">${escapeHtml(dueText)}</span>
      </div>
    </div>
  `;
}

function renderTasks() {
  const personalSearch = normalizeText(els.personalSearch.value).toLowerCase();
  const workSearch = normalizeText(els.workSearch.value).toLowerCase();

  const groups = {
    personal: { daily: [], weekly: [], monthly: [] },
    work: { recurring: [], urgent: [], scheduled: [] },
  };

  state.tasks.forEach((task) => {
    if (groups[task.kind] && groups[task.kind][task.frequency]) {
      const haystack = `${task.title} ${task.details || ""} ${task.summary || ""}`.toLowerCase();
      if ((task.kind === "personal" && !haystack.includes(personalSearch)) || (task.kind === "work" && !haystack.includes(workSearch))) {
        return;
      }
      groups[task.kind][task.frequency].push(task);
    }
  });

  $("personalTasks").innerHTML = ["daily", "weekly", "monthly"].map((frequency) => {
    const list = groups.personal[frequency];
    return `
      <div class="task-group">
        <div class="task-group-head">
          <strong>${escapeHtml(t(frequency))}</strong>
          <span class="badge">${list.length}</span>
        </div>
        <div class="task-list">
          ${list.length ? list.map(taskHTML).join("") : `<div class="hint">${escapeHtml(t("noTasks"))}</div>`}
        </div>
      </div>`;
  }).join("");

  $("workTasks").innerHTML = ["recurring", "urgent", "scheduled"].map((frequency) => {
    const list = groups.work[frequency];
    return `
      <div class="task-group">
        <div class="task-group-head">
          <strong>${escapeHtml(t(frequency))}</strong>
          <span class="badge">${list.length}</span>
        </div>
        <div class="task-list">
          ${list.length ? list.map(taskHTML).join("") : `<div class="hint">${escapeHtml(t("noTasks"))}</div>`}
        </div>
      </div>`;
  }).join("");

  $("activeCount").textContent = state.tasks.length.toString();
  $("doneCount").textContent = state.archive.length.toString();
  $("donePersonalCount").textContent = state.archive.filter((task) => task.kind === "personal").length.toString();
  $("doneWorkCount").textContent = state.archive.filter((task) => task.kind === "work").length.toString();
  $("donePersonal").innerHTML = state.archive.filter((task) => task.kind === "personal").map(archiveHTML).join("") || `<div class="hint">${escapeHtml(t("noTasks"))}</div>`;
  $("doneWork").innerHTML = state.archive.filter((task) => task.kind === "work").map(archiveHTML).join("") || `<div class="hint">${escapeHtml(t("noTasks"))}</div>`;
}

function addTask(task) {
  state.tasks.unshift({
    id: crypto.randomUUID(),
    title: task.title,
    summary: task.summary,
    details: normalizeText(els.taskDetails.value),
    kind: task.kind,
    frequency: task.frequency,
    priority: task.priority,
    dueAt: task.dueAt || "",
    source: state.source,
    createdAt: new Date().toISOString(),
  });
  saveState();
  renderTasks();
}

function completeTask(id) {
  const index = state.tasks.findIndex((task) => task.id === id);
  if (index === -1) return;
  const [task] = state.tasks.splice(index, 1);
  state.archive.unshift({ ...task, completedAt: new Date().toISOString() });
  saveState();
  renderTasks();
}

function editTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  els.taskInput.value = task.title;
  els.taskDetails.value = task.details || "";
  els.taskFrequency.value = task.frequency;
  els.taskPriority.value = task.priority;
  state.kind = task.kind;
  state.source = task.source;
  switchKind(task.kind);
  switchSource(task.source);
  createDraft(task.title);
}

function deleteTask(id) {
  state.tasks = state.tasks.filter((task) => task.id !== id);
  saveState();
  renderTasks();
}

function handleListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const row = button.closest("[data-id]");
  if (!row) return;
  const { id } = row.dataset;
  if (button.dataset.action === "done") completeTask(id);
  if (button.dataset.action === "edit") editTask(id);
  if (button.dataset.action === "delete") deleteTask(id);
}

function setupVoice() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    $("voiceHint").textContent = state.lang === "ar"
      ? "المتصفح الحالي لا يدعم تحويل الصوت إلى نص."
      : "This browser does not support speech recognition.";
    return;
  }

  const recognition = new Recognition();
  recognition.lang = state.lang === "ar" ? "ar-LY" : "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  state.recording = false;
  $("voiceBtn").addEventListener("click", () => {
    if (state.recording) {
      recognition.stop();
      return;
    }
    state.recording = true;
    applyI18n();
    recognition.start();
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    els.taskInput.value = transcript;
    createDraft(transcript);
  };
  recognition.onerror = () => {
    state.recording = false;
    applyI18n();
  };
  recognition.onend = () => {
    state.recording = false;
    applyI18n();
  };
}

async function extractFromImage(file) {
  state.source = "image";
  switchSource("image");
  const text = await extractTaskTextFromImage(file);
  els.taskInput.value = text;
  createDraft(text);
}

async function extractTaskTextFromImage(file) {
  const reader = new FileReader();
  const dataUrl = await new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  state.imageDataUrl = dataUrl;
  $("imagePreview").src = dataUrl;
  $("imagePreview").hidden = false;

  try {
    if (!window.Tesseract) {
      await loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js");
    }
    const language = state.lang === "ar" ? "ara" : "eng";
    const result = await window.Tesseract.recognize(dataUrl, language);
    const extracted = normalizeText(result?.data?.text || "");
    if (extracted) return extracted;
  } catch (error) {
    console.warn("Image OCR failed:", error);
  }

  const baseName = file.name.replace(/\.[^.]+$/, "");
  const fakeText = baseName.replace(/[_-]/g, " ").trim();
  return fakeText ? `${fakeText} - ${state.lang === "ar" ? "مهمة مستخرجة من الصورة" : "task extracted from image"}` : (state.lang === "ar" ? "مهمة من الصورة" : "Task from image");
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      if (window.Tesseract) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function bindEvents() {
  $("langToggle").addEventListener("click", () => {
    state.lang = state.lang === "ar" ? "en" : "ar";
    applyI18n();
    renderDraft();
    renderTasks();
    saveState();
  });

  $("authToggle").addEventListener("click", async () => {
    if (state.user && firebaseAuth) {
      await signOut(firebaseAuth);
      state.user = null;
      applyI18n();
      renderTasks();
      return;
    }
    $("authModal").hidden = false;
  });
  $("closeAuth").addEventListener("click", () => {
    $("authModal").hidden = true;
  });
  $("authModal").addEventListener("click", (event) => {
    if (event.target === $("authModal")) $("authModal").hidden = true;
  });

  document.querySelectorAll(".segment").forEach((btn) => btn.addEventListener("click", () => switchKind(btn.dataset.kind)));
  document.querySelectorAll(".source-tab").forEach((btn) => btn.addEventListener("click", () => switchSource(btn.dataset.source)));

  els.taskInput.addEventListener("input", syncDraftFields);
  els.taskDetails.addEventListener("input", syncDraftFields);
  els.taskFrequency.addEventListener("change", syncDraftFields);
  els.taskPriority.addEventListener("change", syncDraftFields);
  els.taskDue.addEventListener("change", syncDraftFields);

  $("aiPreviewBtn").addEventListener("click", () => {
    const draft = smartParse(`${els.taskInput.value} ${els.taskDetails.value}`);
    state.draft = {
      ...draft,
      summary: normalizeText(els.taskDetails.value) || draft.summary,
      tags: [draft.kind === "personal" ? t("kindPersonal") : t("kindWork"), t(draft.frequency), t(draft.priority), t("aiReady")],
      source: state.source,
    };
    renderDraft();
  });

  $("taskForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const draft = state.draft || smartParse(els.taskInput.value);
    if (!normalizeText(draft.title)) return;
    addTask(draft);
    els.taskInput.value = "";
    els.taskDetails.value = "";
    els.taskDue.value = "";
    state.draft = null;
    renderDraft();
    saveState();
  });

  $("personalSearch").addEventListener("input", renderTasks);
  $("workSearch").addEventListener("input", renderTasks);

  $("imageInput").addEventListener("change", async (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    await extractFromImage(file);
  });

  $("extractImageBtn").addEventListener("click", async () => {
    const [file] = $("imageInput").files || [];
    if (!file) return;
    await extractFromImage(file);
  });

  ["personalTasks", "workTasks", "donePersonal", "doneWork"].forEach((id) => {
    $(id).addEventListener("click", handleListClick);
  });

  $("loginBtn").addEventListener("click", async () => {
    const email = $("authEmail").value.trim();
    const password = $("authPassword").value;
    try {
      if (state.mode === "firebase" && firebaseAuth) {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      } else {
        state.user = { email };
      }
      $("authModal").hidden = true;
      applyI18n();
      saveState();
    } catch (error) {
      $("authMessage").textContent = state.lang === "ar"
        ? "تعذر تسجيل الدخول. تأكد من البريد وكلمة المرور ومن تفعيل Email/Password في Firebase."
        : `Login failed: ${error.message}`;
    }
  });

  $("registerBtn").addEventListener("click", async () => {
    const email = $("authEmail").value.trim();
    const password = $("authPassword").value;
    try {
      if (state.mode === "firebase" && firebaseAuth) {
        await createUserWithEmailAndPassword(firebaseAuth, email, password);
      } else {
        state.user = { email, created: true };
      }
      $("authModal").hidden = true;
      applyI18n();
      saveState();
    } catch (error) {
      $("authMessage").textContent = state.lang === "ar"
        ? "تعذر إنشاء الحساب. تأكد من أن كلمة المرور 6 أحرف أو أكثر ومن تفعيل Email/Password في Firebase."
        : `Register failed: ${error.message}`;
    }
  });
}

function boot() {
  const ids = [
    "langToggle","authToggle","connectionStatus","voiceBtn","taskInput","taskDetails","taskFrequency","taskPriority","taskDue",
    "voicePanel","imagePanel","taskForm","personalSearch","workSearch","personalTasks","workTasks","donePersonal","doneWork",
    "donePersonalCount","doneWorkCount","authModal","closeAuth","authEmail","authPassword","loginBtn","registerBtn","imageInput",
    "extractImageBtn","imagePreview","aiPreviewBtn","draftTitle","draftSummary","draftTags","draftMode","activeCount","doneCount",
    "draftConfidence","voiceHint",
  ];
  ids.forEach((id) => (els[id] = $(id)));
  loadState();
  initFirebase();
  applyI18n();
  state.draft = createFallbackDraft();
  renderDraft();
  renderTasks();
  bindEvents();
  setupVoice();
  switchSource(state.source);
  switchKind(state.kind);
  saveState();
}

boot();
