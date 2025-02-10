// Sélection du canevas et du contexte de dessin
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');

// Définition des constantes de la grille
const tailleBloc = 30;
const lignes = 22;
const colonnes = 10;

let grille;
let pieceActuelle;
let score = 0;
let jeuEnCours = true;

// Définition des différentes pièces et de leurs couleurs
const pieces = [
  { forme: [[1, 1, 1, 1]], couleur: 'cyan' }, // I
  { forme: [[1, 1], [1, 1]], couleur: 'yellow' }, // O
  { forme: [[0, 1, 0], [1, 1, 1]], couleur: 'purple' }, // T
  { forme: [[1, 0, 0], [1, 1, 1]], couleur: 'orange' }, // L
  { forme: [[0, 0, 1], [1, 1, 1]], couleur: 'blue' }, // J
  { forme: [[1, 1, 0], [0, 1, 1]], couleur: 'green' }, // S
  { forme: [[0, 1, 1], [1, 1, 0]], couleur: 'red' } // Z
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

// Supprimer les lignes complètes
function supprimerLignes() {
  grille = grille.filter(ligne => ligne.some(cellule => cellule === null));
  const lignesEffacees = lignes - grille.length;

  for (let i = 0; i < lignesEffacees; i++) {
    grille.unshift(Array(colonnes).fill(null));
  }

  score += lignesEffacees * 100;
  mettreAJourScore();
}

// Mettre à jour l'affichage du score
function mettreAJourScore() {
  document.getElementById('valeur-score').textContent = score;
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
document.addEventListener('keydown', (event) => {
  if (!jeuEnCours) return;

  switch (event.key) {
    case 'ArrowLeft':
      pieceActuelle.x--;
      if (detecterCollision()) pieceActuelle.x++;
      break;

    case 'ArrowRight':
      pieceActuelle.x++;
      if (detecterCollision()) pieceActuelle.x--;
      break;

    case 'ArrowDown':
      deplacerPieceBas();
      break;

    case 'ArrowUp':
      tournerPiece();
      break;
  }
});

// Terminer le jeu
function terminerJeu() {
  jeuEnCours = false;
  alert('Game Over!');
}

// Démarrer le jeu
function demarrerJeu() {
  jeuEnCours = true;
  score = 0;
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

  setTimeout(boucleDeJeu, 500);
}

demarrerJeu();