import { useLayoutEffect, useState } from "react";
import rough from 'roughjs/bundled/rough.esm';
import Button from 'react-bootstrap/Button'

import 'bootstrap/dist/css/bootstrap.min.css';
const generator = rough.generator();

function createElement(x1,y1,x2,y2, type){

  let roughElement = null;
  if(type === "line"){roughElement= generator.line(x1,y1, x2, y2)}
  else if(type === "rectangle"){roughElement = generator.rectangle(x1,y1, x2-x1, y2-y1)}
  else{roughElement = generator.ellipse(x1,y1, x2-x1, y2-y1)}

  return{x1,y1,x2,y2, roughElement};
}

function App() {


  var [elements, setElements] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [elementType, setElementType] = useState("line");
  const [discardedElements] = useState([]);
  var [geometric] = useState(true);
  
  useLayoutEffect(() => {
    
    redraw();
    window.onbeforeunload = function() {
      return true;
    };
  })

  const handleMouseDown = (event) => {
    if(geometric){
      setDrawing(true);
    const {clientX, clientY} = event;

    const element = createElement(clientX, clientY,clientX, clientY, elementType);
    setElements(prevState => [...prevState, element]);
    }
  };
  const redraw = () => {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    context.clearRect(0,0, canvas.width, canvas.height);

    const roughCanvas = rough.canvas(canvas);

    elements.forEach(({roughElement}) => {
      roughCanvas.draw(roughElement)
    });

    if(elements.length < 1){
      document.querySelector('.undo').disabled = true;
    }
    else{
      document.querySelector('.undo').disabled = false;
    }
    if(discardedElements.length < 1){
      document.querySelector('.redo').disabled = true;
    }
    else{
      document.querySelector('.redo').disabled = false;
    }
  }
  const handleMouseMove = (event) => {
    if(!drawing){return}
    else{
      const {clientX, clientY} = event;
      const index = elements.length -1;
      const {x1, y1} = elements[index];
      const updatedElement= createElement(x1 , y1, clientX, clientY, elementType);

      const elementsCopy = [...elements];
      elementsCopy[index] = updatedElement;
      setElements(elementsCopy);
    }
  };
 
  const handleMouseUp = () => {
    setDrawing(false);
  };

  
  const undo = () => {
    //Don't pop from array if there are no more elements to pop
    if(elements.length > 0){
      discardedElements.push(elements.pop())
      setElements(elements);
      redraw();
    }
  }

  const redo = () => {
    if(discardedElements.length > 0){
      elements.push(discardedElements.pop())
      setElements(elements);
      redraw();
    }
  }

  const clear = () => {
    discardedElements.splice(0,discardedElements.length) 
    elements.splice(0,elements.length) 
    setElements(elements);
    redraw();
  }

  /*
  const save = () => {
    localStorage.setItem("elements", elements);
  }
  

  const relodLastSaved = () => {

  }
*/
  return (
    <div>
    <div style={{position:"fixed", display:"flex", left: "25%", transform : "translate(-25%, 0)", backgroundColor: "lightgray"}} className="toolbar">
    <Button style={{margin: "5px"}}
    onClick={() => setElementType("rectangle")}
    data-toggle="tooltip" title="Create rectangle"
    >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file" viewBox="0 0 16 16">
      <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4zm0 1h8a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"/>
    </svg>
    </Button>
    <Button style={{margin: "5px"}} onClick={() => setElementType("line")} data-toggle="tooltip" title="Create line">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up-right" viewBox="0 0 16 16">
      <path fillRule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0v-6z"/>
    </svg>
    </Button>
    <Button style={{margin: "5px"}} onClick={() => setElementType("circle")} data-toggle="tooltip" title="Create circle">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-circle" viewBox="0 0 16 16">
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  </svg>
    </Button>
    <Button style={{margin: "5px"}} onClick={() => undo()} data-toggle="tooltip" title="Undo" className="undo">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
      <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
      <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
    </svg>
    </Button>
    <Button style={{margin: "5px"}} onClick={() => redo()} data-toggle="tooltip" title="Redo" className="redo">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
      <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
    </svg>
    </Button>
    <Button style={{margin: "5px"}} data-toggle="tooltip" title="Pen" onClick={()=>alert("Currently in progress")} disabled>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pen-fill" viewBox="0 0 16 16">
      <path d="M13.498.795l.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001z"/>
    </svg>
    </Button>
    <Button style={{margin: "5px"}} data-toggle="tooltip" title="Clear" onClick={()=>{clear()}}>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-square-fill" viewBox="0 0 16 16">
      <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm3.354 4.646L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708z"/>
    </svg>
    </Button>
    </div>
    <canvas style={{cursor:'pointer'}}
    id="canvas" 
    width={window.innerWidth} 
    height={window.innerHeight}
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    ></canvas>
    </div>
  );
}

export default App;
