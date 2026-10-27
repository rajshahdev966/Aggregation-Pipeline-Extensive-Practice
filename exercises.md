# Aggregation challenges

Use the seeded `hiretrail_agg_lab` database. Unless a challenge says otherwise, only count applications against jobs that were open when the candidate applied if you can establish that from the available fields; otherwise state your assumption. Return fields useful to a real hiring team, sort results deterministically, and avoid leaking candidate email addresses in leaderboard-style outputs.

## 1. Job directory with filters and pagination

Build the backend pipeline for the public job directory. Support optional filters for `status`, `department`, `location`, `employmentType`, a salary floor, and one or more required skills. Return a page of 10 jobs sorted by `postedAt` descending and `_id` ascending, plus the total number of matching jobs. Include the company name and industry.

**Practice:** `$match`, `$sort`, `$skip`, `$limit`, `$lookup`, `$project`, `$facet`.

**Stretch:** implement keyset pagination using the last row's `(postedAt, _id)` cursor. Explain why stable sorting and a unique tie-breaker matter, and compare it with `$skip` for deep pages.

## 2. Hiring overview dashboard

For each company, report active job count, applications received in the last 30 days, number currently in interview, offers, hires, and median posted-job salary midpoint. Include companies with zero recent applications.

**Practice:** `$lookup`, `$unwind`, `$group`, conditional `$sum`, `$ifNull`, `$avg`, `$sort`.

## 3. Application funnel by job

For every job, count distinct applications that reached each stage: applied, screening, interview, offer, hired, rejected, and withdrawn. Return conversion rates from applied to interview and interview to offer. Keep jobs with zero applications.

**Practice:** `$unwind` over `stageHistory`, conditional aggregation, distinct candidate/application counting, `$lookup`, `$arrayToObject` or grouped stage rows.

## 4. Time-to-hire and stage bottlenecks

For each company and department, calculate median days from application to first interview, from first interview to offer, and from application to hire. Report sample size and omit incomplete intervals from the relevant median. Which departments appear to have the slowest screening step?

**Practice:** `$unwind`, `$sort`, `$group`, `$dateDiff`, `$set`, `$median` (or a compatible percentile approach), `$facet`.

## 5. Candidate acquisition quality

Group applications by source and application month. Report application count, interview rate, offer rate, hire rate, and average days to first interview. Sort chronologically within each source. Which sources produce the most applications, and which convert best?

**Practice:** `$dateTrunc`, `$group`, conditional sums, `$lookup` or embedded history, `$project`, `$sort`.

## 6. Skills that lead to hires

For hired applications, expand each candidate's skills and rank the skills associated with the most hires. Include distinct hired candidates and the total number of applications for context. Filter out skills with fewer than five hired candidates.

**Practice:** multi-collection `$lookup`, `$unwind`, `$group`, `$addToSet`, `$size`, `$sort`.

## 7. Candidate search results with facets

Create recruiter search results for discoverable candidates matching a department and minimum experience. Return a page of 20 candidate cards, total result count, counts by location, and counts by top skill. Do not return email. Use deterministic ordering by last activity and candidate ID.

**Practice:** `$facet`, `$bucket` or `$group`, array operators, `$project`, pagination.

## 8. Interview calendar and workload

For the next 14 days, group scheduled interviews by company, job, and day. Return interview count, interview types, and candidate count. Also list interviewers' workload if you add an `interviewerId` field and an `interviewers` collection.

**Practice:** date-range `$match`, `$dateTrunc`, `$lookup`, `$group`, `$push`, `$addToSet`.

## 9. Re-engagement list

Find discoverable candidates who have not been active for at least 30 days, have no application updated in the last 45 days, and have at least one relevant active job posted within the last 30 days. Return candidate ID, last active date, number of matching jobs, and the three most recently posted matches. Exclude candidates who already applied to those jobs.

**Practice:** correlated `$lookup` with `let`/`$expr`, `$filter`, `$sortArray` (or sort and limit inside lookup), date arithmetic, anti-join with `$lookup`.

## 10. Explainable job recommendations

For candidate `cand-0001`, recommend up to 10 active jobs they have neither applied to nor saved. Score each job using a transparent weighted formula, for example: required-skill overlap (50%), preferred department (20%), location/remote compatibility (15%), experience compatibility (10%), and salary compatibility (5%). Return the score and a `reasons` array such as `"3 matching skills"`, `"preferred department"`, or `"remote matches preference"`. Sort by score descending, then posting date descending, then job ID.

**Practice:** `$lookup` for applications and saved jobs, `$setIntersection`, `$size`, `$cond`, `$map`, `$filter`, `$sort`, `$limit`.

**Stretch:** normalize skill overlap by required-skill count; add a recency boost; evaluate recommendation coverage across all candidates; compare against a popularity baseline using recent saves and applications. Discuss cold start, stale profiles, fairness, and why the score should support discovery rather than make hiring decisions.

## Optional harder extensions

- Build a weekly application cohort retention table from `activity_events`.
- Detect duplicate applications from the same candidate to the same company within 90 days.
- Compute a job's time-varying funnel using `$setWindowFields`.
- Paginate with a compound cursor and show what can go wrong when new jobs arrive between page requests.
