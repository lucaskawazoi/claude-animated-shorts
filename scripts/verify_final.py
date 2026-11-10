# verify-final-video adaptado ao explicador de brinquedo: formato, transcrição vs roteiro, resíduo de marcação, silêncio, quadros pretos/congelados.
# Uso: python3 scripts/verify_final.py <video.mp4> <roteiro.txt> <transcript.json da dissect> [volume-saida.json]
import difflib, json, re, subprocess, sys

vid, roteiro, tr = sys.argv[1], sys.argv[2], sys.argv[3]
out = {}
pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", vid], capture_output=True, text=True).stdout)
v = next(s for s in pr["streams"] if s["codec_type"] == "video"); a = next((s for s in pr["streams"] if s["codec_type"] == "audio"), None)
out["formato"] = dict(w=v["width"], h=v["height"], fps=v["avg_frame_rate"], dur=float(pr["format"]["duration"]), audio=bool(a))
t = json.load(open(tr)); words = t["words"] if isinstance(t, dict) and "words" in t else t.get("segments", [])
txt = " ".join(w["word"] if "word" in w else w.get("text", "") for w in words) if words and isinstance(words[0], dict) and ("word" in words[0] or "text" in words[0]) else str(t)
norm = lambda s: re.sub(r"[^a-z0-9 ]", "", re.sub(r"[̀-ͯ]", "", __import__("unicodedata").normalize("NFD", s.lower())))
ref, got = norm(open(roteiro).read()).split(), norm(txt).split()
out["transcricao"] = dict(similaridade=round(difflib.SequenceMatcher(None, ref, got).ratio(), 3), palavras_roteiro=len(ref), palavras_ouvidas=len(got),
                          residuo_marcacao=bool(re.search(r"break time|prosody|ssml|<[a-z]+|\[[a-z ]+\]", txt.lower())))
sd = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", vid, "-af", "silencedetect=n=-45dB:d=0.4", "-vn", "-f", "null", "-"], capture_output=True, text=True).stderr
out["silencios_ge_0.4s"] = len(re.findall(r"silence_start", sd))
bd = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", vid, "-vf", "blackdetect=d=0.2:pix_th=0.1,freezedetect=n=0.0005:d=0.7", "-an", "-f", "null", "-"], capture_output=True, text=True).stderr
out["quadros_pretos"] = len(re.findall(r"black_start", bd)); out["trechos_congelados_ge_0.7s"] = len(re.findall(r"freeze_start", bd))
ok = out["formato"]["w"] == 1080 and out["formato"]["h"] == 1920 and out["formato"]["audio"] and out["transcricao"]["similaridade"] >= 0.85 and not out["transcricao"]["residuo_marcacao"] and out["quadros_pretos"] == 0
out["veredito"] = "PASS" if ok else "FAIL"
print(json.dumps(out, ensure_ascii=False, indent=1))
if len(sys.argv) > 4: open(sys.argv[4], "w").write(json.dumps(out, ensure_ascii=False, indent=1))
