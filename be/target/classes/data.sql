-- ===================================================
-- ENOVA Database Seed Data
-- ===================================================

-- CAREER PATHS
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

-- SCENARIOS
INSERT IGNORE INTO scenarios (id, title, description, category, difficulty, ai_personality, context_prompt, tags, is_active, created_at) VALUES
(1, 'Job Interview - Software Engineer', 'Practice a technical job interview', 'INTERVIEW', 'INTERMEDIATE', 'PROFESSIONAL', 'You are a hiring manager at a major tech company. Conduct a professional job interview for a senior software engineer position.', 'interview,tech,software', true, NOW()),
(2, 'Job Interview - Marketing Manager', 'Prepare for a marketing manager position interview', 'INTERVIEW', 'INTERMEDIATE', 'PROFESSIONAL', 'You are the VP of Marketing. Interview the candidate for a Marketing Manager role.', 'interview,marketing,management', true, NOW()),
(3, 'Client Presentation - Product Launch', 'Present a new product to international stakeholders', 'PRESENTATION', 'ADVANCED', 'FRIENDLY', 'You are a client attending a product launch presentation.', 'presentation,business,product', true, NOW()),
(4, 'Business Meeting - Project Planning', 'Lead a project planning meeting', 'MEETING', 'INTERMEDIATE', 'FRIENDLY', 'You are a team member in a cross-functional project meeting.', 'meeting,project,teamwork', true, NOW()),
(5, 'Customer Complaint Handling', 'Handle a frustrated customer complaint', 'CUSTOMER_SERVICE', 'BEGINNER', 'DIFFICULT', 'You are an angry customer who received a defective product.', 'customer,complaint,service', true, NOW()),
(6, 'Salary Negotiation', 'Negotiate your salary and benefits package with HR', 'NEGOTIATION', 'ADVANCED', 'PROFESSIONAL', 'You are an HR manager discussing compensation.', 'negotiation,salary,hr', true, NOW()),
(7, 'Coffee Chat - Networking', 'Have an informal networking conversation', 'NETWORKING', 'BEGINNER', 'FRIENDLY', 'You are a fellow attendee at a tech conference.', 'networking,casual,conference', true, NOW()),
(8, 'Email Writing - Project Update', 'Compose a professional email', 'EMAIL', 'INTERMEDIATE', 'PROFESSIONAL', 'You are the project stakeholder reviewing an email.', 'email,writing,project', true, NOW()),
(9, 'Medical Consultation', 'Practice being a healthcare provider', 'HEALTHCARE', 'ADVANCED', 'FRIENDLY', 'You are a patient visiting a doctor.', 'medical,healthcare,consultation', true, NOW()),
(10, 'Airport & Travel Situations', 'Navigate common airport scenarios', 'TRAVEL', 'BEGINNER', 'FRIENDLY', 'You are an airline check-in agent.', 'travel,airport,beginner', true, NOW()),
(11, 'Team Standup Meeting', 'Participate in a daily standup meeting', 'MEETING', 'BEGINNER', 'FRIENDLY', 'You are a team lead running a daily standup.', 'meeting,standup,agile', true, NOW()),
(12, 'Performance Review Discussion', 'Have your annual performance review', 'WORKPLACE', 'ADVANCED', 'PROFESSIONAL', 'You are a manager conducting a performance review.', 'performance,review,career', true, NOW()),
(13, 'Restaurant Ordering', 'Order food and interact with staff', 'DAILY_LIFE', 'BEGINNER', 'FRIENDLY', 'You are a waiter at an upscale restaurant.', 'restaurant,food,daily', true, NOW()),
(14, 'Real Estate Negotiation', 'Negotiate rental terms for an apartment', 'NEGOTIATION', 'INTERMEDIATE', 'DIFFICULT', 'You are a landlord showing an apartment.', 'real-estate,negotiation,rental', true, NOW()),
(15, 'Tech Support Call', 'Call tech support to resolve a software issue', 'CUSTOMER_SERVICE', 'INTERMEDIATE', 'FRIENDLY', 'You are a tech support agent.', 'tech,support,troubleshooting', true, NOW());

-- VOCABULARIES (fix old records then insert new)
DELETE FROM vocabulary_progress WHERE vocabulary_id IN (SELECT id FROM vocabularies WHERE id BETWEEN 1 AND 40 AND (part_of_speech IS NULL OR source IS NULL));
DELETE FROM vocabularies WHERE id BETWEEN 1 AND 40 AND (part_of_speech IS NULL OR source IS NULL);
INSERT IGNORE INTO vocabularies (id, word, definition, phonetic, part_of_speech, meaning_vi, example_sentences, career_path_id, difficulty, frequency_rank, source, created_at) VALUES
(1, 'deploy', 'To release software to production', '/dɪˈplɔɪ/', 'verb', 'triển khai', '["We need to deploy by Friday."]', 1, 'BEGINNER', 1, 'MANUAL', NOW()),
(2, 'refactor', 'To restructure existing code', '/riːˈfæktər/', 'verb', 'tái cấu trúc', '["Refactor this module."]', 1, 'INTERMEDIATE', 2, 'MANUAL', NOW()),
(3, 'scalability', 'Ability to handle growing workload', '/ˌskeɪləˈbɪlɪti/', 'noun', 'khả năng mở rộng', '["Consider scalability."]', 1, 'INTERMEDIATE', 3, 'MANUAL', NOW()),
(4, 'debugging', 'Finding and fixing errors', '/diːˈbʌɡɪŋ/', 'noun', 'gỡ lỗi', '["Debugging the auth module."]', 1, 'BEGINNER', 4, 'MANUAL', NOW()),
(5, 'repository', 'Central code storage location', '/rɪˈpɒzɪtɔːri/', 'noun', 'kho lưu trữ', '["Push to the repository."]', 1, 'BEGINNER', 5, 'MANUAL', NOW()),
(6, 'agile', 'Rapid and flexible methodology', '/ˈædʒaɪl/', 'adjective', 'linh hoạt', '["We follow agile process."]', 1, 'BEGINNER', 6, 'MANUAL', NOW()),
(7, 'bandwidth', 'Available capacity for tasks', '/ˈbændwɪdθ/', 'noun', 'băng thông', '["No bandwidth for this."]', 1, 'INTERMEDIATE', 7, 'MANUAL', NOW()),
(8, 'optimize', 'Make the best use of resources', '/ˈɒptɪmaɪz/', 'verb', 'tối ưu hóa', '["Optimize the queries."]', 1, 'INTERMEDIATE', 8, 'MANUAL', NOW()),
(9, 'robust', 'Strong and effective', '/roʊˈbʌst/', 'adjective', 'mạnh mẽ', '["Build a robust system."]', 1, 'INTERMEDIATE', 9, 'MANUAL', NOW()),
(10, 'efficiently', 'With maximum productivity', '/ɪˈfɪʃəntli/', 'adverb', 'hiệu quả', '["Code runs efficiently."]', 1, 'BEGINNER', 10, 'MANUAL', NOW()),
(11, 'campaign', 'Organized course of action', '/kæmˈpeɪn/', 'noun', 'chiến dịch', '["The campaign went viral."]', 2, 'BEGINNER', 1, 'MANUAL', NOW()),
(12, 'engage', 'Attract and hold attention', '/ɪnˈɡeɪdʒ/', 'verb', 'tương tác', '["Engage the audience."]', 2, 'BEGINNER', 2, 'MANUAL', NOW()),
(13, 'viral', 'Spreading rapidly', '/ˈvaɪrəl/', 'adjective', 'lan truyền', '["It went viral overnight."]', 2, 'BEGINNER', 3, 'MANUAL', NOW()),
(14, 'strategically', 'In a planned way', '/strəˈtiːdʒɪkli/', 'adverb', 'một cách chiến lược', '["Position strategically."]', 2, 'INTERMEDIATE', 4, 'MANUAL', NOW()),
(15, 'portfolio', 'Collection of investments', '/pɔːrtˈfoʊlioʊ/', 'noun', 'danh mục đầu tư', '["Diversify your portfolio."]', 3, 'BEGINNER', 1, 'MANUAL', NOW()),
(16, 'leverage', 'Use borrowed capital', '/ˈlevərɪdʒ/', 'verb', 'đòn bẩy tài chính', '["Leverage debt for expansion."]', 3, 'ADVANCED', 2, 'MANUAL', NOW()),
(17, 'volatile', 'Changing rapidly', '/ˈvɒlətaɪl/', 'adjective', 'biến động', '["Market is volatile."]', 3, 'INTERMEDIATE', 3, 'MANUAL', NOW()),
(18, 'audit', 'Official financial inspection', '/ˈɔːdɪt/', 'noun', 'kiểm toán', '["The annual audit."]', 3, 'BEGINNER', 4, 'MANUAL', NOW()),
(19, 'diagnosis', 'Identification of a condition', '/ˌdaɪəɡˈnoʊsɪs/', 'noun', 'chẩn đoán', '["Confirmed the diagnosis."]', 4, 'BEGINNER', 1, 'MANUAL', NOW()),
(20, 'prescribe', 'Authorize use of medicine', '/prɪˈskraɪb/', 'verb', 'kê đơn', '["Prescribed antibiotics."]', 4, 'BEGINNER', 2, 'MANUAL', NOW()),
(21, 'chronic', 'Persisting for a long time', '/ˈkrɒnɪk/', 'adjective', 'mãn tính', '["Chronic back pain."]', 4, 'INTERMEDIATE', 3, 'MANUAL', NOW()),
(22, 'intravenously', 'Administered into a vein', '/ˌɪntrəˈviːnəsli/', 'adverb', 'tiêm tĩnh mạch', '["Given intravenously."]', 4, 'ADVANCED', 4, 'MANUAL', NOW()),
(23, 'curriculum', 'Course of study subjects', '/kəˈrɪkjʊləm/', 'noun', 'chương trình giảng dạy', '["New curriculum."]', 5, 'BEGINNER', 1, 'MANUAL', NOW()),
(24, 'assess', 'Evaluate quality', '/əˈses/', 'verb', 'đánh giá', '["Assess students."]', 5, 'BEGINNER', 2, 'MANUAL', NOW()),
(25, 'comprehensive', 'Complete and thorough', '/ˌkɒmprɪˈhensɪv/', 'adjective', 'toàn diện', '["Comprehensive exam."]', 5, 'INTERMEDIATE', 3, 'MANUAL', NOW()),
(26, 'reservation', 'Arrangement held for use', '/ˌrezərˈveɪʃən/', 'noun', 'đặt chỗ', '["Made a reservation."]', 6, 'BEGINNER', 1, 'MANUAL', NOW()),
(27, 'accommodate', 'Provide lodging for', '/əˈkɒmədeɪt/', 'verb', 'phục vụ', '["Accommodate 200 guests."]', 6, 'INTERMEDIATE', 2, 'MANUAL', NOW()),
(28, 'complimentary', 'Given free of charge', '/ˌkɒmplɪˈmentəri/', 'adjective', 'miễn phí', '["Complimentary breakfast."]', 6, 'BEGINNER', 3, 'MANUAL', NOW()),
(29, 'litigation', 'Process of legal action', '/ˌlɪtɪˈɡeɪʃən/', 'noun', 'kiện tụng', '["Went to litigation."]', 7, 'INTERMEDIATE', 1, 'MANUAL', NOW()),
(30, 'prosecute', 'Institute legal proceedings', '/ˈprɒsɪkjuːt/', 'verb', 'truy tố', '["Prosecute the defendant."]', 7, 'INTERMEDIATE', 2, 'MANUAL', NOW()),
(31, 'admissible', 'Accepted as valid evidence', '/ədˈmɪsəbl/', 'adjective', 'được chấp nhận', '["Evidence ruled admissible."]', 7, 'ADVANCED', 3, 'MANUAL', NOW()),
(32, 'prototype', 'First model of something', '/ˈproʊtətaɪp/', 'noun', 'nguyên mẫu', '["Built a prototype."]', 8, 'BEGINNER', 1, 'MANUAL', NOW()),
(33, 'calibrate', 'Adjust precisely', '/ˈkælɪbreɪt/', 'verb', 'hiệu chuẩn', '["Calibrate the sensors."]', 8, 'INTERMEDIATE', 2, 'MANUAL', NOW()),
(34, 'durable', 'Able to withstand damage', '/ˈdjʊərəbl/', 'adjective', 'bền', '["Extremely durable."]', 8, 'BEGINNER', 3, 'MANUAL', NOW()),
(35, 'recruitment', 'Finding new people to join', '/rɪˈkruːtmənt/', 'noun', 'tuyển dụng', '["Recruitment takes 4 weeks."]', 9, 'BEGINNER', 1, 'MANUAL', NOW()),
(36, 'onboard', 'Integrate new employee', '/ˈɒnbɔːrd/', 'verb', 'hội nhập nhân viên mới', '["Onboard new hires Monday."]', 9, 'BEGINNER', 2, 'MANUAL', NOW()),
(37, 'inclusive', 'Not excluding anyone', '/ɪnˈkluːsɪv/', 'adjective', 'hòa nhập', '["Inclusive workplace."]', 9, 'INTERMEDIATE', 3, 'MANUAL', NOW()),
(38, 'conversion', 'Converting visitor to customer', '/kənˈvɜːʒən/', 'noun', 'chuyển đổi', '["Conversion rate up 15%."]', 10, 'BEGINNER', 1, 'MANUAL', NOW()),
(39, 'fulfill', 'Complete a customer order', '/fʊlˈfɪl/', 'verb', 'xử lý đơn hàng', '["Fulfill orders in 24h."]', 10, 'BEGINNER', 2, 'MANUAL', NOW()),
(40, 'seamless', 'Smooth and continuous', '/ˈsiːmləs/', 'adjective', 'liền mạch', '["Seamless checkout."]', 10, 'INTERMEDIATE', 3, 'MANUAL', NOW());

-- LESSONS
INSERT IGNORE INTO lessons (id, career_path_id, title, lesson_type, content_json, order_index, estimated_minutes, created_at) VALUES
(1, 1, 'Tech Vocabulary Essentials', 'VOCABULARY', '{"words": ["deploy","refactor","scalability"]}', 1, 15, NOW()),
(2, 1, 'Writing Professional Emails in Tech', 'WRITING', '{"template": "email"}', 2, 20, NOW()),
(3, 1, 'Daily Standup Communication', 'SPEAKING', '{"phrases": ["Yesterday I worked on..."]}', 3, 10, NOW()),
(4, 1, 'Code Review Discussion', 'SPEAKING', '{"scenario": "Discuss code review feedback"}', 4, 15, NOW()),
(5, 1, 'Sprint Planning Meeting', 'LISTENING', '{"questions": []}', 5, 20, NOW()),
(6, 2, 'Marketing Campaign Vocabulary', 'VOCABULARY', '{"words": ["campaign","ROI"]}', 1, 15, NOW()),
(7, 2, 'Presenting Campaign Results', 'SPEAKING', '{"scenario": "Present Q3 results"}', 2, 20, NOW()),
(8, 3, 'Financial Report Vocabulary', 'VOCABULARY', '{"words": ["portfolio","liquidity"]}', 1, 15, NOW()),
(9, 4, 'Patient Consultation Basics', 'SPEAKING', '{"scenario": "Patient consultation"}', 1, 20, NOW()),
(10, 5, 'Academic Presentation Skills', 'SPEAKING', '{"scenario": "Present research"}', 1, 25, NOW());

-- CONTENT ITEMS
INSERT IGNORE INTO content_items (id, title, source_url, source_type, thumbnail_url, duration_seconds, difficulty, topic, transcript, summary, tags, is_active, created_at) VALUES
(1, 'How to Ace Your Tech Interview', 'https://youtube.com/watch?v=example1', 'YOUTUBE', '/thumbnails/tech-interview.jpg', 720, 'INTERMEDIATE', 'TECHNOLOGY', NULL, 'Tips for tech interviews', 'interview,tech', true, NOW()),
(2, 'The Future of Remote Work', 'https://youtube.com/watch?v=example2', 'YOUTUBE', '/thumbnails/remote-work.jpg', 540, 'INTERMEDIATE', 'BUSINESS', NULL, 'Remote work trends', 'remote,work', true, NOW()),
(3, 'TED Talk: The Power of Vulnerability', 'https://youtube.com/watch?v=example3', 'YOUTUBE', '/thumbnails/vulnerability.jpg', 1200, 'ADVANCED', 'PERSONAL_DEVELOPMENT', NULL, 'Vulnerability discussion', 'ted,psychology', true, NOW()),
(4, 'BBC: Global Economy Update 2026', 'https://bbc.com/news/example', 'ARTICLE', '/thumbnails/economy.jpg', 300, 'ADVANCED', 'FINANCE', NULL, 'Economy analysis', 'economy,finance', true, NOW()),
(5, 'Podcast: English Learning Tips', 'https://podcast.example.com/ep1', 'PODCAST', '/thumbnails/podcast.jpg', 1800, 'BEGINNER', 'EDUCATION', NULL, 'Learning tips', 'podcast,tips', true, NOW());

-- SPEAKING ROOMS
INSERT IGNORE INTO speaking_rooms (id, title, topic, max_participants, difficulty_level, room_type, status, created_at) VALUES
(1, 'Tech Talk: AI & Machine Learning', 'AI trends discussion', 5, 'INTERMEDIATE', 'DISCUSSION', 'ACTIVE', NOW()),
(2, 'Business English: Startup Culture', 'Startup vs corporate', 4, 'INTERMEDIATE', 'DISCUSSION', 'ACTIVE', NOW()),
(3, 'Debate: Remote vs Office Work', 'Productivity debate', 4, 'ADVANCED', 'DEBATE', 'ACTIVE', NOW()),
(4, 'Daily Chat: Weekend Plans', 'Casual conversation', 5, 'BEGINNER', 'DISCUSSION', 'ACTIVE', NOW()),
(5, 'Interview Prep: Mock Interviews', 'Practice interviews', 3, 'INTERMEDIATE', 'DISCUSSION', 'ACTIVE', NOW());

-- COMMUNITY
INSERT IGNORE INTO community_clubs (id, name, focus, level, created_at) VALUES
(1, 'Tech Builders Club', 'Product + engineering', 'B1-B2', NOW()),
(2, 'Marketing Storytellers', 'Narrative + pitch', 'A2-B1', NOW()),
(3, 'Finance Talkroom', 'Business English', 'B2-C1', NOW());

INSERT IGNORE INTO community_events (id, title, time_label, host, capacity, created_at) VALUES
(1, 'Global Demo Day', 'Thu 20:00', 'Coach Anna', 40, NOW()),
(2, 'Interview Challenge', 'Sat 10:00', 'AI Moderator', 30, NOW());

-- ACHIEVEMENTS
INSERT IGNORE INTO achievement_definitions (id, achievement_key, title, description, icon, xp_reward, criteria_json, created_at) VALUES
(1, 'FIRST_ROLEPLAY', 'First Roleplay', 'Complete your first AI roleplay session', '🎭', 50, '{"type": "roleplay_count", "target": 1}', NOW()),
(2, 'STREAK_7', 'Week Warrior', 'Maintain a 7-day learning streak', '🔥', 100, '{"type": "streak", "target": 7}', NOW()),
(3, 'STREAK_30', 'Monthly Master', 'Maintain a 30-day learning streak', '💎', 500, '{"type": "streak", "target": 30}', NOW()),
(4, 'VOCAB_100', 'Word Collector', 'Learn 100 new vocabulary words', '📖', 200, '{"type": "vocab_count", "target": 100}', NOW()),
(5, 'PRONUNCIATION_STAR', 'Perfect Pitch', 'Score 90%+ on pronunciation 10 times', '🌟', 150, '{"type": "pronunciation_score", "target": 10}', NOW()),
(6, 'SOCIAL_BUTTERFLY', 'Social Butterfly', 'Join 10 speaking rooms', '🦋', 100, '{"type": "room_count", "target": 10}', NOW()),
(7, 'CAREER_COMPLETE', 'Career Ready', 'Complete a full career path', '🏆', 1000, '{"type": "career_complete", "target": 1}', NOW()),
(8, 'FIRST_REPORT', 'Self Aware', 'Receive your first Performance DNA Report', '🧬', 50, '{"type": "report_count", "target": 1}', NOW());

-- CONTENT QUIZZES
INSERT IGNORE INTO content_quizzes (id, content_id, question, option_a, option_b, option_c, option_d, correct_answer, explanation, is_active, created_at) VALUES
(1, 1, 'What is the most important thing to prepare?', 'Resume', 'Company research', 'Coding problems', 'All of the above', 'D', 'All aspects are important', true, NOW()),
(2, 1, 'Which data structure is commonly asked?', 'Linked List', 'Binary Tree', 'Hash Table', 'All of the above', 'D', 'All are fundamental', true, NOW()),
(3, 1, 'What if you dont know the answer?', 'Stay silent', 'Make up answer', 'Think out loud', 'Change topic', 'C', 'Show your process', true, NOW()),
(4, 2, 'Key benefit of remote work?', 'No commute', 'Flexible schedule', 'Work-life balance', 'All of the above', 'D', 'Multiple benefits', true, NOW()),
(5, 2, 'Common challenge of remote work?', 'Communication', 'Isolation', 'Work-life separation', 'All of the above', 'D', 'Various challenges', true, NOW());

-- CONTENT TESTS
INSERT IGNORE INTO content_tests (id, content_id, title, description, type, time_limit, passing_score, is_active, created_at) VALUES
(1, 1, 'Tech Interview Test', 'Test interview strategies', 'MULTIPLE_CHOICE', 15, 70, true, NOW()),
(2, 2, 'Remote Work Test', 'Test remote work knowledge', 'MULTIPLE_CHOICE', 10, 70, true, NOW());

INSERT IGNORE INTO content_test_questions (id, test_id, question, options, correct_answer, explanation, points, order_index) VALUES
(1, 1, 'What is the STAR method?', '["Behavioral questions","Coding","Salary","Resumes"]', 'A', 'STAR is for behavioral questions', 2, 1),
(2, 1, 'NOT a good practice?', '["Think aloud","Ask questions","Memorize","Trade-offs"]', 'C', 'Memorizing is bad', 2, 2),
(3, 1, 'Stuck on a problem?', '["Give up","Ask hints","Silent","Change topic"]', 'B', 'Ask for hints', 2, 3),
(4, 1, 'Research the company?', '["Not important","Somewhat","Very","Senior only"]', 'C', 'Very important', 2, 4),
(5, 1, 'Unknown answer?', '["Admit it","Make up","Skip","Blame"]', 'A', 'Be honest', 2, 5),
(6, 2, 'Remote work advantage?', '["Global talent","Lower costs","Productivity","All"]', 'D', 'All benefits', 2, 1),
(7, 2, 'Essential tool?', '["Video","PM tools","Chat","All"]', 'D', 'All tools needed', 2, 2),
(8, 2, 'Management challenge?', '["Culture","Accountability","Communication","All"]', 'D', 'All challenges', 2, 3),
(9, 2, 'Work-life balance?', '["Boundaries","Workspace","Schedule","All"]', 'D', 'All strategies', 2, 4),
(10, 2, 'Future trend?', '["Hybrid","Return office","Fully remote rare","No change"]', 'A', 'Hybrid dominates', 2, 5);

-- FIX old vocabulary records
UPDATE vocabularies SET source = 'MANUAL' WHERE source IS NULL;

-- JOURNAL ENTRIES (Assuming user_id 1 is the main test user)
INSERT IGNORE INTO journal_entries (id, user_id, title, content, category, created_at) VALUES
(1, 1, 'My First Reflection', 'Today I started using ENOVA. The AI Roleplay is really impressive! I practiced a job interview and learned the word "scalability".', 'WIN', NOW()),
(2, 1, 'Accent Challenges', 'I noticed I struggle with the "th" sound. I need to practice the Accent Coach module more often.', 'CHALLENGE', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 1, 'Career Goals', 'Decided to focus on the IT career path to prepare for my upcoming interview at a tech startup.', 'NOTE', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- STUDY PLAN BLOCKS
INSERT IGNORE INTO study_plan_blocks (id, user_id, title, day_of_week, start_time, duration_minutes, color, is_completed, created_at) VALUES
(1, 1, 'Daily Vocabulary', 'Mon', '08:00', 15, 'var(--accent-pink)', true, NOW()),
(2, 1, 'AI Roleplay Chat', 'Mon', '12:30', 20, 'var(--primary)', false, NOW()),
(3, 1, 'Pronunciation Practice', 'Tue', '07:30', 15, 'var(--accent-pink)', true, NOW()),
(4, 1, 'Tech News Reading', 'Tue', '20:00', 30, 'var(--accent-cyan)', false, NOW()),
(5, 1, 'Weekly Review', 'Sun', '10:00', 45, 'var(--accent-orange)', false, NOW());

-- NOTIFICATIONS
INSERT IGNORE INTO notifications (id, user_id, title, message, type, is_read, created_at) VALUES
(1, 1, 'Welcome to ENOVA!', 'Start your journey by selecting a career path.', 'SYSTEM', true, NOW()),
(2, 1, 'Daily Streak: 3 Days!', 'Keep going! You are doing great.', 'STREAK', false, NOW()),
(3, 1, 'New Achievement!', 'You unlocked "First Roleplay". View it in your profile.', 'ACHIEVEMENT', false, NOW());

-- EXAMS
INSERT IGNORE INTO exams (id, title, description, type, level, duration_minutes, total_questions, is_active, created_at) VALUES
(1, 'IELTS Academic Mock 01', 'Complete practice test for IELTS Academic', 'IELTS', '6.5 - 7.5', 60, 10, true, NOW()),
(2, 'TOEIC Listening & Reading', 'Practice test for TOEIC 2026 format', 'TOEIC', '750+', 120, 10, true, NOW());

-- EXAM QUESTIONS
INSERT IGNORE INTO exam_questions (id, exam_id, question_text, options_json, correct_answer, explanation, section, points) VALUES
(1, 1, 'Which of the following is a synonym for "mitigate"?', '["Increase", "Alleviate", "Provoke", "Exacerbate"]', 'Alleviate', 'Mitigate means to make something less severe.', 'VOCABULARY', 1),
(2, 1, 'Choose the correct preposition: She is proficient ___ three languages.', '["at", "in", "with", "on"]', 'in', 'One is proficient IN a language.', 'GRAMMAR', 1),
(3, 2, 'The company _______ its revenue by 20% last year.', '["has increased", "increased", "increase", "is increasing"]', 'increased', 'Past simple for finished action.', 'GRAMMAR', 1);
