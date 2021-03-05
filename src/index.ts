import './style.css';
import * as p5 from 'p5';
import * as piece from './piece';
import { PieceKind } from './piece';


const SQUARE_SIZE = 50;
type Move = undefined | { startX: number, startY: number, piece: piece.Piece };


if (!Array.prototype.indexOf)
  Array.prototype.indexOf = (function(Object, max, min) {
    "use strict"
    return function indexOf(member: any, fromIndex: any) {
      if (this === null || this === undefined)
        throw TypeError("Array.prototype.indexOf called on null or undefined")

      var that = Object(this), Len = that.length >>> 0, i = min(fromIndex | 0, Len)
      if (i < 0) i = max(0, Len + i)
      else if (i >= Len) return -1

      if (member === void 0) {        // undefined
        for (; i !== Len; ++i) if (that[i] === void 0 && i in that) return i
      } else if (member !== member) { // NaN
        return -1 // Since NaN !== NaN, it will never be found. Fast-path it.
      } else                          // all else
        for (; i !== Len; ++i) if (that[i] === member) return i

      return -1 // if the value was not found, then return -1
    }
  })(Object, Math.max, Math.min)

const sketch = (p: p5): void => {
	//   const scene = new Scene();
	let board: piece.Board;

	// p.preload = (): void => { };

	p.setup = (): void => {
		let cnv = p.createCanvas(SQUARE_SIZE * 8 + 10, SQUARE_SIZE * 8 + 10);
		cnv.mousePressed(onPress);
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
		drawBoard(p, board, currentlyMoving);
		if (currentlyMoving !== undefined) {
			p.push()
			p.tint(255, 128)
			let img = loadPieceImg(p, currentlyMoving.piece);
			// console.log('Loading', currentlyMoving.piece, img)
			if (img !== undefined) {
				p.image(img, p.mouseX - SQUARE_SIZE / 2, p.mouseY - SQUARE_SIZE / 2, SQUARE_SIZE, SQUARE_SIZE)
			}
			p.pop()
		}
		// scene.draw(p);
	};

	let currentlyMoving: Move = undefined;

	function onPress() {
		let x = p.floor(p.mouseX / SQUARE_SIZE)
		let y = p.floor(p.mouseY / SQUARE_SIZE)
		if (currentlyMoving !== undefined) {
			if (board[y][x] === null) {
				board[y][x] = board[currentlyMoving.startY][currentlyMoving.startX]
				board[currentlyMoving.startY][currentlyMoving.startX] = null
				currentlyMoving = undefined
			}
		} else {
			currentlyMoving = {
				startX: x,
				startY: y,
				piece: board[y][x]
			}
		}

	}
};

new p5(sketch);

interface PieceImages {
	[name: string]: p5.Image | 'loading'
}

let pieceImages: PieceImages = {};

function loadPieceImg(p: p5, pi: piece.Piece, suffix = '', f = (_: p5.Image) => { }): p5.Image | undefined {
	let path = piece.getImagePath(pi);
	if (pieceImages[path + suffix] === undefined) {
		pieceImages[path + suffix] = 'loading'
		p.loadImage(path, (i) => {
			f(i)
			pieceImages[path + suffix] = i
		})
	}
	let data = pieceImages[path + suffix]
	if (data instanceof p5.Image) {
		return data
	}

}

function drawBoard(p: p5, b: piece.Board, m : Move) {
	let dark_start = false;
	let pos: string[] = [];
	if (m !== undefined) {
		pos = getAllowedPlacements(b, m.startX, m.startY)
	}
	for (let i = 0; i < 8; i++) {
		let dark = dark_start;
		dark_start = !dark_start;
		for (let j = 0; j < 8; j++) {
			if (pos.indexOf(i + ':' + j) > -1) {
				p.fill(36, 124, 22)
			}else{
				if (dark) {
					p.fill(209, 139, 71)
				} else {
					p.fill(255, 206, 158)
				}

			}
			dark = !dark
			p.rect(i * SQUARE_SIZE + 5, j * SQUARE_SIZE + 5, SQUARE_SIZE, SQUARE_SIZE);
			if (b[j][i] !== null) {
				let img = loadPieceImg(p, b[j][i]);
				if (img !== undefined) {
					p.image(img, i * SQUARE_SIZE + 5, j * SQUARE_SIZE + 5, SQUARE_SIZE, SQUARE_SIZE)
				}

			}
		}
	}
}

function getAllowedPlacements(b: piece.Board, x: number, y: number): string[] {
	let res: string[] = []
	let p = b[y][x]
	switch (p.kind) {
		case PieceKind.King:
			pushIfPosAvailable(b, p.color, x - 1, y, res)
			pushIfPosAvailable(b, p.color, x + 1, y, res)
			pushIfPosAvailable(b, p.color, x, y - 1, res)
			pushIfPosAvailable(b, p.color, x, y + 1, res)
			pushIfPosAvailable(b, p.color, x - 1, y + 1, res)
			pushIfPosAvailable(b, p.color, x + 1, y + 1, res)
			pushIfPosAvailable(b, p.color, x - 1, y - 1, res)
			pushIfPosAvailable(b, p.color, x + 1, y - 1, res)
			break;

		case PieceKind.Queen:

			break;

		case PieceKind.Knight:

			break;

		case PieceKind.Rook:

			break;

		case PieceKind.Bishop:

			break;

		case PieceKind.Pawn:

			break;
	}
	return res;

}

function pushIfPosAvailable(b: piece.Board, myColor: piece.PieceColor, x: number, y: number, l: string[]) {
	if (x >= 8 || x < 0 || y >= 8 || y < 0) {
		return // Disable invalid positions
	}
	// console.log(x, y)
	if (b[y][x] === null) { // Is position empty
		l.push(x + ':' + y)
	} else {
		if (b[y][x].color != myColor) {
			l.push(x + ':' + y)
		}
	}
}