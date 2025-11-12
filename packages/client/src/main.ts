import { Game } from './Game';

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    if (canvas) {
        new Game(canvas);
    }
});
