# Dockerfile para backend Node.js + Prisma con métricas CloudWatch
FROM node:20-alpine AS base
WORKDIR /app

# Variables de entorno
ENV AWS_REGION=us-east-1
ENV NODE_ENV=production

# Copiar archivos de dependencias
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Instalar dependencias
RUN npm install --production=false

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Generar cliente de Prisma si existe
RUN if [ -f ./prisma/schema.prisma ]; then npx prisma generate; fi

# Exponer puerto
EXPOSE 3000

# Iniciar aplicación
CMD ["npm", "start"]