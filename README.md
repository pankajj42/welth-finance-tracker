# Full Stack AI Fianace Platform

Make sure you replicate the .env.example file and create a .env file with all the secrets.

This project uses

- NextJS
- Shandcn UI
- Clerk - for authentication.
- Prisma ORM - for database - I used PostgresSQL - supabase.
- arcjet - to add security features like rate limiting.
- inngest - to run cron jobs - which process recuring transactions - achieving event batching and throttling, to send mails when budget limit reaches 90%, to sends monthly budget reports.
  npx inngest-cli@latest dev - to run local inngest server - to test various functions
- resend - to send emails.
  npm run email - to run the local server - to preview email designs
- google gemini api - to process receipt images, easing the process of adding transactions.
- used vercel to deploy the project.

- To seed the account with some dummy data - you can use the API with query Params - userId, accountId - directly from the database entries.
  E.g. http://localhost:3000/api/seed?userId=00f67d3f-c3c4-485d-90b6-d83e3da929b7&accountId=8cbf67a4-1a39-473c-9828-4654f3a51c1c
