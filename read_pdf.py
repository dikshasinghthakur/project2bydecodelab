import os
from pathlib import Path

pdf = Path(r'C:\Users\ANIKET\Downloads\Full Stack P2.pdf')
print('exists=', pdf.exists(), 'path=', pdf)
if pdf.exists():
    print('size=', pdf.stat().st_size)
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(str(pdf))
        print('pages=', len(reader.pages))
        for i in range(min(3, len(reader.pages))):
            text = reader.pages[i].extract_text() or ''
            print('--- PAGE', i + 1, '---')
            print(text[:3000])
    except Exception as e:
        print('ERR', type(e).__name__, e)
