# HireTrail MongoDB Aggregation Lab

A synthetic recruiting marketplace for practicing MongoDB aggregation. The scenario follows candidates discovering jobs, saving roles, applying, moving through a hiring pipeline, and attending interviews. It is designed to be realistic enough for analytics and recommendation exercises while containing no real personal data.

## Run the dataset

Install MongoDB Community Server locally, then run the seed with `mongosh`:

```sh
mongosh "mongodb://127.0.0.1:27017/hiretrail_agg_lab" --file database/mongodb-aggregation-lab/seed.js
```

The script inserts deterministic synthetic records into the selected database and creates indexes. Rerunning it replaces documents in these seven collections: `companies`, `jobs`, `candidates`, `applications`, `interviews`, `activity_events`, and `saved_jobs`. It does not drop the database.

The seed uses a fixed reference date of **October 27, 2026** so date-based exercises have repeatable results. It generates 18 companies, 90 jobs, 600 candidate profiles, several thousand applications, application stage events, interviews, and saved jobs.

## Data model

- **companies**: employer identity and industry.
- **jobs**: department, required skills, location/workplace, experience, salary, status, and posting dates.
- **candidates**: skills, experience, location, discoverability, activity, and job preferences.
- **applications**: one candidate/job relationship, current status, source, matched-skill count, and embedded `stageHistory`.
- **activity_events**: normalized timeline events for each application stage transition.
- **interviews**: scheduled or completed interview events and optional score.
- **saved_jobs**: candidate bookmarks used for personalization and exclusion rules.

IDs are stable strings such as `cand-0001`, `job-001`, and `app-00001`. Use `ObjectId` only if you want an additional schema-migration exercise.

## Suggested workflow

1. Run the seed and inspect a few documents from each collection.
2. Solve the challenges in `exercises.md` in order. Write one pipeline per challenge and record the expected output shape.
3. Compare offset pagination with keyset pagination on `jobs` sorted by `postedAt` and `_id`.
4. For the recommendation challenge, start with transparent rules and explain the score; treat it as a learning exercise, not a production hiring decision system.

MongoDB aggregation reference: [Aggregation pipeline](https://www.mongodb.com/docs/manual/core/aggregation-pipeline/), [pipeline stages](https://www.mongodb.com/docs/manual/reference/operator/aggregation-pipeline/), and [aggregation operators](https://www.mongodb.com/docs/manual/reference/operator/aggregation/).
