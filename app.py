from flask import Flask, render_template, request, jsonify
from data import data

app = Flask(__name__)
app.secret_key = 'your_secret_key'


@app.route('/text-sign-language')
def textSignLanguage():
    return render_template('text-sign-language.html')

@app.route('/speech-sign-language')
def speechSignLanguage():
    return render_template('speech-sign-language.html', result="", videoList=[], categories=set())

def get_video_list(input_text):
    videoList = []
    found_categories = set()
    words = input_text.lower().split()
    for word in words:
        word_found = False
        for category, videos in data.items():
            if word in [video_name.lower() for video_name in videos]:
                videoList.append({'category': category, 'video_name': word})
                found_categories.add(category)
                word_found = True
                break

        if not word_found:
            for char in word:
                if char in data:
                    videoList.append({'category': char, 'video_name': char})
                    found_categories.add('abjek')

    return videoList, found_categories

@app.route('/process_input', methods=['POST'])
def process_input():
    data = request.json
    input_text = data.get('input_text', '')

    if not input_text:
        input_text = request.form.get('textInput', '')

    if not input_text:
        result = "Maaf, tidak dapat mengenali input"
        videoList = []
        categories = set()
    else:
        videoList, categories = get_video_list(input_text)
        if not categories:
            result = f"Kata tidak dikenali: {input_text}"
        else:
            result = f"Input yang dikenali: {input_text}"

    return jsonify({'result': result, 'videoList': videoList, 'categories': list(categories)})
  
    
@app.route('/process_speech', methods=['POST'])
def process_speech():
    data = request.json
    kata = data.get('kata', '')
    
    if not kata:
        result = "Maaf, tidak dapat mengenali suara"
        videoList = []
        categories = set()
    else:
        videoList, categories = get_video_list(kata)
        result = f"Kata yang dikenali: {kata}"
        
    return jsonify({'result': result, 'videoList': videoList, 'categories': list(categories)})


