// Data seeding: Fetch bills from Congress.gov API + run AI enrichment
// Run: npx tsx seed/seed-bills.ts
//
// Currently using mock data in src/api/bills.ts (10 realistic bills).
// When the real backend is ready, this script will:
//   1. Fetch bills from the Congress.gov API (congress_api_key required)
//   2. Run AI enrichment (summary_ai, impact_story, impact_personas)
//   3. Write results to the database
//
// Mock data covers: healthcare, immigration, education, climate, tax,
// veterans, technology, family/childcare, gun safety, and housing.
