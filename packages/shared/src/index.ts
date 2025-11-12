export type ClientMessage = {
    type: 'ping';
    payload: string;
};

export type ServerMessage = {
    type: 'pong';
    payload: string;
};
