import pdfplumber
import os
import re

def extract_all_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text

def extract_courses_from_text(text):
    lines = text.split('\n')
    courses = []
    
    # Patrones para identificar cursos
    # Los cursos suelen ser:
    # - Frases con mayúsculas
    # - Pueden tener códigos como "MAT101" o "CS-201"
    # - Suelen tener longitud entre 5 y 80 caracteres
    # - No son números puros
    # - No son palabras comunes de estructura
    
    exclude_phrases = [
        'Ciclo', 'Semestre', 'Créditos', 'Horas', 'Total', 'SUMILLA', 'SÍLABO',
        'MALLA', 'CURRICULAR', 'Facultad', 'Escuela', 'Universidad', 'CESAR VALLEJO',
        'UCV', 'Página', 'Plan', 'Estudios', 'Pregrado', 'Grado', 'Título',
        'Perfil', 'Egresado', 'Competencias', 'Objetivos', 'Metodología',
        'Evaluación', 'Bibliografía', 'Requisitos', 'Correquisitos',
        'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
        'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo',
        'Octavo', 'Noveno', 'Décimo', 'Primera', 'Segunda', 'Tercera',
        'www.ucv.edu.pe', 'WWW.UCV.EDU.PE', 'ESTUDIA', 'Transforma',
        'Esta carrera', 'es para ti si tienes', 'este perfil',
        'Te apasiona', 'Buscas', 'Eres', 'Tienes', 'Siempre',
        'Lo que un', 'sabe hacer', 'Implementa', 'Desarrolla',
        'Evalúa', 'Diagnostica', 'Crea', 'Diseña', 'Ofrece',
        '210 mil', 'estudiantes', 'vallejianos', 'exitosos',
        'top10', 'ranking', 'Times Higher', 'Education', 'SCImago',
        'latinoamericano', 'peruanas', 'producción', 'científica',
        'sostenibilidad', 'ambiental', 'innovación', 'mejor',
        '¿Y si', 'podría', 'redefinir', 'futuro', 'innovación',
        'tecnológica', 'sanar', 'sociedad', 'marcada', 'estrés',
        'ansiedad', 'fortalece', 'comunidades', 'dominio', 'habilidades',
        'clínicas', 'técnicas', 'psicológicas', 'impulsen', 'bienestar',
        'crecimiento', 'personal', 'profund', 'pasión', 'comprender',
        'mente', 'humana', 'ayudar', 'alcanzar', 'emocional', 'busca',
        'nuevas', 'formas', 'aprender', 'afrontar', 'nuevos', 'retos',
        'empático', 'observador', 'inclinación', 'natural', 'brindar',
        'apoyo', 'orientación', 'momentos', 'difíciles', 'evaluar',
        'diagnosticar', 'aplicar', 'terapias', 'especializadas', 'mejorar',
        'función', 'física', 'calidad', 'vida', 'contribuir', 'gestión',
        'continua', 'servicios', 'fisioterapia', 'motiva', 'participar',
        'salud', 'pública', 'promoviendo', 'prevención', 'formando',
        'parte', 'equipos', 'multidisciplinarios', 'clave', 'detectar',
        'enfermedades', 'tiempo', 'salvar', 'vidas', 'procedimientos',
        'científicos', 'tecnológicos', 'laboratorio', 'diagnosticar', 'tratar',
        'través', 'análisis', 'muestras', 'biológicas', 'aseguren',
        'recuperación', 'interés', 'ciencias', 'desea', 'contribuir',
        'diagnóstico', 'tratamiento', 'enfrentar', 'desafíos', 'especialmente',
        'campo', 'curioso', 'apasiona', 'resolver', 'problemas', 'precisión',
        'optimizar', 'procesos', 'eficiencia', 'impulsar', 'productividad',
        'sostenibilidad', 'empresas', 'analítico', 'resuelves', 'creativamente',
        'aplicaciones', 'cambien', 'mundo', 'sistemas', 'adapten', 'entorno',
        'ofrece', 'soluciones', 'efectivas', 'procesamiento', 'información',
        'vanguardia', 'tecnología', 'ámbito', 'digital', 'detallista', 'mente',
        'lógica', 'entender', 'complejos', 'Tecnologías', 'Información',
        'Comunicaciones', 'Integra', 'diversas', 'contexto', 'internacional',
        'mercados', 'globales', 'generar', 'oportunidades', 'comerciales',
        'analítico', 'estratégico', 'visión', 'adaptarte', 'entornos',
        'constantemente', 'mundo', 'negocios', 'globales'
    ]
    
    for line in lines:
        line = line.strip()
        if not line or len(line) < 5 or len(line) > 100:
            continue
        
        # Saltar líneas que son solo números
        if re.match(r'^\d+\s*$', line):
            continue
            
        # Saltar líneas que son solo códigos de curso sin nombre
        if re.match(r'^[A-Z]{2,4}\d{3,4}\s*$', line):
            continue
        
        # Saltar líneas que contienen frases a excluir
        skip = False
        for phrase in exclude_phrases:
            if phrase.lower() in line.lower():
                skip = True
                break
        if skip:
            continue
        
        # Si la línea parece un nombre de curso
        # - Tiene al menos una mayúscula
        # - No es todo mayúsculas (probablemente un título)
        # - Tiene palabras con sentido
        if any(c.isupper() for c in line) and not line.isupper():
            # Verificar que tenga al menos 2 palabras
            words = line.split()
            if len(words) >= 2:
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
            text = extract_all_text_from_pdf(pdf_path)
            courses = extract_courses_from_text(text)
            # Eliminar duplicados manteniendo orden
            unique_courses = list(dict.fromkeys(courses))
            all_courses[career_name] = unique_courses
            print(f"  Cursos encontrados: {len(unique_courses)}")
            if unique_courses:
                print(f"  Ejemplos: {unique_courses[:5]}")
        except Exception as e:
            print(f"  Error: {e}")
            import traceback
            traceback.print_exc()
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
with open('cursos_extraidos_v3.txt', 'w', encoding='utf-8') as f:
    f.write("EXTRACCIÓN DE CURSOS POR CARRERA (v3 - Texto completo)\n")
    f.write("="*50 + "\n\n")
    for career, courses in all_courses.items():
        f.write(f"\n{career}:\n")
        f.write("-" * 50 + "\n")
        for course in courses:
            f.write(f"- {course}\n")

print("\nResultados guardados en 'cursos_extraidos_v3.txt'")
