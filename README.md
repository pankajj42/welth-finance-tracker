# Full Stack AI Fianace Platform

Make sure you replicate the .env.example file and create a .env file with all the secrets.

This project uses

- NextJS
- Shandcn UI
- Clerk - for authentication.
- Prisma ORM - for database - I used PostgresSQL - supabase.
- arcjet - to add security features like rate limiting.
- inngest - to run cron jobs - which process recuring transactions - achieving event batching and throttling, to send mails when budget limit reaches 90%, to sends monthly budget reports.
- resend - to send emails.
- google gemini api - to process receipt images, easing the process of adding transactions.
- used vercel to deploy the project.
