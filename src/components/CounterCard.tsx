import styled from 'styled-components';
import {Link} from "react-router-dom"
import React from "react";

interface countProps {
    path: string,
    tittle: string,
    number: number,
}

const CountCard:React.FC<countProps> = ({path, tittle, number}) => {
    return (<StyledWrapper>
            <Link className="path" to={path}>
                <div className="card">
                    <div className="img">
                        <div className="CounterText">{number}</div>
                    </div>
                    <div className="textBox">
                        <div className="textContent">
                        <p className="h1">{tittle}</p>
                    </div>
                    </div>
                </div>
            </Link>
        </StyledWrapper>);
}

const StyledWrapper = styled.div`
    .card {
        width: 290px;
        max-width: 290px;
        height: 70px;
        background: var(--background);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: left;
        backdrop-filter: blur(10px);
        transition: 0.5s ease-in-out;
        margin-bottom: 20px;
    }

    .card:hover {
        cursor: pointer;
    }

    .img {
        width: 50px;
        height: 50px;
        margin-left: 10px;
        border-radius: 10px;
        background: linear-gradient(var(--primary)60%, var(--background));
    }

    .textBox {
        width: calc(100% - 90px);
        margin-left: 10px;
        color: white;
        font-family: 'Poppins' sans-serif;
        
    }
    
    .CounterText {
        height: 100%;
        width: 100%;
        text-align: center;
        align-content: center;
        font-size: 1.5rem;
        font-weight: bold;
    }

    .textContent {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .path {
        color: var(--text);
        text-decoration: none;
    }

    .h1 {
        font-size: 16px;
        font-weight: bold;
        text-decoration: none;
    }`;

export default React.memo(CountCard);
