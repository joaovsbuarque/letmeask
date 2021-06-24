import { FormEvent, useState } from 'react';
import { useHistory } from 'react-router-dom'

import illustrationImg from '../assets/images/illustration.svg'
import logoImg from '../assets/images/logo.svg';
import googleIconImg from '../assets/images/google-icon.svg';

import { Button } from '../components/Button'
import { useAuth } from '../hooks/usaAuth';
import { database } from '../services/firebase';

import '../styles/auth.scss'

export function Home() {
    const history = useHistory();
    const {singInWithGoogle, user} = useAuth();
    const [roomCode, setRoomCode] = useState('');

    async function handleCreateRoom() {
        if(!user) {
            await singInWithGoogle()
        }

        history.push('/rooms/new');
    }

    async function handleJoinRoom(event: FormEvent) {
            event.preventDefault();

        if (roomCode.trim() === '') {
            return;
        }

        const roomRef = await database.ref(`rooms/${roomCode}`).get();

        if (!roomRef.exists()) {
            alert('Room does not exists')
            return;
        }

        history.push(`/rooms/${roomCode}`)
    }

    return (
        <div id="page-auth">
            <aside>
                <img src={illustrationImg} alt="Ilustração simbolizando perguntas e respostas" /> 
                <strong>Crie salas de Q&amp; A ao-vivo</strong>
                <p> Tire as dúvidas da sua audiência em tempo-real</p>
            </aside>
            <main>
                <div className="main-content">
                        <img src={logoImg} alt="Leatmeask" />
                        <button onClick={handleCreateRoom} className="create-room">
                            <img src={googleIconImg} alt="Logo do Google" />
                            Crie uma sala com o Google
                        </button>
                    <div className="separator">Ou entre em uma sala</div>
                    <form onSubmit={handleJoinRoom}>
                        <input 
                        type="text"
                        placeholder="Digite o código da sala"
                        onChange={event => setRoomCode(event.target.value)}
                        value={roomCode}
                        />
                        <Button type="submit">
                            Entrar na sala
                        </Button>
                    </form>
                </div>
            </main>
        </div>
    )
}