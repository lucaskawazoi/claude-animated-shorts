# Página de revisão estática do vídeo: player + notas da dissect (primeira e última versão) + roteiro + folha de quadros.
# Uso: python3 scripts/review_page.py <dir-do-video> <dados.json>   (dados.json: título, notas, sobras, gasto…)
import html, json, sys, pathlib

d = pathlib.Path(sys.argv[1]); data = json.loads(pathlib.Path(sys.argv[2]).read_text())
roteiro = (d / "roteiro.txt").read_text().strip().split("\n")
rows = "".join(
    f"<tr><td>{html.escape(r['nome'])}</td><td>{r['v1']}</td><td>{r['vN']}</td><td>{html.escape(r.get('nota', ''))}</td></tr>" for r in data["notas"]
)
resumo = "".join(f"<li>{html.escape(x)}</li>" for x in data["resumo"])
txt = "".join(f"<p>{html.escape(p)}</p>" for p in roteiro)
page = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(data['titulo'])}</title>
<style>:root{{--bg:#0f1722;--fg:#eef3f8;--mut:#9fb2c6;--ac:#ffd400;--ok:#5cff7a}}
body{{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif}}main{{max-width:980px;margin:0 auto;padding:16px}}
h1{{color:var(--ac);font-size:26px}}h2{{color:var(--ac);margin-top:28px}}.cols{{display:grid;grid-template-columns:320px 1fr;gap:20px}}
@media(max-width:760px){{.cols{{grid-template-columns:1fr}}}}video{{width:100%;border-radius:12px;background:#000}}
table{{border-collapse:collapse;width:100%}}td,th{{border-bottom:1px solid #2b3a4d;padding:6px 8px;text-align:left}}th{{color:var(--mut)}}
.box{{background:#16212f;border-radius:12px;padding:12px 16px}}img{{max-width:100%;border-radius:8px}}small{{color:var(--mut)}}</style></head><body><main>
<h1>{html.escape(data['titulo'])}</h1><p><small>{html.escape(data['sub'])}</small></p>
<div class="cols"><div><video controls playsinline src="{data['video']}"></video><p><small>Não publicado em lugar nenhum. Só para o Lucas revisar.</small></p></div>
<div class="box"><h2 style="margin-top:0">Resumo</h2><ul>{resumo}</ul></div></div>
<h2>Nota da dissect contra a referência</h2><table><tr><th>Medida</th><th>1ª versão</th><th>Última versão</th><th>Observação</th></tr>{rows}</table>
<h2>Roteiro (português, bordões: “Chefe, tem um probleminha.” e “Deixa comigo.”)</h2><div class="box">{txt}</div>
<h2>Linha do tempo (1 quadro a cada ~3 s)</h2><img src="{data['folha']}" alt="folha de quadros">
<h2>Gastos</h2><p>{html.escape(data['gasto'])}</p></main></body></html>"""
(d / "revisao.html").write_text(page)
print(d / "revisao.html")
