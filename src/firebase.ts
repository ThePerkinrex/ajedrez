import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import { PieceColor } from "./piece";
export function setup() {
	const firebaseConfig = {
		apiKey: "AIzaSyA6CcPjAnaBbLYSioafyNsVePSiNNkOZ_I",
		authDomain: "ajedrez-dc7d2.firebaseapp.com",
		databaseURL: "https://ajedrez-dc7d2-default-rtdb.europe-west1.firebasedatabase.app",
		projectId: "ajedrez-dc7d2",
		storageBucket: "ajedrez-dc7d2.appspot.com",
		messagingSenderId: "706522125010",
		appId: "1:706522125010:web:4fd13166bc30193d64530b",
		measurementId: "G-BCQ44FYPCE"
	};

	let app = firebase.initializeApp(firebaseConfig);
	let database = firebase.database();
}

export function signin(name: string, on_ok = ()=>{}) {
	firebase.auth().signInAnonymously().then((user) => {
		// Signed in..
		firebase.database().ref('users/' + user.user.uid).set(name);
		window.onbeforeunload = function () {
			signout()
		}
		console.log('Signed in');
		on_ok()
	}).catch((error) => {
		// var errorCode = error.code;
		// var errorMessage = error.message;
		console.error(error)
	});
}

function signout() {
	leaveCurrentGame()
	firebase.database().ref('users/' + firebase.auth().currentUser.uid).remove()
	firebase.auth().signOut()
	console.log('Signed out')
}

let current_game: null | string = null;

function leaveCurrentGame() {
	if (current_game !== null) {
		leaveGame(current_game)
	}
}

export function newGame(on_other_joined = (o: string, c: string, low_color: PieceColor)=>{}): string {
	let code = randomhex()
	current_game = code
	firebase.database().ref('joinable_games/' + code).set(firebase.auth().currentUser.uid)
	let listener = firebase.database().ref('running_games/' + code).on('value', (v) => {
		if (v.exists()) {
			console.log(v.val())
			let data = v.val()
			current_game = code
			firebase.database().ref('users/' + data.users.light).get().then((name) => {
				return new Promise((resolve, reject) => {
					if (name.exists()) {
						let v = name.val()
						// ok
						resolve(v)
					}
					reject('unknown user')
				})
			}, console.error).then((name1) => {
				return firebase.database().ref('users/' + data.users.dark).get().then((name2) => {
					return new Promise((resolve, reject) => {
						if (name2.exists()) {
							let v = name2.val()
							// ok
							resolve({name1, name2: v})
						}
						reject('unknown user')
					})
				}, console.error)
			}, console.error).then(({name1, name2}) => {
				firebase.database().ref('running_games/' + code).off('value', listener)
				on_other_joined(name2, name1, PieceColor.Light)
			})
			
		}
	})
	return code
}

export function joinGame(code: string, on_ok = (o: string, c: string, low_color: PieceColor)=>{}, on_err = (err: any) => {console.error(err)}) {
	firebase.database().ref('joinable_games/' + code).get().then((other_uid) => {
		if (other_uid.exists()) {
			let v = other_uid.val()
			// ok
			firebase.database().ref('users/' + firebase.auth().currentUser.uid).get().then((name) => {
				return new Promise((resolve, reject) => {
					if (name.exists()) {
						let v = name.val()
						// ok
						resolve(v)
					}
					reject('unknown user')
				})
			}, console.error).then((name1) => {
				return firebase.database().ref('users/' + v).get().then((name2) => {
					return new Promise((resolve, reject) => {
						if (name2.exists()) {
							let v = name2.val()
							// ok
							resolve({name1, name2: v})
						}
						reject('unknown user')
					})
				}, console.error)
			}, console.error).then(({name1, name2}) => {
				firebase.database().ref('joinable_games/' + code).remove()
				firebase.database().ref('running_games/' + code).set({
					users: {
						light: v,
						dark: firebase.auth().currentUser.uid
					},
					moves: []
				})
				current_game = code
				on_ok(name2, name1, PieceColor.Dark)
			})
			
		}else{
			on_err('unknown game')
		}
	}, console.error)
}

function randomhex(): string {
	return 'xxxxxx'.replace(/[xy]/g, function (c) {
		let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

export function leaveGame(code: string) {
	try {firebase.database().ref('joinable_games/' + code).remove().then(() => console.log('deleted joingame'), console.error)}catch (e) {console.error(e)}
	try {firebase.database().ref('running_games/' + code).remove().then(() => console.log('deleted runnninggame'), console.error)}catch (e) {console.error(e)}
	current_game = null
}

export interface Move {
	from: string,
	to: string
}

export function onMove(code: string, onMove: (m: Move) => void) {
	firebase.database().ref('running_games/' + code + '/moves').on('child_added', (data) => {
		onMove(data.val())
	});
}

export function move(code: string, m: Move) {
	firebase.database().ref('running_games/' + code + '/moves').push().set(m)
}