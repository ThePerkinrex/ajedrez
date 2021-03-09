
import * as p5 from 'p5';
import * as piece from './piece';
import { PieceKind } from './piece';
import { onMove, move } from './firebase';

const SQUARE_SIZE = 50;
const PADDING = 180;
const SIDE_PADDING = 120;
const WIDTH = SQUARE_SIZE * 8 + 10 + SIDE_PADDING * 2;
const REDUCING_N = 10;
const REDUCING_FACTOR = SQUARE_SIZE - (WIDTH - SIDE_PADDING * 2) / REDUCING_N;
type Move = undefined | { startX: number, startY: number, piece: piece.Piece, placeable: string[] };
let other_player = ''
let current_player = ''
let lowColor: piece.PieceColor;
let currentLow: boolean;


if (!Array.prototype.indexOf)
	Array.prototype.indexOf = (function (Object, max, min) {
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
	let eatenPieces: {
		top: piece.Piece[],
		bottom: piece.Piece[]
	} = { top: [], bottom: [] }

	// p.preload = (): void => { };

	p.setup = (): void => {
		let cnv = p.createCanvas(WIDTH, SQUARE_SIZE * 8 + 10 + PADDING * 2);
		cnv.mousePressed(onPress);
		p.noStroke();
		board = piece.buildBoard(lowColor);
		p.textSize(20);
		// p.background(0);
		// p.loadImage('/pieces/Chess_bdt45.png', (i)=>{console.log('LOaded image');p.image(i, 0, 0, SQUARE_SIZE, SQUARE_SIZE)})
	};

	onMove(document.getElementById('current-game').innerText, (m) => {
		movePiece(m.from, m.to)
	})
	// p.windowResized = (): void => {
	// 	p.resizeCanvas(p.windowWidth, p.windowHeight);
	// };

	p.draw = (): void => {
		p.background(36, 124, 22);
		p.push();
		p.fill(255);
		p.textStyle(currentLow ? p.NORMAL : p.BOLD)
		p.text(other_player, (p.width - p.textWidth(other_player)) / 2, 5 + p.textAscent());
		p.fill(255);
		p.textStyle(currentLow ? p.BOLD : p.NORMAL)
		p.text(current_player, (p.width - p.textWidth(current_player)) / 2, p.height - 5);
		p.pop();
		for (let i = 0; i < eatenPieces.top.length; i++) {
			let img = loadPieceImg(p, eatenPieces.top[i]);
			// console.log('Loading', currentlyMoving.piece, img)
			if (img !== undefined) {
				let ratio = i / ((p.width - SIDE_PADDING * 2) / (SQUARE_SIZE - REDUCING_FACTOR))
				let line = p.floor(ratio)
				p.image(img, (p.width - SIDE_PADDING) - (i + 1) * (SQUARE_SIZE - REDUCING_FACTOR) + (line) * (p.width - SIDE_PADDING * 2), (PADDING) - (SQUARE_SIZE - REDUCING_FACTOR) * (line + 1) - 10 - p.textAscent(), SQUARE_SIZE - REDUCING_FACTOR, SQUARE_SIZE - REDUCING_FACTOR)
			}
		}
		for (let i = 0; i < eatenPieces.bottom.length; i++) {
			let img = loadPieceImg(p, eatenPieces.bottom[i]);
			// console.log('Loading', currentlyMoving.piece, img)

			if (img !== undefined) {
				let ratio = i / ((p.width - SIDE_PADDING * 2) / (SQUARE_SIZE - REDUCING_FACTOR))
				let line = p.floor(ratio)
				p.image(img, SIDE_PADDING + i * (SQUARE_SIZE - REDUCING_FACTOR) - (line) * (p.width - SIDE_PADDING * 2), (PADDING + 10 + SQUARE_SIZE * 8) + (SQUARE_SIZE - REDUCING_FACTOR) * (line), SQUARE_SIZE - REDUCING_FACTOR, SQUARE_SIZE - REDUCING_FACTOR)
			}
		}
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

	function movePiece(from: string, to: string) {
		currentLow = !currentLow;
		let from_local = toLocalFromGlobal(from, lowColor)
		let to_local = toLocalFromGlobal(to, lowColor)
		if (board[to_local.y][to_local.x] !== null) {
			let top_eater = board[to_local.y][to_local.x].color === lowColor
			if (top_eater) {
				eatenPieces.top.push(board[to_local.y][to_local.x])
			} else {

				eatenPieces.bottom.push(board[to_local.y][to_local.x])
			}
		}
		board[to_local.y][to_local.x] = board[from_local.y][from_local.x]
		board[from_local.y][from_local.x] = null
		board[to_local.y][to_local.x].firstMove = false
	}

	function onPress() {
		let x = p.floor((p.mouseX - SIDE_PADDING - 5) / SQUARE_SIZE)
		let y = p.floor((p.mouseY - PADDING - 5) / SQUARE_SIZE)
		console.log(x, y)
		if (x >= 8 || y >= 8 || x < 0 || y < 0) {
			return
		}
		if (currentlyMoving !== undefined) {
			if (currentlyMoving.placeable.indexOf(x + ':' + y) > -1) {
				// if (board[y][x] !== null) {
				// 	let top_eater = board[y][x].color === lowColor
				// 	if (top_eater) {
				// 		eatenPieces.top.push(board[y][x])
				// 	} else {

				// 		eatenPieces.bottom.push(board[y][x])
				// 	}
				// }
				// board[y][x] = board[currentlyMoving.startY][currentlyMoving.startX]
				// board[currentlyMoving.startY][currentlyMoving.startX] = null
				// board[y][x].firstMove = false
				move(document.getElementById('current-game').innerText, {
					from: fromLocalToGlobal(currentlyMoving.startX, currentlyMoving.startY, lowColor),
					to: fromLocalToGlobal(x, y, lowColor),
					color: lowColor
				})
				currentlyMoving = undefined
			}

		} else if (currentLow && board[y][x] !== null && board[y][x].color === lowColor) {
			currentlyMoving = {
				startX: x,
				startY: y,
				piece: board[y][x],
				placeable: getAllowedPlacements(board, x, y, lowColor)
			}
		}

	}

	p.keyPressed = () => {
		if (p.keyCode === p.ESCAPE) {
			currentlyMoving = undefined
		}
	}
};

export function start(o: string, c: string, low_color: piece.PieceColor) {
	other_player = o
	current_player = c
	lowColor = low_color
	currentLow = low_color == piece.PieceColor.Light
	new p5(sketch);
}

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

function drawBoard(p: p5, b: piece.Board, m: Move) {
	let inverted = lowColor === piece.PieceColor.Dark
	let first = true;
	let dark_start = false;
	let pos: string[] = [];
	if (m !== undefined) {
		pos = m.placeable
	}
	p.fill(0)
	p.rect(SIDE_PADDING, PADDING, 8 * SQUARE_SIZE + 10, 8 * SQUARE_SIZE + 10)
	for (let i = 0; i < 8; i++) {
		let dark = dark_start;
		dark_start = !dark_start;
		p.fill(255)
		p.text(String.fromCharCode(i + 97), i * SQUARE_SIZE + 5 + SIDE_PADDING + (SQUARE_SIZE - p.textWidth(String.fromCharCode(i + 97))) / 2, PADDING - 10)
		for (let j = 0; j < 8; j++) {
			if (first) {
				p.fill(255)
				let n = (inverted ? 7 - j : j) + 1
				p.text(n, SIDE_PADDING - 5 - p.textWidth(n.toString()), j * SQUARE_SIZE + 5 + PADDING + (SQUARE_SIZE + p.textAscent()) / 2)

			}
			if (pos.indexOf(i + ':' + j) > -1) {
				p.fill(36, 124, 22)
			} else {
				if (dark) {
					p.fill(209, 139, 71)
				} else {
					p.fill(255, 206, 158)
				}

			}
			dark = !dark
			p.rect(i * SQUARE_SIZE + 5 + SIDE_PADDING, j * SQUARE_SIZE + 5 + PADDING, SQUARE_SIZE, SQUARE_SIZE);
			if (b[j][i] !== null) {
				let img = loadPieceImg(p, b[j][i]);
				if (img !== undefined) {
					p.image(img, i * SQUARE_SIZE + 5 + SIDE_PADDING, j * SQUARE_SIZE + 5 + PADDING, SQUARE_SIZE, SQUARE_SIZE)
				}

			}
		}
		first = false
	}
}

function getAllowedPlacements(b: piece.Board, x: number, y: number, lowColor: piece.PieceColor): string[] {
	let res: string[] = []
	let p = b[y][x]
	switch (p.kind) {
		case PieceKind.King:
			pushIfPosAvailable(b, p, x - 1, y, res)
			pushIfPosAvailable(b, p, x + 1, y, res)
			pushIfPosAvailable(b, p, x, y - 1, res)
			pushIfPosAvailable(b, p, x, y + 1, res)
			pushIfPosAvailable(b, p, x - 1, y + 1, res)
			pushIfPosAvailable(b, p, x + 1, y + 1, res)
			pushIfPosAvailable(b, p, x - 1, y - 1, res)
			pushIfPosAvailable(b, p, x + 1, y - 1, res)
			break;

		case PieceKind.Queen:
			for (let s = x - 1; s >= 0; s--) {
				if (b[y][s] !== null) {
					if (b[y][s].color !== p.color) {
						pushIfPosAvailable(b, p, s, y, res)
					}
					break
				}
				pushIfPosAvailable(b, p, s, y, res)
			}
			for (let s = x + 1; s < 8; s++) {
				if (b[y][s] !== null) {
					if (b[y][s].color !== p.color) {
						pushIfPosAvailable(b, p, s, y, res)
					}
					break
				}
				pushIfPosAvailable(b, p, s, y, res)
			}
			for (let s = y - 1; s >= 0; s--) {
				if (b[s][x] !== null) {
					if (b[s][x].color !== p.color) {
						pushIfPosAvailable(b, p, x, s, res)
					}
					break
				}
				pushIfPosAvailable(b, p, x, s, res)
			}
			for (let s = y + 1; s < 8; s++) {
				if (b[s][x] !== null) {
					if (b[s][x].color !== p.color) {
						pushIfPosAvailable(b, p, x, s, res)
					}
					break
				}
				pushIfPosAvailable(b, p, x, s, res)
			}
			{
				let xdir = 1;
				let ydir = 1;
				for (let s = 1; x + s * xdir >= 0 && x + s * xdir < 8 && y + s * ydir >= 0 && y + s * ydir < 8; s++) {
					let newx = x + s * xdir;
					let newy = y + s * ydir;
					if (b[newy][newx] !== null) {
						if (b[newy][newx].color !== p.color) {
							pushIfPosAvailable(b, p, newx, newy, res)
						}
						break
					}
					pushIfPosAvailable(b, p, newx, newy, res)
				}
				xdir = -1;
				ydir = 1;
				for (let s = 1; x + s * xdir >= 0 && x + s * xdir < 8 && y + s * ydir >= 0 && y + s * ydir < 8; s++) {
					let newx = x + s * xdir;
					let newy = y + s * ydir;
					if (b[newy][newx] !== null) {
						if (b[newy][newx].color !== p.color) {
							pushIfPosAvailable(b, p, newx, newy, res)
						}
						break
					}
					pushIfPosAvailable(b, p, newx, newy, res)
				}
				xdir = -1;
				ydir = -1;
				for (let s = 1; x + s * xdir >= 0 && x + s * xdir < 8 && y + s * ydir >= 0 && y + s * ydir < 8; s++) {
					let newx = x + s * xdir;
					let newy = y + s * ydir;
					if (b[newy][newx] !== null) {
						if (b[newy][newx].color !== p.color) {
							pushIfPosAvailable(b, p, newx, newy, res)
						}
						break
					}
					pushIfPosAvailable(b, p, newx, newy, res)
				}
				xdir = 1;
				ydir = -1;
				for (let s = 1; x + s * xdir >= 0 && x + s * xdir < 8 && y + s * ydir >= 0 && y + s * ydir < 8; s++) {
					let newx = x + s * xdir;
					let newy = y + s * ydir;
					if (b[newy][newx] !== null) {
						if (b[newy][newx].color !== p.color) {
							pushIfPosAvailable(b, p, newx, newy, res)
						}
						break
					}
					pushIfPosAvailable(b, p, newx, newy, res)
				}
			}

			break;

		case PieceKind.Knight:
			pushIfPosAvailable(b, p, x - 1, y + 2, res)
			pushIfPosAvailable(b, p, x + 1, y + 2, res)
			pushIfPosAvailable(b, p, x - 1, y - 2, res)
			pushIfPosAvailable(b, p, x + 1, y - 2, res)
			pushIfPosAvailable(b, p, x - 2, y + 1, res)
			pushIfPosAvailable(b, p, x + 2, y + 1, res)
			pushIfPosAvailable(b, p, x - 2, y - 1, res)
			pushIfPosAvailable(b, p, x + 2, y - 1, res)
			break;

		case PieceKind.Rook:
			for (let s = x - 1; s >= 0; s--) {
				if (b[y][s] !== null) {
					if (b[y][s].color !== p.color) {
						pushIfPosAvailable(b, p, s, y, res)
					}
					break
				}
				pushIfPosAvailable(b, p, s, y, res)
			}
			for (let s = x + 1; s < 8; s++) {
				if (b[y][s] !== null) {
					if (b[y][s].color !== p.color) {
						pushIfPosAvailable(b, p, s, y, res)
					}
					break
				}
				pushIfPosAvailable(b, p, s, y, res)
			}
			for (let s = y - 1; s >= 0; s--) {
				if (b[s][x] !== null) {
					if (b[s][x].color !== p.color) {
						pushIfPosAvailable(b, p, x, s, res)
					}
					break
				}
				pushIfPosAvailable(b, p, x, s, res)
			}
			for (let s = y + 1; s < 8; s++) {
				if (b[s][x] !== null) {
					if (b[s][x].color !== p.color) {
						pushIfPosAvailable(b, p, x, s, res)
					}
					break
				}
				pushIfPosAvailable(b, p, x, s, res)
			}
			break;

		case PieceKind.Bishop:
			{
				let xdir = 1;
				let ydir = 1;
				for (let s = 1; x + s * xdir >= 0 && x + s * xdir < 8 && y + s * ydir >= 0 && y + s * ydir < 8; s++) {
					let newx = x + s * xdir;
					let newy = y + s * ydir;
					if (b[newy][newx] !== null) {
						if (b[newy][newx].color !== p.color) {
							pushIfPosAvailable(b, p, newx, newy, res)
						}
						break
					}
					pushIfPosAvailable(b, p, newx, newy, res)
				}
				xdir = -1;
				ydir = 1;
				for (let s = 1; x + s * xdir >= 0 && x + s * xdir < 8 && y + s * ydir >= 0 && y + s * ydir < 8; s++) {
					let newx = x + s * xdir;
					let newy = y + s * ydir;
					if (b[newy][newx] !== null) {
						if (b[newy][newx].color !== p.color) {
							pushIfPosAvailable(b, p, newx, newy, res)
						}
						break
					}
					pushIfPosAvailable(b, p, newx, newy, res)
				}
				xdir = -1;
				ydir = -1;
				for (let s = 1; x + s * xdir >= 0 && x + s * xdir < 8 && y + s * ydir >= 0 && y + s * ydir < 8; s++) {
					let newx = x + s * xdir;
					let newy = y + s * ydir;
					if (b[newy][newx] !== null) {
						if (b[newy][newx].color !== p.color) {
							pushIfPosAvailable(b, p, newx, newy, res)
						}
						break
					}
					pushIfPosAvailable(b, p, newx, newy, res)
				}
				xdir = 1;
				ydir = -1;
				for (let s = 1; x + s * xdir >= 0 && x + s * xdir < 8 && y + s * ydir >= 0 && y + s * ydir < 8; s++) {
					let newx = x + s * xdir;
					let newy = y + s * ydir;
					if (b[newy][newx] !== null) {
						if (b[newy][newx].color !== p.color) {
							pushIfPosAvailable(b, p, newx, newy, res)
						}
						break
					}
					pushIfPosAvailable(b, p, newx, newy, res)
				}
			}
			break;

		case PieceKind.Pawn:
			let dir = 1;
			if (lowColor == p.color) {
				dir = -1
			}
			pushIfPosAvailable(b, p, x, y + dir, res, false)
			if (p.firstMove && b[y + dir][x] === null) {
				pushIfPosAvailable(b, p, x, y + dir * 2, res, false)
			}
			if (b[y + dir][x + 1] !== null) {
				pushIfPosAvailable(b, p, x + 1, y + dir, res)
			}
			if (b[y + dir][x - 1] !== null) {
				pushIfPosAvailable(b, p, x - 1, y + dir, res)
			}
			break;
	}
	return res;

}

function pushIfPosAvailable(b: piece.Board, p: piece.Piece, x: number, y: number, l: string[], eatingAllowed = true) {
	if (x >= 8 || x < 0 || y >= 8 || y < 0) {
		return // Disable invalid positions
	}
	// TODO Check for checkmates
	// console.log(x, y)
	if (b[y][x] === null) { // Is position empty
		l.push(x + ':' + y)
	} else {
		if (b[y][x].color !== p.color && eatingAllowed) {
			l.push(x + ':' + y)
		}
	}
}

//   a-h
// 8 BLACK
// |
// 1 WHITE

function fromLocalToGlobal(x: number, y: number, lowColor: piece.PieceColor): string {
	let inverted = lowColor === piece.PieceColor.Dark
	let letter = String.fromCharCode(x + 97) // a in ASCII
	let number = (inverted ? 7 - y : y) + 1
	return letter + number
}

function toLocalFromGlobal(s: string, lowColor: piece.PieceColor): { x: number, y: number } {
	let inverted = lowColor === piece.PieceColor.Dark
	let x = s.charCodeAt(0) - 97 // a in ascii
	let y = inverted ? 7 - (parseInt(s[1]) -1) : parseInt(s[1])-1
	return { x, y }
}