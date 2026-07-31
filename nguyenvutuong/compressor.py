from __future__ import annotations

import argparse
import json
import re
import shlex
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path


DEFAULT_SOURCE_ROOT = "compress:Udemy/crash-course-electronics-and-pcb-design"
DEFAULT_STATE_FILE = ".udemy-video-compressor-state.json"
CHAPTERS = [
#    "01-Getting-Started-with-Embedded-Engineering",
 #   "02-Introduction-to-Microprocessors-and-Microcontrollers",
  #  "03-Arduino-IDE,-Coding,-and-Hardware-Primer",
   # "04-Tools-and-Test-Equipment-Overview",
    #"05-Into-the-Abyss-Electronics-Theory-and-Fundamentals-Primer",
#    "06-C++-(along-with-C)-Primer-and-Fundamentals-from-the-Ground-Up",
    # "07-Introducing-the-World-of-Arduino,-AVR-8-Bit Processors,-ATmega-328p-&-Firmware",
    # "08",
    # "09-Digital-Communication-Protocols-and-Interfacing-RS-232,-UART,-SPI,-I2C-&-1-Wire",
    # "10-Advanced-Tools-for-Arduino-and-Embedded-Development",
    # "11-Into-the-Abyss-with-ARM-Cortex-M-Series-Processors/"
]
DEFAULT_CRF = 36
DEFAULT_PRESET = "medium"
DEFAULT_CODEC = "libx265"
DEFAULT_AUDIO_CODEC = "copy"
DEFAULT_PIXEL_FORMAT = "yuv420p"
DEFAULT_TEMP_DIR = "/var/tmp/udemy-video-compressor"
DEFAULT_VIDEO_EXTENSIONS = {
    ".avi",
    ".flv",
    ".m4v",
    ".mkv",
    ".mov",
    ".mp4",
    ".mpeg",
    ".mpg",
    ".ts",
    ".webm",
    ".wmv",
}


@dataclass(frozen=True)
class RemoteVideo:
    relative_path: str
    size: int | None = None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Compress videos from an rclone remote root and replace the remote files "
            "after successful upload."
        )
    )
    parser.add_argument(
        "--source-root",
        default=DEFAULT_SOURCE_ROOT,
        help=f"Rclone source root to scan (default: {DEFAULT_SOURCE_ROOT})",
    )
    parser.add_argument(
        "--crf",
        type=int,
        default=DEFAULT_CRF,
        help=f"FFmpeg CRF value for x265 (default: {DEFAULT_CRF})",
    )
    parser.add_argument(
        "--preset",
        default=DEFAULT_PRESET,
        help=f"FFmpeg x265 preset (default: {DEFAULT_PRESET})",
    )
    parser.add_argument(
        "--codec",
        default=DEFAULT_CODEC,
        help=f"Video codec to use with FFmpeg (default: {DEFAULT_CODEC})",
    )
    parser.add_argument(
        "--audio-codec",
        default=DEFAULT_AUDIO_CODEC,
        help=f"Audio codec to use with FFmpeg (default: {DEFAULT_AUDIO_CODEC})",
    )
    parser.add_argument(
        "--pixel-format",
        default=DEFAULT_PIXEL_FORMAT,
        help=f"FFmpeg pixel format (default: {DEFAULT_PIXEL_FORMAT})",
    )
    parser.add_argument(
        "--extensions",
        default=",".join(sorted(DEFAULT_VIDEO_EXTENSIONS)),
        help=(
            "Comma-separated list of video extensions to process "
            f"(default: {','.join(sorted(DEFAULT_VIDEO_EXTENSIONS))})"
        ),
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the actions without downloading, transcoding, or uploading",
    )
    parser.add_argument(
        "--temp-dir",
        default=DEFAULT_TEMP_DIR,
        help=(
            "Directory for local temporary files and transcoded outputs "
            f"(default: {DEFAULT_TEMP_DIR})"
        ),
    )
    parser.add_argument(
        "--state-file",
        default=DEFAULT_STATE_FILE,
        help=(
            "Path to a JSON file used to track completed files so interrupted runs can resume "
            f"(default: {DEFAULT_STATE_FILE})"
        ),
    )
    return parser.parse_args()


def normalize_remote_root(remote_root: str) -> str:
    return remote_root.rstrip("/")


def natural_sort_key(value: str) -> tuple[object, ...]:
    parts = []
    for chunk in re.split(r"(\d+)", value.lower()):
        if not chunk:
            continue
        parts.append(int(chunk) if chunk.isdigit() else chunk)
    return tuple(parts)


def video_sort_key(relative_path: str) -> tuple[object, ...]:
    return tuple(natural_sort_key(part) for part in Path(relative_path).parts)


def remote_join(remote_root: str, relative_path: str) -> str:
    return f"{normalize_remote_root(remote_root)}/{relative_path.lstrip('/')}"


def run_command(command: list[str], *, capture_output: bool = False) -> subprocess.CompletedProcess[str]:
    print(f"$ {shlex.join(command)}")
    return subprocess.run(
        command,
        check=True,
        text=True,
        capture_output=capture_output,
    )


def list_remote_videos(source_root: str, extensions: set[str]) -> list[RemoteVideo]:
    command = [
        "rclone",
        "lsjson",
        source_root,
        "--recursive",
        "--files-only",
        "--no-modtime",
        "--no-mimetype",
    ]
    result = run_command(command, capture_output=True)
    try:
        payload = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError("rclone lsjson returned invalid JSON") from exc

    videos: list[RemoteVideo] = []
    for entry in payload:
        relative_path = entry.get("Path")
        if not relative_path:
            continue
        if Path(relative_path).suffix.lower() not in extensions:
            continue
        videos.append(RemoteVideo(relative_path=relative_path, size=entry.get("Size")))
    return videos


def make_local_paths(temp_root: Path, relative_path: str) -> tuple[Path, Path]:
    relative = Path(relative_path)
    input_path = temp_root / relative
    output_path = temp_root / relative.parent / f"{relative.stem}.compressed{relative.suffix}"
    input_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    return input_path, output_path


def download_remote_file(source_remote: str, destination_path: Path) -> None:
    run_command(["rclone", "copyto", source_remote, str(destination_path), "--progress"])


def transcode_video(
    input_path: Path,
    output_path: Path,
    *,
    crf: int,
    preset: str,
    codec: str,
    audio_codec: str,
    pixel_format: str,
) -> None:
    command = [
        "ffmpeg",
        "-hide_banner",
        "-nostdin",
        "-y",
        "-i",
        str(input_path),
        "-map",
        "0:v:0",
        "-map",
        "0:a?",
        "-c:v",
        codec,
        "-crf",
        str(crf),
        "-preset",
        preset,
        "-pix_fmt",
        pixel_format,
        "-c:a",
        audio_codec,
        "-sn",
    ]
    if output_path.suffix.lower() in {".mp4", ".m4v"}:
        command.extend(["-movflags", "+faststart"])
    command.append(str(output_path))

    print(f"$ {shlex.join(command)}")
    subprocess.run(command, check=True)


def validate_transcode(output_path: Path) -> None:
    if not output_path.exists():
        raise RuntimeError(f"Transcode output missing: {output_path}")
    if output_path.stat().st_size <= 0:
        raise RuntimeError(f"Transcode output is empty: {output_path}")

    probe = run_command(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "stream=codec_type,codec_name",
            "-of",
            "json",
            str(output_path),
        ],
        capture_output=True,
    )
    try:
        payload = json.loads(probe.stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"ffprobe returned invalid JSON for {output_path}") from exc

    streams = payload.get("streams", [])
    if not any(stream.get("codec_type") == "video" for stream in streams):
        raise RuntimeError(f"No video stream detected in {output_path}")


def upload_stage(local_output_path: Path, staging_remote: str) -> None:
    run_command(["rclone", "moveto", str(local_output_path), staging_remote, "--progress"])


def promote_remote(staging_remote: str, final_remote: str) -> None:
    run_command(["rclone", "moveto", staging_remote, final_remote, "--progress"])


def cleanup_local_path(path: Path) -> None:
    try:
        path.unlink()
    except FileNotFoundError:
        return


def load_completed_items(state_file: Path | None) -> set[str]:
    if state_file is None:
        return set()
    if not state_file.exists():
        return set()

    try:
        payload = json.loads(state_file.read_text())
    except json.JSONDecodeError:
        print(f"State file {state_file} is invalid JSON; ignoring it", file=sys.stderr)
        return set()

    if isinstance(payload, list):
        return {str(item) for item in payload}
    if isinstance(payload, dict):
        completed = payload.get("completed", [])
        if isinstance(completed, list):
            return {str(item) for item in completed}
    return set()


def save_completed_items(state_file: Path | None, completed_items: set[str]) -> None:
    if state_file is None:
        return

    state_file.parent.mkdir(parents=True, exist_ok=True)
    temp_path = state_file.with_suffix(state_file.suffix + ".tmp")
    temp_path.write_text(json.dumps(sorted(completed_items), indent=2))
    temp_path.replace(state_file)


def process_video(
    video: RemoteVideo,
    *,
    source_root: str,
    temp_root: Path,
    crf: int,
    preset: str,
    codec: str,
    audio_codec: str,
    pixel_format: str,
    dry_run: bool,
) -> None:
    source_remote = remote_join(source_root, video.relative_path)
    final_remote = source_remote
    staging_remote = f"{final_remote}.compressing"

    input_path, output_path = make_local_paths(temp_root, video.relative_path)

    print(f"Processing: {video.relative_path}")
    if video.size is not None:
        print(f"  Source size: {video.size} bytes")
    print(f"  Final remote: {final_remote}")
    print(f"  Staging remote: {staging_remote}")

    if dry_run:
        print("  Dry run: skip download, transcode, and upload")
        return

    try:
        download_remote_file(source_remote, input_path)
        transcode_video(
            input_path,
            output_path,
            crf=crf,
            preset=preset,
            codec=codec,
            audio_codec=audio_codec,
            pixel_format=pixel_format,
        )
        validate_transcode(output_path)
        upload_stage(output_path, staging_remote)
        promote_remote(staging_remote, final_remote)
        print(f"  Completed: {video.relative_path}")
    finally:
        cleanup_local_path(input_path)
        cleanup_local_path(output_path)


def main() -> int:
    args = parse_args()
    source_root = normalize_remote_root(args.source_root)
    extensions = {
        extension.strip().lower()
        for extension in args.extensions.split(",")
        if extension.strip()
    }

    if not extensions:
        print("No valid extensions were provided.", file=sys.stderr)
        return 2

    print(f"Scanning remote root: {source_root}")
    videos = sorted(
        list_remote_videos(source_root, extensions),
        key=lambda video: video_sort_key(video.relative_path),
    )
    print(f"Found {len(videos)} video file(s)")

    if not videos:
        return 0

    state_file = Path(args.state_file) if args.state_file else None
    completed_items = load_completed_items(state_file)
    if completed_items:
        print(f"Loaded {len(completed_items)} completed file(s) from {state_file}")

    temp_dir_root = Path(args.temp_dir)
    temp_dir_root.mkdir(parents=True, exist_ok=True)

    print(f"Using temp directory: {temp_dir_root}")

    with tempfile.TemporaryDirectory(prefix="udemy-video-compressor-", dir=temp_dir_root) as temp_dir:
        temp_root = Path(temp_dir)
        failures = 0
        for index, video in enumerate(videos, start=1):
            print(f"\n[{index}/{len(videos)}]")
            if video.relative_path in completed_items:
                print(f"  Skipping already completed: {video.relative_path}")
                continue

            try:
                process_video(
                    video,
                    source_root=source_root,
                    temp_root=temp_root,
                    crf=args.crf,
                    preset=args.preset,
                    codec=args.codec,
                    audio_codec=args.audio_codec,
                    pixel_format=args.pixel_format,
                    dry_run=args.dry_run,
                )
                if not args.dry_run:
                    completed_items.add(video.relative_path)
                    save_completed_items(state_file, completed_items)
            except subprocess.CalledProcessError as exc:
                failures += 1
                print(f"  Command failed with exit code {exc.returncode}", file=sys.stderr)
                if exc.stdout:
                    print(exc.stdout, file=sys.stderr)
                if exc.stderr:
                    print(exc.stderr, file=sys.stderr)
            except Exception as exc:
                failures += 1
                print(f"  Failed: {exc}", file=sys.stderr)

        if failures:
            print(f"Finished with {failures} failure(s)", file=sys.stderr)
            return 1

    print("Finished successfully")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
