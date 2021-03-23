import { Piece, PieceColor, PieceKind } from "./piece";

export interface Position {
	x: number
	y: number
}

export function fromLocalToGlobal(p: Position, lowColor: PieceColor): string {
	let inverted = lowColor === PieceColor.Dark
	let letter = String.fromCharCode(p.x + 97) // a in ASCII
	let number = (inverted ? 7 - p.y : p.y) + 1
	return letter + number
}

export function toLocalFromGlobal(s: string, lowColor: PieceColor): Position {
	let inverted = lowColor === PieceColor.Dark
	let x = s.charCodeAt(0) - 97 // a in ascii
	let y = inverted ? 7 - (parseInt(s[1]) - 1) : parseInt(s[1]) - 1
	return { x, y }
}

function positionEquals(p1: Position, p2: Position): boolean {
	return p1.x === p2.x && p1.y === p2.y
}

export function containsPosition(l: Position[], p: Position): boolean {
	for (let pos of l) {
		if (positionEquals(pos, p)) {
			return true
		}
	}
	return false
}

enum Direction1Dim {
	X, Y
}

enum Direction2Dim {
	Positive, Negative
}

export class Board {
	private pieces: (Piece | null)[][]
	public topKing: Position
	public lowKing: Position
	private lowColor: PieceColor

	private constructor() { }

	static default(lowColor: PieceColor): Board {
		let r = new Board();
		let topColor = PieceColor.Dark
		if (lowColor == PieceColor.Dark) {
			topColor = PieceColor.Light
		}
		r.pieces = [
			[buildPiece(PieceKind.Rook, topColor), buildPiece(PieceKind.Knight, topColor), buildPiece(PieceKind.Bishop, topColor), buildPiece(PieceKind.Queen, topColor), buildPiece(PieceKind.King, topColor), buildPiece(PieceKind.Bishop, topColor), buildPiece(PieceKind.Knight, topColor), buildPiece(PieceKind.Rook, topColor)],
			[buildPiece(PieceKind.Pawn, topColor), buildPiece(PieceKind.Pawn, topColor), buildPiece(PieceKind.Pawn, topColor), buildPiece(PieceKind.Pawn, topColor), buildPiece(PieceKind.Pawn, topColor), buildPiece(PieceKind.Pawn, topColor), buildPiece(PieceKind.Pawn, topColor), buildPiece(PieceKind.Pawn, topColor)],
			[null, null, null, null, null, null, null, null],
			[null, null, null, null, null, null, null, null],
			[null, null, null, null, null, null, null, null],
			[null, null, null, null, null, null, null, null],
			[buildPiece(PieceKind.Pawn, lowColor), buildPiece(PieceKind.Pawn, lowColor), buildPiece(PieceKind.Pawn, lowColor), buildPiece(PieceKind.Pawn, lowColor), buildPiece(PieceKind.Pawn, lowColor), buildPiece(PieceKind.Pawn, lowColor), buildPiece(PieceKind.Pawn, lowColor), buildPiece(PieceKind.Pawn, lowColor)],
			[buildPiece(PieceKind.Rook, lowColor), buildPiece(PieceKind.Knight, lowColor), buildPiece(PieceKind.Bishop, lowColor), buildPiece(PieceKind.Queen, lowColor), buildPiece(PieceKind.King, lowColor), buildPiece(PieceKind.Bishop, lowColor), buildPiece(PieceKind.Knight, lowColor), buildPiece(PieceKind.Rook, lowColor)],
		]
		r.topKing = { x: 4, y: 0 }
		r.lowKing = { x: 4, y: 7 }
		r.lowColor = lowColor
		return r
	}

	private static boardBuilder(pieces: (Piece | null)[][], topKing: Position, lowKing: Position, lowColor: PieceColor): Board {
		let r = new Board();
		r.pieces = pieces
		r.topKing = topKing
		r.lowKing = lowKing
		r.lowColor = lowColor
		return r
	}


	clone(): Board {
		return Board.boardBuilder(JSON.parse(JSON.stringify(this.pieces)), JSON.parse(JSON.stringify(this.topKing)), JSON.parse(JSON.stringify(this.lowKing)), this.lowColor)
	}

	move(from: Position, to: Position) {
		if (positionEquals(from, this.topKing)) {
			this.topKing = { ...to }
		}

		if (positionEquals(from, this.lowKing)) {
			this.lowKing = { ...to }
		}
	}

	get(p: Position): Piece | null {
		return this.pieces[p.y][p.x]
	}

	set(p: Position, new_piece: Piece | null): Piece | null {
		let r = this.get(p)
		this.pieces[p.y][p.x] = new_piece
		return r
	}

	swap(p1: Position, p2: Position) {
		let a = this.get(p1)
		this.set(p1, this.get(p2))
		this.set(p2, a)
	}

	private isPositionValid(oldpos: Position, pos: Position, p: Piece, canEat: boolean = true): boolean {
		let a = this.get(pos)
		if (a !== null) {
			if (!canEat) return false
			if (a.color === p.color) return false
		}
		
		return true
	}

	willKingBeInCheck(oldpos: Position, newpos: Position): boolean {
		let boardClone = this.clone()
		let p = boardClone.get(oldpos)
		boardClone.set(oldpos, null)
		boardClone.set(newpos, p)
		boardClone.move(oldpos, newpos)
		if (p.color === this.lowColor) {
			console.log(boardClone.lowKing, boardClone.get(boardClone.lowKing))
			if (boardClone.isKingInCheck(boardClone.lowKing, boardClone.get(boardClone.lowKing))) {
				return true
			}
		}else {
			console.log(boardClone.topKing, boardClone.get(boardClone.topKing))
			if (boardClone.isKingInCheck(boardClone.topKing, boardClone.get(boardClone.topKing))) {
				return true
			}
		}
		return false
	}

	private inBounds(pos: Position, relPos: Position, p: Piece, canEat: boolean = true): Position | null {
		let newX = pos.x + relPos.x;
		let newY = pos.y + relPos.y;
		if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
			let newPos = { x: newX, y: newY }
			if (this.isPositionValid(pos, newPos, p, canEat))
				return newPos
			else
				return null
		} else {
			return null
		}
	}

	private pushIfInBounds(pos: Position, relPos: Position, p: Piece, l: Position[], canEat: boolean = true) {
		let r = this.inBounds(pos, relPos, p, canEat)
		if (r !== null) {
			l.push(r)
		}
	}

	private slide1Dir(pos: Position, dir: Direction1Dim, sign: -1 | 1, piece: Piece, l: Position[], onPieceEnd = (pos: Position): void => { }) {
		let i: 'y' | 'x' = 'y'
		if (dir == Direction1Dim.X) {
			i = 'x'
		}
		for (let p = pos[i] + sign; p >= 0 && p < 8; p += sign) {
			let relPos = { x: 0, y: 0 }
			relPos[i] = p - pos[i]
			let newPos = addPositions(pos, relPos)
			if (this.isPositionValid(pos, newPos, piece)) {
				l.push(newPos)
			}
			if (this.get(newPos) !== null) {
				if (this.get(newPos).color !== piece.color) {
					onPieceEnd(newPos)
				}
				break
			}
		}
	}

	private slide2Dir(pos: Position, dir: Direction2Dim, sign: -1 | 1, piece: Piece, l: Position[], onPieceEnd = (pos: Position): void => { }) {
		let xdir: number = sign;
		let ydir = xdir;
		if (dir === Direction2Dim.Negative) {
			ydir = -ydir
		}
		for (let i = 1; i * xdir + pos.x >= 0 && i * xdir + pos.x < 8 && i * ydir + pos.y >= 0 && i * ydir + pos.y < 8; i++) {
			let newX = i * xdir + pos.x
			let newY = i * ydir + pos.y
			let newPos = { x: newX, y: newY }
			if (this.isPositionValid(pos, newPos, piece)) {
				l.push(newPos)
			}
			if (this.get(newPos) !== null) {
				if (this.get(newPos).color !== piece.color) {
					onPieceEnd(newPos)
				}
				break
			}
		}
	}

	possibleMoves(pos: Position, piece: Piece, lowColor: PieceColor): Position[] {
		let r: Position[] = []
		let t = this
		function pushIfInBounds(relPos: Position, l: Position[], canEat: boolean = true) {
			t.pushIfInBounds(pos, relPos, piece, l, canEat)
		}

		switch (piece.kind) {
			case PieceKind.King:
				pushIfInBounds({ x: -1, y: 0 }, r)
				pushIfInBounds({ x: +1, y: 0 }, r)
				pushIfInBounds({ x: 0, y: -1 }, r)
				pushIfInBounds({ x: 0, y: +1 }, r)
				pushIfInBounds({ x: -1, y: +1 }, r)
				pushIfInBounds({ x: +1, y: +1 }, r)
				pushIfInBounds({ x: -1, y: -1 }, r)
				pushIfInBounds({ x: +1, y: -1 }, r)
				break;

			case PieceKind.Queen:
				this.slide1Dir(pos, Direction1Dim.X, +1, piece, r)
				this.slide1Dir(pos, Direction1Dim.X, -1, piece, r)
				this.slide1Dir(pos, Direction1Dim.Y, -1, piece, r)
				this.slide1Dir(pos, Direction1Dim.Y, +1, piece, r)
				this.slide2Dir(pos, Direction2Dim.Positive, +1, piece, r)
				this.slide2Dir(pos, Direction2Dim.Positive, -1, piece, r)
				this.slide2Dir(pos, Direction2Dim.Negative, +1, piece, r)
				this.slide2Dir(pos, Direction2Dim.Negative, -1, piece, r)
				break;

			case PieceKind.Knight:
				pushIfInBounds({ x: -1, y: +2 }, r)
				pushIfInBounds({ x: +1, y: +2 }, r)
				pushIfInBounds({ x: -1, y: -2 }, r)
				pushIfInBounds({ x: +1, y: -2 }, r)

				pushIfInBounds({ x: +2, y: -1 }, r)
				pushIfInBounds({ x: +2, y: +1 }, r)
				pushIfInBounds({ x: -2, y: -1 }, r)
				pushIfInBounds({ x: -2, y: +1 }, r)
				break;

			case PieceKind.Rook:
				this.slide1Dir(pos, Direction1Dim.X, +1, piece, r)
				this.slide1Dir(pos, Direction1Dim.X, -1, piece, r)
				this.slide1Dir(pos, Direction1Dim.Y, -1, piece, r)
				this.slide1Dir(pos, Direction1Dim.Y, +1, piece, r)
				break;

			case PieceKind.Bishop:
				this.slide2Dir(pos, Direction2Dim.Positive, +1, piece, r)
				this.slide2Dir(pos, Direction2Dim.Positive, -1, piece, r)
				this.slide2Dir(pos, Direction2Dim.Negative, +1, piece, r)
				this.slide2Dir(pos, Direction2Dim.Negative, -1, piece, r)
				break;

			case PieceKind.Pawn:
				let dir = lowColor === piece.color ? -1 : +1
				pushIfInBounds({ x: 0, y: dir }, r, false)
				if (piece.firstMove) {
					pushIfInBounds({ x: 0, y: dir * 2 }, r, false)
				}
				let left = { x: -1, y: dir }
				let leftPos = this.inBounds(pos, left, piece)
				if (leftPos !== null) {
					let p = this.get(leftPos)
					if (p !== null && p.color !== piece.color) {
						pushIfInBounds(left, r)
					}
				}
				let right = { x: +1, y: dir }
				let rightPos = this.inBounds(pos, right, piece)
				if (rightPos !== null) {
					let p = this.get(rightPos)
					console.log(p, rightPos)
					if (p !== null && p.color !== piece.color) {
						pushIfInBounds(right, r)
					}
				}

				break;
		}
		r = r.filter(newpos => !this.willKingBeInCheck(pos, newpos))
		return r
	}

	isKingInCheck(pos: Position, piece: Piece): boolean {
		// A king puts in check another king?
		// {
		// 	let r: Position[] = []
		// 	this.pushIfInBounds(pos, { x: -1, y: 0 }, piece, r)
		// 	this.pushIfInBounds(pos, { x: +1, y: 0 }, piece, r)
		// 	this.pushIfInBounds(pos, { x: 0, y: -1 }, piece, r)
		// 	this.pushIfInBounds(pos, { x: 0, y: +1 }, piece, r)
		// 	this.pushIfInBounds(pos, { x: -1, y: +1 }, piece, r)
		// 	this.pushIfInBounds(pos, { x: +1, y: +1 }, piece, r)
		// 	this.pushIfInBounds(pos, { x: -1, y: -1 }, piece, r)
		// 	this.pushIfInBounds(pos, { x: +1, y: -1 }, piece, r)

		// 	for (let p of r) {
		// 		if (this.get(p) !== null && this.get(p).kind === PieceKind.King) {
		// 			return true
		// 		}
		// 	}
		// }

		{
			let r = false
			let t = this
			this.slide1Dir(pos, Direction1Dim.X, +1, { ...piece, kind: PieceKind.Rook }, [], (p) => { if (t.get(p) !== null && (t.get(p).kind === PieceKind.Rook || t.get(p).kind === PieceKind.Queen)) r = true })
			this.slide1Dir(pos, Direction1Dim.X, -1, { ...piece, kind: PieceKind.Rook }, [], (p) => { if (t.get(p) !== null && (t.get(p).kind === PieceKind.Rook || t.get(p).kind === PieceKind.Queen)) r = true })
			this.slide1Dir(pos, Direction1Dim.Y, -1, { ...piece, kind: PieceKind.Rook }, [], (p) => { if (t.get(p) !== null && (t.get(p).kind === PieceKind.Rook || t.get(p).kind === PieceKind.Queen)) r = true })
			this.slide1Dir(pos, Direction1Dim.Y, +1, { ...piece, kind: PieceKind.Rook }, [], (p) => { if (t.get(p) !== null && (t.get(p).kind === PieceKind.Rook || t.get(p).kind === PieceKind.Queen)) r = true })
			this.slide2Dir(pos, Direction2Dim.Positive, +1, { ...piece, kind: PieceKind.Bishop }, [], (p) => { if (t.get(p) !== null && (t.get(p).kind === PieceKind.Bishop || t.get(p).kind === PieceKind.Queen)) r = true })
			this.slide2Dir(pos, Direction2Dim.Positive, -1, { ...piece, kind: PieceKind.Bishop }, [], (p) => { if (t.get(p) !== null && (t.get(p).kind === PieceKind.Bishop || t.get(p).kind === PieceKind.Queen)) r = true })
			this.slide2Dir(pos, Direction2Dim.Negative, +1, { ...piece, kind: PieceKind.Bishop }, [], (p) => { if (t.get(p) !== null && (t.get(p).kind === PieceKind.Bishop || t.get(p).kind === PieceKind.Queen)) r = true })
			this.slide2Dir(pos, Direction2Dim.Negative, -1, { ...piece, kind: PieceKind.Bishop }, [], (p) => { if (t.get(p) !== null && (t.get(p).kind === PieceKind.Bishop || t.get(p).kind === PieceKind.Queen)) r = true })
			if (r) {
				return true
			}
		}

		{
			let r: Position[] = []
			this.pushIfInBounds(pos, { x: -1, y: +2 }, { ...piece, kind: PieceKind.Knight }, r)
			this.pushIfInBounds(pos, { x: +1, y: +2 }, { ...piece, kind: PieceKind.Knight }, r)
			this.pushIfInBounds(pos, { x: -1, y: -2 }, { ...piece, kind: PieceKind.Knight }, r)
			this.pushIfInBounds(pos, { x: +1, y: -2 }, { ...piece, kind: PieceKind.Knight }, r)
			this.pushIfInBounds(pos, { x: +2, y: -1 }, { ...piece, kind: PieceKind.Knight }, r)
			this.pushIfInBounds(pos, { x: +2, y: +1 }, { ...piece, kind: PieceKind.Knight }, r)
			this.pushIfInBounds(pos, { x: -2, y: -1 }, { ...piece, kind: PieceKind.Knight }, r)
			this.pushIfInBounds(pos, { x: -2, y: +1 }, { ...piece, kind: PieceKind.Knight }, r)

			for (let p of r) {
				if (this.get(p) !== null && this.get(p).kind === PieceKind.Knight) {
					return true
				}
			}
		}

		{
			let dir = this.lowColor === piece.color ? -1 : +1
			let r: Position[] = []
			this.pushIfInBounds(pos, { x: -1, y: dir }, { ...piece, kind: PieceKind.Pawn }, r)
			this.pushIfInBounds(pos, { x: +1, y: dir }, { ...piece, kind: PieceKind.Pawn }, r)

			for (let p of r) {
				if (this.get(p) !== null && this.get(p).kind === PieceKind.Knight) {
					return true
				}
			}
		}

		return false
	}
}

function addPositions(p1: Position, p2: Position): Position {
	return { x: p1.x + p2.x, y: p1.y + p2.y }
}

function buildPiece(kind: PieceKind, color: PieceColor): Piece {
	return { kind, color, firstMove: true }
}