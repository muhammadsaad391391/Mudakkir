/* ==========================================================================
   Mudakkir — Unified Single-File Application Logic
   ========================================================================== */

// 1. DATA CONSTANTS & METADATA (Updated to exact page ranges & Para names)
const STANDARD_PARA_PAGES = {
  1: { start: 1, end: 22, name: "Alif Laam Meem" },
  2: { start: 23, end: 42, name: "Sayaqool" },
  3: { start: 43, end: 62, name: "Tilka ar-Rusul" },
  4: { start: 63, end: 82, name: "Lan Tanaalu" },
  5: { start: 83, end: 102, name: "Wal-Muhsanat" },
  6: { start: 103, end: 122, name: "La Yuhibbullah" },
  7: { start: 123, end: 142, name: "Wa Iza Sami'u" },
  8: { start: 143, end: 162, name: "Wa Lau Annana" },
  9: { start: 163, end: 182, name: "Qalal Mala'u" },
  10: { start: 183, end: 202, name: "Wa'lamu" },
  11: { start: 203, end: 222, name: "Ya'tazirun" },
  12: { start: 223, end: 242, name: "Wa Ma Min Daabbah" },
  13: { start: 243, end: 262, name: "Wa Ma Ubarri'u" },
  14: { start: 263, end: 282, name: "Rubama" },
  15: { start: 283, end: 302, name: "Subhanalladhi" },
  16: { start: 303, end: 322, name: "Qala Alam" },
  17: { start: 323, end: 342, name: "Iqtaraba" },
  18: { start: 343, end: 362, name: "Qad Aflaha" },
  19: { start: 363, end: 382, name: "Wa Qalalladhina" },
  20: { start: 383, end: 402, name: "Amman Khalaq" },
  21: { start: 403, end: 422, name: "Utlu Ma Uhiya" },
  22: { start: 423, end: 442, name: "Wa Man Yaqnut" },
  23: { start: 443, end: 462, name: "Wa Ma Liya" },
  24: { start: 463, end: 482, name: "Faman Azlam" },
  25: { start: 483, end: 502, name: "Ilayhi Yuraddu" },
  26: { start: 503, end: 522, name: "Ha Meem" },
  27: { start: 523, end: 542, name: "Qala Fama Khatbukum" },
  28: { start: 543, end: 562, name: "Qad Sami' Allah" },
  29: { start: 563, end: 586, name: "Tabarakalladhi" },
  30: { start: 587, end: 611, name: "Amma" }
};

const JUZ_SURAHS = {
  1: "Al-Fatiha (1) - Al-Baqarah (2:141)",
  2: "Al-Baqarah (2:142) - Al-Baqarah (2:252)",
  3: "Al-Baqarah (2:253) - Ali 'Imran (3:92)",
  4: "Ali 'Imran (3:93) - An-Nisa (4:23)",
  5: "An-Nisa (4:24) - An-Nisa (4:147)",
  6: "An-Nisa (4:148) - Al-Ma'idah (5:81)",
  7: "Al-Ma'idah (5:82) - Al-An'am (6:110)",
  8: "Al-An'am (6:111) - Al-A'raf (7:87)",
  9: "Al-A'raf (7:88) - Al-Anfal (8:40)",
  10: "Al-Anfal (8:41) - At-Tawbah (9:92)",
  11: "At-Tawbah (9:93) - Hud (11:5)",
  12: "Hud (11:6) - Yusuf (12:52)",
  13: "Yusuf (12:53) - Ibrahim (14:52)",
  14: "Al-Hijr (15:1) - An-Nahl (16:128)",
  15: "Al-Isra (17:1) - Al-Kahf (18:74)",
  16: "Al-Kahf (18:75) - Ta-Ha (20:135)",
  17: "Al-Anbiya (21:1) - Al-Hajj (22:78)",
  18: "Al-Mu'minun (23:1) - Al-Furqan (25:20)",
  19: "Al-Furqan (25:21) - An-Naml (27:55)",
  20: "An-Naml (27:56) - Al-Ankabut (29:45)",
  21: "Al-Ankabut (29:46) - Al-Ahzab (33:30)",
  22: "Al-Ahzab (33:31) - Ya-Sin (36:27)",
  23: "Ya-Sin (36:28) - Az-Zumar (39:31)",
  24: "Az-Zumar (39:32) - Fussilat (41:46)",
  25: "Fussilat (41:47) - Al-Jathiyah (45:37)",
  26: "Al-Ahqaf (46:1) - Adh-Dhariyat (51:30)",
  27: "Adh-Dhariyat (51:31) - Al-Hadid (57:29)",
  28: "Al-Mujadilah (58:1) - At-Tahrim (66:12)",
  29: "Al-Mulk (67:1) - Al-Mursalat (77:50)",
  30: "An-Naba (78:1) - An-Nas (114:6)"
};

const DEFAULT_SETTINGS = {
  name: "User",
  mushafPages: 611,
  linesPerPage: 15,
  weeklyRestDay: "Sunday",
  theme: "light",
  systemDateOverride: null
};

// 2. LOCAL DATABASE MANAGER
class StateManager {
  constructor() {
    this.storageKey = "mudakkir_state";
    this.state = this.load();
  }

  load() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        if (!parsed.version || parsed.version < 3) {
          console.log("Upgrading state to September 2026 (v3)...");
          const freshState = this.createInitialState();
          this.save(freshState);
          return freshState;
        }
        if (parsed.completedPages) {
          parsed.completedPages = Array.from(new Set(parsed.completedPages));
        }
        return parsed;
      }
    } catch (e) {
      console.error("localStorage load error:", e);
    }
    const freshState = this.createInitialState();
    this.save(freshState);
    return freshState;
  }

  save(customState = null) {
    const stateToSave = customState || this.state;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(stateToSave));
    } catch (e) {
      console.error("localStorage save error:", e);
    }
  }

  getState() {
    return this.state;
  }

  createInitialState() {
    const monthlyGoals = [];
    const sequence = [
      { m: 8, y: 2026, para: 1 },
      { m: 9, y: 2026, para: 2 },
      { m: 10, y: 2026, para: 29 },
      { m: 11, y: 2026, para: 4 }
    ];
    
    const remainingParas = [
      3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28
    ];

    let currentMonth = 12;
    let currentYear = 2026;
    for (const para of remainingParas) {
      sequence.push({ m: currentMonth, y: currentYear, para });
      currentMonth++;
      if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
      }
    }

    sequence.forEach((item, index) => {
      const calendarDays = new Date(item.y, item.m, 0).getDate();
      
      let sundays = 0;
      for (let d = 1; d <= calendarDays; d++) {
        if (new Date(item.y, item.m - 1, d).getDay() === 0) sundays++;
      }
      const hifzDays = calendarDays - sundays;
      const id = `${item.y}-${String(item.m).padStart(2, '0')}`;

      const standard = STANDARD_PARA_PAGES[item.para];
      
      let status = "future";
      let completionDate = null;
      if (id === "2026-09") {
        status = "active";
      } else if (id < "2026-09") {
        status = "completed";
        completionDate = "2026-08-31";
      }

      monthlyGoals.push({
        id,
        month: item.m,
        year: item.y,
        para: item.para,
        startPage: standard.start,
        endPage: standard.end,
        targetPages: standard.end - standard.start + 1,
        calendarDays,
        sundays,
        hifzDays,
        status,
        completionDate
      });
    });

    // Seed Completed pages:
    // A. Para 1 completed (pages 1 to 22)
    const completedPages = [];
    for (let p = 1; p <= 22; p++) {
      completedPages.push(p);
    }

    // B. Para 2: 2 pages done on Sep 1 and Sep 2 (pages 23, 24, 25, 26)
    for (let p = 23; p <= 26; p++) {
      completedPages.push(p);
    }

    // C. Para 29 completed 5 pages (563, 564, 565, 566, 567)
    for (let p = 563; p <= 567; p++) {
      completedPages.push(p);
    }

    // D. Para 30 completed pages 587 to end (611)
    for (let p = 587; p <= 611; p++) {
      completedPages.push(p);
    }

    const augGoal = monthlyGoals.find(g => g.id === "2026-08");
    if (augGoal) {
      augGoal.startPage = 1;
      augGoal.endPage = 22;
      augGoal.targetPages = 22;
      augGoal.status = "completed";
      augGoal.completionDate = "2026-08-31";
    }

    const sepGoal = monthlyGoals.find(g => g.id === "2026-09");
    if (sepGoal) {
      sepGoal.startPage = 23;
      sepGoal.endPage = 42;
      sepGoal.targetPages = 20;
      sepGoal.status = "active";
    }

    const dailyRecords = {
      "2026-09-01": {
        date: "2026-09-01",
        monthlyGoalId: "2026-09",
        sabaq: "Para 2 · Pages 23–24",
        sabaqCompleted: true,
        sabaqConfidence: "okay",
        sabqi: "Para 1 · Pages 1–22",
        sabqiCompleted: true,
        sabqiConfidence: "okay",
        manzil: "Para 30",
        manzilCompleted: true,
        sessionQuality: 5,
        notes: "Started Para 2 (Sayaqool). Memorized 2 pages.",
        missed: false,
        missedReason: null,
        isSunday: false,
        isBufferDay: false
      },
      "2026-09-02": {
        date: "2026-09-02",
        monthlyGoalId: "2026-09",
        sabaq: "Para 2 · Pages 25–26",
        sabaqCompleted: true,
        sabaqConfidence: "okay",
        sabqi: "Para 2 · Pages 23–24",
        sabqiCompleted: true,
        sabqiConfidence: "okay",
        manzil: "Para 1",
        manzilCompleted: true,
        sessionQuality: 5,
        notes: "Completed 2 pages of Para 2.",
        missed: false,
        missedReason: null,
        isSunday: false,
        isBufferDay: false
      }
    };

    const weakSpots = [
      { id: "ws-1", date: "2026-09-01", page: 24, para: 2, task: "sabaq", note: "Review verse transitions.", resolved: false }
    ];

    return {
      version: 3,
      settings: { ...DEFAULT_SETTINGS },
      monthlyGoals,
      dailyRecords,
      completedPages: Array.from(new Set(completedPages)),
      weakSpots,
      streakData: {
        currentStreak: 2,
        longestStreak: 2,
        freezesRemaining: 2,
        freezeHistory: []
      }
    };
  }

  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.save();
  }

  updateMonthlyGoal(goalId, updatedFields) {
    const goalIndex = this.state.monthlyGoals.findIndex(g => g.id === goalId);
    if (goalIndex !== -1) {
      this.state.monthlyGoals[goalIndex] = {
        ...this.state.monthlyGoals[goalIndex],
        ...updatedFields
      };
      this.save();
    }
  }

  getDailyRecord(dateStr) {
    return this.state.dailyRecords[dateStr] || null;
  }

  saveDailyRecord(dateStr, record) {
    this.state.dailyRecords[dateStr] = { ...record };
    
    if (record.sabaqCompleted && record.sabaq) {
      const pageNums = [...record.sabaq.matchAll(/\d+/g)].map(m => parseInt(m[0], 10));
      pageNums.forEach(pageNum => {
        if (!isNaN(pageNum) && !this.state.completedPages.includes(pageNum)) {
          this.state.completedPages.push(pageNum);
        }
      });
      this.state.completedPages.sort((a, b) => a - b);
    }

    if (record.sabaqCompleted && record.sabaqConfidence === "hard" && record.sabaq) {
      const pageNums = [...record.sabaq.matchAll(/\d+/g)].map(m => parseInt(m[0], 10));
      const goal = this.state.monthlyGoals.find(g => g.id === record.monthlyGoalId);
      const paraNum = goal ? goal.para : 1;
      
      pageNums.forEach(pageNum => {
        const exists = this.state.weakSpots.some(w => w.page === pageNum && !w.resolved);
        if (!exists) {
          this.state.weakSpots.push({
            id: `ws-${Date.now()}-${pageNum}`,
            date: dateStr,
            page: pageNum,
            para: paraNum,
            task: "sabaq",
            note: "Marked hard on daily check-in.",
            resolved: false
          });
        }
      });
    }
    this.save();
  }

  resolveWeakSpot(id) {
    const ws = this.state.weakSpots.find(w => w.id === id);
    if (ws) {
      ws.resolved = true;
      this.save();
    }
  }

  importState(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.settings && parsed.monthlyGoals && parsed.dailyRecords) {
        this.state = parsed;
        this.save();
        return true;
      }
    } catch (e) {
      console.error("Backup parse error:", e);
    }
    return false;
  }

  resetAllData() {
    this.state = this.createInitialState();
    this.save();
  }
}

const db = new StateManager();

// 3. CALCULATION FUNCTIONS
function calculateMonthlyMetrics(goal, completedPages, dailyRecords, currentDateStr) {
  const result = {
    configured: false,
    targetPages: 0,
    completedPagesCount: 0,
    remainingPages: 0,
    percentComplete: 0,
    requiredPace: 0,
    currentPace: 0,
    hifzDaysPassed: 0,
    hifzDaysRemaining: 0,
    hifzDays: 0,
    expectedProgress: 0,
    progressDifference: 0,
    progressBuffer: 0,
    flexibleDays: 0,
    bufferState: 'ON TRACK',
    bufferText: 'You are on track with your required monthly pace.',
    goalComplete: false,
    sundaysRemaining: 0,
    bufferDaysRemaining: 0,
    totalBufferDays: 0
  };

  if (!goal.startPage || !goal.endPage) return result;

  result.configured = true;
  const targetPages = goal.targetPages || (goal.endPage - goal.startPage + 1);
  result.targetPages = targetPages;

  let completedCount = 0;
  for (let p = goal.startPage; p <= goal.endPage; p++) {
    if (completedPages.includes(p)) completedCount++;
  }
  result.completedPagesCount = completedCount;
  result.remainingPages = Math.max(0, targetPages - completedCount);
  result.percentComplete = targetPages > 0 ? (completedCount / targetPages) * 100 : 0;
  
  if (completedCount >= targetPages) {
    result.goalComplete = true;
  }

  const calendarDays = goal.calendarDays;
  const sundays = goal.sundays;
  
  // Calculate dynamic hifzDays total based on start day of tracking (22 for August 2026, 1 for others)
  const startDay = (goal.id === "2026-08") ? 22 : 1;
  let hifzDaysTotal = 0;
  for (let d = startDay; d <= calendarDays; d++) {
    if (new Date(goal.year, goal.month - 1, d).getDay() !== 0) hifzDaysTotal++;
  }
  result.hifzDays = hifzDaysTotal;

  const requiredPace = hifzDaysTotal > 0 ? targetPages / hifzDaysTotal : 0;
  result.requiredPace = requiredPace;

  const [currYear, currMonth, currDay] = currentDateStr.split('-').map(Number);
  
  let hifzDaysRemaining = 0;
  if (currYear === goal.year && currMonth === goal.month) {
    // Loop from today (inclusive) to the end of the month
    for (let d = currDay; d <= calendarDays; d++) {
      if (new Date(goal.year, goal.month - 1, d).getDay() !== 0) {
        hifzDaysRemaining++;
      }
    }
  } else if (currYear < goal.year || (currYear === goal.year && currMonth < goal.month)) {
    hifzDaysRemaining = hifzDaysTotal;
  } else {
    hifzDaysRemaining = 0;
  }
  result.hifzDaysRemaining = hifzDaysRemaining;

  const hifzDaysPassed = Math.max(0, hifzDaysTotal - hifzDaysRemaining);
  result.hifzDaysPassed = hifzDaysPassed;

  const expectedProgress = requiredPace * hifzDaysPassed;
  result.expectedProgress = expectedProgress;

  const progressDifference = completedCount - expectedProgress;
  result.progressDifference = progressDifference;

  const progressBuffer = requiredPace > 0 ? progressDifference / requiredPace : 0;
  result.progressBuffer = parseFloat(progressBuffer.toFixed(2));

  result.flexibleDays = Math.max(0, hifzDaysTotal - targetPages);

  // A. Sundays remaining in this month
  let sundaysRemaining = 0;
  if (currYear === goal.year && currMonth === goal.month) {
    for (let d = currDay + 1; d <= calendarDays; d++) {
      if (new Date(goal.year, goal.month - 1, d).getDay() === 0) sundaysRemaining++;
    }
  } else if (currYear < goal.year || (currYear === goal.year && currMonth < goal.month)) {
    sundaysRemaining = sundays;
  }
  result.sundaysRemaining = sundaysRemaining;

  // B. Buffer/Skip Days remaining in this month (Hifz Days Left - Pages Left)
  const totalBufferDays = Math.max(0, hifzDaysTotal - targetPages);
  result.totalBufferDays = totalBufferDays;
  result.bufferDaysRemaining = result.hifzDaysRemaining - result.remainingPages;

  if (result.goalComplete) {
    result.bufferState = 'AHEAD';
    result.bufferText = `🎉 MONTHLY GOAL COMPLETE! ${result.flexibleDays} flexible days remaining.`;
  } else if (result.progressBuffer > 0.3) {
    result.bufferState = 'AHEAD';
    result.bufferText = `🟢 ${Math.abs(result.progressBuffer).toFixed(1)} DAYS AHEAD. You're ahead of your required monthly pace.`;
  } else if (result.progressBuffer < -0.3) {
    result.bufferState = 'BEHIND';
    result.bufferText = `🔴 ${Math.abs(result.progressBuffer).toFixed(1)} DAYS BEHIND. You're behind. Remaining pages require a higher pace.`;
  } else {
    result.bufferState = 'ON TRACK';
    result.bufferText = `🟢 ON TRACK. You are right at your expected monthly pace.`;
  }

  result.currentPace = hifzDaysPassed > 0 ? completedCount / hifzDaysPassed : 0;
  return result;
}

function getDayStatus(dateStr, goal, record, isGoalCompleted) {
  const dateObj = new Date(dateStr);
  const isSunday = dateObj.getDay() === 0;

  if (isSunday) {
    return { status: 'sunday', color: 'var(--color-sunday)', label: 'Sunday / OFF' };
  }

  if (isGoalCompleted) {
    if (record && record.sabaqCompleted && record.sabqiCompleted && record.manzilCompleted) {
      return { status: 'complete', color: 'var(--color-complete)', label: 'Complete' };
    }
    if (record && record.missed) {
      return { status: 'missed', color: 'var(--color-missed)', label: 'Missed' };
    }
    return { status: 'buffer', color: 'var(--color-buffer)', label: 'Buffer / Revision' };
  }

  if (!record) {
    return { status: 'none', color: 'transparent', label: 'No Record' };
  }

  if (record.missed) {
    if (record.missedReason === 'break') {
      return { status: 'partial', color: 'var(--color-partial)', label: 'Skip / Break Day' };
    }
    return { status: 'missed', color: 'var(--color-missed)', label: `Missed (${record.missedReason})` };
  }

  const sabaqDone = record.sabaqCompleted || record.sabaqSkipped;
  const allCompleted = sabaqDone && record.sabqiCompleted && record.manzilCompleted;
  const someCompleted = sabaqDone || record.sabqiCompleted || record.manzilCompleted;

  if (allCompleted) {
    return { status: 'complete', color: 'var(--color-complete)', label: 'Complete' };
  } else if (someCompleted) {
    return { status: 'partial', color: 'var(--color-partial)', label: 'Partial' };
  }

  return { status: 'none', color: 'transparent', label: 'Not Checked In' };
}

function recalculateStreaks(dailyRecords, streakData) {
  const dates = Object.keys(dailyRecords).sort();
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: streakData.longestStreak || 0 };
  }

  let current = 0;
  let maxStreak = streakData.longestStreak || 0;
  const todayStr = new Date().toISOString().split('T')[0];

  dates.forEach(date => {
    const rec = dailyRecords[date];
    if (rec.isSunday || rec.isBufferDay || (rec.missed && rec.missedReason === 'break')) return;

    const sabaqDone = rec.sabaqCompleted || rec.sabaqSkipped;
    const completed = sabaqDone && rec.sabqiCompleted && rec.manzilCompleted;
    if (completed) {
      current++;
      if (current > maxStreak) maxStreak = current;
    } else {
      const isFrozen = streakData.freezeHistory && streakData.freezeHistory.includes(date);
      if (!isFrozen && date !== todayStr) {
        current = 0;
      }
    }
  });

  return { currentStreak: current, longestStreak: maxStreak };
}

function generateGraphData(goal, metrics, dailyRecords) {
  const points = { planned: [], actual: [] };
  if (!goal.startPage || !goal.endPage) return points;

  const calendarDays = goal.calendarDays;
  const targetPages = metrics.targetPages;
  const requiredPace = metrics.requiredPace;

  // Calculate startingCompletedCount (e.g. 8 pages completed before we started tracking in-app)
  const goalCompletedPages = db.getState().completedPages.filter(p => p >= goal.startPage && p <= goal.endPage);
  let recordsCompletedCount = 0;
  Object.keys(dailyRecords).forEach(dateStr => {
    if (dateStr.startsWith(`${goal.year}-${String(goal.month).padStart(2, '0')}`)) {
      const rec = dailyRecords[dateStr];
      if (rec && rec.sabaqCompleted && rec.sabaq) {
        const pageNums = [...rec.sabaq.matchAll(/\d+/g)].map(m => parseInt(m[0], 10));
        pageNums.forEach(pageNum => {
          if (pageNum >= goal.startPage && pageNum <= goal.endPage) {
            recordsCompletedCount++;
          }
        });
      }
    }
  });
  const startingCompletedCount = Math.max(0, goalCompletedPages.length - recordsCompletedCount);

  // A. Plot Planned Target Line
  if (goal.id === "2026-08") {
    // For August 2026, start planned line from day 22 at startingCompletedCount (8)
    points.planned.push({ x: 22, y: startingCompletedCount });
    
    // Remaining pages = targetPages - startingCompletedCount (14)
    const remainingPages = Math.max(0, targetPages - startingCompletedCount);
    // Hifz days remaining = Hifz days from day 22 to 31 (8 active days)
    const hifzDaysRemaining = metrics.hifzDaysRemaining;
    const remainingRequiredPace = hifzDaysRemaining > 0 ? remainingPages / hifzDaysRemaining : 0;
    
    let currentPlannedPages = startingCompletedCount;
    for (let d = 23; d <= calendarDays; d++) {
      if (new Date(goal.year, goal.month - 1, d).getDay() !== 0) {
        currentPlannedPages += remainingRequiredPace;
      }
      points.planned.push({ x: d, y: parseFloat(currentPlannedPages.toFixed(2)) });
    }
  } else {
    // For other months, start at day 0
    points.planned.push({ x: 0, y: 0 });
    let currentPlannedPages = 0;
    for (let d = 1; d <= calendarDays; d++) {
      if (new Date(goal.year, goal.month - 1, d).getDay() !== 0) {
        currentPlannedPages += requiredPace;
      }
      points.planned.push({ x: d, y: parseFloat(currentPlannedPages.toFixed(2)) });
    }
  }

  // B. Plot Actual Line
  const state = db.getState();
  const todayStr = state.settings.systemDateOverride || new Date().toISOString().split('T')[0];
  const [currYear, currMonth, currDay] = todayStr.split('-').map(Number);

  let limitDay = calendarDays;
  if (currYear === goal.year && currMonth === goal.month) {
    limitDay = currDay;
  } else if (currYear < goal.year || (currYear === goal.year && currMonth < goal.month)) {
    limitDay = 0;
  }

  let cumulativeActual = startingCompletedCount;
  for (let d = 1; d <= calendarDays; d++) {
    const dateStr = `${goal.year}-${String(goal.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const rec = dailyRecords[dateStr];
    
    if (rec && rec.sabaqCompleted && rec.sabaq) {
      const pageNums = [...rec.sabaq.matchAll(/\d+/g)].map(m => parseInt(m[0], 10));
      pageNums.forEach(pageNum => {
        if (pageNum >= goal.startPage && pageNum <= goal.endPage) {
          cumulativeActual++;
        }
      });
    }
    
    if (d <= limitDay) {
      if (goal.id === "2026-08") {
        if (d >= 22) {
          points.actual.push({ x: d, y: cumulativeActual });
        }
      } else {
        if (rec || d === limitDay) {
          points.actual.push({ x: d, y: cumulativeActual });
        }
      }
    }
  }

  return points;
}

// Helper: Get Month Name
function getMonthName(m) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[m - 1];
}

// Helper: Calculate completed Juz
function calculateJuzCompletedCount(completedPages) {
  let count = 0;
  for (let j = 1; j <= 30; j++) {
    const range = STANDARD_PARA_PAGES[j];
    let allCompleted = true;
    for (let p = range.start; p <= range.end; p++) {
      if (!completedPages.includes(p)) {
        allCompleted = false;
        break;
      }
    }
    if (allCompleted) count++;
  }
  return count;
}

// Toast Notifications
function showToast(message, type = "success") {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerText = message;
  container.appendChild(el);

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    el.style.transition = 'all 0.5s ease';
    setTimeout(() => el.remove(), 500);
  }, 3000);
}

// 4. RENDERING PAGES
// A. DASHBOARD VIEW
function renderDashboard(container) {
  const state = db.getState();
  const todayStr = state.settings.systemDateOverride || new Date().toISOString().split('T')[0];
  const [year, month, day] = todayStr.split('-').map(Number);
  
  const currentCount = state.completedPages.length;
  if (window.lastCompletedPagesCount === undefined) {
    window.lastCompletedPagesCount = currentCount;
  }
  const prevCount = window.lastCompletedPagesCount;
  window.lastCompletedPagesCount = currentCount;

  const prevPercent = (prevCount / 611) * 100;
  const currentPercent = (currentCount / 611) * 100;
  const circumference = 263.89;
  const initialOffset = circumference - (circumference * prevPercent / 100);
  
  const goalId = `${year}-${String(month).padStart(2, '0')}`;
  let activeGoal = state.monthlyGoals.find(g => g.id === goalId);
  
  if (!activeGoal) {
    activeGoal = {
      id: goalId, month, year, para: 1, startPage: null, endPage: null, targetPages: null,
      calendarDays: new Date(year, month, 0).getDate(), sundays: 4, hifzDays: 26, status: "active", completionDate: null
    };
    state.monthlyGoals.push(activeGoal);
    db.save();
  }

  const metrics = calculateMonthlyMetrics(activeGoal, state.completedPages, state.dailyRecords, todayStr);
  const isSunday = new Date(todayStr).getDay() === 0;

  let todayRecord = state.dailyRecords[todayStr];
  if (!todayRecord) {
    todayRecord = {
      date: todayStr, monthlyGoalId: goalId, sabaq: "", sabqi: "", manzil: "",
      sabaqCompleted: false, sabqiCompleted: false, manzilCompleted: false,
      sabaqConfidence: null, sabqiConfidence: null, notes: "", sessionQuality: 0,
      missed: false, missedReason: null, isSunday, isBufferDay: metrics.goalComplete
    };
  }

  let todaySabaqText = "Unconfigured";
  if (metrics.configured) {
    if (metrics.goalComplete) {
      todaySabaqText = "Para Complete! 🎉";
    } else {
      if ((todayRecord.sabaqCompleted || todayRecord.sabaqSkipped) && todayRecord.sabaq) {
        todaySabaqText = todayRecord.sabaq;
      } else {
        let nextSabaqPage = activeGoal.startPage;
        while (nextSabaqPage <= activeGoal.endPage && state.completedPages.includes(nextSabaqPage)) {
          nextSabaqPage++;
        }
        if (nextSabaqPage <= activeGoal.endPage) {
          todaySabaqText = `Para ${activeGoal.para} · Page ${nextSabaqPage}`;
          todayRecord.sabaq = todaySabaqText;
        } else {
          todaySabaqText = "Para Complete! 🎉";
        }
      }
    }
  }

  let todaySabqiText = "Unconfigured";
  if (metrics.configured) {
    if (metrics.goalComplete) {
      todaySabqiText = "Revision Mode";
    } else {
      if (todayRecord.sabqiCompleted && todayRecord.sabqi) {
        todaySabqiText = todayRecord.sabqi;
      } else {
        let nextSabaqPage = activeGoal.startPage;
        while (nextSabaqPage <= activeGoal.endPage && state.completedPages.includes(nextSabaqPage)) {
          nextSabaqPage++;
        }
        const lastCompletedPage = nextSabaqPage - 1;
        if (lastCompletedPage >= activeGoal.startPage) {
          todaySabqiText = `Pages ${activeGoal.startPage}–${lastCompletedPage}`;
        } else {
          todaySabqiText = "No recent pages yet";
        }
        todayRecord.sabqi = todaySabqiText;
      }
    }
  }

  let todayManzilText = "Para 30";
  if (todayRecord.manzilCompleted && todayRecord.manzil) {
    todayManzilText = todayRecord.manzil;
  } else {
    const completedParas = [30];
    state.monthlyGoals.forEach(g => {
      if (g.status === "completed" && !completedParas.includes(g.para)) {
        completedParas.push(g.para);
      }
    });
    completedParas.sort((a, b) => a - b);
    const rotationIndex = day % completedParas.length;
    todayManzilText = `Para ${completedParas[rotationIndex]}`;
    todayRecord.manzil = todayManzilText;
  }

  if (!state.dailyRecords[todayStr]) {
    state.dailyRecords[todayStr] = todayRecord;
    db.save();
  }

  let bodyHtml = "";
  if (!metrics.configured) {
    bodyHtml = `
      <div class="card text-center" style="padding: 40px 24px;">
        <h2 style="color: var(--primary-color);">Active Goal: Para ${activeGoal.para} (${STANDARD_PARA_PAGES[activeGoal.para].name})</h2>
        <p style="color: var(--text-muted); margin-bottom: 24px; font-size: 1.1rem;">Page range not configured for this month's target.</p>
        <button id="dashboard-set-range-btn" class="btn btn-primary" data-goal-id="${activeGoal.id}">Set Page Range</button>
      </div>
    `;
  } else {
    const percentStr = metrics.percentComplete.toFixed(0);
    const paceClass = metrics.bufferState.toLowerCase();

    bodyHtml = `
      <div class="dashboard-container">
        <div class="dashboard-main-col">
          <div class="card monthly-goal-card pattern-bg">
            <div class="goal-header">
              <span class="goal-month-title">${getMonthName(activeGoal.month)} ${activeGoal.year}</span>
              <h2 class="goal-para-title">Para ${activeGoal.para} <span style="font-size: 1.25rem; font-weight: 500; opacity: 0.85;">(${STANDARD_PARA_PAGES[activeGoal.para].name})</span></h2>
            </div>
            <div class="progress-container">
              <div class="progress-bar-wrapper">
                <div class="progress-bar-fill" style="width: ${percentStr}%"></div>
              </div>
              <div class="progress-label-row">
                <span>Progress: <strong style="font-family: var(--font-brand);">${metrics.completedPagesCount} / ${metrics.targetPages} pages</strong></span>
                <span class="progress-percent">${percentStr}% Complete</span>
              </div>
            </div>
            <div class="buffer-status-banner ${paceClass}">
              <div class="buffer-indicator">${metrics.bufferState}</div>
              <div class="buffer-explanation">${metrics.bufferText}</div>
            </div>
            
            <div class="dashboard-grid">
              <div class="metric-tile">
                <div class="metric-label">Target</div>
                <div class="metric-val">${metrics.targetPages} p.</div>
              </div>
              <div class="metric-tile">
                <div class="metric-label">Remaining</div>
                <div class="metric-val">${metrics.remainingPages} p.</div>
              </div>
              <div class="metric-tile">
                <div class="metric-label">Required Pace</div>
                <div class="metric-val">${metrics.requiredPace.toFixed(2)} p/d</div>
              </div>
              <div class="metric-tile">
                <div class="metric-label">Hifz Days Left</div>
                <div class="metric-val">${metrics.hifzDaysRemaining} / ${metrics.hifzDays}</div>
              </div>
              <div class="metric-tile">
                <div class="metric-label">Buffer Left</div>
                <div class="metric-val" style="color: ${metrics.bufferDaysRemaining >= 0 ? 'var(--secondary-color)' : 'var(--color-missed)'}">${metrics.bufferDaysRemaining} d.</div>
              </div>
              <div class="metric-tile">
                <div class="metric-label">Sundays Left</div>
                <div class="metric-val">${metrics.sundaysRemaining} d.</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="section-title">
              <span>Today's Tasks</span>
              <button id="read-protocol-btn" class="section-subtitle-btn">Sabaq Protocol</button>
            </div>
            <div class="tasks-list">
              <div class="card task-card task-sabaq ${todayRecord.sabaqCompleted ? 'completed' : (todayRecord.sabaqSkipped ? 'partial' : '')}" style="${todayRecord.sabaqSkipped ? 'border-color: var(--color-partial); background-color: rgba(240, 173, 78, 0.05);' : ''} display: flex; flex-direction: column; align-items: stretch; gap: 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <div class="task-meta">
                    <div class="task-badge-row">
                      <span class="task-tag task-tag-sabaq">Sabaq</span>
                      ${todayRecord.sabaqCompleted && todayRecord.sabaqConfidence ? `<span class="badge badge-active">${todayRecord.sabaqConfidence}</span>` : ''}
                      ${todayRecord.sabaqSkipped ? `<span class="badge badge-partial" style="background-color: var(--color-partial); color: #fff;">Skipped</span>` : ''}
                    </div>
                    <div class="task-ref-val">${todaySabaqText}</div>
                    <div class="task-desc">New memorization target</div>
                  </div>
                  <div class="task-action">
                    ${todayRecord.sabaqCompleted 
                      ? `<div class="task-completed-pill" data-task="sabaq">✓ Done</div>` 
                      : todayRecord.sabaqSkipped
                        ? `<div class="flex flex-column align-center gap-1">
                             <div class="task-skipped-pill" style="background-color: rgba(240, 173, 78, 0.1); color: var(--color-partial); border: 1px solid var(--color-partial); padding: 4px 10px; border-radius: 20px; font-weight: 600; font-size: 0.8rem; line-height: 1.2;">⚠ Skipped</div>
                             <button class="btn btn-text btn-xs undo-sabaq-skip-btn" style="font-size: 0.7rem; padding: 2px; color: var(--text-muted);">Undo</button>
                           </div>`
                        : `<div class="flex gap-2">
                             <button class="btn btn-secondary btn-xs checkin-btn" data-task="sabaq">Complete</button>
                             <button class="btn btn-outline btn-xs skip-sabaq-task-btn" style="border-color: var(--color-partial); color: var(--color-partial); padding: 4px 8px;">Skip</button>
                           </div>`
                    }
                  </div>
                </div>
                ${(() => {
                  if (todayRecord.sabaqCompleted) {
                    let nextSabaqPage = activeGoal.startPage;
                    while (nextSabaqPage <= activeGoal.endPage && state.completedPages.includes(nextSabaqPage)) {
                      nextSabaqPage++;
                    }
                    if (nextSabaqPage <= activeGoal.endPage) {
                      return `
                        <div style="margin-top: 12px; border-top: 1px dashed var(--border-color); padding-top: 8px; font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center; width: 100%;">
                          <span style="color: var(--text-muted);">Log additional page? <strong>Page ${nextSabaqPage}</strong></span>
                          <button class="btn btn-outline btn-xs checkin-btn" data-task="sabaq" style="font-size: 0.7rem; padding: 2px 6px;">+ Log Page ${nextSabaqPage}</button>
                        </div>
                      `;
                    }
                  }
                  return '';
                })()}
              </div>

              <div class="card task-card task-sabqi ${todayRecord.sabqiCompleted ? 'completed' : ''}">
                <div class="task-meta">
                  <div class="task-badge-row">
                    <span class="task-tag task-tag-sabqi">Sabqi</span>
                    ${todayRecord.sabqiCompleted && todayRecord.sabqiConfidence ? `<span class="badge badge-active">${todayRecord.sabqiConfidence}</span>` : ''}
                  </div>
                  <div class="task-ref-val">${todayRecord.sabqi || todaySabqiText}</div>
                  <div class="task-desc">Recent memorization revision</div>
                </div>
                <div class="task-action">
                  ${todayRecord.sabqiCompleted 
                    ? `<div class="task-completed-pill" data-task="sabqi">✓ Done</div>` 
                    : `<button class="btn btn-secondary btn-xs checkin-btn" data-task="sabqi">Complete</button>`
                  }
                </div>
              </div>

              <div class="card task-card task-manzil ${todayRecord.manzilCompleted ? 'completed' : ''}">
                <div class="task-meta">
                  <div class="task-badge-row">
                    <span class="task-tag task-tag-manzil">Manzil</span>
                  </div>
                  <div class="task-ref-val">${todayRecord.manzil || todayManzilText}</div>
                  <div class="task-desc">Older memorization revision</div>
                </div>
                <div class="task-action">
                  ${todayRecord.manzilCompleted 
                    ? `<div class="task-completed-pill" data-task="manzil">✓ Done</div>` 
                    : `<button class="btn btn-secondary btn-xs checkin-btn" data-task="manzil">Complete</button>`
                  }
                </div>
              </div>
            </div>

            ${isSunday ? `<div class="day-banner day-banner-sunday">⚪ Rest Day: Sunday is your official Hifz rest day.</div>` : ''}
            ${metrics.goalComplete ? `<div class="day-banner day-banner-buffer">🔵 Buffer Day: Monthly target complete! Use today for revision.</div>` : ''}
            
            ${!isSunday && !metrics.goalComplete && !todayRecord.sabaqCompleted && !todayRecord.sabqiCompleted && !todayRecord.manzilCompleted && !todayRecord.missed
              ? `<div class="day-controls-row"><button id="mark-day-missed-btn" class="btn btn-text btn-xs" style="color: var(--color-missed);">Mark Day Missed / Break</button></div>`
              : ''
            }

            ${todayRecord.missed
              ? `<div class="day-banner ${todayRecord.missedReason === 'break' ? 'day-banner-sunday' : 'day-banner-missed'}">
                  <span>${todayRecord.missedReason === 'break' ? '🟡 Skip / Break Day' : '🔴 Missed'}: ${todayRecord.missedReason === 'break' ? 'Scheduled break' : todayRecord.missedReason.toUpperCase()}</span>
                  <button id="undo-missed-btn" class="btn btn-outline btn-xs" style="${todayRecord.missedReason === 'break' ? '' : 'border-color: var(--color-missed); color: var(--color-missed);'}">Undo</button>
                 </div>`
              : ''
            }
          </div>
        </div>

        <div class="dashboard-side-col">
          <div class="card">
            <h3 style="font-size: 1rem; color: var(--text-main); font-weight: 600; margin-bottom: 12px;">${getMonthName(activeGoal.month)} Calendar</h3>
            <div class="calendar-grid" id="dashboard-calendar-grid"></div>
          </div>

          <div class="card">
            <h3 style="font-size: 1rem; color: var(--text-main); font-weight: 600; margin-bottom: 12px;">Planned vs. Actual Progress</h3>
            <div class="graph-container">
              <svg class="graph-svg" id="dashboard-svg-graph"></svg>
            </div>
            <div class="flex justify-between" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 8px;">
              <span class="flex align-center gap-2"><span style="width: 8px; height: 8px; border: 1px dashed var(--border-color); display: inline-block;"></span> Target Pace</span>
              <span class="flex align-center gap-2"><span style="width: 8px; height: 8px; display: inline-block; background-color: var(--secondary-color);"></span> Actual Memorized</span>
            </div>
          </div>

          <div class="card pattern-bg">
            <h3 style="font-size: 1rem; color: var(--text-main); font-weight: 600; margin-bottom: 16px;">Overall Hifz Progress</h3>
            <div class="flex align-center gap-4" style="margin-bottom: 16px;">
              <!-- Circle Progress Indicator -->
              <div style="flex-shrink: 0; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; position: relative;">
                <svg viewBox="0 0 100 100" width="80" height="80">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-color)" stroke-width="8"/>
                  <circle id="overall-circle-fill" cx="50" cy="50" r="42" fill="none" stroke="var(--secondary-color)" stroke-width="8"
                          stroke-dasharray="263.89" stroke-dashoffset="${initialOffset}" stroke-linecap="round"
                          style="transition: stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1); transform: rotate(-90deg); transform-origin: 50% 50%;"/>
                </svg>
                <div id="overall-circle-text" style="position: absolute; font-family: var(--font-brand); font-size: 1rem; font-weight: 700; color: var(--text-main);">
                  ${prevPercent.toFixed(0)}%
                </div>
              </div>
              
              <!-- Metrics Info -->
              <div style="flex-grow: 1;">
                <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Completion Rate</div>
                <div id="overall-percent-text" style="font-family: var(--font-brand); font-size: 1.8rem; font-weight: 800; color: var(--secondary-color);">
                  ${prevPercent.toFixed(1)}%
                </div>
              </div>
            </div>
            
            <!-- Horizontal Progress Bar -->
            <div class="progress-bar-wrapper" style="height: 10px; border-radius: 5px; background-color: var(--border-color); overflow: hidden; margin-bottom: 12px;">
              <div id="overall-bar-fill" class="progress-bar-fill" style="width: ${prevPercent.toFixed(1)}%; height: 100%; background-color: var(--secondary-color); transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 5px;"></div>
            </div>
            
            <div class="flex align-center justify-between" style="font-size: 0.85rem; color: var(--text-muted);">
              <span id="overall-page-count" style="font-weight: 600; font-family: var(--font-brand);">${prevCount} / 611 pages completed</span>
              <span style="font-weight: 600;">Juz: ${calculateJuzCompletedCount(state.completedPages)} / 30</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = bodyHtml;

  // Trigger overall progress animations if there is an increase
  if (currentCount > prevCount) {
    setTimeout(() => {
      const bar = document.getElementById('overall-bar-fill');
      const circle = document.getElementById('overall-circle-fill');
      const circleText = document.getElementById('overall-circle-text');
      const percentText = document.getElementById('overall-percent-text');
      const pageCount = document.getElementById('overall-page-count');
      
      if (bar) bar.style.width = `${currentPercent.toFixed(1)}%`;
      if (circle) {
        circle.style.strokeDashoffset = `${circumference - (circumference * currentPercent / 100)}`;
      }
      
      // Count up text values
      const startPercent = prevPercent;
      const targetPercent = currentPercent;
      const duration = 1200; // 1.2 seconds
      const startTime = performance.now();
      
      const animateText = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const val = startPercent + easeProgress * (targetPercent - startPercent);
        
        if (circleText) circleText.innerText = `${val.toFixed(0)}%`;
        if (percentText) percentText.innerText = `${val.toFixed(1)}%`;
        if (pageCount) {
          const pages = Math.round(prevCount + easeProgress * (currentCount - prevCount));
          pageCount.innerText = `${pages} / 611 pages completed`;
        }
        
        if (progress < 1) {
          requestAnimationFrame(animateText);
        } else {
          if (circleText) circleText.innerText = `${targetPercent.toFixed(1)}%`;
          if (percentText) percentText.innerText = `${targetPercent.toFixed(1)}%`;
          if (pageCount) pageCount.innerText = `${currentCount} / 611 pages completed`;
        }
      };
      
      requestAnimationFrame(animateText);
    }, 100);
  } else {
    // If no change, ensure values are updated statically without animation
    setTimeout(() => {
      const bar = document.getElementById('overall-bar-fill');
      const circle = document.getElementById('overall-circle-fill');
      const circleText = document.getElementById('overall-circle-text');
      const percentText = document.getElementById('overall-percent-text');
      const pageCount = document.getElementById('overall-page-count');
      
      if (bar) bar.style.width = `${currentPercent.toFixed(1)}%`;
      if (circle) {
        circle.style.strokeDashoffset = `${circumference - (circumference * currentPercent / 100)}`;
      }
      if (circleText) circleText.innerText = `${currentPercent.toFixed(0)}%`;
      if (percentText) percentText.innerText = `${currentPercent.toFixed(1)}%`;
      if (pageCount) pageCount.innerText = `${currentCount} / 611 pages completed`;
    }, 50);
  }

  // Event handlers
  const setRangeBtn = document.getElementById('dashboard-set-range-btn');
  if (setRangeBtn) setRangeBtn.onclick = () => openPageRangeModal(activeGoal.id);

  const readProtocolBtn = document.getElementById('read-protocol-btn');
  if (readProtocolBtn) readProtocolBtn.onclick = () => document.getElementById('protocol-modal').classList.remove('hidden');

  document.querySelectorAll('.checkin-btn').forEach(btn => {
    btn.onclick = (e) => openCheckinModal(todayStr, e.target.dataset.task);
  });
  document.querySelectorAll('.task-completed-pill').forEach(pill => {
    pill.onclick = (e) => openCheckinModal(todayStr, e.currentTarget.dataset.task);
  });

  document.querySelectorAll('.skip-sabaq-task-btn').forEach(btn => {
    btn.onclick = () => {
      todayRecord.sabaqSkipped = true;
      todayRecord.sabaqCompleted = false;
      db.saveDailyRecord(todayStr, todayRecord);
      updateStreaksDisplay();
      initRouter();
      showToast("Sabaq skipped for today.", "warning");
    };
  });

  document.querySelectorAll('.undo-sabaq-skip-btn').forEach(btn => {
    btn.onclick = () => {
      todayRecord.sabaqSkipped = false;
      db.saveDailyRecord(todayStr, todayRecord);
      updateStreaksDisplay();
      initRouter();
      showToast("Sabaq skip undone.", "success");
    };
  });

  const markMissedBtn = document.getElementById('mark-day-missed-btn');
  if (markMissedBtn) markMissedBtn.onclick = () => openMissedDayModal(todayStr);

  const undoMissedBtn = document.getElementById('undo-missed-btn');
  if (undoMissedBtn) {
    undoMissedBtn.onclick = () => {
      todayRecord.missed = false;
      todayRecord.missedReason = null;
      db.saveDailyRecord(todayStr, todayRecord);
      renderDashboard(container);
      showToast("Day marked active.", "success");
    };
  }

  if (metrics.configured) {
    renderCalendarGrid(activeGoal, state.dailyRecords, todayStr, metrics.goalComplete);
    renderProgressGraph(activeGoal, metrics, state.dailyRecords);
  }
}

function renderCalendarGrid(goal, dailyRecords, activeDateStr, isGoalCompleted) {
  const gridContainer = document.getElementById('dashboard-calendar-grid');
  if (!gridContainer) return;

  gridContainer.innerHTML = "";
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
  dayNames.forEach(n => {
    const el = document.createElement('div');
    el.className = "calendar-day-header";
    el.innerText = n;
    gridContainer.appendChild(el);
  });

  const firstDayIndex = new Date(goal.year, goal.month - 1, 1).getDay();
  const daysInMonth = new Date(goal.year, goal.month, 0).getDate();

  for (let i = 0; i < firstDayIndex; i++) {
    gridContainer.appendChild(document.createElement('div'));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${goal.year}-${String(goal.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const record = dailyRecords[dateKey];
    const statusMeta = getDayStatus(dateKey, goal, record, isGoalCompleted);

    const cell = document.createElement('div');
    cell.className = `calendar-cell ${statusMeta.status === 'sunday' ? 'cell-sunday' : ''} ${dateKey === activeDateStr ? 'active-day' : ''}`;
    cell.innerText = d;

    if (statusMeta.status !== 'none') {
      const dot = document.createElement('span');
      dot.className = `status-dot status-dot-${statusMeta.status}`;
      cell.appendChild(dot);
    }

    cell.onclick = () => openCheckinModal(dateKey, 'sabaq');
    gridContainer.appendChild(cell);
  }
}

function renderProgressGraph(goal, metrics, dailyRecords) {
  const svg = document.getElementById('dashboard-svg-graph');
  if (!svg) return;

  svg.innerHTML = "";
  const width = svg.clientWidth || 300;
  const height = svg.clientHeight || 150;
  const padding = 20;

  const points = generateGraphData(goal, metrics, dailyRecords);
  const calendarDays = goal.calendarDays;
  const targetPages = metrics.targetPages;

  const xScale = (day) => padding + (day / calendarDays) * (width - 2 * padding);
  const yScale = (page) => height - padding - (page / targetPages) * (height - 2 * padding);

  const drawLine = (x1, y1, x2, y2, cls) => {
    const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    l.setAttribute("x1", x1); l.setAttribute("y1", y1);
    l.setAttribute("x2", x2); l.setAttribute("y2", y2);
    l.setAttribute("class", cls);
    svg.appendChild(l);
  };
  drawLine(padding, height - padding, width - padding, height - padding, "graph-axis");
  drawLine(padding, padding, padding, height - padding, "graph-axis");

  const getPathData = (pList) => pList.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`).join(' ');

  if (points.planned.length > 0) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", getPathData(points.planned));
    path.setAttribute("class", "graph-line-expected");
    svg.appendChild(path);
  }

  if (points.actual.length > 1) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", getPathData(points.actual));
    path.setAttribute("class", "graph-line-actual");
    svg.appendChild(path);

    points.actual.forEach(p => {
      if (p.x === 0) return;
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", xScale(p.x));
      c.setAttribute("cy", yScale(p.y));
      c.setAttribute("r", 4);
      c.setAttribute("class", "graph-dot");
      svg.appendChild(c);
    });
  }
}

// B. PLAN VIEW
function renderPlan(container) {
  const state = db.getState();
  const todayStr = state.settings.systemDateOverride || new Date().toISOString().split('T')[0];
  const [currYear, currMonth] = todayStr.split('-').map(Number);
  const currentGoalId = `${currYear}-${String(currMonth).padStart(2, '0')}`;

  const sortedGoals = [...state.monthlyGoals].sort((a, b) => a.id.localeCompare(b.id));
  const pastGoals = [];
  let currentGoal = null;
  const futureGoals = [];

  sortedGoals.forEach(g => {
    if (g.id === currentGoalId) currentGoal = g;
    else if (g.id < currentGoalId) pastGoals.push(g);
    else futureGoals.push(g);
  });

  const totalPagesCompleted = state.completedPages.length;
  const totalPages = state.settings.mushafPages || 611;
  const projection = calculateProjection(state, Math.max(0, totalPages - totalPagesCompleted));

  container.innerHTML = `
    <div class="plan-container">
      <div class="dashboard-main-col">
        <div class="card pattern-bg">
          <h3 style="color: var(--primary-color); margin-bottom: 16px;">Hifz Journey & Projections</h3>
          <div class="dashboard-grid" style="margin-bottom: 20px;">
            <div class="metric-tile">
              <div class="metric-label">Hifz Progress</div>
              <div class="metric-val" style="font-size: 1.4rem;">${totalPagesCompleted} / ${totalPages}</div>
              <div style="font-size: 0.8rem; font-weight: bold; color: var(--secondary-color); margin-top: 4px;">${((totalPagesCompleted/totalPages)*100).toFixed(1)}% Completed</div>
            </div>
            <div class="metric-tile">
              <div class="metric-label">Juz Completed</div>
              <div class="metric-val" style="font-size: 1.4rem;">${projection.juzCompleted} / 30</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Juz 30: Completed</div>
            </div>
          </div>
          <div style="border-top: 1px solid var(--border-color); padding-top: 16px;">
            <div class="buffer-status-banner ${projection.onTrack ? 'ahead' : 'behind'}" style="margin-bottom: 0; padding: 12px 16px;">
              <div>
                <div style="font-weight: 700; margin-bottom: 4px;">PROJECTED COMPLETION: ${projection.projectedDate}</div>
                <div style="font-size: 0.8rem; opacity: 0.95;">${projection.message}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 style="color: var(--text-main); margin-bottom: 16px;">Active Month Control Center</h3>
          ${currentGoal ? renderGoalCardHtml(currentGoal, state.completedPages, state.dailyRecords, todayStr) : ''}
        </div>

        <div class="card">
          <div class="section-title">
            <span>Roadmap History</span>
            <button id="unlock-history-btn" class="section-subtitle-btn">Unlock History Editing</button>
          </div>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left;">
              <thead>
                <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-muted); font-size: 0.8rem;">
                  <th style="padding: 10px 8px;">Month</th>
                  <th style="padding: 10px 8px;">Target</th>
                  <th style="padding: 10px 8px;">Range</th>
                  <th style="padding: 10px 8px;">Completed</th>
                  <th style="padding: 10px 8px;">Status</th>
                  <th style="padding: 10px 8px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${pastGoals.map(g => {
                  const m = calculateMonthlyMetrics(g, state.completedPages, state.dailyRecords, todayStr);
                  return `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                      <td style="padding: 12px 8px; font-weight: 500;">${getMonthName(g.month)} ${g.year}</td>
                      <td style="padding: 12px 8px; font-weight: 600; color: var(--primary-color);">Para ${g.para}</td>
                      <td style="padding: 12px 8px; font-family: var(--font-brand);">${g.startPage ? `${g.startPage}–${g.endPage}` : '—'}</td>
                      <td style="padding: 12px 8px; font-family: var(--font-brand);">${m.completedPagesCount} / ${m.targetPages || 0}</td>
                      <td style="padding: 12px 8px;"><span class="badge badge-${g.status}">${g.status}</span></td>
                      <td style="padding: 12px 8px; text-align: right;">
                        <button class="btn btn-outline btn-xs edit-history-goal-btn locked" disabled data-goal-id="${g.id}">Edit</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="dashboard-side-col">
        <div class="card">
          <h3 style="color: var(--text-main); margin-bottom: 8px;">Preloaded Hifz Roadmap</h3>
          <div class="roadmap-list">
            ${futureGoals.map(g => {
              const configured = g.startPage && g.endPage;
              const rangeStr = configured ? `Pages ${g.startPage}–${g.endPage}` : 'Page range not configured';
              return `
                <div class="roadmap-item">
                  <div class="roadmap-month-info">
                    <span class="roadmap-month-name">${getMonthName(g.month)} ${g.year}</span>
                    <span class="roadmap-month-target">Para ${g.para} <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-muted);">(${STANDARD_PARA_PAGES[g.para].name})</span></span>
                    <span class="roadmap-month-pages" style="color: ${configured ? 'var(--text-muted)' : 'var(--color-missed)'}">${rangeStr}</span>
                  </div>
                  <div class="roadmap-actions">
                    <button class="btn btn-outline btn-xs edit-roadmap-goal-btn" data-goal-id="${g.id}">Edit</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  // Bindings
  document.querySelectorAll('.set-range-plan-btn').forEach(btn => {
    btn.onclick = () => openPageRangeModal(btn.dataset.goalId);
  });
  document.querySelectorAll('.edit-roadmap-goal-btn').forEach(btn => {
    btn.onclick = () => openRoadmapEditModal(btn.dataset.goalId);
  });

  const unlockBtn = document.getElementById('unlock-history-btn');
  if (unlockBtn) {
    unlockBtn.onclick = () => {
      document.querySelectorAll('.edit-history-goal-btn.locked').forEach(btn => {
        btn.removeAttribute('disabled');
        btn.classList.remove('locked');
        btn.onclick = () => openRoadmapEditModal(btn.dataset.goalId);
      });
      unlockBtn.innerText = "History Unlocked";
      showToast("History editing unlocked.", "success");
    };
  }
}

function renderGoalCardHtml(goal, completedPages, dailyRecords, todayStr) {
  const metrics = calculateMonthlyMetrics(goal, completedPages, dailyRecords, todayStr);
  if (!metrics.configured) {
    return `
      <div class="text-center" style="padding: 16px 0;">
        <h4 style="color: var(--primary-color); margin-bottom: 8px;">Goal: Para ${goal.para} (${STANDARD_PARA_PAGES[goal.para].name})</h4>
        <button class="btn btn-primary btn-xs set-range-plan-btn" data-goal-id="${goal.id}">Set Page Range</button>
      </div>
    `;
  }

  const percentStr = metrics.percentComplete.toFixed(0);
  return `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
      <div>
        <h4 style="font-size: 1.25rem; color: var(--primary-color); font-weight: 700; margin-bottom: 2px;">Para ${goal.para} <span style="font-size: 0.95rem; font-weight: normal; color: var(--text-muted);">(${STANDARD_PARA_PAGES[goal.para].name})</span></h4>
        <span style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-brand);">Range: ${goal.startPage}–${goal.endPage}</span>
      </div>
      <div style="text-align: right;"><span class="badge badge-${goal.status}">${goal.status}</span></div>
    </div>
    <div class="progress-container">
      <div class="progress-bar-wrapper" style="height: 8px;"><div class="progress-bar-fill" style="width: ${percentStr}%"></div></div>
      <div class="progress-label-row"><span>Progress: <strong>${metrics.completedPagesCount}/${metrics.targetPages} p.</strong></span><span>${percentStr}%</span></div>
    </div>
    <button class="btn btn-outline btn-xs edit-roadmap-goal-btn" data-goal-id="${goal.id}" style="margin-top: 12px;">Adjust Goal</button>
  `;
}

function calculateProjection(state, remainingPages) {
  const targetDateStr = "2028-12-31";
  let juzCompleted = calculateJuzCompletedCount(state.completedPages);

  let activeMonthsCount = 0;
  let pagesCompletedInActiveMonths = 0;
  state.monthlyGoals.forEach(g => {
    if (g.status === "completed" || g.status === "partial") {
      activeMonthsCount++;
      if (g.startPage && g.endPage) {
        for (let p = g.startPage; p <= g.endPage; p++) {
          if (state.completedPages.includes(p)) pagesCompletedInActiveMonths++;
        }
      }
    }
  });

  const ratePerMonth = activeMonthsCount > 0 ? (pagesCompletedInActiveMonths / activeMonthsCount) : 20;
  const monthsRemaining = ratePerMonth > 0 ? remainingPages / ratePerMonth : remainingPages / 20;

  const today = new Date(state.settings.systemDateOverride || new Date().toISOString().split('T')[0]);
  const diffMonths = Math.max(0, (new Date(targetDateStr) - today) / (1000 * 60 * 60 * 24 * 30.44));

  const projectedDateObj = new Date(today);
  projectedDateObj.setMonth(today.getMonth() + Math.ceil(monthsRemaining));
  const projectedDateText = `${getMonthName(projectedDateObj.getMonth() + 1)} ${projectedDateObj.getFullYear()}`;

  const onTrack = monthsRemaining <= diffMonths;
  let message = `You will finish by **${projectedDateText}** at your average pace of **${ratePerMonth.toFixed(1)} pages/month**.`;

  return { juzCompleted, projectedDate: remainingPages === 0 ? "Completed 🎉" : projectedDateText, onTrack, message };
}

// C. JUZ VIEW
function renderJuz(container) {
  const state = db.getState();
  let selectedJuzNum = 30;

  const drawMainLayout = () => {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div class="card pattern-bg" style="padding: 20px;">
          <h2 style="color: var(--primary-color);">Juz Map</h2>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Interactive overview of the 30 Juz. Click any block to view ranges and Surahs.</p>
        </div>
        <div class="card" id="juz-detail-container"></div>
        <div class="card">
          <div class="juz-grid" id="juz-grid-container"></div>
        </div>
      </div>
    `;
    drawGrid();
    showJuzDetails(selectedJuzNum);
  };

  const drawGrid = () => {
    const gridContainer = document.getElementById('juz-grid-container');
    if (!gridContainer) return;
    gridContainer.innerHTML = "";

    const activeGoal = state.monthlyGoals.find(g => g.id === (state.settings.systemDateOverride || new Date().toISOString().split('T')[0]).slice(0, 7));
    const activePara = activeGoal ? activeGoal.para : null;

    for (let j = 1; j <= 30; j++) {
      const range = STANDARD_PARA_PAGES[j];
      const totalPages = range.end - range.start + 1;
      let compCount = 0;
      for (let p = range.start; p <= range.end; p++) {
        if (state.completedPages.includes(p)) compCount++;
      }

      const isCompleted = compCount === totalPages;
      const isCurrent = j === activePara;
      const statusClass = isCompleted ? "completed" : (isCurrent ? "current" : "future");

      const cell = document.createElement('div');
      cell.className = `juz-cell ${statusClass}`;
      if (j === selectedJuzNum) {
        cell.style.borderColor = "var(--accent-color)";
      }
      cell.innerHTML = `
        <div class="juz-num">${j}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-brand); margin: 2px 0;">${range.start}–${range.end}</div>
        <div class="juz-label">${compCount}/${totalPages} p.</div>
        <div class="juz-status-dot"></div>
      `;
      cell.onclick = () => {
        selectedJuzNum = j;
        drawGrid();
        showJuzDetails(j);
      };
      gridContainer.appendChild(cell);
    }
  };

  const showJuzDetails = (juzNum) => {
    const detailContainer = document.getElementById('juz-detail-container');
    if (!detailContainer) return;

    const range = STANDARD_PARA_PAGES[juzNum];
    const totalPages = range.end - range.start + 1;
    let compCount = 0;
    for (let p = range.start; p <= range.end; p++) {
      if (state.completedPages.includes(p)) compCount++;
    }

    let pagesHtml = "";
    for (let p = range.start; p <= range.end; p++) {
      const isPageDone = state.completedPages.includes(p);
      pagesHtml += `
        <div class="page-grid-block ${isPageDone ? 'done' : ''}" data-page="${p}">
          ${p}
        </div>
      `;
    }

    const isCompleted = compCount === totalPages;
    detailContainer.innerHTML = `
      <div class="juz-details-box" style="margin-bottom: 0;">
        <div class="flex justify-between align-center" style="margin-bottom: 16px;">
          <div>
            <h3 style="color: var(--primary-color);">Juz ${juzNum} — ${STANDARD_PARA_PAGES[juzNum].name}</h3>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${JUZ_SURAHS[juzNum]}</span>
          </div>
          <span class="badge badge-${isCompleted ? 'completed' : 'active'}">${isCompleted ? 'Completed' : 'In Progress'}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">PAGE RANGE</div>
            <div style="font-size: 1.1rem; font-weight: 600; font-family: var(--font-brand);">Pages ${range.start}–${range.end}</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">PROGRESS</div>
            <div style="font-size: 1.1rem; font-weight: 600; font-family: var(--font-brand);">${compCount} / ${totalPages} Completed</div>
          </div>
        </div>

        <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 16px;">
          <h4 style="font-size: 0.85rem; color: var(--text-main); margin-bottom: 12px; font-weight: 600;">Edit Individual Pages</h4>
          <div class="juz-page-grid-picker">
            ${pagesHtml}
          </div>
        </div>

        <div style="border-top: 1px solid var(--border-color); padding-top: 16px; margin-top: 16px; display: flex; justify-content: flex-end; gap: 8px;">
          <button id="juz-reset-btn" class="btn btn-outline btn-xs" style="color: var(--color-missed); border-color: var(--color-missed);">Reset All Pages</button>
          <button id="juz-complete-btn" class="btn btn-primary btn-xs">Mark All Completed</button>
        </div>
      </div>
    `;

    // Bind individual page toggle click handlers
    detailContainer.querySelectorAll('.page-grid-block').forEach(block => {
      block.onclick = () => {
        const pageNum = parseInt(block.dataset.page, 10);
        const pageIdx = state.completedPages.indexOf(pageNum);
        
        if (pageIdx !== -1) {
          state.completedPages.splice(pageIdx, 1);
          db.save();
          showToast(`Page ${pageNum} marked incomplete.`, "info");
        } else {
          state.completedPages.push(pageNum);
          state.completedPages.sort((a, b) => a - b);
          db.save();
          showToast(`Page ${pageNum} marked completed.`, "success");
        }
        
        drawGrid();
        showJuzDetails(juzNum);
      };
    });

    const compBtn = document.getElementById('juz-complete-btn');
    if (compBtn) {
      compBtn.onclick = () => {
        for (let p = range.start; p <= range.end; p++) {
          if (!state.completedPages.includes(p)) state.completedPages.push(p);
        }
        state.completedPages.sort((a, b) => a - b);
        db.save();
        showToast(`Juz ${juzNum} marked completed.`, "success");
        triggerCelebration(`Juz ${juzNum} Completed!`, "Alhamdulillah! You have completed another milestone.");
        drawGrid();
        showJuzDetails(juzNum);
      };
    }

    const resetBtn = document.getElementById('juz-reset-btn');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm(`Reset all pages of Juz ${juzNum}?`)) {
          state.completedPages = state.completedPages.filter(p => p < range.start || p > range.end);
          db.save();
          showToast(`Juz ${juzNum} reset.`, "success");
          drawGrid();
          showJuzDetails(juzNum);
        }
      };
    }
  };

  drawMainLayout();
}

// D. STATS VIEW
function renderStats(container) {
  const state = db.getState();
  const todayStr = state.settings.systemDateOverride || new Date().toISOString().split('T')[0];
  
  const goalId = todayStr.slice(0, 7);
  const activeGoal = state.monthlyGoals.find(g => g.id === goalId);
  const metrics = activeGoal ? calculateMonthlyMetrics(activeGoal, state.completedPages, state.dailyRecords, todayStr) : null;

  const totalPagesCompleted = state.completedPages.length;
  const totalJuz = calculateJuzCompletedCount(state.completedPages);

  let totalHifzDays = 0;
  let totalMissedDays = 0;
  let totalSabqiCompleted = 0, totalSabqiRequested = 0;
  let totalManzilCompleted = 0, totalManzilRequested = 0;

  Object.values(state.dailyRecords).forEach(r => {
    if (!r.isSunday) {
      totalHifzDays++;
      if (r.missed) totalMissedDays++;
    }
    if (r.sabqi && r.sabqi !== "Unconfigured") {
      totalSabqiRequested++;
      if (r.sabqiCompleted) totalSabqiCompleted++;
    }
    if (r.manzil) {
      totalManzilRequested++;
      if (r.manzilCompleted) totalManzilCompleted++;
    }
  });

  const sabqiRate = totalSabqiRequested > 0 ? (totalSabqiCompleted / totalSabqiRequested) * 100 : 0;
  const manzilRate = totalManzilRequested > 0 ? (totalManzilCompleted / totalManzilRequested) * 100 : 0;

  // Daily Task Performance counts
  let fullyCompletedCount = 0;
  let partiallyCompletedCount = 0;
  let skippedBreaksCount = 0;
  let missedDaysCount = 0;

  Object.values(state.dailyRecords).forEach(r => {
    if (r.isSunday) return;

    if (r.missed) {
      if (r.missedReason === 'break') {
        skippedBreaksCount++;
      } else {
        missedDaysCount++;
      }
    } else {
      const sabaqDone = r.sabaqCompleted || r.sabaqSkipped;
      const allCompleted = sabaqDone && r.sabqiCompleted && r.manzilCompleted;
      const someCompleted = sabaqDone || r.sabqiCompleted || r.manzilCompleted;

      if (allCompleted) {
        fullyCompletedCount++;
      } else if (someCompleted) {
        partiallyCompletedCount++;
      } else {
        missedDaysCount++;
      }
    }
  });
  const totalLoggedActiveDays = fullyCompletedCount + partiallyCompletedCount + skippedBreaksCount + missedDaysCount;
  const incompleteDaysCount = totalLoggedActiveDays - fullyCompletedCount;

  // Daily Logs list generation
  let logsHtml = "";
  if (activeGoal && metrics && metrics.configured) {
    const startDay = (activeGoal.id === "2026-08") ? 22 : 1;
    const calendarDays = activeGoal.calendarDays;
    
    for (let d = startDay; d <= calendarDays; d++) {
      const dateStr = `${activeGoal.year}-${String(activeGoal.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const rec = state.dailyRecords[dateStr] || {
        date: dateStr, monthlyGoalId: activeGoal.id, sabaq: "", sabqi: "", manzil: "",
        sabaqCompleted: false, sabqiCompleted: false, manzilCompleted: false,
        sabaqConfidence: null, sabqiConfidence: null, notes: "", sessionQuality: 0,
        missed: false, missedReason: null, isSunday: new Date(activeGoal.year, activeGoal.month - 1, d).getDay() === 0, isBufferDay: false
      };
      
      const isSunday = rec.isSunday;
      const dayNum = d - startDay + 1;
      const dateObj = new Date(activeGoal.year, activeGoal.month - 1, d);
      const dateLabel = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      
      let statusHtml = "";
      if (isSunday) {
        statusHtml = `<span style="color: var(--text-muted); font-size: 0.8rem;">⚪ Sunday Rest</span>`;
      } else if (rec.missed) {
        if (rec.missedReason === 'break') {
          statusHtml = `<span class="badge badge-partial" style="font-size: 0.75rem; text-decoration: none;">Planned Break / Skip</span>`;
        } else {
          statusHtml = `<span class="badge badge-skipped" style="background-color: rgba(217,83,79,0.1); color: var(--color-missed); text-decoration: none; font-size: 0.75rem;">🔴 Missed: ${rec.missedReason || 'Other'}</span>`;
        }
      } else {
        const sabaqDot = rec.sabaqCompleted ? '🟢 Sabaq' : (rec.sabaqSkipped ? '🟡 Sabaq' : '⚪ Sabaq');
        const sabqiDot = rec.sabqiCompleted ? '🟢 Sabqi' : '⚪ Sabqi';
        const manzilDot = rec.manzilCompleted ? '🟢 Manzil' : '⚪ Manzil';
        
        statusHtml = `
          <div class="flex gap-2" style="font-size: 0.8rem; margin-top: 4px;">
            <span style="color: ${rec.sabaqCompleted ? 'var(--secondary-color)' : (rec.sabaqSkipped ? 'var(--color-partial)' : 'var(--text-muted)')}; font-weight: ${rec.sabaqCompleted || rec.sabaqSkipped ? 'bold' : 'normal'};">${sabaqDot}</span>
            <span style="color: ${rec.sabqiCompleted ? 'var(--secondary-color)' : 'var(--text-muted)'}; font-weight: ${rec.sabqiCompleted ? 'bold' : 'normal'};">${sabqiDot}</span>
            <span style="color: ${rec.manzilCompleted ? 'var(--secondary-color)' : 'var(--text-muted)'}; font-weight: ${rec.manzilCompleted ? 'bold' : 'normal'};">${manzilDot}</span>
          </div>
        `;
      }
      
      logsHtml += `
        <div class="flex align-center justify-between" style="padding: 12px 0; border-bottom: 1px solid var(--border-color);">
          <div>
            <div style="font-weight: 600; font-size: 0.9rem; color: var(--text-main);">Day ${dayNum} <span style="font-weight: 400; color: var(--text-muted); margin-left: 4px;">(${dateLabel})</span></div>
            <div style="margin-top: 2px;">${statusHtml}</div>
          </div>
          <button class="btn btn-outline btn-xs edit-day-log-btn" data-date="${dateStr}" style="font-size: 0.75rem; padding: 4px 8px;">Edit Log</button>
        </div>
      `;
    }
  } else {
    logsHtml = `<p style="color: var(--text-muted); text-align: center; padding: 20px 0;">No active goal configured for this month.</p>`;
  }

  const unresolved = state.weakSpots.filter(w => !w.resolved);
  const pageStruggleCounts = {};
  unresolved.forEach(w => pageStruggleCounts[w.page] = (pageStruggleCounts[w.page] || 0) + 1);
  const sortedWeakPages = Object.keys(pageStruggleCounts).map(Number).sort((a,b) => pageStruggleCounts[b] - pageStruggleCounts[a]);

  const diaryEntries = Object.values(state.dailyRecords)
    .filter(r => r.notes || r.sessionQuality > 0)
    .sort((a,b) => b.date.localeCompare(a.date));

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div class="stats-grid">
        <div class="stats-card"><div class="stats-num">${totalPagesCompleted}</div><div class="stats-label">Pages Completed</div></div>
        <div class="stats-card"><div class="stats-num">${totalJuz}</div><div class="stats-label">Juz Memorized</div></div>
        <div class="stats-card"><div class="stats-num">${state.streakData.currentStreak} d</div><div class="stats-label">Current Streak</div></div>
        <div class="stats-card"><div class="stats-num">${state.streakData.longestStreak} d</div><div class="stats-label">Longest Streak</div></div>
      </div>

      <div class="plan-container">
        <div class="dashboard-main-col">
          <div class="card">
            <h3 style="color: var(--primary-color); margin-bottom: 16px;">This Month Status</h3>
            ${metrics && metrics.configured
              ? `
                <div class="juz-details-box" style="margin-bottom: 0;">
                  <div class="juz-detail-row"><span class="juz-detail-label">Active Target</span><span class="juz-detail-val">Para ${activeGoal.para} (${STANDARD_PARA_PAGES[activeGoal.para].name})</span></div>
                  <div class="juz-detail-row"><span class="juz-detail-label">Completed Pages</span><span class="juz-detail-val">${metrics.completedPagesCount} / ${metrics.targetPages} (${metrics.percentComplete.toFixed(0)}%)</span></div>
                  <div class="juz-detail-row"><span class="juz-detail-label">Required / Current Pace</span><span class="juz-detail-val">${metrics.requiredPace.toFixed(2)} / ${metrics.currentPace.toFixed(2)} p/d</span></div>
                  <div class="juz-detail-row"><span class="juz-detail-label">Progress Buffer</span><span class="juz-detail-val">${metrics.progressBuffer} Days</span></div>
                </div>
              `
              : `<p style="color: var(--text-muted);">Active month's page range not configured.</p>`
            }
          </div>

          <div class="card">
            <h3 style="color: var(--text-main); margin-bottom: 16px;">Revision Performance</h3>
            <div class="juz-details-box" style="margin-bottom: 0;">
              <div class="juz-detail-row"><span class="juz-detail-label">Sabqi Completion Rate</span><span class="juz-detail-val">${sabqiRate.toFixed(1)}%</span></div>
              <div class="juz-detail-row"><span class="juz-detail-label">Manzil Completion Rate</span><span class="juz-detail-val">${manzilRate.toFixed(1)}%</span></div>
            </div>
          </div>

          <div class="card">
            <h3 style="color: var(--text-main); margin-bottom: 16px;">Daily Task Performance</h3>
            <div class="juz-details-box" style="margin-bottom: 0;">
              <div class="juz-detail-row"><span class="juz-detail-label">Fully Completed Days (All 3 Tasks)</span><span class="juz-detail-val" style="color: var(--color-complete); font-weight: 700;">${fullyCompletedCount} days</span></div>
              <div class="juz-detail-row"><span class="juz-detail-label">Incomplete Tracking Days</span><span class="juz-detail-val" style="color: var(--color-missed); font-weight: 700;">${incompleteDaysCount} days</span></div>
              <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 12px; border-top: 1px solid var(--border-color); padding-top: 12px;">
                <div class="flex justify-between" style="margin-bottom: 4px;"><span>• Partially Completed:</span><span>${partiallyCompletedCount} d.</span></div>
                <div class="flex justify-between" style="margin-bottom: 4px;"><span>• Skipped / Breaks:</span><span>${skippedBreaksCount} d.</span></div>
                <div class="flex justify-between"><span>• Missed:</span><span>${missedDaysCount} d.</span></div>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 style="color: var(--text-main); margin-bottom: 16px;">Daily Logs History</h3>
            <div style="max-height: 400px; overflow-y: auto; padding-right: 8px;">
              ${logsHtml}
            </div>
          </div>
        </div>

        <div class="dashboard-side-col">
          <div class="card">
            <h3 style="color: var(--text-main); margin-bottom: 12px;">Frequently Difficult Pages</h3>
            <div class="weak-spots-list">
              ${sortedWeakPages.map(pageNum => {
                const representativeWS = unresolved.find(w => w.page === pageNum);
                return `
                  <div class="weak-spot-item">
                    <div class="weak-spot-info">
                      <span class="weak-spot-pages">Page ${pageNum}</span>
                      <span class="weak-spot-meta">Para ${representativeWS.para} · <span class="weak-spot-count">${pageStruggleCounts[pageNum]} struggles</span></span>
                    </div>
                    <button class="btn btn-outline btn-xs resolve-ws-btn" data-page="${pageNum}">Resolve</button>
                  </div>
                `;
              }).join('')}
              ${sortedWeakPages.length === 0 ? '<p style="color: var(--text-muted); text-align: center;">No unresolved weak spots.</p>' : ''}
            </div>
          </div>

          <div class="card">
            <h3 style="color: var(--text-main); margin-bottom: 12px;">Study Diary</h3>
            <div class="diary-list">
              ${diaryEntries.map(e => `
                <div class="diary-item">
                  <div class="diary-header"><strong>${e.date}</strong><span>${'★'.repeat(e.sessionQuality)}</span></div>
                  <div class="diary-body">"${e.notes || 'Checked in.'}"</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.resolve-ws-btn').forEach(btn => {
    btn.onclick = (e) => {
      const pageNum = parseInt(e.target.dataset.page, 10);
      unresolved.forEach(w => {
        if (w.page === pageNum) db.resolveWeakSpot(w.id);
      });
      showToast("Struggle marked resolved.", "success");
      renderStats(container);
    };
  });

  document.querySelectorAll('.edit-day-log-btn').forEach(btn => {
    btn.onclick = (e) => {
      const dateStr = e.target.dataset.date;
      openLogEditorModal(dateStr, container);
    };
  });
}

// E. SETTINGS VIEW
function renderSettings(container) {
  const state = db.getState();
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div class="card pattern-bg" style="padding: 20px;">
        <h2 style="color: var(--primary-color);">Settings</h2>
        <p style="color: var(--text-muted); font-size: 0.85rem;">Wipe logs, configure themes, simulate dates, or backup database files.</p>
      </div>

      <div class="plan-container">
        <div class="dashboard-main-col">
          <div class="card">
            <h3 style="color: var(--text-main); margin-bottom: 16px;">Schedule & theme</h3>
            <div class="settings-list">
              <div class="settings-group">
                <label for="settings-rest-day">Weekly Rest Day</label>
                <select id="settings-rest-day" class="form-select">
                  <option value="Sunday" ${state.settings.weeklyRestDay === "Sunday" ? "selected" : ""}>Sunday</option>
                  <option value="Friday" ${state.settings.weeklyRestDay === "Friday" ? "selected" : ""}>Friday</option>
                  <option value="Saturday" ${state.settings.weeklyRestDay === "Saturday" ? "selected" : ""}>Saturday</option>
                  <option value="None" ${state.settings.weeklyRestDay === "None" ? "selected" : ""}>None</option>
                </select>
              </div>
              <div class="settings-group">
                <label for="settings-theme">Theme Appearance</label>
                <select id="settings-theme" class="form-select">
                  <option value="light" ${state.settings.theme === "light" ? "selected" : ""}>Light Mode</option>
                  <option value="dark" ${state.settings.theme === "dark" ? "selected" : ""}>Dark Mode</option>
                </select>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 style="color: var(--primary-color); margin-bottom: 8px;">Simulated Date (Calculations Testing)</h3>
            <input type="text" id="settings-date-override" class="form-input" placeholder="e.g. 2026-09-11" value="${state.settings.systemDateOverride || ""}">
          </div>
        </div>

        <div class="dashboard-side-col">
          <div class="card">
            <h3 style="color: var(--text-main); margin-bottom: 16px;">Backup & Restore</h3>
            <div class="backup-actions">
              <button id="backup-export-btn" class="btn btn-outline w-full" style="margin-bottom: 8px;">Export (JSON)</button>
              <div class="file-input-wrapper">
                <button class="btn btn-primary w-full">Restore Backup</button>
                <input type="file" id="backup-import-file" accept=".json">
              </div>
            </div>
          </div>

          <div class="card danger-zone">
            <h3 class="danger-zone-title">Danger Zone</h3>
            <button id="settings-reset-btn" class="btn btn-primary w-full" style="background-color: var(--color-missed);">Reset All Hifz Data</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bindings
  document.getElementById('settings-rest-day').onchange = (e) => {
    db.updateSettings({ weeklyRestDay: e.target.value });
    showToast("Rest day updated.", "success");
  };

  const themeSel = document.getElementById('settings-theme');
  themeSel.onchange = (e) => {
    const sel = e.target.value;
    db.updateSettings({ theme: sel });
    if (sel === 'dark') document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
    showToast("Theme updated.", "success");
  };

  const dateInput = document.getElementById('settings-date-override');
  dateInput.onchange = (e) => {
    const val = e.target.value.trim();
    if (val === "") {
      db.updateSettings({ systemDateOverride: null });
      showToast("Date override cleared.", "success");
    } else if (val.match(/^\d{4}-\d{2}-\d{2}$/)) {
      db.updateSettings({ systemDateOverride: val });
      showToast("Date overridden to " + val, "success");
    } else {
      showToast("Invalid format (YYYY-MM-DD)", "error");
      dateInput.value = state.settings.systemDateOverride || "";
    }
  };

  document.getElementById('backup-export-btn').onclick = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db.getState()));
    const dl = document.createElement('a');
    dl.href = dataStr;
    dl.download = `mudakkir_backup_${new Date().toISOString().split('T')[0]}.json`;
    dl.click();
    showToast("Backup exported.", "success");
  };

  document.getElementById('backup-import-file').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (event) => {
      if (db.importState(event.target.result)) {
        showToast("Backup restored.", "success");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showToast("Invalid file.", "error");
      }
    };
    r.readAsText(file);
  };

  document.getElementById('settings-reset-btn').onclick = () => {
    if (confirm("Reset everything?")) {
      db.resetAllData();
      showToast("Data reset.", "success");
      setTimeout(() => window.location.reload(), 1000);
    }
  };
}

// 5. GLOBAL ROUTER & BOOTSTRAP
function initRouter() {
  const routeMap = {
    'dashboard': renderDashboard,
    'plan': renderPlan,
    'juz': renderJuz,
    'stats': renderStats,
    'settings': renderSettings
  };

  const handleRoute = () => {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    const renderFn = routeMap[hash] || renderDashboard;
    const mainContent = document.getElementById('main-content');
    
    if (mainContent) {
      mainContent.style.opacity = '0';
      setTimeout(() => {
        renderFn(mainContent);
        mainContent.style.opacity = '1';
      }, 100);
    }

    document.querySelectorAll('.desktop-nav .nav-item, .mobile-nav .mobile-nav-item').forEach(link => {
      if (link.dataset.page === hash) link.classList.add('active');
      else link.classList.remove('active');
    });
  };

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function updateStreaksDisplay() {
  const state = db.getState();
  const results = recalculateStreaks(state.dailyRecords, state.streakData);
  state.streakData.currentStreak = results.currentStreak;
  state.streakData.longestStreak = results.longestStreak;
  db.save();

  const hStreak = document.getElementById('streak-header');
  const val = document.getElementById('streak-header-val');
  if (hStreak && val) {
    if (results.currentStreak > 0) {
      hStreak.classList.remove('hidden');
      val.innerText = results.currentStreak;
    } else {
      hStreak.classList.add('hidden');
    }
  }
}

// Global modal open helpers
function openPageRangeModal(goalId) {
  const goal = db.getState().monthlyGoals.find(g => g.id === goalId);
  if (!goal) return;

  document.getElementById('range-goal-id').value = goalId;
  document.getElementById('range-para-num').value = goal.para;
  const standard = STANDARD_PARA_PAGES[goal.para];
  document.getElementById('range-start-page').value = goal.startPage || standard.start;
  document.getElementById('range-end-page').value = goal.endPage || standard.end;
  document.getElementById('range-target-override').value = goal.targetPages || "";
  document.getElementById('standard-range-display').innerText = `${standard.start}–${standard.end}`;
  document.getElementById('page-range-modal').classList.remove('hidden');
}

function openCheckinModal(dateStr, taskType) {
  const state = db.getState();
  let record = db.getDailyRecord(dateStr);
  const goalId = dateStr.slice(0, 7);
  const goal = state.monthlyGoals.find(g => g.id === goalId);
  const paraNum = goal ? goal.para : 1;

  if (!record) {
    record = {
      date: dateStr, monthlyGoalId: goalId, sabaq: "", sabqi: "", manzil: "",
      sabaqCompleted: false, sabqiCompleted: false, manzilCompleted: false,
      sabaqConfidence: null, sabqiConfidence: null, notes: "", sessionQuality: 4,
      missed: false, missedReason: null, isSunday: new Date(dateStr).getDay() === 0, isBufferDay: false
    };
  }

  document.getElementById('checkin-date').value = dateStr;
  document.getElementById('checkin-task-type').value = taskType;
  document.getElementById('checkin-notes').value = record.notes || "";
  
  const ratingGroup = document.getElementById('checkin-rating-group');
  const sabaqRangeGroup = document.getElementById('checkin-sabaq-range-group');
  const sabqiRangeGroup = document.getElementById('checkin-sabqi-range-group');

  let title = "", subtitle = "";
  if (taskType === 'sabaq') {
    ratingGroup.classList.remove('hidden');
    sabaqRangeGroup.classList.remove('hidden');
    sabqiRangeGroup.classList.add('hidden');
    title = "Complete Sabaq";
    
    let nextSabaq = goal ? goal.startPage : 1;
    if (goal) {
      let page = goal.startPage;
      while (page <= goal.endPage && state.completedPages.includes(page)) page++;
      nextSabaq = page <= goal.endPage ? page : goal.endPage;
    }
    
    document.getElementById('checkin-sabaq-start').value = nextSabaq;
    document.getElementById('checkin-sabaq-end').value = nextSabaq;
    
    subtitle = `Sabaq target: Page ${nextSabaq}`;
    document.getElementById(`conf-${record.sabaqConfidence || 'okay'}`).checked = true;

  } else if (taskType === 'sabqi') {
    ratingGroup.classList.remove('hidden');
    sabaqRangeGroup.classList.add('hidden');
    sabqiRangeGroup.classList.remove('hidden');
    title = "Complete Sabqi";
    subtitle = "Recent revision check";
    
    let nextSabaq = goal ? goal.startPage : 1;
    if (goal) {
      let page = goal.startPage;
      while (page <= goal.endPage && state.completedPages.includes(page)) page++;
      nextSabaq = page;
    }
    const lastCompleted = nextSabaq - 1;
    document.getElementById('checkin-sabqi-start').value = lastCompleted >= (goal ? goal.startPage : 1) ? goal.startPage : 1;
    document.getElementById('checkin-sabqi-end').value = lastCompleted >= (goal ? goal.startPage : 1) ? lastCompleted : 1;
    document.getElementById(`conf-${record.sabqiConfidence || 'okay'}`).checked = true;

  } else if (taskType === 'manzil') {
    ratingGroup.classList.add('hidden');
    sabaqRangeGroup.classList.add('hidden');
    sabqiRangeGroup.classList.add('hidden');
    title = "Complete Manzil";
    subtitle = `Rotational target: ${record.manzil || 'Para 30'}`;
  }

  document.getElementById('checkin-modal-title').innerText = title;
  document.getElementById('checkin-task-subtitle').innerText = subtitle;
  document.getElementById('checkin-task-title').innerText = `Check-in Date: ${dateStr}`;
  document.getElementById('checkin-modal').classList.remove('hidden');
}

function openMissedDayModal(dateStr) {
  document.getElementById('missed-date').value = dateStr;
  document.getElementById('missed-reason').value = "";
  document.getElementById('missed-notes').value = "";
  document.getElementById('missed-modal').classList.remove('hidden');
}

function openLogEditorModal(dateStr, statsContainer = null) {
  const state = db.getState();
  let record = db.getDailyRecord(dateStr);
  const goalId = dateStr.slice(0, 7);
  const goal = state.monthlyGoals.find(g => g.id === goalId);
  const startDay = (goalId === "2026-08") ? 22 : 1;
  const d = parseInt(dateStr.split('-')[2], 10);
  const dayNum = d - startDay + 1;

  if (!record) {
    record = {
      date: dateStr, monthlyGoalId: goalId, sabaq: "", sabqi: "", manzil: "",
      sabaqCompleted: false, sabqiCompleted: false, manzilCompleted: false,
      sabaqConfidence: null, sabqiConfidence: null, notes: "", sessionQuality: 4,
      missed: false, missedReason: null, isSunday: new Date(dateStr).getDay() === 0, isBufferDay: false
    };
  }

  document.getElementById('log-editor-date').value = dateStr;
  document.getElementById('log-editor-date-label').value = `Day ${dayNum} (${dateStr})`;
  
  const missedSelect = document.getElementById('log-editor-missed');
  if (record.missed) {
    missedSelect.value = record.missedReason === 'break' ? 'skipped' : 'missed';
  } else {
    missedSelect.value = 'active';
  }

  document.getElementById('log-editor-missed-reason').value = record.missedReason || "busy";
  document.getElementById('log-editor-sabaq-comp').checked = record.sabaqCompleted;
  document.getElementById('log-editor-sabaq-skip').checked = record.sabaqSkipped || false;
  document.getElementById('log-editor-sabaq-val').value = record.sabaq || "";
  document.getElementById('log-editor-sabqi-comp').checked = record.sabqiCompleted;
  document.getElementById('log-editor-sabqi-val').value = record.sabqi || "";
  document.getElementById('log-editor-manzil-comp').checked = record.manzilCompleted;
  document.getElementById('log-editor-manzil-val').value = record.manzil || "";
  document.getElementById('log-editor-notes').value = record.notes || "";

  // Mutual exclusion toggles
  document.getElementById('log-editor-sabaq-comp').onchange = (e) => {
    if (e.target.checked) document.getElementById('log-editor-sabaq-skip').checked = false;
  };
  document.getElementById('log-editor-sabaq-skip').onchange = (e) => {
    if (e.target.checked) document.getElementById('log-editor-sabaq-comp').checked = false;
  };

  const missedDetails = document.getElementById('log-editor-missed-details');
  const taskDetails = document.getElementById('log-editor-task-details');
  
  const toggleDetails = () => {
    if (missedSelect.value === 'active') {
      missedDetails.classList.add('hidden');
      taskDetails.classList.remove('hidden');
    } else {
      missedDetails.classList.remove('hidden');
      taskDetails.classList.add('hidden');
    }
  };
  missedSelect.onchange = toggleDetails;
  toggleDetails();

  // Save button submit logic
  document.getElementById('log-editor-form').onsubmit = (e) => {
    e.preventDefault();
    const state = db.getState();
    const isMissed = missedSelect.value !== 'active';
    const missedReason = isMissed ? (missedSelect.value === 'skipped' ? 'break' : document.getElementById('log-editor-missed-reason').value) : null;
    
    const sabaqComp = !isMissed && document.getElementById('log-editor-sabaq-comp').checked;
    const sabaqSkip = !isMissed && document.getElementById('log-editor-sabaq-skip').checked;
    let sabaqVal = document.getElementById('log-editor-sabaq-val').value.trim();
    if (sabaqComp && !sabaqVal) {
      sabaqVal = `Para ${goal ? goal.para : 1} · Page 9`;
    }

    const sabqiComp = !isMissed && document.getElementById('log-editor-sabqi-comp').checked;
    const sabqiVal = document.getElementById('log-editor-sabqi-val').value.trim();

    const manzilComp = !isMissed && document.getElementById('log-editor-manzil-comp').checked;
    const manzilVal = document.getElementById('log-editor-manzil-val').value.trim();

    const notesVal = document.getElementById('log-editor-notes').value.trim();

    // Synchronize completedPages
    const oldPages = record.sabaq ? [...record.sabaq.matchAll(/\d+/g)].map(m => parseInt(m[0], 10)) : [];
    const newPages = sabaqComp ? [...sabaqVal.matchAll(/\d+/g)].map(m => parseInt(m[0], 10)) : [];
    
    oldPages.forEach(p => {
      const idx = state.completedPages.indexOf(p);
      if (idx !== -1) state.completedPages.splice(idx, 1);
    });
    newPages.forEach(p => {
      if (!state.completedPages.includes(p)) {
        state.completedPages.push(p);
      }
    });
    state.completedPages.sort((a,b) => a - b);

    // Save record properties
    record.missed = isMissed;
    record.missedReason = missedReason;
    record.sabaqCompleted = sabaqComp;
    record.sabaqSkipped = sabaqSkip;
    record.sabaq = sabaqComp ? sabaqVal : "";
    record.sabqiCompleted = sabqiComp;
    record.sabqi = sabqiComp ? sabqiVal : "";
    record.manzilCompleted = manzilComp;
    record.manzil = manzilComp ? manzilVal : "";
    record.notes = notesVal;

    db.saveDailyRecord(dateStr, record);
    updateStreaksDisplay();

    document.getElementById('log-editor-modal').classList.add('hidden');
    showToast("Daily log updated successfully.", "success");
    
    if (statsContainer) {
      renderStats(statsContainer);
    } else {
      initRouter();
    }
  };

  document.getElementById('log-editor-modal').classList.remove('hidden');
}

function openRoadmapEditModal(goalId) {
  const goal = db.getState().monthlyGoals.find(g => g.id === goalId);
  if (!goal) return;

  document.getElementById('edit-goal-id').value = goalId;
  document.getElementById('edit-goal-month-label').value = `${getMonthName(goal.month)} ${goal.year}`;
  
  const select = document.getElementById('edit-goal-para');
  select.innerHTML = "";
  for (let p = 1; p <= 30; p++) {
    const opt = document.createElement('option');
    opt.value = p; opt.innerText = `Para ${p} (${STANDARD_PARA_PAGES[p].name})`;
    if (p === goal.para) opt.selected = true;
    select.appendChild(opt);
  }

  document.getElementById('edit-goal-start').value = goal.startPage || "";
  document.getElementById('edit-goal-end').value = goal.endPage || "";
  document.getElementById('edit-goal-status').value = goal.status;

  const btn = document.getElementById('edit-use-standard-btn');
  const updateText = () => {
    const standard = STANDARD_PARA_PAGES[parseInt(select.value, 10)];
    btn.innerText = `Use Standard Range (${standard.start}–${standard.end})`;
  };
  select.onchange = updateText;
  updateText();

  btn.onclick = () => {
    const standard = STANDARD_PARA_PAGES[parseInt(select.value, 10)];
    document.getElementById('edit-goal-start').value = standard.start;
    document.getElementById('edit-goal-end').value = standard.end;
  };

  document.getElementById('roadmap-edit-modal').classList.remove('hidden');
}

function triggerCelebration(titleText, textContent) {
  const overlay = document.getElementById('celebration-overlay');
  if (overlay) {
    document.getElementById('celebration-title').innerText = titleText;
    document.getElementById('celebration-text').innerText = textContent;
    overlay.classList.remove('hidden');
  }
}

function bindGlobalModals() {
  const hideModal = (el) => el.classList.add('hidden');
  
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.onclick = (e) => { if (e.target === overlay) hideModal(overlay); };
  });

  // Range Form
  document.getElementById('close-range-modal-btn').onclick = () => hideModal(document.getElementById('page-range-modal'));
  document.getElementById('cancel-range-modal-btn').onclick = () => hideModal(document.getElementById('page-range-modal'));
  document.getElementById('page-range-form').onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('range-goal-id').value;
    const start = parseInt(document.getElementById('range-start-page').value, 10);
    const end = parseInt(document.getElementById('range-end-page').value, 10);
    const override = parseInt(document.getElementById('range-target-override').value, 10);

    if (end < start) {
      showToast("End page must be >= start page.", "error");
      return;
    }
    const target = isNaN(override) ? (end - start + 1) : override;
    db.updateMonthlyGoal(id, { startPage: start, endPage: end, targetPages: target });
    hideModal(document.getElementById('page-range-modal'));
    showToast("Range saved.", "success");
    initRouter();
  };

  // Checkin Form
  document.getElementById('close-checkin-modal-btn').onclick = () => hideModal(document.getElementById('checkin-modal'));
  document.getElementById('cancel-checkin-modal-btn').onclick = () => hideModal(document.getElementById('checkin-modal'));
  document.getElementById('checkin-form').onsubmit = (e) => {
    e.preventDefault();
    const dateStr = document.getElementById('checkin-date').value;
    const taskType = document.getElementById('checkin-task-type').value;
    const notes = document.getElementById('checkin-notes').value;
    
    let quality = 4;
    for (let s = 1; s <= 5; s++) {
      if (document.getElementById(`star${s}`).checked) quality = s;
    }

    let confidence = 'okay';
    ['easy', 'okay', 'hard'].forEach(c => {
      if (document.getElementById(`conf-${c}`).checked) confidence = c;
    });

    let rec = db.getDailyRecord(dateStr);
    if (!rec) {
      rec = {
        date: dateStr, monthlyGoalId: dateStr.slice(0, 7), sabaq: "", sabqi: "", manzil: "",
        sabaqCompleted: false, sabqiCompleted: false, manzilCompleted: false,
        sabaqConfidence: null, sabqiConfidence: null, notes: "", sessionQuality: 4,
        missed: false, missedReason: null, isSunday: new Date(dateStr).getDay() === 0, isBufferDay: false
      };
    }

    rec.notes = notes;
    rec.sessionQuality = quality;
    rec.missed = false;
    rec.missedReason = null;

    if (taskType === 'sabaq') {
      const s = parseInt(document.getElementById('checkin-sabaq-start').value, 10);
      const end = parseInt(document.getElementById('checkin-sabaq-end').value, 10);
      
      const targetGoal = db.getState().monthlyGoals.find(g => g.id === rec.monthlyGoalId);
      const paraNum = targetGoal ? targetGoal.para : 1;

      if (!isNaN(s) && !isNaN(end) && end >= s) {
        // Read old completed pages if any was logged today already
        const oldPages = (rec.sabaqCompleted && rec.sabaq) ? [...rec.sabaq.matchAll(/\d+/g)].map(m => parseInt(m[0], 10)) : [];
        const newPages = [];
        for (let p = s; p <= end; p++) {
          newPages.push(p);
        }
        const combinedPages = Array.from(new Set([...oldPages, ...newPages])).sort((a,b) => a - b);

        if (combinedPages.length === 1) {
          rec.sabaq = `Para ${paraNum} · Page ${combinedPages[0]}`;
        } else {
          rec.sabaq = `Para ${paraNum} · Pages ${combinedPages[0]}–${combinedPages[combinedPages.length - 1]}`;
        }
        
        combinedPages.forEach(p => {
          if (!db.state.completedPages.includes(p)) {
            db.state.completedPages.push(p);
          }
        });
        db.state.completedPages.sort((a, b) => a - b);
      } else {
        const pageMatch = (rec.sabaq || "").match(/Page\s+(\d+)/);
        if (pageMatch) {
          const pageNum = parseInt(pageMatch[1], 10);
          if (!db.state.completedPages.includes(pageNum)) {
            db.state.completedPages.push(pageNum);
            db.state.completedPages.sort((a,b) => a - b);
          }
        }
      }
      rec.sabaqCompleted = true;
      rec.sabaqConfidence = confidence;
      rec.sabaqSkipped = false;
    } else if (taskType === 'sabqi') {
      rec.sabqiCompleted = true;
      rec.sabqiConfidence = confidence;
      const s = parseInt(document.getElementById('checkin-sabqi-start').value, 10);
      const end = parseInt(document.getElementById('checkin-sabqi-end').value, 10);
      if (!isNaN(s) && !isNaN(end)) rec.sabqi = `Pages ${s}–${end}`;
    } else if (taskType === 'manzil') {
      rec.manzilCompleted = true;
    }

    db.saveDailyRecord(dateStr, rec);
    updateStreaksDisplay();

    // Check month completion
    const goal = db.state.monthlyGoals.find(g => g.id === rec.monthlyGoalId);
    if (goal && goal.startPage && goal.endPage) {
      let complete = true;
      for (let p = goal.startPage; p <= goal.endPage; p++) {
        if (!db.state.completedPages.includes(p)) complete = false;
      }
      if (complete && goal.status !== "completed") {
        goal.status = "completed";
        goal.completionDate = dateStr;
        db.save();
        triggerCelebration(`Para ${goal.para} (${STANDARD_PARA_PAGES[goal.para].name}) Completed!`, "Alhamdulillah! You finished your monthly goal.");
      }
    }

    hideModal(document.getElementById('checkin-modal'));
    initRouter();
  };

  // Missed Form
  document.getElementById('close-missed-modal-btn').onclick = () => hideModal(document.getElementById('missed-modal'));
  document.getElementById('cancel-missed-modal-btn').onclick = () => hideModal(document.getElementById('missed-modal'));
  document.getElementById('missed-form').onsubmit = (e) => {
    e.preventDefault();
    const dateStr = document.getElementById('missed-date').value;
    const reason = document.getElementById('missed-reason').value;
    const notes = document.getElementById('missed-notes').value;

    let rec = db.getDailyRecord(dateStr);
    if (!rec) {
      rec = {
        date: dateStr, monthlyGoalId: dateStr.slice(0, 7), sabaq: "", sabqi: "", manzil: "",
        sabaqCompleted: false, sabqiCompleted: false, manzilCompleted: false,
        sabaqConfidence: null, sabqiConfidence: null, notes: "", sessionQuality: 0,
        missed: true, missedReason: null, isSunday: new Date(dateStr).getDay() === 0, isBufferDay: false
      };
    }
    rec.missed = true;
    rec.missedReason = reason;
    rec.notes = notes;
    rec.sabaqCompleted = false;
    rec.sabqiCompleted = false;
    rec.manzilCompleted = false;

    db.saveDailyRecord(dateStr, rec);
    updateStreaksDisplay();
    hideModal(document.getElementById('missed-modal'));
    showToast("Recorded status.", "success");
    initRouter();
  };

  // Celebration Dismiss
  document.getElementById('close-celebration-btn').onclick = () => hideModal(document.getElementById('celebration-overlay'));

  // Protocol Dismiss
  document.getElementById('dismiss-protocol-btn').onclick = () => hideModal(document.getElementById('protocol-modal'));
  document.getElementById('close-protocol-modal-btn').onclick = () => hideModal(document.getElementById('protocol-modal'));

  // Roadmap Edit Form
  document.getElementById('close-roadmap-edit-btn').onclick = () => hideModal(document.getElementById('roadmap-edit-modal'));
  document.getElementById('cancel-roadmap-edit-btn').onclick = () => hideModal(document.getElementById('roadmap-edit-modal'));
  document.getElementById('roadmap-edit-form').onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-goal-id').value;
    const para = parseInt(document.getElementById('edit-goal-para').value, 10);
    const start = document.getElementById('edit-goal-start').value === "" ? null : parseInt(document.getElementById('edit-goal-start').value, 10);
    const end = document.getElementById('edit-goal-end').value === "" ? null : parseInt(document.getElementById('edit-goal-end').value, 10);
    const status = document.getElementById('edit-goal-status').value;

    if (start !== null && end !== null && end < start) {
      showToast("End page must be >= start page.", "error");
      return;
    }

    db.updateMonthlyGoal(id, {
      para,
      startPage: start,
      endPage: end,
      targetPages: (start !== null && end !== null) ? (end - start + 1) : null,
      status
    });
    hideModal(document.getElementById('roadmap-edit-modal'));
    showToast("Goal updated.", "success");
    initRouter();
  };

  // Log Editor Dismiss
  document.getElementById('close-log-editor-btn').onclick = () => hideModal(document.getElementById('log-editor-modal'));
  document.getElementById('cancel-log-editor-btn').onclick = () => hideModal(document.getElementById('log-editor-modal'));
}

// 5. GLOBAL INITIALIZATION & BOOTSTRAP
document.addEventListener('DOMContentLoaded', () => {
  const state = db.getState();

  // A. Initialize theme
  if (state.settings.theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }

  // B. Bind Global Modals immediately
  bindGlobalModals();

  // C. Setup header quick controls
  setupHeaderQuickControls();

  // D. Start 2-second automatic welcome screen fade out
  const splashScreen = document.getElementById('splash-screen');
  const appContainer = document.getElementById('app-container');

  const handleEnter = () => {
    if (splashScreen && appContainer) {
      splashScreen.style.opacity = '0';
      splashScreen.style.transform = 'scale(1.01)';
      
      appContainer.classList.remove('hidden');
      appContainer.style.opacity = '0';
      appContainer.style.transition = 'opacity 0.6s ease-in-out';
      
      setTimeout(() => {
        appContainer.style.opacity = '1';
      }, 50);

      setTimeout(() => {
        splashScreen.classList.remove('active');
        splashScreen.classList.add('hidden');
        
        // E. Initialize router and display streaks
        initRouter();
        updateStreaksDisplay();
      }, 600);
    } else {
      initRouter();
      updateStreaksDisplay();
    }
  };

  setTimeout(handleEnter, 3000);
});

// Setup header quick buttons
function setupHeaderQuickControls() {
  const themeToggle = document.getElementById('theme-toggle-header');
  if (themeToggle) {
    themeToggle.onclick = () => {
      const state = db.getState();
      const currentTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
      
      db.updateSettings({ theme: currentTheme });
      if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      
      if (window.location.hash === '#settings') {
        const select = document.getElementById('settings-theme');
        if (select) select.value = currentTheme;
      }
      
      showToast(`Theme changed to ${currentTheme} mode.`, "success");
    };
  }
}
