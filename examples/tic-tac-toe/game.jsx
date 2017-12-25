
import React from 'react';
import { render } from 'react-dom';
import { match } from 'match-ish';

const isWinner = (player, matrix) => {

  let p = `"${player}"`;
  
  return match(matrix)
    .with(`
       [${p}, ${p}, ${p},
          _ ,   _ ,   _ ,
          _ ,   _ ,   _ ]
          
      |[  _ ,   _ ,   _ ,
        ${p}, ${p}, ${p},
          _ ,   _ ,   _ ]

      |[  _ ,   _ ,   _ ,
          _ ,   _ ,   _ ,
        ${p}, ${p}, ${p}]

      |[${p},   _ ,   _ ,
        ${p},   _ ,   _ ,
        ${p},   _ ,   _ ]

      |[  _ , ${p},   _ ,
          _ , ${p},   _ ,
          _ , ${p},   _ ]

      |[  _ ,   _ , ${p},
          _ ,   _ , ${p},
          _ ,   _ , ${p}]

      |[${p},   _ ,   _ ,
          _ , ${p},   _ ,
          _ ,   _ , ${p}]

      |[  _ ,   _ , ${p},
          _ , ${p},   _ ,
        ${p},   _ ,   _]

      `, () => true)
    .else(() => false)
    .end();
}

const Slot = ({ onSelect, status, index }) => 
  <a className={`slot type-${status}`} href="#" onClick={(e) => onSelect(index)}>{status}</a>

const Board = ({ onSelect, matrix }) => (<div className="board">{ 
  matrix.map((value, index) => <Slot key={index} onSelect={onSelect} index={index} status={value} />)
 }
</div>);

class Game extends React.Component {

  constructor(props) {
    super(props)
    
    this.initalBoard = [
      ' ', ' ', ' ',
      ' ', ' ', ' ',
      ' ', ' ', ' '
    ];
    
    this.state = {
      turn: 'X',
      matrix: this.initalBoard,
      gameover: false,
      winner: ''
    };

    this.handleClick = this.handleClick.bind(this)
    this.reset = this.reset.bind(this)
  }

  reset() {
    this.setState({
      matrix: this.initalBoard,
      gameover: false
    })
  }


  componentDidUpdate(prevProp, prevState) {
    if(isWinner(prevState.turn, this.state.matrix)) {
      this.setState({
        gameover: true,
        winner: prevState.turn
      })
    }
  }

  handleClick(slotIndex) {
    if (this.state.matrix[slotIndex] !== ' ' || this.state.gameover) {
      return;
    }
    this.setState({
      matrix: this.state.matrix.map((slot, index) => index === slotIndex ? this.state.turn : slot),
      turn: this.state.turn === 'X' ? 'O' : 'X'
    });
  }

  render() {
    return (<div>
      <Board onSelect={this.handleClick} matrix={this.state.matrix} reset={this.reset} />
      <br/>
      <button onClick={this.reset} className="button">Reset</button>
      { this.state.gameover && <div className="winner">Player {this.state.winner} wins!</div> }
    </div>);
  }
}

render(<Game />, document.getElementById('app'));
