# Database Schema - AI Educational Platform

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS {
        int id PK
        string username
        string email UK
        string password
        enum role
        string level
        string avatar_url
        json prefs
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    SUBJECTS {
        int id PK
        string subject_name
        text description
        string level
        int author_id FK
        timestamp created_at
        timestamp updated_at
    }

    LESSONS {
        int id PK
        int subject_id FK
        string title
        text content
        text pdf_url
        text video_url
        int order_no
        boolean is_published
        timestamp created_at
        timestamp updated_at
    }

    AI_SESSIONS {
        int id PK
        int lesson_id FK
        int user_id FK
        string ai_personality
        string status
        text feedback
        text summary
        timestamp started_at
        timestamp ended_at
        timestamp created_at
        timestamp updated_at
    }

    INTERACTIONS {
        int id PK
        int ai_session_id FK
        int ai_model_usage_id FK
        enum sender
        enum message_type
        text content
        json metadata
        timestamp created_at
    }

    TRANSCRIPTS {
        int id PK
        int ai_session_id FK
        text summary
        text keywords
        string language
        timestamp created_at
    }

    ASSESSMENTS {
        int id PK
        int lesson_id FK
        int user_id FK
        json questions_json
        json answers_json
        decimal score
        int attempt_number
        text feedback
        timestamp attempt_at
    }

    PROGRESSES {
        int id PK
        int user_id FK
        int lesson_id FK
        string status
        decimal progress_percent
        timestamp last_interaction_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        string message
        string type
        boolean is_read
        timestamp created_at
    }

    AI_MODEL_USAGES {
        int id PK
        string model_name
        int tokens_used
        decimal cost
        int duration_ms
    }

    %% Relationships
    USERS ||--o{ SUBJECTS : "creates"
    USERS ||--o{ AI_SESSIONS : "participates"
    USERS ||--o{ ASSESSMENTS : "takes"
    USERS ||--o{ PROGRESSES : "has"
    USERS ||--o{ NOTIFICATIONS : "receives"

    SUBJECTS ||--o{ LESSONS : "contains"

    LESSONS ||--o{ AI_SESSIONS : "has"
    LESSONS ||--o{ ASSESSMENTS : "evaluates"
    LESSONS ||--o{ PROGRESSES : "tracks"

    AI_SESSIONS ||--o{ INTERACTIONS : "contains"
    AI_SESSIONS ||--o{ TRANSCRIPTS : "generates"

    AI_MODEL_USAGES ||--o{ INTERACTIONS : "tracks"
```

## Summary of Created Entities

### 1. **Users** (`users`)
- Central entity for all platform users (students, teachers, admins)
- Contains authentication info, preferences, and role management
- Related to: subjects (as author), ai_sessions, assessments, progresses, notifications

### 2. **Subjects** (`subjects`)
- Educational subjects/courses
- Has an author (user) and contains multiple lessons
- Related to: users (as author), lessons

### 3. **Lessons** (`lessons`)
- Individual lessons within subjects
- Contains content, media URLs, and publication status
- Related to: subjects, ai_sessions, assessments, progresses

### 4. **AI Sessions** (`ai_sessions`)
- AI tutoring sessions for specific lessons
- Tracks session status, timing, and feedback
- Related to: lessons, users, interactions, transcripts

### 5. **Interactions** (`interactions`)
- Individual messages/interactions during AI sessions
- Tracks sender (user/AI), content type, and metadata
- Related to: ai_sessions, ai_model_usages

### 6. **Transcripts** (`transcripts`)
- Session summaries and transcripts
- Contains keywords and language information
- Related to: ai_sessions

### 7. **Assessments** (`assessments`)
- Quiz/assessment results for lessons
- Stores questions, answers, scores, and feedback
- Related to: lessons, users

### 8. **Progresses** (`progresses`)
- User progress tracking for lessons
- Tracks completion percentage and status
- Related to: users, lessons

### 9. **Notifications** (`notifications`)
- User notifications
- Tracks read status and notification type
- Related to: users

### 10. **AI Model Usages** (`ai_model_usages`)
- Tracks AI model usage and costs
- Monitors tokens, costs, and performance
- Related to: interactions

## Key Features Implemented

✅ **Complete Entity Structure**: All 10 entities with proper schemas
✅ **Relationship Management**: All foreign key relationships properly configured
✅ **Strapi Integration**: Full controllers, routes, and services for each entity
✅ **Data Types**: Proper field types including JSON, enums, decimals, and timestamps
✅ **Constraints**: Unique constraints, required fields, and defaults where appropriate
✅ **Educational Focus**: Designed specifically for AI-powered educational platform

## Next Steps

1. **Database Migration**: Run Strapi to generate the database schema
2. **Permissions**: Configure role-based permissions for different user types
3. **API Testing**: Test all CRUD operations for each entity
4. **Data Seeding**: Create sample data for testing
5. **Frontend Integration**: Connect with the frontend application
