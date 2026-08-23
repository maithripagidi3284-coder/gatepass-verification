/**
 * ROLL NUMBER SCHEME CONFIG
 * -------------------------
 * This is the only file you should need to edit to match CBIT's real
 * roll number codes. Everything else (student search, cascading
 * dropdowns) reads from this file.
 *
 * Pattern assumed: 1601 + <2-digit admission year> + <3-digit branch code> + <3-digit serial>
 * e.g. 160124733047 = 1601 | 24 (admitted 2024) | 733 (CSE) | 047 (student serial)
 *
 * Edit ADMISSION_YEAR_BY_LEVEL and BRANCHES below with your institute's
 * real codes — the two you gave me (1st year CSE = 160124733, ECE = 160124734)
 * are already wired in as examples.
 */

export interface Branch {
  code: string; // 3-digit code used inside the roll number, e.g. "733"
  short: string; // short label, e.g. "CSE"
  name: string; // full label, e.g. "Computer Science & Engineering"
}

// Map "year of study" (1st/2nd/3rd/4th year, i.e. current academic level)
// to the 2-digit admission-year code embedded in the roll number.
// Adjust these as each batch rolls over.
export const ADMISSION_YEAR_BY_LEVEL: Record<number, string> = {
  1: "24",
  2: "23",
  3: "22",
  4: "21",
};

export const YEAR_LEVELS = [1, 2, 3, 4];

export const SEMESTERS_BY_LEVEL: Record<number, number[]> = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6],
  4: [7, 8],
};

export const BRANCHES: Branch[] = [
  { code: "733", short: "CSE", name: "Computer Science & Engineering" },
  { code: "734", short: "ECE", name: "Electronics & Communication" },
  { code: "735", short: "EEE", name: "Electrical & Electronics" },
  { code: "731", short: "MECH", name: "Mechanical Engineering" },
  { code: "732", short: "CIVIL", name: "Civil Engineering" },
  { code: "736", short: "IT", name: "Information Technology" },
];

/** Builds the 9-digit roll-number prefix for a given year level + branch code. */
export function buildPrefix(yearLevel: number, branchCode: string): string {
  const admissionYY = ADMISSION_YEAR_BY_LEVEL[yearLevel] ?? "00";
  return `1601${admissionYY}${branchCode}`;
}
