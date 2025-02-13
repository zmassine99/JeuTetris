// Sélection du canevas et du contexte de dessin
const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

// Définition des constantes de la grille
const tailleBloc = 30; // Taille d'un bloc en pixels
const lignes = 22; // Nombre de lignes de la grille
const colonnes = 10; // Nombre de colonnes de la grille

// Définition des variables du jeu
let grille; // Grille du jeu
let pieceActuelle; // Pièce en cours de jeu
let score = 0; // Score du joueur initialisé à 0
let jeuEnCours = true; // État du jeu
let niveau = 1; // Niveau du jeu initialisé à 1
let VitesseChute = 700; // Temps en millisecondes entre chaque chute de pièce


// Définition des différentes pièces et de leurs couleurs et les stocker dans un tableau
const pieces = [ // Chaque pièce représente un objet avec une clé et une valeur correspondante; pour représenter la forme et la couleur de chaque pièce
  { forme: [[1, 1, 1, 1]], couleur: "cyan" }, // Pièce I
  { forme: [[1, 1], [1, 1]], couleur: "#FFFF00" }, // Pièce O
  { forme: [[0, 1, 0], [1, 1, 1]], couleur: "#8A2BE2" }, // Pièce T
  { forme: [[1, 0, 0], [1, 1, 1]], couleur: "#FFA500" }, // // Pièce L
  { forme: [[0, 0, 1], [1, 1, 1]], couleur: "#0000FF" }, // // Pièce J
  { forme: [[1, 1, 0], [0, 1, 1]], couleur: "#FF0000" }, // Pièce S
  { forme: [[0, 1, 1], [1, 1, 0]], couleur: "#00FF00" } // Pièce Z

  // forme.length représente le nombre de colonnes occupées par la pièce
  // forme[0].length représente le nombre de lignes occupées par la pièce
];


// Initialisation de la grille de jeu
// Création d'une grille vide pour le jeu
function initialiserGrille() {
  grille = Array.from({ length: lignes }, () => Array(colonnes).fill(null)); // La grille est un tableau bidimensionnel avec length comme nbr de lignes et colonnes nbr de colonnes
}

// Dessiner la grille de jeu
function dessinerGrille() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Effacer tout ce qui a été précédemment dessiné sur le canvas, (0,0) sont les coordonnées du coin sup gauche

  for (let ligne = 0; ligne < lignes; ligne++) {
    for (let col = 0; col < colonnes; col++) { // Création d'une boucle imbriquée pour parcourir chaque case de la grille
      if (grille[ligne][col]) { // Vérifier si la cellule à cette position contient une valeur non nulle, la dessiner si la condition est vérifiée
        ctx.fillStyle = grille[ligne][col]; // Couleur de remplissage
        ctx.fillRect(col * tailleBloc, ligne * tailleBloc, tailleBloc, tailleBloc); // Dessiner un carré
        ctx.strokeRect(col * tailleBloc, ligne * tailleBloc, tailleBloc, tailleBloc); // Le contour du carré pour délimiter la cellule
      }
    }
  }
}

// Générer une nouvelle pièce aléatoire
function genererPiece() {
  const index = Math.floor(Math.random() * pieces.length); // Parmi les pieces préalablement crée, choisir une pièce aléatoire avec la fonction random()
  const { forme, couleur } = pieces[index]; // Création d'une const: couple forme couleur qui extrait les valeurs de la pièce choisie aléatoirement

  pieceActuelle = {
    forme: forme,
    couleur: couleur,
    x: Math.floor(colonnes / 2) - Math.floor(forme[0].length / 2), // centrer la pièce horizontalement
    y: 0 // Placer la pièce en haut de la grille
  };

  // Vérifier si la nouvelle pièce générée peut être placée et terminer le jeu si ce n'est pas le cas

  if (detecterCollision()){ // Vérifier si la pièce entre en collision dès son apparition
    terminerJeu(); // Fin de jeu si une pièce ne peut pas être placée
    return;
  }
}

// Dessiner la pièce actuelle
function dessinerPiece() {
  ctx.fillStyle = pieceActuelle.couleur;
  for (let ligne = 0; ligne < pieceActuelle.forme.length; ligne++) {
    for (let col = 0; col < pieceActuelle.forme[ligne].length; col++) { // Boucle imbriquée pour parcourir chaque cellule qui constitue la pièce
      if (pieceActuelle.forme[ligne][col]) { // Condition pour vérifier si le bloc est actif contient 1
        ctx.fillRect( // Dessiner un carré pour chaque case active
          (pieceActuelle.x + col) * tailleBloc,
          (pieceActuelle.y + ligne) * tailleBloc,
          tailleBloc,
          tailleBloc
        );
        ctx.strokeRect( // Dessiner le contour de ce carré
          (pieceActuelle.x + col) * tailleBloc,
          (pieceActuelle.y + ligne) * tailleBloc,
          tailleBloc,
          tailleBloc
        );
      }
    }
  }
}

// Déplacer la pièce vers le bas
function deplacerPieceBas() {
  pieceActuelle.y++; // Avancer la pièce d'une ligne
  if (detecterCollision()) { // Vérifier si la pièce touche une autre pièce ou le bas de la grille
    pieceActuelle.y--; // Reculer la pièce si la condition est vérifiée
    poserPiece(); // Pose définitive de la pièce
    genererPiece(); // Génération d'une nouvelle pièce pour continuer le jeu
  }
}

// Tourner la pièce actuelle
function tournerPiece() {
  const formeTournee = pieceActuelle.forme[0].map((_, index) =>
    pieceActuelle.forme.map(row => row[index]) // Transposer la matrice: Les lignes deviennent colonnes
  ).reverse(); // Inverser les éléments du tableau pour assurer une rotation de 90°

  // Mettre à jour la forme de la pièce avec la forme tournée
  const ancienneForme = pieceActuelle.forme; // Sauvegarde de la forme actuelle en cas de collision
  pieceActuelle.forme = formeTournee; // Application de la nouvelle forme

  // Vérifier si la pièce après rotation entre en collision
  if (detecterCollision()) {
    // Si collision, remettre la forme originale
    pieceActuelle.forme = ancienneForme; // Attribuer l'ancienne forme à la forme actuelle
  }
}


// Poser la pièce sur la grille
function poserPiece() {
  for (let ligne = 0; ligne < pieceActuelle.forme.length; ligne++) { // Parcourt les lignes de la pièce
    for (let col = 0; col < pieceActuelle.forme[ligne].length; col++) { // Parcourt les colonnes de la pièce
      if (pieceActuelle.forme[ligne][col]) {  // Vérifie si la cellule de la pièce est active (contient la valeur 1)
        const x = pieceActuelle.x + col; // Calcule la position en x de la cellule sur la grille
        const y = pieceActuelle.y + ligne; // Calcule la position en y de la cellule sur la grille

        if (y < 0) { // Vérifie si la pièce dépasse la grille (du côté sup)
          terminerJeu(); // Game Over
          return;
        }

        grille[y][x] = pieceActuelle.couleur; // Place la pièce sur la grille avec sa couleur
      }
    }
  }
  supprimerLignes();
}

// Supprimer les lignes et mettre à jour le score
function supprimerLignes() {
  grille = grille.filter(ligne => ligne.some(cellule => cellule === null)); // Filtrer les lignes non pleines
  const lignesEffacees = lignes - grille.length; // Calculer le nbr de lignes supprimées

  for (let i = 0; i < lignesEffacees; i++) {
    grille.unshift(Array(colonnes).fill(null)); // Pour chaque ligne supprimée, ajouter une ligne vide en haut
  }

// Ajouter le score
score += lignesEffacees * 200; // Mettre à jour le score, pour chaque ligne supprimée le score s'incrémente de 200
mettreAJourScore(); // Rafraîchir l'affichage du score

// Vérifier si le score a atteint un multiple de 1000 pour passer au niveau suivant
if (score >= niveau * 1000) {
  niveau++;
  vitesseChute = Math.max(200, vitesseChute - 100); // Réduire le temps (accélérer le jeu)
  alert("Niveau " + niveau); // Affichage d'une alerte pour informer l'utilisateur du passage au niveau suivant
}

}
// Mettre à jour l'affichage du score et du niveau
function mettreAJourScore() {
  document.getElementById("valeur-score").textContent = score;
  document.getElementById("valeur-niveau").textContent = niveau;
}

// Vérifier les collisions
function detecterCollision() {
  for (let ligne = 0; ligne < pieceActuelle.forme.length; ligne++) { // Parcourt les lignes de la pièce
    for (let col = 0; col < pieceActuelle.forme[ligne].length; col++) { // Parcourt les colonnes de la pièce
      if (pieceActuelle.forme[ligne][col]) { // Vérifie si la cellule de la pièce est active (contient la valeur 1)
        const x = pieceActuelle.x + col; // Calcule la position horizontale de la cellule sur la grille 
        const y = pieceActuelle.y + ligne; // Calcule la position verticale de la cellule sur la grille

        if (x < 0 || x >= colonnes || y >= lignes || (grille[y] && grille[y][x])) {        
        // Vérifie si la pièce sort de la grille à gauche (x < 0) ou à droite (x >= colonnes)
        // Vérifie si la pièce dépasse le bas de la grille (y >= lignes)
        // Vérifie si la cellule cible est déjà occupée dans la grille
          return true; // Collision détectée 
        }
      }
    }
  }
  return false; // Aucune collision détectée
}

// Gestion des entrées clavier
document.addEventListener("keydown", (event) => {

  if (!jeuEnCours) return; // Cela empeche de bouger les pieces apres un game Over


  switch (event.key) { // Dependemment de quelle touche pressee: Programmation Evenementielle

    case "ArrowLeft":
      pieceActuelle.x--; // Mvmt de la pièce vers la gauche d'un pas
      if (detecterCollision()) pieceActuelle.x++; // En cas de collision, on annule le mouvement vers la gauche d'un pas
      break;

    case "ArrowRight":
      pieceActuelle.x++; // Mvmt de la pièce vers la droite d'un pas
      if (detecterCollision()) pieceActuelle.x--; // En cas de collision, on annule le mouvement vers la droite d'un pas
      break;

    case "ArrowDown":
      deplacerPieceBas(); // On a deja defini une fonction pour la gestion du déplacement vers le bas qui fait appel a poser piece et generer une nouvelle piece
      break;

    case "ArrowUp":
      tournerPiece(); // On a defini une fonction qui gere la rotation des pieces avec map et reverse
      
      break;


  }}
);

// Terminer le jeu
function terminerJeu() {
  jeuEnCours = false; // Arrête le jeu en mettant l'état à false

  //alert("Game Over!"); // Ancienne alerte désactivée suite à l'ajout de la fct GameOver() qui se charge de faire cette alerte
  afficherGameOver(); // Appel de la fonction GameOver()
}

// Afficher "Game Over" sur le canevas
function afficherGameOver() {
  ctx.fillStyle = 'black'; // Définit la couleur de fond en noir
  ctx.globalAlpha = 0.7; // Rend le fond légèrement transparent
  ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100); // Dessine un rectangle au centre

  ctx.globalAlpha = 1;  // Rétablit l'opacité normale
  ctx.fillStyle = 'white'; // Définit la couleur du texte en blanc 
  ctx.font = '30px Arial'; // Définit la police du texte
  ctx.textAlign = 'center'; // Centre le texte horizontalement
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2); // Affiche le texte au centre du canevas

  alert("Game Over!"); // Alerte Game Over!

}

// Démarrer le jeu
function demarrerJeu() {
  jeuEnCours = true; // Activer le jeu
  score = 0; // Réinitialise le score
  niveau = 1;  // Réinitialiser le niveau
 vitesseChute= VitesseChute;  // Réinitialiser la vitesse
  mettreAJourScore(); // Met à jour l'affichage du score
  initialiserGrille(); // Réinitialise la grille de jeu
  genererPiece(); // Génère une nouvelle pièce
  boucleDeJeu(); // Démarre la boucle du jeu
}

// Boucle du jeu
function boucleDeJeu() {
  if (!jeuEnCours) return; // Arrête la boucle si le jeu est terminé

  dessinerGrille(); // Redessine la grille
  dessinerPiece(); // Dessine la pièce actuelle
  deplacerPieceBas(); // Déplace la pièce vers le bas

  setTimeout(boucleDeJeu, vitesseChute); // Répète la boucle après un délai défini par vitesseChute
}

demarrerJeu(); // Lance le jeu automatiquement au chargement du script
