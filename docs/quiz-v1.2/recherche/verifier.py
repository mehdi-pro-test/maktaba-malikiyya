#!/usr/bin/env python3
"""Contrôles documentaires hors ligne ; aucune validation doctrinale implicite."""
from pathlib import Path
import json, re, hashlib, collections
root=Path(__file__).resolve().parent
raw=(root/'banque-150-questions.json').read_bytes();bank=json.loads(raw)
assert bank['schemaVersion']=='1.2-research-1'
assert bank['publicationAllowed'] is False
books={b['id']:b for b in bank['books']};sources={s['id']:s for s in bank['sources']};qs=bank['questions']
assert len(books)==15 and len(qs)==150
assert len({x['id'] for x in qs})==150
assert len({x['questionFr'] for x in qs})==150
counts=collections.Counter();methods=collections.Counter()
for x in qs:
 assert x['bookId'] in books and x['level']==books[x['bookId']]['level']
 assert x['status']=='review'
 assert x['questionFr'].strip() and x['explanationFr'].strip()
 assert len(x['options'])==4
 assert len({o['id'] for o in x['options']})==4
 assert len({o['textFr'].strip().casefold() for o in x['options']})==4
 assert x['correctOptionId'] in {o['id'] for o in x['options']}
 assert x['scholarlyReview']['status']=='pending'
 assert x['scholarlyReview']['reviewer'] is None and x['scholarlyReview']['reviewedAt'] is None
 assert x['references']
 for r in x['references']:
  assert r['sourceId'] in sources and r['url']==sources[r['sourceId']]['url']
  assert r['url'].startswith('https://') and r['quoteAr'].strip()
  assert re.search('[\u0600-\u06ff]',r['quoteAr'])
  assert 'nindex.php' not in r['quoteAr'] and '<script' not in r['quoteAr']
  assert r['sectionAr'] and r['workTitleAr'] and r['authorAr']
  assert r['textCheck'] in ['matched-transcription','read-facsimile']
  if r['printedPage'] is not None:
   assert r['pdfPage'] is not None and r['textCheck']=='read-facsimile'
  methods[r['textCheck']]+=1
 counts[x['bookId']]+=1
for b in books.values():
 assert counts[b['id']]==10
 lot=json.loads((root/'questions'/(b['id']+'.json')).read_text())
 assert lot['book']==b
 assert lot['questions']==[x for x in qs if x['bookId']==b['id']]
registry=json.loads((root/'preuves'/'registre-controle.json').read_text())
assert len(registry)==150
assert {r['questionId'] for r in registry}=={q['id'] for q in qs}
for r,q in zip(registry,qs):
 assert r['questionId']==q['id'] and r['quoteAr']==q['references'][0]['quoteAr']
 assert re.fullmatch('[0-9a-f]{64}',r['sourceSha256'])
print('OK : 15 ouvrages, 150 questions, 4 choix distincts, 1 réponse par question.')
print('OK : 10 questions par ouvrage ; lots individuels identiques à la banque.')
print('OK : citations, références HTTPS, provenance et registres cohérents.')
print('Contrôles textuels :',dict(methods))
print('Publication : 0 ; relectures humaines approuvées : 0 ; questions en revue : 150.')
print('SHA256 banque :',hashlib.sha256(raw).hexdigest())
