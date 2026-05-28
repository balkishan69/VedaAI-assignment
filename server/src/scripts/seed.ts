import { connectDatabase } from "../config/database.js";
import { createAssignment } from "../services/assignmentService.js";

async function seed() {
  await connectDatabase();
  const assignment = await createAssignment({
    title: "Climate Systems Assessment",
    subject: "Geography",
    grade: "Grade 9",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    sourceText: "Students studied monsoon patterns, pressure belts, ocean currents, and the impact of climate change on agriculture.",
    instructions: "Include conceptual, application, and analysis questions.",
    questionSpecs: [
      { type: "mcq", count: 4, marks: 1, difficulty: "easy" },
      { type: "short", count: 3, marks: 3, difficulty: "medium" },
      { type: "case-study", count: 1, marks: 6, difficulty: "hard" }
    ]
  });
  console.log(`Seeded assignment ${assignment.id}`);
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
