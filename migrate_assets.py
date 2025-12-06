import os
import shutil
import re

src_dir = r'x:\download\mystic-tarot\assets\images'
dst_dir = r'x:\download\mystic-tarot\public\tarot'

if not os.path.exists(dst_dir):
    os.makedirs(dst_dir)

files = os.listdir(src_dir)
print(f"Found {len(files)} files in {src_dir}")

for f in files:
    if not f.endswith('.png'):
        continue
    
    # Match pattern like "1_0._愚者.png"
    # The first number is the key.
    match = re.match(r'(\d+)_', f)
    if match:
        num = int(match.group(1))
        # Tarot index is num - 1 (1 -> 0, 2 -> 1, ...)
        new_index = num - 1
        new_name = f"major_{new_index}.png"
        dst_path = os.path.join(dst_dir, new_name)
        shutil.copy2(os.path.join(src_dir, f), dst_path)
        print(f"Copied {f} to {new_name}")
    else:
        print(f"Skipping {f}, no match")
