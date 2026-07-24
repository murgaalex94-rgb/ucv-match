import pdfplumber
import os
import re

def extract_tables_from_pdf(pdf_path):
    courses = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            if tables:
                for table in tables:
                    for row in table:
                        if row:
                            for cell in row:
                                if cell and isinstance(cell, str):
                                    cell = cell.strip()
                                    # Filtrar celdas que parecen nombres de cursos
                                    if len(cell) > 5 and len(cell) < 100:
                                        # Excluir palabras comunes que no son cursos
                                        exclude_words = [
                                            'Ciclo', 'Semestre', 'Crédito', 'Hora', 'Total',
                                            'SUMILLA', 'SÍLABO', 'MALLA', 'CURRICULAR',
                                            'Facultad', 'Escuela', 'Universidad', 'UCV',
                                            'Página', 'Plan', 'Estudios', 'Pregrado',
                                            'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
                                            'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto',
                                            'Sexto', 'Séptimo', 'Octavo', 'Noveno', 'Décimo'
                                        ]
                                        if not any(word.lower() in cell.lower() for word in exclude_words):
                                            # Evitar celdas que son solo números o códigos
                                            if not re.match(r'^\d+\s*$', cell) and not re.match(r'^[A-Z]{2,4}\d{3,4}\s*$', cell):
                                                courses.append(cell)
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
            courses = extract_tables_from_pdf(pdf_path)
            # Eliminar duplicados manteniendo orden
            unique_courses = list(dict.fromkeys(courses))
            all_courses[career_name] = unique_courses
            print(f"  Cursos encontrados: {len(unique_courses)}")
            if unique_courses:
                print(f"  Ejemplos: {unique_courses[:3]}")
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
    for course in courses:
        js_code += f"    '{course}',\n"
    js_code += "  ],\n"
js_code += "};"

print(js_code)

# Guardar en archivo
with open('cursos_extraidos_v2.txt', 'w', encoding='utf-8') as f:
    f.write("EXTRACCIÓN DE CURSOS POR CARRERA (v2 - Tablas)\n")
    f.write("="*50 + "\n\n")
    for career, courses in all_courses.items():
        f.write(f"\n{career}:\n")
        f.write("-" * 50 + "\n")
        for course in courses:
            f.write(f"- {course}\n")

print("\nResultados guardados en 'cursos_extraidos_v2.txt'")
