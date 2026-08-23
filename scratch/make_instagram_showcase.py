import subprocess
import os

art_dir = r"C:\Users\DANTECH\.gemini\antigravity-ide\brain\7bbe31bb-c042-4a66-a7a9-4a38c1139201"
ffmpeg_path = r"C:\Users\DANTECH\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe"

reel_output = os.path.join(art_dir, "mashtool_instagram_reel_9x16.mp4")
hd_output = os.path.join(art_dir, "mashtool_portfolio_showcase_16x9.mp4")

# Images with corresponding captions
slides = [
    (
        os.path.join(art_dir, "new_data_home.png"),
        "MASHTOOL ATELIER",
        "Ethereal Fullstack E-Commerce"
    ),
    (
        os.path.join(art_dir, "new_data_products.png"),
        "AUTHENTIC CATALOG",
        "9 Categories & Priority Sorting"
    ),
    (
        os.path.join(art_dir, "new_data_detail.png"),
        "BESPOKE & REVIEWS",
        "Calla Lily, Custom Options & Ratings"
    ),
    (
        os.path.join(art_dir, "new_data_admin.png"),
        "ADMIN CONTROL PANEL",
        "Featured Toggles & Real-Time Stats"
    )
]

def build_clips(mode="reel"):
    # mode: 'reel' (1080x1920) or 'hd' (1920x1080)
    w, h = (1080, 1920) if mode == "reel" else (1920, 1080)
    clips = []
    
    for i, (img, title, sub) in enumerate(slides):
        clip_path = os.path.join(art_dir, f"clip_{mode}_{i}.mp4")
        
        # Ken burns zoompan filter + drawtext filters
        vf = (
            f"scale=2560:-1,"
            f"zoompan=z='min(zoom+0.0015,1.15)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=150:s={w}x{h},"
            f"drawbox=y=0:h={int(h*0.2)}:color=black@0.65:t=fill,"
            f"drawbox=y={int(h*0.8)}:h={int(h*0.2)}:color=black@0.65:t=fill,"
            f"drawtext=fontfile='C\\:/Windows/Fonts/arialbd.ttf':text='{title}':fontcolor=white:fontsize={42 if mode=='reel' else 48}:x=(w-text_w)/2:y={int(h*0.06)}:box=1:boxcolor=0x78323c@0.8:boxborderw=10,"
            f"drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='{sub}':fontcolor=0xe0e0e0:fontsize={26 if mode=='reel' else 30}:x=(w-text_w)/2:y={int(h*0.12)}"
        )
        
        cmd = [
            ffmpeg_path,
            "-y",
            "-loop", "1",
            "-i", img,
            "-t", "5",
            "-vf", vf,
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-r", "30",
            clip_path
        ]
        subprocess.run(cmd, check=True)
        clips.append(clip_path)
        
    concat_txt = os.path.join(art_dir, f"concat_{mode}.txt")
    with open(concat_txt, "w", encoding="utf-8") as f:
        for c in clips:
            c_path = c.replace('\\', '/')
            f.write(f"file '{c_path}'\n")
            
    out_file = reel_output if mode == "reel" else hd_output
    concat_cmd = [
        ffmpeg_path,
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_txt,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-r", "30",
        out_file
    ]
    subprocess.run(concat_cmd, check=True)
    print(f"Generated {mode} video:", out_file)

# Generate both Reel (9:16) and HD (16:9)
build_clips("reel")
build_clips("hd")
print("All videos built successfully!")
