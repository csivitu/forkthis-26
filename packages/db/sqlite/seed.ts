import { participantsDb } from "./client";
import { participants } from "./schema";
import list from "./participants.json"; // string[] of emails

for (const email of list as string[]) {
  await participantsDb.insert(participants)
    .values({ email: email.toLowerCase().trim(), createdAt: new Date() })
    .onConflictDoNothing();
}
console.log(`Seeded ${list.length} participants`);