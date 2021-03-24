
import * as p5 from 'p5';
import { PieceKind, Piece, PieceColor, getImagePath } from './piece';
import { onMove, move, replay as replayGame, onReplay } from './firebase';
import { Position, Board, toLocalFromGlobal, fromLocalToGlobal, containsPosition } from './moves';

const SQUARE_SIZE = 50;
const PADDING = 180;
const SIDE_PADDING = 120;
const WIDTH = SQUARE_SIZE * 8 + 10 + SIDE_PADDING * 2;
const REDUCING_N = 10;
const REDUCING_FACTOR = SQUARE_SIZE - (WIDTH - SIDE_PADDING * 2) / REDUCING_N;
type Move = undefined | { start: Position, piece: Piece, placeable: Position[] };
let other_player = ''
let current_player = ''
let lowColor: PieceColor;
let currentLow: boolean;
let lastStart: boolean;
let lastCheckmate: PieceColor | null = null;
let checkmate: PieceColor | null = null;

// let check: {
// 	pos: Position,
// 	low: boolean,
// } | undefined


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

// function copy<T extends any>(aObject: T): T {
// 	if (!aObject) {
// 		return aObject;
// 	}

// 	let v;
// 	let bObject: any = Array.isArray(aObject) ? [] : {};
// 	for (const k in aObject) {
// 		v = aObject[k];
// 		bObject[k] = (typeof v === "object") ? copy(v) : v;
// 	}

// 	return bObject;
// }

const sketch = (p: p5): void => {
	//   const scene = new Scene();
	let board: Board;
	let eatenPieces: {
		top: Piece[],
		bottom: Piece[]
	} = { top: [], bottom: [] }


	// p.preload = (): void => { };

	p.setup = (): void => {
		let cnv = p.createCanvas(WIDTH, SQUARE_SIZE * 8 + 10 + PADDING * 2);
		cnv.mousePressed(onPress);
		p.noStroke();
		board = Board.default(lowColor)
		p.textSize(20);
		// p.background(0);
		// p.loadImage('/pieces/Chess_bdt45.png', (i)=>{console.log('LOaded image');p.image(i, 0, 0, SQUARE_SIZE, SQUARE_SIZE)})
	};

	onMove(document.getElementById('current-game').innerText, (m) => {
		movePiece(m.from, m.to)
	})

	onReplay(document.getElementById('current-game').innerText, () => {
		document.getElementById('replay').classList.add('hidden')
		board = Board.default(lowColor)
		checkmate = null
		lastCheckmate = null
		currentlyMoving = undefined
		currentLow = !lastStart
		lastStart = currentLow // Make the one who didn't start last time start
		eatenPieces = { top: [], bottom: [] }
	})
	// p.windowResized = (): void => {
	// 	p.resizeCanvas(p.windowWidth, p.windowHeight);
	// };

	p.draw = (): void => {
		p.background(36, 124, 22);
		p.push();
		let top_text = other_player;
		if (board.isKingInCheck(board.topKing, board.get(board.topKing))) {
			if (board.isCheckmate(lowColor === PieceColor.Light ? PieceColor.Dark : PieceColor.Light)) {
				checkmate = lowColor === PieceColor.Light ? PieceColor.Dark : PieceColor.Light
			}
			top_text += ' (In check)'
		}
		p.fill(255);
		if (!currentLow) {
			p.strokeWeight(5)
			p.stroke(0)
		}
		p.textStyle(currentLow ? p.NORMAL : p.BOLD)
		p.text(top_text, (p.width - p.textWidth(top_text)) / 2, 5 + p.textAscent());
		p.pop();
		p.push();
		let bottom_text = current_player;
		if (board.isKingInCheck(board.lowKing, board.get(board.lowKing))) {
			if (board.isCheckmate(lowColor)) {
				checkmate = lowColor
			}
			bottom_text += ' (In check)'
		}
		p.fill(255);
		if (currentLow) {
			p.strokeWeight(5)
			p.stroke(0)
		}
		p.textStyle(currentLow ? p.BOLD : p.NORMAL)
		p.text(bottom_text, (p.width - p.textWidth(bottom_text)) / 2, p.height - 5);
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
		if (checkmate !== null) {
			if (checkmate === PieceColor.Light) {
				p.push();
				p.fill(255);
				p.strokeWeight(5)
				p.stroke(0)
				p.textStyle(p.BOLD)
				p.text("Black wins!", (p.width - p.textWidth("Black wins")) / 2, p.height/2);
				p.pop();
			} else {
				p.push();
				p.fill(255);
				p.strokeWeight(5)
				p.stroke(0)
				p.textStyle(p.BOLD)
				p.text("White wins!", (p.width - p.textWidth("White wins")) / 2, p.height/2);
				p.pop();
			}
			if (lastCheckmate === null) {
				let replay = document.getElementById('replay')
				replay.onclick = () => {
					replayGame(document.getElementById('current-game').innerText)
				}
				replay.classList.remove('hidden')
				
			}
		}
		lastCheckmate = checkmate
		// scene.draw(p);
	};

	let currentlyMoving: Move = undefined;

	function movePiece(from: string, to: string) {
		// let was_in_check = check !== undefined
		movePieceGeneric(toLocalFromGlobal(from, lowColor), toLocalFromGlobal(to, lowColor), board, eatenPieces)
		// if (was_in_check) {
		// 	check = undefined // The only moves allowed are the ones that stop the check
		// }
	}

	function onPress() {
		if (checkmate === null) {
			let x = p.floor((p.mouseX - SIDE_PADDING - 5) / SQUARE_SIZE)
			let y = p.floor((p.mouseY - PADDING - 5) / SQUARE_SIZE)
			// console.log(x, y)
			if (x >= 8 || y >= 8 || x < 0 || y < 0) {
				return
			}
			if (currentlyMoving !== undefined) {
				if (containsPosition(currentlyMoving.placeable, { x, y })) {
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
						from: fromLocalToGlobal(currentlyMoving.start, lowColor),
						to: fromLocalToGlobal({ x, y }, lowColor),
						color: lowColor
					})
					currentlyMoving = undefined
				}

			} else if (currentLow && board.get({ x, y }) !== null && board.get({ x, y }).color === lowColor) {
				// if (check !== undefined && check.low == currentLow) {
				// 	if (board[y][x].kind !== PieceKind.King) {
				// 		return
				// 	}
				// }
				currentlyMoving = {
					start: { x, y },
					piece: board.get({ x, y }),
					placeable: board.possibleMoves({ x, y }, board.get({ x, y }))
				}
			}
		}

	}

	p.keyPressed = () => {
		if (p.keyCode === p.ESCAPE) {
			currentlyMoving = undefined
		}
	}
};

function movePieceGeneric(from: Position, to: Position, board: Board, eatenPieces: {
	top: Piece[],
	bottom: Piece[]
} = { top: [], bottom: [] }, set_check = true) {
	currentLow = !currentLow;
	let from_local = from
	let to_local = to
	if (board.get(to_local) !== null) {
		let top_eater = board.get(to_local).color === lowColor
		if (top_eater) {
			eatenPieces.top.push(board.get(to_local))
		} else {

			eatenPieces.bottom.push(board.get(to_local))
		}
	}
	let queenRow = (((board.get(from_local).color === lowColor) ? 0 : 7) === to_local.y) && board.get(from_local).kind === PieceKind.Pawn
	// console.log(queenRow)
	board.set(to_local, queenRow ? { ...board.get(from_local), kind: PieceKind.Queen } : board.get(from_local))
	board.set(from_local, null)
	board.get(to_local).firstMove = false
	board.move(from_local, to_local) // Notify the board of a piece moved (for kings)
}
export function start(o: string, c: string, low_color: PieceColor) {
	other_player = o
	current_player = c
	lowColor = low_color
	currentLow = low_color == PieceColor.Light
	lastStart = currentLow
	new p5(sketch);
}

interface PieceImages {
	[name: string]: p5.Image | 'loading'
}

let pieceImages: PieceImages = {};

function loadPieceImg(p: p5, pi: Piece, suffix = '', f = (_: p5.Image) => { }): p5.Image | undefined {
	let path = getImagePath(pi);
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

function drawBoard(p: p5, b: Board, m: Move) {
	let inverted = lowColor === PieceColor.Dark
	let first = true;
	let dark_start = false;
	let pos: Position[] = [];
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
			let position = { x: i, y: j }
			if (first) {
				p.fill(255)
				let n = (inverted ? 7 - j : j) + 1
				p.text(n, SIDE_PADDING - 5 - p.textWidth(n.toString()), j * SQUARE_SIZE + 5 + PADDING + (SQUARE_SIZE + p.textAscent()) / 2)

			}
			if (containsPosition(pos, position)) {
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
			if (b.get(position) !== null) {
				let img = loadPieceImg(p, b.get(position));
				if (img !== undefined) {
					p.image(img, i * SQUARE_SIZE + 5 + SIDE_PADDING, j * SQUARE_SIZE + 5 + PADDING, SQUARE_SIZE, SQUARE_SIZE)
				}

			}
		}
		first = false
	}
}