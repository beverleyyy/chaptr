/**
 * SEAB Secondary / SEC G3 (O-Level reference) chapter catalogues for booking.
 * Topic ids are stable (`em_01`, `am_03`, `ph_12`, …). Band defaults to G3;
 * student home overlays the learner’s saved level via topicsForSubjectKey.
 *
 * Sources consulted: SEAB 4052 / 4049 / 6091 / 6092 / 6093 / 5086–5088 /
 * 2279 / 2174 / 1184 / 7087 / 7155 syllabus outlines and reputable SG summaries.
 */

import type { CurriculumSubjectKey } from '@/constants/curriculum';

export type Topic = {
  id: string;
  spine: string;
  title: string;
  subject: string;
  subjectKey: CurriculumSubjectKey;
  band: string;
  tag?: string;
  lastCovered?: string;
  highlight?: boolean;
};

type TopicExtras = Pick<Topic, 'tag' | 'lastCovered' | 'highlight'>;

/** [id, spine, title, optional extras] */
type TopicRow = [string, string, string, TopicExtras?];

function buildTopics(
  subjectKey: CurriculumSubjectKey,
  subject: string,
  rows: TopicRow[],
): Record<string, Topic> {
  const out: Record<string, Topic> = {};
  for (const [id, spine, title, extras] of rows) {
    out[id] = {
      id,
      spine,
      title,
      subject,
      subjectKey,
      band: 'G3',
      ...extras,
    };
  }
  return out;
}

/** Elementary Mathematics (SEAB 4052 / SEC Mathematics) — Number & Algebra, Geometry & Measurement, Statistics & Probability */
const EMATHS = buildTopics('emaths', 'E Maths', [
  ['em_01', '1', 'Numbers & Operations'],
  ['em_02', '2', 'Indices & Standard Form'],
  ['em_03', '3', 'Ratio & Proportion'],
  ['em_04', '4', 'Percentage'],
  ['em_05', '5', 'Rate & Speed'],
  ['em_06', '6', 'Algebraic Expressions & Formulae'],
  ['em_07', '7', 'Equations & Inequalities'],
  ['em_08', '8', 'Simultaneous Equations'],
  ['em_09', '9', 'Functions & Graphs'],
  ['em_10', '10', 'Set Language & Notation'],
  ['em_11', '11', 'Matrices'],
  ['em_12', '12', 'Angles, Triangles & Polygons'],
  ['em_13', '13', 'Congruence & Similarity'],
  ['em_14', '14', "Pythagoras' Theorem & Trigonometry"],
  ['em_15', '15', 'Properties of Circles'],
  ['em_16', '16', 'Mensuration'],
  ['em_17', '17', 'Coordinate Geometry'],
  ['em_18', '18', 'Vectors in Two Dimensions'],
  ['em_19', '19', 'Data Handling & Analysis'],
  ['em_20', '20', 'Probability'],
]);

/** Additional Mathematics (SEAB 4049) — Algebra, Geometry & Trigonometry, Calculus */
const AMATHS = buildTopics('amaths', 'A Maths', [
  ['am_01', '1', 'Quadratic Functions'],
  ['am_02', '2', 'Equations & Inequalities'],
  ['am_03', '3', 'Surds'],
  ['am_04', '4', 'Polynomials & Factor/Remainder Theorems'],
  ['am_05', '5', 'Partial Fractions'],
  ['am_06', '6', 'Binomial Expansions'],
  ['am_07', '7', 'Exponential & Logarithmic Functions'],
  ['am_08', '8', 'Trigonometric Functions'],
  ['am_09', '9', 'Trigonometric Identities & Equations'],
  ['am_10', '10', 'Coordinate Geometry'],
  ['am_11', '11', 'Circles (Coordinate Geometry)'],
  ['am_12', '12', 'Linear Law'],
  ['am_13', '13', 'Proofs in Plane Geometry'],
  ['am_14', '14', 'Differentiation'],
  ['am_15', '15', 'Applications of Differentiation'],
  ['am_16', '16', 'Integration'],
  ['am_17', '17', 'Applications of Integration'],
  ['am_18', '18', 'Kinematics (Calculus)'],
]);

/** Pure Physics (SEAB 6091) — 20 topics across Measurement, Mechanics, Thermal, Waves, E&M, Radioactivity */
const PHYSICS = buildTopics('physics', 'Physics', [
  ['ph_01', '1', 'Physical Quantities, Units & Measurement'],
  ['ph_02', '2', 'Kinematics'],
  ['ph_03', '3', 'Dynamics'],
  ['ph_04', '4', 'Turning Effect of Forces'],
  ['ph_05', '5', 'Pressure'],
  ['ph_06', '6', 'Energy, Work & Power'],
  ['ph_07', '7', 'Kinetic Particle Model of Matter'],
  ['ph_08', '8', 'Thermal Processes'],
  ['ph_09', '9', 'Thermal Properties of Matter'],
  ['ph_10', '10', 'General Wave Properties'],
  ['ph_11', '11', 'Electromagnetic Spectrum'],
  ['ph_12', '12', 'Light'],
  ['ph_13', '13', 'Static Electricity'],
  ['ph_14', '14', 'Current of Electricity'],
  ['ph_15', '15', 'D.C. Circuits'],
  ['ph_16', '16', 'Practical Electricity'],
  ['ph_17', '17', 'Magnetism'],
  ['ph_18', '18', 'Electromagnetism'],
  ['ph_19', '19', 'Electromagnetic Induction'],
  ['ph_20', '20', 'Radioactivity'],
]);

/** Pure Chemistry (SEAB 6092) — Matter, Chemical Reactions, Chemistry in a Sustainable World */
const CHEM = buildTopics('chem', 'Chemistry', [
  ['cm_01', '1', 'Experimental Chemistry'],
  ['cm_02', '2', 'Particulate Nature of Matter'],
  ['cm_03', '3', 'Chemical Bonding & Structure'],
  ['cm_04', '4', 'Chemical Calculations'],
  ['cm_05', '5', 'Acid-Base Chemistry'],
  ['cm_06', '6', 'Qualitative Analysis'],
  ['cm_07', '7', 'Redox Chemistry'],
  ['cm_08', '8', 'Patterns in the Periodic Table'],
  ['cm_09', '9', 'Chemical Energetics'],
  ['cm_10', '10', 'Rate of Reactions'],
  ['cm_11', '11', 'Organic Chemistry'],
  ['cm_12', '12', 'Maintaining Air Quality'],
]);

/** Pure Biology (SEAB 6093) — Cells & Chemistry of Life, Human Body, Living Together, Continuity of Life */
const BIOLOGY = buildTopics('biology', 'Biology', [
  ['bi_01', '1', 'Cell Structure & Organisation'],
  ['bi_02', '2', 'Movement of Substances'],
  ['bi_03', '3', 'Biological Molecules'],
  ['bi_04', '4', 'Nutrition in Humans'],
  ['bi_05', '5', 'Transport in Humans'],
  ['bi_06', '6', 'Respiration in Humans'],
  ['bi_07', '7', 'Excretion in Humans'],
  ['bi_08', '8', 'Homeostasis, Co-ordination & Response'],
  ['bi_09', '9', 'Infectious Diseases in Humans'],
  ['bi_10', '10', 'Nutrition & Transport in Flowering Plants'],
  ['bi_11', '11', 'Organisms & their Environment'],
  ['bi_12', '12', 'Molecular Genetics'],
  ['bi_13', '13', 'Reproduction'],
  ['bi_14', '14', 'Inheritance'],
]);

/** English Language (SEAB 1184) — bookable paper-skill units */
const ENGLISH = buildTopics('english', 'English', [
  ['en_01', '1', 'Situational Writing'],
  ['en_02', '2', 'Continuous Writing — Narrative & Personal Recount'],
  ['en_03', '3', 'Continuous Writing — Discursive & Argumentative'],
  ['en_04', '4', 'Visual Text Comprehension'],
  ['en_05', '5', 'Narrative Comprehension'],
  ['en_06', '6', 'Non-Narrative Comprehension'],
  ['en_07', '7', 'Summary Writing'],
  ['en_08', '8', 'Editing, Grammar & Vocabulary'],
  ['en_09', '9', 'Oral — Reading Aloud'],
  ['en_10', '10', 'Oral — Spoken Interaction'],
  ['en_11', '11', 'Listening Comprehension'],
]);

/** Mother Tongue — Chinese (paper skills) */
const CHINESE = buildTopics('chinese', 'Chinese', [
  ['zh_01', '1', 'Situational Writing'],
  ['zh_02', '2', 'Continuous Writing / Composition'],
  ['zh_03', '3', 'Comprehension'],
  ['zh_04', '4', 'Cloze Passage'],
  ['zh_05', '5', 'Language Use & Vocabulary'],
  ['zh_06', '6', 'Oral — Reading Aloud'],
  ['zh_07', '7', 'Oral — Picture Discussion & Conversation'],
  ['zh_08', '8', 'Listening Comprehension'],
]);

/** Mother Tongue — Malay (paper skills) */
const MALAY = buildTopics('malay', 'Malay', [
  ['ms_01', '1', 'Karangan Situasi (Situational Writing)'],
  ['ms_02', '2', 'Karangan Berterusan (Continuous Writing)'],
  ['ms_03', '3', 'Kefahaman (Comprehension)'],
  ['ms_04', '4', 'Cloze / Pengisian Tempat Kosong'],
  ['ms_05', '5', 'Penggunaan Bahasa & Peribahasa'],
  ['ms_06', '6', 'Lisan — Bacaan'],
  ['ms_07', '7', 'Lisan — Perbualan'],
  ['ms_08', '8', 'Pendengaran (Listening)'],
]);

/** Mother Tongue — Tamil (paper skills) */
const TAMIL = buildTopics('tamil', 'Tamil', [
  ['ta_01', '1', 'Situational Writing'],
  ['ta_02', '2', 'Continuous Writing / Composition'],
  ['ta_03', '3', 'Comprehension'],
  ['ta_04', '4', 'Cloze Passage'],
  ['ta_05', '5', 'Language Use & Grammar'],
  ['ta_06', '6', 'Oral — Reading Aloud'],
  ['ta_07', '7', 'Oral — Conversation'],
  ['ta_08', '8', 'Listening Comprehension'],
]);

/** Combined Science Physics component (shared across 5086 / 5087) */
const CS_PHYSICS_ROWS: TopicRow[] = [
  ['1', '1', 'Physical Quantities & Measurement'],
  ['2', '2', 'Kinematics'],
  ['3', '3', 'Dynamics'],
  ['4', '4', 'Mass, Weight & Density'],
  ['5', '5', 'Turning Effect of Forces & Pressure'],
  ['6', '6', 'Energy, Work & Power'],
  ['7', '7', 'Thermal Physics'],
  ['8', '8', 'Waves & Sound'],
  ['9', '9', 'Light'],
  ['10', '10', 'Electricity & Circuits'],
  ['11', '11', 'Magnetism & Electromagnetism'],
];

/** Combined Science Chemistry component (shared across 5086 / 5088) */
const CS_CHEM_ROWS: TopicRow[] = [
  ['c1', '1', 'Experimental Chemistry & Purification'],
  ['c2', '2', 'Particulate Nature of Matter'],
  ['c3', '3', 'Atomic Structure'],
  ['c4', '4', 'Chemical Bonding & Structure'],
  ['c5', '5', 'Formulae, Equations & Stoichiometry'],
  ['c6', '6', 'Acid-Base Chemistry'],
  ['c7', '7', 'Qualitative Analysis'],
  ['c8', '8', 'Redox Chemistry'],
  ['c9', '9', 'Periodic Trends & Reactivity Series'],
  ['c10', '10', 'Chemical Energetics'],
  ['c11', '11', 'Rate of Reactions'],
  ['c12', '12', 'Organic Chemistry'],
];

/** Combined Science Biology component (shared across 5087 / 5088) */
const CS_BIO_ROWS: TopicRow[] = [
  ['b1', '1', 'Cell Structure & Organisation'],
  ['b2', '2', 'Movement of Substances'],
  ['b3', '3', 'Biological Molecules & Enzymes'],
  ['b4', '4', 'Nutrition in Humans'],
  ['b5', '5', 'Transport in Humans'],
  ['b6', '6', 'Respiration'],
  ['b7', '7', 'Excretion'],
  ['b8', '8', 'Homeostasis & Coordination'],
  ['b9', '9', 'Nutrition & Transport in Plants'],
  ['b10', '10', 'Ecology & Environment'],
  ['b11', '11', 'Reproduction'],
  ['b12', '12', 'Inheritance'],
];

function mergeCsTopics(
  subjectKey: CurriculumSubjectKey,
  subject: string,
  idPrefix: string,
  blocks: { label: string; rows: TopicRow[] }[],
): Record<string, Topic> {
  const rows: TopicRow[] = [];
  let spine = 1;
  for (const block of blocks) {
    for (const [, , title] of block.rows) {
      const n = String(spine).padStart(2, '0');
      rows.push([`${idPrefix}_${n}`, String(spine), `${block.label}: ${title}`]);
      spine += 1;
    }
  }
  return buildTopics(subjectKey, subject, rows);
}

const CS_PHY_CHEM = mergeCsTopics('cs_phy_chem', 'CS Phy/Chem', 'pc', [
  { label: 'Physics', rows: CS_PHYSICS_ROWS },
  { label: 'Chemistry', rows: CS_CHEM_ROWS },
]);

const CS_CHEM_BIO = mergeCsTopics('cs_chem_bio', 'CS Chem/Bio', 'cb', [
  { label: 'Chemistry', rows: CS_CHEM_ROWS },
  { label: 'Biology', rows: CS_BIO_ROWS },
]);

const CS_PHY_BIO = mergeCsTopics('cs_phy_bio', 'CS Phy/Bio', 'pb', [
  { label: 'Physics', rows: CS_PHYSICS_ROWS },
  { label: 'Biology', rows: CS_BIO_ROWS },
]);

/** Geography (SEAB 2279) — five clusters broken into bookable units */
const GEOGRAPHY = buildTopics('geography', 'Geography', [
  ['ge_01', '1', 'Geographical Thinking & Everyday Life'],
  ['ge_02', '2', 'Sustainable Development'],
  ['ge_03', '3', 'Geographical Investigation (Fieldwork)'],
  ['ge_04', '4', 'Tourism Activity & Development'],
  ['ge_05', '5', 'Sustainable Tourism'],
  ['ge_06', '6', 'Weather & Climate'],
  ['ge_07', '7', 'Climate Change & Climate Action'],
  ['ge_08', '8', 'Plate Tectonics'],
  ['ge_09', '9', 'Earthquakes & Volcanoes'],
  ['ge_10', '10', 'Living with Tectonic Hazards'],
  ['ge_11', '11', 'Singapore as a City-State'],
  ['ge_12', '12', 'Sustainable & Resilient Singapore'],
]);

/** History (SEAB 2174 Pure / Elective 1910s–1991 core) */
const HISTORY = buildTopics('history', 'History', [
  ['hi_01', '1', 'Source-Based Case Study Skills'],
  ['hi_02', '2', 'Structured Essay Writing Skills'],
  ['hi_03', '3', 'Aftermath of WWI & League of Nations'],
  ['hi_04', '4', 'Rise of Authoritarian Regimes'],
  ['hi_05', '5', 'WWII in Europe'],
  ['hi_06', '6', 'WWII in the Asia-Pacific'],
  ['hi_07', '7', 'Origins of the Cold War'],
  ['hi_08', '8', 'Cold War Flashpoints (Korea & Vietnam)'],
  ['hi_09', '9', 'End of the Cold War'],
  ['hi_10', '10', 'Colonialism in Southeast Asia'],
  ['hi_11', '11', 'Decolonisation in Southeast Asia'],
  ['hi_12', '12', 'Singapore: Road to Independence'],
]);

/** Literature in English (SEAB 2065) — skills & text types */
const LITERATURE = buildTopics('literature', 'Literature', [
  ['li_01', '1', 'Unseen Poetry'],
  ['li_02', '2', 'Set Text Poetry'],
  ['li_03', '3', 'Unseen Prose'],
  ['li_04', '4', 'Set Text Prose / Novel'],
  ['li_05', '5', 'Drama & Set Play'],
  ['li_06', '6', 'Literary Devices & Close Reading'],
  ['li_07', '7', 'Passage-Based Questions'],
  ['li_08', '8', 'Essay Writing & Comparison'],
]);

/** Principles of Accounts (SEAB 7087) */
const POA = buildTopics('poa', 'POA', [
  ['pa_01', '1', 'Role of Accounting & Stakeholders'],
  ['pa_02', '2', 'Elements of Financial Statements'],
  ['pa_03', '3', 'Accounting Equation'],
  ['pa_04', '4', 'Accounting Theories & Assumptions'],
  ['pa_05', '5', 'Double-Entry Recording System'],
  ['pa_06', '6', 'Source Documents, Journals & Ledgers'],
  ['pa_07', '7', 'Trial Balance'],
  ['pa_08', '8', 'Cash Book & Bank Reconciliation'],
  ['pa_09', '9', 'Accruals & Prepayments'],
  ['pa_10', '10', 'Depreciation of Non-Current Assets'],
  ['pa_11', '11', 'Inventory'],
  ['pa_12', '12', 'Trade Receivables & Bad Debts'],
  ['pa_13', '13', 'Statement of Financial Performance'],
  ['pa_14', '14', 'Statement of Financial Position'],
  ['pa_15', '15', 'Correction of Errors'],
  ['pa_16', '16', 'Financial Ratios & Analysis'],
  ['pa_17', '17', 'Internal Controls'],
]);

/** Computing (SEAB 7155) */
const COMPUTING = buildTopics('computing', 'Computing', [
  ['co_01', '1', 'Data Representation'],
  ['co_02', '2', 'Logic Gates & Circuits'],
  ['co_03', '3', 'Algorithms & Problem Decomposition'],
  ['co_04', '4', 'Flowcharts & Pseudocode'],
  ['co_05', '5', 'Python Fundamentals'],
  ['co_06', '6', 'Control Structures'],
  ['co_07', '7', 'Functions & Modular Programming'],
  ['co_08', '8', 'Strings, Lists & Data Structures'],
  ['co_09', '9', 'File Handling'],
  ['co_10', '10', 'Spreadsheets & Data Management'],
  ['co_11', '11', 'Networks & the Internet'],
  ['co_12', '12', 'Ethics, Security & Impact of Computing'],
]);

export const TOPICS: Record<string, Topic> = {
  ...EMATHS,
  ...AMATHS,
  ...PHYSICS,
  ...CHEM,
  ...BIOLOGY,
  ...ENGLISH,
  ...CHINESE,
  ...MALAY,
  ...TAMIL,
  ...CS_PHY_CHEM,
  ...CS_CHEM_BIO,
  ...CS_PHY_BIO,
  ...GEOGRAPHY,
  ...HISTORY,
  ...LITERATURE,
  ...POA,
  ...COMPUTING,
};

/** Chapter counts per curriculum subject key (for docs / PR summaries). */
export function topicCountsBySubject(): Record<CurriculumSubjectKey, number> {
  const counts = {} as Record<CurriculumSubjectKey, number>;
  for (const t of Object.values(TOPICS)) {
    counts[t.subjectKey] = (counts[t.subjectKey] ?? 0) + 1;
  }
  return counts;
}
