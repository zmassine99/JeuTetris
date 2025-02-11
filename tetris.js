// Sélection du canevas et du contexte de dessin
const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

// Définition des constantes de la grille
const tailleBloc = 30;
const lignes = 22;
const colonnes = 10;

let grille;
let pieceActuelle;
let score = 0;
let jeuEnCours = true;
let niveau = 1;
let VitesseChute = 700;


// Définition des différentes pièces et de leurs couleurs
const pieces = [
  { forme: [[1, 1, 1, 1]], couleur: "cyan" }, // I
  { forme: [[1, 1], [1, 1]], couleur: "#FFFF00" }, // O
  { forme: [[0, 1, 0], [1, 1, 1]], couleur: "#8A2BE2" }, // T
  { forme: [[1, 0, 0], [1, 1, 1]], couleur: "#FFA500" }, // L
  { forme: [[0, 0, 1], [1, 1, 1]], couleur: "#0000FF" }, // J
  { forme: [[1, 1, 0], [0, 1, 1]], couleur: "#FF0000" }, // S
  { forme: [[0, 1, 1], [1, 1, 0]], couleur: "#00FF00" } // Z
];


// Initialisation de la grille de jeu
function initialiserGrille() {
  grille = Array.from({ length: lignes }, () => Array(colonnes).fill(null));
}

// Dessiner la grille de jeu
function dessinerGrille() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let ligne = 0; ligne < lignes; ligne++) {
    for (let col = 0; col < colonnes; col++) {
      if (grille[ligne][col]) {
        ctx.fillStyle = grille[ligne][col];
        ctx.fillRect(col * tailleBloc, ligne * tailleBloc, tailleBloc, tailleBloc);
        ctx.strokeRect(col * tailleBloc, ligne * tailleBloc, tailleBloc, tailleBloc);
      }
    }
  }
}

// Générer une nouvelle pièce aléatoire
function genererPiece() {
  const index = Math.floor(Math.random() * pieces.length);
  const { forme, couleur } = pieces[index];

  pieceActuelle = {
    forme: forme,
    couleur: couleur,
    x: Math.floor(colonnes / 2) - Math.floor(forme[0].length / 2),
    y: 0
  };
}

// Dessiner la pièce actuelle
function dessinerPiece() {
  ctx.fillStyle = pieceActuelle.couleur;
  for (let ligne = 0; ligne < pieceActuelle.forme.length; ligne++) {
    for (let col = 0; col < pieceActuelle.forme[ligne].length; col++) {
      if (pieceActuelle.forme[ligne][col]) {
        ctx.fillRect(
          (pieceActuelle.x + col) * tailleBloc,
          (pieceActuelle.y + ligne) * tailleBloc,
          tailleBloc,
          tailleBloc
        );
        ctx.strokeRect(
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
  pieceActuelle.y++;
  if (detecterCollision()) {
    pieceActuelle.y--;
    poserPiece();
    genererPiece();
  }
}

// Tourner la pièce actuelle
function tournerPiece() {
  const formeTournee = pieceActuelle.forme[0].map((_, index) =>
    pieceActuelle.forme.map(row => row[index])
  ).reverse();

  // Mettre à jour la forme de la pièce avec la forme tournée
  const ancienneForme = pieceActuelle.forme;
  pieceActuelle.forme = formeTournee;

  // Vérifier si la pièce après rotation entre en collision
  if (detecterCollision()) {
    // Si collision, remettre la forme originale
    pieceActuelle.forme = ancienneForme;
  }
}


// Poser la pièce sur la grille
function poserPiece() {
  for (let ligne = 0; ligne < pieceActuelle.forme.length; ligne++) {
    for (let col = 0; col < pieceActuelle.forme[ligne].length; col++) {
      if (pieceActuelle.forme[ligne][col]) {
        const x = pieceActuelle.x + col;
        const y = pieceActuelle.y + ligne;

        if (y < 0) {
          terminerJeu();
          return;
        }

        grille[y][x] = pieceActuelle.couleur;
      }
    }
  }
  supprimerLignes();
}

// Supprimer les lignes et mettre à jour le score
function supprimerLignes() {
  grille = grille.filter(ligne => ligne.some(cellule => cellule === null));
  const lignesEffacees = lignes - grille.length;

  for (let i = 0; i < lignesEffacees; i++) {
    grille.unshift(Array(colonnes).fill(null));
  }

// Ajouter le score
score += lignesEffacees * 200;
mettreAJourScore();

// Vérifier si le score a atteint un multiple de 1000 pour passer au niveau suivant
if (score >= niveau * 1000) {
  niveau++;
  vitesseChute = Math.max(200, vitesseChute - 100); // Réduire le temps (accélérer le jeu)
  alert("Niveau " + niveau);
}

}
// Mettre à jour l'affichage du score et du niveau
function mettreAJourScore() {
  document.getElementById("valeur-score").textContent = score;
  document.getElementById("valeur-niveau").textContent = niveau;
}

// Vérifier les collisions
function detecterCollision() {
  for (let ligne = 0; ligne < pieceActuelle.forme.length; ligne++) {
    for (let col = 0; col < pieceActuelle.forme[ligne].length; col++) {
      if (pieceActuelle.forme[ligne][col]) {
        const x = pieceActuelle.x + col;
        const y = pieceActuelle.y + ligne;

        if (x < 0 || x >= colonnes || y >= lignes || (grille[y] && grille[y][x])) {
          return true;
        }
      }
    }
  }
  return false;
}

// Gestion des entrées clavier
document.addEventListener("keydown", (event) => {
  if (!jeuEnCours) return;

  switch (event.key) {
    case "ArrowLeft":
      pieceActuelle.x--;
      if (detecterCollision()) pieceActuelle.x++;
      break;

    case "ArrowRight":
      pieceActuelle.x++;
      if (detecterCollision()) pieceActuelle.x--;
      break;

    case "ArrowDown":
      deplacerPieceBas();
      break;

    case "ArrowUp":
      tournerPiece();
      break;
  }
});

// Terminer le jeu
function terminerJeu() {
  jeuEnCours = false;
  alert("Game Over!");
}

// Démarrer le jeu
function demarrerJeu() {
  jeuEnCours = true;
  score = 0;
  niveau = 1;  // Réinitialiser le niveau
  vitesseChute = VitesseChute;  // Réinitialiser la vitesse
  mettreAJourScore();
  initialiserGrille();
  genererPiece();
  boucleDeJeu();
}

// Boucle du jeu
function boucleDeJeu() {
  if (!jeuEnCours) return;

  dessinerGrille();
  dessinerPiece();
  deplacerPieceBas();

  setTimeout(boucleDeJeu, vitesseChute);
}

demarrerJeu();
