import base64
import io
import re
from PyPDF2 import PdfReader

async def normalize_number(s: str) -> str:
    s = s.strip()
    if ',' in s and '.' in s:
        if s.rfind('.') > s.rfind(','):
            s = s.replace(',', '')
        else:
            s = s.replace('.', '').replace(',', '.')
    elif ',' in s:
        s = s.replace('.', '').replace(',', '.')
    else:
        s = s.replace(',', '')
    return s

async def parse_pdf_accounts_precise(b64_pdf: str, context_chars: int = 120) -> str:
    """
    Extrae pares CUENTA/VALOR evitando concatenación de códigos con valores.
    """
    data = base64.b64decode(b64_pdf)
    with io.BytesIO(data) as fh:
        reader = PdfReader(fh)
        out = []
        seen = set()
        money_re = re.compile(r'(?:\d{1,3}(?:,\d{3})+|\d+)(?:[.,]\d{2,})')
        valor_after_re = re.compile(
            r'\bVALOR\b[^\d\-\.\,]{0,30}((?:\d{1,3}(?:,\d{3})+|\d+)(?:[.,]\d{2,}))',
            flags=re.I
        )
        letters_re = re.compile(r'[A-Za-zÁÉÍÓÚÜÑñáéíóúü]')

        for page in reader.pages:
            text = page.extract_text() or ""
            text = text.replace('\u00A0', ' ')
            lines = text.splitlines()
            for idx, raw in enumerate(lines):
                line = raw.strip()
                if not line:
                    continue

                # Si hay 'VALOR' en la línea, tomar el número que aparece después de esa palabra
                m_val = valor_after_re.search(line)
                if m_val:
                    raw_value = m_val.group(1)
                    val = await normalize_number(raw_value)
                    left = line[:m_val.start()].strip()
                    left = re.split(r'\bC(?:Ó|O)DIGO\b', left, flags=re.I)[0].strip()
                    left = re.sub(r'[:\-\u2013\u2014]+', ' ', left).strip()
                    left = re.sub(r'[\(\)\[\]]+', '', left).strip()
                    left = re.sub(r'\s{2,}', ' ', left).strip()
                    left = re.sub(r'^[\d\.\-\s]+', '', left).strip()
                    if not left and idx > 0:
                        prev = lines[idx-1].strip()
                        prev = re.sub(r'^[\d\.\-\s]+', '', prev).strip()
                        if letters_re.search(prev):
                            left = prev
                    if left and not left.isdigit():
                        pair = f"CUENTA: {left} VALOR: {val}"
                        if pair not in seen:
                            seen.add(pair)
                            out.append(pair)
                    continue

                # Si no hay 'VALOR', buscar último número monetario en la línea
                money_matches = money_re.findall(line)
                if money_matches:
                    raw_value = money_matches[-1]
                    val = await normalize_number(raw_value)
                    pos = line.rfind(raw_value)
                    context = line[:pos].strip()
                    if not letters_re.search(context) and idx > 0:
                        context = lines[idx-1].strip()
                    acc = context
                    acc = re.split(r'\bC(?:Ó|O)DIGO\b', acc, flags=re.I)[0].strip()
                    acc = re.sub(r'[:\-\u2013\u2014]+', ' ', acc).strip()
                    acc = re.sub(r'[\(\)\[\]]+', '', acc).strip()
                    acc = re.sub(r'\s{2,}', ' ', acc).strip()
                    acc = re.sub(r'^[\d\.\-\s]+', '', acc).strip()
                    acc = re.sub(r'\b\d+\b$', '', acc).strip()
                    if acc and not acc.isdigit():
                        pair = f"CUENTA: {acc} VALOR: {val}"
                        if pair not in seen:
                            seen.add(pair)
                            out.append(pair)
                    continue

        return "\n".join(out)

