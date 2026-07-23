import PyPDF2
import os
import re

def extract_text_from_pdf(pdf_path):
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
    return text

def extract_courses(text):
    # Patrones comunes para identificar cursos en mallas curriculares
    # Buscar líneas que parezcan nombres de cursos
    lines = text.split('\n')
    courses = []
    
    # Patrones para filtrar
    skip_patterns = [
        r'^\s*$',
        r'^\d+$',
        r'^Ciclo',
        r'^Semestre',
        r'^Créditos',
        r'^Horas',
        r'^Total',
        r'^SUMILLA',
        r'^SÍLABO',
        r'^MALLA',
        r'^CURRICULAR',
        r'^PLAN',
        r'^ESTUDIOS',
        r'^UNIVERSIDAD',
        r'^CESAR VALLEJO',
        r'^UCV',
        r'^Página',
        r'^Facultad',
        r'^Escuela',
    ]
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Saltar líneas que coinciden con patrones a ignorar
        skip = False
        for pattern in skip_patterns:
            if re.match(pattern, line, re.IGNORECASE):
                skip = True
                break
        if skip:
            continue
        
        # Si la línea parece un curso (longitud razonable, no solo números)
        if len(line) > 3 and len(line) < 100:
            # Evitar líneas que son solo números o códigos
            if not re.match(r'^\d+\s*$', line):
                courses.append(line)
    
    return courses

# Mapeo de archivos a nombres de carreras
pdf_files = {
    'ADMINISTRACION_DE_EMPRESAS_20251031114920.pdf': 'Administración de Empresas',
    'AMBIENTAL_20251014085714.pdf': 'Ingeniería Ambiental',
    'ARQUITECTURA_20251014085722.pdf': 'Arquitectura',
    'ARTE_Y_DISENO_20251014085714.pdf': 'Arte & Diseño Gráfico Empresarial',
    'CIENCIAS_DEL_DEPORTE_20251014085723.pdf': 'Ciencias del Deporte',
    'CIENCIAS_DE_LA_COMUNICACION_20251014085715.pdf': 'Ciencias de la Comunicación',
    'CIVIL_20251014085715.pdf': 'Ingeniería Civil',
    'CONTABILIDAD_20251014085717.pdf': 'Contabilidad',
    'Derecho__20251014085717.pdf': 'Derecho',
    'EDUCACION_EN_IDIOMAS-INGLES_20251014085717.pdf': 'Educación en Idiomas - Inglés',
    'EDUCACION_INICIAL_20251014085719.pdf': 'Educación Inicial',
    'Enfermeria_20251031144012.pdf': 'Enfermería',
    'NEGOCIOS_INTERNACIONALES_20251014085725.pdf': 'Administración y Negocios Internacionales',
    'Psicologia_20251014085726.pdf': 'Psicología',
    'TECNOLOGIA_MEDICA_EN_TERAPIA_FISICA_Y_REHABILITACION_20251014085727.pdf': 'Tecnología Médica en Terapia Física y Rehabilitación',
    'Tecnologia_Medica_en_laboratorio_clinico_20251014085728.pdf': 'Tecnología Médica en Laboratorio Clínico y Anatomía Patológica',
    'ing_industrial_20251014085725.pdf': 'Ingeniería Industrial',
    'ing_sistemas_20251014085723.pdf': 'Ingeniería de Sistemas',
}

all_courses = {}

for pdf_file, career_name in pdf_files.items():
    pdf_path = os.path.join(os.getcwd(), pdf_file)
    if os.path.exists(pdf_path):
        print(f"Procesando: {career_name}")
        try:
            text = extract_text_from_pdf(pdf_path)
            courses = extract_courses(text)
            # Eliminar duplicados manteniendo orden
            unique_courses = list(dict.fromkeys(courses))
            all_courses[career_name] = unique_courses
            print(f"  Cursos encontrados: {len(unique_courses)}")
        except Exception as e:
            print(f"  Error: {e}")
            all_courses[career_name] = []
    else:
        print(f"No encontrado: {pdf_file}")
        all_courses[career_name] = []

# Generar código JavaScript
print("\n" + "="*50)
print("CÓDIGO JAVASCRIPT:")
print("="*50)

js_code = "const cursosPorCarrera = {\n"
for career, courses in all_courses.items():
    js_code += f"  '{career}': [\n"
    for course in courses[:50]:  # Limitar a 50 cursos por carrera
        js_code += f"    '{course}',\n"
    js_code += "  ],\n"
js_code += "};"

print(js_code)

# Guardar en archivo
with open('cursos_extraidos.txt', 'w', encoding='utf-8') as f:
    f.write("EXTRACCIÓN DE CURSOS POR CARRERA\n")
    f.write("="*50 + "\n\n")
    for career, courses in all_courses.items():
        f.write(f"\n{career}:\n")
        f.write("-" * 50 + "\n")
        for course in courses:
            f.write(f"- {course}\n")

print("\nResultados guardados en 'cursos_extraidos.txt'")
