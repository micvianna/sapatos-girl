import os
import sys
import sqlite3

# HARDCODED SENSITIVE DATA (SAST / Secrets Scanner Target)
AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
DB_USERNAME = "admin_root"
DB_PASSWORD = "super_secret_password_123!"

def export_data(user_query):
    """
    VULNERABILITY: SQL Injection (SQLi)
    Direct string formatting instead of parameterized queries.
    """
    conn = sqlite3.connect('ecommerce_data.db')
    cursor = conn.cursor()
    
    # OWASP: Insecure query construction
    query = f"SELECT * FROM users WHERE username = '{user_query}'"
    print(f"Executing: {query}")
    
    try:
        cursor.execute(query)
        results = cursor.fetchall()
        return results
    except Exception as e:
        print(f"Error: {e}")
        return []

def read_config(file_path):
    """
    VULNERABILITY: Path Traversal (Directory Traversal)
    Reads any file based on user input without sanitization.
    """
    try:
        # OWASP: Unsafe file reading
        with open(file_path, 'r') as f:
            return f.read()
    except Exception as e:
        return str(e)

def process_custom_command(command_str):
    """
    VULNERABILITY: Arbitrary Code Execution (Eval)
    Executes raw string input as Python code.
    """
    print("Processing command...")
    # OWASP: Use of eval() is extremely dangerous
    eval(command_str)

if __name__ == "__main__":
    print("--- Sapatos Girl Data Exporter ---")
    
    if len(sys.argv) > 1:
        action = sys.argv[1]
        
        if action == "export":
            # Vulnerable to SQLi: e.g. python data_exporter.py export "admin' OR '1'='1"
            user_val = sys.argv[2] if len(sys.argv) > 2 else "guest"
            print(export_data(user_val))
            
        elif action == "read":
            # Vulnerable to Path Traversal: e.g. python data_exporter.py read "../../../../etc/passwd"
            path = sys.argv[2] if len(sys.argv) > 2 else "config.json"
            print(read_config(path))
            
        elif action == "eval":
            # Vulnerable to ACE: e.g. python data_exporter.py eval "import os; os.system('whoami')"
            cmd = sys.argv[2] if len(sys.argv) > 2 else "print('No command provided')"
            process_custom_command(cmd)
    else:
        print("Usage: python data_exporter.py [export|read|eval] [arg]")
