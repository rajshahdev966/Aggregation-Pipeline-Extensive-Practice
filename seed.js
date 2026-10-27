// HireTrail Aggregation Lab: deterministic, synthetic recruiting marketplace data.
// Run with: mongosh "mongodb://127.0.0.1:27017/hiretrail_agg_lab" --file seed.js

const BASE_DATE = new Date("2026-10-27T12:00:00.000Z");
let seed = 74291;
function random() {
  seed = (seed * 48271) % 2147483647;
  return (seed - 1) / 2147483646;
}
function pick(values) { return values[Math.floor(random() * values.length)]; }
function sample(values, count) {
  const copy = [...values];
  const result = [];
  while (copy.length && result.length < count) result.push(copy.splice(Math.floor(random() * copy.length), 1)[0]);
  return result;
}
function daysAgo(days) { return new Date(BASE_DATE.getTime() - days * 86400000); }

const skillSets = {
  Engineering: ["JavaScript", "TypeScript", "React", "Node.js", "MongoDB", "Python", "AWS", "Docker", "GraphQL", "SQL", "Kubernetes", "Testing"],
  Design: ["Product design", "Figma", "Design systems", "UX research", "Prototyping", "Accessibility", "Visual design", "Information architecture"],
  Marketing: ["Growth strategy", "SEO", "Analytics", "Content marketing", "Lifecycle marketing", "A/B testing", "Storytelling", "Paid acquisition"],
  "Customer Success": ["Customer success", "Communication", "CRM", "Onboarding", "Problem solving", "Account management", "Training"],
  Data: ["SQL", "Python", "Data analysis", "Machine learning", "dbt", "Tableau", "Statistics", "Experimentation"],
};
const locations = ["Remote", "New York, NY", "San Francisco, CA", "Austin, TX", "Chicago, IL", "Seattle, WA", "Boston, MA", "Brooklyn, NY"];
const firstNames = ["Avery", "Jordan", "Morgan", "Riley", "Casey", "Taylor", "Quinn", "Cameron", "Jamie", "Drew", "Alex", "Reese", "Skyler", "Parker", "Rowan", "Emerson", "Sage", "Finley", "Kai", "Blake"];
const lastNames = ["Bennett", "Rivera", "Patel", "Kim", "Brooks", "Foster", "Reed", "Hayes", "Morgan", "Price", "Coleman", "Ward", "Bell", "Murphy", "Gray", "Cox", "Diaz", "Ross", "Singh", "Wong"];
const departments = ["Engineering", "Design", "Marketing", "Customer Success", "Data"];
const jobTitles = {
  Engineering: ["Frontend Engineer", "Backend Engineer", "Full Stack Engineer", "Platform Engineer", "Mobile Engineer"],
  Design: ["Product Designer", "UX Researcher", "Senior Product Designer", "Brand Designer"],
  Marketing: ["Growth Marketing Manager", "Content Strategist", "Product Marketing Manager"],
  "Customer Success": ["Customer Success Specialist", "Customer Success Manager", "Implementation Consultant"],
  Data: ["Data Analyst", "Analytics Engineer", "Data Scientist"],
};
const companies = Array.from({ length: 18 }, (_, i) => ({
  _id: `co-${String(i + 1).padStart(3, "0")}`,
  name: [`Northstar`, `Acme Studio`, `Juniper`, `Brightside`, `Fieldwork`, `Orbit`, `Common Thread`, `Copper`, `Goodwell`, `Daybreak`, `Mosaic`, `Pioneer`, `Kindred`, `Atlas`, `Fable`, `Foundry`, `Openlane`, `Cedar`][i],
  industry: pick(["SaaS", "Healthcare", "Fintech", "Climate", "Education", "E-commerce", "Design services"]),
  size: pick(["1-10", "11-50", "51-200", "201-500"]),
  headquarters: pick(locations.slice(1)),
  createdAt: daysAgo(500 + Math.floor(random() * 1500)),
}));

const jobs = Array.from({ length: 90 }, (_, i) => {
  const department = pick(departments);
  const postedDaysAgo = Math.floor(random() * 240);
  const status = postedDaysAgo > 120 && random() < 0.72 ? "closed" : random() < 0.08 ? "paused" : "active";
  const minExperience = pick([0, 1, 2, 3, 5]);
  return {
    _id: `job-${String(i + 1).padStart(3, "0")}`,
    companyId: pick(companies)._id,
    title: pick(jobTitles[department]),
    department,
    description: `Join a collaborative ${department.toLowerCase()} team and make a measurable impact.`,
    requiredSkills: sample(skillSets[department], 3 + Math.floor(random() * 3)),
    location: pick(locations),
    workplaceType: pick(["remote", "hybrid", "onsite"]),
    employmentType: pick(["full_time", "full_time", "contract", "part_time"]),
    experience: { minYears: minExperience, maxYears: minExperience + pick([2, 3, 5]) },
    salary: (() => { const min = 55000 + Math.floor(random() * 90000); return { currency: "USD", min, max: min + 25000 + Math.floor(random() * 80000) }; })(),
    status,
    postedAt: daysAgo(postedDaysAgo),
    closesAt: status === "active" ? daysAgo(Math.max(0, postedDaysAgo - 45)) : daysAgo(Math.max(0, postedDaysAgo - 30)),
    tags: sample(["early-stage", "mission-driven", "accessible", "high-growth", "small-team", "mentorship"], 2),
  };
});

const candidates = Array.from({ length: 600 }, (_, i) => {
  const name = `${pick(firstNames)} ${pick(lastNames)}`;
  const preferredDepartments = sample(departments, 1 + Math.floor(random() * 2));
  const skills = [...new Set(preferredDepartments.flatMap((d) => sample(skillSets[d], 2 + Math.floor(random() * 4))))];
  return {
    _id: `cand-${String(i + 1).padStart(4, "0")}`,
    name,
    email: `candidate${String(i + 1).padStart(4, "0")}@example.test`,
    location: pick(locations),
    openToRemote: random() < 0.58,
    headline: `${pick(["Curious", "Pragmatic", "People-first", "Data-minded", "Product-focused"])} ${pick(preferredDepartments)} professional`,
    skills,
    experienceYears: Math.floor(random() * 13),
    preferredDepartments,
    preferredEmploymentTypes: sample(["full_time", "contract", "part_time"], 1 + Math.floor(random() * 2)),
    salaryExpectation: (() => { const min = 60000 + Math.floor(random() * 80000); return { currency: "USD", min, max: min + 20000 + Math.floor(random() * 90000) }; })(),
    profileCreatedAt: daysAgo(Math.floor(random() * 700)),
    lastActiveAt: daysAgo(Math.floor(random() * 90)),
    isDiscoverable: random() < 0.9,
  };
});

const stageOrder = ["applied", "screening", "interview", "offer", "hired"];
const terminalStages = ["rejected", "withdrawn"];
const applications = [];
const interviews = [];
const activityEvents = [];
const savedJobs = [];
let applicationNumber = 0;
let eventNumber = 0;
let interviewNumber = 0;
let savedNumber = 0;

// Candidates apply to jobs in a preferred department; a substantial cross-department
// slice is retained so analytics exercises have less-perfect marketplace data too.
for (const candidate of candidates) {
  const targetCount = Math.floor(random() * 10);
  const eligibleJobs = jobs.filter((job) => candidate.preferredDepartments.includes(job.department) || random() < 0.18);
  const chosenJobs = sample(eligibleJobs, Math.min(targetCount, eligibleJobs.length));
  for (const job of chosenJobs) {
    applicationNumber += 1;
    const appliedDaysAgo = Math.floor(random() * 240);
    const progressRoll = random();
    const maxStageIndex = progressRoll < 0.42 ? 0 : progressRoll < 0.66 ? 1 : progressRoll < 0.84 ? 2 : progressRoll < 0.95 ? 3 : 4;
    const finalStage = random() < 0.28 ? pick(terminalStages) : stageOrder[maxStageIndex];
    const finalIndex = stageOrder.indexOf(finalStage);
    const visited = finalIndex < 0 ? stageOrder.slice(0, Math.max(1, maxStageIndex + 1)) : stageOrder.slice(0, finalIndex + 1);
    const stageHistory = [];
    const appliedAt = daysAgo(appliedDaysAgo);
    let currentDate = appliedAt;
    visited.forEach((stage, idx) => {
      if (idx > 0) currentDate = new Date(currentDate.getTime() + (1 + Math.floor(random() * 18)) * 86400000);
      const entry = { stage, at: currentDate };
      stageHistory.push(entry);
      eventNumber += 1;
      activityEvents.push({ _id: `evt-${String(eventNumber).padStart(6, "0")}`, applicationId: `app-${String(applicationNumber).padStart(5, "0")}`, candidateId: candidate._id, jobId: job._id, type: `stage_${stage}`, occurredAt: currentDate });
    });
    if (finalStage === "rejected" || finalStage === "withdrawn") {
      currentDate = new Date(currentDate.getTime() + (2 + Math.floor(random() * 14)) * 86400000);
      stageHistory.push({ stage: finalStage, at: currentDate });
      eventNumber += 1;
      activityEvents.push({ _id: `evt-${String(eventNumber).padStart(6, "0")}`, applicationId: `app-${String(applicationNumber).padStart(5, "0")}`, candidateId: candidate._id, jobId: job._id, type: `stage_${finalStage}`, occurredAt: currentDate });
    }
    const appId = `app-${String(applicationNumber).padStart(5, "0")}`;
    const currentStage = stageHistory[stageHistory.length - 1].stage;
    applications.push({ _id: appId, candidateId: candidate._id, jobId: job._id, companyId: job.companyId, source: pick(["organic", "referral", "linkedin", "careers_page", "agency"]), status: currentStage, appliedAt, updatedAt: stageHistory[stageHistory.length - 1].at, stageHistory, matchSnapshot: { matchedSkills: candidate.skills.filter((skill) => job.requiredSkills.includes(skill)).length } });
    if (currentStage === "interview" || currentStage === "offer" || currentStage === "hired") {
      interviewNumber += 1;
      const interviewAt = new Date(stageHistory.find((entry) => entry.stage === "interview").at.getTime() + (2 + Math.floor(random() * 14)) * 86400000);
      interviews.push({ _id: `int-${String(interviewNumber).padStart(5, "0")}`, applicationId: appId, candidateId: candidate._id, jobId: job._id, scheduledAt: interviewAt, type: pick(["screen", "technical", "portfolio", "final"]), status: interviewAt < BASE_DATE ? pick(["completed", "completed", "cancelled"]) : "scheduled", score: interviewAt < BASE_DATE ? Math.round((2.5 + random() * 2.5) * 10) / 10 : null });
    }
  }
  for (const job of sample(jobs.filter((j) => j.status === "active"), Math.floor(random() * 5))) {
    savedNumber += 1;
    savedJobs.push({ _id: `save-${String(savedNumber).padStart(5, "0")}`, candidateId: candidate._id, jobId: job._id, savedAt: daysAgo(Math.floor(random() * 120)) });
  }
}

function replaceCollection(name, documents) {
  const collection = db.getCollection(name);
  collection.deleteMany({});
  if (documents.length) collection.insertMany(documents, { ordered: false });
  print(`${name}: ${documents.length} documents`);
}

replaceCollection("companies", companies);
replaceCollection("jobs", jobs);
replaceCollection("candidates", candidates);
replaceCollection("applications", applications);
replaceCollection("interviews", interviews);
replaceCollection("activity_events", activityEvents);
replaceCollection("saved_jobs", savedJobs);

db.candidates.createIndex({ skills: 1, isDiscoverable: 1 });
db.candidates.createIndex({ preferredDepartments: 1, lastActiveAt: -1 });
db.jobs.createIndex({ status: 1, department: 1, postedAt: -1 });
db.jobs.createIndex({ requiredSkills: 1, status: 1 });
db.applications.createIndex({ candidateId: 1, appliedAt: -1 });
db.applications.createIndex({ jobId: 1, status: 1, appliedAt: -1 });
db.applications.createIndex({ companyId: 1, appliedAt: -1 });
db.activity_events.createIndex({ applicationId: 1, occurredAt: 1 });
db.activity_events.createIndex({ type: 1, occurredAt: -1 });
db.saved_jobs.createIndex({ candidateId: 1, jobId: 1 }, { unique: true });
db.saved_jobs.createIndex({ candidateId: 1, savedAt: -1 });
db.saved_jobs.createIndex({ jobId: 1, savedAt: -1 });
db.interviews.createIndex({ scheduledAt: 1, status: 1 });

print(`\nSeed complete in database: ${db.getName()}`);
print("Try candidate cand-0001 for the recommendation exercise.");
