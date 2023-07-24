import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, runTransaction, get, child, update } from "firebase/database";
import { gsap } from "gsap";

const firebaseConfig = {
	apiKey: "AIzaSyDhQTZ_q_sj4XP8yMClv3vvEFEkmCAXw68",

	authDomain: "drexfall-a27ec.firebaseapp.com",

	databaseURL: "https://drexfall-a27ec-default-rtdb.asia-southeast1.firebasedatabase.app",

	projectId: "drexfall-a27ec",

	storageBucket: "drexfall-a27ec.appspot.com",

	messagingSenderId: "665581066190",

	appId: "1:665581066190:web:892dc1d830e5db1a383d9f",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const ratingPath = "/barbenheimer/ratings";
const votingPath = "/barbenheimer/voters";
const auth = getAuth();
let barbieVote, oppenheimerVote;
let main, options;
signInAnonymously(auth)
	.then(() => {})
	.catch(error => {
		const errorCode = error.code;
		const errorMessage = error.message;
		console.log(errorMessage);
		// ...
	});
function disableVoting() {
	onValue(ref(db, ratingPath), snapshot => {
		const data = snapshot.val();
		barbieVote = Math.round((data.barbie / (data.barbie + data.oppenheimer)) * 100);
		oppenheimerVote = 100 - barbieVote;
		gsap.to(main, {
			"--barbie-vote": barbieVote + "%",
			"--oppenheimer-vote": oppenheimerVote + "%",
			duration: 1,
		});
		options[0].dataset.rating = barbieVote + "%";
		options[1].dataset.rating = oppenheimerVote + "%";
		main.classList.add("show-votes");
	});
}
function submitVote(movie, uid) {
	get(child(ref(db), votingPath))
		.then(snapshot => {
			let voters;
			if (snapshot.exists()) {
				voters = snapshot.val();
			} else {
				voters = {};
			}
			if (!Object.keys(voters).includes(uid)) {
				runTransaction(ref(db, `${ratingPath}/${movie}`), item => {
					item++;
					return item;
				});
				voters[uid] = movie;
				disableVoting(movie);
			}
			update(ref(db, votingPath), voters);
		})
		.catch(error => {
			console.error(error);
		});
}
window.addEventListener("DOMContentLoaded", () => {
	main = document.querySelector("main");
	options = document.querySelectorAll(".poll-option");

	onAuthStateChanged(auth, user => {
		if (user) {
			const uid = user.uid;
			options.forEach(item => {
				item.addEventListener("click", () => {
					let movie = item.dataset.movie;
					submitVote(movie, uid);
				});
			});
			get(child(ref(db), votingPath))
				.then(snapshot => {
					let voters;
					if (snapshot.exists()) {
						voters = snapshot.val();
					} else {
						voters = {};
					}
					console.log(voters);
					if (Object.keys(voters).includes(uid)) {
						disableVoting();
					}
				})
				.catch(error => {
					console.error(error);
				});
		} else {
			// User is signed out
			// ...
		}
	});
});
