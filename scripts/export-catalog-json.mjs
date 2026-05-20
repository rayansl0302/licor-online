import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_BRANDS } from "../src/data/defaultBrands.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const payload = {
  version: 1,
  descricao: "Catálogo padrão de licores — preços base (sem lucro)",
  brands: DEFAULT_BRANDS,
};

mkdirSync(join(root, "public"), { recursive: true });
writeFileSync(
  join(root, "public/catalogo-padrao.json"),
  `${JSON.stringify(payload, null, 2)}\n`,
  "utf8"
);
writeFileSync(
  join(root, "src/data/catalogo-padrao.json"),
  `${JSON.stringify(payload, null, 2)}\n`,
  "utf8"
);
