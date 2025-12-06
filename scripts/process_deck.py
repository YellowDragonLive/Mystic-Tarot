import json
import os
import base64
import re

# Configuration
INPUT_FILE = 'deck_project.json'
OUTPUT_IMG_DIR = 'public/tarot'
OUTPUT_DATA_FILE = 'src/data/minorArcana.json'

# Ensure directories exist
os.makedirs(OUTPUT_IMG_DIR, exist_ok=True)
os.makedirs(os.path.dirname(OUTPUT_DATA_FILE), exist_ok=True)

def parse_meta(meta_str):
    """
    Parses meta string like "权杖 | 四" or "Wands | Four"
    Returns (suit, rank_index, rank_name)
    """
    if not meta_str:
        return None
    
    parts = [p.strip() for p in meta_str.split('|')]
    if len(parts) != 2:
        return None
    
    suit_cn = parts[0]
    rank_cn = parts[1]
    
    suits_map = {
        "权杖": "wands",
        "圣杯": "cups",
        "宝剑": "swords",
        "星币": "pentacles"
    }
    
    ranks_map = {
        "一": 0, "Ace": 0,
        "二": 1, "Two": 1,
        "三": 2, "Three": 2,
        "四": 3, "Four": 3,
        "五": 4, "Five": 4,
        "六": 5, "Six": 5,
        "七": 6, "Seven": 6,
        "八": 7, "Eight": 7,
        "九": 8, "Nine": 8,
        "十": 9, "Ten": 9,
        "侍从": 10, "Page": 10,
        "骑士": 11, "Knight": 11,
        "王后": 12, "Queen": 12,
        "国王": 13, "King": 13
    }

    if suit_cn not in suits_map:
        return None
        
    suit = suits_map[suit_cn]
    rank_idx = ranks_map.get(rank_cn)
    
    if rank_idx is None:
        print(f"Warning: Unknown rank {rank_cn}")
        return None
        
    return suit, rank_idx, rank_cn

def main():
    print(f"Reading {INPUT_FILE}...")
    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: {INPUT_FILE} not found.")
        return

    minor_arcana = []
    # Start ID from 22 (0-21 are Major Arcana)
    current_id = 22
    
    print(f"Data type: {type(data)}")
    if isinstance(data, dict):
        print(f"Keys: {list(data.keys())}")
        # Try to find the list of cards
        if 'cards' in data:
            data = data['cards']
        elif 'items' in data:
            data = data['items']
        else:
            # Look for a list value
            for k, v in data.items():
                if isinstance(v, list):
                    print(f"Found list in key '{k}' with {len(v)} items. Using it.")
                    data = v
                    break
    
    print(f"Found {len(data)} items. Processing...")
    
    for item in data:
        if not isinstance(item, dict):
            print(f"Skipping item of type {type(item)}")
            continue

        meta = item.get('meta', '')
        parsed = parse_meta(meta)
        
        if not parsed:
            # Skip if not a recognized Minor Arcana card
            continue
            
        suit, rank_idx, rank_cn = parsed
        
        # Generate filename: minor_wands_0.png
        filename = f"minor_{suit}_{rank_idx}.png"
        filepath = os.path.join(OUTPUT_IMG_DIR, filename)
        
        # Save image
        img_data = item.get('image_base64') or item.get('image') # Handle potential field names
        if not img_data and 'base64' in item:
             img_data = item['base64']

        # The JSON structure from head output looked like it had keys directly?
        # Let's check the head output again mentally.
        # It had "meta", "description". The image might be the key itself or "image"?
        # Wait, the head output showed:
        # "meta": "权杖 | 四",
        # "description": "..."
        # And a huge block of base64 text.
        # It seems the items might be objects with keys.
        # Let's assume standard structure. If `image` key is missing, I'll check `base64` or similar.
        # Actually, looking at the `head` output again (Step 298/305):
        # It seems to be a list of objects.
        # One object had "meta", "description".
        # The base64 string was visible in the output, but the key wasn't clearly shown in the snippet.
        # It looked like: `u4I+mLp0ZXhaIzlgTva3KgDv...` followed by `"meta": ...`
        # This suggests the key for the image might be `image` or `data` or it's the first field.
        # I'll try to find a key that looks like base64 or is named "image".
        
        # Let's inspect the keys of the first item in the loop to be safe if I was running interactively,
        # but here I'll write robust code.
        
        image_content = None
        for key in item.keys():
            val = item[key]
            if isinstance(val, str) and len(val) > 1000: # Likely base64
                image_content = val
                break
        
        if image_content:
            try:
                # Remove header if present (data:image/png;base64,...)
                if ',' in image_content:
                    image_content = image_content.split(',')[1]
                
                with open(filepath, 'wb') as img_f:
                    img_f.write(base64.b64decode(image_content))
            except Exception as e:
                print(f"Error saving image for {meta}: {e}")
        else:
            print(f"Warning: No image found for {meta}")

        # Add to data list
        card_data = {
            "id": current_id,
            "name": f"{suit.capitalize()} {rank_cn}", # English name might need mapping, but let's use constructed
            "name_cn": meta, # "权杖 | 四"
            "suit": suit, # "wands"
            "number": rank_idx, # 0-13
            "imgUrl": f"/tarot/{filename}",
            "description": item.get('description', ''),
            "arcana": "Minor" # We'll map this to the enum in TS
        }
        
        # Refine English Name
        suits_en = {"wands": "Wands", "cups": "Cups", "swords": "Swords", "pentacles": "Pentacles"}
        ranks_en = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"]
        if 0 <= rank_idx < len(ranks_en):
            card_data["name"] = f"{ranks_en[rank_idx]} of {suits_en[suit]}"
            
        minor_arcana.append(card_data)
        current_id += 1
        print(f"Processed: {card_data['name']} ({meta})")

    print(f"Total Minor Arcana cards processed: {len(minor_arcana)}")
    
    # Sort by ID to be sure
    minor_arcana.sort(key=lambda x: x['id'])
    
    # Write JSON
    with open(OUTPUT_DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(minor_arcana, f, ensure_ascii=False, indent=2)
    print(f"Saved data to {OUTPUT_DATA_FILE}")

if __name__ == "__main__":
    main()
