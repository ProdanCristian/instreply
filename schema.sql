CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  instagram_access_token TEXT,
  instagram_user_id TEXT,
  subscription_tier TEXT DEFAULT 'free'
);

CREATE TABLE automation_rules (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  trigger_type TEXT NOT NULL,
  trigger_conditions TEXT,
  response_type TEXT NOT NULL,
  response_template TEXT,
  ai_prompt TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE message_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  rule_id TEXT,
  instagram_message_id TEXT,
  instagram_thread_id TEXT,
  sender_id TEXT,
  message_content TEXT,
  response_content TEXT,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (rule_id) REFERENCES automation_rules(id)
);

CREATE TABLE instagram_webhooks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  challenge_token TEXT,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);