"""로고에서 파비콘·앱 아이콘 생성 (Next.js app/ 규칙)."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "public" / "logo.png"


def square_logo(src: Image.Image) -> Image.Image:
    rgba = src.convert("RGBA")
    w, h = rgba.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return rgba.crop((left, top, left + side, top + side))


def main() -> None:
    if not LOGO.exists():
        raise SystemExit(f"로고 없음: {LOGO}")
    base = square_logo(Image.open(LOGO))

    app_dir = ROOT / "app"
    public_dir = ROOT / "public"

    icon32 = base.resize((32, 32), Image.Resampling.LANCZOS)
    icon32.save(app_dir / "icon.png", "PNG")

    apple = base.resize((180, 180), Image.Resampling.LANCZOS)
    apple.save(app_dir / "apple-icon.png", "PNG")

    ico_sizes = [16, 32, 48]
    ico_images = [
        base.resize((s, s), Image.Resampling.LANCZOS) for s in ico_sizes
    ]
    ico_images[0].save(
        app_dir / "favicon.ico",
        format="ICO",
        sizes=[(s, s) for s in ico_sizes],
        append_images=ico_images[1:],
    )
    ico_images[0].save(
        public_dir / "favicon.ico",
        format="ICO",
        sizes=[(s, s) for s in ico_sizes],
        append_images=ico_images[1:],
    )

    # 브라우저 직접 요청용 작은 PNG
    base.resize((192, 192), Image.Resampling.LANCZOS).save(
        public_dir / "favicon-192.png", "PNG"
    )

    print("Generated app/icon.png, apple-icon.png, favicon.ico, public/favicon.ico")


if __name__ == "__main__":
    main()
