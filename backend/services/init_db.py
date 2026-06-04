import os
import sqlite3
import json

def init_twitter_db():
    # Only run if environment variable is present
    accounts_json = os.getenv("TWITTER_ACCOUNTS_JSON")
    if not accounts_json:
        print("⚠️ TWITTER_ACCOUNTS_JSON not found in environment. Skipping database initialization.")
        return
        
    try:
        accounts = json.loads(accounts_json)
    except Exception as e:
        print(f"❌ Error parsing TWITTER_ACCOUNTS_JSON: {e}")
        return
        
    db_path = "accounts.db"
    
    try:
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        
        # Create table if it doesn't exist
        c.execute("""
        CREATE TABLE IF NOT EXISTS accounts (
            username TEXT PRIMARY KEY NOT NULL COLLATE NOCASE,
            password TEXT NOT NULL,
            email TEXT NOT NULL COLLATE NOCASE,
            email_password TEXT NOT NULL,
            user_agent TEXT NOT NULL,
            active BOOLEAN DEFAULT FALSE NOT NULL,
            locks TEXT DEFAULT '{}' NOT NULL,
            headers TEXT DEFAULT '{}' NOT NULL,
            cookies TEXT DEFAULT '{}' NOT NULL,
            proxy TEXT DEFAULT NULL,
            error_msg TEXT DEFAULT NULL,
            stats TEXT DEFAULT '{}' NOT NULL,
            last_used TEXT DEFAULT NULL,
            _tx TEXT DEFAULT NULL
        )
        """)
        
        for acc in accounts:
            username = acc.get("username")
            if not username:
                continue
            password = acc.get("password", "")
            email = acc.get("email", "")
            email_password = acc.get("email_password", "")
            auth_token = acc.get("auth_token", "")
            ct0 = acc.get("ct0", "")
            
            # Form cookies json
            cookies_dict = {"auth_token": auth_token, "ct0": ct0}
            cookies_json = json.dumps(cookies_dict)
            
            # Check if account already exists
            c.execute("SELECT username FROM accounts WHERE username=?", (username,))
            exists = c.fetchone()
            
            user_agent = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Mobile/15E148 Safari/604.1"
            
            if exists:
                c.execute("""
                UPDATE accounts 
                SET password=?, email=?, email_password=?, cookies=?, active=1, error_msg=NULL 
                WHERE username=?
                """, (password, email, email_password, cookies_json, username))
                print(f"🔄 Updated Twitter account in database: {username}")
            else:
                c.execute("""
                INSERT INTO accounts (username, password, email, email_password, user_agent, active, cookies)
                VALUES (?, ?, ?, ?, ?, 1, ?)
                """, (username, password, email, email_password, user_agent, cookies_json))
                print(f"➕ Inserted Twitter account into database: {username}")
                
        conn.commit()
        print("✅ Twitter database initialized successfully!")
    except Exception as e:
        print(f"❌ Error initializing Twitter accounts.db: {e}")
    finally:
        conn.close()
