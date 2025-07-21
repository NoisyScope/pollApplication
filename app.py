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
    'options': [
        'Jijos del Mar [mariscos]',
        'Pizzas Don Perro',
        'Bristol Pub',
        'Hell Fire Club'
    ],
    'locations': [
        'https://www.google.com/maps/place/JIJOS+DEL+MAR/@22.1604222,-100.9988385,17z/data=!3m1!4b1!4m6!3m5!1s0x842a9fcf5f1a2427:0x88d8bfcfc0aa15ca!8m2!3d22.1604173!4d-100.9962636!16s%2Fg%2F11rc906j2c?entry=ttu&g_ep=EgoyMDI1MDcyMC4wIKXMDSoASAFQAw%3D%3D',
        'https://www.google.com/maps/place/Pizzas+DON+PERRO+%F0%9F%94%A5/@22.0915427,-100.8776375,17z/data=!3m1!4b1!4m6!3m5!1s0x842aa58c4e29e813:0x55ca669a515a584!8m2!3d22.0915427!4d-100.8776375!16s%2Fg%2F11t5d7bhtp?entry=ttu&g_ep=EgoyMDI1MDcyMC4wIKXMDSoASAFQAw%3D%3D',
        'https://www.google.com/maps/place/Bristol+Pub/@22.1527705,-101.0132917,17z/data=!3m1!4b1!4m6!3m5!1s0x842a9f328b58400d:0xc38a0bd0092e9af8!8m2!3d22.1527705!4d-101.0132917!16s%2Fg%2F11b6_wfy95?entry=ttu&g_ep=EgoyMDI1MDcyMC4wIKXMDSoASAFQAw%3D%3D',
        'https://www.google.com/maps/place/Hell+Fire+Club/@22.1487223,-100.9827061,17z/data=!3m1!4b1!4m6!3m5!1s0x842aa3b744f7e0c5:0x1171a1e64255cdd2!8m2!3d22.1487174!4d-100.9801312!16s%2Fg%2F11rq0jtt5y?entry=tts&g_ep=EgoyMDI1MDcyMC4wIPu8ASoASAFQAw%3D%3D&skid=e6db5548-3a00-4cf1-8caf-7407de765258'
    ],
    'votes': [0, 0, 0, 0]
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

@app.route('/resetcount', methods=['GET'])
def reset_count():
    # Reset the vote counts to zero
    poll_data['votes'] = [0] * len(poll_data['options'])
    return redirect(url_for('manage_page'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)