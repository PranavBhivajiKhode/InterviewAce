import os
import json
import cv2
import time
import math
from collections import Counter

import moviepy.editor as mp
import speech_recognition as sr
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from deepface import DeepFace
import mediapipe as mp_solutions  # NEW: MediaPipe
try:
    import whisper  # NEW: Whisper (optional)
    WHISPER_AVAILABLE = True
except ImportError:
    whisper = None
    WHISPER_AVAILABLE = False

# ------------------ CONFIG ------------------

UPLOAD_FOLDER = "uploads"
MAX_ANALYSIS_SECONDS = 180          # analyze at most first 3 minutes of video
FRAME_SAMPLE_EVERY_SEC = 2.0        # sample one frame every N seconds for emotion/gaze
TEMP_AUDIO_PREFIX = "temp_audio"

# Ideal speaking rate range for scoring (words per minute)
MIN_IDEAL_WPM = 90
MAX_IDEAL_WPM = 160

# Choose Whisper model (if installed)
WHISPER_MODEL_NAME = "small"  # "tiny", "base", "small" – small = better accuracy, still okay on CPU

# -------------------------------------------------

app = Flask(__name__)
CORS(app)

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Haar cascades kept (not used for gaze now, but you can reuse if needed)
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)
eye_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_eye.xml"
)

# Load Whisper model once (if available) to avoid reloading every request
WHISPER_MODEL = None
if WHISPER_AVAILABLE:
    try:
        print(f"[WHISPER] Loading Whisper model: {WHISPER_MODEL_NAME}")
        WHISPER_MODEL = whisper.load_model(WHISPER_MODEL_NAME)
        print("[WHISPER] Model loaded successfully")
    except Exception as e:
        print(f"[WHISPER] Failed to load model: {e}")
        WHISPER_AVAILABLE = False

# -------------------------------------------------
# Helper: robust speech-to-text and fluency stats
# -------------------------------------------------

def analyze_audio_fluency(video_path: str) -> dict:
    """
    Extract audio from the video, run speech recognition on (a trimmed) version,
    and compute filler words, word count, and speaking rate.

    Pipeline:
    - Extract audio (<= MAX_ANALYSIS_SECONDS)
    - Prefer Whisper for ASR (if installed)
    - Fallback: Google STT via speech_recognition
    """
    print(f"[AUDIO] Starting audio & fluency analysis for {video_path}")

    transcript = ""
    filler_count = 0
    word_count = 0
    speaking_rate_wpm = 0.0
    filler_per_100_words = 0.0

    audio_path = None
    clip = None

    try:
        clip = mp.VideoFileClip(video_path)
        if clip.audio is None:
            print("[AUDIO] No audio track found in video.")
            return {
                "transcript": "No audio detected in video.",
                "filler_count": 0,
                "word_count": 0,
                "speaking_rate_wpm": 0.0,
                "filler_per_100_words": 0.0,
                "status": "no_audio"
            }

        duration = clip.duration or 0.0
        print(f"[AUDIO] Video duration: {duration:.2f} seconds")

        # Limit audio duration to reduce latency
        effective_duration = min(duration, MAX_ANALYSIS_SECONDS)
        audio_clip = clip.subclip(0, effective_duration)

        # Unique temp audio file
        ts = int(time.time() * 1000)
        audio_path = os.path.join(
            UPLOAD_FOLDER, f"{TEMP_AUDIO_PREFIX}_{ts}.wav"
        )

        print(f"[AUDIO] Exporting audio to {audio_path}")
        audio_clip.audio.write_audiofile(audio_path, logger=None)

        # Release resources ASAP
        audio_clip.close()
        clip.close()
        clip = None

        # 1) Prefer Whisper for transcription if available
        if WHISPER_AVAILABLE and WHISPER_MODEL is not None:
            try:
                print("[AUDIO] Using Whisper ASR...")
                result = WHISPER_MODEL.transcribe(
                    audio_path,
                    fp16=False,   # CPU-friendly
                    language="en"
                )
                transcript = result.get("text", "").strip()
                print(f"[AUDIO] Whisper transcript (preview): {transcript[:80]}...")
            except Exception as e:
                print(f"[AUDIO] Whisper failed, falling back to Google STT: {e}")
                transcript = ""

        # 2) Fallback: Google SpeechRecognition if Whisper didn’t give transcript
        if not transcript:
            print("[AUDIO] Using Google SpeechRecognition fallback...")
            r = sr.Recognizer()
            with sr.AudioFile(audio_path) as source:
                r.adjust_for_ambient_noise(source, duration=0.5)
                audio_data = r.record(source)
            try:
                transcript = r.recognize_google(audio_data)
                print(f"[AUDIO] Google STT transcript (preview): {transcript[:80]}...")
            except sr.UnknownValueError:
                print("[AUDIO] Speech recognition: could not understand audio")
                transcript = "Audio unclear or no speech detected."
            except sr.RequestError as e:
                print(f"[AUDIO] Speech recognition service error: {e}")
                transcript = "Speech recognition service unavailable (check internet)."

        # Clean & analyze fillers only if we have a meaningful transcript
        if transcript and not transcript.startswith("Audio unclear") and not transcript.startswith("Speech recognition"):
            import re

            text = transcript.lower()
            # remove punctuation for simpler tokenization
            text_clean = re.sub(r"[^\w\s]", " ", text)
            words = text_clean.split()
            word_count = len(words)

            single_word_fillers = [
                "um", "uh", "ah", "er", "em", "like", "so",
                "well", "right", "actually", "basically"
            ]
            multi_word_fillers = [
                "you know", "i mean", "kind of", "sort of"
            ]

            # single-word fillers
            filler_count = sum(1 for w in words if w in single_word_fillers)
            # multi-word phrases (count occurrences in text)
            for phrase in multi_word_fillers:
                filler_count += text.count(phrase)

            # speaking rate
            if effective_duration > 0 and word_count > 0:
                speaking_rate_wpm = (word_count / effective_duration) * 60.0

            if word_count > 0:
                filler_per_100_words = (filler_count / word_count) * 100.0

    except Exception as e:
        print(f"[AUDIO] Error while analyzing audio: {e}")
        if not transcript:
            transcript = f"Audio analysis error: {str(e)}"
    finally:
        # Clean temp audio
        if audio_path and os.path.exists(audio_path):
            try:
                os.remove(audio_path)
                print(f"[AUDIO] Deleted temp audio: {audio_path}")
            except Exception as e:
                print(f"[AUDIO] Could not delete temp audio: {e}")
        if clip is not None:
            try:
                clip.close()
            except:
                pass

    return {
        "transcript": transcript,
        "filler_count": filler_count,
        "word_count": word_count,
        "speaking_rate_wpm": round(speaking_rate_wpm, 2),
        "filler_per_100_words": round(filler_per_100_words, 2),
        "status": "ok",
    }

# -------------------------------------------------
# Helper: video frames for gaze + emotion (IRIS based)
# -------------------------------------------------

def analyze_gaze_and_emotion(video_path: str) -> dict:
    """
    Approximate eye contact and dominant emotions using:
    - DeepFace for emotion (sampled frames, downscaled)
    - MediaPipe Face Mesh + Iris for gaze:
      we look at iris center relative to eye corners to see
      if the candidate is roughly looking at the screen/camera.
    """
    print(f"[VIDEO] Starting gaze & emotion analysis for {video_path}")

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("[VIDEO] Could not open video with OpenCV.")
        return {
            "emotions": {},
            "emotion_summary": {
                "dominant_emotion": "unknown",
                "confidence": 0.0
            },
            "gaze": {
                "percentage": 0.0,
                "looked_away_events": 0,
                "total_face_frames": 0,
                "frames_with_eye_contact": 0
            }
        }

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 30.0
    total_frames = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    video_duration = total_frames / fps if fps > 0 else 0.0

    print(f"[VIDEO] FPS: {fps:.2f}, Frames: {total_frames}, Duration: {video_duration:.2f}s")

    max_frames_to_analyze = int(min(video_duration, MAX_ANALYSIS_SECONDS) * fps)
    sample_stride = int(FRAME_SAMPLE_EVERY_SEC * fps)
    if sample_stride <= 0:
        sample_stride = int(fps)

    emotion_counts = Counter()
    total_face_frames = 0
    frames_with_eye_contact = 0

    frame_idx = 0

    mp_face_mesh = mp_solutions.solutions.face_mesh

    def avg_coords(landmarks, indices):
        xs = [landmarks[i].x for i in indices]
        ys = [landmarks[i].y for i in indices]
        return sum(xs) / len(xs), sum(ys) / len(ys)

    with mp_face_mesh.FaceMesh(
        static_image_mode=False,
        max_num_faces=1,
        refine_landmarks=True,  # needed for iris
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5
    ) as face_mesh:

        while True:
            ret, frame = cap.read()
            if not ret or frame_idx >= max_frames_to_analyze:
                break

            if frame_idx % sample_stride == 0:
                # ---------- EMOTION ANALYSIS ----------
                try:
                    small_frame = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
                    emotion_result = DeepFace.analyze(
                        small_frame,
                        actions=["emotion"],
                        enforce_detection=False,
                        detector_backend="opencv"  # faster
                    )
                    if isinstance(emotion_result, list) and len(emotion_result) > 0:
                        dom = emotion_result[0].get("dominant_emotion", None)
                    else:
                        dom = emotion_result.get("dominant_emotion", None)

                    if dom:
                        emotion_counts[dom] += 1
                except Exception:
                    # DeepFace may fail for some frames; skip them
                    pass

                # ---------- GAZE / SCREEN ENGAGEMENT (IRIS) ----------
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = face_mesh.process(rgb_frame)

                if results.multi_face_landmarks:
                    total_face_frames += 1
                    landmarks = results.multi_face_landmarks[0].landmark

                    # Eye corners & iris indices (MediaPipe FaceMesh)
                    # Left eye: 33 (outer), 133 (inner)
                    # Right eye: 362 (outer), 263 (inner)
                    # Left iris: 468, 469, 470, 471
                    # Right iris: 473, 474, 475, 476
                    try:
                        # LEFT EYE
                        left_outer = landmarks[33]
                        left_inner = landmarks[133]
                        left_iris_x, _ = avg_coords(landmarks, [468, 469, 470, 471])

                        # RIGHT EYE
                        right_outer = landmarks[362]
                        right_inner = landmarks[263]
                        right_iris_x, _ = avg_coords(landmarks, [473, 474, 475, 476])

                        # Normalized iris position within each eye (0 = outer, 1 = inner)
                        def normalized_pos(outer, inner, iris_x):
                            denom = (inner.x - outer.x)
                            if abs(denom) < 1e-5:
                                return 0.5
                            return (iris_x - outer.x) / denom

                        left_norm = normalized_pos(left_outer, left_inner, left_iris_x)
                        right_norm = normalized_pos(right_outer, right_inner, right_iris_x)

                        # If iris is near the center of both eyes, we assume
                        # the candidate is looking toward the screen/camera.
                        # 0.3–0.7 = central region (tune if needed)
                        left_centered = 0.3 <= left_norm <= 0.7
                        right_centered = 0.3 <= right_norm <= 0.7

                        # Extra safety: head not rotated too much (using symmetry)
                        # Compare distance nose->left eye vs nose->right eye
                        nose = landmarks[1]
                        def dist(a, b):
                            return math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)

                        d_left = dist(left_outer, nose)
                        d_right = dist(right_outer, nose)
                        ratio_lr = min(d_left, d_right) / max(d_left, d_right) if max(d_left, d_right) > 0 else 1.0
                        is_head_facing = ratio_lr > 0.75  # tune: higher = stricter

                        is_looking_at_screen = left_centered and right_centered and is_head_facing

                        if is_looking_at_screen:
                            frames_with_eye_contact += 1

                    except Exception as e:
                        # If any landmark missing, skip gaze for this frame
                        pass

            frame_idx += 1

    cap.release()

    gaze_percentage = 0.0
    if total_face_frames > 0:
        gaze_percentage = (frames_with_eye_contact / total_face_frames) * 100.0

    # ---------- EMOTION SUMMARY ----------
    if emotion_counts:
        dominant_emotion, count = emotion_counts.most_common(1)[0]
        total_emotion_frames = sum(emotion_counts.values())
        confidence = (count / total_emotion_frames) * 100.0
    else:
        dominant_emotion = "neutral"
        confidence = 0.0

    print(f"[VIDEO] Eye contact (screen engagement): {gaze_percentage:.2f}% over {total_face_frames} face frames")
    print(f"[VIDEO] Dominant emotion: {dominant_emotion} ({confidence:.2f}%)")

    return {
        "emotions": dict(emotion_counts),
        "emotion_summary": {
            "dominant_emotion": dominant_emotion,
            "confidence": round(confidence, 2)
        },
        "gaze": {
            "percentage": round(gaze_percentage, 2),
            "looked_away_events": max(total_face_frames - frames_with_eye_contact, 0),
            "total_face_frames": total_face_frames,
            "frames_with_eye_contact": frames_with_eye_contact
        }
    }

# -------------------------------------------------
# Helper: combine into scores
# -------------------------------------------------

def compute_interview_scores(gaze: dict, fluency: dict) -> dict:
    """
    Convert raw metrics into simple 0-100 scores (for UI / report).
    """
    # Eye contact score
    gaze_pct = gaze.get("percentage", 0.0)
    # Cap between 0 and 100
    eye_contact_score = max(0.0, min(100.0, gaze_pct))

    # Fluency score
    filler_per_100 = fluency.get("filler_per_100_words", 0.0)
    wpm = fluency.get("speaking_rate_wpm", 0.0)

    # Filler penalty: more fillers -> lower score
    filler_penalty = min(50.0, (filler_per_100 / 2.0) * 10.0)
    base_fluency = 100.0 - filler_penalty

    # Speaking rate adjustment
    if wpm <= 0:
        speaking_adjust = -20.0
    elif wpm < MIN_IDEAL_WPM:
        speaking_adjust = -15.0
    elif wpm > MAX_IDEAL_WPM:
        speaking_adjust = -10.0
    else:
        speaking_adjust = 0.0

    fluency_score = max(0.0, min(100.0, base_fluency + speaking_adjust))

    # Overall score: simple average for now
    overall_score = round((eye_contact_score + fluency_score) / 2.0, 1)

    return {
        "eye_contact_score": round(eye_contact_score, 1),
        "fluency_score": round(fluency_score, 1),
        "overall_score": overall_score
    }

# -------------------------------------------------
# Main analysis pipeline
# -------------------------------------------------

def analyze_full_interview(video_path: str) -> dict:
    """
    Full pipeline: fluency + gaze + emotions + derived scores.
    """
    print(f"[PIPELINE] Running full analysis for {video_path}")

    fluency_result = analyze_audio_fluency(video_path)
    video_result = analyze_gaze_and_emotion(video_path)

    scores = compute_interview_scores(
        gaze=video_result.get("gaze", {}),
        fluency=fluency_result
    )

    return {
        "status": "success",
        "fluency": fluency_result,
        "gaze": video_result.get("gaze", {}),
        "emotions": video_result.get("emotions", {}),
        "emotion_summary": video_result.get("emotion_summary", {}),
        "scores": scores
    }

# -------------------------------------------------
# Flask endpoints
# -------------------------------------------------

@app.route("/")
def hello():
    return "Python Video Interview AI Backend is running!"

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "video-analysis",
        "version": "3.0"
    })

@app.route("/upload-video", methods=["POST"])
def upload_video():
    if "video" not in request.files:
        return jsonify({"success": False, "error": "No video file found in request"}), 400

    file = request.files["video"]
    if file.filename == "":
        return jsonify({"success": False, "error": "No selected file"}), 400

    try:
        ts = int(time.time() * 1000)
        # keep original extension if possible
        ext = os.path.splitext(file.filename)[1] or ".webm"
        filename = f"interview_{ts}{ext}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        print(f"[UPLOAD] Saved video to {filepath}")

        # Run full analysis
        analysis_results = analyze_full_interview(filepath)

        # Save analysis JSON
        analysis_filename = f"analysis_{ts}.json"
        analysis_filepath = os.path.join(UPLOAD_FOLDER, analysis_filename)
        with open(analysis_filepath, "w", encoding="utf-8") as f:
            json.dump(analysis_results, f, indent=2)

        return jsonify({
            "success": True,
            "message": "Video uploaded and analyzed",
            "video_url": f"/get-video/{filename}",
            "analysis_url": f"/get-analysis/{analysis_filename}",
            "results": analysis_results
        }), 200

    except Exception as e:
        print(f"[UPLOAD] Analysis error: {e}")
        return jsonify({
            "success": False,
            "error": f"Analysis failed: {str(e)}"
        }), 500

@app.route("/get-video/<filename>")
def get_video(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route("/get-analysis/<filename>")
def get_analysis(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == "__main__":
    # threaded=True allows multiple requests; debug=False recommended in prod
    app.run(debug=True, port=5000, threaded=True)
