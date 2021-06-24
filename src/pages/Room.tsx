import { FormEvent, useState } from 'react';
import { useParams } from 'react-router-dom';

import logoImg from '../assets/images/logo.svg'
import { Button } from '../components/Button'
import { RoomCode } from '../components/RoomCode'
import { useAuth } from '../hooks/usaAuth';
import { database } from '../services/firebase';

import '../styles/room.scss'
import { useEffect } from 'react';

type FirebaseQuestions = Record<string, {
    author: {
        name: string;
        avatar: string;
    }
    content: string;
    isAnswered: boolean;
    isHighlighted: boolean;
}>

type Question = {
    id: string;
    author: {
        name: string;
        avatar: string;
    }
    content: string;
    isAnswered: boolean;
    isHighlighted: boolean;

}

type RoomParams = {
    id:string;
}

export function Room() {
    const { user } = useAuth();
    const params = useParams<RoomParams>();
    const [newQuestion, setnewQuestion] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [title, setTitle] = useState('')

    const roomId = params.id

    useEffect(() => {
        const roomRef = database.ref(`rooms/${roomId}`)

        roomRef.on('value', room => {
            const databaseRooom = room.val();
            const firebaseQuestions: FirebaseQuestions = databaseRooom.questions ?? {};

            const parseQuestions = Object.entries(firebaseQuestions).map(([key, value]) => {
                return {
                    id: key,
                    content: value.content,
                    author: value.author,
                    isHighlighted: value.isHighlighted,
                    isAnswered: value.isAnswered,
                }
            })

            setTitle(databaseRooom.title);
            setQuestions(parseQuestions);
        })
    }, [roomId]);

    async function handleSendQuestion(event: FormEvent) {
        event.preventDefault();

        if (newQuestion.trim() === '') {
            return;
        }

        if(!user) {
            throw new Error('You must be logged in')
        }

        const question = {
            content: newQuestion,
            author: {
                name: user?.name,
                avatar: user.avatar,
            },
            isHighlighted: false,
            isAnswered: false,
        };

        await database.ref(`rooms/${roomId}/questions`).push(question)

        setnewQuestion('');
    } 

    return(
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="leatmeask" />
                    <RoomCode code={params.id} />
                </div>
            </header>

            <main>
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    { questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
                </div>

                <form onSubmit={handleSendQuestion}>
                    <textarea 
                    placeholder="O que você quer perguntar?"
                    onChange={event => setnewQuestion(event.target.value)}
                    value={newQuestion}
                    />

                    <div className="form-footer">
                        { user ? (
                            <div className="user-info">
                                <img src={user.avatar} alt={user.name} />
                                <div className="user-name">{user.name}</div>
                            </div>
                        ) : (
                            <div className="rodape">Para enviar a pergunta, <button>Faça seu login</button>.</div>
                        )}
                        <Button type="submit" disabled={!user}>Enviar pergunta</Button>
                    </div>
                </form>

                {JSON.stringify(questions)}
            </main>
        </div>
    )
}