
# 🔄 Workflow de Git para COMODÍN IA

## 📋 Estructura de Branches

### Branches Principales

- **main**: Código estable y probado, listo para producción
- **development**: Desarrollo activo, integración de features

### Branches Temporales

- **feature/\***: Nuevas funcionalidades
- **bugfix/\***: Corrección de bugs
- **hotfix/\***: Correcciones urgentes en producción

## 🚀 Workflow de Desarrollo

### 1. Crear Nueva Funcionalidad

```bash
# Actualizar development
git checkout development
git pull origin development

# Crear branch de feature
git checkout -b feature/nombre-descriptivo

# Desarrollar...
# Hacer commits frecuentes
git add .
git commit -m "feat: descripción del cambio"

# Push del feature branch
git push origin feature/nombre-descriptivo
```

### 2. Pull Request y Review

1. Ir a GitHub: https://github.com/agenciacomodin/comodin-ia
2. Crear Pull Request desde `feature/nombre` → `development`
3. Revisar código
4. Aprobar y hacer merge

### 3. Merge a Main (Producción)

```bash
# Después de probar en development
git checkout main
git pull origin main
git merge development
git push origin main
```

### 4. Deployment a Producción

```bash
# En el servidor
ssh root@89.116.73.62
cd /srv/comodin_ia/comodin_ia/app
./scripts/deploy.sh
```

## 🏷️ Convenciones de Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Cambios de formato (no afectan código)
- **refactor**: Refactorización de código
- **test**: Agregar o modificar tests
- **chore**: Tareas de mantenimiento

Ejemplos:
```bash
git commit -m "feat: add WhatsApp integration with Evolution API"
git commit -m "fix: resolve authentication error for MANAGER role"
git commit -m "docs: update README with deployment instructions"
```

## 🔖 Tags y Versiones

### Crear Tag de Versión

```bash
# Crear tag anotado
git tag -a v1.1.0 -m "Version 1.1.0 - New UX/UI Design"

# Push tag
git push origin v1.1.0

# Push todos los tags
git push origin --tags
```

### Convención de Versiones (Semantic Versioning)

- **v1.0.0**: Major.Minor.Patch
- **Major**: Cambios incompatibles
- **Minor**: Nuevas funcionalidades compatibles
- **Patch**: Correcciones de bugs

## 🆘 Comandos de Emergencia

### Rollback a Versión Anterior

```bash
# En el servidor
cd /srv/comodin_ia/comodin_ia/app
./scripts/rollback.sh v1.0-production
```

### Deshacer Último Commit (local)

```bash
git reset --soft HEAD~1  # Mantiene cambios
git reset --hard HEAD~1  # Descarta cambios
```

### Deshacer Push (CUIDADO)

```bash
git revert <commit-hash>
git push origin main
```

## 📦 Workflow para Nueva Versión del Diseñador

Cuando llegue la nueva versión del diseñador UX/UI:

### 1. Crear Branch de Feature

```bash
git checkout development
git pull origin development
git checkout -b feature/new-design
```

### 2. Integrar Nueva Versión

```bash
# Descargar ZIP del diseñador
# Extraer archivos
# Copiar archivos al proyecto (excepto .env, node_modules)

# Verificar cambios
git status
git diff

# Agregar cambios
git add .
git commit -m "feat: implement new UX/UI design

- Modern and clean interface
- Improved navigation (single sidebar)
- Enhanced dashboards per role
- Evolution API integration
- Responsive design improvements"

# Push
git push origin feature/new-design
```

### 3. Probar en Development

```bash
# Merge a development
git checkout development
git merge feature/new-design
git push origin development

# Deployar a servidor de pruebas (si existe)
# O probar localmente
```

### 4. Merge a Main y Deploy

```bash
# Después de probar exhaustivamente
git checkout main
git merge development
git tag -a v2.0.0 -m "Version 2.0.0 - Complete UX/UI Redesign"
git push origin main --tags

# Deploy a producción
ssh root@89.116.73.62
cd /srv/comodin_ia/comodin_ia/app
./scripts/deploy.sh
```

## 🔍 Comandos Útiles

### Ver Historial

```bash
git log --oneline --graph --all
git log --author="nombre"
git log --since="2 weeks ago"
```

### Ver Diferencias

```bash
git diff                    # Cambios no staged
git diff --staged           # Cambios staged
git diff main development   # Entre branches
```

### Ver Estado

```bash
git status
git branch -a              # Todos los branches
git remote -v              # Remotes configurados
```

## 📞 Soporte

Si tienes problemas con Git:
1. Verificar estado: `git status`
2. Ver logs: `git log --oneline -10`
3. Contactar al equipo de desarrollo

---

**Última actualización**: 2025-10-03
