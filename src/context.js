import React, {useContext, useReducer} from "react";
import requests from "./requests";
import callbacks from "./callbacks";

const GameContext = React.createContext();

const reducer = (state, action) => {
    switch (action.type) {
        case'NEXT_SLIDE':
            return {
                ...state,
                currentEpisode: action.payload,
            };
        case'RECEIVE_ACCESS_TOKEN':
            return {
                ...state,
                ...action.payload,
                isAuthorize: true,
            };
        case'LOG_OUT':
            return {
                ...state,
                token: null,
                isAuthorize: false,
            };
        case 'GET_USER':
            return {
                ...state,
                ...action.payload,
            };
        case 'RECEIVE_ADMIN_TOKEN':
            return {
                ...state,
                admin_token: action.payload,
            };

        default:
            return state;

    }
};

export const GameContextProvider = ({children}) => {
    const [state, dispatch] = useReducer(reducer, {user: null, token: null, isAuthorize: false, admin_token: null});

    const logIn = async (value) => {
        try {
            const response = await requests.login(value);

            const {token, gender, name, currentEpisode, points} = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('gender', gender);
            localStorage.setItem('name', name);
            localStorage.setItem('currentEpisode', currentEpisode);
            localStorage.setItem('points', points);

            dispatch({
                type: 'RECEIVE_ACCESS_TOKEN',
                payload: {token, gender, name, currentEpisode: parseInt(currentEpisode + 1), points},
            })

        } catch (error) {
            callbacks.error('Данные введены не верно или аккаунт не зарегистрирован')
        }
    };

    const adminLogin = (values) => {
        requests.adminLogin(values).then(r => {

            const token = r.data.token;
            dispatch({
                type: 'RECEIVE_ADMIN_TOKEN',
                payload: token,
            });

        }).catch(e => {
            console.log(e.response)
            e.response&&callbacks.error(e.response.data.message)

        })

    }

    const registration = async (value, callback) => {
        try {
            await requests.registration(value);
            callbacks.success('Success');
            callback();
        } catch (e) {
            if (e.response.data.message)
                callbacks.error(e.response.data.message)
        }
    };

    const logOut = async () => {
        localStorage.removeItem('token');
        dispatch({
            type: 'LOG_OUT',
        })
    };

    const getUser = async (login) => {
        const response = 'todo';

        dispatch({
            type: 'GET_USER',
            payload: response.data,
        })
    };

    const nextSlide = (id) => {
        localStorage.setItem('currentEpisode', `${id}`);
        dispatch({
            type: 'NEXT_SLIDE',
            payload: id,
        })
    };

    const checkAuth = () => {

        const token = localStorage.getItem('token');
        const gender = localStorage.getItem('gender');
        const name = localStorage.getItem('name');
        const currentEpisode = localStorage.getItem('currentEpisode');
        const points = localStorage.getItem('points');

        if (token && token !== 'undefined') {
            dispatch({
                type: 'RECEIVE_ACCESS_TOKEN',
                payload: {token, gender, name, currentEpisode: parseInt(currentEpisode), points},
            });
        }
        if (token && token !== 'undefined') {
            requests.getUser(token).then(r => {
                dispatch({
                    type: 'RECEIVE_ACCESS_TOKEN',
                    payload: {points: r.data.points},
                })
            }).catch(e => {
                try {
                    console.log(e.response)
                    callbacks.error(e.response.data.response.message)
                    if(e.response.status === 401)
                        logOut()
                }
                catch (e) {
                    console.log(e.message)
                }
            });
        }
    };

    const responseInteraction = (token, value) => {
        requests.responseInteraction(token, value);
        getPoints(token);
    };

    const getPoints = (token) => {
        requests.getUser(token).then(r => {
            dispatch({
                type: 'RECEIVE_ACCESS_TOKEN',
                payload: {points: r.data.points},
            })
        });
    };

    const actions = {registration, logIn, logOut, getUser, checkAuth, nextSlide, responseInteraction, getPoints, adminLogin};

    return (
        <GameContext.Provider value={{state, actions}}>
            {children}
        </GameContext.Provider>
    )
};

export const useGameState = () => {
    return useContext(GameContext).state
};

export const useGameAction = () => {
    return useContext(GameContext).actions
};