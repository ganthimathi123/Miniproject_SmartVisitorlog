import cv2
import face_recognition
import numpy as np
import requests
from datetime import datetime

# API endpoint
API_URL = "http://localhost:3000/api"

# Load known faces
known_face_encodings = []
known_face_names = []

def load_known_faces():
    """Load known faces from dataset"""
    pass

def verify_otp_and_start_camera(otp):
    response = requests.post(f"{API_URL}/door/verify-otp", json={"otp": otp})
    
    if response.json().get("verified"):
        print("OTP verified. Starting facial recognition...")
        return recognize_face()
    else:
        print("Invalid OTP")
        return False

def recognize_face():
    video_capture = cv2.VideoCapture(0)
    print("Camera started. Looking for faces...")

    face_found = False
    person_id = None
    name = "Unknown"

    for _ in range(30):
        ret, frame = video_capture.read()
        if not ret:
            continue

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding)

            if True in matches:
                idx = matches.index(True)
                name = known_face_names[idx]
                person_id = f"PERSON_{idx}"
                face_found = True
                break
            else:
                person_id = f"UNKNOWN_{datetime.now().timestamp()}"

        if face_found:
            break

    video_capture.release()

    if face_found:
        print(f"Face recognized: {name}")
        unlock_door()
        log_visitor(person_id, name, True)
        return True
    else:
        print("Face not recognized")
        log_visitor(person_id or "UNKNOWN", "Unknown", False)
        return False

def unlock_door():
    try:
        requests.post(f"{API_URL}/door/unlock")
        print("Door unlocked")
    except Exception as e:
        print(e)

def log_visitor(person_id, name, access_granted):
    try:
        requests.post(f"{API_URL}/visitor/log", json={
            "personId": person_id,
            "name": name,
            "accessGranted": access_granted,
            "timestamp": datetime.now().isoformat()
        })
        print("Visitor logged")
    except Exception as e:
        print(e)

if __name__ == "__main__":
    load_known_faces()
    otp = input("Enter OTP: ")
    verify_otp_and_start_camera(otp)
