export enum PieceKind {
	King,
	Queen,
	Knight,
	Rook,
	Bishop,
	Pawn,
}

export enum PieceColor {
	Dark,
	Light
}

export interface Piece {
	readonly kind: PieceKind
	readonly color: PieceColor
}

export type Board = (Piece | null)[][]

export function buildPiece(kind: PieceKind, color: PieceColor): Piece {
	return { kind, color }
}

export function buildBoard(lowColor: PieceColor): Board {
	let topColor = PieceColor.Dark
	if (lowColor == PieceColor.Dark) {
		topColor = PieceColor.Light
	}
	return [
		[buildPiece(PieceKind.Rook, topColor), buildPiece(PieceKind.Knight, topColor), buildPiece(PieceKind.Bishop, topColor), buildPiece(PieceKind.Queen, topColor), buildPiece(PieceKind.King, topColor), buildPiece(PieceKind.Bishop, topColor), buildPiece(PieceKind.Knight, topColor), buildPiece(PieceKind.Rook, topColor)],
		[buildPiece(PieceKind.Pawn, topColor), buildPiece(PieceKind.Pawn, topColor), buildPiece(PieceKind.Pawn, topColor), buildPiece(PieceKind.Pawn, topColor), buildPiece(PieceKind.Pawn, topColor), buildPiece(PieceKind.Pawn, topColor), buildPiece(PieceKind.Pawn, topColor), buildPiece(PieceKind.Pawn, topColor)],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[null, null, null, null, null, null, null, null],
		[buildPiece(PieceKind.Pawn, lowColor), buildPiece(PieceKind.Pawn, lowColor), buildPiece(PieceKind.Pawn, lowColor), buildPiece(PieceKind.Pawn, lowColor), buildPiece(PieceKind.Pawn, lowColor), buildPiece(PieceKind.Pawn, lowColor), buildPiece(PieceKind.Pawn, lowColor), buildPiece(PieceKind.Pawn, lowColor)],
		[buildPiece(PieceKind.Rook, lowColor), buildPiece(PieceKind.Knight, lowColor), buildPiece(PieceKind.Bishop, lowColor), buildPiece(PieceKind.Queen, lowColor), buildPiece(PieceKind.King, lowColor), buildPiece(PieceKind.Bishop, lowColor), buildPiece(PieceKind.Knight, lowColor), buildPiece(PieceKind.Rook, lowColor)],
	]
	// return [
	// 	[buildPiece(PieceKind.Pawn, lowColor), null, null, null, null, null, null, null],
	// 	[null, null, null, null, null, null, null, null],
	// 	[null, null, null, null, null, null, null, null],
	// 	[null, null, null, null, null, null, null, null],
	// 	[null, null, null, null, null, null, null, null],
	// 	[null, null, null, null, null, null, null, null],
	// 	[null, null, null, null, null, null, null, null],
	// 	[null, null, null, null, null, null, null, null],
	// ]
}

export function getImagePath(p: Piece): string {

	let kind_letter: string;
	switch (p.kind) {
		case PieceKind.King:
			kind_letter = 'k'
			break;

		case PieceKind.Queen:
			kind_letter = 'q'
			break;

		case PieceKind.Knight:
			kind_letter = 'n'
			break;

		case PieceKind.Rook:
			kind_letter = 'r'
			break;

		case PieceKind.Bishop:
			kind_letter = 'b'
			break;

		case PieceKind.Pawn:
			kind_letter = 'p'
			break;
	}

	let color_letter = 'l'
	if (p.color == PieceColor.Dark) {
		color_letter = 'd'
	}

	return `/pieces/Chess_${kind_letter}${color_letter}t45.png`
}

