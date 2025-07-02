import fitz  # PyMuPDF
import re
import requests

TAVILY_API_KEY = "your_tavily_api_key_here"
PDF_PATH = "history_class9.pdf"

# Regex pattern to match "1. Chapter Name"
CHAPTER_PATTERN = re.compile(r"^\s*\d+\.\s+([A-Za-z].+)", re.MULTILINE)

def extract_chapters(pdf_path):
    doc = fitz.open(pdf_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text()

    matches = list(CHAPTER_PATTERN.finditer(full_text))
    chapters = []

    for i, match in enumerate(matches):
        start_idx = match.start()
        end_idx = matches[i + 1].start() if i + 1 < len(matches) else len(full_text)
        title = match.group(0).strip()
        content = full_text[start_idx:end_idx].strip()
        chapters.append({"title": title, "content": content})

    return chapters

def upload_to_tavily(chapters):
    url = "https://api.tavily.com/documents/add"
    headers = {
        "Authorization": f"Bearer {TAVILY_API_KEY}",
        "Content-Type": "application/json"
    }

    for chapter in chapters:
        print(f"📤 Uploading: {chapter['title']}...")
        response = requests.post(url, headers=headers, json={"documents": [chapter]})
        if response.status_code == 200:
            print("✅ Success!")
        else:
            print(f"❌ Failed: {response.text}")

if __name__ == "__main__":
    print("🔍 Extracting textbook content...")
    chapters = extract_chapters(PDF_PATH)
    print(f"✅ Found {len(chapters)} chapters.")
    upload_to_tavily(chapters)
