import './style.css';
import {start as boardStart} from './board';
import {setup as fireSetup, signin, joinGame, newGame} from './firebase';

fireSetup()
// boardStart()



document.getElementById('username-submit').onclick = ()=> {
	let username = (document.getElementById('username') as HTMLInputElement).value
	signin(username, () => {
		document.getElementById('signin').classList.add('hidden')
		document.getElementById('joingame').classList.remove('hidden')
	})
}

document.getElementById('gameid-submit').onclick = ()=> {
	let game_code = (document.getElementById('gameid') as HTMLInputElement).value.trim()
	joinGame(game_code, (o, c, low_color) => {
		// document.getElementById('signin').classList.add('hidden')
		document.getElementById('joingame').classList.add('hidden')
		document.getElementById('current-game').innerText = game_code
		boardStart(o, c, low_color)
	})
}

document.getElementById('newgame').onclick = ()=> {
	let code = newGame((o,c, low_color) => {
		document.getElementById('waiting').classList.add('hidden');
		boardStart(o,c, low_color)
	})
	document.getElementById('current-game').innerText = code;
	document.getElementById('joingame').classList.add('hidden');
	document.getElementById('waiting').classList.remove('hidden');
}