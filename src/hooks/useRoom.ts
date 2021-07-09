import { useEffect, useState } from "react";
import { database } from "../services/firebase";
import { useAuth } from "./usaAuth";

type FirebaseQuestions = Record<string, {
    author: {
        name: string;
        avatar: string;
    }
    content: string;
    isAnswered: boolean;
    isHighlighted: boolean;
    likes: Record<string, {
        authorId: string;
    }>
}>

type Questiontype = {
    id: string;
    author: {
        name: string;
        avatar: string;
    }
    content: string;
    isAnswered: boolean;
    isHighlighted: boolean;
    likeCount: number;
    likeId: string | undefined;
}

export function useRoom(roomId: string) {
    const { user } = useAuth()
    const [questions, setQuestions] = useState<Questiontype[]>([]);
    const [title, setTitle] = useState('')
    
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
                    likeCount: Object.values(value.likes ?? {}).length,
                    likeId: Object.entries(value.likes ?? {}).find(([key, like]) => like.authorId === user?.id)?.[0],
                }
            })

            setTitle(databaseRooom.title);
            setQuestions(parseQuestions);
        })

        return () => {
            roomRef.off('value')
        }
    }, [roomId, user?.id]);

    return { questions, title}
}