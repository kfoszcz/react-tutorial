import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
	return (
		<button
			className={'square ' + (props.highlight ? 'highlight' : '')}
			onClick={props.onClick}
		>
			{props.value}
		</button>
	);
}

function MoveButton(props) {
	return (
		<button onClick={props.onClick}>
			{(props.isCurrent) ? <b>{props.value}</b> : props.value}
		</button>
	);
}

function ToggleButton(props) {
	return (
		<button onClick={props.onClick} className="toggle">
			{props.value}
		</button>
	);
}

class Board extends React.Component {
	renderSquare(i) {
		return (
			<Square
				key={i}
				value={this.props.squares[i]}
				onClick={() => this.props.onClick(i)}
				highlight={(this.props.highlight.includes(i))}
			/>
		);
	}

	render() {
		const rows = [];
		for (let i = 0; i < 3; i++) {
			let cells = [];
			for (let j = 0; j < 3; j++) {
				cells.push(this.renderSquare(3 * i + j));
			}
			rows.push(<div className="board-row" key={i}>{cells}</div>);
		}
		return (
			<div>{rows}</div>
		);
	}
}

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			history: [{
				squares: Array(9).fill(null),
				lastMove: null
			}],
			xIsNext: true,
			stepNumber: 0,
			movesAscending: true
		}
	}

	handleClick(i) {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();
		if (calculateWinner(squares) || squares[i]) {
			return;
		}
		squares[i] = this.state.xIsNext ? 'X' : 'O';
		this.setState({
			history: history.concat([{
				squares: squares,
				lastMove: i
			}]),
			xIsNext: !this.state.xIsNext,
			stepNumber: this.state.stepNumber + 1
		});
	}

	jumpTo(step) {
		this.setState({
			stepNumber: step,
			xIsNext: (step % 2) === 0
		});
	}

	toggleMoveOrder() {
		this.setState({
			movesAscending: !this.state.movesAscending
		});
	}

	render() {
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const winner = calculateWinner(current.squares);

		const moves = history.map((step, move) => {
			let desc;
			if (move) {
				const coordinates = numberToRowCol(step.lastMove);
				desc = `Go to move #${move}: (${coordinates.col}, ${coordinates.row})`;
			}
			else {
				desc = 'Go to game start';
			}
			return (
				<li key={move}>
					<MoveButton
						onClick={() => this.jumpTo(move)}
						value={desc}
						isCurrent={move === this.state.stepNumber}
					/>
				</li>
			);
		});

		if (!this.state.movesAscending)
			moves.reverse();

		let status, line;
		if (winner) {
			status = 'Winner: ' + winner.winner;
			line = winner.line;
		}
		else {
			status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
			line = [];
		}

		return (
			<div className="game">
				<div className="game-board">
					<Board 
						squares={current.squares}
						highlight={line}
						onClick={i => this.handleClick(i)}
					/>
				</div>
				<div className="game-info">
					<div>{status}</div>
					<ToggleButton
						value={'Sort moves ' + (this.state.movesAscending ? 'descending' : 'ascending')}
						onClick={() => this.toggleMoveOrder()}
					/>
					<ol>{moves}</ol>
				</div>
			</div>
		);
	}
}

// ========================================

ReactDOM.render(
	<Game />,
	document.getElementById('root')
);

function calculateWinner(squares) {
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];
	for (let i = 0; i < lines.length; i++) {
		const [a, b, c] = lines[i];
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
			return {
				winner: squares[a],
				line: lines[i]
			};
		}
	}
	for (let i = 0; i < squares.length; i++) {
		if (!squares[i]) {
			return null;
		}
	}
	return {
		winner: 'draw',
		line: []
	};
}

function numberToRowCol(number) {
	return {
		row: Math.floor(number / 3) + 1,
		col: number % 3 + 1
	};
}
