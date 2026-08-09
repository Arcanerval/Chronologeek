# serveur.py — sert le site comme GitHub Pages, pour vérifier avant de pousser.
#
# http.server ne connaît pas les URL sans extension : /starwars renvoie 404
# alors que le site en ligne sert starwars.html. Toute la navigation de la
# refonte passe par ces URL — sans ce mappage, la vérification locale ne
# prouve rien.
import http.server, os, socketserver, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8951
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Pages(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=RACINE, **k)

    def translate_path(self, path):
        chemin = super().translate_path(path)
        if os.path.isdir(chemin):
            index = os.path.join(chemin, "index.html")
            if os.path.exists(index):
                return index
        if not os.path.exists(chemin) and not os.path.splitext(chemin)[1]:
            avec = chemin + ".html"
            if os.path.exists(avec):
                return avec
        return chemin

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        code = args[1] if len(args) > 1 else ""
        if str(code).startswith(("4", "5")):
            sys.stderr.write("%s %s\n" % (self.path, code))


class Serveur(socketserver.ThreadingTCPServer):
    # Sans fils d'exécution, une page qui demande trente ressources les obtient
    # une par une : la vérification met des minutes au lieu de secondes.
    allow_reuse_address = True
    daemon_threads = True


with Serveur(("", PORT), Pages) as srv:
    print(f"Chronologeek sur http://localhost:{PORT}/")
    srv.serve_forever()
