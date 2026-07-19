import fitz, os, re, json, sys
from collections import Counter

folder = sys.argv[1]

def career_name_from_filename(fname):
    name = fname.replace('.pdf', '')
    name = re.sub(r'_\d{8,}', '', name)
    name = re.sub(r'\d{9,}$', '', name)
    name = name.replace('_', ' ')
    name = re.sub(r'\s+', ' ', name).strip()
    return name

# Only filter obvious non-course text from sidebars
skip_texts = [
    'competencia complementaria', 'computación',
    'malla curricular', 'de la carrera de',
    'certificamos tus conocimientos', 'infraestructura',
    'internacionalización', 'calidad',
    'para una buena vida', 'conocerás el mundo', 'porque formamos',
    'en los precios', 'innovador con rostro',
]

def is_course_text(text):
    t = text.strip().lower()
    if len(t) < 4: return False
    for skip in skip_texts:
        if skip in t:
            return False
    return True

def merge_courses(spans):
    if not spans: return []
    spans.sort(key=lambda s: (s['y0'], s['x0']))
    connectors = {'y', 'e', 'de', 'del', 'en', 'con', 'su', 'sus'}
    merged = []
    current = spans[0]
    for s in spans[1:]:
        y_diff = s['y0'] - current['y0']
        x_diff = abs(s['x0'] - current['x0'])
        first_word = s['text'].strip().split()[0].lower() if s['text'].strip() else ''
        is_continuation = first_word in connectors or (s['text'].strip() and s['text'].strip()[0].islower())
        if (y_diff < 10.5 and x_diff < 5) or (first_word in connectors and x_diff < 5) or (s['text'].strip() and s['text'].strip()[0].islower() and y_diff < 12 and x_diff < 5):
            current['text'] += ' ' + s['text']
            current['y1'] = s['y1']
            current['y0'] = s['y0']
        else:
            merged.append(current)
            current = s
    merged.append(current)
    result = []
    for m in merged:
        t = m['text'].strip()
        t = re.sub(r'  +', ' ', t)
        if is_course_text(t):
            result.append(t)
    return result

# Process all PDFs
results = {}
for fname in sorted(os.listdir(folder)):
    if not fname.endswith('.pdf'): continue
    career = career_name_from_filename(fname)
    fpath = os.path.join(folder, fname)

    doc = fitz.open(fpath)
    page = doc[5]

    # Collect all MessinaSans-Book 9.4 spans with their positions
    all_entries = []
    for b in page.get_text('dict')['blocks']:
        if b['type'] != 0: continue
        for line in b['lines']:
            for span in line['spans']:
                text = span['text'].strip()
                if not text: continue
                if 'MessinaSans-Book' not in span['font']: continue
                if abs(span['size'] - 9.4) > 1: continue
                bbox = span['bbox']
                x0 = round(bbox[0], 1)
                y0 = bbox[1]
                y_center = (bbox[1] + bbox[3]) / 2
                all_entries.append({
                    'text': text,
                    'x0': x0,
                    'y0': y0,
                    'y1': bbox[3],
                    'y_center': y_center,
                })

    if not all_entries:
        doc.close()
        continue

    # Find column x0 clusters (3 main course columns)
    x0s = [e['x0'] for e in all_entries]
    x0_counts = Counter(x0s)
    top_x0s = sorted([x0 for x0, cnt in x0_counts.most_common(20) if cnt >= 3 and x0 < 1000])
    # Cluster: consecutive values within 15px
    clusters = []
    for x0 in top_x0s:
        if not clusters or x0 - clusters[-1][-1] > 15:
            clusters.append([x0])
        else:
            clusters[-1].append(x0)
    # Pick top 3 clusters by total count
    cluster_avgs = []
    for cl in clusters:
        total = sum(x0_counts[x] for x in cl)
        avg = sum(cl) / len(cl)
        cluster_avgs.append((avg, total, cl))
    cluster_avgs.sort(key=lambda t: -t[1])
    top3 = cluster_avgs[:3]
    top3.sort(key=lambda t: t[0])
    col_centers = [t[0] for t in top3]

    if len(col_centers) < 3:
        doc.close()
        continue

    # Dynamic column boundaries: midpoints between centers
    col_boundaries = []
    for i in range(len(col_centers) - 1):
        col_boundaries.append((col_centers[i] + col_centers[i + 1]) / 2)

    def col_for_x(x0):
        if x0 < col_boundaries[0]: return 1
        if len(col_boundaries) > 1 and x0 < col_boundaries[1]: return 2
        return 3

    # Collect all y_centers from spans in main columns (within 15px of a column center)
    main_col_spans = []
    for e in all_entries:
        if any(abs(e['x0'] - cc) < 15 for cc in col_centers):
            main_col_spans.append(e)

    if not main_col_spans:
        doc.close()
        continue

    # Find row boundaries by k-means++ clustering y_centers into 4 rows
    y_centers = sorted([e['y_center'] for e in main_col_spans])
    # Initialize with 4 evenly spaced seeds
    y_min = y_centers[0]
    y_max = y_centers[-1]
    step = (y_max - y_min) / 8
    means = [y_min + step, y_min + 3*step, y_min + 5*step, y_min + 7*step]
    for _ in range(20):
        clusters = [[] for _ in range(4)]
        for y in y_centers:
            idx = min(range(4), key=lambda i: abs(y - means[i]))
            clusters[idx].append(y)
        for i in range(4):
            if clusters[i]:
                means[i] = sum(clusters[i]) / len(clusters[i])
    means.sort()
    # Boundaries at midpoints between means
    row_bounds = [(means[i] + means[i+1]) / 2 for i in range(3)]

    def row_for_y(cy):
        if cy < row_bounds[0]: return 1
        if cy < row_bounds[1]: return 2
        if cy < row_bounds[2]: return 3
        return 4

    grid_to_cycle = {
        (1,1):1, (2,1):2, (3,1):3,
        (1,2):4, (2,2):5, (3,2):6,
        (1,3):7, (2,3):8,
        (1,4):9, (2,4):10,
    }

    cycle_spans = {c: [] for c in range(1, 11)}
    for e in all_entries:
        # Only include if within 15px of a main column center
        if not any(abs(e['x0'] - cc) < 15 for cc in col_centers):
            continue
        col = col_for_x(e['x0'])
        row = row_for_y(e['y_center'])
        cycle = grid_to_cycle.get((col, row), 0)
        if cycle > 0:
            cycle_spans[cycle].append(e)

    career_data = {}
    for cycle in range(1, 11):
        courses = merge_courses(cycle_spans[cycle])
        if courses:
            seen = set()
            unique = []
            for c in courses:
                if c not in seen:
                    seen.add(c)
                    unique.append(c)
            career_data[cycle] = unique

    if career_data:
        results[career] = career_data
    doc.close()

name_map = {
    'ADMINISTRACION DE EMPRESAS': 'Administración de Empresas',
    'AMBIENTAL': 'Ingeniería Ambiental',
    'ARQUITECTURA': 'Arquitectura',
    'ARTE Y DISENO': 'Arte & Diseño Gráfico Empresarial',
    'CIENCIAS DE LA COMUNICACION': 'Ciencias de la Comunicación',
    'CIENCIAS DEL DEPORTE': 'Ciencias del Deporte',
    'CIVIL': 'Ingeniería Civil',
    'CONTABILIDAD': 'Contabilidad',
    'Derecho': 'Derecho',
    'EDUCACION EN IDIOMAS-INGLES': 'Educación en Idiomas - Inglés',
    'EDUCACION INICIAL': 'Educación Inicial',
    'Enfermeria': 'Enfermería',
    'NEGOCIOS INTERNACIONALES': 'Administración y Negocios Internacionales',
    'Psicologia': 'Psicología',
    'TECNOLOGIA MEDICA EN TERAPIA FISICA Y REHABILITACION': 'Tecnología Médica en Terapia Física y Rehabilitación',
    'Tecnologia Medica en laboratorio clinico': 'Tecnología Médica en Laboratorio Clínico y Anatomía Patológica',
    'ing industrial': 'Ingeniería Industrial',
    'ing sistemas': 'Ingeniería de Sistemas',
}

for career in sorted(results.keys(), key=lambda k: name_map.get(k, k)):
    display_name = name_map.get(career, career)
    print(f'    "{display_name}": {{')
    for cycle in sorted(results[career].keys()):
        courses = [f'"{c}"' for c in results[career][cycle]]
        print(f'      {cycle}: [{", ".join(courses)}],')
    print('    },')
