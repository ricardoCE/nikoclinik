"""Genera dist/nikoclinik.html: la landing en un solo archivo autocontenido.

El sitio real usa index.html + styles.css + script.js. El Artifact de Claude
necesita un archivo unico y sin el esqueleto <html>/<head>/<body>, asi que
aqui se inlinean los assets desde la misma fuente para evitar dos copias.

Uso:  python build_artifact.py
"""

import pathlib
import re

RAIZ = pathlib.Path(__file__).parent
DIST = RAIZ / "dist"
FUENTES = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
TITULO = "NikoClinik"


def leer(nombre: str) -> str:
    return (RAIZ / nombre).read_text(encoding="utf-8")


def cuerpo(html: str) -> str:
    """Devuelve el contenido de <body>, sin las etiquetas link/script locales."""
    match = re.search(r"<body[^>]*>(.*)</body>", html, re.S | re.I)
    if not match:
        raise SystemExit("index.html: no se encontro el bloque <body>")
    contenido = match.group(1)
    contenido = re.sub(r'\s*<script src="script\.js"></script>', "", contenido, flags=re.I)
    return contenido.strip("\n")


def main() -> None:
    html = leer("index.html")
    css = leer("styles.css")
    js = leer("script.js")

    salida = (
        f"<title>{TITULO}</title>\n"
        f'<link rel="stylesheet" href="{FUENTES}">\n'
        f"<style>\n{css}\n</style>\n\n"
        f"{cuerpo(html)}\n\n"
        f"<script>\n{js}\n</script>\n"
    )

    DIST.mkdir(exist_ok=True)
    destino = DIST / "nikoclinik.html"
    destino.write_text(salida, encoding="utf-8")
    print(f"OK  {destino}  ({len(salida) / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
