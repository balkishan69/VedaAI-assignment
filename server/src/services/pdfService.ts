import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import type { AssignmentDocument } from "../models/Assignment.js";

const outputDir = path.resolve(process.cwd(), "generated");

function ensureOutputDir() {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
}

export async function generateAssignmentPdf(assignment: AssignmentDocument) {
  if (!assignment.result) throw new Error("Assignment has no generated result");
  const result = assignment.result;
  ensureOutputDir();
  const filePath = path.join(outputDir, `${assignment.id}-question-paper.pdf`);

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: "A4", bufferPages: true });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(18).font("Helvetica-Bold").text(result.title, { align: "center" });
    doc.moveDown(0.6);
    doc.fontSize(10).font("Helvetica").text(`Subject: ${assignment.subject}`, { continued: true }).text(`   Grade: ${assignment.grade}`, { align: "right" });
    doc.text(`Total Marks: ${result.totalMarks}`, { continued: true }).text(`   Duration: ${result.durationMinutes} minutes`, { align: "right" });
    doc.moveDown(1.2);
    doc.text("Name: ______________________________", { continued: true }).text(" Roll No: __________________", { align: "right" });
    doc.text("Section: ___________________________");
    doc.moveDown(1.2);

    result.sections.forEach((section) => {
      doc.fontSize(13).font("Helvetica-Bold").text(section.title);
      doc.fontSize(10).font("Helvetica-Oblique").text(section.instruction);
      doc.moveDown(0.4);
      section.questions.forEach((question, index) => {
        doc.fontSize(10).font("Helvetica").text(`${index + 1}. ${question.text}`, { continued: false });
        doc.fontSize(9).fillColor("#555555").text(`${question.difficulty.toUpperCase()} | ${question.marks} marks`);
        doc.fillColor("#000000").moveDown(0.35);
      });
      doc.moveDown(0.7);
    });

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return filePath;
}
