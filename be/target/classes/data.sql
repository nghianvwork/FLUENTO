-- ===================================================
-- ENOVA Database Seed Data
-- ===================================================

-- ===================================================
-- CAREER PATHS
-- ===================================================
INSERT IGNORE INTO career_paths (id, name, description, icon, estimated_weeks, vocabulary_count, created_at) VALUES
(1, 'Information Technology', 'Master English for software development, DevOps, and IT management roles', '💻', 12, 500, NOW()),
(2, 'Marketing & Advertising', 'Learn marketing terminology for digital campaigns, branding, and analytics', '📊', 10, 400, NOW()),
(3, 'Finance & Banking', 'Financial English for banking, investment, and accounting professionals', '💰', 14, 550, NOW()),
(4, 'Healthcare & Medicine', 'Medical English for doctors, nurses, and healthcare administrators', '🏥', 16, 600, NOW()),
(5, 'Education & Teaching', 'Academic English for educators, researchers, and university staff', '📚', 8, 350, NOW()),
(6, 'Hospitality & Tourism', 'Service English for hotels, restaurants, and travel industry', '✈️', 8, 300, NOW()),
(7, 'Legal & Law', 'Legal English for lawyers, paralegals, and compliance officers', '⚖️', 14, 500, NOW()),
(8, 'Engineering', 'Technical English for civil, mechanical, and electrical engineers', '🔧', 12, 450, NOW()),
(9, 'Human Resources', 'HR English for recruitment, training, and employee relations', '👥', 10, 350, NOW()),
(10, 'E-commerce & Retail', 'Business English for online selling, supply chain, and customer service', '🛒', 8, 300, NOW());

-- ===================================================
-- SCENARIOS (AI Roleplay)
-- ===================================================
INSERT IGNORE INTO scenarios (id, title, description, category, difficulty, ai_personality, context_prompt, tags, is_active, created_at) VALUES
(1, 'Job Interview - Software Engineer', 'Practice a technical job interview for a senior software engineer position at a multinational company', 'INTERVIEW', 'INTERMEDIATE', 'PROFESSIONAL', 'You are a hiring manager at a major tech company. Conduct a professional job interview for a senior software engineer position. Ask about technical skills, experience, and behavioral questions.', 'interview,tech,software', true, NOW()),
(2, 'Job Interview - Marketing Manager', 'Prepare for a marketing manager position interview at a global advertising agency', 'INTERVIEW', 'INTERMEDIATE', 'PROFESSIONAL', 'You are the VP of Marketing at a global agency. Interview the candidate for a Marketing Manager role focusing on campaign strategy, analytics, and team leadership.', 'interview,marketing,management', true, NOW()),
(3, 'Client Presentation - Product Launch', 'Present a new product to international stakeholders', 'PRESENTATION', 'ADVANCED', 'FRIENDLY', 'You are a client attending a product launch presentation. Ask questions about features, pricing, timeline, and market strategy. Show genuine interest but also probe weak points.', 'presentation,business,product', true, NOW()),
(4, 'Business Meeting - Project Planning', 'Lead a project planning meeting with international team members', 'MEETING', 'INTERMEDIATE', 'FRIENDLY', 'You are a team member in a cross-functional project meeting. Participate actively, ask clarifying questions, suggest improvements, and discuss timelines and responsibilities.', 'meeting,project,teamwork', true, NOW()),
(5, 'Customer Complaint Handling', 'Handle a frustrated customer complaint professionally via phone', 'CUSTOMER_SERVICE', 'BEGINNER', 'DIFFICULT', 'You are an angry customer who received a defective product. Express frustration but remain reasonable. Escalate if the solution is not satisfactory.', 'customer,complaint,service', true, NOW()),
(6, 'Salary Negotiation', 'Negotiate your salary and benefits package with HR', 'NEGOTIATION', 'ADVANCED', 'PROFESSIONAL', 'You are an HR manager. Discuss the compensation package with the candidate. Be firm but fair. Present the company offer and respond to counter-proposals.', 'negotiation,salary,hr', true, NOW()),
(7, 'Coffee Chat - Networking', 'Have an informal networking conversation at a tech conference', 'NETWORKING', 'BEGINNER', 'FRIENDLY', 'You are a fellow attendee at a tech conference. Have a friendly casual conversation about your work, the conference, and industry trends.', 'networking,casual,conference', true, NOW()),
(8, 'Email Writing - Project Update', 'Compose a professional email updating stakeholders on project progress', 'EMAIL', 'INTERMEDIATE', 'PROFESSIONAL', 'You are the project stakeholder. Review the email draft and provide feedback on clarity, professionalism, and completeness.', 'email,writing,project', true, NOW()),
(9, 'Medical Consultation', 'Practice being a healthcare provider consulting with an English-speaking patient', 'HEALTHCARE', 'ADVANCED', 'FRIENDLY', 'You are a patient visiting a doctor. Describe your symptoms clearly, ask about diagnosis, treatment options, and follow-up care.', 'medical,healthcare,consultation', true, NOW()),
(10, 'Airport & Travel Situations', 'Navigate common airport scenarios: check-in, customs, asking for directions', 'TRAVEL', 'BEGINNER', 'FRIENDLY', 'You are an airline check-in agent. Help the traveler with check-in, baggage questions, and gate information. Be helpful and professional.', 'travel,airport,beginner', true, NOW()),
(11, 'Team Standup Meeting', 'Participate in a daily standup meeting with your engineering team', 'MEETING', 'BEGINNER', 'FRIENDLY', 'You are a team lead running a daily standup. Ask each person about their progress, blockers, and plans for today.', 'meeting,standup,agile', true, NOW()),
(12, 'Performance Review Discussion', 'Have your annual performance review with your manager', 'WORKPLACE', 'ADVANCED', 'PROFESSIONAL', 'You are a manager conducting an annual performance review. Discuss achievements, areas for improvement, career goals, and development plans.', 'performance,review,career', true, NOW()),
(13, 'Restaurant Ordering', 'Order food and interact with staff at a restaurant', 'DAILY_LIFE', 'BEGINNER', 'FRIENDLY', 'You are a waiter at an upscale restaurant. Take the customer order, suggest specials, handle dietary restrictions, and provide excellent service.', 'restaurant,food,daily', true, NOW()),
(14, 'Real Estate Negotiation', 'Negotiate rental terms for an apartment in a foreign city', 'NEGOTIATION', 'INTERMEDIATE', 'DIFFICULT', 'You are a landlord showing an apartment. Discuss rental terms, lease duration, included amenities, and negotiate the price.', 'real-estate,negotiation,rental', true, NOW()),
(15, 'Tech Support Call', 'Call tech support to resolve a software issue', 'CUSTOMER_SERVICE', 'INTERMEDIATE', 'FRIENDLY', 'You are a tech support agent. Help the customer troubleshoot their software issue step by step. Be patient and clear.', 'tech,support,troubleshooting', true, NOW());

-- ===================================================
-- VOCABULARIES (Sample for IT Career Path)
-- ===================================================
INSERT IGNORE INTO vocabularies (id, word, definition, pronunciation_ipa, example_sentences, career_path_id, difficulty, frequency_rank, created_at) VALUES
(1, 'deploy', 'To release and install software to a production environment', '/dɪˈplɔɪ/', '["We need to deploy the new version by Friday.", "The team deployed the hotfix to production."]', 1, 'BEGINNER', 1, NOW()),
(2, 'refactor', 'To restructure existing code without changing its external behavior', '/riːˈfæktər/', '["Let''s refactor this module to improve readability.", "The legacy code needs significant refactoring."]', 1, 'INTERMEDIATE', 2, NOW()),
(3, 'scalability', 'The ability of a system to handle growing amounts of work', '/ˌskeɪləˈbɪlɪti/', '["We must consider scalability when designing the architecture.", "Cloud services offer better scalability."]', 1, 'INTERMEDIATE', 3, NOW()),
(4, 'debugging', 'The process of finding and fixing errors in software', '/diːˈbʌɡɪŋ/', '["I spent hours debugging the authentication module.", "Debugging skills are essential for developers."]', 1, 'BEGINNER', 4, NOW()),
(5, 'API', 'Application Programming Interface - a set of protocols for building software', '/ˌeɪpiːˈaɪ/', '["The REST API handles all client-server communication.", "We need to document our API endpoints."]', 1, 'BEGINNER', 5, NOW()),
(6, 'sprint', 'A fixed time period in Agile methodology for completing work', '/sprɪnt/', '["Our sprint is two weeks long.", "We planned 20 story points for this sprint."]', 1, 'BEGINNER', 6, NOW()),
(7, 'bandwidth', 'Available capacity to handle tasks or data transfer', '/ˈbændwɪdθ/', '["I don''t have the bandwidth to take on another project.", "Check the network bandwidth before streaming."]', 1, 'INTERMEDIATE', 7, NOW()),
(8, 'stakeholder', 'A person with an interest or concern in a project', '/ˈsteɪkˌhoʊldər/', '["We need to present the roadmap to stakeholders.", "The stakeholders approved the budget increase."]', 1, 'INTERMEDIATE', 8, NOW()),
(9, 'milestone', 'A significant point or event in a project timeline', '/ˈmaɪlˌstoʊn/', '["We hit the beta release milestone ahead of schedule.", "Each milestone has specific deliverables."]', 1, 'BEGINNER', 9, NOW()),
(10, 'repository', 'A central location where code is stored and managed', '/rɪˈpɒzɪtɔːri/', '["Push your changes to the main repository.", "The repository contains all project documentation."]', 1, 'BEGINNER', 10, NOW()),
-- Marketing vocabulary
(11, 'conversion rate', 'The percentage of visitors who complete a desired action', '/kənˈvɜːʒən reɪt/', '["Our conversion rate increased by 15% this quarter.", "A/B testing helped improve the conversion rate."]', 2, 'BEGINNER', 1, NOW()),
(12, 'brand awareness', 'The extent to which consumers recognize a brand', '/brænd əˈweərnəs/', '["The campaign significantly boosted brand awareness.", "Social media is key for building brand awareness."]', 2, 'BEGINNER', 2, NOW()),
(13, 'ROI', 'Return on Investment - profit relative to cost', '/ˌɑːr.oʊˈaɪ/', '["The marketing campaign delivered a 300% ROI.", "We need to track ROI for every channel."]', 2, 'INTERMEDIATE', 3, NOW()),
-- Finance vocabulary
(14, 'portfolio', 'A collection of financial investments held by a person or organization', '/pɔːrtˈfoʊlioʊ/', '["Diversifying your portfolio reduces risk.", "The fund manager reviews the portfolio quarterly."]', 3, 'BEGINNER', 1, NOW()),
(15, 'liquidity', 'The availability of cash or easily convertible assets', '/lɪˈkwɪdɪti/', '["The company has strong liquidity to weather the downturn.", "Liquidity risk must be carefully managed."]', 3, 'INTERMEDIATE', 2, NOW()),
-- Healthcare vocabulary
(16, 'diagnosis', 'The identification of a disease or condition', '/ˌdaɪəɡˈnoʊsɪs/', '["The doctor confirmed the diagnosis after running tests.", "Early diagnosis is crucial for treatment success."]', 4, 'BEGINNER', 1, NOW()),
(17, 'prognosis', 'The likely course or outcome of a medical condition', '/prɒɡˈnoʊsɪs/', '["The prognosis is favorable with early intervention.", "Patients often ask about their prognosis."]', 4, 'INTERMEDIATE', 2, NOW());

-- ===================================================
-- LESSONS (Sample for IT Career Path)
-- ===================================================
INSERT IGNORE INTO lessons (id, career_path_id, title, lesson_type, content_json, order_index, estimated_minutes, created_at) VALUES
(1, 1, 'Tech Vocabulary Essentials', 'VOCABULARY', '{"words": ["deploy", "refactor", "scalability", "debugging", "API"], "exercises": [{"type": "match", "question": "Match the word with its definition"}, {"type": "fill_blank", "question": "We need to ___ the new version to production."}]}', 1, 15, NOW()),
(2, 1, 'Writing Professional Emails in Tech', 'WRITING', '{"template": "email", "scenario": "Write an email to your team about a deployment schedule change", "tips": ["Use clear subject line", "Be concise", "Include action items"]}', 2, 20, NOW()),
(3, 1, 'Daily Standup Communication', 'SPEAKING', '{"phrases": ["Yesterday I worked on...", "Today I plan to...", "I am blocked by..."], "practice": "Record yourself giving a standup update"}', 3, 10, NOW()),
(4, 1, 'Code Review Discussion', 'SPEAKING', '{"scenario": "Discuss code review feedback with a colleague", "phrases": ["I noticed that...", "Have you considered...", "This could be improved by..."]}', 4, 15, NOW()),
(5, 1, 'Sprint Planning Meeting', 'LISTENING', '{"audio_url": "/audio/sprint-planning.mp3", "transcript": "...", "questions": [{"q": "What was the main goal of the sprint?", "options": ["Ship the new feature", "Fix bugs", "Refactor code"]}]}', 5, 20, NOW()),
(6, 2, 'Marketing Campaign Vocabulary', 'VOCABULARY', '{"words": ["conversion rate", "brand awareness", "ROI", "engagement", "funnel"], "exercises": [{"type": "context", "question": "Use the word in a marketing context"}]}', 1, 15, NOW()),
(7, 2, 'Presenting Campaign Results', 'SPEAKING', '{"scenario": "Present Q3 marketing results to leadership", "metrics": ["impressions", "CTR", "conversions", "ROI"]}', 2, 20, NOW()),
(8, 3, 'Financial Report Vocabulary', 'VOCABULARY', '{"words": ["portfolio", "liquidity", "dividend", "equity", "leverage"], "exercises": []}', 1, 15, NOW()),
(9, 4, 'Patient Consultation Basics', 'SPEAKING', '{"scenario": "Conduct a basic patient consultation in English", "phrases": ["What brings you in today?", "How long have you had these symptoms?"]}', 1, 20, NOW()),
(10, 5, 'Academic Presentation Skills', 'SPEAKING', '{"scenario": "Present your research findings at an international conference", "structure": ["Introduction", "Methodology", "Results", "Discussion"]}', 1, 25, NOW());

-- ===================================================
-- CONTENT ITEMS (Immersion Content)
-- ===================================================
INSERT IGNORE INTO content_items (id, title, source_url, source_type, thumbnail_url, duration_seconds, difficulty, topic, transcript, summary, tags, is_active, created_at) VALUES
(1, 'How to Ace Your Tech Interview', 'https://youtube.com/watch?v=example1', 'YOUTUBE', '/thumbnails/tech-interview.jpg', 720, 'INTERMEDIATE', 'TECHNOLOGY', NULL, 'Tips and strategies for succeeding in technical interviews at top companies', 'interview,tech,career', true, NOW()),
(2, 'The Future of Remote Work', 'https://youtube.com/watch?v=example2', 'YOUTUBE', '/thumbnails/remote-work.jpg', 540, 'INTERMEDIATE', 'BUSINESS', NULL, 'How remote work is shaping the future of business and what skills you need', 'remote,work,future', true, NOW()),
(3, 'TED Talk: The Power of Vulnerability', 'https://youtube.com/watch?v=example3', 'YOUTUBE', '/thumbnails/vulnerability.jpg', 1200, 'ADVANCED', 'PERSONAL_DEVELOPMENT', NULL, 'Brené Brown discusses why vulnerability is not weakness but our greatest measure of courage', 'ted,psychology,growth', true, NOW()),
(4, 'BBC: Global Economy Update 2026', 'https://bbc.com/news/business-example', 'ARTICLE', '/thumbnails/economy.jpg', 300, 'ADVANCED', 'FINANCE', NULL, 'Analysis of global economic trends and forecasts for the coming year', 'economy,finance,news', true, NOW()),
(5, 'Podcast: English Learning Tips', 'https://podcast.example.com/ep1', 'PODCAST', '/thumbnails/podcast.jpg', 1800, 'BEGINNER', 'EDUCATION', NULL, 'Practical tips for improving your English speaking skills in daily life', 'podcast,learning,tips', true, NOW());

-- ===================================================
-- SPEAKING ROOMS
-- ===================================================
INSERT IGNORE INTO speaking_rooms (id, title, topic, max_participants, difficulty_level, room_type, status, created_at) VALUES
(1, 'Tech Talk: AI & Machine Learning', 'Discuss the latest trends in AI and how it affects our daily lives', 5, 'INTERMEDIATE', 'DISCUSSION', 'ACTIVE', NOW()),
(2, 'Business English: Startup Culture', 'Share experiences about working in startups vs corporations', 4, 'INTERMEDIATE', 'DISCUSSION', 'ACTIVE', NOW()),
(3, 'Debate: Remote vs Office Work', 'Which is better for productivity and work-life balance?', 4, 'ADVANCED', 'DEBATE', 'ACTIVE', NOW()),
(4, 'Daily Chat: Weekend Plans', 'Casual conversation about hobbies and weekend activities', 5, 'BEGINNER', 'DISCUSSION', 'ACTIVE', NOW()),
(5, 'Interview Prep: Mock Interviews', 'Practice answering common interview questions with peers', 3, 'INTERMEDIATE', 'DISCUSSION', 'ACTIVE', NOW());

-- ===================================================
-- ACHIEVEMENTS DEFINITIONS
-- ===================================================
INSERT IGNORE INTO achievement_definitions (id, achievement_key, title, description, icon, xp_reward, criteria_json, created_at) VALUES
(1, 'FIRST_ROLEPLAY', 'First Roleplay', 'Complete your first AI roleplay session', '🎭', 50, '{"type": "roleplay_count", "target": 1}', NOW()),
(2, 'STREAK_7', 'Week Warrior', 'Maintain a 7-day learning streak', '🔥', 100, '{"type": "streak", "target": 7}', NOW()),
(3, 'STREAK_30', 'Monthly Master', 'Maintain a 30-day learning streak', '💎', 500, '{"type": "streak", "target": 30}', NOW()),
(4, 'VOCAB_100', 'Word Collector', 'Learn 100 new vocabulary words', '📖', 200, '{"type": "vocab_count", "target": 100}', NOW()),
(5, 'PRONUNCIATION_STAR', 'Perfect Pitch', 'Score 90%+ on pronunciation 10 times', '🌟', 150, '{"type": "pronunciation_score", "target": 10}', NOW()),
(6, 'SOCIAL_BUTTERFLY', 'Social Butterfly', 'Join 10 speaking rooms', '🦋', 100, '{"type": "room_count", "target": 10}', NOW()),
(7, 'CAREER_COMPLETE', 'Career Ready', 'Complete a full career path', '🏆', 1000, '{"type": "career_complete", "target": 1}', NOW()),
(8, 'FIRST_REPORT', 'Self Aware', 'Receive your first Performance DNA Report', '🧬', 50, '{"type": "report_count", "target": 1}', NOW());
