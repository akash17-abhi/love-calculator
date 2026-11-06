from flask import Flask, render_template, request, jsonify
from datetime import datetime
import random
import hashlib

app = Flask(__name__)

# Romantic quotes for the love calculator
ROMANTIC_QUOTES = [
    "Love is composed of a single soul inhabiting two bodies. - Aristotle",
    "The heart has its reasons which reason knows nothing of. - Pascal",
    "Love is not just looking at each other, it's looking in the same direction. - Antoine de Saint-Exupéry",
    "You know you're in love when you can't fall asleep because reality is finally better than your dreams. - Dr. Seuss",
    "In all the world, there is no heart for me like yours. - Maya Angelou",
    "Love is when the other person's happiness is more important than your own. - H. Jackson Brown Jr.",
    "I have for the first time found what I can truly love. - Charlotte Brontë",
    "Love is a canvas furnished by nature and embroidered by imagination. - Voltaire",
    "Every love story is beautiful, but ours is my favourite. - Unknown",
    "I fell in love the way you fall asleep: slowly, then all at once. - John Green",
    "When I saw you, I fell in love, and you smiled because you knew. - Arrigo Boito",
    "Your heart is my home. - Unknown",
    "Love is the only force capable of transforming an enemy into a friend. - Martin Luther King Jr.",
    "The course of true love never did run smooth. - William Shakespeare",
    "If you live to be a hundred, I want to live to be a hundred minus one day. - Winnie the Pooh",
]

def calculate_love_percentage(name1, name2, date1, date2):
    """
    Calculate love percentage using a combination of:
    1. Name compatibility (character matching)
    2. Birthday numerology
    3. Zodiac sign compatibility
    """
    
    # Normalize names
    name1 = name1.lower().strip()
    name2 = name2.lower().strip()
    
    # Name compatibility (0-40 points)
    name_score = 0
    combined_name = name1 + name2
    for char in combined_name:
        name_score += ord(char) % 10
    name_score = (name_score % 40) + 10
    
    # Birthday compatibility (0-30 points)
    try:
        date_obj1 = datetime.strptime(date1, "%Y-%m-%d")
        date_obj2 = datetime.strptime(date2, "%Y-%m-%d")
        
        day_sum = (date_obj1.day + date_obj2.day) % 30
        month_sum = (date_obj1.month + date_obj2.month) % 30
        year_diff = abs(date_obj1.year - date_obj2.year) % 20
        
        date_score = (day_sum + month_sum + year_diff) // 2
        date_score = min(30, max(10, date_score))
    except:
        date_score = 20
    
    # Zodiac compatibility (0-30 points)
    def get_zodiac_sign(month, day):
        if (month == 3 and day >= 21) or (month == 4 and day <= 19):
            return "aries"
        elif (month == 4 and day >= 20) or (month == 5 and day <= 20):
            return "taurus"
        elif (month == 5 and day >= 21) or (month == 6 and day <= 20):
            return "gemini"
        elif (month == 6 and day >= 21) or (month == 7 and day <= 22):
            return "cancer"
        elif (month == 7 and day >= 23) or (month == 8 and day <= 22):
            return "leo"
        elif (month == 8 and day >= 23) or (month == 9 and day <= 22):
            return "virgo"
        elif (month == 9 and day >= 23) or (month == 10 and day <= 22):
            return "libra"
        elif (month == 10 and day >= 23) or (month == 11 and day <= 21):
            return "scorpio"
        elif (month == 11 and day >= 22) or (month == 12 and day <= 21):
            return "sagittarius"
        elif (month == 12 and day >= 22) or (month == 1 and day <= 19):
            return "capricorn"
        elif (month == 1 and day >= 20) or (month == 2 and day <= 18):
            return "aquarius"
        else:
            return "pisces"
    
    # Zodiac compatibility matrix (simplified)
    zodiac_compatibility = {
        "aries": {"aries": 20, "leo": 28, "sagittarius": 26, "gemini": 25, "libra": 24},
        "taurus": {"taurus": 20, "virgo": 28, "capricorn": 26, "cancer": 25, "pisces": 24},
        "gemini": {"gemini": 20, "libra": 28, "aquarius": 26, "aries": 25, "leo": 24},
        "cancer": {"cancer": 20, "scorpio": 28, "pisces": 26, "taurus": 25, "virgo": 24},
        "leo": {"leo": 20, "aries": 28, "sagittarius": 26, "gemini": 25, "libra": 24},
        "virgo": {"virgo": 20, "taurus": 28, "capricorn": 26, "cancer": 25, "scorpio": 24},
        "libra": {"libra": 20, "gemini": 28, "aquarius": 26, "aries": 25, "leo": 24},
        "scorpio": {"scorpio": 20, "cancer": 28, "pisces": 26, "taurus": 25, "virgo": 24},
        "sagittarius": {"sagittarius": 20, "aries": 28, "leo": 26, "gemini": 25, "libra": 24},
        "capricorn": {"capricorn": 20, "taurus": 28, "virgo": 26, "cancer": 25, "scorpio": 24},
        "aquarius": {"aquarius": 20, "gemini": 28, "libra": 26, "aries": 25, "sagittarius": 24},
        "pisces": {"pisces": 20, "cancer": 28, "scorpio": 26, "taurus": 25, "capricorn": 24}
    }
    
    try:
        zodiac1 = get_zodiac_sign(date_obj1.month, date_obj1.day)
        zodiac2 = get_zodiac_sign(date_obj2.month, date_obj2.day)
        
        zodiac_score = zodiac_compatibility.get(zodiac1, {}).get(zodiac2, 15)
        if zodiac_score == 0:
            zodiac_score = 15
    except:
        zodiac_score = 15
    
    # Calculate final percentage
    total_score = name_score + date_score + zodiac_score
    love_percentage = min(100, max(10, total_score))
    
    return love_percentage

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/calculate', methods=['POST'])
def calculate():
    try:
        data = request.json
        name1 = data.get('name1', '')
        name2 = data.get('name2', '')
        date1 = data.get('date1', '')
        date2 = data.get('date2', '')
        
        if not all([name1, name2, date1, date2]):
            return jsonify({'error': 'All fields are required'}), 400
        
        # Calculate love percentage
        love_percentage = calculate_love_percentage(name1, name2, date1, date2)
        
        # Get a random romantic quote
        quote = random.choice(ROMANTIC_QUOTES)
        
        # Determine compatibility message
        if love_percentage >= 90:
            message = "A match written in the stars ✨"
        elif love_percentage >= 80:
            message = "Match made in heaven 💕"
        elif love_percentage >= 65:
            message = "Great compatibility 💑"
        elif love_percentage >= 50:
            message = "Good potential ahead 🌹"
        elif love_percentage >= 35:
            message = "Love finds a way 💖"
        else:
            message = "Every love is unique 🌸"
        
        return jsonify({
            'love_percentage': love_percentage,
            'message': message,
            'quote': quote,
            'zodiac1': get_zodiac_sign(datetime.strptime(date1, "%Y-%m-%d").month, datetime.strptime(date1, "%Y-%m-%d").day),
            'zodiac2': get_zodiac_sign(datetime.strptime(date2, "%Y-%m-%d").month, datetime.strptime(date2, "%Y-%m-%d").day)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_zodiac_sign(month, day):
    """Helper function to get zodiac sign"""
    if (month == 3 and day >= 21) or (month == 4 and day <= 19):
        return "♈ Aries"
    elif (month == 4 and day >= 20) or (month == 5 and day <= 20):
        return "♉ Taurus"
    elif (month == 5 and day >= 21) or (month == 6 and day <= 20):
        return "♊ Gemini"
    elif (month == 6 and day >= 21) or (month == 7 and day <= 22):
        return "♋ Cancer"
    elif (month == 7 and day >= 23) or (month == 8 and day <= 22):
        return "♌ Leo"
    elif (month == 8 and day >= 23) or (month == 9 and day <= 22):
        return "♍ Virgo"
    elif (month == 9 and day >= 23) or (month == 10 and day <= 22):
        return "♎ Libra"
    elif (month == 10 and day >= 23) or (month == 11 and day <= 21):
        return "♏ Scorpio"
    elif (month == 11 and day >= 22) or (month == 12 and day <= 21):
        return "♐ Sagittarius"
    elif (month == 12 and day >= 22) or (month == 1 and day <= 19):
        return "♑ Capricorn"
    elif (month == 1 and day >= 20) or (month == 2 and day <= 18):
        return "♒ Aquarius"
    else:
        return "♓ Pisces"

if __name__ == '__main__':
    app.run(debug=True)
