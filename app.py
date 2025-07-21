import os
from flask import Flask, render_template, request, redirect, url_for
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Google Maps API key from environment
GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')

# Simple in-memory storage for the single poll
poll_data = {
    'question': 'Comida de despedida',
    'options': ['Red', 'Blue', 'Green', 'Yellow'],
    'locations': ['', '', '', ''],  # Google Maps URLs for each option
    'votes': [0, 0, 0, 0]  # votes for each option
}

@app.route('/')
def vote_page():
    return render_template('vote.html', poll_data=poll_data, google_maps_api_key=GOOGLE_MAPS_API_KEY)

@app.route('/vote', methods=['POST'])
def vote():
    option_index = int(request.form['vote'])
    if 0 <= option_index < len(poll_data['options']):
        poll_data['votes'][option_index] += 1
    return redirect(url_for('vote_page'))

@app.route('/manage')
def manage_page():
    return render_template('manage.html', poll_data=poll_data, google_maps_api_key=GOOGLE_MAPS_API_KEY)

@app.route('/add_option', methods=['POST'])
def add_option():
    new_option = request.form['new_option'].strip()
    new_location = request.form.get('new_location', '').strip()
    if new_option and new_option not in poll_data['options']:
        poll_data['options'].append(new_option)
        poll_data['locations'].append(new_location)
        poll_data['votes'].append(0)
    return redirect(url_for('manage_page'))

@app.route('/edit_option', methods=['POST'])
def edit_option():
    option_index = int(request.form['option_index'])
    new_name = request.form['option_name'].strip()
    new_location = request.form.get('option_location', '').strip()
    
    if 0 <= option_index < len(poll_data['options']) and new_name:
        poll_data['options'][option_index] = new_name
        poll_data['locations'][option_index] = new_location
    
    return redirect(url_for('manage_page'))

@app.route('/remove_option', methods=['POST'])
def remove_option():
    option_index = int(request.form['option_index'])
    if 0 <= option_index < len(poll_data['options']) and len(poll_data['options']) > 1:
        poll_data['options'].pop(option_index)
        poll_data['locations'].pop(option_index)
        poll_data['votes'].pop(option_index)
    return redirect(url_for('manage_page'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)