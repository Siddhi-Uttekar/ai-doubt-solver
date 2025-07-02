import fs from "fs";
import path from "path";

// File paths
const rawPath = path.resolve("./data/raw/textbook.json");
const outputPath = path.resolve("data/processed/structuredtb.json");

// Read raw data
const raw = JSON.parse(fs.readFileSync(rawPath, "utf-8"));
const lines = raw.lines;

// Matches lines like: "1 Sources of History", "2. India : Events after 1960"
const chapterHeaderRegex = /^(\d{1,2})[.:]?\s+(.*)/;

// Force known titles to validate chapters
const knownTitles = [
  "Sources of History",
  "India : Events after 1960",
  "India’s Internal Challenges",
  "Economic Development",
  "Education",
  "Empowerment of Women",
  "Science and Technology",
  "Industry and Trade",
  "Changing Life : 1",
  "Changing Life : 2"
];

// Store structured chapters
const chapters = [];
let currentChapter = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  const match = line.match(chapterHeaderRegex);

  if (match) {
    const chapterTitle = match[2].trim();

    const isValid = knownTitles.some(known =>
      chapterTitle.toLowerCase().includes(known.toLowerCase().slice(0, 5))
    );

    if (isValid) {
      if (currentChapter) chapters.push(currentChapter);

      currentChapter = {
        title: `${match[1]}. ${chapterTitle}`,
        content: ""
      };
      continue;
    }
  }

  // Append to current chapter if started
  if (currentChapter) {
    currentChapter.content += line + " ";
  }
}

// Push last chapter
if (currentChapter) chapters.push(currentChapter);

// Save output
fs.writeFileSync(outputPath, JSON.stringify({ chapters }, null, 2));
console.log(`✅ Saved ${chapters.length} chapters to: ${outputPath}`);
