import React, {useEffect, useState} from "react";
import {Button} from "antd";
import requests from "../../requests";
import {useGameAction, useGameState} from "../../context";
import callbacks from "../../callbacks";
import Interaction from "./Interactiv/Interaction";

const colors = ['url(/1.jpg)', 'url(/2.jpg)', 'url(/3.jpg)', 'url(/4.jpg)'];

function randomColor() {
    let rand = Math.random() * 3;
    return colors[Math.round(rand)];
}


const Game = ({child}) => {
    const [slides, setSlides] = useState();
    const [interaction, setInteraction] = useState(0);
    const {nextSlide} = useGameAction();
    const {currentEpisode, token} = useGameState();

    useEffect(() => {
        if (currentEpisode)
            requests.getSlide(token, currentEpisode - 1).then(r => {
                setInteraction(0);
                if (r.data.length === 3)
                    setSlides(r.data);
                console.log(r.data)
            }).catch(e => {
                setSlides(undefined);
                callbacks.error(e.message);
            });
    }, [currentEpisode]);

    const onClick = () => {
        const id = (currentEpisode - 1) % 3;
        if (slides && slides[id] && slides[id].interaction && slides[id].showInteraction)
            setInteraction(slides[id].interaction.id);
        else
            nextSlide(currentEpisode + 1);
    };

    const reset = () => {
        nextSlide(1);
    };

    const getImage = (id) => {
        if (slides && slides[id]) {
            const img = new Image();
            img.src = slides[id].imageLink;
            return `url(${slides[id].imageLink})`;
        } else
            return 'url(/noslide.jpg)'
    };

    const getText = (id) => {
        console.log(slides[id].texts)
        if (slides && slides[id] && slides[id].texts) {
            return slides[id].texts.map(t => [t.posX, t.posY, t.text, t.isRight, t.isTop]);
        } else
            return [];
    };

    const getInter = () => {
        const id = (currentEpisode - 1) % 3;
        if (slides && slides[id] && slides[id].interaction && slides[id].showInteraction && slides[id].interaction.id === interaction)
            return <Interaction interaction={slides[id].interaction}/>;
        return <div/>
    };

    return (<div style={{marginBottom: '10vh'}}>
            {child&&child({slides, img:getImage, text:getText, onClick,reset})}
            <div style={{marginRight: 50, float: "left"}}><Button onClick={reset}>Reset</Button></div>
            {getInter()}
        </div>
    );

};

export default Game