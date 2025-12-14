import os
from PIL import Image
import io
import base64

def convert():
    try:
        os.makedirs('src/assets', exist_ok=True)
        img = Image.open('public/card-back.png')
        img.thumbnail((300, 450)) # Reasonable size for web
        buffer = io.BytesIO()
        img.save(buffer, format='PNG', optimize=True)
        b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        with open('src/assets/cardBack.ts', 'w', encoding='utf-8') as f:
            f.write(f'export const CARD_BACK_IMAGE = "data:image/png;base64,{b64}";\n')
            
        print("Success: src/assets/cardBack.ts created")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    convert()
