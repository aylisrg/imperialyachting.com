# Golf on the Yacht — Photos

Photos for the page: https://imperialyachting.com/destinations/golf-on-the-yacht

Upload JPEG files into this folder with these exact names (lowercase):

| Filename       | What to show                                              |
| -------------- | --------------------------------------------------------- |
| `hero.jpg`     | Best shot — guest teeing off from the yacht platform      |
| `platform.jpg` | The stern platform set up for golf                        |
| `green.jpg`    | The floating green target on the water                    |
| `swing.jpg`    | A guest mid-swing on board                                 |
| `balls.jpg`    | The water-soluble eco golf balls (close-up)               |
| `sunset.jpg`   | Golf session during sunset                                 |

Requirements:

- Format: JPEG (`.jpg`), landscape orientation preferred (4:3 or 16:10)
- Minimum size: 1600×1200 px
- Maximum file size: 2 MB (compress via tinyjpg.com)

The gallery on the page picks these files up automatically — any photo that
is not uploaded yet is simply hidden, so partial uploads are fine.

After uploading `hero.jpg`, also set the catalog card image in
`src/data/adventures.ts` (`golf-on-the-yacht` entry):

```ts
image: "/media/destinations/golf/hero.jpg",
coverImage: "/media/destinations/golf/hero.jpg",
```
