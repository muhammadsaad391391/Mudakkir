/* ==========================================================================
   Muddakir — Unified Single-File Application Logic
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
  weeklyRestDay: null,
  theme: "light",
  systemDateOverride: null
};

// Helper: Calculate projected end date (Sundays are normal study days)
function calculateProjectedEndDate(startDateStr, daysNeeded) {
  if (!startDateStr || isNaN(daysNeeded) || daysNeeded <= 0) return "";
  const parts = startDateStr.split('-').map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) return "";
  const [y, m, d] = parts;
  const daysToAdd = Math.max(0, Math.ceil(daysNeeded) - 1);
  const cur = new Date(Date.UTC(y, m - 1, d + daysToAdd));
  return cur.toISOString().split('T')[0];
}

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
        if (!parsed.version || parsed.version < 5) {
          console.log("Upgrading state to v5 (No default active project, normal Sundays)...");
          const freshState = this.createInitialState();
          this.save(freshState);
          return freshState;
        }
        if (!parsed.completedPortions) {
          parsed.completedPortions = [];
        }
        parsed.version = 6;
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
      // Auto-push to cloud if sync is enabled (debounced — fire and forget)
      if (typeof isSyncEnabled !== "undefined" && isSyncEnabled() && typeof pushToCloud !== "undefined") {
        clearTimeout(window._syncDebounce);
        window._syncDebounce = setTimeout(() => pushToCloud(stateToSave), 2000);
      }
    } catch (e) {
      console.error("localStorage save error:", e);
    }
  }

  getState() {
    return this.state;
  }

  createInitialState() {
    // Completed pages:
    // Para 1: 1 to 22 (22 pages)
    // Para 2: 23 to 42 (20 pages)
    // Para 30: 587 to 611 (25 pages)
    // Para 29: first 9 pages: 563 to 571 (9 pages)
    const completedPages = [];
    for (let p = 1; p <= 22; p++) completedPages.push(p);
    for (let p = 23; p <= 42; p++) completedPages.push(p);
    for (let p = 563; p <= 571; p++) completedPages.push(p);
    for (let p = 587; p <= 611; p++) completedPages.push(p);

    // Initial project history (completed milestones)
    // Note: No active project pre-loaded so user can start their own project freely
    const monthlyGoals = [];

    const dailyRecords = {};
    const weakSpots = [];

    return {
      version: 6,
      settings: { ...DEFAULT_SETTINGS },
      monthlyGoals,
      dailyRecords,
      completedPages: Array.from(new Set(completedPages)).sort((a, b) => a - b),
      completedPortions: [],
      weakSpots,
      streakData: {
        currentStreak: 0,
        longestStreak: 5,
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
      if (updatedFields.status === "active") {
        this.state.monthlyGoals.forEach(g => {
          if (g.id !== goalId && g.status === "active") g.status = "future";
        });
      }
      this.state.monthlyGoals[goalIndex] = {
        ...this.state.monthlyGoals[goalIndex],
        ...updatedFields
      };
      this.save();
    }
  }

  addGoal(goalData) {
    if (goalData.status === "active") {
      this.state.monthlyGoals.forEach(g => {
        if (g.status === "active") g.status = "future";
      });
    }
    this.state.monthlyGoals.push(goalData);
    this.save();
  }

  deleteGoal(goalId) {
    this.state.monthlyGoals = this.state.monthlyGoals.filter(g => g.id !== goalId);
    this.save();
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

// 3. CALCULATION FUNCTIONS & PORTION HELPERS

function isPortionCompleted(state, pageNum, halfNum) {
  if (state.completedPages && state.completedPages.includes(pageNum)) return true;
  if (!state.completedPortions) return false;
  return state.completedPortions.includes(`${pageNum}_${halfNum}`);
}

function getTotalCompletedPagesCount(state) {
  let count = state.completedPages ? state.completedPages.length : 0;
  if (state.completedPortions && state.completedPortions.length > 0) {
    state.completedPortions.forEach(item => {
      const p = parseInt(item.split('_')[0], 10);
      if (!state.completedPages.includes(p)) {
        count += 0.5;
      }
    });
  }
  return count;
}

function togglePagePortion(state, pageNum, halfNum) {
  if (!state.completedPortions) state.completedPortions = [];
  const key = `${pageNum}_${halfNum}`;
  const otherKey = `${pageNum}_${halfNum === 1 ? 2 : 1}`;

  // If page is fully completed in completedPages
  if (state.completedPages.includes(pageNum)) {
    const idx = state.completedPages.indexOf(pageNum);
    if (idx !== -1) state.completedPages.splice(idx, 1);
    if (!state.completedPortions.includes(otherKey)) {
      state.completedPortions.push(otherKey);
    }
    state.completedPortions = state.completedPortions.filter(k => k !== key);
    return false; // now unticked
  }

  // Not in completedPages
  const exists = state.completedPortions.includes(key);
  if (exists) {
    state.completedPortions = state.completedPortions.filter(k => k !== key);
    return false;
  } else {
    state.completedPortions.push(key);
    // If the other half is also ticked, upgrade to full page in completedPages
    if (state.completedPortions.includes(otherKey)) {
      state.completedPortions = state.completedPortions.filter(k => k !== key && k !== otherKey);
      if (!state.completedPages.includes(pageNum)) {
        state.completedPages.push(pageNum);
        state.completedPages.sort((a, b) => a - b);
      }
    }
    return true;
  }
}

function getNextSabaqPortion(activeGoal, state) {
  if (!activeGoal) return null;
  const isHalfPagePace = (activeGoal.targetPace && activeGoal.targetPace <= 0.75) || activeGoal.mode === 'pace';
  const slotSize = isHalfPagePace ? 0.5 : 1.0;
  // Scan from the para's standard first page so Sabaq covers entire para from beginning
  const paraInfo = STANDARD_PARA_PAGES[activeGoal.para];
  const scanStart = paraInfo ? paraInfo.start : activeGoal.startPage;
  const scanEnd   = activeGoal.endPage;
  for (let p = scanStart; p <= scanEnd; p++) {
    const h1 = isPortionCompleted(state, p, 1);
    const h2 = isPortionCompleted(state, p, 2);
    if (!h1) {
      const slotLabel = isHalfPagePace ? `Page ${p}-${p + 0.5}` : `Page ${p}`;
      return { page: p, half: 1, portionSize: slotSize, text: `Para ${activeGoal.para} \u00B7 ${slotLabel}`, shortLabel: slotLabel };
    }
    if (!h2) {
      const slotLabel = isHalfPagePace ? `Page ${p + 0.5}-${p + 1}` : `Page ${p}`;
      return { page: p, half: 2, portionSize: slotSize, text: `Para ${activeGoal.para} \u00B7 ${slotLabel}`, shortLabel: slotLabel };
    }
  }
  return { page: null, half: null, portionSize: 0, text: "Para Complete! \U0001F389", shortLabel: "Complete" };
}

function getSabqiRange(activeGoal, state) {
  if (!activeGoal) return "Revision Mode";
  
  let completedInGoal = [];
  let partialLastPage = null;
  for (let p = activeGoal.startPage; p <= activeGoal.endPage; p++) {
    const h1 = isPortionCompleted(state, p, 1);
    const h2 = isPortionCompleted(state, p, 2);
    if (h1 && h2) {
      completedInGoal.push(p);
    } else if (h1) {
      partialLastPage = p;
    }
  }

  if (completedInGoal.length === 0 && !partialLastPage) {
    const prevPara = activeGoal.para > 1 ? activeGoal.para - 1 : 30;
    const prevRange = STANDARD_PARA_PAGES[prevPara];
    if (prevRange) {
      const startSabqi = Math.max(prevRange.start, prevRange.end - 9);
      return `Para ${prevPara} · Pages ${startSabqi}–${prevRange.end}`;
    }
    return "Para 2 · Pages 33–42";
  }

  const startP = activeGoal.startPage;
  if (completedInGoal.length > 0 && !partialLastPage) {
    const endP = completedInGoal[completedInGoal.length - 1];
    return startP === endP ? `Para ${activeGoal.para} · Page ${startP}` : `Para ${activeGoal.para} · Pages ${startP}–${endP}`;
  } else if (completedInGoal.length > 0 && partialLastPage) {
    const endP = completedInGoal[completedInGoal.length - 1];
    return `Para ${activeGoal.para} · Pages ${startP}–${endP} (+ P. ${partialLastPage} 1st half)`;
  } else {
    const prevPara = activeGoal.para > 1 ? activeGoal.para - 1 : 30;
    return `Para ${activeGoal.para} · Page ${partialLastPage} (1st half) + Para ${prevPara} (last 5 p.)`;
  }
}

function calculateMonthlyMetrics(goal, completedPages, dailyRecords, currentDateStr, completedPortions = []) {
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
    bufferText: 'You are on track with your required pace.',
    goalComplete: false,
    sundaysRemaining: 0,
    bufferDaysRemaining: 0,
    totalBufferDays: 0,
    targetCompletionDate: "",
    adjustedCompletionDate: "",
    daysNeededFromToday: 0,
    pagesAhead: 0,
    daysAhead: 0
  };

  if (!goal || !goal.startPage || !goal.endPage) return result;

  result.configured = true;
  const targetPages = goal.targetPages || Math.max(0.5, Math.round((goal.endPage - goal.startPage + 1) * 10) / 10);
  result.targetPages = targetPages;

  let completedCount = 0;
  const startP = Math.floor(goal.startPage);
  const endP = Math.floor(goal.endPage);
  for (let p = startP; p <= endP; p++) {
    const h1 = completedPortions.includes(`${p}_1`) || completedPages.includes(p);
    const h2 = completedPortions.includes(`${p}_2`) || completedPages.includes(p);
    
    // Check if 1st half is within goal range [goal.startPage, goal.endPage]
    // 1st half represents [p, p + 0.5]
    if (p + 0.5 > goal.startPage && p < goal.endPage) {
      if (h1) completedCount += 0.5;
    }
    // 2nd half represents [p + 0.5, p + 1.0]
    if (p + 1.0 > goal.startPage && p + 0.5 < goal.endPage) {
      if (h2) completedCount += 0.5;
    }
  }
  result.completedPagesCount = completedCount;
  result.remainingPages = Math.max(0, targetPages - completedCount);
  result.percentComplete = targetPages > 0 ? (completedCount / targetPages) * 100 : 0;
  
  if (completedCount >= targetPages) {
    result.goalComplete = true;
  }

  // Determine required pace: either explicit targetPace, or computed from targetDays
  let requiredPace = 0.5;
  if (goal.targetPace && !isNaN(goal.targetPace)) {
    requiredPace = parseFloat(goal.targetPace);
  } else if (goal.targetDays && !isNaN(goal.targetDays)) {
    const totalDays = Math.max(1, parseInt(goal.targetDays, 10));
    requiredPace = targetPages / totalDays;
  } else if (goal.calendarDays) {
    requiredPace = targetPages / Math.max(1, goal.calendarDays);
  }
  result.requiredPace = parseFloat(requiredPace.toFixed(2));

  const totalHifzDays = requiredPace > 0 ? Math.ceil(targetPages / requiredPace) : 30;
  result.hifzDays = totalHifzDays;

  // Study days passed since start date
  let hifzDaysPassed = 0;
  const startDateStr = goal.startDate || currentDateStr;
  const startObj = new Date(startDateStr);
  const currObj = new Date(currentDateStr);
  
  if (currObj >= startObj) {
    hifzDaysPassed = Math.round((currObj - startObj) / (1000 * 60 * 60 * 24)) + 1;
  }
  result.hifzDaysPassed = hifzDaysPassed;

  const hifzDaysRemaining = requiredPace > 0 ? Math.ceil(result.remainingPages / requiredPace) : 0;
  result.hifzDaysRemaining = hifzDaysRemaining;

  const expectedProgress = Math.min(targetPages, requiredPace * hifzDaysPassed);
  result.expectedProgress = parseFloat(expectedProgress.toFixed(2));

  const progressDifference = completedCount - expectedProgress;
  result.progressDifference = parseFloat(progressDifference.toFixed(2));

  const progressBuffer = requiredPace > 0 ? progressDifference / requiredPace : 0;
  result.progressBuffer = parseFloat(progressBuffer.toFixed(1));
  result.bufferDaysRemaining = Math.max(0, totalHifzDays - Math.ceil(targetPages / (requiredPace || 1)));
  result.sundaysRemaining = 0;

  // Support Complex Project custom daily targets schedule
  if (goal.isComplex && Array.isArray(goal.dailyTargets) && goal.dailyTargets.length > 0) {
    const totalPlannedPages = goal.dailyTargets.reduce((sum, d) => sum + (parseFloat(d.target) || 0), 0);
    // Target finish date is the last planned day
    const lastDay = goal.dailyTargets[goal.dailyTargets.length - 1];
    if (lastDay && lastDay.date) {
      result.targetCompletionDate = lastDay.date;
    }
    result.hifzDays = goal.dailyTargets.length;

    // Expected progress up to today
    let expectedSoFar = 0;
    goal.dailyTargets.forEach(d => {
      if (d.date <= currentDateStr) {
        expectedSoFar += (parseFloat(d.target) || 0);
      }
    });
    result.expectedProgress = parseFloat(Math.min(targetPages, expectedSoFar).toFixed(2));
    result.progressDifference = parseFloat((completedCount - result.expectedProgress).toFixed(2));

    // Dynamic Adjusted Finish Date from today based on remaining pages
    let remainingToProject = result.remainingPages;
    let adjustedDate = currentDateStr;
    if (remainingToProject <= 0) {
      result.adjustedCompletionDate = "Completed! 🎉";
      result.daysNeededFromToday = 0;
    } else {
      let daysCount = 0;
      let dObj = new Date(currentDateStr);
      while (remainingToProject > 0.001 && daysCount < 365) {
        daysCount++;
        dObj.setDate(dObj.getDate() + 1);
        const nextDateStr = dObj.toISOString().split('T')[0];
        // Check if there is a target defined for this date
        const match = goal.dailyTargets.find(t => t.date === nextDateStr);
        const dayPace = match ? (parseFloat(match.target) || requiredPace) : requiredPace;
        remainingToProject -= dayPace;
        adjustedDate = nextDateStr;
      }
      result.daysNeededFromToday = daysCount;
      result.adjustedCompletionDate = adjustedDate;
    }
  } else {
    // Target Completion Date (original benchmark)
    const targetDays = goal.targetDays || totalHifzDays;
    result.targetCompletionDate = goal.targetEndDate || calculateProjectedEndDate(startDateStr, targetDays);
  }

  // Dynamic / Adjusted Completion Date (recalculated from today based on remaining work)
  const daysNeededFromToday = requiredPace > 0 ? Math.ceil(result.remainingPages / requiredPace) : 0;
  result.daysNeededFromToday = daysNeededFromToday;
  result.adjustedCompletionDate = result.remainingPages <= 0 
    ? "Completed! 🎉" 
    : calculateProjectedEndDate(currentDateStr, Math.max(1, daysNeededFromToday));

  result.pagesAhead = parseFloat(progressDifference.toFixed(2));
  result.daysAhead = parseFloat(progressBuffer.toFixed(1));

  if (result.goalComplete) {
    result.bufferState = 'AHEAD';
    result.bufferText = `🎉 PROJECT COMPLETE! You have finished Para ${goal.para}.`;
  } else if (result.progressDifference >= 0.5) {
    result.bufferState = 'AHEAD';
    result.bufferText = `🟢 ${Math.abs(result.progressBuffer).toFixed(1)} DAYS AHEAD (+${result.pagesAhead.toFixed(1)} p. in advance). Target pace: ${requiredPace.toFixed(2)} p/d.`;
  } else if (result.progressDifference <= -0.5) {
    result.bufferState = 'BEHIND';
    result.bufferText = `🔴 ${Math.abs(result.progressBuffer).toFixed(1)} DAYS BEHIND. Required pace: ${requiredPace.toFixed(2)} p/d.`;
  } else {
    result.bufferState = 'ON TRACK';
    result.bufferText = `🟢 ON TRACK. Target pace: ${requiredPace.toFixed(2)} pages/day.`;
  }

  result.currentPace = hifzDaysPassed > 0 ? parseFloat((completedCount / hifzDaysPassed).toFixed(2)) : 0;
  return result;
}

function getDayStatus(dateStr, goal, record, isGoalCompleted) {
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
    if (rec.isBufferDay || (rec.missed && rec.missedReason === 'break')) return;

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
  if (!goal || !goal.startPage || !goal.endPage) return points;

  const targetPages = metrics.targetPages;
  const requiredPace = metrics.requiredPace || 0.5;
  const totalDays = Math.max(1, metrics.hifzDays || Math.ceil(targetPages / requiredPace));

  // A. Plot Planned Target Line
  points.planned.push({ x: 0, y: 0 });
  let currentPlannedPages = 0;
  for (let d = 1; d <= totalDays; d++) {
    currentPlannedPages += requiredPace;
    points.planned.push({ x: d, y: parseFloat(Math.min(targetPages, currentPlannedPages).toFixed(2)) });
  }

  // B. Plot Actual Line
  const state = db.getState();
  const todayStr = state.settings.systemDateOverride || new Date().toISOString().split('T')[0];
  const startDateStr = goal.startDate || todayStr;

  let cumulativeActual = 0;
  for (let p = goal.startPage; p <= goal.endPage; p++) {
    if (state.completedPages.includes(p)) cumulativeActual++;
  }

  const daysSinceStart = Math.max(0, Math.round((new Date(todayStr) - new Date(startDateStr)) / (1000 * 60 * 60 * 24)));
  points.actual.push({ x: 0, y: 0 });
  points.actual.push({ x: Math.min(totalDays, daysSinceStart + 1), y: cumulativeActual });

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
  
  const currentCount = getTotalCompletedPagesCount(state);
  if (window.lastCompletedPagesCount === undefined) {
    window.lastCompletedPagesCount = currentCount;
  }
  const prevCount = window.lastCompletedPagesCount;
  window.lastCompletedPagesCount = currentCount;

  const prevPercent = (prevCount / 611) * 100;
  const currentPercent = (currentCount / 611) * 100;
  const circumference = 263.89;
  const initialOffset = circumference - (circumference * prevPercent / 100);
  
  // Lookup active goal dynamically
  let activeGoal = state.monthlyGoals.find(g => g.status === "active") || null;
  const goalId = activeGoal ? activeGoal.id : `goal-${todayStr}`;
  const metrics = activeGoal ? calculateMonthlyMetrics(activeGoal, state.completedPages, state.dailyRecords, todayStr, state.completedPortions || []) : null;
  const isSunday = new Date(todayStr).getDay() === 0;

  let todayRecord = state.dailyRecords[todayStr];
  if (!todayRecord) {
    todayRecord = {
      date: todayStr, monthlyGoalId: goalId, sabaq: "", sabqi: "", manzil: "",
      sabaqCompleted: false, sabqiCompleted: false, manzilCompleted: false,
      sabaqConfidence: null, sabqiConfidence: null, notes: "", sessionQuality: 0,
      missed: false, missedReason: null, isSunday, isBufferDay: metrics ? metrics.goalComplete : false
    };
  }

  // Calculate Sabaq text (with 0.5 portion precision)
  let todaySabaqText = "Para Complete! 🎉";
  let nextPortion = null;
  if (activeGoal && metrics && metrics.configured) {
    if (metrics.goalComplete) {
      todaySabaqText = "Para Complete! 🎉";
    } else {
      nextPortion = getNextSabaqPortion(activeGoal, state);
      if ((todayRecord.sabaqCompleted || todayRecord.sabaqSkipped) && todayRecord.sabaq) {
        todaySabaqText = todayRecord.sabaq;
      } else {
        if (nextPortion && nextPortion.text) {
          todaySabaqText = nextPortion.text;
          todayRecord.sabaq = todaySabaqText;
        } else {
          todaySabaqText = "Para Complete! 🎉";
        }
      }
    }
  } else if (!activeGoal) {
    todaySabaqText = "No active project set";
  }

  // Calculate Sabqi text (dynamically adjusted for advance completed pages)
  let todaySabqiText = "Revision Mode";
  if (activeGoal && metrics && metrics.configured) {
    if (metrics.goalComplete) {
      todaySabqiText = "Revision Mode";
    } else {
      if (todayRecord.sabqiCompleted && todayRecord.sabqi) {
        todaySabqiText = todayRecord.sabqi;
      } else {
        todaySabqiText = getSabqiRange(activeGoal, state);
        todayRecord.sabqi = todaySabqiText;
      }
    }
  }

  // Next Day Preview (computed dynamically to reflect advance work)
  const tomorrowNextPortion = activeGoal ? getNextSabaqPortion(activeGoal, state) : null;
  const tomorrowSabaqText = tomorrowNextPortion ? tomorrowNextPortion.text : "Para Complete! 🎉";
  const tomorrowSabqiText = activeGoal ? getSabqiRange(activeGoal, state) : "Revision Mode";

  // Calculate Manzil text (rotates through all completed Paras: e.g. 1, 2, 30)
  let todayManzilText = "Para 30";
  if (todayRecord.manzilCompleted && todayRecord.manzil) {
    todayManzilText = todayRecord.manzil;
  } else {
    const completedParas = [];
    for (let j = 1; j <= 30; j++) {
      const range = STANDARD_PARA_PAGES[j];
      let allCompleted = true;
      for (let p = range.start; p <= range.end; p++) {
        if (!state.completedPages.includes(p)) {
          allCompleted = false;
          break;
        }
      }
      if (allCompleted) completedParas.push(j);
    }
    if (completedParas.length === 0) completedParas.push(30);
    completedParas.sort((a, b) => a - b);
    const rotationIndex = day % completedParas.length;
    const targetManzilPara = completedParas[rotationIndex];
    todayManzilText = `Para ${targetManzilPara} (${STANDARD_PARA_PAGES[targetManzilPara].name})`;
    todayRecord.manzil = todayManzilText;
  }

  if (!state.dailyRecords[todayStr]) {
    state.dailyRecords[todayStr] = todayRecord;
    db.save();
  }

  // Calculate Efficiency metrics
  const activeStartDate = activeGoal ? (activeGoal.startDate || todayStr) : todayStr;
  const daysSinceGoalStart = Math.max(1, Math.round((new Date(todayStr) - new Date(activeStartDate)) / (1000 * 60 * 60 * 24)) + 1);
  const activeGoalPagesCompleted = metrics ? metrics.completedPagesCount : 0;
  
  let activeStudyDaysCount = 0;
  Object.keys(state.dailyRecords).forEach(k => {
    const r = state.dailyRecords[k];
    if (r && (r.sabaqCompleted || r.sabaqSkipped || r.sabqiCompleted || r.manzilCompleted) && !r.missed) {
      activeStudyDaysCount++;
    }
  });
  if (activeStudyDaysCount === 0) activeStudyDaysCount = 1;

  const efficiencyPace = activeGoalPagesCompleted / daysSinceGoalStart;
  const activeEfficiencyPace = activeGoalPagesCompleted / activeStudyDaysCount;
  const targetPace = activeGoal ? (activeGoal.targetPace || (metrics ? metrics.requiredPace : 0.5) || 0.5) : 0.5;
  const paceDiffPercent = targetPace > 0 ? (((efficiencyPace / targetPace) - 1) * 100) : 0;

  let bodyHtml = `
    <div class="dashboard-container">
      <!-- 1. Overall Hifz Progress at the Top -->
      <div class="card pattern-bg overall-progress-card" style="grid-column: 1 / -1;">
        <div class="flex justify-between align-center" style="margin-bottom: 16px;">
          <div class="flex align-center gap-2">
            <span style="font-size: 1.25rem;">📖</span>
            <h3 style="font-size: 1.1rem; color: var(--text-main); font-weight: 700; margin: 0;">Overall Hifz Progress</h3>
          </div>
          <span class="badge badge-active" style="background-color: var(--primary-color); color: #fff; font-size: 0.75rem; padding: 4px 10px; border-radius: 12px; font-weight: 600;">
            Full Quran (611 Pages)
          </span>
        </div>

        <div class="flex align-center gap-4" style="margin-bottom: 16px; flex-wrap: wrap;">
          <!-- Circle Progress Indicator with 1-decimal-place percentage -->
          <div style="flex-shrink: 0; width: 84px; height: 84px; display: flex; align-items: center; justify-content: center; position: relative;">
            <svg viewBox="0 0 100 100" width="84" height="84">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-color)" stroke-width="8"/>
              <circle id="overall-circle-fill" cx="50" cy="50" r="42" fill="none" stroke="var(--secondary-color)" stroke-width="8"
                      stroke-dasharray="263.89" stroke-dashoffset="${initialOffset}" stroke-linecap="round"
                      style="transition: stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1); transform: rotate(-90deg); transform-origin: 50% 50%;"/>
            </svg>
            <div id="overall-circle-text" style="position: absolute; font-family: var(--font-brand); font-size: 0.9rem; font-weight: 700; color: var(--text-main); text-align: center; width: 100%; white-space: nowrap;">
              ${prevPercent.toFixed(1)}%
            </div>
          </div>
          
          <!-- Metrics Info -->
          <div style="flex-grow: 1; min-width: 160px;">
            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Completion Rate</div>
            <div id="overall-percent-text" style="font-family: var(--font-brand); font-size: 2rem; font-weight: 800; color: var(--secondary-color); line-height: 1.1;">
              ${prevPercent.toFixed(1)}%
            </div>
          </div>

          <!-- Quick stats tiles -->
          <div class="flex gap-2" style="flex-wrap: wrap;">
            <div class="metric-tile" style="padding: 8px 16px; min-width: 120px;">
              <div class="metric-label" style="font-size: 0.7rem;">Completed</div>
              <div class="metric-val" style="font-size: 1.1rem; color: var(--text-main);">${prevCount} / 611 p.</div>
            </div>
            <div class="metric-tile" style="padding: 8px 16px; min-width: 120px;">
              <div class="metric-label" style="font-size: 0.7rem;">Juz Completed</div>
              <div class="metric-val" style="font-size: 1.1rem; color: var(--secondary-color);">${calculateJuzCompletedCount(state.completedPages)} / 30</div>
            </div>
          </div>
        </div>
        
        <!-- Horizontal Progress Bar -->
        <div class="progress-bar-wrapper" style="height: 10px; border-radius: 5px; background-color: var(--border-color); overflow: hidden; margin-bottom: 12px;">
          <div id="overall-bar-fill" class="progress-bar-fill" style="width: ${prevPercent.toFixed(1)}%; height: 100%; background-color: var(--secondary-color); transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 5px;"></div>
        </div>
        
        <div class="flex align-center justify-between" style="font-size: 0.85rem; color: var(--text-muted);">
          <span id="overall-page-count" style="font-weight: 600; font-family: var(--font-brand);">${prevCount} / 611 pages completed</span>
          <span style="font-weight: 600;">Juz: ${calculateJuzCompletedCount(state.completedPages)} / 30 (Paras 1, 2, 30 done)</span>
        </div>
      </div>

      <div class="dashboard-main-col">
  `;

  // Goal Complete Banner
  if (activeGoal && metrics && metrics.goalComplete) {
    const nextPara = activeGoal.para < 30 ? activeGoal.para + 1 : 1;
    bodyHtml += `
      <div class="card" style="background: linear-gradient(135deg, rgba(23, 107, 82, 0.12), rgba(212, 175, 55, 0.16)); border: 2px solid var(--secondary-color); padding: 20px; border-radius: var(--border-radius-md); margin-bottom: 20px;">
        <div class="flex justify-between align-center" style="flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="font-size: 1.2rem; font-weight: 800; color: var(--secondary-color); margin-bottom: 4px;">🎉 Mubarak! Para ${activeGoal.para} Completed!</div>
            <div style="font-size: 0.9rem; color: var(--text-main);">All ${metrics.targetPages} pages memorized. What would you like to memorize next?</div>
          </div>
          <button id="start-next-para-btn" class="btn btn-primary" data-next-para="${nextPara}" style="background-color: var(--secondary-color); color: #fff; font-weight: 700; padding: 10px 20px;">
            + Start Next Goal (Para ${nextPara})
          </button>
        </div>
      </div>
    `;
  }

  // Goal Card or Empty State
  if (!activeGoal) {
    bodyHtml += `
      <div class="card text-center pattern-bg" style="padding: 44px 24px; border: 2px dashed var(--border-color); margin-bottom: 20px;">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 12px;">🎯</span>
        <h2 style="color: var(--primary-color); margin-bottom: 8px;">No Active Hifz Project</h2>
        <p style="color: var(--text-muted); max-width: 480px; margin: 0 auto 20px; font-size: 1rem; line-height: 1.5;">
          Choose any Para and set your speed (e.g. 0.5 pages/day) or target duration (e.g. 30 days) to begin. You can even start a project from past dates!
        </p>
        <button id="dashboard-add-first-goal-btn" class="btn btn-primary" style="padding: 10px 24px; font-size: 1rem;">
          + Create New Project
        </button>
      </div>
    `;
  } else {
    const percentStr = metrics ? metrics.percentComplete.toFixed(0) : "0";
    const paceClass = metrics ? metrics.bufferState.toLowerCase() : "on track";
    const modeBadge = activeGoal.mode === 'duration' 
      ? `⏱️ Duration Mode (${activeGoal.targetDays || 30} days)`
      : `🎯 Pace Mode (${activeGoal.targetPace || 0.5} p/d)`;

    const isHalfPace = (activeGoal.targetPace && activeGoal.targetPace <= 0.75) || activeGoal.mode === 'pace';
    const viewMode = localStorage.getItem('mudakkir_checklist_view') || (isHalfPace ? 'half' : 'full');

    // Generate checklist of pages for this project
    // When half-pace: show per-day portion slots like "46-46.5", "46.5-47" etc.
    let projectChecklistHtml = '';
    if (isHalfPace) {
      // Build slots at the goal's targetPace increment (default 0.5)
      const slotSize = (activeGoal.targetPace && activeGoal.targetPace <= 0.75) ? activeGoal.targetPace : 0.5;
      for (let p = activeGoal.startPage; p < activeGoal.endPage - 0.001; p = Math.round((p + slotSize) * 100) / 100) {
        const pageNum = Math.floor(p);
        const halfNum = (Math.round(p * 2) % 2 === 0) ? 1 : 2; // first slot of a page -> half1, second -> half2
        const isDone  = isPortionCompleted(state, pageNum, halfNum);
        const slotEnd = Math.round((p + slotSize) * 100) / 100;
        const fromStr = Number.isInteger(p) ? String(p) : p.toFixed(1);
        const toStr   = Number.isInteger(slotEnd) ? String(slotEnd) : slotEnd.toFixed(1);
        projectChecklistHtml += `
          <div class="project-page-cell portion-cell ${isDone ? 'done' : ''}"
               data-page="${pageNum}" data-half="${halfNum}"
               title="Toggle Page ${fromStr}--${toStr}"
               style="cursor:pointer; user-select:none; border-radius:6px; padding:6px 4px; text-align:center;
                      border:1.5px solid ${isDone ? 'var(--secondary-color)' : 'var(--border-color)'};
                      background:${isDone ? 'rgba(23,107,82,0.12)' : 'var(--card-bg)'}; transition:all 0.15s ease;">
            <div style="font-size:0.6rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:2px;">Pg.</div>
            <div style="font-size:0.82rem; font-weight:700; color:${isDone ? 'var(--secondary-color)' : 'var(--text-main)'}; font-family:var(--font-brand);">${fromStr}&ndash;${toStr}</div>
            <div style="font-size:0.65rem; font-weight:bold; color:${isDone ? 'var(--secondary-color)' : 'transparent'}; margin-top:2px;">${isDone ? '&#10003; Done' : '&nbsp;'}</div>
          </div>
        `;
      }
    } else {
      for (let p = activeGoal.startPage; p <= activeGoal.endPage; p++) {
        const isDone = state.completedPages.includes(p);
        projectChecklistHtml += `
          <div class="project-page-cell ${isDone ? 'done' : ''}" data-page="${p}" title="Click to toggle Page ${p}" style="cursor: pointer; user-select: none; border-radius: 6px; padding: 6px 2px; text-align: center; border: 1.5px solid ${isDone ? 'var(--secondary-color)' : 'var(--border-color)'}; background: ${isDone ? 'rgba(23, 107, 82, 0.12)' : 'var(--card-bg)'}; transition: all 0.15s ease;">
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">P.</div>
            <div style="font-size: 0.95rem; font-weight: 700; color: ${isDone ? 'var(--secondary-color)' : 'var(--text-main)'}; font-family: var(--font-brand);">${p}</div>
            <div style="font-size: 0.7rem; font-weight: bold; color: ${isDone ? 'var(--secondary-color)' : 'transparent'}; margin-top: 1px;">
              ${isDone ? '&#10003; Done' : '&nbsp;'}
            </div>
          </div>
        `;
      }
    }

    bodyHtml += `
      <div class="card monthly-goal-card pattern-bg">
        <div class="goal-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
          <div>
            <div class="flex align-center gap-2" style="margin-bottom: 4px;">
              <span class="badge badge-active" style="background-color: var(--primary-color); color: #fff; font-size: 0.75rem; padding: 3px 8px; border-radius: 12px; font-weight: 700;">
                Active Project
              </span>
              <span class="badge" style="background: rgba(23,107,82,0.12); color: var(--secondary-color); font-size: 0.75rem; font-weight: 600;">
                ${modeBadge}
              </span>
            </div>
            <h2 class="goal-para-title">
              Para ${activeGoal.para} <span style="font-size: 1.25rem; font-weight: 500; opacity: 0.85;">(${STANDARD_PARA_PAGES[activeGoal.para]?.name || ''})</span>
            </h2>
            <div style="font-size: 0.85rem; color: var(--text-muted); font-family: var(--font-brand); margin-top: 2px;">
              Pages ${activeGoal.startPage}–${activeGoal.endPage} (${metrics.targetPages} pages)
              · Started: <strong>${activeGoal.startDate || todayStr}</strong>
              ${activeGoal.targetEndDate ? `· Projected Finish: <strong>${activeGoal.targetEndDate}</strong>` : ''}
            </div>
          </div>
          <div class="flex gap-2">
            <button id="dashboard-complex-goal-btn" class="btn btn-sm" style="background: rgba(23, 107, 82, 0.12); color: var(--secondary-color); border: 1.5px solid var(--secondary-color); font-weight: 700; padding: 4px 10px; border-radius: 6px;" data-goal-id="${activeGoal.id}">${activeGoal.isComplex ? '🧩 Daily Targets Plan' : '⚡ Promote to Complex'}</button>
            <button id="dashboard-edit-goal-btn" class="btn btn-outline btn-sm" style="color: var(--text-main); border-color: var(--border-color); font-weight: 600; padding: 4px 10px;" data-goal-id="${activeGoal.id}">Edit Project</button>
            <button id="dashboard-new-goal-btn" class="btn btn-primary btn-xs" style="background: var(--secondary-color); color: #fff;">+ New Project</button>
          </div>
        </div>

        <div class="progress-container">
          <div class="progress-bar-wrapper">
            <div class="progress-bar-fill" style="width: ${percentStr}%"></div>
          </div>
          <div class="progress-label-row">
            <span>Progress: <strong style="font-family: var(--font-brand);">${metrics.completedPagesCount.toFixed(1)} / ${metrics.targetPages} pages</strong></span>
            <span class="progress-percent">${percentStr}% Complete</span>
          </div>
        </div>

        <!-- Schedule & Completion Forecast Card (Live dynamic adjustments for advance work) -->
        <div class="forecast-card" style="background: var(--bg-color); border: 1.5px solid var(--border-color); border-radius: 10px; padding: 14px 16px; margin: 16px 0;">
          <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
            <span>📅 Completion Forecast & Schedule Stats</span>
            <span class="badge ${metrics.pagesAhead >= 0.5 ? 'badge-active' : (metrics.pagesAhead <= -0.5 ? 'badge-missed' : 'badge-neutral')}" style="font-size: 0.75rem; padding: 2px 8px;">
              ${metrics.pagesAhead >= 0.5 
                ? `⚡ ${metrics.daysAhead.toFixed(1)} Days Ahead (+${metrics.pagesAhead.toFixed(1)} p. advance)` 
                : (metrics.pagesAhead <= -0.5 
                    ? `🔴 ${Math.abs(metrics.daysAhead).toFixed(1)} Days Behind` 
                    : `🟢 On Target Schedule`)}
            </span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
            <div class="metric-tile" style="padding: 10px 12px;">
              <div class="metric-label" style="font-size: 0.7rem;">Target Finish</div>
              <div class="metric-val" style="font-size: 1.15rem; color: var(--text-main); font-family: var(--font-brand);">
                ${metrics.targetCompletionDate || '—'}
              </div>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">
                At target ${targetPace} p/d
              </div>
            </div>

            <div class="metric-tile" style="padding: 10px 12px; border-left: 3px solid var(--secondary-color);">
              <div class="metric-label" style="font-size: 0.7rem; color: var(--secondary-color);">Adjusted Finish</div>
              <div class="metric-val" style="font-size: 1.15rem; color: var(--secondary-color); font-family: var(--font-brand);">
                ${metrics.adjustedCompletionDate || '—'}
              </div>
              <div style="font-size: 0.72rem; font-weight: 600; color: ${metrics.daysAhead >= 0 ? 'var(--secondary-color)' : 'var(--color-missed)'}; margin-top: 2px;">
                ${metrics.daysAhead >= 0 ? `⚡ Pulls finish ${metrics.daysAhead.toFixed(1)}d earlier` : `Pushed ${Math.abs(metrics.daysAhead).toFixed(1)}d later`}
              </div>
            </div>

            <div class="metric-tile" style="padding: 10px 12px;">
              <div class="metric-label" style="font-size: 0.7rem;">Remaining Work</div>
              <div class="metric-val" style="font-size: 1.15rem; color: var(--text-main); font-family: var(--font-brand);">
                ${metrics.remainingPages.toFixed(1)} p.
              </div>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">
                ~${metrics.daysNeededFromToday} study days left
              </div>
            </div>

            <div class="metric-tile" style="padding: 10px 12px;">
              <div class="metric-label" style="font-size: 0.7rem;">Advance Work</div>
              <div class="metric-val" style="font-size: 1.15rem; color: ${metrics.pagesAhead > 0 ? 'var(--secondary-color)' : 'var(--text-main)'}; font-family: var(--font-brand);">
                ${metrics.pagesAhead > 0 ? `+${metrics.pagesAhead.toFixed(1)} p.` : `${metrics.pagesAhead.toFixed(1)} p.`}
              </div>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">
                ${metrics.pagesAhead > 0 ? 'Ahead of baseline' : 'On baseline'}
              </div>
            </div>
          </div>

          <!-- Dynamic Tomorrow Preview -->
          <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 0.8rem;">
            <div>
              <span style="font-weight: 700; color: var(--primary-color);">🌅 Tomorrow's Sabaq:</span>
              <span style="color: var(--text-main); margin-left: 4px;"><strong>${tomorrowSabaqText}</strong></span>
            </div>
            <div>
              <span style="font-weight: 700; color: var(--primary-color);">🔄 Tomorrow's Sabqi:</span>
              <span style="color: var(--text-main); margin-left: 4px;"><strong>${tomorrowSabqiText}</strong></span>
            </div>
          </div>
        </div>

        <!-- Interactive Project Portion / Page Grid -->
        <div class="project-checklist-box" style="background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 8px; padding: 14px; margin: 16px 0;">
          <div class="flex justify-between align-center" style="margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
            <div class="flex align-center gap-2">
              <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-main);">Project Pages Checklist</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">(Click portion to tick / untick)</span>
            </div>
            <div class="flex gap-2 align-center" style="flex-wrap: wrap;">
              <div class="view-toggle-pills" style="display: flex; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 6px; padding: 2px;">
                <button id="view-mode-half-btn" class="btn btn-xs ${viewMode === 'half' ? 'btn-primary' : 'btn-text'}" style="font-size: 0.72rem; padding: 2px 8px; ${viewMode === 'half' ? 'background: var(--secondary-color); color: #fff;' : ''}">0.5p Halves</button>
                <button id="view-mode-full-btn" class="btn btn-xs ${viewMode === 'full' ? 'btn-primary' : 'btn-text'}" style="font-size: 0.72rem; padding: 2px 8px; ${viewMode === 'full' ? 'background: var(--secondary-color); color: #fff;' : ''}">1p Pages</button>
              </div>
              <button id="dashboard-project-tick-next-btn" class="btn btn-secondary btn-xs" style="font-size: 0.75rem; padding: 3px 8px;">+ Tick Next 0.5p</button>
              <button id="dashboard-project-toggle-all-btn" class="btn btn-outline btn-xs" style="font-size: 0.75rem; padding: 2px 8px;">
                ${metrics.completedPagesCount >= metrics.targetPages ? 'Untick All' : 'Tick All Completed'}
              </button>
            </div>
          </div>
          <div class="project-page-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(${isHalfPace ? '80px' : '58px'}, 1fr)); gap: 6px;">
            ${projectChecklistHtml}
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
            <div class="metric-val">${metrics.remainingPages.toFixed(1)} p.</div>
          </div>
          <div class="metric-tile">
            <div class="metric-label">Required Pace</div>
            <div class="metric-val">${metrics.requiredPace.toFixed(2)} p/d</div>
          </div>
          <div class="metric-tile">
            <div class="metric-label">Days Left</div>
            <div class="metric-val">${metrics.hifzDaysRemaining} d.</div>
          </div>
          <div class="metric-tile">
            <div class="metric-label">Target Days</div>
            <div class="metric-val">${activeGoal.targetDays || metrics.hifzDays} d.</div>
          </div>
          <div class="metric-tile">
            <div class="metric-label">Start Date</div>
            <div class="metric-val" style="font-size: 0.95rem;">${activeGoal.startDate || todayStr}</div>
          </div>
        </div>
      </div>
    `;
  }

  // Memorization Efficiency Card
  bodyHtml += `
    <div class="card efficiency-card pattern-bg" style="border-left: 4px solid var(--secondary-color); background: linear-gradient(135deg, rgba(23, 107, 82, 0.04) 0%, rgba(212, 175, 55, 0.04) 100%); margin-bottom: 20px;">
      <div class="flex justify-between align-center" style="margin-bottom: 12px;">
        <div class="flex align-center gap-2">
          <span style="font-size: 1.25rem;">⚡</span>
          <h3 style="font-size: 1rem; color: var(--text-main); font-weight: 700; margin: 0;">Memorization Efficiency</h3>
        </div>
        <span class="badge badge-active" style="background-color: var(--secondary-color); color: #fff; font-size: 0.75rem; padding: 3px 8px; border-radius: 12px; font-weight: 600;">
          ${activeGoal ? `Para ${activeGoal.para}` : 'Daily Pace'}
        </span>
      </div>

      <div class="flex align-center justify-between" style="flex-wrap: wrap; gap: 16px;">
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Efficiency Rate</div>
          <div style="display: flex; align-items: baseline; gap: 6px; margin-top: 2px;">
            <span style="font-family: var(--font-brand); font-size: 2.2rem; font-weight: 800; color: var(--secondary-color); line-height: 1;">
              ${efficiencyPace.toFixed(2)}
            </span>
            <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">pages / day</span>
          </div>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <div class="metric-tile" style="padding: 8px 12px; min-width: 95px;">
            <div class="metric-label" style="font-size: 0.7rem;">Pages Done</div>
            <div class="metric-val" style="font-size: 1.1rem; color: var(--text-main);">${activeGoalPagesCompleted} p.</div>
          </div>
          <div class="metric-tile" style="padding: 8px 12px; min-width: 95px;">
            <div class="metric-label" style="font-size: 0.7rem;">Days Elapsed</div>
            <div class="metric-val" style="font-size: 1.1rem; color: var(--text-main);">${daysSinceGoalStart} d.</div>
          </div>
          <div class="metric-tile" style="padding: 8px 12px; min-width: 105px;">
            <div class="metric-label" style="font-size: 0.7rem;">Active Pace</div>
            <div class="metric-val" style="font-size: 1.1rem; color: var(--secondary-color);">${activeEfficiencyPace.toFixed(2)} p/d</div>
          </div>
        </div>
      </div>

      <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed var(--border-color); display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-muted); flex-wrap: wrap; gap: 8px;">
        <span>
          🎯 Target Pace: <strong style="color: var(--text-main);">${targetPace.toFixed(2)} p/d</strong>
        </span>
        <span style="color: ${efficiencyPace >= targetPace ? 'var(--secondary-color)' : 'var(--color-missed)'}; font-weight: 600;">
          ${efficiencyPace >= targetPace 
            ? `🟢 +${paceDiffPercent.toFixed(0)}% Above Target Pace` 
            : `🔴 ${paceDiffPercent.toFixed(0)}% Below Target Pace`}
        </span>
      </div>
    </div>
  `;

  // Today's Tasks
  bodyHtml += `
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
                             <div class="task-skipped-pill" style="background-color: rgba(240, 173, 78, 0.1); color: var(--color-partial); border: 1px solid var(--color-partial); padding: 4px 10px; border-radius: 20px; font-weight: 600; font-size: 0.8rem; line-height: 1.2;">⚠️ Skipped</div>
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
                  if (todayRecord.sabaqCompleted && activeGoal) {
                    const nxtAdv = getNextSabaqPortion(activeGoal, state);
                    if (nxtAdv && nxtAdv.page) {
                      return `
                        <div style="margin-top: 12px; border-top: 1px dashed var(--border-color); padding-top: 8px; font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 6px;">
                          <span style="color: var(--text-muted);">⚡ Finished early? Log next portion in advance: <strong>${nxtAdv.shortLabel}</strong></span>
                          <button id="dashboard-advance-sabaq-btn" class="btn btn-outline btn-xs" style="color: var(--secondary-color); border-color: var(--secondary-color); font-size: 0.75rem; padding: 3px 8px;">+ Log 0.5p in Advance</button>
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

            ${metrics && metrics.goalComplete ? `<div class="day-banner day-banner-buffer">🔵 Buffer Day: Target complete! Use today for revision.</div>` : ''}
            
            ${(!metrics || !metrics.goalComplete) && !todayRecord.sabaqCompleted && !todayRecord.sabqiCompleted && !todayRecord.manzilCompleted && !todayRecord.missed
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
            <h3 style="font-size: 1rem; color: var(--text-main); font-weight: 600; margin-bottom: 12px;">${getMonthName(month)} Calendar</h3>
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
        </div>
      </div>
    `;

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
        
        if (circleText) circleText.innerText = `${val.toFixed(1)}%`;
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
      if (circleText) circleText.innerText = `${currentPercent.toFixed(1)}%`;
      if (percentText) percentText.innerText = `${currentPercent.toFixed(1)}%`;
      if (pageCount) pageCount.innerText = `${currentCount} / 611 pages completed`;
    }, 50);
  }

  // Event handlers
  const editGoalBtn = document.getElementById('dashboard-edit-goal-btn');
  if (editGoalBtn) editGoalBtn.onclick = () => openRoadmapEditModal(editGoalBtn.dataset.goalId);

  const complexGoalBtn = document.getElementById('dashboard-complex-goal-btn');
  if (complexGoalBtn) complexGoalBtn.onclick = () => openComplexProjectModal(complexGoalBtn.dataset.goalId);

  const newGoalBtn = document.getElementById('dashboard-new-goal-btn');
  if (newGoalBtn) newGoalBtn.onclick = () => openRoadmapEditModal(null);

  const addFirstGoalBtn = document.getElementById('dashboard-add-first-goal-btn');
  if (addFirstGoalBtn) addFirstGoalBtn.onclick = () => openRoadmapEditModal(null);

  // Project checklist portion cell click handlers (0.5 page basis)
  document.querySelectorAll('.portion-cell').forEach(cell => {
    cell.onclick = () => {
      const pageNum = parseInt(cell.dataset.page, 10);
      const halfNum = parseInt(cell.dataset.half, 10);
      const wasDone = togglePagePortion(state, pageNum, halfNum);
      db.save();
      if (wasDone) {
        showToast(`Page ${pageNum} (${halfNum === 1 ? '1st' : '2nd'} Half · 0.5p) marked completed! ✓`, "success");
      } else {
        showToast(`Page ${pageNum} (${halfNum === 1 ? '1st' : '2nd'} Half) unticked.`, "info");
      }
      renderDashboard(container);
    };
  });

  // Project checklist full page cell click handlers (only for full-page mode cells)
  document.querySelectorAll('.project-page-cell:not(.portion-cell)').forEach(cell => {
    cell.onclick = () => {
      const pageNum = parseInt(cell.dataset.page, 10);
      const idx = state.completedPages.indexOf(pageNum);
      if (idx !== -1) {
        state.completedPages.splice(idx, 1);
        if (state.completedPortions) {
          state.completedPortions = state.completedPortions.filter(k => !k.startsWith(`${pageNum}_`));
        }
        db.save();
        showToast(`Page ${pageNum} unticked.`, "info");
      } else {
        state.completedPages.push(pageNum);
        state.completedPages.sort((a, b) => a - b);
        if (state.completedPortions) {
          state.completedPortions = state.completedPortions.filter(k => !k.startsWith(`${pageNum}_`));
        }
        db.save();
        showToast(`Page ${pageNum} marked completed! ✓`, "success");
      }
      renderDashboard(container);
    };
  });

  // View Mode switcher
  const viewHalfBtn = document.getElementById('view-mode-half-btn');
  if (viewHalfBtn) {
    viewHalfBtn.onclick = () => {
      localStorage.setItem('mudakkir_checklist_view', 'half');
      renderDashboard(container);
    };
  }
  const viewFullBtn = document.getElementById('view-mode-full-btn');
  if (viewFullBtn) {
    viewFullBtn.onclick = () => {
      localStorage.setItem('mudakkir_checklist_view', 'full');
      renderDashboard(container);
    };
  }

  // Tick Next 0.5p button
  const tickNextBtn = document.getElementById('dashboard-project-tick-next-btn');
  if (tickNextBtn && activeGoal) {
    tickNextBtn.onclick = () => {
      const nxt = getNextSabaqPortion(activeGoal, state);
      if (nxt && nxt.page) {
        togglePagePortion(state, nxt.page, nxt.half);
        db.save();
        showToast(`Page ${nxt.page} (${nxt.half === 1 ? '1st' : '2nd'} Half · 0.5p) completed! ⚡`, "success");
        renderDashboard(container);
      } else {
        showToast("All pages in this project are already completed! 🎉", "info");
      }
    };
  }

  // Advance Sabaq button (on today's task card)
  const advanceSabaqBtn = document.getElementById('dashboard-advance-sabaq-btn');
  if (advanceSabaqBtn && activeGoal) {
    advanceSabaqBtn.onclick = () => {
      const nxt = getNextSabaqPortion(activeGoal, state);
      if (nxt && nxt.page) {
        togglePagePortion(state, nxt.page, nxt.half);
        todayRecord.sabaqCompleted = true;
        todayRecord.sabaq = `${nxt.text} (Advance)`;
        db.saveDailyRecord(todayStr, todayRecord);
        showToast(`⚡ 0.5 Page logged in advance! Adjusted finish date pulled earlier and Sabqi updated!`, "success");
        renderDashboard(container);
      } else {
        showToast("Project already complete! 🎉", "info");
      }
    };
  }

  const toggleAllBtn = document.getElementById('dashboard-project-toggle-all-btn');
  if (toggleAllBtn && activeGoal) {
    toggleAllBtn.onclick = () => {
      const allDone = metrics.completedPagesCount >= metrics.targetPages;
      if (allDone) {
        if (confirm(`Untick all pages in Para ${activeGoal.para}?`)) {
          state.completedPages = state.completedPages.filter(p => p < activeGoal.startPage || p > activeGoal.endPage);
          if (state.completedPortions) {
            state.completedPortions = state.completedPortions.filter(item => {
              const p = parseInt(item.split('_')[0], 10);
              return p < activeGoal.startPage || p > activeGoal.endPage;
            });
          }
          db.save();
          showToast(`All pages in Para ${activeGoal.para} unticked.`, "info");
          renderDashboard(container);
        }
      } else {
        for (let p = activeGoal.startPage; p <= activeGoal.endPage; p++) {
          if (!state.completedPages.includes(p)) state.completedPages.push(p);
        }
        state.completedPages.sort((a, b) => a - b);
        if (state.completedPortions) {
          state.completedPortions = state.completedPortions.filter(item => {
            const p = parseInt(item.split('_')[0], 10);
            return p < activeGoal.startPage || p > activeGoal.endPage;
          });
        }
        db.save();
        showToast(`All pages in Para ${activeGoal.para} marked completed! 🎉`, "success");
        renderDashboard(container);
      }
    };
  }

  const startNextParaBtn = document.getElementById('start-next-para-btn');
  if (startNextParaBtn) {
    startNextParaBtn.onclick = () => {
      const nextP = parseInt(startNextParaBtn.dataset.nextPara, 10);
      openRoadmapEditModal(null, nextP);
    };
  }

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

  renderCalendarGrid(activeGoal, state.dailyRecords, todayStr, metrics ? metrics.goalComplete : false);
  if (activeGoal && metrics && metrics.configured) {
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

  const [currYear, currMonth] = activeDateStr.split('-').map(Number);
  const firstDayIndex = new Date(currYear, currMonth - 1, 1).getDay();
  const daysInMonth = new Date(currYear, currMonth, 0).getDate();
  const isPaceHalf = goal && (goal.targetPace <= 0.75 || goal.mode === 'pace');

  for (let i = 0; i < firstDayIndex; i++) {
    gridContainer.appendChild(document.createElement('div'));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${currYear}-${String(currMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const record = dailyRecords[dateKey];
    const statusMeta = getDayStatus(dateKey, goal, record, isGoalCompleted);

    const cell = document.createElement('div');
    cell.className = `calendar-cell ${statusMeta.status === 'sunday' ? 'cell-sunday' : ''} ${dateKey === activeDateStr ? 'active-day' : ''}`;
    cell.style.display = 'flex';
    cell.style.flexDirection = 'column';
    cell.style.alignItems = 'center';
    cell.style.justifyContent = 'center';
    cell.style.padding = '2px';
    cell.style.position = 'relative';

    const dayNum = document.createElement('span');
    dayNum.innerText = d;
    cell.appendChild(dayNum);

    // If sabaq completed on this date, show the portion badge (0.5 vs 1.0)
    if (record && record.sabaqCompleted) {
      const pill = document.createElement('span');
      pill.className = 'cal-portion-pill';
      const isHalf = record.sabaq && (record.sabaq.includes('0.5') || record.sabaq.includes('Half'));
      pill.innerText = isHalf ? '0.5' : '1.0';
      cell.appendChild(pill);
    } else if (dateKey === activeDateStr && isPaceHalf && (!record || !record.sabaqCompleted)) {
      const pill = document.createElement('span');
      pill.className = 'cal-portion-pill';
      pill.style.opacity = '0.6';
      pill.style.background = 'transparent';
      pill.style.border = '1px dashed var(--secondary-color)';
      pill.innerText = '0.5p';
      cell.appendChild(pill);
    }

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
  const totalDays = Math.max(1, metrics.hifzDays || 30);
  const targetPages = Math.max(1, metrics.targetPages || 20);

  const xScale = (day) => padding + (day / totalDays) * (width - 2 * padding);
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

// B. PROJECT HUB VIEW
function renderProjectHub(container) {
  const state = db.getState();
  const todayStr = state.settings.systemDateOverride || new Date().toISOString().split('T')[0];

  const currentGoal = state.monthlyGoals.find(g => g.status === "active") || null;
  const pastGoals = state.monthlyGoals.filter(g => g.status === "completed");
  const futureGoals = state.monthlyGoals.filter(g => g.status === "future");

  const totalPagesCompleted = state.completedPages.length;
  const totalPages = state.settings.mushafPages || 611;
  const projection = calculateProjection(state, Math.max(0, totalPages - totalPagesCompleted));

  container.innerHTML = `
    <div class="plan-container">
      <div class="dashboard-main-col">
        <!-- Project Hub Header Banner -->
        <div class="card pattern-bg">
          <div class="flex justify-between align-center" style="margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
            <div>
              <h2 style="color: var(--primary-color); margin: 0 0 4px; font-size: 1.4rem;">Project Hub</h2>
              <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0;">Manage ongoing projects, schedule upcoming goals, and view completed history.</p>
            </div>
            <button id="project-hub-create-btn" class="btn btn-primary" style="padding: 8px 16px;">+ Create New Project</button>
          </div>

          <div class="dashboard-grid" style="margin-bottom: 16px;">
            <div class="metric-tile">
              <div class="metric-label">Hifz Progress</div>
              <div class="metric-val" style="font-size: 1.4rem;">${totalPagesCompleted} / ${totalPages}</div>
              <div style="font-size: 0.8rem; font-weight: bold; color: var(--secondary-color); margin-top: 4px;">${((totalPagesCompleted/totalPages)*100).toFixed(1)}% Completed</div>
            </div>
            <div class="metric-tile">
              <div class="metric-label">Juz Completed</div>
              <div class="metric-val" style="font-size: 1.4rem;">${projection.juzCompleted} / 30</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Milestones finished</div>
            </div>
          </div>
          <div style="border-top: 1px solid var(--border-color); padding-top: 14px;">
            <div class="buffer-status-banner ${projection.onTrack ? 'ahead' : 'behind'}" style="margin-bottom: 0; padding: 12px 16px;">
              <div>
                <div style="font-weight: 700; margin-bottom: 2px;">PROJECTED COMPLETION: ${projection.projectedDate}</div>
                <div style="font-size: 0.8rem; opacity: 0.95;">${projection.message}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Current Ongoing Project -->
        <div class="card">
          <div class="section-title">
            <span>Current Ongoing Project</span>
            ${currentGoal ? `<button id="project-hub-adjust-btn" class="section-subtitle-btn" data-goal-id="${currentGoal.id}">Edit Project</button>` : ''}
          </div>
          ${currentGoal ? renderGoalCardHtml(currentGoal, state.completedPages, state.dailyRecords, todayStr) : `
            <div class="text-center" style="padding: 36px 16px; border: 2px dashed var(--border-color); border-radius: 8px;">
              <span style="font-size: 2.2rem; display: block; margin-bottom: 8px;">🎯</span>
              <h4 style="color: var(--text-main); margin-bottom: 6px;">No Active Project Running</h4>
              <p style="color: var(--text-muted); font-size: 0.85rem; max-width: 420px; margin: 0 auto 16px;">
                You haven't set an ongoing project yet. Start a project now for any Para, set your speed or duration, and pick a start date (even in past dates).
              </p>
              <button id="project-hub-first-btn" class="btn btn-primary btn-sm">+ Start a Project</button>
            </div>
          `}
        </div>

        <!-- Project History: Completed Projects -->
        <div class="card">
          <div class="section-title">
            <span>Project History (Completed)</span>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${pastGoals.length} completed</span>
          </div>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left;">
              <thead>
                <tr style="border-bottom: 2px solid var(--border-color); color: var(--text-muted); font-size: 0.8rem;">
                  <th style="padding: 10px 8px;">Para</th>
                  <th style="padding: 10px 8px;">Range</th>
                  <th style="padding: 10px 8px;">Target</th>
                  <th style="padding: 10px 8px;">Completed Pages</th>
                  <th style="padding: 10px 8px;">Status</th>
                  <th style="padding: 10px 8px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${pastGoals.length === 0 ? `<tr><td colspan="6" style="padding: 20px; text-align: center; color: var(--text-muted);">No completed projects yet.</td></tr>` : pastGoals.map(g => {
                  const m = calculateMonthlyMetrics(g, state.completedPages, state.dailyRecords, todayStr);
                  const modeStr = g.mode === 'duration' ? `${g.targetDays || 30} days` : `${g.targetPace || 0.5} p/d`;
                  return `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                      <td style="padding: 12px 8px; font-weight: 600; color: var(--primary-color);">Para ${g.para} <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-muted);">(${STANDARD_PARA_PAGES[g.para]?.name || ''})</span></td>
                      <td style="padding: 12px 8px; font-family: var(--font-brand);">${g.startPage ? `${g.startPage}–${g.endPage}` : '—'}</td>
                      <td style="padding: 12px 8px; font-size: 0.8rem; color: var(--text-muted);">${modeStr}</td>
                      <td style="padding: 12px 8px; font-family: var(--font-brand);">${m.completedPagesCount} / ${m.targetPages || 0}</td>
                      <td style="padding: 12px 8px;"><span class="badge badge-${g.status}">${g.status}</span></td>
                      <td style="padding: 12px 8px; text-align: right;">
                        <button class="btn btn-outline btn-xs edit-roadmap-goal-btn" data-goal-id="${g.id}">Edit</button>
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
        <!-- Upcoming Projects Queue -->
        <div class="card">
          <div class="section-title">
            <span>Upcoming Projects</span>
            <button id="project-hub-add-upcoming-btn" class="btn btn-primary btn-xs">+ Add</button>
          </div>
          <div class="roadmap-list">
            ${futureGoals.length === 0 ? `
              <p style="color: var(--text-muted); font-size: 0.85rem; padding: 12px 0;">No upcoming projects queued. Click <strong>+ Add</strong> to queue up your next Para (e.g. Para 4).</p>
            ` : futureGoals.map(g => {
              const configured = g.startPage && g.endPage;
              const rangeStr = configured ? `Pages ${g.startPage}–${g.endPage}` : 'Page range not configured';
              const modeLabel = g.mode === 'duration' ? `Duration: ${g.targetDays || 30} days` : `Pace: ${g.targetPace || 0.5} p/d`;
              return `
                <div class="roadmap-item" style="display: flex; flex-direction: column; gap: 8px;">
                  <div class="roadmap-month-info">
                    <span class="roadmap-month-target" style="font-size: 1rem; font-weight: 700;">Para ${g.para} <span style="font-size: 0.85rem; font-weight: normal; color: var(--text-muted);">(${STANDARD_PARA_PAGES[g.para]?.name || ''})</span></span>
                    <span class="roadmap-month-pages" style="color: ${configured ? 'var(--text-muted)' : 'var(--color-missed)'}">${rangeStr} · ${modeLabel}</span>
                    ${g.startDate ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Start: ${g.startDate}</div>` : ''}
                  </div>
                  <div class="flex gap-2 justify-between align-center" style="margin-top: 4px;">
                    <button class="btn btn-secondary btn-xs activate-project-btn" data-goal-id="${g.id}">▶ Activate</button>
                    <div class="flex gap-1">
                      <button class="btn btn-outline btn-xs edit-roadmap-goal-btn" data-goal-id="${g.id}">Edit</button>
                      <button class="btn btn-text btn-xs delete-project-btn" data-goal-id="${g.id}" style="color: var(--color-missed); font-size: 0.75rem;">Delete</button>
                    </div>
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
  document.querySelectorAll('.complex-roadmap-goal-btn').forEach(btn => {
    btn.onclick = () => openComplexProjectModal(btn.dataset.goalId);
  });

  document.querySelectorAll('.edit-roadmap-goal-btn').forEach(btn => {
    btn.onclick = () => openRoadmapEditModal(btn.dataset.goalId);
  });
  document.querySelectorAll('.activate-project-btn').forEach(btn => {
    btn.onclick = () => {
      const gid = btn.dataset.goalId;
      state.monthlyGoals.forEach(g => {
        if (g.id === gid) g.status = "active";
        else if (g.status === "active") g.status = "future";
      });
      db.save();
      showToast("Project activated!", "success");
      initRouter();
    };
  });
  document.querySelectorAll('.delete-project-btn').forEach(btn => {
    btn.onclick = () => {
      const gid = btn.dataset.goalId;
      if (confirm("Delete this upcoming project?")) {
        db.deleteGoal(gid);
        showToast("Project removed.", "info");
        initRouter();
      }
    };
  });
  const hubCreateBtn = document.getElementById('project-hub-create-btn');
  if (hubCreateBtn) hubCreateBtn.onclick = () => openRoadmapEditModal(null);
  const hubFirstBtn = document.getElementById('project-hub-first-btn');
  if (hubFirstBtn) hubFirstBtn.onclick = () => openRoadmapEditModal(null);
  const hubUpcomingBtn = document.getElementById('project-hub-add-upcoming-btn');
  if (hubUpcomingBtn) hubUpcomingBtn.onclick = () => openRoadmapEditModal(null);
  const hubAdjustBtn = document.getElementById('project-hub-adjust-btn');
  if (hubAdjustBtn) hubAdjustBtn.onclick = () => openRoadmapEditModal(hubAdjustBtn.dataset.goalId);
  const planCardNewGoalBtn = document.getElementById('plan-card-new-goal-btn');
  if (planCardNewGoalBtn) planCardNewGoalBtn.onclick = () => openRoadmapEditModal(null);

  // Hook up page checklist in Project Hub (supporting full pages and half-page portions)
  document.querySelectorAll('.hub-page-cell').forEach(cell => {
    cell.onclick = () => {
      const pageNum = parseInt(cell.dataset.page, 10);
      if (cell.classList.contains('portion-cell')) {
        const halfNum = parseInt(cell.dataset.half, 10);
        const wasDone = togglePagePortion(state, pageNum, halfNum);
        db.save();
        if (wasDone) {
          showToast(`Page ${pageNum} (${halfNum === 1 ? '1st' : '2nd'} Half · 0.5p) marked completed! ✓`, 'success');
        } else {
          showToast(`Page ${pageNum} (${halfNum === 1 ? '1st' : '2nd'} Half) unticked.`, 'info');
        }
      } else {
        const idx = state.completedPages.indexOf(pageNum);
        if (idx !== -1) {
          state.completedPages.splice(idx, 1);
          if (state.completedPortions) {
            state.completedPortions = state.completedPortions.filter(k => !k.startsWith(`${pageNum}_`));
          }
          db.save();
          showToast(`Page ${pageNum} unticked.`, 'info');
        } else {
          state.completedPages.push(pageNum);
          state.completedPages.sort((a, b) => a - b);
          if (state.completedPortions) {
            state.completedPortions = state.completedPortions.filter(k => !k.startsWith(`${pageNum}_`));
          }
          db.save();
          showToast(`Page ${pageNum} marked completed! ✓`, 'success');
        }
      }
      renderProjectHub(container);
    };
  });
}

const renderPlan = renderProjectHub;

function renderGoalCardHtml(goal, completedPages, dailyRecords, todayStr) {
  const metrics = calculateMonthlyMetrics(goal, completedPages, dailyRecords, todayStr);
  const percentStr = metrics.percentComplete.toFixed(0);
  const modeBadge = goal.mode === 'duration' ? `Duration: ${goal.targetDays || 30} days` : `Pace: ${goal.targetPace || 0.5} p/d`;
  const isHalfPace = (goal.targetPace && goal.targetPace <= 0.75) || goal.mode === 'pace';

  let pagesHtml = '';
  if (isHalfPace) {
    const slotSize = (goal.targetPace && goal.targetPace <= 0.75) ? goal.targetPace : 0.5;
    for (let p = goal.startPage; p < goal.endPage - 0.001; p = Math.round((p + slotSize) * 100) / 100) {
      const pageNum = Math.floor(p);
      const halfNum = (Math.round(p * 2) % 2 === 0) ? 1 : 2;
      const isDone = isPortionCompleted(db.getState(), pageNum, halfNum);
      const slotEnd = Math.round((p + slotSize) * 100) / 100;
      const fromStr = Number.isInteger(p) ? String(p) : p.toFixed(1);
      const toStr   = Number.isInteger(slotEnd) ? String(slotEnd) : slotEnd.toFixed(1);
      pagesHtml += `
        <div class="hub-page-cell portion-cell ${isDone ? 'done' : ''}" data-page="${pageNum}" data-half="${halfNum}" title="Toggle Page ${fromStr}--${toStr}" style="cursor: pointer; user-select: none; border-radius: 6px; padding: 6px 4px; text-align: center; border: 1.5px solid ${isDone ? 'var(--secondary-color)' : 'var(--border-color)'}; background: ${isDone ? 'rgba(23, 107, 82, 0.12)' : 'var(--bg-color)'}; transition: all 0.15s ease;">
          <div style="font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px;">Pg.</div>
          <div style="font-size: 0.82rem; font-weight: 700; color: ${isDone ? 'var(--secondary-color)' : 'var(--text-main)'}; font-family: var(--font-brand);">${fromStr}&ndash;${toStr}</div>
          <div style="font-size: 0.65rem; font-weight: bold; color: ${isDone ? 'var(--secondary-color)' : 'transparent'}; margin-top: 2px;">${isDone ? '&#10003; Done' : '&nbsp;'}</div>
        </div>
      `;
    }
  } else {
    for (let p = goal.startPage; p <= goal.endPage; p++) {
      const isDone = completedPages.includes(p);
      pagesHtml += `
        <div class="hub-page-cell ${isDone ? 'done' : ''}" data-page="${p}" title="Click to toggle Page ${p}" style="cursor: pointer; user-select: none; border-radius: 6px; padding: 6px 2px; text-align: center; border: 1.5px solid ${isDone ? 'var(--secondary-color)' : 'var(--border-color)'}; background: ${isDone ? 'rgba(23, 107, 82, 0.12)' : 'var(--bg-color)'}; transition: all 0.15s ease;">
          <div style="font-size: 0.65rem; color: var(--text-muted);">P.</div>
          <div style="font-size: 0.95rem; font-weight: 700; color: ${isDone ? 'var(--secondary-color)' : 'var(--text-main)'}; font-family: var(--font-brand);">${p}</div>
          <div style="font-size: 0.7rem; font-weight: bold; color: ${isDone ? 'var(--secondary-color)' : 'transparent'}; margin-top: 1px;">
            ${isDone ? '&#10003; Done' : '&nbsp;'}
          </div>
        </div>
      `;
    }
  }

  return `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
      <div>
        <h4 style="font-size: 1.25rem; color: var(--primary-color); font-weight: 700; margin-bottom: 2px;">
          Para ${goal.para} <span style="font-size: 0.95rem; font-weight: normal; color: var(--text-muted);">(${STANDARD_PARA_PAGES[goal.para]?.name || ''})</span>
        </h4>
        <span style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-brand);">Range: Pages ${goal.startPage}–${goal.endPage} (${metrics.targetPages} p.) · ${modeBadge}</span>
        ${goal.startDate ? `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">Started: <strong>${goal.startDate}</strong> ${goal.targetEndDate ? `· Projected Finish: <strong>${goal.targetEndDate}</strong>` : ''}</div>` : ''}
      </div>
      <div style="text-align: right;"><span class="badge badge-${goal.status}">${goal.status.toUpperCase()}</span></div>
    </div>
    <div class="progress-container">
      <div class="progress-bar-wrapper" style="height: 8px;"><div class="progress-bar-fill" style="width: ${percentStr}%"></div></div>
      <div class="progress-label-row"><span>Progress: <strong>${metrics.completedPagesCount}/${metrics.targetPages} p.</strong></span><span>${percentStr}%</span></div>
    </div>

    <!-- Interactive Checklist inside Project Hub -->
    <div style="background: var(--bg-color); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin: 12px 0;">
      <div class="flex justify-between align-center" style="margin-bottom: 8px;">
        <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-main);">Project Pages Checklist</span>
        <span style="font-size: 0.75rem; color: var(--text-muted);">Click any page to toggle</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(${isHalfPace ? "80px" : "58px"}, 1fr)); gap: 6px;">
        ${pagesHtml}
      </div>
    </div>

    <div class="flex gap-2" style="margin-top: 14px;">
      <button class="btn btn-outline btn-xs complex-roadmap-goal-btn" data-goal-id="${goal.id}">${goal.isComplex ? '🧩 Custom Targets' : '⚡ Promote to Complex'}</button>
      <button class="btn btn-primary btn-xs edit-roadmap-goal-btn" data-goal-id="${goal.id}">Adjust Project</button>
      <button class="btn btn-outline btn-xs" id="plan-card-new-goal-btn">+ Add Next Goal</button>
    </div>
  `;
}

function calculateProjection(state, remainingPages) {
  let juzCompleted = calculateJuzCompletedCount(state.completedPages);

  const activeGoal = state.monthlyGoals.find(g => g.status === "active");
  const targetPace = activeGoal ? (activeGoal.targetPace || 0.5) : 0.5;
  const ratePerMonth = targetPace * 30; // 30 active days per month (normal Sundays)

  const today = new Date(state.settings.systemDateOverride || new Date().toISOString().split('T')[0]);
  const daysNeeded = Math.ceil(remainingPages / (targetPace || 0.5));
  const projectedDateObj = new Date(today);
  projectedDateObj.setDate(projectedDateObj.getDate() + daysNeeded);
  const projectedDateText = `${getMonthName(projectedDateObj.getMonth() + 1)} ${projectedDateObj.getFullYear()}`;

  const message = `Projected completion by **${projectedDateText}** at target pace of **${targetPace} pages/day** (~${Math.round(ratePerMonth)} p/month).`;

  return {
    juzCompleted,
    projectedDate: remainingPages === 0 ? "Completed 🎉" : projectedDateText,
    onTrack: true,
    message
  };
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
  
  const activeGoal = state.monthlyGoals.find(g => g.status === "active") || null;
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
    const startDay = 1;
    const [cYear, cMonth] = todayStr.split('-').map(Number);
    const calendarDays = new Date(cYear, cMonth, 0).getDate();
    
    for (let d = startDay; d <= calendarDays; d++) {
      const dateStr = `${cYear}-${String(cMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const rec = state.dailyRecords[dateStr] || {
        date: dateStr, monthlyGoalId: activeGoal.id, sabaq: "", sabqi: "", manzil: "",
        sabaqCompleted: false, sabqiCompleted: false, manzilCompleted: false,
        sabaqConfidence: null, sabqiConfidence: null, notes: "", sessionQuality: 0,
        missed: false, missedReason: null, isSunday: new Date(cYear, cMonth - 1, d).getDay() === 0, isBufferDay: false
      };
      
      const isSunday = rec.isSunday;
      const dayNum = d;
      const dateObj = new Date(cYear, cMonth - 1, d);
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
  const syncCfg  = (typeof getSavedSyncConfig !== 'undefined') ? getSavedSyncConfig() : null;
  const syncUser = (typeof getSavedUserId    !== 'undefined') ? getSavedUserId()     : '';
  const syncOn   = (typeof isSyncEnabled    !== 'undefined') ? isSyncEnabled()      : false;
  const syncSt   = (typeof getSyncStatus    !== 'undefined') ? getSyncStatus()      : 'idle';

  const statusColor = { ok: '#16a34a', error: '#dc2626', syncing: '#d97706', idle: 'var(--text-muted)' }[syncSt] || 'var(--text-muted)';
  const statusLabel = { ok: '✅ Connected', error: '❌ Error', syncing: '⏳ Syncing…', idle: '⚪ Not configured' }[syncSt] || '⚪ Not configured';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div class="card pattern-bg" style="padding: 20px;">
        <h2 style="color: var(--primary-color);">Settings</h2>
        <p style="color: var(--text-muted); font-size: 0.85rem;">Wipe logs, configure themes, simulate dates, backup data, or set up cloud sync.</p>
      </div>

      <div class="plan-container">
        <div class="dashboard-main-col">
          <div class="card">
            <h3 style="color: var(--text-main); margin-bottom: 16px;">Schedule &amp; theme</h3>
            <div class="settings-list">
              <div class="settings-group">
                <label for="settings-rest-day">Weekly Rest Day</label>
                <select id="settings-rest-day" class="form-select">
                  <option value="Sunday"   ${state.settings.weeklyRestDay === "Sunday"   ? "selected" : ""}>Sunday</option>
                  <option value="Friday"   ${state.settings.weeklyRestDay === "Friday"   ? "selected" : ""}>Friday</option>
                  <option value="Saturday" ${state.settings.weeklyRestDay === "Saturday" ? "selected" : ""}>Saturday</option>
                  <option value="None"     ${state.settings.weeklyRestDay === "None"     ? "selected" : ""}>None</option>
                </select>
              </div>
              <div class="settings-group">
                <label for="settings-theme">Theme Appearance</label>
                <select id="settings-theme" class="form-select">
                  <option value="light" ${state.settings.theme === "light" ? "selected" : ""}>Light Mode</option>
                  <option value="dark"  ${state.settings.theme === "dark"  ? "selected" : ""}>Dark Mode</option>
                </select>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 style="color: var(--text-main); margin-bottom: 8px;">Simulated Date (Calculations Testing)</h3>
            <input type="text" id="settings-date-override" class="form-input" placeholder="e.g. 2026-09-11" value="${state.settings.systemDateOverride || ""}">
          </div>

          <!-- ☁️ CLOUD SYNC CARD -->
          <div class="card" style="border: 1.5px solid ${syncOn ? 'var(--secondary-color)' : 'var(--border-color)'};">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
              <h3 style="color: var(--text-main); margin:0;">☁️ Cloud Sync</h3>
              <span style="font-size:0.8rem; font-weight:700; color:${statusColor};">${statusLabel}</span>
            </div>
            <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:14px; line-height:1.5;">
              Sync your data across devices using <strong>Firebase Realtime Database</strong> (free).
              <a href="https://console.firebase.google.com/" target="_blank" style="color:var(--secondary-color);">Create a free project →</a>
            </p>

            <div style="display:flex; flex-direction:column; gap:10px;">
              <div class="form-group" style="margin:0;">
                <label style="font-size:0.8rem; font-weight:600;">Sync User ID <span style="color:var(--text-muted); font-weight:400;">(any unique name, e.g. "mudakkir_ahmad")</span></label>
                <input type="text" id="sync-user-id" class="form-input" placeholder="e.g. mudakkir_ahmad" value="${syncUser}" style="font-size:0.85rem;">
              </div>
              <div class="form-group" style="margin:0;">
                <label style="font-size:0.8rem; font-weight:600;">Firebase Database URL</label>
                <input type="text" id="sync-db-url" class="form-input" placeholder="https://your-project-default-rtdb.firebaseio.com" value="${syncCfg ? syncCfg.databaseURL || '' : ''}" style="font-size:0.82rem;">
              </div>
              <div class="form-group" style="margin:0;">
                <label style="font-size:0.8rem; font-weight:600;">Firebase API Key</label>
                <input type="text" id="sync-api-key" class="form-input" placeholder="AIza..." value="${syncCfg ? syncCfg.apiKey || '' : ''}" style="font-size:0.82rem;">
              </div>
              <div class="form-group" style="margin:0;">
                <label style="font-size:0.8rem; font-weight:600;">Firebase Project ID</label>
                <input type="text" id="sync-project-id" class="form-input" placeholder="your-project-id" value="${syncCfg ? syncCfg.projectId || '' : ''}" style="font-size:0.82rem;">
              </div>

              <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:4px;">
                <button id="sync-connect-btn" class="btn btn-primary" style="flex:1; min-width:120px;">
                  ${syncOn ? '🔄 Re-connect' : '🔗 Connect & Enable'}
                </button>
                <button id="sync-refresh-btn" class="btn btn-outline" style="flex:1; min-width:120px;" ${!syncOn ? 'disabled' : ''}>
                  ⬇️ Refresh from Cloud
                </button>
                <button id="sync-push-btn" class="btn btn-outline" style="flex:1; min-width:120px;" ${!syncOn ? 'disabled' : ''}>
                  ⬆️ Push to Cloud
                </button>
              </div>
              ${syncOn ? `<button id="sync-disconnect-btn" class="btn btn-text" style="font-size:0.78rem; color:var(--color-missed); align-self:flex-start; padding:0;">Disconnect &amp; remove config</button>` : ''}
            </div>

            <div id="sync-status-msg" style="margin-top:12px; font-size:0.82rem; color:var(--text-muted);"></div>

            <details style="margin-top:14px;">
              <summary style="font-size:0.8rem; color:var(--text-muted); cursor:pointer;">📖 How to get these values</summary>
              <ol style="font-size:0.8rem; color:var(--text-muted); margin:8px 0 0 16px; line-height:1.7;">
                <li>Go to <a href="https://console.firebase.google.com/" target="_blank" style="color:var(--secondary-color);">console.firebase.google.com</a></li>
                <li>Create a new project (disable Google Analytics)</li>
                <li>Go to <strong>Build → Realtime Database → Create database</strong> (start in test mode)</li>
                <li>Go to <strong>Project Settings (⚙️) → Your apps → Add app → Web</strong></li>
                <li>Copy the <code>apiKey</code>, <code>databaseURL</code>, and <code>projectId</code> from the config object</li>
              </ol>
            </details>
          </div>
        </div>

        <div class="dashboard-side-col">
          <div class="card">
            <h3 style="color: var(--text-main); margin-bottom: 16px;">Backup &amp; Restore</h3>
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

  // ── Basic settings bindings ──────────────────────────────────────────────
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
    dl.download = `muddakir_backup_${new Date().toISOString().split('T')[0]}.json`;
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

  // ── Cloud Sync bindings ──────────────────────────────────────────────────
  if (typeof initSync === 'undefined') return; // sync.js not loaded yet

  const syncMsg = document.getElementById('sync-status-msg');
  const setSyncMsg = (msg, color = 'var(--text-muted)') => {
    syncMsg.style.color = color;
    syncMsg.textContent = msg;
  };

  document.getElementById('sync-connect-btn').onclick = async () => {
    const userId  = document.getElementById('sync-user-id').value.trim();
    const dbUrl   = document.getElementById('sync-db-url').value.trim();
    const apiKey  = document.getElementById('sync-api-key').value.trim();
    const projId  = document.getElementById('sync-project-id').value.trim();

    if (!userId || !dbUrl || !apiKey || !projId) {
      setSyncMsg('Please fill in all fields.', '#dc2626');
      return;
    }

    const cfg = { apiKey, databaseURL: dbUrl, projectId: projId };
    setSyncMsg('Connecting…');
    const result = await initSync(cfg, userId);

    if (result.ok) {
      saveSyncConfig(cfg, userId);
      setSyncMsg('Connected! Pushing current data…', '#16a34a');
      await pushToCloud(db.getState());
      setSyncMsg('✅ Synced! Refresh this page to see updated status.', '#16a34a');
      showToast('Cloud sync enabled!', 'success');
      // Re-render after short delay so status badge updates
      setTimeout(() => renderSettings(container), 1200);
    } else {
      setSyncMsg('❌ ' + (result.error || 'Connection failed.'), '#dc2626');
      showToast('Sync connection failed.', 'error');
    }
  };

  const refreshBtn = document.getElementById('sync-refresh-btn');
  if (refreshBtn) refreshBtn.onclick = async () => {
    setSyncMsg('Pulling from cloud…');
    const result = await pullFromCloud();
    if (result.ok && result.state) {
      if (confirm('Replace local data with cloud data? This will reload the app.')) {
        try {
          localStorage.setItem('mudakkir_state', JSON.stringify(result.state));
          showToast('Data refreshed from cloud!', 'success');
          setTimeout(() => window.location.reload(), 800);
        } catch(e) {
          setSyncMsg('❌ Could not apply cloud data: ' + e.message, '#dc2626');
        }
      } else {
        setSyncMsg('Refresh cancelled.', 'var(--text-muted)');
      }
    } else if (result.ok && !result.state) {
      setSyncMsg('No cloud data found yet. Push first from another device.', '#d97706');
    } else {
      setSyncMsg('❌ ' + (result.error || 'Pull failed.'), '#dc2626');
    }
  };

  const pushBtn = document.getElementById('sync-push-btn');
  if (pushBtn) pushBtn.onclick = async () => {
    setSyncMsg('Pushing to cloud…');
    const result = await pushToCloud(db.getState());
    if (result.ok) {
      setSyncMsg('✅ Data pushed to cloud successfully!', '#16a34a');
      showToast('Pushed to cloud!', 'success');
    } else {
      setSyncMsg('❌ ' + (result.error || 'Push failed.'), '#dc2626');
    }
  };

  const disconnectBtn = document.getElementById('sync-disconnect-btn');
  if (disconnectBtn) disconnectBtn.onclick = () => {
    if (confirm('Disconnect cloud sync? Your local data stays intact.')) {
      clearSyncConfig();
      showToast('Cloud sync disconnected.', 'success');
      renderSettings(container);
    }
  };
}


// 5. GLOBAL ROUTER & BOOTSTRAP
function initRouter() {
  const routeMap = {
    'dashboard': renderDashboard,
    'projects': renderProjectHub,
    'plan': renderProjectHub,
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

    const activeKey = (hash === 'plan' || hash === 'projects') ? 'projects' : hash;
    document.querySelectorAll('.desktop-nav .nav-item, .mobile-nav .mobile-nav-item').forEach(link => {
      const page = link.dataset.page;
      if (page === activeKey || (activeKey === 'projects' && (page === 'projects' || page === 'plan'))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
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
  const activeGoal = state.monthlyGoals.find(g => g.status === "active") || state.monthlyGoals.find(g => g.id === goalId) || state.monthlyGoals[0];
  const goal = activeGoal;
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
    
    const nxt = getNextSabaqPortion(goal, state);
    const targetPage = nxt && nxt.page ? nxt.page : (goal ? goal.startPage : 1);
    
    document.getElementById('checkin-sabaq-start').value = targetPage;
    document.getElementById('checkin-sabaq-end').value = targetPage;
    
    const half1Radio = document.getElementById('sabaq-portion-half1');
    const half2Radio = document.getElementById('sabaq-portion-half2');
    const fullRadio = document.getElementById('sabaq-portion-full');
    if (nxt && nxt.half === 2) {
      if (half2Radio) half2Radio.checked = true;
    } else if (goal && goal.targetPace && goal.targetPace > 0.75) {
      if (fullRadio) fullRadio.checked = true;
    } else {
      if (half1Radio) half1Radio.checked = true;
    }
    
    subtitle = nxt ? nxt.text : `Sabaq target: Page ${targetPage}`;
    document.getElementById(`conf-${record.sabaqConfidence || 'okay'}`).checked = true;

  } else if (taskType === 'sabqi') {
    ratingGroup.classList.remove('hidden');
    sabaqRangeGroup.classList.add('hidden');
    sabqiRangeGroup.classList.remove('hidden');
    title = "Complete Sabqi";
    subtitle = `Recent revision: ${getSabqiRange(goal, state)}`;
    
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
  const startDay = 1;
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

function openRoadmapEditModal(goalId = null, prefilledPara = null) {
  const state = db.getState();
  const todayStr = state.settings.systemDateOverride || new Date().toISOString().split('T')[0];
  const goal = goalId ? state.monthlyGoals.find(g => g.id === goalId) : null;
  const isEditing = !!goal;

  const titleEl = document.getElementById('edit-goal-modal-title');
  if (titleEl) {
    titleEl.innerText = isEditing ? `Edit Project: Para ${goal.para}` : "Create New Project";
  }

  const idInput = document.getElementById('edit-goal-id');
  if (idInput) idInput.value = isEditing ? goal.id : "";

  // Populate Para select
  const select = document.getElementById('edit-goal-para');
  if (select) {
    select.innerHTML = "";
    const selectedPara = isEditing ? goal.para : (prefilledPara || 3);
    for (let p = 1; p <= 30; p++) {
      const opt = document.createElement('option');
      opt.value = p;
      opt.innerText = `Para ${p} (${STANDARD_PARA_PAGES[p].name})`;
      if (p === selectedPara) opt.selected = true;
      select.appendChild(opt);
    }
  }

  const startInput = document.getElementById('edit-goal-start');
  const endInput = document.getElementById('edit-goal-end');
  if (startInput) startInput.step = 'any';
  if (endInput) endInput.step = 'any';
  const paceInput = document.getElementById('edit-goal-pace');
  const daysInput = document.getElementById('edit-goal-days');
  const startDateInput = document.getElementById('edit-goal-start-date');
  const statusSelect = document.getElementById('edit-goal-status');
  const promoteComplexBtn = document.getElementById('modal-promote-complex-btn');
  if (promoteComplexBtn) {
    promoteComplexBtn.onclick = () => {
      // If goal exists, open for it; otherwise save temporary or use active goal
      const currentGoalId = (goal && goal.id) || (db.getState().monthlyGoals.find(g => g.status === 'active')?.id);
      if (currentGoalId) {
        document.getElementById('roadmap-edit-modal').classList.add('hidden');
        openComplexProjectModal(currentGoalId);
      } else {
        showToast('Please save the project first, then configure custom daily targets.', 'info');
      }
    };
  }

  const deleteBtn = document.getElementById('delete-roadmap-goal-btn');
  const useStandardBtn = document.getElementById('edit-use-standard-btn');

  const modePaceRadio = document.getElementById('mode-pace');
  const modeDurationRadio = document.getElementById('mode-duration');
  const paceGroup = document.getElementById('goal-pace-group');
  const durationGroup = document.getElementById('goal-duration-group');

  if (isEditing) {
    if (startInput) startInput.value = goal.startPage;
    if (endInput) endInput.value = goal.endPage;
    if (startDateInput) startDateInput.value = goal.startDate || todayStr;
    if (statusSelect) statusSelect.value = goal.status;
    if (deleteBtn) {
      deleteBtn.classList.remove('hidden');
      deleteBtn.onclick = () => {
        if (confirm(`Are you sure you want to delete the project for Para ${goal.para}?`)) {
          db.deleteGoal(goal.id);
          document.getElementById('roadmap-edit-modal').classList.add('hidden');
          showToast(`Project for Para ${goal.para} deleted.`, "info");
          initRouter();
        }
      };
    }

    if (goal.mode === 'duration') {
      if (modeDurationRadio) modeDurationRadio.checked = true;
      if (paceGroup) paceGroup.classList.add('hidden');
      if (durationGroup) durationGroup.classList.remove('hidden');
      if (daysInput) daysInput.value = goal.targetDays || 30;
      if (paceInput) paceInput.value = (goal.targetPace || 0.77).toFixed(2);
    } else {
      if (modePaceRadio) modePaceRadio.checked = true;
      if (paceGroup) paceGroup.classList.remove('hidden');
      if (durationGroup) durationGroup.classList.add('hidden');
      if (paceInput) paceInput.value = goal.targetPace || 0.5;
      if (daysInput) daysInput.value = goal.targetDays || 40;
    }
  } else {
    // New Goal
    const targetPara = prefilledPara || 3;
    const std = STANDARD_PARA_PAGES[targetPara];
    if (startInput) startInput.value = std.start;
    if (endInput) endInput.value = std.end;
    if (startDateInput) startDateInput.value = todayStr;
    if (statusSelect) statusSelect.value = "active";
    if (paceInput) paceInput.value = 0.5;
    if (daysInput) daysInput.value = 30;
    if (modePaceRadio) modePaceRadio.checked = true;
    if (paceGroup) paceGroup.classList.remove('hidden');
    if (durationGroup) durationGroup.classList.add('hidden');
    if (deleteBtn) deleteBtn.classList.add('hidden');
  }

  // Update Standard range button label
  const updateStandardBtnText = () => {
    const curPara = parseInt(select.value, 10);
    const standard = STANDARD_PARA_PAGES[curPara];
    if (useStandardBtn && standard) {
      useStandardBtn.innerText = `Use Standard Range (${standard.start}–${standard.end})`;
    }
  };

  const updateCalculations = () => {
    const start = parseFloat(startInput.value) || 1;
    const end = parseFloat(endInput.value) || start;
    const pages = Math.max(0.5, Math.round((end - start + 1) * 10) / 10);
    const startDate = startDateInput.value || todayStr;

    const pacePreview = document.getElementById('goal-pace-calc-preview');
    const durationPreview = document.getElementById('goal-duration-calc-preview');

    // Pace mode calc
    const paceVal = parseFloat(paceInput.value) || 0.5;
    const studyDaysPace = Math.ceil(pages / paceVal);
    const projDatePace = calculateProjectedEndDate(startDate, studyDaysPace);
    if (pacePreview) {
      pacePreview.innerHTML = `⚡ <strong>${pages} pages</strong> at <strong>${paceVal} p/d</strong> = <strong>${studyDaysPace} days</strong>. Projected finish: <strong>${projDatePace}</strong>`;
    }

    // Duration mode calc
    const durDays = parseInt(daysInput.value, 10) || 30;
    const reqPaceDur = (pages / durDays).toFixed(2);
    const projDateDur = calculateProjectedEndDate(startDate, durDays);
    if (durationPreview) {
      durationPreview.innerHTML = `⚡ <strong>${pages} pages</strong> in <strong>${durDays} days</strong> requires <strong>~${reqPaceDur} pages/day</strong>. Projected finish: <strong>${projDateDur}</strong>`;
    }
  };

  if (select) {
    select.onchange = () => {
      const curPara = parseInt(select.value, 10);
      const standard = STANDARD_PARA_PAGES[curPara];
      if (standard) {
        startInput.value = standard.start;
        endInput.value = standard.end;
      }
      updateStandardBtnText();
      updateCalculations();
    };
  }

  if (useStandardBtn) {
    useStandardBtn.onclick = () => {
      const curPara = parseInt(select.value, 10);
      const standard = STANDARD_PARA_PAGES[curPara];
      if (standard) {
        startInput.value = standard.start;
        endInput.value = standard.end;
        updateCalculations();
      }
    };
  }

  if (modePaceRadio) {
    modePaceRadio.onchange = () => {
      paceGroup.classList.remove('hidden');
      durationGroup.classList.add('hidden');
      updateCalculations();
    };
  }
  if (modeDurationRadio) {
    modeDurationRadio.onchange = () => {
      durationGroup.classList.remove('hidden');
      paceGroup.classList.add('hidden');
      updateCalculations();
    };
  }

  [startInput, endInput, paceInput, daysInput, startDateInput].forEach(inp => {
    if (inp) inp.oninput = updateCalculations;
  });

  updateStandardBtnText();
  updateCalculations();

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


// ==========================================================================
// Complex Project Daily Targets Planner
// ==========================================================================

let _currentComplexGoal = null;
let _complexDailyPlan = [];

function openComplexProjectModal(goalId) {
  const state = db.getState();
  const goal = state.monthlyGoals.find(g => g.id === goalId);
  if (!goal) return;

  _currentComplexGoal = goal;
  const targetPages = goal.targetPages || Math.max(0.5, Math.round((goal.endPage - goal.startPage + 1) * 10) / 10);
  const defaultPace = goal.targetPace && goal.targetPace > 0 ? goal.targetPace : 0.5;
  const startDateStr = goal.startDate || state.settings.systemDateOverride || new Date().toISOString().split('T')[0];

  if (goal.isComplex && Array.isArray(goal.dailyTargets) && goal.dailyTargets.length > 0) {
    _complexDailyPlan = JSON.parse(JSON.stringify(goal.dailyTargets));
  } else {
    // Generate initial plan from default pace
    _complexDailyPlan = [];
    let accumulated = 0;
    let dayNum = 1;
    let dObj = new Date(startDateStr);
    while (accumulated < targetPages - 0.001) {
      const step = Math.min(defaultPace, Math.round((targetPages - accumulated) * 100) / 100);
      const dateStr = dObj.toISOString().split('T')[0];
      _complexDailyPlan.push({
        day: dayNum,
        date: dateStr,
        target: step
      });
      accumulated = Math.round((accumulated + step) * 100) / 100;
      dayNum++;
      dObj.setDate(dObj.getDate() + 1);
    }
  }

  document.getElementById('complex-total-required').innerText = targetPages.toFixed(1);
  renderComplexPlanTable();

  const modal = document.getElementById('complex-project-modal');
  if (modal) modal.classList.remove('hidden');
}

function renderComplexPlanTable() {
  const tbody = document.getElementById('complex-schedule-tbody');
  if (!tbody || !_currentComplexGoal) return;

  const targetPages = _currentComplexGoal.targetPages || 20;
  let cum = 0;
  let html = '';

  _complexDailyPlan.forEach((item, idx) => {
    const val = parseFloat(item.target) || 0;
    cum = Math.round((cum + val) * 100) / 100;
    html += `
      <tr style="border-bottom: 1px solid var(--border-color); background: ${cum >= targetPages ? 'rgba(23, 107, 82, 0.05)' : 'transparent'};">
        <td style="padding: 8px 10px; font-weight: 700; color: var(--text-muted);">Day ${item.day || (idx + 1)}</td>
        <td style="padding: 8px 10px; font-family: var(--font-brand); font-size: 0.82rem;">${item.date}</td>
        <td style="padding: 6px 10px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <input type="number" step="any" min="0" max="20" class="form-input complex-target-input" data-index="${idx}" value="${item.target}" style="max-width: 90px; padding: 4px 6px; font-size: 0.85rem; font-weight: 700;">
            <span style="font-size: 0.75rem; color: var(--text-muted);">p.</span>
          </div>
        </td>
        <td style="padding: 8px 10px; font-weight: 700; color: ${cum >= targetPages ? 'var(--secondary-color)' : 'var(--text-main)'}; font-family: var(--font-brand);">
          ${cum.toFixed(2)} p.
        </td>
        <td style="padding: 6px 10px; text-align: center;">
          <button type="button" class="btn btn-text btn-xs complex-remove-day" data-index="${idx}" style="color: var(--color-missed); font-size: 0.75rem; padding: 2px 4px;">&times;</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  // Update header summary
  const totalPlanned = _complexDailyPlan.reduce((sum, d) => sum + (parseFloat(d.target) || 0), 0);
  document.getElementById('complex-total-planned').innerText = totalPlanned.toFixed(2);
  document.getElementById('complex-total-days').innerText = `${_complexDailyPlan.length} days`;

  const lastDay = _complexDailyPlan[_complexDailyPlan.length - 1];
  document.getElementById('complex-projected-finish').innerText = lastDay ? lastDay.date : '—';

  // Bind input change events
  tbody.querySelectorAll('.complex-target-input').forEach(input => {
    input.onchange = (e) => {
      const i = parseInt(e.target.dataset.index, 10);
      const newV = parseFloat(e.target.value) || 0;
      _complexDailyPlan[i].target = newV;
      renderComplexPlanTable();
    };
  });

  // Bind remove day buttons
  tbody.querySelectorAll('.complex-remove-day').forEach(btn => {
    btn.onclick = (e) => {
      const i = parseInt(e.target.dataset.index, 10);
      _complexDailyPlan.splice(i, 1);
      // Re-index days and dates
      recalcComplexDates();
      renderComplexPlanTable();
    };
  });
}

function recalcComplexDates() {
  if (!_currentComplexGoal || _complexDailyPlan.length === 0) return;
  const startStr = _currentComplexGoal.startDate || new Date().toISOString().split('T')[0];
  let dObj = new Date(startStr);
  _complexDailyPlan.forEach((item, idx) => {
    item.day = idx + 1;
    item.date = dObj.toISOString().split('T')[0];
    dObj.setDate(dObj.getDate() + 1);
  });
}

function bindComplexProjectModal() {
  const closeBtn = document.getElementById('close-complex-modal-btn');
  const cancelBtn = document.getElementById('cancel-complex-modal-btn');
  const modal = document.getElementById('complex-project-modal');
  const hide = () => { if (modal) modal.classList.add('hidden'); };

  if (closeBtn) closeBtn.onclick = hide;
  if (cancelBtn) cancelBtn.onclick = hide;

  // Add Day button
  const addDayBtn = document.getElementById('complex-add-day-btn');
  if (addDayBtn) {
    addDayBtn.onclick = () => {
      const last = _complexDailyPlan[_complexDailyPlan.length - 1];
      let nextDateStr = new Date().toISOString().split('T')[0];
      let nextDayNum = 1;
      if (last) {
        const dObj = new Date(last.date);
        dObj.setDate(dObj.getDate() + 1);
        nextDateStr = dObj.toISOString().split('T')[0];
        nextDayNum = (last.day || _complexDailyPlan.length) + 1;
      }
      _complexDailyPlan.push({
        day: nextDayNum,
        date: nextDateStr,
        target: 0.5
      });
      renderComplexPlanTable();
    };
  }

  // Batch set buttons (0.5, 1.0, 1.5, 2.0)
  document.querySelectorAll('.complex-batch-set').forEach(btn => {
    btn.onclick = () => {
      const val = parseFloat(btn.dataset.val) || 0.5;
      _complexDailyPlan.forEach(d => d.target = val);
      renderComplexPlanTable();
    };
  });

  // Revert button
  const revertBtn = document.getElementById('complex-revert-btn');
  if (revertBtn) {
    revertBtn.onclick = () => {
      if (!_currentComplexGoal) return;
      if (confirm('Revert this project to standard pace mode? Custom daily targets will be removed.')) {
        db.updateMonthlyGoal(_currentComplexGoal.id, {
          isComplex: false,
          dailyTargets: null
        });
        showToast('Reverted to standard project.', 'info');
        hide();
        initRouter();
      }
    };
  }

  // Save Custom Schedule button
  const saveBtn = document.getElementById('save-complex-modal-btn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      if (!_currentComplexGoal) return;
      const totalPlanned = _complexDailyPlan.reduce((sum, d) => sum + (parseFloat(d.target) || 0), 0);
      const lastDay = _complexDailyPlan[_complexDailyPlan.length - 1];
      const targetEndDate = lastDay ? lastDay.date : _currentComplexGoal.targetEndDate;
      const targetDays = _complexDailyPlan.length;
      const avgPace = targetDays > 0 ? parseFloat((totalPlanned / targetDays).toFixed(2)) : 0.5;

      db.updateMonthlyGoal(_currentComplexGoal.id, {
        isComplex: true,
        dailyTargets: _complexDailyPlan,
        targetDays,
        targetEndDate,
        targetPace: avgPace
      });

      showToast('Complex project schedule saved! 🧩', 'success');
      hide();
      initRouter();
    };
  }
}

function bindGlobalModals() {
  bindComplexProjectModal();
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
    const start = parseFloat(document.getElementById('range-start-page').value);
    const end = parseFloat(document.getElementById('range-end-page').value);
    const override = parseFloat(document.getElementById('range-target-override').value);

    if (end < start) {
      showToast("End page must be >= start page.", "error");
      return;
    }
    const target = isNaN(override) ? Math.max(0.5, Math.round((end - start + 1) * 10) / 10) : override;
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

    const targetGoal = db.getState().monthlyGoals.find(g => g.status === "active") || db.getState().monthlyGoals.find(g => g.id === rec.monthlyGoalId) || db.getState().monthlyGoals[0];
    const paraNum = targetGoal ? targetGoal.para : 1;

    if (taskType === 'sabaq') {
      const s = parseFloat(document.getElementById('checkin-sabaq-start').value);
      const end = parseFloat(document.getElementById('checkin-sabaq-end').value);
      const portionMode = document.querySelector('input[name="checkin-sabaq-portion-mode"]:checked')?.value || 'half1';

      if (portionMode === 'half1' && !isNaN(s)) {
        togglePagePortion(db.state, s, 1);
        rec.sabaq = `Para ${paraNum} · Page ${s} (1st Half · 0.5 p)`;
      } else if (portionMode === 'half2' && !isNaN(s)) {
        togglePagePortion(db.state, s, 2);
        rec.sabaq = `Para ${paraNum} · Page ${s} (2nd Half · 0.5 p)`;
      } else if (!isNaN(s) && !isNaN(end) && end >= s) {
        for (let p = s; p <= end; p++) {
          if (!db.state.completedPages.includes(p)) {
            db.state.completedPages.push(p);
          }
        }
        db.state.completedPages.sort((a, b) => a - b);
        if (s === end) {
          rec.sabaq = `Para ${paraNum} · Page ${s} (Full Page · 1.0 p)`;
        } else {
          rec.sabaq = `Para ${paraNum} · Pages ${s}–${end}`;
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
      if (!isNaN(s) && !isNaN(end)) {
        rec.sabqi = `Pages ${s}–${end}`;
      } else {
        rec.sabqi = getSabqiRange(targetGoal, db.state);
      }
    } else if (taskType === 'manzil') {
      rec.manzilCompleted = true;
    }

    db.saveDailyRecord(dateStr, rec);
    updateStreaksDisplay();

    // Check project completion
    const goal = targetGoal;
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
    const start = parseFloat(document.getElementById('edit-goal-start').value);
    const end = parseFloat(document.getElementById('edit-goal-end').value);
    const startDate = document.getElementById('edit-goal-start-date').value || new Date().toISOString().split('T')[0];
    const status = document.getElementById('edit-goal-status').value;
    const isPaceMode = document.getElementById('mode-pace').checked;

    if (isNaN(start) || isNaN(end) || end < start) {
      showToast("End page must be >= start page.", "error");
      return;
    }

    const targetPages = Math.max(0.5, Math.round((end - start + 1) * 10) / 10); // supports 0.5 steps
    let targetPace = 0.5;
    let targetDays = 40;
    let targetEndDate = "";

    if (isPaceMode) {
      targetPace = parseFloat(document.getElementById('edit-goal-pace').value) || 0.5;
      targetDays = Math.ceil(targetPages / targetPace);
      targetEndDate = calculateProjectedEndDate(startDate, targetDays);
    } else {
      targetDays = parseInt(document.getElementById('edit-goal-days').value, 10) || 30;
      targetPace = parseFloat((targetPages / targetDays).toFixed(2));
      targetEndDate = calculateProjectedEndDate(startDate, targetDays);
    }

    const mode = isPaceMode ? 'pace' : 'duration';
    const goalData = {
      para,
      name: STANDARD_PARA_PAGES[para]?.name || `Para ${para}`,
      startPage: start,
      endPage: end,
      targetPages,
      mode,
      targetPace,
      targetDays,
      startDate,
      targetEndDate,
      status
    };

    if (id) {
      db.updateMonthlyGoal(id, goalData);
      showToast(`Para ${para} project updated!`, "success");
    } else {
      const newId = `goal-para-${para}-${Date.now()}`;
      db.addGoal({ id: newId, ...goalData });
      showToast(`Project for Para ${para} created!`, "success");
    }

    hideModal(document.getElementById('roadmap-edit-modal'));
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

  // Auto-connect cloud sync if config was previously saved
  if (typeof tryAutoConnect !== "undefined") {
    tryAutoConnect().then(result => {
      if (result.ok) console.log("[Sync] Auto-connected to Firebase.");
    }).catch(() => {});
  }

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
