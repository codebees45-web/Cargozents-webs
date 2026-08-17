import json
import os
import asyncio
from deep_translator import GoogleTranslator
from concurrent.futures import ThreadPoolExecutor

base_dir = os.path.dirname(os.path.abspath(__file__))
locales_dir = os.path.join(base_dir, 'frontend', 'public', 'locales')
en_file = os.path.join(locales_dir, 'en', 'translation.json')

langs = ['hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'or', 'ml', 'pa', 'as']

executor = ThreadPoolExecutor(max_workers=5)

async def translate_text(text, target_lang):
    loop = asyncio.get_event_loop()
    try:
        clean_v = text
        if clean_v.startswith(f"[{target_lang}]"):
             clean_v = clean_v[len(f"[{target_lang}]"):].strip()
        
        # GoogleTranslator(source='en', target=target_lang).translate(text)
        def _trans():
            return GoogleTranslator(source='en', target=target_lang).translate(clean_v)
            
        res = await loop.run_in_executor(executor, _trans)
        return res
    except Exception as e:
        print(f"Error translating '{text}' to {target_lang}: {e}")
        return text

async def translate_dict(d, target_lang):
    translated_d = {}
    tasks = []
    keys = []
    
    # We will just await sequentially to avoid rate limiting as much as possible, 
    # but concurrent is faster. Let's do a simple loop first.
    for k, v in d.items():
        if isinstance(v, dict):
            translated_d[k] = await translate_dict(v, target_lang)
        elif isinstance(v, str):
            res = await translate_text(v, target_lang)
            translated_d[k] = res
        else:
            translated_d[k] = v
    return translated_d

async def main():
    with open(en_file, 'r', encoding='utf-8') as f:
        en_data = json.load(f)

    for lang in langs:
        print(f"Translating for {lang}...")
        lang_dir = os.path.join(locales_dir, lang)
        os.makedirs(lang_dir, exist_ok=True)
        
        translated_data = await translate_dict(en_data, lang)
        
        with open(os.path.join(lang_dir, 'translation.json'), 'w', encoding='utf-8') as f:
            json.dump(translated_data, f, ensure_ascii=False, indent=2)
            
    print("ALL TRANSLATIONS COMPLETE.")

if __name__ == '__main__':
    asyncio.run(main())
