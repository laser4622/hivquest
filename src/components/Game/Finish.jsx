import React, {useEffect, useState} from "react";
import {useGameAction, useGameState} from "../../context";
import {Button, Icon} from "antd";

const FinishGame = () => {

    const { points } = useGameState();
    const {logOut} = useGameAction();

    const handleLogOut = () => {
        logOut();
    };

    return (
        <div>
            <div style={{margin: '1vh 5vw', paddingLeft: '85vw'}}>
                <Button className="ant-btn" onClick={handleLogOut}>
                    <Icon style={{fontSize: '3vh'}} type="logout"/>
                </Button>
            </div>
            <div className="startPage">
                <div
                    style={{width: '40vw', height: '20vh', fontSize: 'xx-large', textAlign: 'center', color: '#ffe45a'}}
                >
                    <h1 style={{ color: '#ffe45a'}}><b>Конец игры</b></h1>
                    вы набрали <span style={{color:'red'}}>{points}</span> очков
                </div>
            </div>
        </div>
    );
};

export default FinishGame