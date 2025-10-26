import io
import re
import json
import tempfile
import os
from pathlib import Path
from typing import Optional, Dict, List, Tuple
from collections import Counter
from datetime import datetime
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import pdfplumber
import docx
import uvicorn  

BASE_DIR = Path(__file__).parent

# Load skills DB
skills_path = BASE_DIR / "skills.json"
if not skills_path.exists():
    raise RuntimeError(f"skills.json not found at {skills_path}")
with open(skills_path, "r", encoding="utf-8") as f:
    SKILLS_DB = [s.lower() for s in json.load(f)]

# Enhanced Role-specific skills and keywords with weights
ROLE_SKILLS = {
    "software engineer": {
        "must_have": ["git", "python", "java", "javascript", "sql", "api", "testing"],
        "good_to_have": ["react", "node.js", "docker", "kubernetes", "aws", "azure", "ci/cd", "agile"],
        "keywords": ["api", "backend", "frontend", "full-stack", "microservices", "testing", "deployment", "scalability"],
        "action_verbs": ["developed", "implemented", "built", "designed", "architected", "optimized", "deployed"]
    },
    "data analyst": {
        "must_have": ["sql", "excel", "python", "statistics", "data analysis"],
        "good_to_have": ["tableau", "power bi", "r", "pandas", "visualization", "looker", "dashboards"],
        "keywords": ["analysis", "reporting", "metrics", "dashboard", "forecasting", "insights", "data-driven"],
        "action_verbs": ["analyzed", "reported", "forecasted", "visualized", "investigated", "identified"]
    },
    "machine learning engineer": {
        "must_have": ["python", "tensorflow", "pytorch", "scikit-learn", "machine learning"],
        "good_to_have": ["deep learning", "nlp", "computer vision", "mlops", "spark", "aws", "model deployment"],
        "keywords": ["model", "training", "accuracy", "neural network", "pipeline", "feature engineering", "optimization"],
        "action_verbs": ["trained", "optimized", "deployed", "researched", "experimented", "validated"]
    },
    "frontend developer": {
        "must_have": ["javascript", "html", "css", "react", "responsive design"],
        "good_to_have": ["typescript", "tailwind", "vue", "angular", "webpack", "next.js"],
        "keywords": ["ui", "ux", "component", "state management", "performance", "accessibility"],
        "action_verbs": ["designed", "implemented", "optimized", "created", "enhanced"]
    },
    "backend developer": {
        "must_have": ["python", "java", "node.js", "sql", "api", "rest"],
        "good_to_have": ["microservices", "docker", "mongodb", "redis", "graphql", "kafka"],
        "keywords": ["api", "database", "server", "scalability", "architecture", "performance"],
        "action_verbs": ["architected", "built", "scaled", "optimized", "integrated"]
    },
    "devops engineer": {
        "must_have": ["docker", "kubernetes", "ci/cd", "linux", "git", "aws"],
        "good_to_have": ["terraform", "ansible", "jenkins", "monitoring", "azure", "gcp"],
        "keywords": ["automation", "deployment", "infrastructure", "monitoring", "orchestration"],
        "action_verbs": ["automated", "deployed", "configured", "monitored", "optimized"]
    }
}

# Enhanced positive action verbs
ACTION_VERBS = [
    "achieved", "improved", "trained", "mentored", "created", "designed", "developed",
    "implemented", "reduced", "increased", "launched", "led", "managed", "optimized",
    "resolved", "streamlined", "automated", "built", "delivered", "enhanced", "executed",
    "founded", "generated", "innovated", "pioneered", "scaled", "spearheaded", "transformed"
]

app = FastAPI(title="Enhanced Resume Analyzer API")

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*"  # Allow all for development - restrict in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    max_age=86400
)

class AnalyzeRequest(BaseModel):
    userId: str
    resumeUrl: str
    role: Optional[str] = ""
    experience: Optional[str] = ""
    name: Optional[str] = ""

# Download resume file (for URL-based uploads)
def download_file(url: str) -> bytes:
    try:
        if 'firebasestorage.googleapis.com' in url and 'alt=media' not in url:
            separator = '&' if '?' in url else '?'
            url = f"{url}{separator}alt=media"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
        
        resp = requests.get(url, timeout=30, headers=headers, allow_redirects=True)
        resp.raise_for_status()
        return resp.content
        
    except requests.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Failed to download resume: {str(e)}")

# PDF parser
def extract_text_from_pdf_bytes(b: bytes) -> str:
    pages = []
    with pdfplumber.open(io.BytesIO(b)) as pdf:
        for p in pdf.pages:
            text = p.extract_text()
            if text:
                pages.append(text)
    return "\n".join(pages)

# DOCX parser
def extract_text_from_docx_bytes(b: bytes) -> str:
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
            tmp.write(b)
            temp_path = tmp.name
        doc = docx.Document(temp_path)
        return "\n".join([p.text for p in doc.paragraphs])
    finally:
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)

# Enhanced cleaning
def simple_clean(text: str) -> str:
    text = re.sub(r'\t+', ' ', text)
    text = re.sub(r' +', ' ', text)
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    return text.strip().lower()

# Extract contact information
def extract_contact_info(text: str) -> Dict[str, bool]:
    contacts = {
        "email": bool(re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)),
        "phone": bool(re.search(r'(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})', text)),
        "linkedin": bool(re.search(r'linkedin\.com/in/[\w-]+', text, re.I)),
        "github": bool(re.search(r'github\.com/[\w-]+', text, re.I)),
        "portfolio": bool(re.search(r'(portfolio|website|http)', text, re.I))
    }
    return contacts

# Enhanced skill extraction with context
def extract_skills(text: str) -> Tuple[List[str], Dict[str, int]]:
    found_skills = set()
    skill_frequency = Counter()
    
    words = re.findall(r'\b\w+(?:\.\w+)?\b', text.lower())
    text_with_spaces = ' ' + text.lower() + ' '
    
    for skill in SKILLS_DB:
        if ' ' in skill or '.' in skill:
            pattern = r'\b' + re.escape(skill) + r'\b'
            matches = re.findall(pattern, text_with_spaces)
            if matches:
                found_skills.add(skill)
                skill_frequency[skill] = len(matches)
        else:
            if skill in words:
                found_skills.add(skill)
                skill_frequency[skill] = words.count(skill)
    
    return sorted(list(found_skills)), dict(skill_frequency)

# Enhanced section detection
def extract_sections(text: str) -> Dict[str, str]:
    patterns = {
        "summary": r'\b(summary|profile|objective|about\s+me|professional\s+summary)\b',
        "skills": r'\b(skills|technical\s+skills|core\s+skills|competencies|expertise)\b',
        "experience": r'\b(experience|work\s+experience|employment|professional\s+experience)\b',
        "education": r'\b(education|academic|qualifications|degrees)\b',
        "projects": r'\b(projects|portfolio|work\s+samples)\b',
        "certifications": r'\b(certifications?|licenses?|credentials)\b',
        "achievements": r'\b(achievements?|awards?|honors?|accomplishments?)\b'
    }

    lines = text.split('\n')
    sections = {}
    current_section = "header"
    current_content = []
    
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue
            
        matched = False
        for section_name, pattern in patterns.items():
            if re.search(pattern, line_stripped, re.I) and len(line_stripped) < 50:
                if current_content:
                    sections[current_section] = '\n'.join(current_content)
                current_section = section_name
                current_content = []
                matched = True
                break
        
        if not matched:
            current_content.append(line_stripped)
    
    if current_content:
        sections[current_section] = '\n'.join(current_content)
    
    return sections

# Analyze experience years and details
def analyze_experience(exp_text: str, user_exp: str) -> Dict:
    year_ranges = re.findall(r'(20\d{2})\s*[-–—to]+\s*(20\d{2}|present|current)', exp_text, re.I)
    
    total_years = 0
    for start, end in year_ranges:
        start_year = int(start)
        end_year = datetime.now().year if end.lower() in ['present', 'current'] else int(end)
        total_years += max(0, end_year - start_year)
    
    explicit_years = re.findall(r'(\d+)\+?\s*years?', exp_text, re.I)
    if explicit_years:
        total_years = max(total_years, int(explicit_years[0]))
    
    return {
        "years_found": total_years,
        "consistent": True if not user_exp else abs(total_years - float(user_exp or 0)) <= 1,
        "detail_level": "high" if len(exp_text.split('\n')) > 5 else "medium" if len(exp_text) > 100 else "low"
    }

# Count action verbs
def count_action_verbs(text: str) -> Tuple[int, List[str]]:
    found_verbs = []
    for verb in ACTION_VERBS:
        if re.search(r'\b' + verb + r'\w*\b', text, re.I):
            found_verbs.append(verb)
    return len(found_verbs), found_verbs

# Analyze achievements and quantification
def analyze_achievements(text: str) -> Dict:
    metrics_patterns = {
        "percentage": r'\d+%',
        "money": r'\$\d+[kmb]?',
        "numbers": r'\b\d+\+?\b',
        "time_saved": r'\d+\s*(hours?|days?|weeks?|months?)',
        "team_size": r'team\s+of\s+\d+',
    }
    
    metrics_found = {}
    for metric_type, pattern in metrics_patterns.items():
        matches = re.findall(pattern, text, re.I)
        metrics_found[metric_type] = len(matches)
    
    total_metrics = sum(metrics_found.values())
    
    return {
        "total_quantified": total_metrics,
        "metrics_breakdown": metrics_found,
        "has_impact": total_metrics > 3
    }

# Check ATS optimization
def check_ats_optimization(text: str, sections: Dict) -> Dict:
    ats_score = {}
    ats_score["simple_formatting"] = not bool(re.search(r'[│┤┼╪╫╬═║]', text))
    ats_score["no_images_text"] = True
    ats_score["standard_sections"] = len(set(sections.keys()) & {"experience", "education", "skills"}) == 3
    ats_score["contact_info"] = bool(re.search(r'@', text))
    word_count = len(text.split())
    ats_score["appropriate_length"] = 300 < word_count < 1500
    return ats_score

# Enhanced scoring function
def compute_scores(
    text: str, 
    found_skills: List[str], 
    skill_freq: Dict[str, int],
    sections: Dict[str, str], 
    role: str, 
    user_experience: str
) -> Tuple[int, Dict]:
    
    detailed_scores = {
        "format_structure": 0,
        "contact_info": 0,
        "skills_match": 0,
        "experience_quality": 0,
        "education": 0,
        "achievements_impact": 0,
        "ats_optimization": 0,
    }
    
    # 1. Format & Structure (15 points)
    required_sections = {"experience", "education", "skills"}
    found_sections = set(sections.keys())
    section_score = len(required_sections & found_sections) * 4
    detailed_scores["format_structure"] = min(section_score, 12)
    
    if "summary" in sections or "header" in sections:
        detailed_scores["format_structure"] += 3
    
    # 2. Contact Information (5 points)
    contacts = extract_contact_info(text)
    contact_score = sum([2 if k in ["email", "phone"] else 0.5 for k, v in contacts.items() if v])
    detailed_scores["contact_info"] = min(contact_score, 5)
    
    # 3. Skills Match (25 points)
    role_lower = role.lower()
    if role_lower in ROLE_SKILLS:
        role_info = ROLE_SKILLS[role_lower]
        found_set = set(found_skills)
        
        must_have = set(role_info["must_have"])
        good_to_have = set(role_info["good_to_have"])
        
        must_have_found = must_have & found_set
        good_to_have_found = good_to_have & found_set
        
        must_have_score = len(must_have_found) * 2.5
        good_to_have_score = len(good_to_have_found) * 1
        
        detailed_scores["skills_match"] = min(must_have_score + good_to_have_score, 25)
    else:
        detailed_scores["skills_match"] = min(len(found_skills) * 2, 25)
    
    # 4. Experience Quality (20 points)
    exp_text = sections.get("experience", "")
    if exp_text:
        exp_analysis = analyze_experience(exp_text, user_experience)
        action_count, _ = count_action_verbs(exp_text)
        
        if exp_analysis["consistent"]:
            detailed_scores["experience_quality"] += 5
        elif exp_analysis["years_found"] > 0:
            detailed_scores["experience_quality"] += 3
        
        if exp_analysis["detail_level"] == "high":
            detailed_scores["experience_quality"] += 5
        elif exp_analysis["detail_level"] == "medium":
            detailed_scores["experience_quality"] += 3
        
        detailed_scores["experience_quality"] += min(action_count * 0.5, 5)
        
        if role_lower in ROLE_SKILLS:
            keywords = ROLE_SKILLS[role_lower]["keywords"]
            keyword_matches = sum(1 for k in keywords if k in exp_text.lower())
            detailed_scores["experience_quality"] += min(keyword_matches * 0.8, 5)
    
    # 5. Education (10 points)
    edu_text = sections.get("education", "")
    if edu_text:
        degrees = ["bachelor", "master", "phd", "b.tech", "m.tech", "b.s", "m.s", "degree"]
        if any(d in edu_text.lower() for d in degrees):
            detailed_scores["education"] += 5
        
        if re.search(r'20\d{2}', edu_text):
            detailed_scores["education"] += 3
        
        if re.search(r'gpa|coursework|courses', edu_text, re.I):
            detailed_scores["education"] += 2
    
    # 6. Achievements & Impact (15 points)
    achievement_analysis = analyze_achievements(text)
    if achievement_analysis["has_impact"]:
        detailed_scores["achievements_impact"] += 8
    else:
        detailed_scores["achievements_impact"] += min(achievement_analysis["total_quantified"] * 1.5, 5)
    
    impact_verbs = ["increased", "decreased", "improved", "reduced", "achieved", "exceeded"]
    impact_count = sum(1 for v in impact_verbs if v in text)
    detailed_scores["achievements_impact"] += min(impact_count * 1, 7)
    
    # 7. ATS Optimization (10 points)
    ats_check = check_ats_optimization(text, sections)
    ats_score = sum([
        3 if ats_check["standard_sections"] else 0,
        2 if ats_check["simple_formatting"] else 0,
        2 if ats_check["contact_info"] else 0,
        3 if ats_check["appropriate_length"] else 1
    ])
    detailed_scores["ats_optimization"] = min(ats_score, 10)
    
    total_score = sum(detailed_scores.values())
    return min(round(total_score), 100), detailed_scores

# Generate personalized recommendations
def generate_recommendations(
    detailed_scores: Dict,
    found_skills: List[str],
    sections: Dict,
    role: str,
    text: str
) -> Dict[str, List[str]]:
    
    strengths = []
    improvements = []
    critical_issues = []
    
    contacts = extract_contact_info(text)
    if sum(contacts.values()) >= 3:
        strengths.append("✓ Complete contact information with professional links")
    elif not contacts["email"]:
        critical_issues.append("⚠ Missing email address - this is critical for ATS systems")
    
    if detailed_scores["format_structure"] >= 12:
        strengths.append("✓ Well-organized resume with clear section headers")
    elif detailed_scores["format_structure"] < 8:
        critical_issues.append("⚠ Missing key sections - add Summary, Skills, Experience, and Education")
    
    role_lower = role.lower()
    if role_lower in ROLE_SKILLS:
        role_info = ROLE_SKILLS[role_lower]
        found_set = set(found_skills)
        missing_must = set(role_info["must_have"]) - found_set
        missing_good = set(role_info["good_to_have"]) - found_set
        
        if detailed_scores["skills_match"] >= 20:
            strengths.append(f"✓ Excellent technical skills alignment for {role}")
        elif detailed_scores["skills_match"] >= 15:
            strengths.append(f"✓ Good technical skills for {role}")
        
        if missing_must:
            critical_issues.append(f"⚠ Missing critical skills: {', '.join(list(missing_must)[:3])}")
        if missing_good and len(missing_good) > 3:
            improvements.append(f"Consider adding: {', '.join(list(missing_good)[:4])}")
    
    if detailed_scores["experience_quality"] >= 15:
        strengths.append("✓ Strong experience section with action verbs and details")
    else:
        if detailed_scores["experience_quality"] < 10:
            critical_issues.append("⚠ Experience section lacks detail and impact")
        improvements.append("Start bullet points with strong action verbs (led, developed, improved)")
    
    achievement_analysis = analyze_achievements(text)
    if achievement_analysis["has_impact"]:
        strengths.append("✓ Quantified achievements with measurable impact")
    else:
        improvements.append("Add metrics to show impact (e.g., 'Increased efficiency by 30%', 'Managed team of 5')")
    
    if detailed_scores["education"] >= 7:
        strengths.append("✓ Clear education credentials")
    elif detailed_scores["education"] < 5:
        improvements.append("Add graduation years and relevant coursework to education")
    
    if detailed_scores["ats_optimization"] >= 8:
        strengths.append("✓ ATS-friendly formatting and structure")
    else:
        improvements.append("Use standard section headers and avoid complex tables or graphics")
    
    action_count, found_verbs = count_action_verbs(text)
    if action_count < 5:
        improvements.append("Use more action verbs throughout your resume (achieved, developed, led)")
    
    word_count = len(text.split())
    if word_count < 300:
        critical_issues.append("⚠ Resume is too short - aim for 400-600 words for better ATS scores")
    elif word_count > 1500:
        improvements.append("Consider condensing content to 1-2 pages for better readability")
    
    return {
        "strengths": strengths,
        "improvements": improvements,
        "critical_issues": critical_issues
    }

# NEW ENDPOINT: Direct file upload and analysis
@app.post("/upload-and-analyze")
async def upload_and_analyze(
    file: UploadFile = File(...),
    userId: str = Form(...),
    name: str = Form(""),
    role: str = Form(""),
    experience: str = Form("")
):
    """
    Accept PDF/DOCX file directly from frontend and analyze it.
    No external storage needed - processes file in memory.
    """
    
    # Validate file type
    if not (file.filename.endswith('.pdf') or file.filename.endswith('.docx')):
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported"
        )
    
    # Read file bytes
    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Could not read file: {str(e)}"
        )
    
    # Check file size (limit to 10MB)
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10MB"
        )
    
    # Extract text
    try:
        text = extract_text_from_pdf_bytes(file_bytes)
        if len(text.strip()) < 50:
            text = extract_text_from_docx_bytes(file_bytes)
    except Exception:
        try:
            text = extract_text_from_docx_bytes(file_bytes)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Text extraction failed: {str(e)}"
            )
    
    if len(text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Resume text too short or empty. Please ensure your PDF contains readable text."
        )
    
    # Clean and analyze
    clean_text = simple_clean(text)
    sections = extract_sections(clean_text)
    found_skills, skill_frequency = extract_skills(clean_text)
    
    # Compute scores
    ats_score, detailed_scores = compute_scores(
        clean_text, 
        found_skills, 
        skill_frequency,
        sections, 
        role,
        experience
    )
    
    # Generate recommendations
    recommendations = generate_recommendations(
        detailed_scores,
        found_skills,
        sections,
        role,
        clean_text
    )
    
    # Get missing skills
    role_lower = role.lower() if role else ""
    missing_required = []
    missing_preferred = []
    
    if role_lower in ROLE_SKILLS:
        role_info = ROLE_SKILLS[role_lower]
        found_set = set(found_skills)
        missing_required = [s for s in role_info["must_have"] if s not in found_set]
        missing_preferred = [s for s in role_info["good_to_have"] if s not in found_set]
    
    # Top skills by frequency
    top_skills = sorted(skill_frequency.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # Calculate match percentage
    match_percentage = round((ats_score / 100) * 100, 1)
    
    # Score interpretation
    if ats_score >= 80:
        score_label = "Excellent"
        score_color = "green"
    elif ats_score >= 60:
        score_label = "Good"
        score_color = "blue"
    elif ats_score >= 40:
        score_label = "Fair"
        score_color = "orange"
    else:
        score_label = "Needs Improvement"
        score_color = "red"
    
    return {
        "success": True,
        "candidate_name": name or "Candidate",
        "role": role or "General",
        "experience": experience or "Not specified",
        "ats_score": ats_score,
        "score_label": score_label,
        "score_color": score_color,
        "match_percentage": match_percentage,
        "detailed_scores": {
            "Format & Structure": detailed_scores["format_structure"],
            "Contact Information": detailed_scores["contact_info"],
            "Skills Match": detailed_scores["skills_match"],
            "Experience Quality": detailed_scores["experience_quality"],
            "Education": detailed_scores["education"],
            "Achievements & Impact": detailed_scores["achievements_impact"],
            "ATS Optimization": detailed_scores["ats_optimization"]
        },
        "analysis": {
            "skills_found": found_skills,
            "total_skills": len(found_skills),
            "top_skills": [{"skill": s, "frequency": f} for s, f in top_skills],
            "missing_required_skills": missing_required,
            "missing_preferred_skills": missing_preferred[:5],
            "sections_found": list(sections.keys()),
            "word_count": len(clean_text.split()),
        },
        "recommendations": recommendations,
        "next_steps": [
            "Address all critical issues immediately",
            "Add missing required skills if you have them",
            "Quantify achievements with specific metrics",
            "Review and implement suggested improvements"
        ]
    }

@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0"}

@app.get("/roles")
def get_roles():
    """Get list of supported roles."""
    return {
        "roles": list(ROLE_SKILLS.keys()),
        "total": len(ROLE_SKILLS)
    }
    # --- CORRECTED: Removed the stray code block that was here ---

# OLD ENDPOINT: URL-based analysis (keep for backward compatibility)
@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    """Enhanced resume analysis from URL."""
    try:
        file_bytes = download_file(req.resumeUrl)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not download resume: {e}")

    try:
        text = extract_text_from_pdf_bytes(file_bytes)
        if len(text.strip()) < 50:
            text = extract_text_from_docx_bytes(file_bytes)
    except Exception:
        try:
            text = extract_text_from_docx_bytes(file_bytes)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Text extraction failed: {e}")

    if len(text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Resume text too short or empty")

    clean_text = simple_clean(text)
    sections = extract_sections(clean_text)
    found_skills, skill_frequency = extract_skills(clean_text)
    
    ats_score, detailed_scores = compute_scores(
        clean_text, 
        found_skills, 
        skill_frequency,
        sections, 
        req.role,
        req.experience
    )
    
    recommendations = generate_recommendations(
        detailed_scores,
        found_skills,
        sections,
        req.role,
        clean_text
    )
    
    role_lower = req.role.lower() if req.role else ""
    missing_required = []
    missing_preferred = []
    
    if role_lower in ROLE_SKILLS:
        role_info = ROLE_SKILLS[role_lower]
        found_set = set(found_skills)
        missing_required = [s for s in role_info["must_have"] if s not in found_set]
        missing_preferred = [s for s in role_info["good_to_have"] if s not in found_set]
    
    top_skills = sorted(skill_frequency.items(), key=lambda x: x[1], reverse=True)[:10]
    match_percentage = round((ats_score / 100) * 100, 1)
    
    if ats_score >= 80:
        score_label = "Excellent"
        score_color = "green"
    elif ats_score >= 60:
        score_label = "Good"
        score_color = "blue"
    elif ats_score >= 40:
        score_label = "Fair"
        score_color = "orange"
    else:
        score_label = "Needs Improvement"
        score_color = "red"
    
    return {
        "success": True,
        "candidate_name": req.name or "Candidate",
        "role": req.role or "General",
        "experience": req.experience or "Not specified",
        "ats_score": ats_score,
        "score_label": score_label,
        "score_color": score_color,
        "match_percentage": match_percentage,
        "detailed_scores": {
            "Format & Structure": detailed_scores["format_structure"],
            "Contact Information": detailed_scores["contact_info"],
            "Skills Match": detailed_scores["skills_match"],
            "Experience Quality": detailed_scores["experience_quality"],
            "Education": detailed_scores["education"],
            "Achievements & Impact": detailed_scores["achievements_impact"],
            "ATS Optimization": detailed_scores["ats_optimization"]
        },
        "analysis": {
            "skills_found": found_skills,
            "total_skills": len(found_skills),
            "top_skills": [{"skill": s, "frequency": f} for s, f in top_skills],
            "missing_required_skills": missing_required,
            "missing_preferred_skills": missing_preferred[:5],
            "sections_found": list(sections.keys()),
            "word_count": len(clean_text.split()),
        },
        "recommendations": recommendations,
        "next_steps": [
            "Address all critical issues immediately",
            "Add missing required skills if you have them",
            "Quantify achievements with specific metrics",
            "Review and implement suggested improvements"
        ]
    }

# ADDED: Uvicorn runner for local development
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)