'use client';
import { useCallback, useEffect, useState } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
});

interface InitialStateValuesInterface {
	box1: string | null;
	box2: string | null;
	box3: string | null;
	box4: string | null;
	box5: string | null;
	box6: string | null;
	box7: string | null;
	box8: string | null;
	box9: string | null;
}
const initialStateValues: InitialStateValuesInterface = {
	box1: null,
	box2: null,
	box3: null,
	box4: null,
	box5: null,
	box6: null,
	box7: null,
	box8: null,
	box9: null,
};

const winningCombinations: [
	keyof InitialStateValuesInterface,
	keyof InitialStateValuesInterface,
	keyof InitialStateValuesInterface,
][] = [
	['box1', 'box2', 'box3'],
	['box4', 'box5', 'box6'],
	['box7', 'box8', 'box9'],
	['box1', 'box4', 'box7'],
	['box2', 'box5', 'box8'],
	['box3', 'box6', 'box9'],
	['box1', 'box5', 'box9'],
	['box3', 'box5', 'box7'],
];

export default function Home() {
	const [boxValues, setBoxValues] = useState<InitialStateValuesInterface>(initialStateValues);
	const [lastInput, setLastInput] = useState<string | null>(null);
	const [isGameOver, setIsGameOver] = useState(() => {
		return Object.values(boxValues)?.filter(Boolean).length === 9;
	});
	const [winner, setWinner] = useState<string | null>(null);
	const [gameLevel, setGameLevel] = useState<number>(0);

	const handlUpdateValue = useCallback(
		(boxId: keyof InitialStateValuesInterface) => {
			if (isGameOver || boxValues[boxId]) {
				return;
			}

			// If it's the first move, set the input as "X"
			if (!lastInput) {
				setLastInput('X');
				setBoxValues((prevState: InitialStateValuesInterface) => ({
					...prevState,
					[boxId]: 'X',
				}));
				return;
			}

			// Toggle between "X" and "O"
			const newInput = lastInput === 'X' ? 'O' : 'X';
			setLastInput(newInput);
			setBoxValues((prevState: InitialStateValuesInterface) => ({
				...prevState,
				[boxId]: newInput,
			}));
		},
		[isGameOver, boxValues, lastInput],
	);

	const minimax = useCallback(
		(state: InitialStateValuesInterface, depth: number, isMaximizing: boolean): number => {
			const scores: { [key: string]: number } = { X: -1, O: 1, draw: 0 };

			// Check for a terminal state
			for (const [a, b, c] of winningCombinations) {
				if (state[a] && state[a] === state[b] && state[a] === state[c]) {
					return scores[state[a]]; // Return score for the winning player
				}
			}

			const isDraw = Object.values(state).every((val: string) => val !== null);
			if (isDraw) return scores.draw;

			if (isMaximizing) {
				let bestScore = -Infinity;
				for (const boxId of Object.keys(state)) {
					if (!state[boxId as keyof InitialStateValuesInterface]) {
						const newState = { ...state, [boxId]: 'O' }; // Computer is 'O'
						const score = minimax(newState, depth + 1, false);
						bestScore = Math.max(score, bestScore);
					}
				}
				return bestScore;
			} else {
				let bestScore = Infinity;
				for (const boxId of Object.keys(state)) {
					if (!state[boxId as keyof InitialStateValuesInterface]) {
						const newState = { ...state, [boxId]: 'X' }; // Player is 'X'
						const score = minimax(newState, depth + 1, true);
						bestScore = Math.min(score, bestScore);
					}
				}
				return bestScore;
			}
		},
		[],
	);

	function handleReset() {
		setIsGameOver(false);
		setLastInput(null);
		setWinner(null);
		setBoxValues(initialStateValues);
	}

	useEffect(() => {
		// Function for computer's move
		function computerMove() {
			// Get a list of empty boxes
			const emptyBoxes = Object.keys(boxValues).filter(
				(key: string) => !boxValues[key as keyof InitialStateValuesInterface],
			) as (keyof InitialStateValuesInterface)[];

			// If there are no empty boxes or game is over, return
			if (emptyBoxes.length === 0 || isGameOver) return;

			let bestScore = -Infinity;
			let bestMove: keyof InitialStateValuesInterface | null = null;

			for (const boxId of emptyBoxes) {
				const newState = { ...boxValues, [boxId]: 'O' }; // Simulate the computer's move
				const score = minimax(newState, 0, false); // Check the score for the computer's move

				if (score > bestScore) {
					bestScore = score;
					bestMove = boxId;
				}
			}

			if (bestMove && gameLevel === 1) {
				handlUpdateValue(bestMove);
			} else {
				// Select a random box for the computer's move
				const randomBox = emptyBoxes[Math.floor(Math.random() * emptyBoxes.length)];
				handlUpdateValue(randomBox);
			}
		}

		function checkForWinner() {
			for (const [a, b, c] of winningCombinations) {
				if (boxValues[a] && boxValues[a] === boxValues[b] && boxValues[a] === boxValues[c]) {
					setWinner(
						boxValues[a] === 'X'
							? 'Congratulation! You won the Match.'
							: "Computer won the match, Let's try again",
					);
					setIsGameOver(true);
					return true;
				}
			}
			// Draw condition
			if (Object.values(boxValues).filter(Boolean).length === 9) {
				setIsGameOver(true);
				return true;
			}
			return false;
		}

		if (lastInput) {
			const gameFineshed = checkForWinner();
			if (!gameFineshed && lastInput === 'X') {
				setTimeout(() => {
					computerMove();
				}, 100);
			}
		}
	}, [lastInput, boxValues, isGameOver, handlUpdateValue, gameLevel, minimax]);

	return (
		<div
			className={`${inter.variable} font-sans flex flex-col items-center justify-center h-screen 
			 bg-teal-100`}
		>
			<p className=" text-center border xsm:w-5/6 sm:w-80 caption-top text-2xl mb-5 py-2 bg-sky-800 rounded text-white">
				Tic Tac Toe
			</p>
			<div className="bg-white flex gap-x-10 border text-1.9xl my-3 px-5 xsm:w-5/6 sm:w-80 xsm:py-3">
				<span className="bg-slate-50 xsm:text-2xl md:text-base">Level: </span>
				<select
					className="xsm:text-2xl md:text-base"
					name=""
					id=""
					defaultValue={0}
					onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
						handleReset();
						setGameLevel(Number(event.target.value));
					}}
				>
					<option value={0}>Begginer</option>
					<option value={1}>Advanced</option>
				</select>
			</div>
			<table className="bg-white border-collapse xsm:w-5/6 sm:w-80 xsm:h-80 sm:h-80 shadow-lg">
				<caption
					className={`border xsm:py-3 xsm:text-2xl md:text-base text-left caption-top text-1.9xl mb-5 pl-5 py-2 ${winner && isGameOver && lastInput === 'X' && 'bg-green-500'} ${winner && isGameOver && lastInput === 'O' && 'bg-red-100'} ${!winner && isGameOver && 'bg-yellow-100'} ${!isGameOver && 'bg-white'}`}
				>
					Status:{' '}
					{!lastInput
						? 'Not Started'
						: !isGameOver
							? 'Playing'
							: !winner
								? 'Match Draw'
								: ` ${winner}`}
				</caption>
				<tbody>
					<tr>
						<td
							className={`border border-neutral-500 border-4 cursor-pointer font-extrabold text-center 
							align-middle text-6xl border-t-0 border-l-0 w-1/3 h-1/3 ${boxValues.box1 === 'X' ? 'text-sky-600' : 'text-violet-800'}`}
							onClick={() => handlUpdateValue('box1')}
						>
							{boxValues.box1}
						</td>
						<td
							className={`border border-4 border-neutral-500 cursor-pointer font-extrabold text-center 
							align-middle text-6xl border-t-0 w-1/3 h-1/3 ${boxValues.box2 === 'X' ? 'text-sky-600' : 'text-violet-800'}`}
							onClick={() => handlUpdateValue('box2')}
						>
							{boxValues.box2}
						</td>
						<td
							className={`border border-4 border-neutral-500 cursor-pointer font-extrabold text-center
							align-middle text-6xl border-t-0 border-r-0 w-1/3 h-1/3  ${boxValues.box3 === 'X' ? 'text-sky-600' : 'text-violet-800'}`}
							onClick={() => handlUpdateValue('box3')}
						>
							{boxValues.box3}
						</td>
					</tr>
					<tr>
						<td
							className={`border border-4 border-neutral-500 cursor-pointer font-extrabold text-center
							align-middle text-6xl border-l-0 w-1/3 h-1/3 ${boxValues.box4 === 'X' ? 'text-sky-600' : 'text-violet-800'}`}
							onClick={() => handlUpdateValue('box4')}
						>
							{boxValues.box4}
						</td>
						<td
							className={`border border-4 border-neutral-500 cursor-pointer font-extrabold text-center
							align-middle text-6xl w-1/3 h-1/3 ${boxValues.box5 === 'X' ? 'text-sky-600' : 'text-violet-800'}`}
							onClick={() => handlUpdateValue('box5')}
						>
							{boxValues.box5}
						</td>
						<td
							className={`border border-4 border-neutral-500 cursor-pointer font-extrabold text-center
							align-middle text-6xl border-r-0 w-1/3 h-1/3 ${boxValues.box6 === 'X' ? 'text-sky-600' : 'text-violet-800'}`}
							onClick={() => handlUpdateValue('box6')}
						>
							{boxValues.box6}
						</td>
					</tr>
					<tr>
						<td
							className={`border border-4 border-neutral-500 font-extrabold cursor-pointer text-center
							align-middle text-6xl border-l-0 border-b-0 w-1/3 h-1/3 ${boxValues.box7 === 'X' ? 'text-sky-600' : 'text-violet-800'}`}
							onClick={() => handlUpdateValue('box7')}
						>
							{boxValues.box7}
						</td>
						<td
							className={`border border-4 border-neutral-500 font-extrabold cursor-pointer text-center
							align-middle text-6xl border-b-0 w-1/3 h-1/3 ${boxValues.box8 === 'X' ? 'text-sky-600' : 'text-violet-800'}`}
							onClick={() => handlUpdateValue('box8')}
						>
							{boxValues.box8}
						</td>
						<td
							className={`border border-4 border-neutral-500 font-extrabold cursor-pointer text-center
							align-middle text-6xl border-r-0 border-b-0 w-1/3 h-1/3 ${boxValues.box9 === 'X' ? 'text-sky-600' : 'text-violet-800'}`}
							onClick={() => handlUpdateValue('box9')}
						>
							{boxValues.box9}
						</td>
					</tr>
				</tbody>
			</table>
			<button
				className="mt-3 xsm:text-2xl md:text-base border px-5 py-2 bg-sky-900 rounded text-white"
				onClick={handleReset}
			>
				Start Again
			</button>
		</div>
	);
}
