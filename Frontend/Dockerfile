# Étape de construction avec Vite
FROM node:18 AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration du frontend
COPY Frontend/package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY Frontend/ ./ 

# Exécuter la construction du projet avec Vite
RUN npm run build

# Étape de production avec Nginx
FROM nginx:alpine

# Copier le dossier de construction depuis l'étape précédente vers le répertoire Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port 80 pour Nginx
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
