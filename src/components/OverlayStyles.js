import styled from 'styled-components';

export const colors = {
	brand1: '#ba2e91',
	brand2: '#8942ae',
	light: '#f4f5f8',
	dark: '#444',
	borderColor: 'rgb(215, 215, 215)',
};

export const fullSize = styled.div`
	justify-content: center;
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 100%;
`;

export const GuiContainer = styled(fullSize)`
	display: ${props => (props.show ? 'flex' : 'none')};
	width: 100%;
	height: 100%;
	background-color: #fff;
`;

export const ReasonBtn = styled.div`
	background-color: white;
	cursor: pointer;
	text-align: center;
	padding: 0.5em 0.4em;
	width: 100%;
	max-width: 9em;
	height: 2.2em;
	display: flex;
	align-items: center;
	color: ${colors.brand2}
	justify-content: center;
	border: 1px solid  #ebedf2;
	border-radius: 5px;
	&:hover {
		background-color: ${colors.light};
	}
	&:not(:last-child) {
		margin-right: 0.5em;
	}
`;

export const SpecBtnBox = styled.div`
	position: absolute;
	top: -1px;
	right: -1px;
	z-index: 30;
`;

export const OverlayClicker = styled(fullSize)`
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: transparent;
	opacity: 0.5;
	z-index: 10;
	cursor: pointer;
`;

export const OverlayContainer = styled.div`
	position: relative;
	font-family: Arial, sans-serif;
	font-size: 12px;
	z-index: 20;
`;

export const ReasonBox = styled.div`
	font-size: 12px;
	height: 100%;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	max-width: ${({ format }) => (format === 'hor' ? 'none' : '13.167em')};
	flex-wrap: ${({ format }) => (format === 'hor' ? 'no-wrap' : 'wrap')}
	flex-direction: ${({ format }) => (format === 'hor' ? 'row' : 'column')}
	${ReasonBtn}:not(:last-child) {
		margin:  ${({ format }) => (format === 'hor' ? '0 0.5em 0 0' : '0 0 0.5em 0')}
	}
`;

export const PostCloseBox = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: ${colors.brand1};
`;

export const PostCloseHeader = styled.div`
	font-weight: bold;
	font-size: 1.1em;
	margin-bottom: 0.2rem;
	color: ${colors.brand2};
`;

export const SpecBtn = styled.div`
	display: inline-block;
	line-height: 1em;
	width: 1em;
	height: 1em;
	text-align: center;
	border: 1px solid ${colors.borderColor};
	color: ${colors.brand1}
	cursor: pointer;
	background-color: rgba(255, 255, 255, 0.5);
	box-sizing: content-box;
	font-size: 14px;
	&:not(:last-child) {
		border-right-width: 0;
	}
`;

export const AdSignBox = styled(SpecBtnBox)`
	right: auto;
	left: -1px;
`;

export const AdSign = styled.div`
	color: ${colors.brand1}
	line-height: 16px;
	width: 20px;
	height: 14px;
	text-align: center;
	border: 1px solid ${colors.borderColor};
	cursor: pointer;
	background-color: rgba(255, 255, 255, 0.5);
	box-sizing: content-box;
	font-size: 12px;
	
`;
