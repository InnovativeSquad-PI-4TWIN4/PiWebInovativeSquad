# Étape 1 : Construction de l'application backend
FROM node:18 AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json pour installer les dépendances
COPY Backend/package*.json ./

# Installer les dépendances du backend
RUN npm install

# Copier le reste du code de l'application
COPY Backend/ ./

# Exposer le port du backend
EXPOSE 3000

# Démarrer le serveur Express
CMD ["npm", "start"]
