import json
import os
import time
import sys
from deep_translator import GoogleTranslator

sys.stdout.reconfigure(encoding='utf-8')

langs = ['ur', 'gu', 'kn', 'or', 'ml', 'pa', 'as']
locales_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public', 'locales')
en_file = os.path.join(locales_dir, 'en', 'translation.json')

with open(en_file, 'r', encoding='utf-8') as f:
    en_data = json.load(f)

def translate_object(obj, target_lang):
    translated_obj = {}
    for key, value in obj.items():
        if isinstance(value, dict):
            translated_obj[key] = translate_object(value, target_lang)
        elif isinstance(value, str):
            try:
                # deep-translator handles limits better, but we add a small delay
                time.sleep(0.1)
                translator = GoogleTranslator(source='en', target=target_lang)
                res = translator.translate(value)
                translated_obj[key] = res
                print(f"[{target_lang}] {key}: {res}")
            except Exception as e:
                print(f"Error translating {key} to {target_lang}: {e}")
                translated_obj[key] = value # fallback to english
        else:
            translated_obj[key] = value
    return translated_obj

for lang in langs:
    print(f"Starting translation for {lang}...")
    lang_dir = os.path.join(locales_dir, lang)
    os.makedirs(lang_dir, exist_ok=True)
    
    translated_data = translate_object(en_data, lang)
    with open(os.path.join(lang_dir, 'translation.json'), 'w', encoding='utf-8') as f:
        json.dump(translated_data, f, ensure_ascii=False, indent=2)
    print(f"Finished {lang}/translation.json")
