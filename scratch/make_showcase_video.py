import subprocess
import os

art_dir = r"C:\Users\DANTECH\.gemini\antigravity-ide\brain\7bbe31bb-c042-4a66-a7a9-4a38c1139201"
output_file = os.path.join(art_dir, "project_showcase_20s.mp4")
ffmpeg_path = r"C:\Users\DANTECH\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe"

images = [
    (os.path.join(art_dir, "homepage_clean_1787342306815.png"), "Mashtool Atelier — Handcrafted Crochet"),
    (os.path.join(art_dir, "shop_clean_1787342322313.png"), "Authentic Collections & Priority Bookmarks"),
    (os.path.join(art_dir, "product_detail_clean_1787342346383.png"), "Product Options, Reviews & Ratings"),
    (os.path.join(art_dir, "admin_products_clean_1787342357747.png"), "Admin Dashboard & Control Center"),
]

# We create 5-second video clips for each image with scale
clips = []
for i, (img, text) in enumerate(images):
    clip_path = os.path.join(art_dir, f"scratch_clip_{i}.mp4")
    cmd = [
        ffmpeg_path,
        "-y",
        "-loop", "1",
        "-i", img,
        "-t", "5",
        "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x1a1a1a",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-r", "30",
        clip_path
    ]
    subprocess.run(cmd, check=True)
    clips.append(clip_path)

# Concat file
concat_txt = os.path.join(art_dir, "concat_list.txt")
with open(concat_txt, "w", encoding="utf-8") as f:
    for c in clips:
        c_path = c.replace('\\', '/')
        f.write(f"file '{c_path}'\n")

# Combine clips into final 20-second mp4
concat_cmd = [
    ffmpeg_path,
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concat_txt,
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-r", "30",
    output_file
]
subprocess.run(concat_cmd, check=True)
print("Successfully generated 20-second video at:", output_file)
