"""Seal / open the encrypted data used by finances.html and jobtracker.html.

Matches vault.js: PBKDF2-SHA-256 (600k) -> 64 bytes; bytes 0-31 are the
AES-256-GCM key, bytes 32-63 the Supabase sync token (only its SHA-256 is
stored server-side). No secrets live in this file; the passphrase is asked for.

  python3 tools/vault.py seal  data.json page.html   # replace ENC in page with data
  python3 tools/vault.py open  page.html             # print ENC as JSON
  python3 tools/vault.py token page.html             # print sha256(token) for the vault row
"""
import base64, getpass, hashlib, json, os, re, sys
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

ITER = 600000
ENC_RE = re.compile(r"var ENC='([^']*)';")

def derive(passphrase, salt, n=ITER):
    bits = PBKDF2HMAC(algorithm=hashes.SHA256(), length=64, salt=salt, iterations=n).derive(passphrase.strip().lower().encode())
    return bits[:32], bits[32:].hex()

def token_hash(token):
    return hashlib.sha256(token.encode()).hexdigest()

def seal(obj, passphrase, salt=None):
    salt = salt or os.urandom(16)
    key, _ = derive(passphrase, salt)
    iv = os.urandom(12)
    ct = AESGCM(key).encrypt(iv, json.dumps(obj, separators=(',', ':')).encode(), None)
    b = lambda x: base64.b64encode(x).decode()
    return base64.b64encode(json.dumps({"v": 1, "n": ITER, "s": b(salt), "i": b(iv), "c": b(ct)}, separators=(',', ':')).encode()).decode()

def parse(blob):
    o = json.loads(base64.b64decode(blob))
    return base64.b64decode(o["s"]), base64.b64decode(o["i"]), base64.b64decode(o["c"]), o.get("n", ITER)

def open_blob(blob, passphrase):
    salt, iv, ct, n = parse(blob)
    key, _ = derive(passphrase, salt, n)
    return json.loads(AESGCM(key).decrypt(iv, ct, None))

def page_blob(path):
    m = ENC_RE.search(open(path).read())
    if not m: sys.exit("no ENC in " + path)
    return m.group(1)

def main():
    cmd = sys.argv[1]
    pw = os.environ.get("VAULT_PASSPHRASE") or getpass.getpass("Passphrase: ")
    if cmd == "seal":
        data, page = sys.argv[2], sys.argv[3]
        html = open(page).read()
        m = ENC_RE.search(html)
        # Keep the page's salt so existing backups and the synced copy still open.
        salt = parse(m.group(1))[0] if m and m.group(1) != "__ENC__" else None
        blob = seal(json.load(open(data)), pw, salt)
        html, k = ENC_RE.subn(lambda _: "var ENC='" + blob + "';", html, count=1)
        assert k == 1
        open(page, "w").write(html)
        print("sealed", page)
    elif cmd == "open":
        print(json.dumps(open_blob(page_blob(sys.argv[2]), pw), indent=2, ensure_ascii=False))
    elif cmd == "token":
        salt = parse(page_blob(sys.argv[2]))[0]
        print(token_hash(derive(pw, salt)[1]))

if __name__ == "__main__":
    main()
