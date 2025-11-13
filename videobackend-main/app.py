import os
import json
import cv2
import time  # ADD THIS
import moviepy.editor as mp
import speech_recognition as sr
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from deepface import DeepFace

app = Flask(__name__)
CORS(app) 

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

def analyze_fluency_and_gaze(video_path):
    """
    Analyzes the video for emotions, gaze, and speech fluency.
    """
    print(f"Starting full analysis on {video_path}...")
    
    # --- 1. Audio & Fluency Analysis ---
    transcript = ""
    filler_count = 0
    audio_path = os.path.join(UPLOAD_FOLDER, f"temp_audio_{int(time.time())}.wav")  # FIXED: Unique filename
    video_clip = None  # FIXED: Initialize variable
    
    try:
        # Extract audio from video
        print("Extracting audio...")
        video_clip = mp.VideoFileClip(video_path)
        
        if video_clip.audio is None:
            print("No audio track found in video")
            transcript = "No audio detected in video."
            filler_count = 0
        else:
            video_clip.audio.write_audiofile(audio_path, logger=None)  # FIXED: Suppress moviepy logs
            
            # FIXED: Close video clip immediately after audio extraction
            video_clip.close()
            video_clip = None
            
            # Wait a bit for file to be released
            time.sleep(0.5)
            
            # Recognize speech
            print("Recognizing speech...")
            r = sr.Recognizer()
            
            try:
                with sr.AudioFile(audio_path) as source:
                    # Adjust for ambient noise
                    r.adjust_for_ambient_noise(source, duration=0.5)
                    audio_data = r.record(source)
                    
                    # Try Google Speech Recognition
                    try:
                        transcript = r.recognize_google(audio_data)
                        print(f"Transcript: {transcript[:100]}...")
                    except sr.UnknownValueError:
                        print("Google Speech Recognition could not understand audio")
                        transcript = "Audio unclear or no speech detected."
                    except sr.RequestError as e:
                        print(f"Could not request results from Google Speech Recognition service; {e}")
                        transcript = "Speech recognition service unavailable (no internet?)."
                
                # Count filler words
                if transcript and not transcript.startswith("Audio") and not transcript.startswith("Speech"):
                    filler_words = ["um", "uh", "ah", "like", "you know", "so", "basically", "actually", "well", "right"]
                    words = transcript.lower().split()
                    filler_count = sum(1 for word in words if word in filler_words)
                    print(f"Filler words found: {filler_count}")
                
            except Exception as audio_error:
                print(f"Error processing audio file: {audio_error}")
                transcript = "Could not process audio."
                
    except Exception as e:
        print(f"Could not analyze audio: {e}")
        transcript = f"Audio analysis error: {str(e)}"
        filler_count = 0
        
    finally:
        # FIXED: Ensure video clip is properly closed
        if video_clip is not None:
            try:
                video_clip.close()
            except:
                pass
        
        # FIXED: Wait and retry file deletion
        if os.path.exists(audio_path):
            max_retries = 5
            for i in range(max_retries):
                try:
                    os.remove(audio_path)
                    print(f"Temp audio file deleted: {audio_path}")
                    break
                except PermissionError:
                    if i < max_retries - 1:
                        print(f"File locked, retrying deletion... ({i+1}/{max_retries})")
                        time.sleep(1)
                    else:
                        print(f"Warning: Could not delete {audio_path}. Will be cleaned up later.")
            
    # --- 2. Gaze & Emotion Analysis ---
    print("Starting gaze and emotion analysis...")
    emotion_counts = {}
    gaze_frames = 0
    total_face_frames = 0
    
    try:
        cap = cv2.VideoCapture(video_path)
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        if fps == 0:
            fps = 30
            
        frame_count = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Analyze 1 frame every second
            if frame_count % fps == 0:
                # --- Emotion Analysis ---
                try:
                    emotion_result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
                    if isinstance(emotion_result, list) and len(emotion_result) > 0:
                        dominant_emotion = emotion_result[0]['dominant_emotion']
                        emotion_counts[dominant_emotion] = emotion_counts.get(dominant_emotion, 0) + 1
                except Exception as e:
                    pass  # Skip this frame

                # --- Gaze Analysis ---
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                faces = face_cascade.detectMultiScale(gray, 1.1, 4)
                
                if len(faces) > 0:
                    (x, y, w, h) = faces[0]
                    total_face_frames += 1
                    face_roi_gray = gray[y:y+h, x:x+w]
                    eyes = eye_cascade.detectMultiScale(face_roi_gray)
                    
                    is_looking_at_camera = False
                    if len(eyes) > 0:
                        avg_eye_y = sum([ey + eh/2 for (ex, ey, ew, eh) in eyes]) / len(eyes)
                        if avg_eye_y < (h * 0.6):
                            is_looking_at_camera = True
                    
                    if is_looking_at_camera:
                        gaze_frames += 1

            frame_count += 1
            
        cap.release()
        
    except Exception as e:
        print(f"Error during video processing: {e}")

    gaze_percentage = (gaze_frames / total_face_frames) * 100 if total_face_frames > 0 else 0
    print(f"Gaze analysis complete. Eye contact: {gaze_percentage:.2f}%")
    
    # --- 3. Combine All Results ---
    return {
        "status": "success",
        "emotions": emotion_counts,
        "gaze": {
            "percentage": round(gaze_percentage, 2),
            "looked_away_events": total_face_frames - gaze_frames,
            "total_face_frames": total_face_frames
        },
        "fluency": {
            "transcript": transcript,
            "filler_count": filler_count,
            "word_count": len(transcript.split()) if transcript else 0
        }
    }


@app.route('/')
def hello():
    return "Python AI Backend is running!"

@app.route('/upload-video', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return jsonify({"error": "No video file found"}), 400
    
    file = request.files['video']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = f"interview_{int(time.time())}.webm"  # FIXED: Unique filename
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        try:
            # Trigger analysis
            analysis_results = analyze_fluency_and_gaze(filepath)
            
            # Save results
            analysis_filename = f"analysis_{int(time.time())}.json"
            analysis_filepath = os.path.join(UPLOAD_FOLDER, analysis_filename)
            with open(analysis_filepath, 'w') as f:
                json.dump(analysis_results, f, indent=2)

            return jsonify({
                "success": True, 
                "message": "Video uploaded and analyzed",
                "video_url": f"/get-video/{filename}",
                "analysis_url": f"/get-analysis/{analysis_filename}",
                "results": analysis_results  # ADDED: Return results directly
            }), 200
            
        except Exception as e:
            print(f"Analysis error: {e}")
            return jsonify({
                "success": False,
                "error": f"Analysis failed: {str(e)}"
            }), 500

@app.route('/get-video/<filename>')
def get_video(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/get-analysis/<filename>')
def get_analysis(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)
    
if __name__ == '__main__':
    app.run(debug=True, port=5000, threaded=True)