import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = process.cwd();

const copies = [
  {
    from: "data/closet-photos/Closet Photos",
    to: "public/closet-photos",
  },
  {
    from: "data/closet-photos",
    to: "public/data/closet-photos",
  },
];

for (const copy of copies) {
  const source = resolve(root, copy.from);
  const target = resolve(root, copy.to);

  if (!existsSync(source)) {
    console.warn(`Skipping missing source: ${copy.from}`);
    continue;
  }

  mkdirSync(dirname(target), { recursive: true });
  rmSync(target, { recursive: true, force: true });
  cpSync(source, target, { recursive: true });

  console.log(`Synced ${copy.from} -> ${copy.to}`);
}
