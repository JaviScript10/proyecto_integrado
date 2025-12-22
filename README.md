\# ClipControl - Sistema de Gestión de Entregas



\## 🚀 Instalación Rápida



\### Requisitos Previos

\- Python 3.11+

\- Node.js 18+

\- Git



\### Backend (API)



1\. Clonar repositorio:

```bash

git clone https://github.com/JaviScript10/proyecto\_integrado.git

cd proyecto\_integrado/backend

```



2\. Crear `.env` con tus credenciales de Supabase:

```env

SUPABASE\_URL=https://tu-proyecto.supabase.co

SUPABASE\_KEY=tu-clave-anon-public

APP\_NAME=ClipControl API

APP\_VERSION=1.0.0

DEBUG=True

CORS\_ORIGINS=http://localhost:5173,http://localhost:3000

```



3\. Crear virtual environment e instalar:

```bash

python -m venv venv

.\\venv\\Scripts\\activate  # Windows

pip install -r requirements.txt

```



4\. Iniciar servidor:

```bash

uvicorn main:app --reload

```



✅ Backend corriendo en: http://localhost:8000



\### Frontend (Panel Admin)



1\. Ir a carpeta frontend:

```bash

cd ../panel-admin

```



2\. Instalar dependencias:

```bash

npm install

```



3\. Iniciar aplicación:

```bash

npm run dev

```



✅ Frontend corriendo en: http://localhost:5173



\### Acceso

\- \*\*Usuario:\*\* admin

\- \*\*Password:\*\* admin123



\## 📚 Documentación API

http://localhost:8000/docs



\## 🛠️ Tecnologías

\- \*\*Backend:\*\* FastAPI + Python

\- \*\*Frontend:\*\* React + Vite + TailwindCSS

\- \*\*Base de Datos:\*\* Supabase (PostgreSQL)

