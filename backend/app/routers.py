from fastapi import APIRouter, File
from ml.lp_music_caps.lpmc.music_captioning.captioning import captioning
from typing import Annotated

import argparse
import yt_dlp

router = APIRouter()

@router.get("/health")
def health():
    return {"health": "ok"}

@router.post("/music-caps")
async def predict(file: Annotated[bytes, File()]):
    # ファイル作成
    with open('../ml/lp_music_caps/dataset/input.mp3', 'wb') as write_file:
        write_file.write(file)
    
    parser = argparse.ArgumentParser(description='PyTorch MSD Training')
    # parser.add_argument('--gpu', default=1, type=int,
    #                     help='GPU id to use.')
    parser.add_argument("--framework", default="transfer", type=str)
    parser.add_argument("--caption_type", default="lp_music_caps", type=str)
    parser.add_argument("--max_length", default=128, type=int)
    parser.add_argument("--num_beams", default=5, type=int)
    parser.add_argument("--model_type", default="transfer", type=str)
    parser.add_argument("--audio_path", default="../ml/lp_music_caps/dataset/input.mp3", type=str)

    args = parser.parse_args(args=[])

    result = captioning(args)

    return {"result": result}

@router.post("/yt-music-caps")
async def yt_predict(s: str):

    ydl_opts = {
        'format': 'm4a/bestaudio/best',
        # ℹ️ See help(yt_dlp.postprocessor) for a list of available Postprocessors and their arguments
        'postprocessors': [{  # Extract audio using ffmpeg
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
        }],
        'outtmpl':'app/input',
        'download_ranges': yt_dlp.utils.download_range_func([], [[20.0, 30.0]]),
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([s])

        parser = argparse.ArgumentParser(description='PyTorch MSD Training')
        # parser.add_argument('--gpu', default=1, type=int,
        #                     help='GPU id to use.')
        parser.add_argument("--framework", default="transfer", type=str)
        parser.add_argument("--caption_type", default="lp_music_caps", type=str)
        parser.add_argument("--max_length", default=128, type=int)
        parser.add_argument("--num_beams", default=5, type=int)
        parser.add_argument("--model_type", default="transfer", type=str)
        parser.add_argument("--audio_path", default="app/input.mp3", type=str)

        args = parser.parse_args(args=[])

        result = captioning(args)

        return {"result": result}