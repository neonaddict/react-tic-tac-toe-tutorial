import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  const className = 'square' + (props.highlight ? ' highlight' : '')
  return (
    <button className={className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const winnerLine = this.props.winnerLine;
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highlight={winnerLine && winnerLine.includes(i)}
      />
    );
  }

  renderBoard(cells_count) {
    // TODO: refactor this
    const cells = [...Array(cells_count).keys()];
    const rows = [];
    let row_cells = [];
    for (const [index, _] of cells.entries()) {
      row_cells.push(this.renderSquare(index))
      if ((index + 1) % 3 === 0) {
        rows.push(<div key={index} className='board-row'>
          {row_cells}
        </div>);
        row_cells = [];
      }
    }
    return rows;
  }


  render() {
    return (
      <div>
        {this.renderBoard(9)}
      </div>
    )
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        position: {
          row: null,
          column: null,
        },
      }],
      stepNumber: 0,
      xIsNext: true,
    }
  }

  // componentWillMount() {
  //   document.body.style.background = '#0f0';
  // }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O'
    this.setState({
      history: history.concat([{
        squares: squares,
        position: {
          row: Math.floor(i / 3),
          column: Math.round(i % 3),
        },
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winnerInfo = calculateWinner(current.squares);
    const winner = winnerInfo.winner;
    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to #' + move + ', (' + step.position.row + ',' + step.position.column + ')' :
        'Back to the beginning';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });
    let status;
    if (winner) {
      status = "Winner is " + winner;
    } else {
      const nullable = (element) => element === null;
      if (current.squares.some(nullable)) {
        status = "Next player: " + (this.state.xIsNext ? "X" : "O")
        if (current.position.row !== null) { status += "\nCurrent position: " + "(" + current.position.row + "," + current.position.column + ")"; }
      } else {
        status = "There is a standoff."
      }
    }

    return (
      <div className='container'>
        <div className='game'>
          <div className='game-board'>
            <Board
              squares={current.squares}
              onClick={(i) => this.handleClick(i)}
              winnerLine={winnerInfo.line}
            />
          </div>
          <div className='game-info'>
            <div>{status}</div>
            <ol>{moves}</ol>
          </div>
        </div>
      </div>
    );
  }
}

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
        line: lines[i],
      };
    }
  }
  return {
    winner: null,
    line: null,
  };
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
