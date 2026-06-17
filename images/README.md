# Photos — drop-in guide

The site references these image files. Until a file exists, the site shows a warm
"photo coming soon" placeholder in its place (so nothing looks broken). Drop the
real photos in with these **exact filenames**, then commit + push — they'll go live.

Recommended: export from the originals (not Instagram), JPG or WebP, sized roughly
to the dimensions noted. Keep each file under ~400 KB if you can.

| Filename            | Use            | Best photo (from your IG)                                         | Target size |
|---------------------|----------------|-------------------------------------------------------------------|-------------|
| `hero.jpg`          | Hero (big)     | The white cake with the glossy strawberry-glaze top + flowers     | ~1440×1800 (portrait) |
| `story.jpg`         | About section  | The muffin on the windowsill by the plant (homey) — or any of you | ~1280×1520 (portrait) |
| `gallery-1.jpg`     | Gallery (tall) | The strawberry layer cake on the pink gingham cloth               | ~1200×1600 (portrait) |
| `gallery-2.jpg`     | Gallery        | The kraft box of muffins held up over the park/pond               | ~1200×1200 (square) |
| `gallery-3.jpg`     | Gallery        | The charlotte/tiramisu cake with the two gold candles             | ~1200×1200 (square) |
| `gallery-4.jpg`     | Gallery (wide) | The plate piled with glazed streusel muffins outdoors             | ~1800×1200 (landscape) |
| `gallery-5.jpg`     | Gallery        | The kraft box of muffins on the stovetop (or any cake)            | ~1200×1200 (square) |

Aspect ratios aren't strict — every image is `object-fit: cover`, so it'll crop
to fit nicely. Just get the orientation roughly right (portrait/square/landscape).

To add: copy files here → `git add images/ && git commit -m "add bakery photos" && git push`.
