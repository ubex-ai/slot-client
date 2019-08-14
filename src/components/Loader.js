import { h } from 'preact';
import styled, { keyframes } from 'styled-components';
import { fullSize } from './OverlayStyles';

const animationName = keyframes`
   0% { 
    transform: perspective(120px) rotateX(0deg) rotateY(0deg);
  } 50% { 
    transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg);
  } 100% { 
    transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg);
  }`;
const Spinner = styled.div`
	width: 40px;
	height: 40px;
	background-color: #333;
	margin: 100px auto;
	animation: ${animationName} 1.2s infinite ease-in-out;
`;
function Loader() {
	return <fullSize></fullSize>;
}

export default Loader;
