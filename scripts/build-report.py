#!/usr/bin/env python3
"""Markdown -> A4 PDF. No browser, remote assets or manual post-processing.
Install: python3 -m venv /tmp/privacy-lens-report
         /tmp/privacy-lens-report/bin/pip install -r scripts/requirements-report.txt
Build:   /tmp/privacy-lens-report/bin/python scripts/build-report.py
Image fragments crop=x,y,w,h use fractions for PDF clipping only; originals unchanged.
"""
from pathlib import Path
from html import escape
from urllib.parse import urlsplit, parse_qs, unquote
import re, sys, xml.etree.ElementTree as ET
import markdown, reportlab
from reportlab import rl_config
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak, Table, TableStyle, KeepTogether, Flowable
from reportlab.platypus.tableofcontents import TableOfContents

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'docs/relatorio-final.md'
OUTPUT=ROOT/'docs/relatorio-final.pdf'
rl_config.invariant=1
fontdir=Path(reportlab.__file__).parent/'fonts'
for name,file in [('Vera','Vera.ttf'),('Vera-Bold','VeraBd.ttf'),('Vera-Italic','VeraIt.ttf'),('Vera-BoldItalic','VeraBI.ttf')]:
 pdfmetrics.registerFont(TTFont(name,str(fontdir/file)))
pdfmetrics.registerFontFamily('Vera',normal='Vera',bold='Vera-Bold',italic='Vera-Italic',boldItalic='Vera-BoldItalic')
W,H=A4; M=54; WIDTH=W-2*M
ink=colors.HexColor('#19333e');teal=colors.HexColor('#006e68');muted=colors.HexColor('#53666e');line=colors.HexColor('#d2dfe2')
styles={
 'body':ParagraphStyle('Body',fontName='Vera',fontSize=10,leading=14,textColor=ink,spaceAfter=7,splitLongWords=True),
 'h2':ParagraphStyle('H2',fontName='Vera-Bold',fontSize=17,leading=22,textColor=teal,spaceBefore=3,spaceAfter=11,keepWithNext=True),
 'h3':ParagraphStyle('H3',fontName='Vera-Bold',fontSize=13,leading=18,textColor=ink,spaceBefore=10,spaceAfter=8,keepWithNext=True),
 'h4':ParagraphStyle('H4',fontName='Vera-Bold',fontSize=10.4,leading=14.5,textColor=teal,spaceBefore=8,spaceAfter=6,keepWithNext=True),
 'table':ParagraphStyle('Table',fontName='Vera',fontSize=8.2,leading=11,textColor=ink,splitLongWords=True),
 'tablehead':ParagraphStyle('TableHead',fontName='Vera-Bold',fontSize=8.3,leading=11,textColor=colors.white,splitLongWords=True),
 'caption':ParagraphStyle('Caption',fontName='Vera',fontSize=8.5,leading=12,textColor=muted,spaceBefore=6,spaceAfter=13),
 'source':ParagraphStyle('Source',fontName='Vera',fontSize=8.2,leading=11,textColor=muted,spaceAfter=8),
 'cover_title':ParagraphStyle('CoverTitle',fontName='Vera-Bold',fontSize=36,leading=44,textColor=teal,spaceAfter=18),
 'cover_subtitle':ParagraphStyle('CoverSubtitle',fontName='Vera-Bold',fontSize=18,leading=25,textColor=ink,spaceAfter=20),
 'cover':ParagraphStyle('Cover',fontName='Vera',fontSize=11.5,leading=18,textColor=muted,spaceAfter=13),
}

def inline(el):
 out=escape(el.text or '')
 for c in el:
  content=inline(c)
  if c.tag in ['strong','b']: out+='<b>'+content+'</b>'
  elif c.tag in ['em','i']:out+='<i>'+content+'</i>'
  elif c.tag=='code':out+='<font color="#006e68">'+content+'</font>'
  elif c.tag=='a':
   href=c.attrib.get('href','')
   # Keep web links; internal paths remain visible in prose and in the source map.
   out+=('<link href="'+escape(href,quote=True)+'" color="#006e68">'+content+'</link>') if href.startswith(('http://','https://','#')) else content
  elif c.tag=='br':out+='<br/>'
  else:out+=content
  out+=escape(c.tail or '')
 return out

class EvidenceImage(Flowable):
 def __init__(self,src):
  super().__init__();u=urlsplit(src);q=parse_qs(u.fragment);self.file=(SOURCE.parent/unquote(u.path)).resolve()
  if not self.file.is_relative_to(ROOT) or not self.file.is_file():raise ValueError('Imagem inválida: '+src)
  self.reader=ImageReader(str(self.file));self.iw,self.ih=self.reader.getSize()
  self.crop=[float(x) for x in q.get('crop',['0,0,1,1'])[0].split(',')]
  x,y,w,h=self.crop
  if min(x,y,w,h)<0 or w<=0 or h<=0 or x+w>1.001 or y+h>1.001:raise ValueError('Recorte inválido: '+src)
  maxw=min(WIDTH,float(q.get('width',[WIDTH])[0]));maxh=float(q.get('height',[430])[0])
  self.scale=min(maxw/(self.iw*w),maxh/(self.ih*h));self.width=self.iw*w*self.scale;self.height=self.ih*h*self.scale
  self.hAlign='CENTER'
 def draw(self):
  c=self.canv;x,y,w,h=self.crop;c.saveState();p=c.beginPath();p.rect(0,0,self.width,self.height);c.clipPath(p,stroke=0,fill=0)
  c.drawImage(self.reader,-x*self.iw*self.scale,-(1-y-h)*self.ih*self.scale,width=self.iw*self.scale,height=self.ih*self.scale,mask='auto')
  c.restoreState();c.setStrokeColor(line);c.setLineWidth(.4);c.rect(0,0,self.width,self.height)

class Report(BaseDocTemplate):
 def __init__(self):
  super().__init__(str(OUTPUT),pagesize=A4,rightMargin=M,leftMargin=M,topMargin=57,bottomMargin=49,title='Privacy Lens — Avaliação Intermediária de Cibersegurança',author='Pedro Henrique Vargas Sepulveda',subject='Relatório de evidências e limites da coleta de 28–29/09/2026',creator='scripts/build-report.py / ReportLab 4.4.4',pageCompression=1)
  self.addPageTemplates(PageTemplate(id='a4',frames=[Frame(M,49,WIDTH,H-106,id='body',leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)],onPage=self.decorate))
 def decorate(self,c,doc):
  c.saveState()
  if doc.page>1:
   c.setFont('Vera',8);c.setFillColor(muted);c.drawString(M,H-31,'PRIVACY LENS  /  CIBERSEGURANÇA');c.drawRightString(W-M,H-31,'INSPER · 2026')
   c.setStrokeColor(line);c.line(M,H-39,W-M,H-39)
   c.setFont('Vera',8);c.drawString(M,28,'Coleta: 28–29 set. 2026 · relatório de evidências');c.drawRightString(W-M,28,str(doc.page))
  else:
   c.setFillColor(teal);c.rect(M,H-91,56,5,fill=1,stroke=0)
  c.restoreState()
 def afterFlowable(self,f):
  if hasattr(f,'toclevel'):
   title=f.getPlainText();key=f.anchor;self.canv.bookmarkPage(key)
   self.canv.addOutlineEntry(title,key,level=f.toclevel,closed=False)
   self.notify('TOCEntry',(f.toclevel,title,self.page,key))

raw=SOURCE.read_text().replace('→','para');raw=raw.replace('<!-- PAGEBREAK -->','<div class="pagebreak"></div>').replace('<!-- TOC -->','<div class="toc"></div>').replace('<!-- COVER -->','<div class="cover"></div>').replace('<!-- ENDCOVER -->','<div class="endcover"></div>')
html=markdown.markdown(raw,extensions=['tables','fenced_code'])
xml=ET.fromstring('<root>'+html+'</root>');story=[];cover=False;headcounter=0
for el in xml:
 tag=el.attrib.get('class') if el.tag=='div' else el.tag
 if tag=='cover':cover=True;story.append(Spacer(1,92));continue
 if tag=='endcover':cover=False;continue
 if tag=='pagebreak':story.append(PageBreak());continue
 if tag=='toc':
  toc=TableOfContents();toc.tableStyle=TableStyle([('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0)]);toc.levelStyles=[ParagraphStyle('T0',fontName='Vera-Bold',fontSize=10,leading=13,spaceBefore=6,textColor=ink),ParagraphStyle('T1',fontName='Vera',fontSize=9.2,leading=12,leftIndent=14,spaceBefore=3,textColor=muted)]
  story.append(toc);continue
 if cover:
  style=styles['cover_title' if tag=='h1' else 'cover_subtitle' if tag=='h2' else 'cover'];story.append(Paragraph(inline(el),style));continue
 if tag in ['h1','h2','h3','h4']:
  p=Paragraph(inline(el),styles.get(tag,styles['h2']))
  if tag in ['h2','h3'] and el.text!='Sumário':
   p.toclevel=0 if tag=='h2' else 1;p.anchor='sec'+str(headcounter);headcounter+=1
  story.append(p)
 elif tag=='p':
  img=el.find('img')
  if img is not None:
   flow=EvidenceImage(img.attrib['src']);cap=Paragraph(escape(img.attrib.get('alt','')),styles['caption']);story.append(KeepTogether([flow,cap]))
  else:
   plain=''.join(el.itertext());sty=styles['source'] if plain.startswith(('Fonte:','Fontes:')) else styles['body'];story.append(Paragraph(inline(el),sty))
 elif tag=='table':
  trs=el.findall('.//tr');n=len(list(trs[0]));data=[]
  for ri,row in enumerate(trs):data.append([Paragraph(inline(cell),styles['tablehead' if ri==0 else 'table']) for cell in row])
  weights={2:[1.05,2.4],3:[1.1,1.4,2.1],4:[1.2,1.15,1.25,2.1],5:[1.2,1.1,1.15,1.2,2],6:[1.4,.65,.65,1.15,1.15,1.8]}.get(n,[1]*n)
  table=Table(data,colWidths=[WIDTH*w/sum(weights) for w in weights],repeatRows=1,hAlign='LEFT')
  table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),teal),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#f0f5f5')]),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),('LINEBELOW',(0,-1),(-1,-1),.5,line)]));story.extend([table,Spacer(1,12)])
 elif tag in ['ul','ol']:
  for idx,li in enumerate(el.findall('li')):
   prefix=str(idx+1)+'. ' if tag=='ol' else '• ';story.append(Paragraph(prefix+inline(li),styles['body']))
 elif tag=='pre':story.append(Paragraph(escape(''.join(el.itertext())).replace('\n','<br/>'),styles['source']))
 else:raise ValueError('Bloco Markdown não suportado: '+tag)
Report().multiBuild(story)
print(OUTPUT)
