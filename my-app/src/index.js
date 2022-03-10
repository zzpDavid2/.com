import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, onSnapshot } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { collection, addDoc, getDocs, setDoc, doc} from "firebase/firestore"; 
import firebase from 'firebase/compat/app';
import { query, orderBy, limit } from "firebase/firestore";  

// import admin from 'firebase-admin'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBdh_C04oeazUDTMq9rh30ltt6QcV1fr2E",
  authDomain: "keen-answer-283707.firebaseapp.com",
  projectId: "keen-answer-283707",
  storageBucket: "keen-answer-283707.appspot.com",
  messagingSenderId: "348569078084",
  appId: "1:348569078084:web:5bd1b85cd9cde90b31af11",
  measurementId: "G-YSB2SQYFHC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore();
// FieldValue = require('firebase-admin').firestore.FieldValue;

function Square(props) {
  return(
    <button className = "Square" onClick = {props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value = {this.props.squares[i]} 
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render(){
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

var gameID = null;

class Game extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(" "),
      }],
      stepNumber: 0,
      xIsNext: true,
      // createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    }
    // const querySnapshot = getDocs(collection(db, "games"));
    // const query = 

    gameID = prompt('Please enter the gameID that you want to join. Entering a new ID will create a new game.')

    try {
      const docRef = setDoc(doc(db, "games", gameID), this.state);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }

    const unsub = onSnapshot(doc(db, "games", gameID), (doc) => {
      this.setState(doc.data());
    });
  }

  handleClick(i){
    try {
      const docRef = setDoc(doc(db, "games", gameID), this.state);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }

    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if(calculateWinner(squares) || squares[i] !== " "){
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([{
        squares: squares
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });

    console.log(JSON.stringify(this.state));

    setTimeout(() => {
        try {
          const docRef = setDoc(doc(db, "games", gameID), this.state);
          console.log("Document written with ID: ", docRef.id);
        } catch (e) {
          console.error("Error adding document: ", e);
        }
      }, 100);

  }

  jumpTo(step){
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) =>{
      const desc = move ? "go to move #" + move : "start game"
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if(winner){
      status = "Winner: " + winner
    }else{
      status = 'Next player: ' + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares = {current.squares}
            onClick = {(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
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
    if (squares[a] !== " " && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function lastStep(){
  const q = query(db, orderBy("stepNumber"), limit(1));
}

