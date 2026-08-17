import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor
from deep_translator import GoogleTranslator

sys.stdout.reconfigure(encoding='utf-8')

langs = ['ur', 'gu', 'kn', 'or', 'ml', 'pa', 'as']
locales_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public', 'locales')
en_file = os.path.join(locales_dir, 'en', 'translation.json')

with open(en_file, 'r', encoding='utf-8') as f:
    en_data = json.load(f)

def flatten_dict(d, parent_key='', sep='.'):
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

def unflatten_dict(d, sep='.'):
    result_dict = dict()
    for key, value in d.items():
        parts = key.split(sep)
        d = result_dict
        for part in parts[:-1]:
            if part not in d:
                d[part] = dict()
            d = d[part]
        d[parts[-1]] = value
    return result_dict

def translate_single(k, v, target_lang):
    try:
        translator = GoogleTranslator(source='en', target=target_lang)
        res = translator.translate(v)
        return k, res
    except Exception as e:
        return k, v

for lang in langs:
    print(f"Starting fast translation for {lang}...")
    lang_dir = os.path.join(locales_dir, lang)
    os.makedirs(lang_dir, exist_ok=True)
    
    flat = flatten_dict(en_data)
    translated_flat = {}
    
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(translate_single, k, v, lang) for k, v in flat.items()]
        for future in futures:
            k, res = future.result()
            translated_flat[k] = res
            
    translated_data = unflatten_dict(translated_flat)
    with open(os.path.join(lang_dir, 'translation.json'), 'w', encoding='utf-8') as f:
        json.dump(translated_data, f, ensure_ascii=False, indent=2)
    print(f"Finished {lang}/translation.json")
