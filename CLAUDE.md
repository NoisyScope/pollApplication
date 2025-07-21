# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
```bash
# Development mode
python app.py

# Production mode
python run.py

# Docker
docker build -t simple-poll .
docker run -p 5000:5000 simple-poll
```

### Environment Setup
```bash
# Install dependencies
pip install -r requirements.txt
```

## Architecture Overview

This is a minimal Flask web application for managing a single poll with in-memory storage.

### Core Structure
- **Single File App**: All functionality in `app.py`
- **In-Memory Storage**: Poll data stored in a simple Python dictionary
- **No Database**: Data is lost when the application restarts
- **Embedded Templates**: HTML templates defined as strings within the Python file

### Application Features
- **Single Poll**: Only one poll exists at a time with a hardcoded question
- **Dynamic Options**: Users can add/remove poll options via `/manage` page
- **Real-time Voting**: Users vote on the main page (`/`) and see immediate results
- **Vote Tracking**: Simple counter for each option (no duplicate prevention)

### Routes
- `/` - Main voting page with current results
- `/vote` - POST endpoint to submit votes
- `/manage` - Admin page to add/remove poll options
- `/add_option` - POST endpoint to add new options
- `/remove_option` - POST endpoint to remove existing options

### Data Structure
```python
poll_data = {
    'question': 'What is your favorite color?',
    'options': ['Red', 'Blue', 'Green', 'Yellow'],
    'votes': [0, 0, 0, 0]  # parallel array of vote counts
}
```

### Dependencies
- Only Flask (no forms, database, or additional libraries)
- Basic CSS styling embedded in HTML templates
- No external static files or complex templating

### Limitations
- Data is not persistent (resets on restart)
- No user authentication or duplicate vote prevention
- Single poll only
- No input validation beyond basic HTML required fields