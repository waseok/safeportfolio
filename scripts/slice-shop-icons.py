"""상점 스프라이트 시트(통 이미지)를 아이콘별 PNG로 잘라 public/images/shop/ 에 저장."""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "shop-sprite-source.png"
OUT = ROOT / "public" / "images" / "shop"

# (left, top, right, bottom) — 798×305 기준, 상단 6개·하단 왼쪽 2개
CROPS = {
    "candy": (0, 0, 133, 152),
    "pencil": (133, 0, 266, 152),
    "safety-badge": (266, 0, 399, 152),
    "mini-note": (399, 0, 532, 152),
    "hand-sanitizer": (532, 0, 665, 152),
    "shield": (665, 0, 798, 152),
    "sticker": (0, 152, 133, 305),
    "eco-bag": (133, 152, 266, 305),
}


def trim_white(im: Image.Image, padding: int = 8) -> Image.Image:
    """흰 배경 여백을 줄여 아이콘만 크게 보이게."""
    rgba = im.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    min_x, min_y, max_x, max_y = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a < 16:
                continue
            if r > 245 and g > 245 and b > 245:
                continue
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x)
            max_y = max(max_y, y)
    if max_x <= min_x:
        return rgba
    box = (
        max(0, min_x - padding),
        max(0, min_y - padding),
        min(w, max_x + padding + 1),
        min(h, max_y + padding + 1),
    )
    return rgba.crop(box)


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"소스 없음: {SRC}")
    OUT.mkdir(parents=True, exist_ok=True)
    sheet = Image.open(SRC).convert("RGBA")
    for name, box in CROPS.items():
        cropped = sheet.crop(box)
        trimmed = trim_white(cropped)
        out_path = OUT / f"{name}.png"
        trimmed.save(out_path, "PNG")
        print(f"saved {out_path} ({trimmed.size[0]}x{trimmed.size[1]})")


if __name__ == "__main__":
    main()
