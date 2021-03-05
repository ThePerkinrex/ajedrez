import './style.css';
import * as p5 from 'p5';
import * as piece from './piece';


const SQUARE_SIZE = 50;

const sketch = (p: p5): void => {
	//   const scene = new Scene();
	let board: piece.Board;

	// p.preload = (): void => { };

	p.setup = (): void => {
		p.createCanvas(SQUARE_SIZE * 8+10, SQUARE_SIZE * 8+10);
		p.noStroke();
		board = piece.buildBoard(piece.PieceColor.Dark)
		// p.background(0);
		// p.loadImage('/pieces/Chess_bdt45.png', (i)=>{console.log('LOaded image');p.image(i, 0, 0, SQUARE_SIZE, SQUARE_SIZE)})
		
	};
	// p.windowResized = (): void => {
	// 	p.resizeCanvas(p.windowWidth, p.windowHeight);
	// };

	p.draw = (): void => {
		p.background(0);
		drawBoard(p, board);
		// scene.draw(p);
	};
};

new p5(sketch);

interface PieceImages {
	[name: string]: p5.Image | 'loading'
}

let pieceImages: PieceImages = {};

function loadPieceImg(p: p5, pi: piece.Piece): p5.Image | undefined {
	let path = piece.getImagePath(pi);
	if (pieceImages[path] === undefined) {
		pieceImages[path] = 'loading'
		p.loadImage(path, (i)=>{pieceImages[path] = i})
	}
	let data = pieceImages[path]
	if (data instanceof p5.Image) {
		return data
	}
	
}

function drawBoard(p: p5, b: piece.Board) {
	let dark_start = false;
	for (let i = 0; i < 8; i++) {
		let dark = dark_start;
		dark_start = !dark_start;
		for (let j = 0; j < 8; j++) {
			if (dark) {
				p.fill(209, 139, 71)
			}else{
				p.fill(255, 206, 158)
			}
			dark = !dark
			p.rect(i*SQUARE_SIZE+5, j*SQUARE_SIZE+5, SQUARE_SIZE, SQUARE_SIZE);
			if (b[j][i] !== null) {
				let img = loadPieceImg(p, b[j][i]);
				if (img !== undefined) {
					p.image(img, i*SQUARE_SIZE+5, j*SQUARE_SIZE+5, SQUARE_SIZE, SQUARE_SIZE)

				}

			}
		}
	}
}