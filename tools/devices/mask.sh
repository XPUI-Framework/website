#!/bin/sh
# Masks Xteink's photographs of the X3 into the frames the site draws a golden inside:
# the background removed, and the promotional screen cut out. The numbers are measured from
# the originals — the device's box in the photograph, and the screen's box inside it.
set -eu
cd "$(dirname "$0")"
out=../../public/devices
mkdir -p "$out"

# $1 photograph, $2 device box, $3..$6 screen box inside that crop, $7 output
mask() {
  magick "$1" -alpha set -fuzz 8% -fill none -floodfill +0+0 white -crop "$2" +repage \
    \( -size "${2%%+*}" xc:none -fill white -draw "roundrectangle $3,$4 $(($3 + $5)),$(($4 + $6)) 8,8" \) \
    -compose DstOut -composite -define webp:lossless=false -quality 92 "$7"
}

mask x3-black.webp 561x849+315+168 54 50 451 677 "$out/x3-black.webp"
mask x3-white.webp 895x1345+509+279 86 79 719 1072 "$out/x3-white.webp"
