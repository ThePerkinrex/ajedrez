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
	firstMove: boolean
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

